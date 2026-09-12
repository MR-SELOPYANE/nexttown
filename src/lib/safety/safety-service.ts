import { loadJson, saveJson, storageKey, uid } from "@/lib/services/core";
import type {
  RideEvent,
  RideEventType,
  SafetyIncident,
  SafetyIncidentKind,
  TripShare,
} from "./types";

const eventsKey = (userId: string, bookingId: string) =>
  storageKey("safety", userId, bookingId, "events");
const incidentsKey = (userId: string) => storageKey("safety", userId, "incidents");
const sharesKey = (userId: string) => storageKey("safety", userId, "shares");

function readEvents(userId: string, bookingId: string): RideEvent[] {
  return loadJson<RideEvent[]>(eventsKey(userId, bookingId), []);
}

export const SafetyService = {
  recordRideEvent(
    userId: string,
    bookingId: string,
    type: RideEventType,
    metadata?: RideEvent["metadata"],
  ): RideEvent {
    const events = readEvents(userId, bookingId);
    if (events.some((event) => event.type === type)) {
      return events.find((event) => event.type === type)!;
    }
    const event: RideEvent = {
      id: uid(),
      bookingId,
      actorId: userId,
      type,
      occurredAt: Date.now(),
      metadata,
    };
    saveJson(eventsKey(userId, bookingId), [...events, event]);
    return event;
  },

  listRideEvents(userId: string, bookingId: string): RideEvent[] {
    return readEvents(userId, bookingId).sort((a, b) => a.occurredAt - b.occurredAt);
  },

  createIncident(
    reporterId: string,
    kind: SafetyIncidentKind,
    message: string,
    options: { bookingId?: string; location?: { lat: number; lng: number } } = {},
  ): SafetyIncident {
    const incident: SafetyIncident = {
      id: uid(),
      reporterId,
      kind,
      message: message.trim(),
      bookingId: options.bookingId,
      location: options.location,
      createdAt: Date.now(),
      status: "open",
    };
    const incidents = loadJson<SafetyIncident[]>(incidentsKey(reporterId), []);
    saveJson(incidentsKey(reporterId), [incident, ...incidents]);
    return incident;
  },

  listIncidents(reporterId: string): SafetyIncident[] {
    return loadJson<SafetyIncident[]>(incidentsKey(reporterId), []);
  },

  createTripShare(ownerId: string, bookingId: string, ttlMs = 24 * 60 * 60 * 1000): TripShare {
    const share: TripShare = {
      id: uid(),
      bookingId,
      ownerId,
      shareToken: uid(),
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    const shares = loadJson<TripShare[]>(sharesKey(ownerId), []);
    saveJson(sharesKey(ownerId), [share, ...shares]);
    return share;
  },

  revokeTripShare(ownerId: string, shareId: string): void {
    const shares = loadJson<TripShare[]>(sharesKey(ownerId), []);
    saveJson(
      sharesKey(ownerId),
      shares.map((share) => (share.id === shareId ? { ...share, revokedAt: Date.now() } : share)),
    );
  },
};
