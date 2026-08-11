export type LatLng = { lat: number; lng: number };

/** Approximate coordinates for common HITCH SA pickup / drop-off points. */
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

/** Parse titles like "Sandton → OR Tambo" or "Durban - Johannesburg". */
export function parseRoute(title: string): { from: LatLng; to: LatLng; labels: [string, string] } {
  const parts = title.split(/→|->|–|—| to /i).map((p) => p.trim());
  const fromLabel = parts[0] ?? "Johannesburg";
  const toLabel = parts[1] ?? "Pretoria";
  return {
    from: lookupPlace(fromLabel) ?? FALLBACK,
    to: lookupPlace(toLabel) ?? SA_PLACES.pretoria,
    labels: [fromLabel, toLabel],
  };
}

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Great-circle distance in km between two points. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
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
