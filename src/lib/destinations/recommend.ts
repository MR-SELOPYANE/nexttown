/**
 * DESTINATION RECOMMENDATION — SCORING ENGINE (PURE)
 * --------------------------------------------------------------------------
 * Deterministic algorithm that scores recommendations based on:
 * - How frequently a destination appears in user history
 * - How recent the last visit was
 * - Whether the time of day matches historical patterns
 *
 * All logic is pure functions with no side effects, fully unit-testable.
 * Uses only the authenticated user's own data.
 */

import type { RideDestination, RecommendedDestination, SavedDestination } from "./types";

/**
 * Score a destination for recommendation based on frequency and recency.
 * Higher score = better recommendation.
 *
 * Score formula:
 *   frequencyScore = (count / maxCount) * 0.5
 *   recencyScore = (1 - daysSinceLastVisit / 30) * 0.3
 *   timeMatchScore = (1 - hourDiff / 12) * 0.2
 *   total = frequencyScore + recencyScore + timeMatchScore
 */
export function scoreDestination(destination: RideDestination[], currentHourOfDay: number): number {
  if (destination.length === 0) return 0;

  // Frequency: how often this destination appears
  const maxFrequency = 50; // Normalize: assume 50 is max for typical users
  const frequencyScore = Math.min(1, destination.length / maxFrequency) * 0.5;

  // Recency: how long since last visit
  const mostRecent = destination[0];
  const daysSinceLastVisit = Math.max(
    0,
    (Date.now() - new Date(mostRecent.completedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const recencyScore = Math.max(0, 1 - daysSinceLastVisit / 30) * 0.3;

  // Time-of-day match: do they usually visit at this hour?
  let timeMatchScore = 0;
  if (mostRecent.hourOfDay !== undefined && mostRecent.hourOfDay !== null) {
    const hourDiff = Math.abs(mostRecent.hourOfDay - currentHourOfDay);
    const normalizedDiff = Math.min(hourDiff, 24 - hourDiff); // Handle wrap-around
    timeMatchScore = Math.max(0, 1 - normalizedDiff / 12) * 0.2;
  }

  return Math.round((frequencyScore + recencyScore + timeMatchScore) * 100) / 100;
}

/**
 * Score a saved destination.
 * Saved destinations get a high base score + usage bonus.
 */
export function scoreSavedDestination(
  saved: SavedDestination,
  recentHistory: RideDestination[],
): number {
  const baseScore = 0.8; // Saved destinations always score high

  // Usage bonus: frequently-used saved destinations score even higher
  const maxUsage = 50;
  const usageBonus = Math.min(0.2, (saved.usageCount / maxUsage) * 0.2);

  // Recency boost: if recently used
  let recencyBonus = 0;
  if (saved.lastUsedAt) {
    const daysSince = (Date.now() - new Date(saved.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);
    recencyBonus = Math.max(0, (1 - daysSince / 7) * 0.1);
  }

  return Math.min(1, baseScore + usageBonus + recencyBonus);
}

/**
 * Calculate time-of-day relevance.
 * Returns 1.0 if perfect match, 0.0 if completely wrong time.
 */
export function timeOfDayRelevance(
  destinationHourPattern: number | undefined,
  currentHourOfDay: number,
): number {
  if (destinationHourPattern === undefined || destinationHourPattern === null) {
    return 0.5; // No pattern data, neutral score
  }

  const hourDiff = Math.abs(destinationHourPattern - currentHourOfDay);
  const normalizedDiff = Math.min(hourDiff, 24 - hourDiff);
  return Math.max(0, 1 - normalizedDiff / 12);
}

/**
 * Calculate distance between two coordinates (km).
 * Uses Haversine formula for great-circle distance.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Deduplicate destinations by location (merging nearby points).
 * Two locations within 100m are considered the same destination.
 */
export function deduplicateDestinations(
  destinations: RideDestination[],
  toleranceKm: number = 0.1, // 100 meters
): Map<string, RideDestination[]> {
  const groups = new Map<string, RideDestination[]>();

  for (const dest of destinations) {
    let found = false;

    for (const [key, group] of groups) {
      // Compare with first item in the group
      const distance = haversineKm(dest.dropoffLocation, group[0].dropoffLocation);
      if (distance <= toleranceKm) {
        group.push(dest);
        found = true;
        break;
      }
    }

    if (!found) {
      const key = `${dest.dropoffLocation.lat.toFixed(4)},${dest.dropoffLocation.lng.toFixed(4)}`;
      groups.set(key, [dest]);
    }
  }

  return groups;
}

/**
 * Get the most recent label for a destination location.
 */
export function getMostRecentLabel(destinations: RideDestination[]): string | undefined {
  if (destinations.length === 0) return undefined;
  const withLabel = destinations.filter((d) => d.dropoffLabel);
  if (withLabel.length === 0) return undefined;
  // Sort by date descending, get the most recent
  return withLabel.sort((a, b) => {
    const aTime = new Date(a.completedAt).getTime();
    const bTime = new Date(b.completedAt).getTime();
    return bTime - aTime;
  })[0]?.dropoffLabel;
}

/**
 * Configuration options for recommendation scoring.
 */
export type RecommendationConfig = {
  /** Minimum number of visits to a destination before recommending (default: 2) */
  minVisitsToRecommend: number;
  /** How many days of history to consider (default: 90) */
  historyWindowDays: number;
  /** Tolerance in km for deduplicating nearby locations (default: 0.1 = 100m) */
  locationToleranceKm: number;
  /** Bias towards saved destinations (default: 0.15; add to saved scores) */
  savedDestinationBias: number;
  /** Maximum recommendations to return (default: 10) */
  maxRecommendations: number;
  /** Optional weekday and approximate location context. */
  currentDayOfWeek?: string;
  currentLocation?: { lat: number; lng: number };
};

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  minVisitsToRecommend: 2,
  historyWindowDays: 90,
  locationToleranceKm: 0.1,
  savedDestinationBias: 0.15,
  maxRecommendations: 10,
};

/**
 * Score a set of destinations and return ranked recommendations.
 *
 * Algorithm:
 * 1. Deduplicate destinations by location (merge nearby points)
 * 2. Filter by minimum visit count
 * 3. Score each destination by frequency, recency, time-of-day match
 * 4. Rank by score
 * 5. Return top N with context
 */
export function rankDestinationRecommendations(
  saved: SavedDestination[],
  history: RideDestination[],
  currentHourOfDay: number,
  config: Partial<RecommendationConfig> = {},
): RecommendedDestination[] {
  const cfg = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };

  const ranked: RecommendedDestination[] = [];

  // Add saved destinations (always high priority)
  for (const dest of saved) {
    const score = scoreSavedDestination(dest, history) + cfg.savedDestinationBias;
    ranked.push({
      location: dest.location,
      label: dest.label,
      frequencyRank: 1,
      recencyScore: dest.lastUsedAt ? 0.8 : 0.5,
      timeMatchScore: 0.5,
      combinedScore: Math.min(1, score),
      source: "saved",
    });
  }

  // Deduplicate history by location
  const deduplicated = deduplicateDestinations(history, cfg.locationToleranceKm);

  // Score each destination group
  for (const [, destinations] of deduplicated) {
    if (destinations.length < cfg.minVisitsToRecommend) continue;

    const dayMatch = cfg.currentDayOfWeek
      ? destinations.filter(
          (destination) =>
            destination.dayOfWeek?.toLowerCase() === cfg.currentDayOfWeek?.toLowerCase(),
        ).length / destinations.length
      : 0;
    const score = Math.min(1, scoreDestination(destinations, currentHourOfDay) + dayMatch * 0.1);
    const label = getMostRecentLabel(destinations);

    ranked.push({
      location: destinations[0].dropoffLocation,
      label,
      frequencyRank: destinations.length,
      recencyScore: (() => {
        const daysSince =
          (Date.now() - new Date(destinations[0].completedAt).getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, 1 - daysSince / 30);
      })(),
      timeMatchScore: timeOfDayRelevance(destinations[0].hourOfDay, currentHourOfDay),
      combinedScore: score,
      source: "history",
    });
  }

  if (cfg.currentLocation) {
    for (const recommendation of ranked) {
      const distance = haversineKm(cfg.currentLocation, recommendation.location);
      recommendation.combinedScore = Math.min(
        1,
        recommendation.combinedScore + Math.max(0, 0.08 - (Math.min(distance, 8) / 8) * 0.08),
      );
    }
  }

  // Sort by score descending
  ranked.sort((a, b) => b.combinedScore - a.combinedScore);

  return ranked.slice(0, cfg.maxRecommendations);
}

/**
 * Determine whether there is enough data to make good recommendations.
 */
export function hasEnoughDataForRecommendations(
  history: RideDestination[],
  minTrips: number = 5,
): boolean {
  return history.length >= minTrips;
}
