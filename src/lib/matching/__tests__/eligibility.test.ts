import { describe, expect, it } from "vitest";
import {
  evaluateEligibility,
  estimateEtaMinutes,
  vehicleCanServe,
  VEHICLE_TIER,
} from "../eligibility";
import { makeCandidate, makeConfig, makeRequest, NOW } from "./helpers";

describe("vehicleCanServe", () => {
  it("a higher tier serves a lower-tier request", () => {
    expect(vehicleCanServe("suv", "sedan", 4, 2)).toBe(true);
  });

  it("a lower tier cannot serve a higher-tier request", () => {
    expect(vehicleCanServe("sedan", "suv", 4, 3)).toBe(false);
  });

  it("respects seat capacity", () => {
    expect(vehicleCanServe("sedan", "sedan", 4, 5)).toBe(false);
    expect(vehicleCanServe("sedan", "sedan", 4, 3)).toBe(true);
  });

  it("tiers are ordered sensibly", () => {
    expect(VEHICLE_TIER.minibus).toBeGreaterThan(VEHICLE_TIER.suv);
    expect(VEHICLE_TIER.suv).toBeGreaterThan(VEHICLE_TIER.hatch);
  });
});

describe("evaluateEligibility", () => {
  const request = makeRequest();
  const config = makeConfig();

  it("accepts an available, fresh, nearby driver with the right vehicle", () => {
    const verdict = evaluateEligibility(makeCandidate(), request, config);
    expect(verdict.eligible).toBe(true);
    expect(verdict.reasons).toHaveLength(0);
  });

  it("rejects an offline driver", () => {
    const verdict = evaluateEligibility(makeCandidate({ status: "offline" }), request, config);
    expect(verdict.eligible).toBe(false);
    expect(verdict.reasons).toContain("offline");
  });

  it("rejects a driver already on a trip", () => {
    const verdict = evaluateEligibility(makeCandidate({ status: "ontrip" }), request, config);
    expect(verdict.reasons).toContain("on_trip");
  });

  it("rejects a driver whose GPS fix is stale", () => {
    const verdict = evaluateEligibility(
      makeCandidate({ updatedAt: NOW - config.staleLocationMs - 1 }),
      request,
      config,
    );
    expect(verdict.reasons).toContain("stale_location");
  });

  it("rejects a driver outside the service radius", () => {
    const farAway = makeCandidate({ lat: -26.9, lng: 28.5 }); // ~90km away
    const verdict = evaluateEligibility(farAway, request, config);
    expect(verdict.reasons).toContain("outside_service_radius");
  });

  it("rejects a driver whose vehicle class cannot serve the request", () => {
    const verdict = evaluateEligibility(
      makeCandidate({
        profile: { ...makeCandidate().profile, vehicleClass: "hatch" },
      }),
      makeRequest({ vehicleClass: "minibus" }),
      config,
    );
    expect(verdict.reasons).toContain("vehicle_mismatch");
  });

  it("rejects a driver with too few seats", () => {
    const verdict = evaluateEligibility(
      makeCandidate({
        profile: { ...makeCandidate().profile, seats: 2 },
      }),
      makeRequest({ requiredSeats: 3 }),
      config,
    );
    expect(verdict.reasons).toContain("vehicle_mismatch");
  });

  it("rejects a driver whose ETA exceeds the cap", () => {
    const config = makeConfig({ maxEtaMinutes: 1 });
    const verdict = evaluateEligibility(makeCandidate(), request, config);
    expect(verdict.reasons).toContain("eta_exceeded");
  });

  it("reports multiple credible reasons together", () => {
    const verdict = evaluateEligibility(
      makeCandidate({
        status: "offline",
        updatedAt: NOW - config.staleLocationMs * 3,
        profile: { ...makeCandidate().profile, vehicleClass: "hatch" },
      }),
      makeRequest({ vehicleClass: "minibus", requiredSeats: 5 }),
      config,
    );
    expect(verdict.reasons).toEqual(
      expect.arrayContaining(["offline", "stale_location", "vehicle_mismatch"]),
    );
  });
});

describe("estimateEtaMinutes", () => {
  it("returns ~0 for a driver at the pickup", () => {
    const eta = estimateEtaMinutes(
      makeCandidate({ lat: -26.1076, lng: 28.0567, speedKmh: 40 }),
      makeRequest().pickup,
      makeConfig(),
    );
    expect(eta).toBeGreaterThanOrEqual(0);
    expect(eta).toBeLessThan(1);
  });

  it("grows with distance", () => {
    const config = makeConfig();
    const near = estimateEtaMinutes(
      makeCandidate({ lat: -26.107, lng: 28.057 }),
      makeRequest().pickup,
      config,
    );
    const far = estimateEtaMinutes(
      makeCandidate({ lat: -26.18, lng: 28.06 }),
      makeRequest().pickup,
      config,
    );
    expect(far).toBeGreaterThan(near);
  });

  it("is deterministic for the same inputs", () => {
    const candidate = makeCandidate();
    const config = makeConfig();
    expect(estimateEtaMinutes(candidate, makeRequest().pickup, config)).toBe(
      estimateEtaMinutes(candidate, makeRequest().pickup, config),
    );
  });
});
