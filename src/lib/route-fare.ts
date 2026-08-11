import { distanceKm, type LatLng } from "./sa-places";

/** Build a per-km fare function for operator console offers. */
export function routeFare(rate: number, base: number) {
  return (from: LatLng, to: LatLng) => {
    const km = Math.max(20, distanceKm(from, to));
    return { km, fare: Math.round(base + km * rate), mins: Math.max(25, Math.round(km * 1.4)) };
  };
}
