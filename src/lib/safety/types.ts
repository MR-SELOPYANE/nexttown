export type RideEventType =
  | "RIDE_REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ACCEPTED"
  | "DRIVER_ARRIVED"
  | "TRIP_STARTED"
  | "TRIP_COMPLETED"
  | "RIDE_CANCELLED"
  | "PICKUP_CONFIRMED"
  | "SOS_REQUESTED";

export type RideEvent = {
  id: string;
  bookingId: string;
  actorId: string;
  type: RideEventType;
  occurredAt: number;
  metadata?: Record<string, string | number | boolean>;
};

export type SafetyIncidentKind = "sos" | "suspicious_activity" | "support_report";

export type SafetyIncident = {
  id: string;
  bookingId?: string;
  reporterId: string;
  kind: SafetyIncidentKind;
  message: string;
  location?: { lat: number; lng: number };
  createdAt: number;
  status: "open" | "acknowledged" | "resolved";
};

export type TripShare = {
  id: string;
  bookingId: string;
  ownerId: string;
  shareToken: string;
  createdAt: number;
  expiresAt: number;
  revokedAt?: number;
};
