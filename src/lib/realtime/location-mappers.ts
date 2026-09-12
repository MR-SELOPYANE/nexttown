import type { Driver, DriverLocation, DriverLocationSource, DriverStatus } from "@/lib/ride/types";
import { DEMO_DRIVER } from "./session";

/**
 * DRIVER-LOCATION MAPPERS
 * ------------------------------------------------------------------
 * Translates between the Supabase `driver_locations` row shape and the ride
 * domain's `DriverLocation` (single source of truth for the map), and between
 * the DB `public.driver_status` enum and the app `DriverStatus` enum.
 *
 * MAPPING (DB enum -> app enum)
 *   offline    -> offline
 *   available  -> available
 *   reserved   -> enroute
 *   arriving   -> enroute
 *   arrived    -> arrived
 *   on_trip    -> ontrip
 *
 * A job that is considered done is stored back as `offline`, so completed
 * drivers are hidden from passengers (RLS `SELECT ... status <> 'offline'`).
 */

/** The exact liberated shape Supabase returns for `driver_locations` rows. */
export type DriverLocationRow = {
  driver_id: string;
  status: public_driver_status | null | undefined;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed_kmh: number | null;
  accuracy_m: number | null;
  device_ts: string | null;
  updated_at: string | null;
};

export type public_driver_status =
  "offline" | "available" | "reserved" | "arriving" | "arrived" | "on_trip";

const DB_TO_APP_STATUS: Record<public_driver_status, DriverStatus> = {
  offline: "offline",
  available: "available",
  reserved: "enroute",
  arriving: "enroute",
  arrived: "arrived",
  on_trip: "ontrip",
};

const APP_TO_DB_STATUS: Record<DriverStatus, public_driver_status> = {
  offline: "offline",
  available: "available",
  enroute: "reserved",
  arrived: "arrived",
  ontrip: "on_trip",
  completed: "offline",
};

export function dbStatusToDriverStatus(db?: public_driver_status | null): DriverStatus {
  if (!db) return "offline";
  return DB_TO_APP_STATUS[db] ?? "offline";
}

export function driverStatusToDb(status: DriverStatus): public_driver_status {
  return APP_TO_DB_STATUS[status] ?? "offline";
}

/**
 * Row -> DriverLocation. `updated_at` is the DB write time (what diffing and
 * staleness care about); falls back to `device_ts` / Date.now().
 */
export function rowToDriverLocation(row: DriverLocationRow): DriverLocation {
  const updatedAt = row.updated_at
    ? new Date(row.updated_at).getTime()
    : row.device_ts
      ? new Date(row.device_ts).getTime()
      : Date.now();
  return {
    lat: row.latitude,
    lng: row.longitude,
    heading: row.heading ?? 0,
    status: dbStatusToDriverStatus(row.status),
    speedKmh: row.speed_kmh ?? 0,
    updatedAt,
    accuracyM: row.accuracy_m ?? undefined,
  };
}

/** Construct a LocationSource that replays from a given callback. */
export function makeDriverLocationSource(
  subscribe: (onLocation: (loc: DriverLocation) => void) => () => void,
  getCurrent: () => DriverLocation | null,
): DriverLocationSource {
  return { subscribe, getCurrent };
}

/** Parse an ISO timestamp string to epoch ms safely (NaN when null/empty). */
export function isoToEpoch(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/**
 * GpsFix -> DriverLocation (local echo path). The driver's own console feeds
 * its device GPS into the same ride shape the map renders, so driver and
 * passenger screens behave identically.
 */
export function gpsFixToDriverLocation(
  fix: {
    lat: number;
    lng: number;
    heading: number;
    speedKmh: number;
    accuracyM: number;
    timestamp: number;
  },
  status: DriverStatus,
): DriverLocation {
  return {
    lat: fix.lat,
    lng: fix.lng,
    heading: fix.heading,
    status,
    speedKmh: fix.speedKmh,
    updatedAt: fix.timestamp,
    accuracyM: fix.accuracyM,
  };
}

/** Minimal identity used for live drivers until a profiles table exists. */
export const LIVE_DRIVER_META = {
  name: DEMO_DRIVER.name,
  car: DEMO_DRIVER.car,
  plate: DEMO_DRIVER.plate,
  rating: DEMO_DRIVER.rating,
  trips: DEMO_DRIVER.trips,
  phone: DEMO_DRIVER.phone,
};

/** Row -> Driver for the nearby-drivers pool and assigned-driver fallback. */
export function rowToDriver(
  row: DriverLocationRow,
  meta: {
    name: string;
    car: string;
    plate: string;
    rating: number;
    trips: number;
    phone: string;
  } = LIVE_DRIVER_META,
): Driver {
  return {
    id: row.driver_id,
    name: meta.name,
    car: meta.car,
    plate: meta.plate,
    rating: meta.rating,
    trips: meta.trips,
    phone: meta.phone,
    location: rowToDriverLocation(row),
  };
}
