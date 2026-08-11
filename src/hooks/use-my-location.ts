import { useCallback, useState } from "react";
import { nearestPlace } from "@/lib/sa-places";

export type LocationState =
  | { status: "idle"; pickup: string | null; error: null }
  | { status: "locating"; pickup: string | null; error: null }
  | { status: "ready"; pickup: string; error: null }
  | { status: "error"; pickup: string | null; error: string };

export function useMyLocation() {
  const [state, setState] = useState<LocationState>({
    status: "idle",
    pickup: null,
    error: null,
  });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "error",
        pickup: null,
        error: "Location isn't supported in this browser.",
      });
      return;
    }
    setState({ status: "locating", pickup: null, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const place = nearestPlace({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (place) {
          setState({ status: "ready", pickup: place, error: null });
        } else {
          setState({
            status: "error",
            pickup: null,
            error: "You're outside our current coverage area.",
          });
        }
      },
      (err) => {
        setState({
          status: "error",
          pickup: null,
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
