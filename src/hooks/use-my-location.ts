import { useCallback, useState } from "react";
import type { LatLng } from "@/lib/sa-places";

export type LocationState =
  | { status: "idle"; place: string | null; coords: LatLng | null; error: null }
  | { status: "locating"; place: string | null; coords: LatLng | null; error: null }
  | { status: "ready"; place: string; coords: LatLng; error: null }
  | { status: "error"; place: string | null; coords: LatLng | null; error: string };

export function useMyLocation() {
  const [state, setState] = useState<LocationState>({
    status: "idle",
    place: null,
    coords: null,
    error: null,
  });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "error",
        place: null,
        coords: null,
        error: "Location isn't supported in this browser.",
      });
      return;
    }
    setState((s) => ({ ...s, status: "locating", error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setState({
          status: "ready",
          place: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
          coords,
          error: null,
        });
      },
      (err) => {
        setState({
          status: "error",
          place: null,
          coords: null,
          error:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied — enter your pickup manually."
              : "Couldn't detect your location — enter your pickup manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  return { state, locate };
}
