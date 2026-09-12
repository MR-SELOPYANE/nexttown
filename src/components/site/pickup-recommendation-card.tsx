/**
 * SMART PICKUP RECOMMENDATION MODAL
 * --------------------------------------------------------------------------
 * Presents a passenger with a recommendation to use a better-known pickup
 * point (gate, entrance, rank, etc.) instead of their raw GPS coordinate.
 *
 * If a better point is nearby, shows it clearly with context ("TUT South Campus
 * Main Gate" instead of GPS-detected coordinates inside campus). The passenger
 * can accept the recommendation or keep their original choice; we don't force it.
 *
 * UX: Modeless card, non-blocking, dismissible, with optional analytics feedback.
 */

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronRight, CheckCircle2, AlertCircle, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPickupRecommendationFn,
  logRecommendationFeedbackFn,
} from "@/lib/dispatch/pickup-zone-functions";
import type { LatLng, PickupRecommendation, RankedPickupZone } from "@/lib/pickup/types";

export interface PickupRecommendationCardProps {
  /** The location the passenger chose (GPS point). */
  location: LatLng | null;
  /** Optional label for the chosen location (e.g. "GPS detected"). */
  locationLabel?: string;
  /** Optional: filter recommendations to a specific region. */
  region?: string;
  /** Fired when passenger confirms the recommendation. */
  onAccept?: (zone: RankedPickupZone) => void;
  /** Fired when passenger dismisses the recommendation or clicks their original point. */
  onReject?: (location: LatLng) => void;
  /** Optional callback for closing the card. */
  onDismiss?: () => void;
  /** Show skeleton/loading state. */
  loading?: boolean;
}

/**
 * The recommendation card itself. Typically rendered in a pickup/booking flow
 * after a passenger selects a location on the map.
 */
export function PickupRecommendationCard({
  location,
  locationLabel = "Your location",
  region,
  onAccept,
  onReject,
  onDismiss,
  loading = false,
}: PickupRecommendationCardProps) {
  const [recommendation, setRecommendation] = useState<PickupRecommendation | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Fetch recommendation from server
  const { mutate: fetchRecommendation, isPending: isFetching } = useMutation({
    mutationFn: async (loc: LatLng) => {
      const rec = await getPickupRecommendationFn({
        data: { location: loc, locationLabel, region },
      });
      return rec;
    },
    onSuccess: (rec) => {
      if (rec) {
        setRecommendation(rec);
        setDismissed(false);
        setSelectedZoneId(null);
      }
    },
  });

  // Log feedback (accept/reject)
  const { mutate: logFeedback } = useMutation({
    mutationFn: (feedback: {
      chosenLocation: LatLng;
      recommendedZoneId: string | null;
      accepted: boolean | null;
    }) => logRecommendationFeedbackFn({ data: feedback }),
  });

  // Refetch when location changes
  useEffect(() => {
    if (location && !dismissed) {
      fetchRecommendation(location);
    }
  }, [location, dismissed, fetchRecommendation]);

  if (!location || dismissed) return null;

  const isLoading = isFetching || loading;
  const hasRecommendation = recommendation?.hasSuggestion && recommendation.zones.length > 0;
  const topRecommendation = recommendation?.zones[0];

  return (
    <div className="w-full max-w-md space-y-3 p-4 rounded-lg border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/50 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {isLoading ? (
            <div className="size-5 rounded-full bg-amber-300/30 animate-pulse" />
          ) : hasRecommendation ? (
            <CheckCircle2 className="size-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-amber-950">
              {isLoading ? "Finding nearby pickup pointsâ€¦" : "Recommended pickup"}
            </h3>
            {!isLoading && (
              <p className="text-xs text-amber-800/70 mt-0.5">
                {hasRecommendation
                  ? "We found a better pickup location nearby"
                  : "Your chosen location works great"}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
            logFeedback({
              chosenLocation: location,
              recommendedZoneId: topRecommendation?.zone.id ?? null,
              accepted: null,
            });
          }}
          className="p-1 hover:bg-amber-200/30 rounded-md transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="size-4 text-amber-700" />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingState />}

      {/* No recommendation state */}
      {!isLoading && !hasRecommendation && recommendation && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-white/40 border border-amber-100/50">
            <MapPin className="size-4 text-amber-700 shrink-0" />
            <span className="text-sm text-amber-950">{locationLabel}</span>
          </div>
          <p className="text-xs text-amber-800/60">No better alternatives nearby</p>
        </div>
      )}

      {/* Recommendation options */}
      {!isLoading && hasRecommendation && topRecommendation && (
        <div className="space-y-2.5">
          {/* Recommended zone */}
          <button
            onClick={() => setSelectedZoneId(topRecommendation.zone.id)}
            className={cn(
              "w-full p-3 rounded-md border transition-all text-left",
              selectedZoneId === topRecommendation.zone.id
                ? "border-green-400 bg-green-50/60"
                : "border-amber-200/70 bg-white/40 hover:bg-white/60",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-amber-950 line-clamp-1">
                  {topRecommendation.zone.name}
                </div>
                <div className="text-xs text-amber-800/70 mt-1 line-clamp-2">
                  {topRecommendation.description}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 font-medium">
                    {formatPlaceType(topRecommendation.zone.placeType)}
                  </span>
                  <span>
                    {topRecommendation.distanceKm < 1
                      ? `${Math.round(topRecommendation.distanceKm * 1000)}m`
                      : `${topRecommendation.distanceKm.toFixed(1)}km`}
                  </span>
                </div>
              </div>
              {selectedZoneId === topRecommendation.zone.id && (
                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
              )}
            </div>
          </button>

          {/* Original location option */}
          <button
            onClick={() => setSelectedZoneId(null)}
            className={cn(
              "w-full p-3 rounded-md border transition-all text-left",
              selectedZoneId === null
                ? "border-blue-400 bg-blue-50/60"
                : "border-amber-200/70 bg-white/40 hover:bg-white/60",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-amber-950">{locationLabel}</div>
                <div className="text-xs text-amber-800/70 mt-1">
                  Pickup at your selected location
                </div>
              </div>
              {selectedZoneId === null && (
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
              )}
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (selectedZoneId) {
                  const zone = recommendation.zones.find((z) => z.zone.id === selectedZoneId);
                  if (zone) {
                    onAccept?.(zone);
                    logFeedback({
                      chosenLocation: location,
                      recommendedZoneId: selectedZoneId,
                      accepted: true,
                    });
                  }
                } else {
                  onReject?.(location);
                  logFeedback({
                    chosenLocation: location,
                    recommendedZoneId: topRecommendation.zone.id,
                    accepted: false,
                  });
                }
                setDismissed(true);
              }}
            >
              <span>Confirm</span>
              <ChevronRight className="size-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for the recommendation card.
 */
function LoadingState() {
  return (
    <div className="space-y-2">
      <div className="h-10 bg-amber-200/20 rounded-md animate-pulse" />
      <div className="h-8 bg-amber-200/20 rounded-md animate-pulse" />
    </div>
  );
}

/**
 * Format a place type for display to humans.
 */
function formatPlaceType(placeType?: string): string {
  if (!placeType) return "Pickup Point";
  return placeType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default PickupRecommendationCard;
