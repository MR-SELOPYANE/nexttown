import { describe, expect, it } from "vitest";
import { DEFAULT_PRICING_RULES, resolvePricingRules } from "../config";
import { calculateBreakdown, calculateFare, explainQuote, signQuote, verifyQuote } from "../engine";
import {
  computeDemandMultiplier,
  computeTimeOfDayMultiplier,
  computeZoneMultiplier,
} from "../multipliers";
import type { PriceTripInput, PricingRules } from "../types";

const BASE_INPUT: PriceTripInput = {
  tierId: "go",
  vehicleClass: "sedan",
  distanceKm: 10,
  durationMin: 20,
  demandIndex: 0,
  driverSupply: 1,
  zoneIds: [],
};

describe("calculateBreakdown — explainability & defaults", () => {
  it("returns every required component", () => {
    const b = calculateBreakdown(BASE_INPUT, DEFAULT_PRICING_RULES, 0);
    expect(b).toHaveProperty("baseFare");
    expect(b).toHaveProperty("distanceFare");
    expect(b).toHaveProperty("timeFare");
    expect(b).toHaveProperty("serviceFee");
    expect(b).toHaveProperty("demandMultiplier");
    expect(b).toHaveProperty("timeOfDayMultiplier");
    expect(b).toHaveProperty("zoneMultiplier");
    expect(b).toHaveProperty("vehicleMultiplier");
    expect(b).toHaveProperty("total");
  });

  it("at neutral demand/supply the demand multiplier is the curve minimum (1)", () => {
    const b = calculateBreakdown(BASE_INPUT, DEFAULT_PRICING_RULES, 0);
    expect(b.demandMultiplier).toBe(1);
    expect(b.vehicleMultiplier).toBe(1);
    expect(b.zoneMultiplier).toBe(1);
  });

  it("total reconciles with the components (surged subtotal + service fee)", () => {
    const rules = { ...DEFAULT_PRICING_RULES, applySupply: false } as PricingRules;
    const b = calculateBreakdown(BASE_INPUT, rules, 0);
    const tier = rules.tiers.find((t) => t.id === "go")!;
    const subtotal = b.baseFare + b.distanceFare + b.timeFare;
    const effective =
      b.demandMultiplier * b.zoneMultiplier * b.vehicleMultiplier * b.timeOfDayMultiplier;
    const surged = Math.round(subtotal * effective);
    const fee = Math.round(surged * tier.serviceFeeRate);
    expect(b.total).toBe(surged + fee);
    expect(b.serviceFee).toBe(fee);
  });

  it("prices using the selected tier's base/rate/serviceFee", () => {
    const rules = { ...DEFAULT_PRICING_RULES, applySupply: false } as PricingRules;
    const b = calculateBreakdown(
      { ...BASE_INPUT, tierId: "xl", vehicleClass: "minibus" },
      rules,
      0,
    );
    const tier = rules.tiers.find((t) => t.id === "xl")!;
    expect(b.baseFare).toBe(tier.baseFare);
    expect(b.distanceFare).toBeCloseTo(BASE_INPUT.distanceKm * tier.ratePerKm, 2);
  });
});

