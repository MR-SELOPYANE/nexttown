/**
 * SMART PICKUP RECOMMENDATION HOOK
 * --------------------------------------------------------------------------
 * React hook for easy access to pickup recommendations in components.
 * Handles fetching, caching, and state management.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPickupRecommendationFn,
  logRecommendationFeedbackFn,
} from "@/lib/dispatch/pickup-zone-functions";
import type { LatLng, PickupRecommendation } from "@/lib/pickup/types";

export interface UsePickupRecommendationOptions {
  /** Optional: filter recommendations to a specific region */
  region?: string;
  /** Optional: disable automatic fetching */
  enabled?: boolean;
}

/**
 * Hook to get pickup recommendations for a location.
 * Automatically refetches when location changes.
 *
 * @example
 * const { recommendation, isLoading, refetch } = usePickupRecommendation(
 *   { lat: -25.518, lng: 28.1 },
 *   { region: 'gauteng' }
 * );
 *
 * if (recommendation?.hasSuggestion) {
 *   // Show recommendation to user
 * }
 */
export function usePickupRecommendation(
  location: LatLng | null,
  options: UsePickupRecommendationOptions = {},
) {
  const { region, enabled = true } = options;

  const query = useQuery({
    queryKey: ["pickup-recommendation", location?.lat, location?.lng, region],
    queryFn: async () => {
      if (!location) return null;
      return await getPickupRecommendationFn({
        data: {
          location,
          region,
        },
      });
    },
    enabled: enabled && location !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const logFeedback = useMutation({
    mutationFn: (feedback: {
      chosenLocation: LatLng;
      recommendedZoneId: string | null;
      accepted: boolean | null;
    }) => logRecommendationFeedbackFn({ data: feedback }),
  });

  return {
    recommendation: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    logFeedback: logFeedback.mutate,
  };
}

/**
 * Hook to log recommendation feedback (analytics).
 * Tracks whether users accepted recommendations.
 */
export function useLogPickupFeedback() {
  return useMutation({
    mutationFn: (feedback: {
      chosenLocation: LatLng;
      recommendedZoneId: string | null;
      accepted: boolean | null;
    }) => logRecommendationFeedbackFn({ data: feedback }),
  });
}
