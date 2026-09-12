import { useEffect, useRef, useState } from "react";
import { getDirections, type RouteInfo } from "@/lib/google-maps";
import { haversine } from "@/lib/sa-places";
import type { LatLng } from "@/lib/ride/types";

/**
 * ETA SERVICE
 * ------------------------------------------------------------------
 * A reusable, rate-limited route + ETA resolver backed by Google Maps routing.
 *
 * It deliberately separates *route calculation* (this module) from map
 * rendering (the map layers) and ETA presentation (the UI):
 *   - callers ask for a real route-based ETA and render the number;
 *   - the same cached route is reused for ETA and for drawing polylines,
 *     so there is never a duplicate Directions API call;
 *   - the service is cached + rate-limited so re-renders and a fast-moving
 *     driver position stream don't hammer the API.
 *
 * Behaviour:
 *  - graceful failure: if Google routing fails we fall back to a
 *    straight-line distance estimate marked as `source: "estimate"`.
 *  - caching: results are cached per origin/destination so repeated renders
 *    and the map layer share one API call.
 *  - rate limiting: real API calls are gated by an interval window.
 *  - staleness: routed values older than a threshold are flagged `stale`
 *    so the UI can surface an out-of-date ETA.
 */

export type EtaSource = "route" | "estimate" | "none";

export type EtaResult = {
  /** Estimated minutes to reach `destination`. `null` while unknown/loading. */
  etaMin: number | null;
  /** Road (or fallback straight-line) distance in km. */
  distanceKm: number | null;
  /** Where `etaMin` came from: a routed result or a distance estimate. */
  source: EtaSource;
  /** True when the returned value is older than the stale threshold. */
  stale: boolean;
  /** True when the most recent request failed (route/estimate fallback used). */
  error: boolean;
  /** Epoch ms of the underlying data. */
  fetchedAt: number | null;
};

export type EtaServiceOptions = {
  /** Use traffic-aware routing (BEST_GUESS). Default true. */
  trafficAware?: boolean;
  /** Cache TTL before we consider a result reusable. Default 60s. */
  cacheTtlMs?: number;
  /** Minimum gap between real Directions calls. Default 20s. */
  minRefreshIntervalMs?: number;
  /** A result older than this is flagged `stale: true`. Default 90s. */
  staleAfterMs?: number;
  /** Speed used ONLY for the distance-based fallback. Default 40 km/h. */
  fallbackSpeedKmh?: number;
};

export const ETA_DEFAULTS: Required<EtaServiceOptions> = {
  trafficAware: true,
  cacheTtlMs: 60_000,
  minRefreshIntervalMs: 20_000,
  staleAfterMs: 90_000,
  fallbackSpeedKmh: 40,
};

