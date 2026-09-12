import type { Booking, FavouriteDestination } from "@/lib/domain/types";
import { lookupPlace } from "@/lib/sa-places";
import type { LatLng, RecommendedDestination } from "./types";
import { rankDestinationRecommendations } from "./recommend";

export type DestinationRecommendationInput = {
  bookings: Booking[];
  favourites: FavouriteDestination[];
  savedPlaces?: Array<{ id: string; label: string; coords: LatLng | null }>;
  currentLocation?: LatLng | null;
  now?: Date;
  limit?: number;
};

export type DestinationRecommendationResult = {
  destinations: RecommendedDestination[];
  explanations: Record<string, string>;
};

const RECENTLY_REMOVED_PREFIX = "nt-destination-recommendations-removed";

function destinationKey(location: LatLng): string {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
}

function removedKey(userId: string): string {
  return `${RECENTLY_REMOVED_PREFIX}:${userId}`;
}

function readRemoved(userId: string): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(removedKey(userId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeRemoved(userId: string, removed: Set<string>): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(removedKey(userId), JSON.stringify([...removed]));
}

function asHistory(bookings: Booking[]): Array<{
  dropoffLocation: LatLng;
  dropoffLabel?: string;
  completedAt: Date;
  hourOfDay: number;
  dayOfWeek: string;
  archived: boolean;
  id: string;
  userId: string;
  pickupLocation: LatLng;
}> {
  return bookings
    .filter(
      (booking) =>
        booking.type === "ride" && booking.status === "completed" && booking.dropoffLocation,
    )
    .map((booking) => {
      const completedAt = new Date(booking.completedAt ?? booking.createdAt);
      return {
        id: booking.id,
        userId: booking.userId,
        pickupLocation: booking.pickupLocation ?? { lat: 0, lng: 0 },
        dropoffLocation: booking.dropoffLocation!,
        dropoffLabel: booking.to,
        completedAt,
        hourOfDay: completedAt.getHours(),
        dayOfWeek: completedAt.toLocaleDateString("en-US", { weekday: "long" }),
        archived: false,
      };
    });
}

function asSaved(
  favourites: FavouriteDestination[],
  savedPlaces: DestinationRecommendationInput["savedPlaces"] = [],
) {
  const saved = favourites
    .map((favourite) => {
      const location = lookupPlace(favourite.to);
      if (!location) return null;
      return {
        id: favourite.id,
        userId: favourite.userId,
        label: favourite.label,
        location,
        category: "custom" as const,
        usageCount: 1,
        createdAt: new Date(favourite.createdAt),
        updatedAt: new Date(favourite.createdAt),
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);
  return [
    ...saved,
    ...savedPlaces
      .filter((place): place is typeof place & { coords: LatLng } => place.coords !== null)
      .map((place) => ({
        id: place.id,
        userId: "",
        label: place.label,
        location: place.coords,
        category: "custom" as const,
        usageCount: 1,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      })),
  ];
}

export function getDestinationRecommendations(
  userId: string,
  input: DestinationRecommendationInput,
): DestinationRecommendationResult {
  const now = input.now ?? new Date();
  const removed = readRemoved(userId);
  const history = asHistory(input.bookings).filter(
    (destination) => !removed.has(destinationKey(destination.dropoffLocation)),
  );
  const saved = asSaved(input.favourites, input.savedPlaces).filter(
    (destination) => !removed.has(destinationKey(destination.location)),
  );
  const ranked = rankDestinationRecommendations(saved, history, now.getHours(), {
    maxRecommendations: input.limit ?? 5,
    minVisitsToRecommend: 1,
    currentDayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    currentLocation: input.currentLocation ?? undefined,
  });

  const explanations: Record<string, string> = {};
  for (const destination of ranked) {
    const key = destinationKey(destination.location);
    const reasons: string[] = [];
    if (destination.source === "saved") reasons.push("Saved place");
    if (destination.frequencyRank > 1) reasons.push(`Visited ${destination.frequencyRank} times`);
    if (destination.recencyScore >= 0.7) reasons.push("Used recently");
    if (destination.timeMatchScore >= 0.7) reasons.push("Matches this time");
    explanations[key] = reasons.join(" · ") || "Based on your ride history";
  }

  return { destinations: ranked, explanations };
}

export function removeRecentDestination(userId: string, location: LatLng): void {
  const removed = readRemoved(userId);
  removed.add(destinationKey(location));
  writeRemoved(userId, removed);
}

export function clearRemovedDestinations(userId: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(removedKey(userId));
}

export function destinationRecommendationsEnabled(userId: string): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(`${RECENTLY_REMOVED_PREFIX}-disabled:${userId}`) !== "true";
}

export function setDestinationRecommendationsEnabled(userId: string, enabled: boolean): void {
  if (typeof localStorage === "undefined") return;
  if (enabled) localStorage.removeItem(`${RECENTLY_REMOVED_PREFIX}-disabled:${userId}`);
  else localStorage.setItem(`${RECENTLY_REMOVED_PREFIX}-disabled:${userId}`, "true");
}
