import type { DriverCandidate, DriverProfile, MatchingConfig, MatchingRequest } from "../types";
import { resolveConfig } from "../config";

/** Deterministic clock so staleness / freshness tests are stable. */
export const NOW = Date.UTC(2026, 7, 30, 12, 0, 0);

export const PICKUP = { lat: -26.1076, lng: 28.0567 }; // Sandton
export const DROPOFF = { lat: -26.2041, lng: 28.0473 }; // Johannesburg

export const BASE_PROFILE: DriverProfile = {
  rating: 4.9,
  acceptanceRate: 0.9,
  cancellationRate: 0.02,
  vehicleClass: "sedan",
  seats: 4,
  preferredZone: "Sandton",
  rideTypes: ["airport"],
  capabilities: [],
};

export function makeCandidate(overrides: Partial<DriverCandidate> = {}): DriverCandidate {
  return {
    driverId: "drv-1",
    lat: -26.105,
    lng: 28.08,
    heading: 90,
    speedKmh: 40,
    status: "available",
    updatedAt: NOW - 60_000,
    activeDispatches: 0,
    recentOffers: 0,
    profile: BASE_PROFILE,
    ...overrides,
  };
}

export function makeRequest(overrides: Partial<MatchingRequest> = {}): MatchingRequest {
  return {
    bookingId: "booking-1",
    pickup: PICKUP,
    dropoff: DROPOFF,
    pickupLabel: "Sandton",
    dropoffLabel: "Johannesburg",
    pickupZone: "Sandton",
    rideType: "airport",
    vehicleClass: "sedan",
    requiredSeats: 2,
    requiredCapabilities: [],
    demandIndex: 0.5,
    now: NOW,
    ...overrides,
  };
}

export function makeConfig(overrides: Partial<MatchingConfig> = {}): MatchingConfig {
  return resolveConfig(overrides);
}
