/**
 * DESTINATION RECOMMENDATION â€” BACKEND SERVICE
 * --------------------------------------------------------------------------
 * Supabase operations for destination tracking and recommendations.
 * All functions respect RLS (only current user's data is accessible).
 */

import { createClient } from "@supabase/supabase-js";
import type {
  RideDestination,
  SavedDestination,
  LatLng,
  DestinationRecommendationRequest,
  DestinationRecommendation,
  RecommendationFeedback,
  UpsertSavedDestinationRequest,
} from "../../destinations/types";
import {
  rankDestinationRecommendations,
  hasEnoughDataForRecommendations,
  DEFAULT_RECOMMENDATION_CONFIG,
} from "../../destinations/recommend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
);

/**
 * Log a completed ride to the destination history.
 * Call this when a booking is completed.
 */
export async function logRideDestination(
  userId: string,
  pickupLocation: LatLng,
  dropoffLocation: LatLng,
  options?: {
    dropoffLabel?: string;
    tripDistanceKm?: number;
    tripDurationMin?: number;
    vehicleClass?: string;
    rating?: number;
    notes?: string;
  },
): Promise<RideDestination | null> {
  const now = new Date();
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const hourOfDay = now.getHours();

  const { data, error } = await supabase
    .from("ride_destinations")
    .insert([
      {
        user_id: userId,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        dropoff_label: options?.dropoffLabel,
        completed_at: now,
        day_of_week: dayOfWeek,
        hour_of_day: hourOfDay,
        trip_distance_km: options?.tripDistanceKm,
        trip_duration_min: options?.tripDurationMin,
        vehicle_class: options?.vehicleClass,
        rating: options?.rating,
        notes: options?.notes,
        archived: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("logRideDestination error:", error);
    throw error;
  }

  return data ? dbRowToRideDestination(data) : null;
}

/**
 * Fetch destination recommendations for the current user.
 */
export async function getDestinationRecommendations(
  userId: string,
  request: DestinationRecommendationRequest = {},
): Promise<DestinationRecommendation> {
  const now = new Date();
  const hourOfDay = request.hourOfDay ?? now.getHours();
  const limit = request.limit ?? 10;
  const includeSaved = request.includeSaved !== false;
  const includeHistory = request.includeHistory !== false;

  // Fetch saved destinations
  let savedDestinations: SavedDestination[] = [];
  if (includeSaved) {
    const { data, error } = await supabase
      .from("saved_destinations")
      .select("*")
      .eq("user_id", userId)
      .order("usage_count", { ascending: false });

    if (error) {
      console.error("getDestinationRecommendations (saved) error:", error);
    } else {
      savedDestinations = (data || []).map(dbRowToSavedDestination);
    }
  }

  // Fetch ride history
  let rideHistory: RideDestination[] = [];
  if (includeHistory) {
    const { data, error } = await supabase
      .from("ride_destinations")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("completed_at", { ascending: false })
      .limit(100); // Limit for performance

    if (error) {
      console.error("getDestinationRecommendations (history) error:", error);
    } else {
      rideHistory = (data || []).map(dbRowToRideDestination);
    }
  }

  // Score and rank
  const rankedDestinations = rankDestinationRecommendations(
    savedDestinations,
    rideHistory,
    hourOfDay,
    { maxRecommendations: limit },
  );

  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);

  return {
    destinations: rankedDestinations,
    context: {
      currentTime: now,
      dayOfWeek,
      hourOfDay,
      userHistoryCount: rideHistory.length,
      savedDestinationCount: savedDestinations.length,
    },
    hasEnoughData: hasEnoughDataForRecommendations(rideHistory),
  };
}

/**
 * Get a specific saved destination.
 */
export async function getSavedDestination(
  userId: string,
  id: string,
): Promise<SavedDestination | null> {
  const { data, error } = await supabase
    .from("saved_destinations")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    console.error("getSavedDestination error:", error);
    return null;
  }

  return data ? dbRowToSavedDestination(data) : null;
}

/**
 * List all saved destinations for a user.
 */
export async function listSavedDestinations(userId: string): Promise<SavedDestination[]> {
  const { data, error } = await supabase
    .from("saved_destinations")
    .select("*")
    .eq("user_id", userId)
    .order("usage_count", { ascending: false });

  if (error) {
    console.error("listSavedDestinations error:", error);
    throw error;
  }

  return (data || []).map(dbRowToSavedDestination);
}

/**
 * Create or update a saved destination.
 */
