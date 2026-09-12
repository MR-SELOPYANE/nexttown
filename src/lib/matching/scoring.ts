import type {
  DriverCandidate,
  DriverStatus,
  FactorScores,
  MatchingConfig,
  MatchingRequest,
} from "./types";
import { clamp01, effectiveWeights, weightedScore } from "./config";
import { VEHICLE_TIER, vehicleCanServe } from "./eligibility";
import { bearing, haversine } from "../sa-places";

/**
 * SCORING — the 16 weighted factors
 * --------------------------------------------------------------------------
 * Every factor normalises to 0..1 where 1 is better, so a factor never
 * dominates by raw scale. `scoreFactors` returns the breakdown (great for
 * operator dashboards) and scoring.ts consumers combine them through
 * `weightedScore()` with demand-adjusted weights.
 */

/** Full factor breakdown for one candidate. Cheap and pure. */
export function scoreFactors(
  candidate: DriverCandidate,
  request: MatchingRequest,
  config: MatchingConfig,
  etaMin: number,
): FactorScores {
  const demand = clamp01(request.demandIndex ?? 0.5);
  const now = request.now ?? Date.now();
  const freshnessMs = Math.max(0, now - candidate.updatedAt);
  const freshness = 1 - clamp01(freshnessMs / config.staleLocationMs);

  return {
    eta: etaScore(etaMin, config),
    distance: distanceScore(distanceKmTo(candidate, request)),
    availability: availabilityScore(candidate.status),
    status: statusScore(candidate.status),
    vehicle: vehicleScore(candidate, request),
    rating: clamp01(candidate.profile.rating / 5),
    acceptanceRate: clamp01(candidate.profile.acceptanceRate),
    cancellationRate: 1 - clamp01(candidate.profile.cancellationRate),
    freshness,
    heading: headingScore(candidate, request),
    pickupZone: pickupZoneScore(candidate, request),
    rideType: rideTypeScore(candidate, request),
    requirements: requirementsScore(candidate, request),
    demand,
    workload: workloadScore(candidate.activeDispatches),
    fairness: fairnessScore(candidate.recentOffers),
  };
}

/** Aggregate score (0..1) with demand-adjusted weights. */
export function scoreCandidate(
  candidate: DriverCandidate,
  request: MatchingRequest,
  config: MatchingConfig,
  etaMin: number,
): number {
  const weights = effectiveWeights(config, request.demandIndex ?? 0.5);
  const scores = scoreFactors(candidate, request, config, etaMin);
  return weightedScore(weights, scores);
}

function distanceKmTo(candidate: DriverCandidate, request: MatchingRequest): number {
  return haversine({ lat: candidate.lat, lng: candidate.lng }, request.pickup);
}

/** ETA: 1 at 0 min, 0 at exactly `maxEtaMinutes`. */
function etaScore(etaMin: number, config: MatchingConfig): number {
  return 1 - clamp01(etaMin / config.maxEtaMinutes);
}

/** Distance straight-line pickup->driver as a 0..1 quality score. */
function distanceScore(km: number): number {
  return 1 - clamp01(km / 20);
}

/** "In the matching pool right now" — 1 for anything the pool can see. */
function availabilityScore(status: DriverStatus): number {
  return status === "offline" ? 0 : 1;
}

/**
 * Fine-grained readiness tie-break among viable drivers: a driver already
 * pointed at the pickup is fractionally favoured; one completing another trip
 * scores near zero.
 */
function statusScore(status: DriverStatus): number {
  switch (status) {
    case "available":
      return 1;
    case "arrived":
      return 0.95;
    case "enroute":
      return 0.8;
    case "ontrip":
      return 0.1;
    case "offline":
    case "completed":
      return 0;
  }
}

/**
 * Vehicle fit: exact class match is 1.0; a LARGER class serving the request
 * is still good (0.85) but not ideal; eligibility has already ruled out
 * smaller classes.
 */
function vehicleScore(candidate: DriverCandidate, request: MatchingRequest): number {
  const canServe = vehicleCanServe(
    candidate.profile.vehicleClass,
    request.vehicleClass,
    candidate.profile.seats,
    request.requiredSeats,
  );
  if (!canServe) return 0;
  const delta = VEHICLE_TIER[candidate.profile.vehicleClass] - VEHICLE_TIER[request.vehicleClass];
  return delta === 0 ? 1 : 0.85;
}

/** Driver heading alignment: 1 when aimed straight at the pickup. */
function headingScore(candidate: DriverCandidate, request: MatchingRequest): number {
  const toPickup = bearing({ lat: candidate.lat, lng: candidate.lng }, request.pickup);
  const delta = Math.abs(candidate.heading - toPickup) % 360;
  const angle = Math.min(delta, 360 - delta);
  return (Math.cos((angle * Math.PI) / 180) + 1) / 2;
}

function pickupZoneScore(candidate: DriverCandidate, request: MatchingRequest): number {
  if (!request.pickupZone || !candidate.profile.preferredZone) return 0.5;
  return request.pickupZone.toLowerCase() === candidate.profile.preferredZone.toLowerCase() ? 1 : 0;
}

function rideTypeScore(candidate: DriverCandidate, request: MatchingRequest): number {
  const wants = (candidate.profile.rideTypes ?? []).map((t) => t.toLowerCase());
  if (wants.length === 0) return 0.5;
  return wants.includes(request.rideType.toLowerCase()) ? 1 : 0;
}

function requirementsScore(candidate: DriverCandidate, request: MatchingRequest): number {
  const required = (request.requiredCapabilities ?? []).map((c) => c.toLowerCase());
  if (required.length === 0) return 0.5;
  const owned = (candidate.profile.capabilities ?? []).map((c) => c.toLowerCase());
  const covered = required.filter((r) => owned.includes(r));
  return covered.length / required.length;
}

/**
 * Workload: 1 with no active dispatches, degrading linearly to 0 once the
 * driver is saturated (`>= WORKLOAD_SATURATION` dispatches).
 */
function workloadScore(activeDispatches: number): number {
  const SATURATION = 3;
  return 1 - clamp01(activeDispatches / SATURATION);
}

/**
 * Fairness: 1 with no recent offers, degrading to 0 after
 * `FAIRNESS_THRESHOLD` offers in the window so dispatch does not pile work
 * onto the same drivers.
 */
function fairnessScore(recentOffers: number): number {
  const THRESHOLD = 6;
  return 1 - clamp01(recentOffers / THRESHOLD);
}
