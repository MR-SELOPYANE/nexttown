/**
 * SMART PICKUP ZONES â€” SERVER FUNCTIONS
 * --------------------------------------------------------------------------
 * TanStack Start server functions for pickup zone recommendations and
 * administrative operations. These functions are the only client-reachable
 * surface for pickup zone operations.
 *
 * Public functions:
 * - getPickupRecommendation: Get recommendations for a passenger's chosen point
 * - getPickupZonesByRegion: Fetch zones for a region (admin/map view)
 *
 * Admin-only functions:
 * - upsertPickupZone: Create or update a pickup zone
 * - deletePickupZone: Mark a zone as inactive or delete
 * - logRecommendationFeedback: Track whether users accepted recommendations
 */

import { createServerFn } from "@tanstack/react-start";
import type { LatLng, PickupPlaceType, PickupRecommendation, PickupZone } from "../pickup/types";
import {
  getPickupZonesFromDb,
  upsertPickupZoneInDb,
  deletePickupZoneInDb,
  logRecommendationFeedbackInDb,
  getPickupZonesByRegionInDb,
} from "./server/pickup-zone-service";
import { recommendPickup } from "../pickup/recommend";
import { DEFAULT_PICKUP_ZONES } from "../pickup/pickup-zone-service";

/**
 * CLIENT FUNCTION: Get pickup recommendations for a passenger's chosen point.
 * @param location The passenger's chosen pickup location (GPS)
 * @param locationLabel Optional label for the location (e.g. "GPS detected")
 * @param region Optional: filter zones to a specific region (e.g. "gauteng")
 */
export const getPickupRecommendationFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const loc = d.location as unknown;
    if (!loc || typeof loc !== "object") return null;
    const l = loc as Record<string, unknown>;
    if (typeof l.lat !== "number" || typeof l.lng !== "number") return null;
    return {
      location: { lat: l.lat, lng: l.lng },
      locationLabel: typeof d.locationLabel === "string" ? d.locationLabel : undefined,
      region: typeof d.region === "string" ? d.region : undefined,
    };
  })
  .handler(async ({ data }): Promise<PickupRecommendation | null> => {
    if (!data) return null;
    try {
      const zones = await getPickupZonesFromDb(data.region);
      return recommendPickup(data.location, zones, data.locationLabel);
    } catch (error) {
      console.error("getPickupRecommendation failed:", error);
      const fallbackZones = data.region
        ? DEFAULT_PICKUP_ZONES.filter((zone) => zone.region === data.region)
        : DEFAULT_PICKUP_ZONES;
      return recommendPickup(data.location, fallbackZones, data.locationLabel);
    }
  });

/**
 * CLIENT FUNCTION: Fetch pickup zones for a region (used by admin/map views).
 * @param region The region code (e.g. "gauteng", "kwazulu-natal")
 */
export const getPickupZonesByRegionFn = createServerFn({ method: "GET" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    return { region: typeof data.region === "string" ? data.region : undefined };
  })
  .handler(async ({ data }): Promise<PickupZone[]> => {
    if (!data) return [];
    try {
      return await getPickupZonesByRegionInDb(data.region);
    } catch (error) {
      console.error("getPickupZonesByRegion failed:", error);
      return [];
    }
  });

/**
 * ADMIN FUNCTION: Create or update a pickup zone.
 * Requires admin role.
 */
export const upsertPickupZoneFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    if (typeof d.id !== "string") return null;
    if (typeof d.name !== "string") return null;
    const center = d.center as unknown;
    const entrance = d.entrance as unknown;
    if (!isLatLng(center) || !isLatLng(entrance)) return null;
    return {
      id: d.id,
      name: d.name,
      center: center as LatLng,
      radius: typeof d.radius === "number" ? d.radius : 2,
      entrance: entrance as LatLng,
      active: typeof d.active === "boolean" ? d.active : true,
      priority: typeof d.priority === "number" ? d.priority : 50,
      placeType: typeof d.placeType === "string" ? (d.placeType as PickupPlaceType) : "gate",
      description: typeof d.description === "string" ? d.description : undefined,
      region: typeof d.region === "string" ? d.region : undefined,
      roadAccessible: typeof d.roadAccessible === "boolean" ? d.roadAccessible : undefined,
      pedestrianFriendly:
        typeof d.pedestrianFriendly === "boolean" ? d.pedestrianFriendly : undefined,
      trafficRestrictions: Array.isArray(d.trafficRestrictions)
        ? d.trafficRestrictions.filter((value): value is string => typeof value === "string")
        : undefined,
      notesForDrivers: typeof d.notesForDrivers === "string" ? d.notesForDrivers : undefined,
    };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string; zone?: PickupZone }> => {
    if (!data) {
      return { ok: false, message: "Invalid zone data" };
    }
    try {
      const zone = await upsertPickupZoneInDb(data as PickupZone);
      return { ok: true, message: "Zone saved successfully", zone };
    } catch (error) {
      console.error("upsertPickupZone failed:", error);
      return { ok: false, message: error instanceof Error ? error.message : "Failed to save zone" };
    }
  });

/**
 * ADMIN FUNCTION: Delete or deactivate a pickup zone.
 */
export const deletePickupZoneFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data.id !== "string") return null;
    return { id: data.id, hard: typeof data.hard === "boolean" ? data.hard : false };
  })
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      message: string;
    }> => {
      if (!data) {
        return { ok: false, message: "Zone ID required" };
      }
      try {
        await deletePickupZoneInDb(data.id, data.hard);
        return { ok: true, message: "Zone deleted successfully" };
      } catch (error) {
        console.error("deletePickupZone failed:", error);
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Failed to delete zone",
        };
      }
    },
  );

/**
 * CLIENT FUNCTION: Log whether a user accepted a pickup recommendation.
 * Used for analytics and improving the recommendation algorithm.
 */
export const logRecommendationFeedbackFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const loc = data.chosenLocation as unknown;
    if (!isLatLng(loc)) return null;
    return {
      chosenLocation: loc as LatLng,
      recommendedZoneId: typeof data.recommendedZoneId === "string" ? data.recommendedZoneId : null,
      accepted: typeof data.accepted === "boolean" ? data.accepted : null,
    };
  })
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!data) return { ok: false };
    try {
      await logRecommendationFeedbackInDb(data);
      return { ok: true };
    } catch (error) {
      console.error("logRecommendationFeedback failed:", error);
      return { ok: false };
    }
  });

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isLatLng(obj: unknown): obj is LatLng {
  return typeof obj === "object" && obj !== null && "lat" in obj && "lng" in obj
    ? typeof (obj as Record<string, unknown>).lat === "number" &&
        typeof (obj as Record<string, unknown>).lng === "number"
    : false;
}
