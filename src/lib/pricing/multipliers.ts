import type { PriceTripInput, PricingRules } from "./types";

/**
 * MULTIPLIER RESOLVERS
 * --------------------------------------------------------------------------
 * Small, pure functions that turn rule inputs into a single multiplier each.
 * Kept separate from the engine so each factor is independently testable and
 * the fare computation stays readable.
 */

export function clamp01(v: number | undefined | null, fallback = 0): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.min(1, Math.max(0, v));
}

/**
 * Demand multiplier blends market demand and (optionally) driver supply:
 *  - base = demandCurve.min (neutral, demand ~0)
 *  - demand lifts toward demandCurve.max as demandIndex → 1
 *  - when `applySupply`, low driver supply pushes the multiplier higher.
 *    Supply blends in at supplyFactor strength, capped so the multiplier
 *    never falls below demandCurve.min.
 */
export function computeDemandMultiplier(input: PriceTripInput, rules: PricingRules): number {
  const demand = clamp01(input.demandIndex, 0);
  const { min, max } = rules.demandCurve;
  const fromDemand = min + (max - min) * demand;

  if (!rules.applySupply) return fromDemand;

  const supply = clamp01(input.driverSupply, 0.5);
  // supply 1 → no effect; supply 0 → multiply by (1 + supplyFactor)
  const supplyLift = 1 + rules.supplyFactor * (1 - supply);
  return Math.max(min, fromDemand * supplyLift);
}

/**
 * Time-of-day multiplier: matches the trip's local hour against configured
 * windows (rate-limited to one applicable rule, highest wins). If `at` is not
 * provided the multiplier is neutral (1). Events (explicit date windows) take
 * precedence over recurring windows.
 */
export function computeTimeOfDayMultiplier(
  input: PriceTripInput,
  rules: PricingRules,
  now: number,
): number {
  if (!input.at) {
    // Fall back to the injected clock for deterministic tests / server calls.
    input = { ...input, at: now };
  }
  const at = input.at ?? now;

  // Named events override recurring windows.
  const eventRule = rules.events.find((e) => at >= e.startsAt && at < e.endsAt);
  if (eventRule) return eventRule.multiplier;

  const date = new Date(at);
  const hour = date.getHours();
  const day = date.getDay();

  let best = 1;
  for (const w of rules.timeWindows) {
    if (!w.days.includes(day)) continue;
    if (w.fromHour <= w.toHour) {
      if (hour >= w.fromHour && hour < w.toHour) best = Math.max(best, w.multiplier);
    } else {
      // Window wraps midnight, e.g. 22 -> 5.
      if (hour >= w.fromHour || hour < w.toHour) best = Math.max(best, w.multiplier);
    }
  }
  return best;
}

/**
 * Zone multiplier: product of every configured zone the trip touches.
 * Multipliers are >= 1, so the effective zone multiplier is >= 1. Unknown zone
 * ids map to neutral (1).
 */
export function computeZoneMultiplier(input: PriceTripInput, rules: PricingRules): number {
  const ids = input.zoneIds ?? [];
  if (ids.length === 0) return 1;
  let product = 1;
  for (const zId of ids) {
    const zone = rules.zones.find((z) => z.id === zId);
    if (zone) product *= zone.multiplier;
  }
  return Math.max(1, product);
}

/**
 * Vehicle multiplier: from the vehicle class multiplier, falling back to the
 * tier's seat requirements when no explicit class is supplied.
 */
export function computeVehicleMultiplier(input: PriceTripInput, rules: PricingRules): number {
  if (input.vehicleClass) {
    return rules.vehicle[input.vehicleClass] ?? rules.defaultVehicleMultiplier;
  }
  const tier = rules.tiers.find((t) => t.id === input.tierId);
  if (!tier) return rules.defaultVehicleMultiplier;
  if (tier.seats <= 4) return rules.vehicle.hatch ?? rules.defaultVehicleMultiplier;
  if (tier.seats <= 6) return rules.vehicle.suv ?? rules.defaultVehicleMultiplier;
  return rules.vehicle.minibus ?? rules.defaultVehicleMultiplier;
}

/** Normalise an hour into 0..23 (used for windows and tests). */
export function clampTimeHour(hour: number): number {
  return ((Math.round(hour) % 24) + 24) % 24;
}
