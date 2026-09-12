/**
 * SMART PICKUP ZONES â€” SUPABASE SERVICE
 * --------------------------------------------------------------------------
 * Backend implementation for pickup zone operations. Handles all database
 * reads/writes and authorization checks. This layer is NOT exposed to the
 * client directly â€” all access goes through the dispatch server functions.
 */

import { createClient } from "@supabase/supabase-js";
import type { PickupPlaceType, PickupZone } from "../../pickup/types";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
);

/**
 * Fetch all active pickup zones, optionally filtered by region.
 * Used to build the recommendation catalogue.
 */
export async function getPickupZonesFromDb(region?: string): Promise<PickupZone[]> {
  let query = supabase.from("pickup_zones").select("*").eq("active", true);

  if (region) {
    query = query.eq("region", region);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPickupZonesFromDb error:", error);
    throw error;
  }

  return (data || []).map(dbRowToPickupZone);
}

/**
 * Fetch pickup zones for a specific region with full details.
 * Used by admin/map views.
 */
export async function getPickupZonesByRegionInDb(region?: string): Promise<PickupZone[]> {
  let query = supabase.from("pickup_zones").select("*");

  if (region) {
    query = query.eq("region", region);
  } else {
    // If no region, only return active zones
    query = query.eq("active", true);
  }

  query = query.order("priority", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("getPickupZonesByRegionInDb error:", error);
    throw error;
  }

  return (data || []).map(dbRowToPickupZone);
}

/**
 * Create or update a pickup zone.
 * Authorization: Admin only (enforced via RLS in the database)
 */
export async function upsertPickupZoneInDb(zone: PickupZone): Promise<PickupZone> {
  const dbRow = pickupZoneToDbRow(zone);

  const { data, error } = await supabase
    .from("pickup_zones")
    .upsert([dbRow], { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("upsertPickupZoneInDb error:", error);
    throw error;
  }

  return dbRowToPickupZone(data);
}

/**
 * Delete or deactivate a pickup zone.
 * - soft delete (default): Set active = false
 * - hard delete: Remove the row entirely
 */
export async function deletePickupZoneInDb(id: string, hard = false): Promise<void> {
  if (hard) {
    const { error } = await supabase.from("pickup_zones").delete().eq("id", id);
    if (error) {
      console.error("deletePickupZoneInDb (hard) error:", error);
      throw error;
    }
  } else {
    const { error } = await supabase.from("pickup_zones").update({ active: false }).eq("id", id);
    if (error) {
      console.error("deletePickupZoneInDb (soft) error:", error);
      throw error;
    }
  }
}

/**
 * Log recommendation feedback for analytics.
 * Tracks whether users accepted or rejected recommendations.
 */
export async function logRecommendationFeedbackInDb(feedback: {
  chosenLocation: { lat: number; lng: number };
  recommendedZoneId: string | null;
  accepted: boolean | null;
}): Promise<void> {
  const { error } = await supabase.from("pickup_recommendations_log").insert([
    {
      chosen_location: feedback.chosenLocation,
      recommended_zone_id: feedback.recommendedZoneId,
      accepted: feedback.accepted,
    },
  ]);

  if (error) {
    console.error("logRecommendationFeedbackInDb error:", error);
    throw error;
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAPPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type DbPickupZoneRow = {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius_km: number;
  entrance: { lat: number; lng: number };
  active: boolean;
  priority: number;
  place_type: string;
  description?: string;
  region?: string;
  road_accessible?: boolean;
  pedestrian_friendly?: boolean;
  traffic_restrictions?: string[];
  notes_for_drivers?: string;
};

/**
 * Convert a database row to a TypeScript PickupZone object.
 */
function dbRowToPickupZone(row: DbPickupZoneRow): PickupZone {
  return {
    id: row.id,
    name: row.name,
    center: row.center,
    radius: row.radius_km,
    entrance: row.entrance,
    active: row.active,
    priority: row.priority,
    placeType: row.place_type as PickupPlaceType,
    description: row.description,
    region: row.region,
    roadAccessible: row.road_accessible,
    pedestrianFriendly: row.pedestrian_friendly,
    trafficRestrictions: row.traffic_restrictions,
    notesForDrivers: row.notes_for_drivers,
  };
}

/**
 * Convert a PickupZone object to a database row.
 */
function pickupZoneToDbRow(zone: PickupZone): DbPickupZoneRow {
  return {
    id: zone.id,
    name: zone.name,
    center: zone.center,
    radius_km: zone.radius,
    entrance: zone.entrance,
    active: zone.active,
    priority: zone.priority,
    place_type: zone.placeType || "gate",
    description: zone.description,
    region: zone.region,
    road_accessible: zone.roadAccessible,
    pedestrian_friendly: zone.pedestrianFriendly,
    traffic_restrictions: zone.trafficRestrictions,
    notes_for_drivers: zone.notesForDrivers,
  };
}
