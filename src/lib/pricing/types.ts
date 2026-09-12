/**
 * DYNAMIC PRICING ENGINE — SHARED TYPES
 * --------------------------------------------------------------------------
 * Pure, framework-agnostic vocabulary for the whole pricing domain. Nothing
 * here touches React, Supabase, routing or the DOM, so the engine is fully
 * unit-testable in plain node (mirrors the matching engine's convention).
 *
 * The engine is deliberately configurable: every number that drives a fare
 * lives in `PricingRules`, which operators edit through the admin system
 * rather than the frontend hard-coding it. A fare is always explainable —
 * every calculation returns a `FareBreakdown`.
 */

/** A geographic price zone (label keyed, so it works offline). */
export type PricingZone = {
  id: string;
  label: string;
  /** Multiplier applied when a trip touches this zone (1 = neutral). */
  multiplier: number;
  /** Named landmarks / POIs the zone covers, e.g. "OR Tambo", "Wits". */
  hotspots?: string[];
};

/** Vehicle classes served by the platform (ordered roughly by size/premium). */
export type VehicleClass = "hatch" | "sedan" | "suv" | "minivan" | "minibus";

/** Multiplier for every supported vehicle class (>= 1 each). */
export type VehicleMultipliers = Record<VehicleClass, number>;

/** Product tiers a passenger can pick (maps to the ride types in the UI). */
export type FareTier = {
  id: string;
  label: string;
  /** Flat component charged once per trip. */
  baseFare: number;
  /** Per-kilometre rate (ZAR). */
  ratePerKm: number;
  /** Per-minute rate (ZAR) for the in-vehicle time component. */
  ratePerMin: number;
  /** Seat capacity of this tier (affects vehicle multiplier selection). */
  seats: number;
  /** Platform comission / service fee as a fraction of the surged fare. */
  serviceFeeRate: number;
};

/** Time-of-day rule: a multiplier over a local-time window. */
export type TimeWindowRule = {
  id: string;
  label: string;
  /** Local hour window, e.g. { from: 21, to: 5 } for late night (wraps). */
  fromHour: number;
  toHour: number;
  multiplier: number;
  /** Days of the week this applies (0 = Sunday..6 = Saturday). */
  days: number[];
};

/** A named peak/event window, e.g. "New Year's Eve" or "Airport rush". */
export type EventRule = {
  id: string;
  label: string;
  /** Epoch-ms window (inclusive start, exclusive end). */
  startsAt: number;
  endsAt: number;
  multiplier: number;
};

/** Full, operator-configurable ruleset. */
export type PricingRules = {
  /** Bump whenever rules change so old quotes become invalid. */
  version: number;
  /** Currency for presentation. */
  currency: "ZAR";
  /** How long a quote stays valid (ms). */
  quoteTtlMs: number;
  /** Default vehicle multiplier (tier with no explicit multiplier). */
  defaultVehicleMultiplier: number;
  /** Base assumption for driver supply / demand blending (0..1). */
  supplyFactor: number;
  /** Per-vehicle-class multipliers. */
  vehicle: VehicleMultipliers;
  /** Per-tier fare components. */
  tiers: FareTier[];
  /** Geographic zones. */
  zones: PricingZone[];
  /** Time-of-day rules (resolved against local time). */
  timeWindows: TimeWindowRule[];
  /** Named event windows. */
  events: EventRule[];
  /** Demand-curve: how aggressively the index (0..1) scales the fare. */
  demandCurve: { min: number; max: number };
  /** Whether to blend driver-supply into the demand multiplier. */
  applySupply: boolean;
};

/** Inputs required to price a trip. */
export type PriceTripInput = {
  tierId: string;
  vehicleClass?: VehicleClass;
  distanceKm: number;
  durationMin: number;
  /** Market demand index 0..1 at request time (from dispatch/metrics). */
  demandIndex?: number;
  /** 0..1 driver supply (1 = abundant). Used to lift price when supply is low. */
  driverSupply?: number;
  /** Zone id(s) the trip touches (pickup/dropoff/landmarks). */
  zoneIds?: string[];
  /** Local time the trip happens (ms). Used for time-of-day windows. */
  at?: number;
  /** Injected clock so tests are deterministic. */
  now?: number;
};

/** The explainable per-component breakdown of one fare calculation. */
export type FareBreakdown = {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  serviceFee: number;
  demandMultiplier: number;
  timeOfDayMultiplier: number;
  zoneMultiplier: number;
  vehicleMultiplier: number;
  total: number;
};

/** A signed, expiring quote the server hands the client. */
export type FareQuote = {
  tripInput: PriceTripInput;
  breakdown: FareBreakdown;
  /** Rule version this quote was priced against. */
  rulesVersion: number;
  /** Epoch-ms when the quote stops being valid. */
  expiresAt: number;
  /** Verifier over the quote contents (see engine.ts). */
  token: string;
};

/** Outcome of the server-side re-pricing check when a booking is created. */
export type PriceAuthorization = {
  ok: boolean;
  code: "authorized" | "expired" | "tampered" | "rejected" | "unavailable";
  message: string;
  /** Server-computed authoritative price (used when `ok`). */
  price: number;
  quote: FareQuote;
  /** Where pricing came from when the server is unavailable. */
  degraded: boolean;
};

/** Summary computed from the ruleset for admin display/preview. */
export type PricingPreview = {
  rules: PricingRules;
  /** Example quote for a reference 10 km / 20 min trip at neutral demand. */
  sample: FareQuote;
};