export async function upsertSavedDestination(
  userId: string,
  request: UpsertSavedDestinationRequest,
): Promise<SavedDestination> {
  const { data, error } = await supabase
    .from("saved_destinations")
    .upsert(
      {
        user_id: userId,
        label: request.label,
        location: request.location,
        category: request.category,
        icon_emoji: request.iconEmoji,
        color_hex: request.colorHex,
        updated_at: new Date(),
      },
      { onConflict: "user_id,label" },
    )
    .select()
    .single();

  if (error) {
    console.error("upsertSavedDestination error:", error);
    throw error;
  }

  return dbRowToSavedDestination(data);
}

/**
 * Update usage count for a saved destination (called when user books to it).
 */
export async function recordSavedDestinationUsage(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_destinations")
    .update({
      usage_count: supabase.rpc("increment_usage_count", { id }),
      last_used_at: new Date(),
    })
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    console.error("recordSavedDestinationUsage error:", error);
    // Don't throw; this is non-critical
  }
}

/**
 * Delete a saved destination.
 */
export async function deleteSavedDestination(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_destinations")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    console.error("deleteSavedDestination error:", error);
    throw error;
  }
}

/**
 * Clear all ride history for a user (soft delete).
 * CAUTION: This is a destructive operation; user's destinations will be lost.
 */
export async function clearRideHistory(userId: string): Promise<void> {
  const { error } = await supabase
    .from("ride_destinations")
    .update({ archived: true })
    .eq("user_id", userId);

  if (error) {
    console.error("clearRideHistory error:", error);
    throw error;
  }
}

/**
 * Delete a specific ride from history.
 */
export async function deleteRideFromHistory(userId: string, rideId: string): Promise<void> {
  const { error } = await supabase
    .from("ride_destinations")
    .update({ archived: true })
    .eq("user_id", userId)
    .eq("id", rideId);

  if (error) {
    console.error("deleteRideFromHistory error:", error);
    throw error;
  }
}

/**
 * Log feedback on a recommendation (for analytics/improvement).
 */
export async function logRecommendationFeedback(
  userId: string,
  feedback: RecommendationFeedback,
): Promise<void> {
  const { error } = await supabase.from("destination_recommendation_feedback").insert([
    {
      user_id: userId,
      recommended_location: feedback.recommendedLocation,
      recommended_label: feedback.recommendedLabel,
      shown: feedback.shown,
      clicked: feedback.clicked,
      used_in_booking: feedback.usedInBooking,
    },
  ]);

  if (error) {
    console.error("logRecommendationFeedback error:", error);
    // Don't throw; this is analytics, not critical
  }
}

/**
 * Get statistics about recommendation quality (for admins/analytics).
 */
export async function getRecommendationStats(userId: string): Promise<{
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
}> {
  const { data, error } = await supabase
    .from("destination_recommendation_feedback")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("getRecommendationStats error:", error);
    return { totalRecommendations: 0, clickThroughRate: 0, conversionRate: 0 };
  }

  const total = data.length;
  if (total === 0) return { totalRecommendations: 0, clickThroughRate: 0, conversionRate: 0 };

  const clicked = data.filter((d) => d.clicked).length;
  const used = data.filter((d) => d.used_in_booking).length;

  return {
    totalRecommendations: total,
    clickThroughRate: total > 0 ? (clicked / total) * 100 : 0,
    conversionRate: total > 0 ? (used / total) * 100 : 0,
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAPPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type DbRideDestinationRow = {
  id: string;
  user_id: string;
  pickup_location: LatLng;
  dropoff_location: LatLng;
  dropoff_label?: string;
  completed_at: string;
  day_of_week?: string;
  hour_of_day?: number;
  vehicle_class?: string;
  trip_distance_km?: number;
  trip_duration_min?: number;
  rating?: number;
  notes?: string;
  archived: boolean;
};

type DbSavedDestinationRow = {
  id: string;
  user_id: string;
  label: string;
  location: LatLng;
  category?: string;
  icon_emoji?: string;
  color_hex?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
};

function dbRowToRideDestination(row: DbRideDestinationRow): RideDestination {
  return {
    id: row.id,
    userId: row.user_id,
    pickupLocation: row.pickup_location,
    dropoffLocation: row.dropoff_location,
    dropoffLabel: row.dropoff_label,
    completedAt: new Date(row.completed_at),
    dayOfWeek: row.day_of_week,
    hourOfDay: row.hour_of_day,
    vehicleClass: row.vehicle_class,
    tripDistanceKm: row.trip_distance_km,
    tripDurationMin: row.trip_duration_min,
    rating: row.rating,
    notes: row.notes,
    archived: row.archived,
  };
}

function dbRowToSavedDestination(row: DbSavedDestinationRow): SavedDestination {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    location: row.location,
    category: row.category as "home" | "work" | "school" | "custom" | undefined,
    iconEmoji: row.icon_emoji,
    colorHex: row.color_hex,
    usageCount: row.usage_count,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
