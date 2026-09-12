import {
  clampTimeHour,
  computeDemandMultiplier,
  computeTimeOfDayMultiplier,
  computeVehicleMultiplier,
  computeZoneMultiplier,
} from "./multipliers";
import { resolvePricingRules } from "./config";
import type { FareBreakdown, FareQuote, PriceTripInput, PricingRules } from "./types";

/**
 * FARE ENGINE
 * --------------------------------------------------------------------------
 * The single source of truth for how a fare is calculated. Pure and
 * deterministic so the server and any offline fallback derive identical
 * numbers from the same `PricingRules`.
 *
 * Formula (all in ZAR):
 *
 *   baseFare      = tier.baseFare                      (flat, once per trip)
 *   distanceFare  = distanceKm * tier.ratePerKm
 *   timeFare      = durationMin * tier.ratePerMin
 *   subtotal      = baseFare + distanceFare + timeFare
 *
 *   demandMultiplier  = f(demandIndex, driverSupply)   consider demand & supply
 *   timeOfDayMultiplier = f(local hour, windows/events)
 *   zoneMultiplier     = product of matching zone multipliers (>= 1)
 *   vehicleMultiplier  = tier/vehicle class multiplier (>= 1)
 *
 *   effectiveMultiplier = demand * zone * vehicle * timeOfDay
 *   surgedSubtotal   = round(subtotal * effectiveMultiplier)
 *   serviceFee       = round(surgedSubtotal * tier.serviceFeeRate)
 *   total            = surgedSubtotal + serviceFee
 *
 * Every quote carries an `expiresAt` and a `token` so the backend can prove
 * the displayed price is the one that will be charged and that it hasn't
 * been tampered with (see `authorizeQuote`).
 */

export const OUTPUT_VERSION = 1;

/** Deterministic 32-bit FNV-1a hash → hex string for quote tokens. */
function fnv(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Compute the breakdown for a trip. Returns zeros for absent multipliers and
 * keeps the result explainable — every component maps directly to a rule.
 */
export function calculateBreakdown(
  input: PriceTripInput,
  rules: PricingRules,
  now: number,
): FareBreakdown {
  const tier = rules.tiers.find((t) => t.id === input.tierId) ?? rules.tiers[0];

  const baseFare = Math.round(tier.baseFare);
  const distanceFare = Math.round(input.distanceKm * tier.ratePerKm * 100) / 100;
  const timeFare = Math.round(input.durationMin * tier.ratePerMin * 100) / 100;
  const subtotal = baseFare + distanceFare + timeFare;

  const demandMultiplier = computeDemandMultiplier(input, rules);
  const timeOfDayMultiplier = computeTimeOfDayMultiplier(input, rules, now);
  const zoneMultiplier = computeZoneMultiplier(input, rules);
  const vehicleMultiplier = computeVehicleMultiplier(input, rules);

  const effectiveMultiplier =
    demandMultiplier * zoneMultiplier * vehicleMultiplier * timeOfDayMultiplier;

  const surgedSubtotal = Math.round(subtotal * effectiveMultiplier);
  const serviceFee = Math.round(surgedSubtotal * tier.serviceFeeRate);
  const total = surgedSubtotal + serviceFee;

  const breakdown: FareBreakdown = {
    baseFare,
    distanceFare,
    timeFare,
    serviceFee,
    demandMultiplier: round3(demandMultiplier),
    timeOfDayMultiplier: round3(timeOfDayMultiplier),
    zoneMultiplier: round3(zoneMultiplier),
    vehicleMultiplier: round3(vehicleMultiplier),
    total,
  };
  return breakdown;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Serialise the parts of a quote that must be protected from tampering. */
function tokenPayload(quote: {
  tripInput: PriceTripInput;
  breakdown: FareBreakdown;
  rulesVersion: number;
  expiresAt: number;
}): string {
  const b = quote.breakdown;
  return [
    quote.rulesVersion,
    quote.expiresAt,
    quote.tripInput.tierId,
    round2(quote.tripInput.distanceKm),
    round2(quote.tripInput.durationMin),
    b.baseFare,
    b.distanceFare,
    b.timeFare,
    b.serviceFee,
    b.demandMultiplier,
    b.zoneMultiplier,
    b.vehicleMultiplier,
    b.total,
  ].join("|");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Price a trip and return a signed, expiring quote.
 * `rules` may be resolved/validated here or passed pre-resolved.
 */
export function calculateFare(
  input: PriceTripInput,
  rules?: PricingRules,
  now: number = Date.now(),
): FareQuote {
  const resolved = rules ? rules : resolvePricingRules();
  const breakdown = calculateBreakdown(input, resolved, now);
  const expiresAt = now + resolved.quoteTtlMs;
  const quote: FareQuote = {
    tripInput: input,
    breakdown,
    rulesVersion: resolved.version,
    expiresAt,
    token: "",
  };
  quote.token = signQuote(quote);
  return quote;
}

export function signQuote(quote: FareQuote): string {
  return fnv(`${tokenPayload(quote)}:${OUTPUT_VERSION}`);
}

/**
 * Verify a quote produced by this engine: checks the token (tamper-proofing)
 * and the expiry window. Also recomputes the fare from the ruleset to ensure
 * the quoted total still matches current rules — this is how the backend
 * re-prices and rejects silently-changed prices.
 */
export function verifyQuote(quote: FareQuote, rules: PricingRules, now = Date.now()): boolean {
  if (!quote || typeof quote !== "object") return false;
  const expected = signQuote(quote);
  if (expected !== quote.token) return false;
  if (quote.rulesVersion !== rules.version) return false;
  if (now > quote.expiresAt) return false;
  // Re-derive and compare totals so rule changes invalidate old quotes even
  // if the token accidentally matched.
  const fresh = calculateBreakdown(quote.tripInput, rules, quote.expiresAt);
  return fresh.total === quote.breakdown.total;
}

/** Human-readable explanation of a quote's components for the UI. */
export function explainQuote(quote: FareQuote): string[] {
  const b = quote.breakdown;
  return [
    `Base fare: R${b.baseFare}`,
    `Distance: R${b.distanceFare}`,
    `Time: R${b.timeFare}`,
    `Demand ×${b.demandMultiplier}`,
    `Time of day ×${b.timeOfDayMultiplier}`,
    `Zone ×${b.zoneMultiplier}`,
    `Vehicle ×${b.vehicleMultiplier}`,
    `Service fee: R${b.serviceFee}`,
  ];
}

export { clampTimeHour };
