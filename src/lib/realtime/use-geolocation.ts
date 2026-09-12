import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * CLEAN RAW GPS FIX
 * A single sanitised position from the browser's Geolocation API, normalised
 * for the ride domain (km/h speed, epoch-ms timestamp, never-NaN heading).
 */
export type GpsFix = {
  lat: number;
  lng: number;
  /** Compass heading in degrees (0–360, clockwise from north). 0 when unknown. */
  heading: number;
  speedKmh: number;
  accuracyM: number;
  /** Epoch ms when the device produced this fix. */
  timestamp: number;
};

export type GeolocationPermission = "prompt" | "granted" | "denied" | "unknown";

export type GeolocationState =
  | "idle" // not started yet (disabled)
  | "starting" // permission in flight / watcher requested
  | "tracking" // healthy stream of fixes
  | "stale" // last fix is stale (no recent updates)
  | "denied" // permission permanently denied
  | "unavailable"; // browser/platform has no geolocation

export type UseGeolocationOptions = {
  /** Whether to actively watch the position. Toggling this starts/stops GPS. */
  enabled?: boolean;
  /** Minimum interval (ms) between emitted fixes that pass the distance gate. */
  throttleMs?: number;
  /** Ignore fixes whose accuracy is worse than this (metres). */
  maxAccuracyM?: number;
  /** Ignore fixes that moved less than this (metres) during the throttle window. */
  minDistanceM?: number;
  /** Emit a fix at least this often regardless of movement/accuracy gates. */
  forceEmitMs?: number;
  /** Mark the stream stale when the newest fix is older than this (ms). */
  staleAfterMs?: number;
  /** Called whenever a fix passes the quality gates. */
  onFix?: (fix: GpsFix) => void;
};

const DEFAULT_THROTTLE_MS = 2000;
const DEFAULT_MAX_ACCURACY_M = 100;
const DEFAULT_MIN_DISTANCE_M = 15;
const DEFAULT_FORCE_EMIT_MS = 10_000;
const DEFAULT_STALE_AFTER_MS = 15_000;

