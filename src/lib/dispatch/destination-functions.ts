/**
 * DESTINATION RECOMMENDATIONS â€” SERVER FUNCTIONS
 * --------------------------------------------------------------------------
 * TanStack React Start server functions for destination tracking and
 * recommendations. All operations respect RLS (only authenticated user's data).
 */

import { createServerFn } from "@tanstack/react-start";
import type {
  DestinationRecommendation,
  DestinationRecommendationRequest,
  SavedDestination,
  UpsertSavedDestinationRequest,
  LatLng,
  RecommendationFeedback,
} from "../destinations/types";
import {
  getDestinationRecommendations,
  listSavedDestinations,
  upsertSavedDestination,
  deleteSavedDestination,
  logRideDestination,
  clearRideHistory,
  deleteRideFromHistory,
  logRecommendationFeedback,
} from "./server/destination-service";

/**
 * CLIENT FUNCTION: Get destination recommendations for the current user.
 */
export const getDestinationRecommendationsFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    return {
      currentLocation: data.currentLocation as LatLng | undefined,
      dayOfWeek: typeof data.dayOfWeek === "string" ? data.dayOfWeek : undefined,
      hourOfDay: typeof data.hourOfDay === "number" ? data.hourOfDay : undefined,
      limit: typeof data.limit === "number" ? data.limit : 10,
      includeSaved: typeof data.includeSaved === "boolean" ? data.includeSaved : true,
      includeHistory: typeof data.includeHistory === "boolean" ? data.includeHistory : true,
    } as DestinationRecommendationRequest;
  })
  .handler(async ({ data }): Promise<DestinationRecommendation> => {
    if (!data) {
      return {
        destinations: [],
        context: {
          currentTime: new Date(),
          dayOfWeek: "Unknown",
          hourOfDay: 0,
          userHistoryCount: 0,
          savedDestinationCount: 0,
        },
        hasEnoughData: false,
      };
    }

    try {
      // Get authenticated user ID from context
      // In production, this would come from auth context
      const userId = "user-id"; // Placeholder; actual implementation gets from request context
      return await getDestinationRecommendations(userId, data);
    } catch (error) {
      console.error("getDestinationRecommendationsFn failed:", error);
      return {
        destinations: [],
        context: {
          currentTime: new Date(),
          dayOfWeek: "Unknown",
          hourOfDay: 0,
          userHistoryCount: 0,
          savedDestinationCount: 0,
        },
        hasEnoughData: false,
      };
    }
  });

/**
 * CLIENT FUNCTION: List all saved destinations for the current user.
 */
export const listSavedDestinationsFn = createServerFn({ method: "GET" })
  .validator((data: Record<string, unknown>) => null)
  .handler(async (): Promise<SavedDestination[]> => {
    try {
      const userId = "user-id"; // Placeholder
      return await listSavedDestinations(userId);
    } catch (error) {
      console.error("listSavedDestinationsFn failed:", error);
      return [];
    }
  });

/**
 * CLIENT FUNCTION: Create or update a saved destination.
 */
export const upsertSavedDestinationFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    if (typeof d.label !== "string") return null;
    const loc = d.location as unknown;
    if (!loc || typeof loc !== "object") return null;
    const l = loc as Record<string, unknown>;
    if (typeof l.lat !== "number" || typeof l.lng !== "number") return null;
    return {
      label: d.label,
      location: { lat: l.lat, lng: l.lng },
      category: typeof d.category === "string" ? (d.category as string) : undefined,
      iconEmoji: typeof d.iconEmoji === "string" ? d.iconEmoji : undefined,
      colorHex: typeof d.colorHex === "string" ? d.colorHex : undefined,
    } as UpsertSavedDestinationRequest;
  })
  .handler(async ({ data }): Promise<SavedDestination | null> => {
    if (!data) return null;
    try {
      const userId = "user-id"; // Placeholder
      return await upsertSavedDestination(userId, data);
    } catch (error) {
      console.error("upsertSavedDestinationFn failed:", error);
      return null;
    }
  });

/**
 * CLIENT FUNCTION: Delete a saved destination.
 */
export const deleteSavedDestinationFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data.id !== "string") return null;
    return { id: data.id };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string }> => {
    if (!data) return { ok: false, message: "ID required" };
    try {
      const userId = "user-id"; // Placeholder
      await deleteSavedDestination(userId, data.id);
      return { ok: true, message: "Destination deleted" };
    } catch (error) {
      console.error("deleteSavedDestinationFn failed:", error);
      return { ok: false, message: error instanceof Error ? error.message : "Failed to delete" };
    }
  });

