import { haversine, bearing } from "@/lib/sa-places";
import type { DriverLocation, DriverStatus, LatLng } from "./types";
import { isValidLatLng } from "./geo";

/**
 * DEMO DRIVER LOCATION FEED
 * ------------------------------------------------------------------
 * This module emulates a real-time driver location channel so the demo works
 * without a backend. It walks a road polyline at a constant speed and emits a
 * stream of `DriverLocation` snapshots (position + heading + speed + status).
 *
 * In production, replace this with a `DriverLocationSource` backed by a
 * WebSocket / SSE / polled API. The map and ride reducer never know the
 * difference: they only ever consume `Driver.location`.
 */

export type FeedMeta = {
  traveledKm: number;
  totalKm: number;
  remainingKm: number;
};

export type DrivingFeed = {
  /** Latest position of the vehicle. */
  current(): LatLng | null;
  meta(): FeedMeta;
  /** Stop the feed. Safe to call more than once. */
  dispose(): void;
};

export type DrivingFeedOptions = {
  /** Road-following polyline from `start` to the target. */
  points: LatLng[];
  /** Where the vehicle actually starts (fallback: points[0]). */
  start?: LatLng;
  speedKmh?: number;
  tickMs?: number;
  status?: DriverStatus;
  onLocation: (loc: DriverLocation, meta: FeedMeta) => void;
  onReached?: () => void;
};

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

function polylineLength(points: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += haversine(points[i - 1], points[i]);
  return sum;
}

/** Resolve the position + heading at `distKm` along `points`. */
function positionAt(
  points: LatLng[],
  distKm: number,
): { pos: LatLng; heading: number; finished: boolean } {
  const last = points.length - 1;
  let acc = 0;
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[i + 1];
    const seg = haversine(a, b);
    const isFinalSegment = i === last - 1;
    if (acc + seg >= distKm || isFinalSegment) {
      const t = seg <= 0 ? 1 : distKm >= acc + seg ? 1 : Math.max(0, (distKm - acc) / seg);
      return {
        pos: lerp(a, b, t),
        heading: bearing(a, b),
        finished: isFinalSegment && distKm >= acc + seg,
      };
    }
    acc += seg;
  }
  return { pos: points[last], heading: bearing(points[last - 1], points[last]), finished: true };
}

export function startDrivingFeed(opts: DrivingFeedOptions): DrivingFeed {
  const {
    points,
    start,
    speedKmh = 40,
    tickMs = 1000,
    status = "enroute",
    onLocation,
    onReached,
  } = opts;

  const base = points.filter(isValidLatLng);
  const path: LatLng[] =
    base.length >= 2 && start && (start.lat !== base[0].lat || start.lng !== base[0].lng)
      ? [start, ...base]
      : base;

  const total = polylineLength(path);
  let travelled = 0;
  let settled = false;
  let reachedFired = false;

  const meta = (): FeedMeta => ({
    traveledKm: travelled,
    totalKm: total,
    remainingKm: Math.max(0, total - travelled),
  });

  const emit = () => {
    let pos: LatLng;
    let heading = 0;
    let finished = false;

    if (path.length < 2) {
      pos = path[0];
      finished = true;
    } else {
      const r = positionAt(path, Math.min(travelled, total));
      pos = r.pos;
      heading = r.heading;
      finished = r.finished && travelled >= total;
    }

    onLocation(
      {
        lat: pos.lat,
        lng: pos.lng,
        heading,
        status,
        speedKmh: finished ? 0 : speedKmh,
        updatedAt: Date.now(),
        accuracyM: 5,
      },
      meta(),
    );

    if (finished && !reachedFired) {
      reachedFired = true;
      settled = true;
      onReached?.();
    }
  };

  // Emit the starting position immediately so the map renders the driver at once.
  emit();

  if (path.length >= 2 && total > 0.001) {
    const stepKm = (speedKmh * tickMs) / 3_600_000;
    const id = setInterval(() => {
      if (settled) {
        clearInterval(id);
        return;
      }
      travelled = Math.min(total, travelled + stepKm);
      if (travelled >= total) settled = true;
      emit();
      if (settled) clearInterval(id);
    }, tickMs);

    return {
      current: () =>
        path.length ? (settled ? path[path.length - 1] : positionAt(path, travelled).pos) : null,
      meta,
      dispose: () => clearInterval(id),
    };
  }

  return {
    current: () => (path.length ? path[path.length - 1] : null),
    meta,
    dispose: () => {
      // no timer was started; nothing to clear
    },
  };
}
