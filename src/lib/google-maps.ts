/// <reference types="google.maps" />

let loader: Promise<typeof google.maps> | null = null;

const CALLBACK = "__hitchMapsReady";

/** Loads the Google Maps JS API once, in the browser only. */
export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps require a browser"));
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    if (w.google && (w.google as { maps?: unknown }).maps) {
      resolve(google.maps);
      return;
    }
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!key) {
      reject(new Error("Google Maps key missing"));
      return;
    }
    w[CALLBACK] = () => resolve(google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${CALLBACK}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return loader;
}

/**
 * Google's `styles` array silently disables tile rendering on the current
 * JS API version, so theming uses the supported colorScheme option instead.
 */
export const mapColorScheme = (theme: "dark" | "light") =>
  (theme === "dark" ? "DARK" : "LIGHT") as unknown as google.maps.ColorScheme;
