import { useState } from "react";
import { ChevronRight, Clock3, MapPin, X } from "lucide-react";
import type { Booking } from "@/lib/domain/types";
import { useBookings, useFavourites } from "@/lib/hooks/queries";
import type { LatLng } from "@/lib/sa-places";
import {
  destinationRecommendationsEnabled,
  getDestinationRecommendations,
  removeRecentDestination,
  setDestinationRecommendationsEnabled,
} from "@/lib/destinations/recommendation-service";

type SavedPlace = { id: string; label: string; coords: LatLng | null };

type Props = {
  userId: string;
  currentLocation?: LatLng | null;
  savedPlaces?: SavedPlace[];
  onSelect: (location: LatLng, label: string) => void;
};

export function DestinationSuggestionsPanel({
  userId,
  currentLocation,
  savedPlaces = [],
  onSelect,
}: Props) {
  const { data: bookings = [] } = useBookings(userId);
  const { data: favourites = [] } = useFavourites(userId);
  const [removedVersion, setRemovedVersion] = useState(0);
  const [enabled, setEnabled] = useState(() => destinationRecommendationsEnabled(userId));

  void removedVersion;
  const result = getDestinationRecommendations(userId, {
    bookings: bookings as Booking[],
    favourites,
    savedPlaces,
    currentLocation,
    limit: 5,
  });

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => {
          setDestinationRecommendationsEnabled(userId, true);
          setEnabled(true);
        }}
        className="text-[11px] text-muted-foreground hover:text-foreground"
      >
        Destination suggestions are off · Turn on
      </button>
    );
  }

  if (result.destinations.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-3 space-y-2"
      aria-label="Destination suggestions"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Suggested destinations
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Based on your saved places and completed rides
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setDestinationRecommendationsEnabled(userId, false);
            setEnabled(false);
          }}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Turn off
        </button>
      </div>
      <div className="space-y-1">
        {result.destinations.map((destination) => {
          const key = `${destination.location.lat.toFixed(4)},${destination.location.lng.toFixed(4)}`;
          return (
            <div
              key={`${key}-${destination.label ?? "destination"}`}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => onSelect(destination.location, destination.label ?? "Destination")}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-foreground/[0.06]"
              >
                <MapPin className="size-4 shrink-0 text-brand-light" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {destination.label ?? "Saved destination"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="size-3" /> {result.explanations[key]}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
              <button
                type="button"
                aria-label={`Remove ${destination.label ?? "destination"}`}
                onClick={() => {
                  removeRecentDestination(userId, destination.location);
                  setRemovedVersion((version) => version + 1);
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
