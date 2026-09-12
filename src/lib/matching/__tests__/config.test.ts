import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_MATCHING_CONFIG,
  effectiveWeights,
  resolveConfig,
  resolveWeights,
} from "../config";

const SUM = Object.values(DEFAULT_WEIGHTS).reduce((s, w) => s + w, 0);

describe("default matching config", () => {
  it("documents all 16 factors with non-negative weights", () => {
    expect(Object.keys(DEFAULT_WEIGHTS)).toHaveLength(16);
    for (const value of Object.values(DEFAULT_WEIGHTS)) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it("default weights sum to 1.0", () => {
    expect(SUM).toBeCloseTo(1.0, 9);
  });

  it("exposes sensible default thresholds", () => {
    expect(DEFAULT_MATCHING_CONFIG.candidateLimit).toBeGreaterThan(0);
    expect(DEFAULT_MATCHING_CONFIG.roadFactor).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_MATCHING_CONFIG.maxEtaMinutes).toBeGreaterThan(0);
    expect(DEFAULT_MATCHING_CONFIG.staleLocationMs).toBeGreaterThan(0);
  });
});

describe("resolveConfig", () => {
  it("merges overrides over the defaults", () => {
    const config = resolveConfig({ candidateLimit: 3, maxEtaMinutes: 40 });
    expect(config.candidateLimit).toBe(3);
    expect(config.maxEtaMinutes).toBe(40);
    expect(config.staleLocationMs).toBe(DEFAULT_MATCHING_CONFIG.staleLocationMs);
  });

  it("rejects a non-positive stale window", () => {
    expect(() => resolveConfig({ staleLocationMs: 0 })).toThrow(/staleLocationMs/);
  });

  it("rejects a road factor below 1", () => {
    expect(() => resolveConfig({ roadFactor: 0.9 })).toThrow(/roadFactor/);
  });

  it("rejects a candidate limit below 1", () => {
    expect(() => resolveConfig({ candidateLimit: 0 })).toThrow(/candidateLimit/);
  });
});

describe("resolveWeights", () => {
  it("merges a partial override over the defaults and renormalises to 1", () => {
    const weights = resolveWeights({
      weights: { eta: 1, distance: 1 },
    });
    const total = Object.values(weights).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 9);
    // Both overrides get equal relative weight; the untouched factors carry
    // proportionally smaller slices.
    expect(weights.eta).toBeCloseTo(weights.distance, 9);
  });

  it("makes a single heavy override dominate without discarding the rest", () => {
    const weights = resolveWeights({ weights: { rating: 1 } });
    const total = Object.values(weights).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 9);
    const biggest = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
    expect(biggest[0]).toBe("rating");
  });

  it("rejects negative weights", () => {
    expect(() => resolveWeights({ weights: { rating: -1 } })).toThrow(/weight for "rating"/);
  });
});

describe("effectiveWeights — demand adjustment", () => {
  it("does nothing at zero demand", () => {
    const base = resolveWeights(DEFAULT_MATCHING_CONFIG);
    const weights = effectiveWeights(DEFAULT_MATCHING_CONFIG, 0);
    expect(weights.eta).toBeCloseTo(base.eta, 9);
    expect(weights.rating).toBeCloseTo(base.rating, 9);
  });

  it("shifts proximity weight onto reliability as demand rises", () => {
    const low = effectiveWeights(DEFAULT_MATCHING_CONFIG, 0);
    const peak = effectiveWeights(DEFAULT_MATCHING_CONFIG, 1);
    expect(peak.eta).toBeLessThan(low.eta);
    expect(peak.distance).toBeLessThan(low.distance);
    expect(peak.rating).toBeGreaterThan(low.rating);
    expect(peak.acceptanceRate).toBeGreaterThan(low.acceptanceRate);
    expect(peak.cancellationRate).toBeGreaterThan(low.cancellationRate);
  });

  it("keeps the total at exactly 1 at peak demand", () => {
    const peak = effectiveWeights(DEFAULT_MATCHING_CONFIG, 1);
    const total = Object.values(peak).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 9);
  });
});
