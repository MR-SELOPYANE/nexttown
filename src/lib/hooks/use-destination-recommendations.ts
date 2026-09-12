/**
 * DESTINATION RECOMMENDATIONS â€” REACT HOOKS
 * --------------------------------------------------------------------------
 * React Query hooks for client-side access to destination recommendations.
 * All hooks use server functions which enforce RLS at the database level.
 */

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DestinationRecommendation,
  DestinationRecommendationRequest,
  SavedDestination,
  UpsertSavedDestinationRequest,
  LatLng,
  RecommendationFeedback,
} from "../destinations/types";
import {
  getDestinationRecommendationsFn,
  listSavedDestinationsFn,
  upsertSavedDestinationFn,
  deleteSavedDestinationFn,
  logRideDestinationFn,
  clearRideHistoryFn,
  logRecommendationFeedbackFn,
} from "../dispatch/destination-functions";

/**
 * Query key factory for destination queries.
 */
export const destinationQueryKeys = {
  all: () => ["destinations"],
  recommendations: (request?: DestinationRecommendationRequest) => [
    ...destinationQueryKeys.all(),
    "recommendations",
    request,
  ],
  saved: () => [...destinationQueryKeys.all(), "saved"],
  stats: () => [...destinationQueryKeys.all(), "stats"],
};

/**
 * Fetch destination recommendations.
 *
 * Example:
 *   const { data, isLoading } = useDestinationRecommendations({
 *     limit: 5,
 *     includeSaved: true,
 *   });
 */
export function useDestinationRecommendations(request?: DestinationRecommendationRequest) {
  return useQuery<DestinationRecommendation>({
    queryKey: destinationQueryKeys.recommendations(request),
    queryFn: () => getDestinationRecommendationsFn({ data: request || {} }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
  });
}

/**
 * Fetch saved destinations.
 *
 * Example:
 *   const { data = [] } = useSavedDestinations();
 */
export function useSavedDestinations() {
  return useQuery<SavedDestination[]>({
    queryKey: destinationQueryKeys.saved(),
    queryFn: () => listSavedDestinationsFn({ data: {} }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Mutation to create or update a saved destination.
 *
 * Example:
 *   const mutation = useUpsertSavedDestination();
 *   mutation.mutate({
 *     label: "Work",
 *     location: { lat: -25.5, lng: 28.0 },
 *     category: "work",
 *     iconEmoji: "ðŸ’¼",
 *   });
 */
export function useUpsertSavedDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertSavedDestinationRequest) =>
      upsertSavedDestinationFn({ data: request }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.saved() });
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.recommendations() });
    },
  });
}

/**
 * Mutation to delete a saved destination.
 *
 * Example:
 *   const mutation = useDeleteSavedDestination();
 *   mutation.mutate(destinationId);
 */
export function useDeleteSavedDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavedDestinationFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.saved() });
    },
  });
}

/**
 * Mutation to log a completed ride (for history tracking).
 *
 * Example:
 *   const mutation = useLogRideDestination();
 *   mutation.mutate({
 *     pickupLocation: { lat: -25.5, lng: 28.0 },
 *     dropoffLocation: { lat: -25.6, lng: 28.1 },
 *     dropoffLabel: "Mall of Africa",
 *     tripDistanceKm: 15.2,
 *     tripDurationMin: 25,
 *   });
 */
export function useLogRideDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      pickupLocation: LatLng;
      dropoffLocation: LatLng;
      dropoffLabel?: string;
      tripDistanceKm?: number;
      tripDurationMin?: number;
      vehicleClass?: string;
      rating?: number;
      notes?: string;
    }) => logRideDestinationFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.recommendations() });
    },
  });
}

/**
 * Mutation to clear all ride history (destructive).
 * Requires explicit confirmation.
 *
 * Example:
 *   const mutation = useClearRideHistory();
 *   mutation.mutate(true); // Pass true to confirm
 */
export function useClearRideHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirm: boolean) => clearRideHistoryFn({ data: { confirm } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.recommendations() });
      queryClient.invalidateQueries({ queryKey: destinationQueryKeys.saved() });
    },
  });
}

/**
 * Mutation to log feedback on a recommendation.
 * Non-critical (doesn't throw errors).
 *
 * Example:
 *   const mutation = useLogRecommendationFeedback();
 *   mutation.mutate({
 *     recommendedLocation: { lat: -25.5, lng: 28.0 },
 *     recommendedLabel: "Work",
 *     shown: true,
 *     clicked: true,
 *     usedInBooking: true,
 *   });
 */
export function useLogRecommendationFeedback() {
  return useMutation({
    mutationFn: (feedback: RecommendationFeedback) =>
      logRecommendationFeedbackFn({ data: feedback }),
  });
}

/**
 * High-level hook for managing destination recommendations workflow.
 * Combines fetching, feedback logging, and state management.
 *
 * Example:
 *   const {
 *     destination,
 *     isLoading,
 *     onSelect,
 *     onDismiss,
 *   } = useDestinationSelectionFlow({
 *     onSelected: (dest) => setBookingDestination(dest),
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   if (!destination) return <NoRecommendations />;
 *
 *   return (
 *     <DestinationCard
 *       destination={destination}
 *       onSelect={onSelect}
 *       onDismiss={onDismiss}
 *     />
 *   );
 */
export function useDestinationSelectionFlow(options?: {
  onSelected?: (destination: SavedDestination | { location: LatLng; label?: string }) => void;
  onDismissed?: () => void;
  request?: DestinationRecommendationRequest;
}) {
  const recommendationsQuery = useDestinationRecommendations(options?.request);
  const logFeedback = useLogRecommendationFeedback();

  const recommendations = recommendationsQuery.data?.destinations || [];
  const currentDestinationIndex = 0; // Could be extended for carousel

  const currentDestination = recommendations[currentDestinationIndex];

  const onSelect = useCallback(
    (destination: (typeof recommendations)[0]) => {
      // Log positive feedback
      logFeedback.mutate({
        recommendedLocation: destination.location,
        recommendedLabel: destination.label,
        shown: true,
        clicked: true,
        usedInBooking: true,
      });

      options?.onSelected?.({
        location: destination.location,
        label: destination.label,
      });
    },
    [logFeedback, options],
  );

  const onDismiss = useCallback(() => {
    if (currentDestination) {
      logFeedback.mutate({
        recommendedLocation: currentDestination.location,
        recommendedLabel: currentDestination.label,
        shown: true,
        clicked: false,
        usedInBooking: false,
      });
    }
    options?.onDismissed?.();
  }, [currentDestination, logFeedback, options]);

  return {
    destination: currentDestination,
    destinations: recommendations,
    isLoading: recommendationsQuery.isLoading,
    error: recommendationsQuery.error,
    hasEnoughData: recommendationsQuery.data?.hasEnoughData ?? false,
    onSelect,
    onDismiss,
  };
}