describe("multipliers", () => {
  it("demand scales from min to max on the curve", () => {
    const rules = { ...DEFAULT_PRICING_RULES, applySupply: false } as PricingRules;
    const low = computeDemandMultiplier({ ...BASE_INPUT, demandIndex: 0 }, rules);
    const peak = computeDemandMultiplier({ ...BASE_INPUT, demandIndex: 1 }, rules);
    expect(low).toBe(rules.demandCurve.min);
    expect(peak).toBeCloseTo(rules.demandCurve.max, 9);
    expect(peak).toBeGreaterThan(low);
  });

  it("low driver supply lifts the multiplier when applySupply", () => {
    const rules = DEFAULT_PRICING_RULES;
    const abundant = computeDemandMultiplier(
      { ...BASE_INPUT, demandIndex: 0.5, driverSupply: 1 },
      rules,
    );
    const scarce = computeDemandMultiplier(
      { ...BASE_INPUT, demandIndex: 0.5, driverSupply: 0 },
      rules,
    );
    expect(scarce).toBeGreaterThan(abundant);
  });

  it("time-of-day windows raise the fare in the late-night window", () => {
    // A date at 23:30 local, weekday.
    const at = new Date(2026, 0, 5, 23, 30).getTime();
    const m = computeTimeOfDayMultiplier({ ...BASE_INPUT, at }, DEFAULT_PRICING_RULES, at);
    expect(m).toBeGreaterThan(1);
  });

  it("an event window overrides recurring windows", () => {
    const stamp = new Date(2026, 0, 1, 12, 0).getTime();
    const rules: PricingRules = {
      ...DEFAULT_PRICING_RULES,
      events: [
        {
          id: "nye",
          label: "New Year",
          startsAt: stamp - 1000,
          endsAt: stamp + 1000,
          multiplier: 2,
        },
      ],
    };
    const m = computeTimeOfDayMultiplier({ ...BASE_INPUT, at: stamp }, rules, stamp);
    expect(m).toBe(2);
  });

  it("zones multiply and unknown zones are neutral", () => {
    const rules = DEFAULT_PRICING_RULES;
    const airport = computeZoneMultiplier({ ...BASE_INPUT, zoneIds: ["airport"] }, rules);
    expect(airport).toBe(1.25);
    const combo = computeZoneMultiplier({ ...BASE_INPUT, zoneIds: ["airport", "campus"] }, rules);
    expect(combo).toBeCloseTo(1.25 * 1.05, 9);
    const unknown = computeZoneMultiplier({ ...BASE_INPUT, zoneIds: ["nowhere"] }, rules);
    expect(unknown).toBe(1);
  });
});

describe("quote signing & authorisation", () => {
  it("produces a deterministic token that survives re-computation", () => {
    const q1 = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    const q2 = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    expect(q1.token).toBe(q2.token);
    expect(signQuote(q1)).toBe(q1.token);
  });

  it("is valid within its expiry window", () => {
    const q = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    expect(verifyQuote(q, DEFAULT_PRICING_RULES, q.expiresAt - 1)).toBe(true);
  });

  it("is invalid after expiry", () => {
    const q = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    expect(verifyQuote(q, DEFAULT_PRICING_RULES, q.expiresAt + 1)).toBe(false);
  });

  it("rejects a tampered total", () => {
    const q = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    const tampered = { ...q, breakdown: { ...q.breakdown, total: q.breakdown.total - 50 } };
    expect(verifyQuote(tampered, DEFAULT_PRICING_RULES, q.expiresAt - 1)).toBe(false);
  });

  it("invalidates a quote when rules version changes", () => {
    const q = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 1_000_000);
    const newer = { ...DEFAULT_PRICING_RULES, version: 999 };
    expect(verifyQuote(q, newer, q.expiresAt - 1)).toBe(false);
  });
});

describe("resolvePricingRules", () => {
  it("merges overrides and keeps sensible defaults", () => {
    const rules = resolvePricingRules({ quoteTtlMs: 60_000 });
    expect(rules.quoteTtlMs).toBe(60_000);
    expect(rules.tiers.length).toBeGreaterThan(0);
    expect(rules.currency).toBe("ZAR");
  });

  it("rejects a zero TTL", () => {
    expect(() => resolvePricingRules({ quoteTtlMs: 0 })).toThrow(/quoteTtlMs/);
  });

  it("rejects a negative vehicle multiplier", () => {
    expect(() => resolvePricingRules({ vehicle: { suv: 0.5 } })).toThrow(/suv/);
  });
});

describe("explainQuote", () => {
  it("returns one human-readable line per component", () => {
    const q = calculateFare(BASE_INPUT, DEFAULT_PRICING_RULES, 0);
    expect(explainQuote(q).length).toBeGreaterThanOrEqual(8);
  });
});
