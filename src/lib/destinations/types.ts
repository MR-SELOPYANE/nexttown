/**
 * DESTINATION RECOMMENDATION — SHARED TYPES
 * --------------------------------------------------------------------------
 * Privacy-first types for destination tracking and recommendations.
 * All data is per-user, immutable (except deletion), and RLS-enforced.
 */

export type LatLng = { lat: number; lng: number };

/**
 * A completed trip (immutable log entry).
 * Created when a ride is completed and never modified (only soft-deleted).
 */
export type RideDestination = {
  /** UUID identifier */
  id: string;
  /** The user who took the trip */
  userId: string;
  /** Pickup coordinates */
  pickupLocation: LatLng;
  /** Dropoff coordinates */
  dropoffLocation: LatLng;
  /** Human-friendly dropoff label if available (e.g. "Mall of Africa") */
  dropoffLabel?: string;
  /** When the trip was completed */
  completedAt: Date;
  /** Computed from completedAt for grouping (e.g. "Monday") */
  dayOfWeek?: string;
  /** Computed from completedAt for grouping (0-23) */
  hourOfDay?: number;
  /** Vehicle class used */
  vehicleClass?: string;
  /** Trip distance in km */
  tripDistanceKm?: number;
  /** Trip duration in minutes */
  tripDurationMin?: number;
  /** User rating (1-5) */
  rating?: number;
  /** Optional notes from user */
  notes?: string;
  /** Is this trip archived/deleted? */
  archived: boolean;
};

/**
 * A saved destination (e.g. Home, Work).
 * Manually curated by user for quick access.
 */
export type SavedDestination = {
  /** UUID identifier */
  id: string;
  /** The user who saved this destination */
  userId: string;
  /** Human-friendly name (e.g. "Home", "Work") */
  label: string;
  /** Coordinates of the destination */
  location: LatLng;
  /** Category for grouping (e.g. "home", "work", "custom") */
  category?: "home" | "work" | "school" | "custom";
  /** Optional emoji for UI display (e.g. "🏠") */
  iconEmoji?: string;
  /** Optional color for UI display (e.g. "#FF5733") */
  colorHex?: string;
  /** How many times this destination has been used in bookings */
  usageCount: number;
  /** When this destination was last used in a booking */
  lastUsedAt?: Date;
  /** When the destination was created */
  createdAt: Date;
  /** When the destination was last updated */
  updatedAt: Date;
};

/**
 * A recommended destination with scoring metadata.
 */
export type RecommendedDestination = {
  /** The location coordinates */
  location: LatLng;
  /** Human-friendly label if available */
  label?: string;
  /** How frequently this destination appears in history (1 = most frequent) */
  frequencyRank: number;
  /** Recency score (0-1; 1 = very recent) */
  recencyScore: number;
  /** Time-of-day matching score (0-1; 1 = perfect match for current hour) */
  timeMatchScore: number;
  /** Combined recommendation score (0-1) */
  combinedScore: number;
  /** Source of recommendation: "saved" | "history" */
  source: "saved" | "history";
};

/**
 * Request to get destination recommendations.
 */
export type DestinationRecommendationRequest = {
  /** Current user location (optional; used for proximity filtering) */
  currentLocation?: LatLng;
  /** Filter by day of week (e.g. "Monday") */
  dayOfWeek?: string;
  /** Filter by hour of day (0-23) */
  hourOfDay?: number;
  /** Maximum number of recommendations to return */
  limit?: number;
  /** Include saved destinations in results? (default: true) */
  includeSaved?: boolean;
  /** Include history-based recommendations? (default: true) */
  includeHistory?: boolean;
};

/**
 * Response with destination recommendations.
 */
export type DestinationRecommendation = {
  /** List of recommended destinations, ranked by score */
  destinations: RecommendedDestination[];
  /** Context about why these recommendations were generated */
  context: {
    currentTime: Date;
    dayOfWeek: string;
    hourOfDay: number;
    userHistoryCount: number;
    savedDestinationCount: number;
  };
  /** Whether recommendations were based on real user data */
  hasEnoughData: boolean;
};

/**
 * User feedback on a recommendation (for analytics/improvement).
 */
export type RecommendationFeedback = {
  /** The location that was recommended */
  recommendedLocation: LatLng;
  /** Label of the recommendation if available */
  recommendedLabel?: string;
  /** Was the recommendation shown to the user? */
  shown: boolean;
  /** Did the user click on the recommendation? */
  clicked?: boolean;
  /** Did the user actually use this destination in a booking? */
  usedInBooking?: boolean;
};

/**
 * Request to add/update a saved destination.
 */
export type UpsertSavedDestinationRequest = {
  /** Human-friendly name */
  label: string;
  /** Coordinates */
  location: LatLng;
  /** Category */
  category?: "home" | "work" | "school" | "custom";
  /** Optional emoji */
  iconEmoji?: string;
  /** Optional color */
  colorHex?: string;
};

/**
 * Request to delete a destination (clears history).
 */
export type DeleteDestinationRequest = {
  /** The location to delete */
  location: LatLng;
  /** Only delete specific entries? Or all? */
  mode: "exact" | "all"; // "exact" = only matching coordinates, "all" = entire destination
};
