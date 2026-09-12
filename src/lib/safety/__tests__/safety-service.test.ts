import { beforeEach, describe, expect, it } from "vitest";
import { SafetyService } from "../safety-service";

const storage = new Map<string, string>();

if (typeof globalThis.localStorage === "undefined") {
  const localStorage = {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  };
  Object.defineProperty(globalThis, "localStorage", { value: localStorage });
  Object.defineProperty(globalThis, "window", { value: { localStorage } });
}

beforeEach(() => {
  localStorage.clear();
});

describe("SafetyService", () => {
  it("keeps ride events ordered and idempotent by booking/event type", () => {
    const first = SafetyService.recordRideEvent("user-1", "booking-1", "RIDE_REQUESTED");
    const duplicate = SafetyService.recordRideEvent("user-1", "booking-1", "RIDE_REQUESTED");

    expect(duplicate.id).toBe(first.id);
    expect(SafetyService.listRideEvents("user-1", "booking-1")).toHaveLength(1);
  });

  it("stores SOS incidents and expiring trip shares under the owner key", () => {
    const incident = SafetyService.createIncident("user-1", "sos", "Emergency", {
      bookingId: "booking-1",
      location: { lat: -25.5, lng: 28.1 },
    });
    const share = SafetyService.createTripShare("user-1", "booking-1");

    expect(SafetyService.listIncidents("user-1")[0]?.id).toBe(incident.id);
    expect(share.ownerId).toBe("user-1");
    expect(share.expiresAt).toBeGreaterThan(share.createdAt);
  });
});