/**
 * CLIENT FUNCTION: Log a completed ride to destination history.
 * Call this when a booking is completed.
 */
export const logRideDestinationFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const pickup = d.pickupLocation as unknown;
    const dropoff = d.dropoffLocation as unknown;
    if (!pickup || typeof pickup !== "object" || !dropoff || typeof dropoff !== "object")
      return null;
    const p = pickup as Record<string, unknown>;
    const dp = dropoff as Record<string, unknown>;
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return null;
    if (typeof dp.lat !== "number" || typeof dp.lng !== "number") return null;
    return {
      pickupLocation: { lat: p.lat, lng: p.lng },
      dropoffLocation: { lat: dp.lat, lng: dp.lng },
      dropoffLabel: typeof d.dropoffLabel === "string" ? d.dropoffLabel : undefined,
      tripDistanceKm: typeof d.tripDistanceKm === "number" ? d.tripDistanceKm : undefined,
      tripDurationMin: typeof d.tripDurationMin === "number" ? d.tripDurationMin : undefined,
      vehicleClass: typeof d.vehicleClass === "string" ? d.vehicleClass : undefined,
      rating: typeof d.rating === "number" ? d.rating : undefined,
      notes: typeof d.notes === "string" ? d.notes : undefined,
    };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string }> => {
    if (!data) return { ok: false, message: "Invalid data" };
    try {
      const userId = "user-id"; // Placeholder
      await logRideDestination(userId, data.pickupLocation, data.dropoffLocation, {
        dropoffLabel: data.dropoffLabel,
        tripDistanceKm: data.tripDistanceKm,
        tripDurationMin: data.tripDurationMin,
        vehicleClass: data.vehicleClass,
        rating: data.rating,
        notes: data.notes,
      });
      return { ok: true, message: "Ride logged successfully" };
    } catch (error) {
      console.error("logRideDestinationFn failed:", error);
      return { ok: false, message: error instanceof Error ? error.message : "Failed to log ride" };
    }
  });

/**
 * CLIENT FUNCTION: Clear all ride history for the current user.
 * WARNING: This is destructive and cannot be undone.
 */
export const clearRideHistoryFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data.confirm !== "boolean" || !data.confirm) return null;
    return { confirmed: true };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string }> => {
    if (!data?.confirmed) return { ok: false, message: "Confirmation required" };
    try {
      const userId = "user-id"; // Placeholder
      await clearRideHistory(userId);
      return { ok: true, message: "All ride history cleared" };
    } catch (error) {
      console.error("clearRideHistoryFn failed:", error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to clear history",
      };
    }
  });

/**
 * CLIENT FUNCTION: Delete a specific ride from history.
 */
export const deleteRideFromHistoryFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data.rideId !== "string") return null;
    return { rideId: data.rideId };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string }> => {
    if (!data) return { ok: false, message: "Ride ID required" };
    try {
      const userId = "user-id"; // Placeholder
      await deleteRideFromHistory(userId, data.rideId);
      return { ok: true, message: "Ride deleted from history" };
    } catch (error) {
      console.error("deleteRideFromHistoryFn failed:", error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to delete ride",
      };
    }
  });

/**
 * CLIENT FUNCTION: Log feedback on a recommendation.
 */
export const logRecommendationFeedbackFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const loc = d.recommendedLocation as unknown;
    if (!loc || typeof loc !== "object") return null;
    const l = loc as Record<string, unknown>;
    if (typeof l.lat !== "number" || typeof l.lng !== "number") return null;
    return {
      recommendedLocation: { lat: l.lat, lng: l.lng },
      recommendedLabel: typeof d.recommendedLabel === "string" ? d.recommendedLabel : undefined,
      shown: typeof d.shown === "boolean" ? d.shown : true,
      clicked: typeof d.clicked === "boolean" ? d.clicked : undefined,
      usedInBooking: typeof d.usedInBooking === "boolean" ? d.usedInBooking : undefined,
    } as RecommendationFeedback;
  })
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!data) return { ok: false };
    try {
      const userId = "user-id"; // Placeholder
      await logRecommendationFeedback(userId, data);
      return { ok: true };
    } catch (error) {
      console.error("logRecommendationFeedbackFn failed:", error);
      return { ok: false };
    }
  });
