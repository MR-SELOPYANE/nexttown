import type { LatLng as GeoLatLng } from "@/lib/sa-places";
import type { RouteInfo as DirectionsRouteInfo } from "@/lib/google-maps";

/** A coordinate on the globe. Re-exported so the ride domain has a single type surface. */
export type LatLng = GeoLatLng;

/** Road-following route info (decoded polyline + distance/duration). */
export type RouteInfo = DirectionsRouteInfo;

/** Current operational state of a driver. */
export type DriverStatus = "offline" | "available" | "enroute" | "arrived" | "ontrip" | "completed";

/**
 * A single reported driver position.
 *
 * This is the *only* source of truth the map renders from. It should be
 * produced by a real location channel (socket/poll/GPS feed), never by
 * interpolating a progress fraction inside the map itself.
 */
export type DriverLocation = {
  lat: number;
  lng: number;
  /** Compass heading in degrees (0–360, clockwise from north). */
  heading: number;
  status: DriverStatus;
  speedKmh: number;
  /** Epoch ms when this position was reported. */
  updatedAt: number;
  /** Reported positional accuracy in meters, when known. */
  accuracyM?: number;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  /** Display vehicle summary, e.g. "VW Polo · Silver". */
  car: string;
  plate: string;
  rating: number;
  trips: number;
  /** Latest known position. `null` until the driver is located. */
  location: DriverLocation | null;
  identityVerified?: boolean;
  vehicleVerified?: boolean;
};

export type RideStop = { label: string; location: LatLng };

/**
 * High-level ride lifecycle. Flows keep their own UI phase machines and
 * mirror them into this state — the map never drives these transitions.
 */
export type RideState =
  "searching" | "matching" | "assigned" | "arrived" | "ontrip" | "completed" | "cancelled";

/** Which leg of the ride the active driver is currently performing. */
export type RideLeg = "to_pickup" | "to_dropoff";

/** Where the displayed ETA came from — real routed value or a fallback estimate. */
export type EtaSource = "route" | "estimate" | "none";

/**
 * Presentation metadata carried alongside the numeric ETA so the UI can
 * surface loading / stale / fallback states without re-deriving routes.
 */
export type EtaPresentation = {
  /** `"route"` = Google routing, `"estimate"` = distance fallback, `"none"` = unknown. */
  source: EtaSource;
  /** True while a routed value is still being resolved. */
  loading: boolean;
  /** True when the routed value is older than the stale threshold. */
  stale: boolean;
  /** True when the last routing request failed and a fallback estimate was used. */
  error: boolean;
};

/** Immutable-ish snapshot of everything the map (and status UI) needs to render a ride. */
export type Ride = {
  id: string;
  ref?: string;
  state: RideState;
  pickup: LatLng;
  dropoff: LatLng;
  stops: LatLng[];
  pickupLabel: string;
  dropoffLabel: string;
  stopLabels: string[];
  activeDriver: Driver | null;
  nearbyDrivers: Driver[];
  /** Dynamic ETA in minutes for the current leg (route-based via the ETA service). */
  etaMin: number | null;
  /** Metadata for the ETA value in `etaMin` (loading/stale/fallback). */
  eta: EtaPresentation;
  /** Distance of the current leg's route in km. */
  distanceKm: number;
  startedAt: number | null;
  createdAt: number;
};

/**
 * Contract for any provider of live driver positions (WebSocket, server-sent
 * events, polling, native GPS bridge). A demo implementation ships in
 * `driver-feed.ts`; production swaps in a real transport without touching the
 * map or the ride reducer.
 */
export type DriverLocationSource = {
  subscribe(onLocation: (loc: DriverLocation) => void): () => void;
  getCurrent(): DriverLocation | null;
};
