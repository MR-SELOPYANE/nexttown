import { describe, expect, it } from "vitest";
import { DEFAULT_PICKUP_ZONES } from "../pickup-zone-service";
import { recommendPickup } from "../recommend";

describe("seed catalogue — spec scenario", () => {
  it("recommends TUT South Campus Main Gate for a GPS point on TUT Soshanguve South", () => {
    // Passenger GPS inside the south campus grounds.
    const gps = { lat: -25.519, lng: 28.1025 };
    const rec = recommendPickup(gps, DEFAULT_PICKUP_ZONES, "TUT Soshanguve South");
    expect(rec.originLabel).toBe("TUT Soshanguve South");
    expect(rec.hasSuggestion).toBe(true);
    const top = rec.zones[0];
    expect(top.zone.name).toBe("TUT South Campus Main Gate");
    expect(top.zone.placeType).toBe("gate");
  });

  it("seeds gates, airports, stations and malls across SA markets", () => {
    const types = new Set(DEFAULT_PICKUP_ZONES.map((z) => z.placeType));
    expect(types.has("gate")).toBe(true);
    expect(types.has("airport")).toBe(true);
    expect(types.has("station")).toBe(true);
    expect(types.has("mall")).toBe(true);
    expect(DEFAULT_PICKUP_ZONES.length).toBeGreaterThanOrEqual(10);
  });

  it("every seeded zone is active and has a finite entrance", () => {
    for (const z of DEFAULT_PICKUP_ZONES) {
      expect(z.active).toBe(true);
      expect(Number.isFinite(z.entrance.lat)).toBe(true);
      expect(Number.isFinite(z.entrance.lng)).toBe(true);
      expect(z.radius).toBeGreaterThan(0);
    }
  });
});