function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function hasGeolocation(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * REAL-TIME GEOLOCATION WATCHER
 * ------------------------------------------------------------------
 * Wraps `navigator.geolocation.watchPosition` with the hardening required by
 * the driver-location feature:
 *
 * - Spam control: fixes are throttled to `throttleMs` AND must move beyond
 *   `minDistanceM` (force-emitted at least every `forceEmitMs`).
 * - Quality gate: fixes with accuracy worse than `maxAccuracyM` are dropped.
 * - Permission handling: surfaces `denied`/`prompt`/`granted` (via the
 *   Permissions API where available, else derived from geolocation errors).
 * - Stale detection: if the freshest fix ages past `staleAfterMs` while
 *   tracking, the state flips to `stale` so UIs can warn.
 * - Network resilience: `offline`/`online` restarts the watcher.
 * - Full cleanup on disable/unmount (no leaked watcher ids).
 *
 * Returns a memoised API; the watcher is only ever created/moved to the
 * browser when `enabled` is true.
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enabled = false,
    throttleMs = DEFAULT_THROTTLE_MS,
    maxAccuracyM = DEFAULT_MAX_ACCURACY_M,
    minDistanceM = DEFAULT_MIN_DISTANCE_M,
    forceEmitMs = DEFAULT_FORCE_EMIT_MS,
    staleAfterMs = DEFAULT_STALE_AFTER_MS,
    onFix,
  } = options;

  const onFixRef = useRef(onFix);
  onFixRef.current = onFix;

  const [permission, setPermission] = useState<GeolocationPermission>("unknown");
  const [state, setState] = useState<GeolocationState>("idle");
  const [lastFix, setLastFix] = useState<GpsFix | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watcherRef = useRef<number | null>(null);
  const prevFixRef = useRef<GpsFix | null>(null);
  const lastEmitRef = useRef(0);
  const lastRawRef = useRef(0);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = useCallback(
    (fix: GpsFix, force: boolean) => {
      const now = Date.now();
      const sinceEmit = now - lastEmitRef.current;
      const sinceRaw = now - lastRawRef.current;

      if (maxAccuracyM > 0 && fix.accuracyM > maxAccuracyM) {
        lastRawRef.current = now;
        return; // quality gate: ignore inaccurate fix
      }

      const movedAway = prevFixRef.current
        ? metersBetween(prevFixRef.current, fix) >= minDistanceM
        : true;

      if (!force && sinceEmit < throttleMs && !movedAway && sinceRaw < forceEmitMs) {
        return; // throttle + distance gates (not forced yet)
      }

      prevFixRef.current = fix;
      lastEmitRef.current = now;
      lastRawRef.current = now;

      setLastFix(fix);
      onFixRef.current?.(fix);
      setState((s) => (s === "denied" || s === "unavailable" ? s : "tracking"));
    },
    [maxAccuracyM, minDistanceM, throttleMs, forceEmitMs],
  );

  // --- permission bookkeeping (ref so the watcher callback can read it) -----
  const permissionIsDeniedRef = useRef(false);

  const handleError = useCallback((code: number, message: string) => {
    setError(message);
    if (code === 1) {
      permissionIsDeniedRef.current = true;
      setPermission("denied");
      setState("denied");
    } else {
      setState("unavailable");
    }
  }, []);

  const start = useCallback(() => {
    if (!hasGeolocation()) {
      setState("unavailable");
      return;
    }
    if (watcherRef.current !== null) return;
    setState("starting");
    setError(null);

    watcherRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = pos.coords;
        const prev = prevFixRef.current;
        const fix: GpsFix = {
          lat: coords.latitude,
          lng: coords.longitude,
          heading:
            coords.heading !== null && Number.isFinite(coords.heading)
              ? coords.heading
              : (prev?.heading ?? 0),
          speedKmh:
            coords.speed !== null && Number.isFinite(coords.speed)
              ? Math.round(coords.speed * 3.6 * 10) / 10
              : 0,
          accuracyM: coords.accuracy ?? maxAccuracyM + 1,
          timestamp: pos.timestamp,
        };
        permissionIsDeniedRef.current = false;
        setPermission("granted");
        emit(fix, false);
      },
      (err) => handleError(err.code, err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );

    // Observe the Permissions API where available (fires on deny/allow changes).
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          const sync = () => setPermission(status.state as GeolocationPermission);
          sync();
          status.addEventListener("change", sync);
        })
        .catch(() => {});
    }
  }, [emit, handleError, maxAccuracyM]);

  const stop = useCallback(() => {
    if (watcherRef.current !== null) {
      navigator.geolocation.clearWatch(watcherRef.current);
      watcherRef.current = null;
    }
    if (staleTimerRef.current !== null) {
      clearInterval(staleTimerRef.current);
      staleTimerRef.current = null;
    }
    setState((s) => (s === "idle" ? s : "idle"));
  }, []);

  // --- stale detection: mark "stale" when tracking but no fresh fix ---------
  useEffect(() => {
    if (!enabled || state !== "tracking") return undefined;
    const timer = setInterval(() => {
      if (lastFix && Date.now() - lastFix.timestamp > staleAfterMs) {
        setState("stale");
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [enabled, state, lastFix, staleAfterMs]);

  // --- online/offline: restart the watcher after network comes back ---------
  useEffect(() => {
    if (!enabled) return undefined;
    const onOnline = () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
        watcherRef.current = null;
      }
      lastEmitRef.current = 0;
      start();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [enabled, start]);

  // --- lifecycle: start/stop with the `enabled` flag ------------------------
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => () => stop(), [stop]);

  const restart = useCallback(() => {
    stop();
    // small delay lets the browser forget the previous watcher
    setTimeout(() => start(), 50);
  }, [start, stop]);

  return useMemo(
    () => ({
      permission,
      state,
      lastFix,
      error,
      supported: hasGeolocation(),
      start,
      stop,
      restart,
    }),
    [permission, state, lastFix, error, start, stop, restart],
  );
}
