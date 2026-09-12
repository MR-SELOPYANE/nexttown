import { haversine } from "../sa-places";
import type {
  DriverCandidate,
  EligibilityVerdict,
  MatchingConfig,
  MatchingRequest,
  VehicleClass,
} from "./types";

/**
 * ELIGIBILITY FILTER
 * --------------------------------------------------------------------------
 * Hard gates that discard a driver before any scoring happens. The order here
 * matters — a driver failing several gates reports the first reasons only.
 *
 * Mandatory rejections (per dispatch spec):
 *   - offline / on an active trip        -> not in the matching pool
 *   - stale location fix                 -> GPS uncertainty too high
 *   - outside service radius             -> unreasonably far from the pickup
 *   - cannot supply the required vehicle -> wrong class or too few seats
 * Plus a documented ETA cap.
 */

export const VEHICLE_TIER: Record<VehicleClass, number> = {
  hatch: 1,
  sedan: 1,
  suv: 2,
  minivan: 3,
  minibus: 4,
};

/** Can `driver`'s vehicle serve a request for `required`? Class + seats. */
export function vehicleCanServe(
  driverClass: VehicleClass,
  requiredClass: VehicleClass,
  driverSeats: number,
  requiredSeats: number,
): boolean {
  if (driverSeats < requiredSeats) return false;
  return VEHICLE_TIER[driverClass] >= VEHICLE_TIER[requiredClass];
}

export function evaluateEligibility(
  candidate: DriverCandidate,
  request: MatchingRequest,
  config: MatchingConfig,
): EligibilityVerdict {
  const reasons: string[] = [];

  if (candidate.status === "offline") {
    reasons.push("offline");
  }
  if (candidate.status === "ontrip" || candidate.status === "completed") {
    reasons.push("on_trip");
  }
  if (candidate.status === "enroute") {
    reasons.push("driver_enroute");
  }

  const now = request.now ?? Date.now();
  if (
    !Number.isFinite(candidate.updatedAt) ||
    candidate.updatedAt <= 0 ||
    now - candidate.updatedAt > config.staleLocationMs
  ) {
    reasons.push("stale_location");
  }

  const distanceKm = haversine(request.pickup, {
    lat: candidate.lat,
    lng: candidate.lng,
  });
  if (distanceKm > config.maxServiceRadiusKm) {
    reasons.push("outside_service_radius");
  }

  if (
    !vehicleCanServe(
      candidate.profile.vehicleClass,
      request.vehicleClass,
      candidate.profile.seats,
      request.requiredSeats,
    )
  ) {
    reasons.push("vehicle_mismatch");
  }

  const etaMin = estimateEtaMinutes(candidate, request.pickup, config);
  if (etaMin > config.maxEtaMinutes) {
    reasons.push("eta_exceeded");
  }

  const eligible = reasons.length === 0;
  return { eligible, reasons };
}

/**
 * Road-estimated minutes for the driver to reach the pickup. Uses the
 * candidate's own speed when it makes sense, otherwise the configured
 * city-average speed, inflated by the road factor. Pure and deterministic.
 */
export function estimateEtaMinutes(
  candidate: DriverCandidate,
  pickup: { lat: number; lng: number },
  config: MatchingConfig,
): number {
  const straightKm = haversine({ lat: candidate.lat, lng: candidate.lng }, pickup);
  const roadKm = straightKm * config.roadFactor;
  const speed =
    candidate.speedKmh > 0 ? Math.min(candidate.speedKmh, 120) : config.averageCitySpeedKmh;
  const minutes = (roadKm / Math.max(1, speed)) * 60;
  return Math.round(minutes * 10) / 10;
}
