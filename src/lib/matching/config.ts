import type { Factor, FactorScores, MatchingConfig, WeightSet } from "./types";
import { FACTOR_NAMES } from "./types";

/**
 * MATCHING CONFIGURATION
 * --------------------------------------------------------------------------
 * Default operational thresholds and the relative weight set for the 16
 * scoring factors. Every default is deliberate and documented below; operators
 * override them through `resolveConfig({...}, now)`.
 *
 * WEIGHTS
 * Weights are RELATIVE, not absolute: the engine normalises them to sum to
 * 1.0 for every candidate, so the defaults and any override always produce a
 * score in 0..1. Rationale per factor:
 *
 *   eta              0.19  passenger wait time dominates satisfaction
 *   distance         0.11  short hops are cheaper to dead-head
 *   vehicle          0.11  right-sized vehicle for the booking
 *   rating           0.11  service quality track record
 *   cancellation     0.08  cancelled offers are the costliest failure
 *   acceptance       0.07  responsiveness to offers
 *   freshness        0.07  stale fixes add ETA uncertainty
 *   pickupZone       0.05  driver familiarity with the pickup area
 *   availability     0.04  "in-pool right now" readiness
 *   requirements     0.04  vehicle fits passenger needs (wheelchair etc.)
 *   heading          0.03  already pointed at the pickup
 *   rideType         0.03  driver accepts this ride type
 *   status           0.03  fine-grained tie-break among viable drivers
 *   workload         0.02  don't pile onto already-busy drivers
 *   fairness         0.01  spread offers across the pool
 *   demand           0.01  request-wide surge index (see `demand` below)
 *
 * DEMAND
 * `demand` is the one non-driver factor: it carries the request-wide
 * `demandIndex` (same value for every candidate) and therefore cancels out of
 * ranking on its own. Its real effect lives in `effectiveWeights`: as demand
 * rises the engine shifts a portion of the proximity weights (eta, distance)
 * onto reliability weights (rating, acceptanceRate, cancellationRate) so that
 * at peak times the best-rated, most-reliable drivers win instead of just the
 * closest ones.
 */

/** Straight-line distance beyond which a driver is out of service area. */
export const DEFAULT_MAX_SERVICE_RADIUS_KM = 50;

/** A position fix older than this is considered stale (GPS dropped). */
export const DEFAULT_STALE_LOCATION_MS = 5 * 60_000;

/** Drivers estimated to take longer than this to reach the pickup are ruled out. */
export const DEFAULT_MAX_ETA_MINUTES = 30;

/** ETA heuristic: straight-line distance (km) scaled up by this road factor. */
export const DEFAULT_ROAD_FACTOR = 1.35;

/** Fallback city-average speed used when a driver's own speed is unknown. */
export const DEFAULT_CITY_SPEED_KMH = 36;

/** How many ranked drivers a match returns to dispatch against. */
export const DEFAULT_CANDIDATE_LIMIT = 5;

/** Baseline relative weights — see header for rationale. */
export const DEFAULT_WEIGHTS: Required<WeightSet> = {
  eta: 0.19,
  distance: 0.11,
  vehicle: 0.11,
  rating: 0.11,
  cancellationRate: 0.08,
  acceptanceRate: 0.07,
  freshness: 0.07,
  pickupZone: 0.05,
  availability: 0.04,
  requirements: 0.04,
  heading: 0.03,
  rideType: 0.03,
  status: 0.03,
  workload: 0.02,
  fairness: 0.01,
  demand: 0.01,
};

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  staleLocationMs: DEFAULT_STALE_LOCATION_MS,
  maxServiceRadiusKm: DEFAULT_MAX_SERVICE_RADIUS_KM,
  maxEtaMinutes: DEFAULT_MAX_ETA_MINUTES,
  roadFactor: DEFAULT_ROAD_FACTOR,
  averageCitySpeedKmh: DEFAULT_CITY_SPEED_KMH,
  candidateLimit: DEFAULT_CANDIDATE_LIMIT,
  weights: DEFAULT_WEIGHTS,
};

/**
 * Merge an operator config over the defaults and validate the result.
 * Returns the merged config, or throws when a threshold is nonsensical.
 */
export function resolveConfig(overrides?: Partial<MatchingConfig>): MatchingConfig {
  const config: MatchingConfig = { ...DEFAULT_MATCHING_CONFIG, ...overrides };
  assertConfig(config);
  return config;
}

export function assertConfig(config: MatchingConfig): void {
  if (!Number.isFinite(config.staleLocationMs) || config.staleLocationMs <= 0) {
    throw new Error("matching: staleLocationMs must be a positive number of ms");
  }
  if (!Number.isFinite(config.maxServiceRadiusKm) || config.maxServiceRadiusKm <= 0) {
    throw new Error("matching: maxServiceRadiusKm must be a positive number of km");
  }
  if (!Number.isFinite(config.maxEtaMinutes) || config.maxEtaMinutes <= 0) {
    throw new Error("matching: maxEtaMinutes must be a positive number of minutes");
  }
  if (!Number.isFinite(config.roadFactor) || config.roadFactor < 1) {
    throw new Error("matching: roadFactor must be >= 1 (roads are longer than the crow flies)");
  }
  if (!Number.isFinite(config.averageCitySpeedKmh) || config.averageCitySpeedKmh <= 0) {
    throw new Error("matching: averageCitySpeedKmh must be a positive number");
  }
  if (!Number.isInteger(config.candidateLimit) || config.candidateLimit < 1) {
    throw new Error("matching: candidateLimit must be a positive integer");
  }
}

/** Resolve the full, normalised weight set (defaults + overrides, sum 1.0). */
export function resolveWeights(config: { weights?: WeightSet }): Required<WeightSet> {
  const merged: Required<WeightSet> = { ...DEFAULT_WEIGHTS, ...(config.weights ?? {}) };
  for (const factor of FACTOR_NAMES) {
    const w = merged[factor];
    if (typeof w !== "number" || !Number.isFinite(w) || w < 0) {
      throw new Error(`matching: weight for "${factor}" must be a non-negative number`);
    }
  }
  return normalizeWeights(merged);
}

function normalizeWeights(weights: Required<WeightSet>): Required<WeightSet> {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (total <= 0) throw new Error("matching: total weight must be positive");
  if (Math.abs(total - 1) < 1e-9) return weights;
  const out = {} as Required<WeightSet>;
  for (const factor of FACTOR_NAMES) out[factor] = weights[factor] / total;
  return out;
}

/**
 * Demand-aware weights: shift a portion of eta+distance onto reliability as
 * demandIndex rises toward 1. `blend` controls how much of the proximity
 * weight is moved (12.5% at maximum demand). Pure and deterministic.
 */
export function effectiveWeights(config: MatchingConfig, demandIndex: number): Required<WeightSet> {
  const base = resolveWeights(config);
  const demand = clamp01(demandIndex);

  const proximity = (base.eta + base.distance) * 0.125 * demand;
  const shift = proximity / 3;
  return {
    ...base,
    eta: base.eta - shift * 2,
    distance: base.distance - shift,
    rating: base.rating + shift,
    acceptanceRate: base.acceptanceRate + shift,
    cancellationRate: base.cancellationRate + shift,
  };
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Weighted total of the factor scores; weights already sum to 1. */
export function weightedScore(weights: Required<WeightSet>, scores: FactorScores): number {
  let total = 0;
  for (const factor of FACTOR_NAMES) total += weights[factor] * scores[factor];
  return clamp01(total);
}
