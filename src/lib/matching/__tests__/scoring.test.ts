import { describe, expect, it } from "vitest";
import { resolveConfig } from "../config";
import { scoreCandidate, scoreFactors } from "../scoring";
import { FACTOR_NAMES } from "../types";
import { makeCandidate, makeRequest, NOW } from "./helpers";

describe("scoreFactors", () => {
  it("reports every one of the 16 factors, each normalised to 0..1", () => {
    const candidate = makeCandidate();
    const request = makeRequest();
    const scores = scoreFactors(candidate, request, resolveConfig(), /* etaMin */ 5);
    for (const factor of FACTOR_NAMES) {
      expect(Object.keys(scores)).toContain(factor);
    }
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("scales rating and acceptance linearly, cancellation inversely", () => {
    const scores = scoreFactors(
      makeCandidate({
        profile: {
          ...makeCandidate().profile,
          rating: 4,
          acceptanceRate: 0.5,
          cancellationRate: 0.2,
        },
      }),
      makeRequest(),
      resolveConfig(),
      5,
    );
    expect(scores.rating).toBeCloseTo(0.8, 9);
    expect(scores.acceptanceRate).toBeCloseTo(0.5, 9);
    expect(scores.cancellationRate).toBeCloseTo(0.8, 9);
  });

  it("freshness falls to 0 exactly at the stale threshold", () => {
    const config = resolveConfig();
    const now = NOW;
    expect(
      scoreFactors(makeCandidate({ updatedAt: now }), makeRequest(), config, 5).freshness,
    ).toBeCloseTo(1, 9);
    expect(
      scoreFactors(
        makeCandidate({ updatedAt: now - config.staleLocationMs }),
        makeRequest(),
        config,
        5,
      ).freshness,
    ).toBeCloseTo(0, 9);
  });

  it("carries the request-wide demand index unchanged", () => {
    const scores = scoreFactors(
      makeCandidate(),
      makeRequest({ demandIndex: 0.9 }),
      resolveConfig(),
      5,
    );
    expect(scores.demand).toBeCloseTo(0.9, 9);
  });

  it("rewards capabilities that cover passenger requirements", () => {
    const withWheelchair = scoreFactors(
      makeCandidate({
        profile: {
          ...makeCandidate().profile,
          capabilities: ["wheelchair", "child_seat"],
        },
      }),
      makeRequest({ requiredCapabilities: ["wheelchair", "child_seat"] }),
      resolveConfig(),
      5,
    );
    expect(withWheelchair.requirements).toBeCloseTo(1, 9);

    const partial = scoreFactors(
      makeCandidate({
        profile: { ...makeCandidate().profile, capabilities: ["wheelchair"] },
      }),
      makeRequest({ requiredCapabilities: ["wheelchair", "child_seat"] }),
      resolveConfig(),
      5,
    );
    expect(partial.requirements).toBeCloseTo(0.5, 9);
  });
});

describe("weighted scoring", () => {
  const request = makeRequest();

  // A: almost at the pickup, mediocre quality.
  const closeButRough = makeCandidate({
    driverId: "drv-close",
    lat: -26.1088,
    lng: 28.058,
    profile: {
      ...makeCandidate().profile,
      rating: 3.5,
      acceptanceRate: 0.6,
      cancellationRate: 0.15,
    },
  });

  // B: ~8km away, excellent quality (but still eligible: ~18 min ETA).
  const farButExcellent = makeCandidate({
    driverId: "drv-far",
    lat: -26.18,
    lng: 28.06,
    profile: {
      ...makeCandidate().profile,
      rating: 4.95,
      acceptanceRate: 0.95,
      cancellationRate: 0.01,
    },
  });

  const etaA = 1;
  const etaB = 18;

  it("prefers proximity under the default weight set", () => {
    const config = resolveConfig();
    const scoreA = scoreCandidate(closeButRough, request, config, etaA);
    const scoreB = scoreCandidate(farButExcellent, request, config, etaB);
    expect(scoreA).toBeGreaterThan(scoreB);
  });

  it("prefers reliability when the operator weights rating highest", () => {
    const config = resolveConfig({ weights: { rating: 1 } });
    const scoreA = scoreCandidate(closeButRough, request, config, etaA);
    const scoreB = scoreCandidate(farButExcellent, request, config, etaB);
    expect(scoreB).toBeGreaterThan(scoreA);
  });

  it("scores stay inside 0..1 for both weight sets", () => {
    for (const config of [resolveConfig(), resolveConfig({ weights: { rating: 1 } })]) {
      expect(scoreCandidate(closeButRough, request, config, etaA)).toBeLessThanOrEqual(1);
      expect(scoreCandidate(farButExcellent, request, config, etaB)).toBeGreaterThanOrEqual(0);
    }
  });
});
