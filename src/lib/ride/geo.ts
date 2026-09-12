import { haversine } from "@/lib/sa-places";
import type { LatLng } from "./types";

/** A coordinate is "usable" when it carries a real lat/lng (the app uses {0,0} as a sentinel). */
export function isValidLatLng(c: LatLng | null | undefined): c is LatLng {
  return !!c && (c.lat !== 0 || c.lng !== 0);
}

/** Distance (km) between two points in a straight line. */
export function lineDistanceKm(a: LatLng, b: LatLng): number {
  return haversine(a, b);
}

/** Cumulative distance (km) along a polyline up to vertex `to` (inclusive). */
export function distanceAlongPath(points: LatLng[], to: number, from = 0): number {
  if (points.length === 0) return 0;
  let acc = 0;
  for (let i = from; i < to; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a && b) acc += haversine(a, b);
  }
  return acc;
}

/** Total length (km) of a polyline. */
export function pathLengthKm(points: LatLng[]): number {
  if (points.length < 2) return 0;
  let acc = 0;
  for (let i = 1; i < points.length; i++) acc += haversine(points[i - 1], points[i]);
  return acc;
}

/** Index of the polyline vertex nearest to `loc`. */
export function nearestPathIndex(points: LatLng[], loc: LatLng): number {
  if (points.length === 0) return -1;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = haversine(points[i], loc);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Approximate ETA (minutes) to reach `target` by road, assuming a straight-line fallback. */
export function etaToPointKm(loc: LatLng, target: LatLng, speedKmh: number): number {
  const d = lineDistanceKm(loc, target);
  return etaForDistanceKm(d, speedKmh);
}

export function etaForDistanceKm(distanceKm: number, speedKmh: number): number {
  if (distanceKm <= 0) return 1;
  return Math.max(1, Math.round((distanceKm / Math.max(1, speedKmh)) * 60));
}

/** Bearing between two points in degrees (0–360 clockwise from north). */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Random coordinate a random bearing and distance (km) from a centre. */
export function offsetKm(center: LatLng, minKm: number, maxKm: number): LatLng {
  const angle = Math.random() * Math.PI * 2;
  const km = minKm + Math.random() * (maxKm - minKm);
  const cosLat = Math.max(0.2, Math.cos((center.lat * Math.PI) / 180));
  const dLat = km / 111;
  const dLng = km / (111 * cosLat);
  return { lat: center.lat + Math.cos(angle) * dLat, lng: center.lng + Math.sin(angle) * dLng };
}
