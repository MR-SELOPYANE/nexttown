export type LatLng = { lat: number; lng: number };

/** Approximate coordinates for common Next Town pickup / drop-off points. */
export const SA_PLACES: Record<string, LatLng> = {
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  jhb: { lat: -26.2041, lng: 28.0473 },
  jnb: { lat: -26.1392, lng: 28.246 },
  sandton: { lat: -26.1076, lng: 28.0567 },
  rosebank: { lat: -26.1467, lng: 28.0436 },
  midrand: { lat: -25.9992, lng: 28.1263 },
  soweto: { lat: -26.2678, lng: 27.8585 },
  "or tambo": { lat: -26.1392, lng: 28.246 },
  lanseria: { lat: -25.9385, lng: 27.9261 },
  pretoria: { lat: -25.7479, lng: 28.2293 },
  pta: { lat: -25.7479, lng: 28.2293 },
  menlyn: { lat: -25.7828, lng: 28.2764 },
  centurion: { lat: -25.8603, lng: 28.1894 },
  "cape town": { lat: -33.9249, lng: 18.4241 },
  cpt: { lat: -33.9249, lng: 18.4241 },
  stellenbosch: { lat: -33.9321, lng: 18.8602 },
  paarl: { lat: -33.7342, lng: 18.9621 },
  durban: { lat: -29.8587, lng: 31.0218 },
  dur: { lat: -29.8587, lng: 31.0218 },
  "king shaka": { lat: -29.6144, lng: 31.1197 },
  pietermaritzburg: { lat: -29.6006, lng: 30.3794 },
  "port elizabeth": { lat: -33.9608, lng: 25.6022 },
  gqeberha: { lat: -33.9608, lng: 25.6022 },
  bloemfontein: { lat: -29.0852, lng: 26.1596 },
  kimberley: { lat: -28.7282, lng: 24.7499 },
  polokwane: { lat: -23.9045, lng: 29.4689 },
  nelspruit: { lat: -25.4753, lng: 30.9694 },
  mbombela: { lat: -25.4753, lng: 30.9694 },
  george: { lat: -33.963, lng: 22.4617 },
  "east london": { lat: -33.0153, lng: 27.9116 },
  rustenburg: { lat: -25.6672, lng: 27.2424 },
  gaborone: { lat: -24.6282, lng: 25.9231 },
  maputo: { lat: -25.9692, lng: 32.5732 },
  windhoek: { lat: -22.5597, lng: 17.0832 },
  harare: { lat: -17.8252, lng: 31.0335 },
};

const FALLBACK: LatLng = { lat: -26.2041, lng: 28.0473 };

export function lookupPlace(raw: string): LatLng | null {
  const q = raw.toLowerCase().replace(/[()]/g, " ").trim();
  if (!q) return null;
  if (SA_PLACES[q]) return SA_PLACES[q];
  const hit = Object.keys(SA_PLACES)
    .sort((a, b) => b.length - a.length)
    .find((k) => q.includes(k));
  return hit ? SA_PLACES[hit] : null;
}

/** Parse titles like "Sandton → Rosebank → OR Tambo" or "Durban - Johannesburg". */
export function parseRoute(title: string): {
  from: LatLng;
  to: LatLng;
  stops: LatLng[];
  labels: string[];
} {
  const parts = title.split(/→|->|–|—| to /i).map((p) => p.trim());
  const labels = parts.length > 0 ? parts : ["Johannesburg", "Pretoria"];
  const fromLabel = labels[0] ?? "Johannesburg";
  const toLabel = labels[labels.length - 1] ?? "Pretoria";

  // Intermediate stops (excluding first and last)
  const stops: LatLng[] = [];
  for (let i = 1; i < labels.length - 1; i++) {
    const coords = lookupPlace(labels[i]);
    if (coords) stops.push(coords);
  }

  return {
    from: lookupPlace(fromLabel) ?? FALLBACK,
    to: lookupPlace(toLabel) ?? SA_PLACES.pretoria,
    stops,
    labels,
  };
}

/** Linear interpolation between two points (fallback when no road polyline). */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/**
 * Interpolate position along a polyline (array of LatLng points).
 * `t` is 0–1 representing progress along the full path.
 */
export function interpolateAlongPolyline(points: LatLng[], t: number): LatLng {
  if (points.length === 0) return FALLBACK;
  if (points.length === 1) return points[0];
  if (t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];

  // Calculate total distance
  let totalDist = 0;
  const segDists: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const d = haversine(points[i - 1], points[i]);
    segDists.push(d);
    totalDist += d;
  }

  if (totalDist === 0) return points[0];

  const targetDist = t * totalDist;
  let accum = 0;

  for (let i = 0; i < segDists.length; i++) {
    if (accum + segDists[i] >= targetDist) {
      const segT = (targetDist - accum) / segDists[i];
      return interpolate(points[i], points[i + 1], segT);
    }
    accum += segDists[i];
  }

  return points[points.length - 1];
}

/** Calculate bearing between two points in degrees (0–360, clockwise from north). */
export function bearing(a: LatLng, b: LatLng): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Great-circle distance in km between two points. */
export function distanceKm(a: LatLng, b: LatLng): number {
  return Math.round(haversine(a, b) * 10) / 10;
}

export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest known place to a GPS coordinate within radiusKm, or null if none. */
export function nearestPlace(latLng: LatLng, radiusKm = 80): string | null {
  let best: { name: string; d: number } | null = null;
  for (const [name, coords] of Object.entries(SA_PLACES)) {
    if (name.length <= 3) continue; // skip short aliases
    const d = distanceKm(latLng, coords);
    if (!best || d < best.d) best = { name, d };
  }
  if (!best || best.d > radiusKm) return null;
  return best.name.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Suggestion list for place inputs. */
export const PLACE_SUGGESTIONS = Object.keys(SA_PLACES)
  .filter((k) => k.length > 3)
  .map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase()))
  .sort();
