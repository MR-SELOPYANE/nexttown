import type { Driver, DriverLocation, DriverStatus, LatLng } from "@/lib/ride/types";

export type DriverMeta = Pick<
  Driver,
  "name" | "car" | "plate" | "rating" | "trips" | "phone" | "identityVerified" | "vehicleVerified"
>;

export function buildDriver(meta: DriverMeta, id: string, location: LatLng | null): Driver {
  const driverLocation: DriverLocation | null = location
    ? {
        ...location,
        heading: 0,
        status: "available",
        speedKmh: 0,
        updatedAt: Date.now(),
      }
    : null;
  return { ...meta, id, location: driverLocation };
}

export function driverStatusForMode(
  online: boolean,
  state:
    | "offline"
    | "available"
    | "offered"
    | "accepted"
    | "arriving"
    | "arrived"
    | "on_trip"
    | "completed",
): DriverStatus {
  if (!online || state === "offline") return "offline";
  if (state === "on_trip") return "ontrip";
  if (state === "arrived") return "arrived";
  if (state === "arriving" || state === "accepted") return "enroute";
  if (state === "completed") return "completed";
  return "available";
}
