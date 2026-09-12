import type { DriverModeState } from "./types";

export function driverModeState(
  online: boolean,
  phase: "idle" | "offer" | "accepted" | "topickup" | "arrived" | "ontrip" | "complete",
): DriverModeState {
  if (!online) return "offline";
  if (phase === "idle") return "available";
  if (phase === "offer") return "offered";
  if (phase === "accepted") return "accepted";
  if (phase === "topickup") return "arriving";
  if (phase === "arrived") return "arrived";
  if (phase === "ontrip") return "on_trip";
  return "completed";
}

export function openPickupNavigation(pickup: { lat: number; lng: number }): void {
  if (typeof window === "undefined") return;
  const destination = `${pickup.lat},${pickup.lng}`;
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
    "_blank",
    "noopener,noreferrer",
  );
}
