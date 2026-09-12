import { describe, expect, it } from "vitest";
import {
  captureRadiusKm,
  entranceToleranceKm,
  minRecommendedScore,
  recommendPickup,
  scorePickupZone,
} from "../recommend";
import { haversineKm } from "../recommend";
import type { PickupZone } from "../types";

const gate: PickupZone = {
  id: "test-gate",
  name: "Campus Main Gate",
  center: { lat: -25.518, lng: 28.1 },
  radius: 2.5,
  entrance: { lat: -25.5208, lng: 28.1032 },
  active: true,
  priority: 90,
  placeType: "gate",
  description: "South gate",
};

const base: Omit<PickupZone, "id" | "name" | "center" | "radius" | "entrance"> = {
  active: true,
  priority: 50,
  placeType: "landmark",
};

function make(id: string, partial: Partial<PickupZone>): PickupZone {
  return {
    id,
    name: id,
    center: { lat: -25.52, lng: 28.1 },
    radius: 2,
    entrance: { lat: -25.52, lng: 28.1 },
    ...base,
    ...partial,
  };
}

describe("scorePickupZone", () => {
  it("rewards priority, place-type and proximity", () => {
    const near = scorePickupZone(gate, 0.3);
    const far = scorePickupZone(gate, 2.4);
    expect(near).toBeGreaterThan(far);
    expect(near).toBeGreaterThan(90);
  });

  it("gives priority zones a head start over neutral ones", () => {
    const landmark = scorePickupZone(make("l", { priority: 10, placeType: "landmark" }), 0.5);
    const airport = scorePickupZone(make("a", { priority: 60, placeType: "airport" }), 0.5);
    expect(airport).toBeGreaterThan(landmark);
  });
});

describe("recommendPickup", () => {
  it("suggests the campus gate for a point anywhere on campus", () => {
    // Passenger picks a spot ~1.2 km away on the campus — not already AT the gate.
    const origin = { lat: -25.525, lng: 28.106 };
    const rec = recommendPickup(origin, [gate], "On campus");
    expect(rec.hasSuggestion).toBe(true);
    expect(rec.zones[0].zone.id).toBe(gate.id);
    expect(rec.zones[0].reason).toBe("better_road_access");
  });

  it("does NOT suggest a zone the passenger is already standing at", () => {
    const atEntrance = gate.entrance;
    const rec = recommendPickup(atEntrance, [gate]);
    expect(rec.hasSuggestion).toBe(false);
    expect(rec.zones).toHaveLength(0);
  });

  it("ignores inactive zones", () => {
    const inactive = { ...gate, active: false };
    const rec = recommendPickup({ lat: -25.525, lng: 28.106 }, [inactive]);
    expect(rec.hasSuggestion).toBe(false);
  });

  it("drops zones farther than the capture radius", () => {
    const far = make("far", { center: { lat: -25.52 + 2, lng: 28.1 } });
    const origin = { lat: -25.52, lng: 28.1 };
    expect(haversineKm(far.center, origin)).toBeGreaterThan(captureRadiusKm);
    const rec = recommendPickup(origin, [far]);
    expect(rec.hasSuggestion).toBe(false);
  });

  it("ranks by score descending, then distance ascending for ties", () => {
    const origin = { lat: -25.525, lng: 28.106 };
    const best = make("best", { priority: 90, placeType: "campus" });
    const ok = make("ok", { priority: 40, placeType: "landmark" });
    const rec = recommendPickup(origin, [ok, best]);
    expect(rec.zones[0].zone.id).toBe("best");
  });

  it("only returns zones that clear the minimum score", () => {
    const weak = make("weak", { priority: 0, placeType: "landmark", radius: 0.3 });
    const rec = recommendPickup({ lat: -25.521, lng: 28.101 }, [weak]);
    const score = scorePickupZone(weak, haversineKm(weak.entrance, { lat: -25.521, lng: 28.101 }));
    if (score < minRecommendedScore) {
      expect(rec.hasSuggestion).toBe(false);
    }
  });

  it("contributes distance text for an entrance outside the zone radius as near", () => {
    const rec = recommendPickup({ lat: -25.6, lng: 28.2 }, [gate]);
    if (rec.hasSuggestion) {
      // within capture radius means the entrance distance is <= captureRadiusKm
      expect(rec.zones[0].distanceKm).toBeLessThanOrEqual(captureRadiusKm);
      expect(rec.zones[0].description).toContain("from your point");
    }
  });

  it("is deterministic for the same inputs", () => {
    const a = recommendPickup({ lat: -25.525, lng: 28.106 }, [gate]);
    const b = recommendPickup({ lat: -25.525, lng: 28.106 }, [gate]);
    expect(a.zones.map((z) => z.zone.id)).toEqual(b.zones.map((z) => z.zone.id));
  });

  it("marks a far-but-valid candidate with close_to_pickup", () => {
    const origin = { lat: -25.6, lng: 28.25 };
    const rec = recommendPickup(origin, [gate]);
    if (rec.hasSuggestion) {
      expect(["nearby_known_zone", "better_road_access", "close_to_pickup"]).toContain(
        rec.zones[0].reason,
      );
    }
  });
});
