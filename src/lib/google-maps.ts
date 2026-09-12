/// <reference types="google.maps" />

let loader: Promise<typeof google.maps> | null = null;

const CALLBACK = "__nextTownMapsReady";

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${CALLBACK}&libraries=geometry,places`;
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

/* ------------------------------------------------------------------ */
/*  Polyline decoder (Google encoded polyline algorithm)              */
/* ------------------------------------------------------------------ */

export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/* ------------------------------------------------------------------ */
/*  Directions API helper                                             */
/* ------------------------------------------------------------------ */

export type RouteInfo = {
  /** Decoded road-following polyline points */
  points: { lat: number; lng: number }[];
  /** Total road distance in km */
  distanceKm: number;
  /** Total driving duration in minutes */
  durationMin: number;
  /** Distance text like "42.3 km" */
  distanceText: string;
  /** Duration text like "38 mins" */
  durationText: string;
};

/**
 * Fetch driving directions between origin and destination via the
 * Google Directions API.  Returns the decoded polyline and summary info.
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: { lat: number; lng: number }[],
): Promise<RouteInfo> {
  const maps = await loadGoogleMaps();

  const request: google.maps.DirectionsRequest = {
    origin: new maps.LatLng(origin.lat, origin.lng),
    destination: new maps.LatLng(destination.lat, destination.lng),
    travelMode: google.maps.TravelMode.DRIVING,
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: google.maps.TrafficModel.BEST_GUESS,
    },
  };

  if (waypoints && waypoints.length > 0) {
    request.waypoints = waypoints.map((wp) => ({
      location: new maps.LatLng(wp.lat, wp.lng),
      stopover: true,
    }));
  }

  const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
    new google.maps.DirectionsService().route(request, (res, status) => {
      if (status === google.maps.DirectionsStatus.OK && res) resolve(res);
      else reject(new Error(`Directions failed: ${status}`));
    });
  });

  const route = result.routes[0];
  if (!route) throw new Error("No route found");

  const leg = route.legs[0];
  const points: { lat: number; lng: number }[] = [];

  for (const step of route.legs.flatMap((l) => l.steps)) {
    if (!step.polyline?.points) continue;
    const decoded = decodePolyline(step.polyline.points);
    points.push(...decoded);
  }

  let totalDistanceM = 0;
  let totalDurationS = 0;
  for (const l of route.legs) {
    totalDistanceM += l.distance?.value ?? 0;
    totalDurationS += l.duration_in_traffic?.value ?? l.duration?.value ?? 0;
  }

  return {
    points,
    distanceKm: Math.round((totalDistanceM / 1000) * 10) / 10,
    durationMin: Math.max(1, Math.round(totalDurationS / 60)),
    distanceText: leg.distance?.text ?? `${Math.round(totalDistanceM / 1000)} km`,
    durationText:
      leg.duration_in_traffic?.text ??
      leg.duration?.text ??
      `${Math.round(totalDurationS / 60)} mins`,
  };
}

/* ------------------------------------------------------------------ */
/*  Geocode a free-text address to coordinates                        */
/* ------------------------------------------------------------------ */

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null;
  try {
    const maps = await loadGoogleMaps();
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      new google.maps.Geocoder().geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) resolve(results);
        else reject(new Error(`Geocode failed: ${status}`));
      });
    });
    const loc = result[0]?.geometry?.location;
    if (!loc) return null;
    return { lat: loc.lat(), lng: loc.lng() };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Reverse-geocode coordinates to a readable address                 */
/* ------------------------------------------------------------------ */

export async function reverseGeocode(coords: { lat: number; lng: number }): Promise<string | null> {
  try {
    const maps = await loadGoogleMaps();
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      new google.maps.Geocoder().geocode(
        { location: new maps.LatLng(coords.lat, coords.lng) },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) resolve(results);
          else reject(new Error(`Reverse geocode failed: ${status}`));
        },
      );
    });
    return result[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Autocomplete places search (for dropdown suggestions)             */
/* ------------------------------------------------------------------ */

export type PlaceSuggestion = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

let acService: google.maps.places.AutocompleteService | null = null;

export async function searchPlaces(query: string, country = "ZA"): Promise<PlaceSuggestion[]> {
  if (!query.trim() || query.trim().length < 2) return [];
  const maps = await loadGoogleMaps();
  if (!acService) acService = new maps.places.AutocompleteService();

  const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>(
    (resolve, reject) => {
      acService!.getPlacePredictions(
        { input: query, componentRestrictions: { country }, types: ["geocode", "establishment"] },
        (res, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && res) resolve(res);
          else resolve([]);
        },
      );
    },
  );

  return predictions.slice(0, 6).map((p) => ({
    placeId: p.place_id,
    name: p.structured_formatting.main_text,
    address: p.description,
    lat: 0,
    lng: 0,
  }));
}

export async function getPlaceDetails(
  placeId: string,
): Promise<{ lat: number; lng: number; address: string } | null> {
  const maps = await loadGoogleMaps();
  const service = new maps.places.PlacesService(document.createElement("div"));
  return new Promise((resolve) => {
    service.getDetails(
      { placeId, fields: ["geometry.location", "formatted_address"] },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
          resolve({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.formatted_address ?? result.name ?? "",
          });
        } else {
          resolve(null);
        }
      },
    );
  });
}