type CacheEntry = {
  etaMin: number;
  distanceKm: number;
  source: EtaSource;
  points: { lat: number; lng: number }[] | null;
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();

/** Rough face of a coordinate (~11 m at 4 decimals) so driver micro-moves share a cache key. */
function face(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function key(origin: LatLng, destination: LatLng, waypoints?: LatLng[]): string {
  const wp = (waypoints ?? []).map((w) => face(w.lat, w.lng)).join("|");
  return `${face(origin.lat, origin.lng)}>${face(destination.lat, destination.lng)}${wp ? `#${wp}` : ""}`;
}

let lastCallAt = 0;
const inflight: Map<string, Promise<CacheEntry>> = new Map();

function distanceEstimate(origin: LatLng, destination: LatLng, speedKmh: number): CacheEntry {
  const km = haversine(origin, destination);
  const etaMin = km <= 0 ? 1 : Math.max(1, Math.round((km / Math.max(1, speedKmh)) * 60));
  return {
    etaMin,
    distanceKm: Math.round(km * 10) / 10,
    source: "estimate",
    points: null,
    fetchedAt: Date.now(),
  };
}

/**
 * Resolve (and cache) a real routed estimate from `origin` to `destination`.
 *
 * Passing `wantPoints` returns the decoded route polyline so the map layer and
 * the ETA number share a single API call instead of two.
 */
export async function getRouteEta(
  origin: LatLng,
  destination: LatLng,
  options: EtaServiceOptions = {},
  wantPoints = false,
): Promise<EtaResult & { points: { lat: number; lng: number }[] | null }> {
  const o = { ...ETA_DEFAULTS, ...options };
  const now = Date.now();
  const waypoints: LatLng[] | undefined = undefined; // driver→target is a single leg
  const k = key(origin, destination, waypoints);

  const cached = cache.get(k);
  const fresh = cached && now - cached.fetchedAt < o.cacheTtlMs;
  const withinRateLimit = cached && now - lastCallAt < o.minRefreshIntervalMs;

  if (cached && (fresh || withinRateLimit)) {
    return {
      etaMin: cached.etaMin,
      distanceKm: cached.distanceKm,
      source: cached.source,
      stale: now - cached.fetchedAt > o.staleAfterMs,
      error: cached.source === "estimate" && !fresh,
      fetchedAt: cached.fetchedAt,
      points: wantPoints ? cached.points : null,
    };
  }

  // Wait on an in-flight call for the same route instead of duplicating it.
  const pending = inflight.get(k);
  if (pending) {
    const entry = await pending;
    return {
      etaMin: entry.etaMin,
      distanceKm: entry.distanceKm,
      source: entry.source,
      stale: now - entry.fetchedAt > o.staleAfterMs,
      error: entry.source === "estimate",
      fetchedAt: entry.fetchedAt,
      points: wantPoints ? entry.points : null,
    };
  }

  const run = (async (): Promise<CacheEntry> => {
    lastCallAt = Date.now();
    try {
      const info = await getDirections(origin, destination, waypoints);
      const entry: CacheEntry = {
        etaMin: Math.max(1, info.durationMin),
        distanceKm: info.distanceKm,
        source: "route",
        points: info.points.length > 0 ? info.points : null,
        fetchedAt: Date.now(),
      };
      cache.set(k, entry);
      return entry;
    } catch {
      // Graceful failure: fall back to a distance estimate and keep a cached
      // older route value as the baseline (see cached path above).
      const fallback = distanceEstimate(origin, destination, o.fallbackSpeedKmh);
      cache.set(k, fallback);
      return fallback;
    }
  })();

  inflight.set(k, run);
  try {
    const entry = await run;
    return {
      etaMin: entry.etaMin,
      distanceKm: entry.distanceKm,
      source: entry.source,
      stale: Date.now() - entry.fetchedAt > o.staleAfterMs,
      error: entry.source === "estimate",
      fetchedAt: entry.fetchedAt,
      points: wantPoints ? entry.points : null,
    };
  } finally {
    inflight.delete(k);
  }
}

/**
 * Resolve the full route info (polyline + distance + duration) for the map.
 * Shares the ETA service cache, so the visible route line and the ETA number
 * come from the same (rate-limited) Directions call.
 */
export async function getRouteInfo(
  origin: LatLng,
  destination: LatLng,
  options?: EtaServiceOptions,
): Promise<RouteInfo | null> {
  const res = await getRouteEta(origin, destination, options, true);
  if (res.source === "none" || res.etaMin == null) return null;
  return {
    points: res.points ?? [origin, destination],
    distanceKm: res.distanceKm ?? 0,
    durationMin: res.etaMin,
    distanceText: res.distanceKm != null ? `${res.distanceKm} km` : `${res.distanceKm}`,
    durationText: `${res.etaMin} mins`,
  };
}

type RouteEtaInput = {
  origin: LatLng | null | undefined;
  destination: LatLng | null | undefined;
  /** Refresh the ETA every `refreshIntervalMs`. 0 disables periodic refresh. */
  refreshIntervalMs?: number;
  options?: EtaServiceOptions;
};

const EMPTY: EtaResult = {
  etaMin: null,
  distanceKm: null,
  source: "none",
  stale: false,
  error: false,
  fetchedAt: null,
};

/**
 * React hook — resolves and periodically refreshes a route-based ETA.
 *
 * - Rendering is cheap: the underlying service de-duplicates identical
 *   requests, so many components share one API call.
 * - `refreshIntervalMs` controls how often the value is recomputed. Because
 *   the service is itself rate-limited, this is an upper bound.
 * - `loading` is true while a real route is being fetched for the first time
 *   (no cached value yet).
 */
export function useRouteEta(input: RouteEtaInput): {
  eta: EtaResult;
  loading: boolean;
  refresh: () => void;
} {
  const { origin, destination, refreshIntervalMs = 0, options } = input;
  const [eta, setEta] = useState<EtaResult>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const optsRef = useRef(options);
  optsRef.current = options;

  const from = origin && (origin.lat !== 0 || origin.lng !== 0) ? origin : null;
  const to = destination && (destination.lat !== 0 || destination.lng !== 0) ? destination : null;

  useEffect(() => {
    if (!from || !to) {
      setEta(EMPTY);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getRouteEta(from, to, optsRef.current).then((res) => {
      if (cancelled) return;
      setEta(res);
      setLoading(res.source === "none");
    });
    return () => {
      cancelled = true;
    };
    // Coordinate primitives (not the LatLng objects) drive re-resolution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.lat, from?.lng, to?.lat, to?.lng, tick]);

  useEffect(() => {
    if (!from || !to || refreshIntervalMs <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.lat, from?.lng, to?.lat, to?.lng, refreshIntervalMs]);

  return {
    eta,
    loading,
    refresh: () => setTick((t) => t + 1),
  };
}

export const etaService = {
  getRouteEta,
  getRouteInfo,
  clearCache: () => cache.clear(),
};
