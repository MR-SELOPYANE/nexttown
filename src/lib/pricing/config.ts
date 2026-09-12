import type { PricingRules, VehicleClass, VehicleMultipliers } from "./types";

/**
 * PRICING CONFIGURATION
 * --------------------------------------------------------------------------
 * Curated default ruleset for the platform. Operators override these through
 * the admin system; the engine never hard-codes a fare element in the
 * frontend. Every default is deliberate and documented.
 *
 * ZONES (South Africa hotspot coverage):
 *  - airport     : OR Tambo, Cape Town Intl, King Shaka — premium access + tolls
 *  - cbd          : dense central business districts
 *  - campus       : university campuses / student hubs
 *  - mall         : major shopping centres
 *  - high_demand  : nightlife / stadium / event corridors
 *  - neutral      : everywhere else (multiplier 1)
 */

export const DEFAULT_ZONES = [
  { id: "neutral", label: "Standard", multiplier: 1, hotspots: [] },
  { id: "airport", label: "Airport", multiplier: 1.25 },
  { id: "cbd", label: "Central business district", multiplier: 1.1 },
  { id: "campus", label: "Campus", multiplier: 1.05 },
  { id: "mall", label: "Mall", multiplier: 1.05 },
  { id: "high_demand", label: "High-demand zone", multiplier: 1.3 },
];

export const DEFAULT_VEHICLE: Record<VehicleClass, number> = {
  hatch: 1,
  sedan: 1,
  suv: 1.15,
  minivan: 1.25,
  minibus: 1.4,
};

export const DEFAULT_TIERS = [
  {
    id: "go",
    label: "NT Go",
    baseFare: 22,
    ratePerKm: 8.5,
    ratePerMin: 0.9,
    seats: 4,
    serviceFeeRate: 0.12,
  },
  {
    id: "comfort",
    label: "NT Comfort",
    baseFare: 30,
    ratePerKm: 11.5,
    ratePerMin: 1.2,
    seats: 4,
    serviceFeeRate: 0.12,
  },
  {
    id: "xl",
    label: "NT XL",
    baseFare: 38,
    ratePerKm: 14,
    ratePerMin: 1.5,
    seats: 6,
    serviceFeeRate: 0.12,
  },
];

/** Late-night (+ peak) local-time windows. */
export const DEFAULT_TIME_WINDOWS = [
  {
    id: "late_night",
    label: "Late night",
    fromHour: 22,
    toHour: 5,
    multiplier: 1.2,
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: "morning_peak",
    label: "Morning peak",
    fromHour: 6,
    toHour: 9,
    multiplier: 1.1,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "evening_peak",
    label: "Evening peak",
    fromHour: 16,
    toHour: 19,
    multiplier: 1.12,
    days: [1, 2, 3, 4, 5],
  },
];

export const DEFAULT_EVENTS: PricingRules["events"] = [];

export const DEFAULT_PRICING_RULES: PricingRules = {
  version: 1,
  currency: "ZAR",
  quoteTtlMs: 5 * 60_000,
  defaultVehicleMultiplier: 1,
  supplyFactor: 0.5,
  vehicle: DEFAULT_VEHICLE,
  tiers: DEFAULT_TIERS,
  zones: DEFAULT_ZONES,
  timeWindows: DEFAULT_TIME_WINDOWS,
  events: DEFAULT_EVENTS,
  demandCurve: { min: 1, max: 2.2 },
  applySupply: true,
};

export type PricingRulesOverrides = Partial<Omit<PricingRules, "vehicle">> & {
  vehicle?: Partial<VehicleMultipliers>;
};

/**
 * Merge an operator ruleset over the defaults and validate it.
 * Throws on nonsensical values so misconfiguration surfaces early.
 */
export function resolvePricingRules(overrides?: PricingRulesOverrides): PricingRules {
  const merged: PricingRules = {
    ...DEFAULT_PRICING_RULES,
    ...overrides,
    vehicle: { ...DEFAULT_PRICING_RULES.vehicle, ...(overrides?.vehicle ?? {}) },
    tiers: overrides?.tiers ?? DEFAULT_PRICING_RULES.tiers,
    zones: overrides?.zones ?? DEFAULT_PRICING_RULES.zones,
    timeWindows: overrides?.timeWindows ?? DEFAULT_PRICING_RULES.timeWindows,
    events: overrides?.events ?? DEFAULT_PRICING_RULES.events,
    demandCurve: {
      ...DEFAULT_PRICING_RULES.demandCurve,
      ...(overrides?.demandCurve ?? {}),
    },
  };
  assertPricingRules(merged);
  return merged;
}

const VEHICLE_CLASSES: VehicleClass[] = ["hatch", "sedan", "suv", "minivan", "minibus"];

export function assertPricingRules(rules: PricingRules): void {
  if (!Number.isFinite(rules.quoteTtlMs) || rules.quoteTtlMs <= 0) {
    throw new Error("pricing: quoteTtlMs must be a positive number of ms");
  }
  if (rules.tiers.length === 0) {
    throw new Error("pricing: at least one fare tier is required");
  }
  for (const t of rules.tiers) {
    if (t.baseFare < 0 || t.ratePerKm < 0 || t.ratePerMin < 0) {
      throw new Error(`pricing: tier "${t.id}" must have non-negative rates`);
    }
    if (!Number.isFinite(t.serviceFeeRate) || t.serviceFeeRate < 0 || t.serviceFeeRate > 1) {
      throw new Error(`pricing: tier "${t.id}" serviceFeeRate must be 0..1`);
    }
  }
  for (const v of VEHICLE_CLASSES) {
    const m = rules.vehicle[v];
    if (m != null && (!Number.isFinite(m) || m < 1)) {
      throw new Error(`pricing: vehicle "${v}" multiplier must be >= 1`);
    }
  }
  if (rules.demandCurve.min < 1 || rules.demandCurve.max < rules.demandCurve.min) {
    throw new Error("pricing: demandCurve must satisfy 1 <= min <= max");
  }
}
