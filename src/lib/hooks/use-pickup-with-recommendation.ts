/**
 * PICKUP RECOMMENDATION INTEGRATION HELPER
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Ready-to-use hook that manages the full pickup recommendation lifecycle
 * for integration into booking flows.
 *
 * Usage in a booking component:
 *
 *   const pickup = usePickupWithRecommendation(
 *     geocodedFrom,
 *     (zone) => {
 *       // User accepted recommendation
 *       setGeocodedFrom(zone.zone.entrance);
 *     }
 *   );
 *
 *   return (
 *     <PickupRecommendationCard
 *       location={pickup.location}
 *       onAccept={pickup.onAccept}
 *       onReject={pickup.onReject}
 *       {...}
 *     />
 *   );
 */

import { useState, useCallback } from "react";
import { usePickupRecommendation } from "./use-pickup-recommendation";
import type { LatLng, RankedPickupZone, PickupRecommendation } from "../pickup/types";

export interface UsePickupWithRecommendationOptions {
  /** Optional: filter to a specific region */
  region?: string;
  /** Callback when user accepts a recommendation */
  onAcceptRecommendation?: (zone: RankedPickupZone) => void;
  /** Callback when user rejects a recommendation */
  onRejectRecommendation?: (location: LatLng) => void;
}

export interface PickupWithRecommendation {
  location: LatLng | null;
  locationLabel: string;
  recommendation: PickupRecommendation | null;
  isLoading: boolean;
  onAccept: (zone: RankedPickupZone) => void;
  onReject: (location: LatLng) => void;
  setLocation: (location: LatLng | null, label?: string) => void;
}

/**
 * Comprehensive hook for handling pickup location with recommendations.
 * Manages state and callbacks for the entire pickup flow.
 */
export function usePickupWithRecommendation(
  initialLocation: LatLng | null,
  options: UsePickupWithRecommendationOptions = {},
): PickupWithRecommendation {
  const [location, setLocationState] = useState<LatLng | null>(initialLocation);
  const [locationLabel, setLocationLabel] = useState("Your location");

  const { recommendation, isLoading } = usePickupRecommendation(location, {
    region: options.region,
  });

  const handleAccept = useCallback(
    (zone: RankedPickupZone) => {
      // Update location to the zone's entrance
      setLocationState(zone.zone.entrance);
      setLocationLabel(zone.zone.name);
      options.onAcceptRecommendation?.(zone);
    },
    [options],
  );

  const handleReject = useCallback(
    (rejectedLocation: LatLng) => {
      // Keep the original location, just dismiss the recommendation
      options.onRejectRecommendation?.(rejectedLocation);
    },
    [options],
  );

  const setLocation = useCallback((newLocation: LatLng | null, label?: string) => {
    setLocationState(newLocation);
    if (label) {
      setLocationLabel(label);
    }
  }, []);

  return {
    location,
    locationLabel,
    recommendation,
    isLoading,
    onAccept: handleAccept,
    onReject: handleReject,
    setLocation,
  };
}
