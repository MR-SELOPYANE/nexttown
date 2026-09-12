/**
 * DRIVER MATCHING & DISPATCH ENGINE — SHARED TYPES
 * --------------------------------------------------------------------------
 * Pure, framework-agnostic vocabulary for the whole engine. Nothing in this
 * module touches React, Supabase, routing or the DOM, so the whole engine is
 * unit-testable in plain node.
 *
 * The engine deliberately keeps its own tiny `LatLng` (instead of importing
 * the ride domain) so tests never accidentally pull client-only modules.
 */

export type LatLng = { lat: number; lng: number };

/** App-level driver operational status (mirrors the ride domain values). */
export type DriverStatus = "offline" | "available" | "enroute" | "arrived" | "ontrip" | "completed";

/**
 * SA vehicle classes, ordered by size. A higher tier can serve a lower-tier
 * request (an SUV can fulfil a "sedan" booking); the reverse is rejected by
 * eligibility and scored lower by `vehicle`.
 */
export type VehicleClass = "hatch" | "sedan" | "suv" | "minivan" | "minibus";

/** Static driver quality/work capability data (from a profiles source). */
export type DriverProfile = {
  /** 0–5 (average passenger rating). */
  rating: number;
  /** 0–1 fraction of offers accepted. */
  acceptanceRate: number;
  /** 0–1 fraction of accepted offers later cancelled. */
  cancellationRate: number;
  vehicleClass: VehicleClass;
  seats: number;
  /** Preferred operating zone label (matched against the pickup zone). */
  preferredZone?: string | null;
  /** Ride-type labels this driver is willing to serve (e.g. "airport"). */
  rideTypes?: string[];
  /** Feature tags the driver's vehicle supports (e.g. "wheelchair"). */
  capabilities?: string[];
};

/** One driver in the candidate pool, with a fresh location fix. */
export type DriverCandidate = {
  driverId: string;
  lat: number;
  lng: number;
  /** Compass heading in degrees (0–360 clockwise from north). */
  heading: number;
  speedKmh: number;
  status: DriverStatus;
  /** Epoch ms of the latest reported fix. Staleness is judged from this. */
  updatedAt: number;
  /** Workload — number of dispatches the driver is already active on. */
  activeDispatches: number;
  /** Fairness — number of recent offers the driver already received. */
  recentOffers: number;
  profile: DriverProfile;
};

/** What a passenger actually needs for a ride. */
export type MatchingRequest = {
  bookingId: string;
  pickup: LatLng;
  dropoff: LatLng;
  pickupLabel: string;
  dropoffLabel: string;
  /** Zone label of the pickup, used for zone-preference matching. */
  pickupZone?: string | null;
  /** Ride-type label, e.g. "airport", "commuter", "express", "school". */
  rideType: string;
  vehicleClass: VehicleClass;
  requiredSeats: number;
  /** Passenger requirements, e.g. ["wheelchair", "child_seat"]. */
  requiredCapabilities?: string[];
  /** 0..1 market demand at dispatch time; 1 = peak surge. */
  demandIndex?: number;
  /** Injected clock (epoch ms) so tests are deterministic. */
  now?: number;
};

/** The 16 scoring factors. Each normalises to 0..1 where 1 is better. */
export const FACTOR_NAMES = [
  "eta",
  "distance",
  "availability",
  "status",
  "vehicle",
  "rating",
  "acceptanceRate",
  "cancellationRate",
  "freshness",
  "heading",
  "pickupZone",
  "rideType",
  "requirements",
  "demand",
  "workload",
  "fairness",
] as const;

export type Factor = (typeof FACTOR_NAMES)[number];

export type FactorScores = Record<Factor, number>;

/** Per-factor weights. `Partial` — missing factors fall back to defaults. */
export type WeightSet = Partial<Record<Factor, number>>;

export type MatchingConfig = {
  /** A fix older than this is "stale" -> ineligible. */
  staleLocationMs: number;
  /** Straight-line distance beyond this from pickup -> ineligible. */
  maxServiceRadiusKm: number;
  /** Estimated pickup ETA beyond this -> ineligible. */
  maxEtaMinutes: number;
  /** ETA heuristic = straight-line * roadFactor (no road data fallback). */
  roadFactor: number;
  /** City-average speed used to turn ETA distance into minutes. */
  averageCitySpeedKmh: number;
  /** Candidate limit — how many drivers the selection returns. */
  candidateLimit: number;
  weights?: WeightSet;
};

export type EligibilityVerdict = { eligible: boolean; reasons: string[] };

export type ScoredCandidate = {
  candidate: DriverCandidate;
  /** Straight-line distance pickup->driver in km. */
  distanceKm: number;
  /** Estimated minutes for the driver to reach the pickup. */
  etaMin: number;
  factorScores: FactorScores;
  /** Weighted total in 0..1 (higher is better). */
  score: number;
};

export type RejectedCandidate = { candidate: DriverCandidate; reasons: string[] };

export type MatchingResult = {
  /** Every eligible driver, scored and ranked best-first. */
  all: ScoredCandidate[];
  /** The top `candidateLimit` drivers, ranked best-first. */
  selected: ScoredCandidate[];
  /** Candidates that failed eligibility, with human-readable reasons. */
  rejected: RejectedCandidate[];
  /** The single best pick (first of `selected`), or null. */
  best: ScoredCandidate | null;
};

/* ─── Dispatch lifecycle ──────────────────────────────────────────────────── */

export type DispatchState =
  | "searching"
  | "offered"
  | "accepted"
  | "driver_assigned"
  | "completed"
  | "cancelled"
  | "no_driver_available";

export type DispatchEvent =
  | { type: "CANDIDATES_EMPTY" }
  | { type: "OFFER_CREATED" }
  | { type: "DRIVER_ACCEPTED" }
  | { type: "DRIVER_ASSIGNED" }
  | { type: "DRIVER_REJECTED" }
  | { type: "OFFER_TIMEOUT" }
  | { type: "CANCELLED" }
  | { type: "COMPLETED" };

export const DISPATCH_STATES: DispatchState[] = [
  "searching",
  "offered",
  "accepted",
  "driver_assigned",
  "completed",
  "cancelled",
  "no_driver_available",
];
