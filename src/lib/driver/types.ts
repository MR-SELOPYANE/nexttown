import type { LatLng } from "@/lib/ride/types";

export type DriverModeState =
  | "offline"
  | "available"
  | "offered"
  | "accepted"
  | "arriving"
  | "arrived"
  | "on_trip"
  | "completed";

export type DriverRideOffer = {
  id: string;
  pickupArea: string;
  destinationArea?: string;
  pickup: LatLng;
  dropoff: LatLng;
  estimatedDistanceKm: number;
  estimatedTimeMin: number;
  estimatedEarnings: number;
  rideType: string;
};

export const DRIVER_STATE_LABELS: Record<DriverModeState, string> = {
  offline: "Offline",
  available: "Available for trips",
  offered: "New ride offer",
  accepted: "Ride accepted",
  arriving: "Arriving at pickup",
  arrived: "Arrived at pickup",
  on_trip: "Trip in progress",
  completed: "Trip completed",
};
