import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/api/supabase";
import { ensureDriverSession, DEMO_DRIVER } from "./session";
import { driverStatusToDb, type public_driver_status } from "./location-mappers";
import { useGeolocation, type GpsFix } from "./use-geolocation";
import type { DriverStatus } from "@/lib/ride/types";

/**
 * DRIVER-SIDE GPS PUBLISHER
 * ------------------------------------------------------------------
 * Broadcasts the driver's device GPS to Supabase (`driver_locations`) so
 * passengers receive it via Realtime. Owned by the driver console.
 *
 * SECURITY / TRUST MODEL
 * - The row's primary key is `driver_id` DEFAULT `auth.uid()`, set server-side.
 *   The client NEVER sends a driver id, so a forged id is impossible — RLS
 *   (`WITH CHECK driver_id = auth.uid()`) rejects anything else.
 * - Uses the publishable/anon key only. No service-role secret anywhere.
 *
 * HARDENING
 * - Throttled + coalesced writes (latest fix wins; never stacks requests).
 * - Accuracy-gated fixes (worse than ~100 m are dropped by useGeolocation).
 * - Exponential backoff on RLS/network errors (capped at 15 s).
 * - Stops publishing while app status is `offline`; going offline / shutting
 *   down sends a best-effort DELETE so the marker disappears from passengers.
 */

export type PublisherLinkState =
  "idle" | "signing" | "authenticated" | "unconfigured" | "session_required" | "session_error";

export type PublisherRunState =
  "geolocation_pending" | "tracking" | "denied" | "unavailable" | "unsupported";

export type UseDriverPublisherOptions = {
  /** Master switch: enables GPS watching + publishing. */
  enabled: boolean;
  /** App-level status mirrored into the DB row (`offline` pauses publishing). */
  status: DriverStatus;
  /** Min interval (ms) between writes. Default 3 000. */
  minIntervalMs?: number;
};

export type UseDriverPublisherResult = {
  link: PublisherLinkState;
  run: PublisherRunState;
  /** DB status currently being broadcast, or null when not publishing. */
  broadcasting: public_driver_status | null;
  lastFix: GpsFix | null;
  lastSyncedAt: number | null;
  pushCount: number;
  error: string | null;
  /** Identity shown when the demo account is in use. */
  identity: { name: string; car: string; plate: string } | null;
};

const MAX_BACKOFF_MS = 15_000;

export function useDriverPublisher({
  enabled,
  status,
  minIntervalMs = 3_000,
}: UseDriverPublisherOptions): UseDriverPublisherResult {
  const [link, setLink] = useState<PublisherLinkState>("idle");
  const [run, setRun] = useState<PublisherRunState>("geolocation_pending");
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [pushCount, setPushCount] = useState(0);
  const [identity, setIdentity] = useState<UseDriverPublisherResult["identity"]>(null);

  const statusRef = useRef(status);
  statusRef.current = status;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const lastFixRef = useRef<GpsFix | null>(null);
  const pendingFixRef = useRef<GpsFix | null>(null);
  const lastPushAtRef = useRef(0);
  const backoffRef = useRef(1000);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const publishedRef = useRef(false); // became visible at least once

  const currentDbStatus = useCallback((): public_driver_status | null => {
    const app = statusRef.current;
    if (app === "offline" || app === "completed") return null;
    return driverStatusToDb(app);
  }, []);

  /** Write the driver's own row (upsert) or remove it (delete). */
  const writeRow = useCallback(
    async (fix: GpsFix, mode: "upsert" | "delete") => {
      const supabase = getSupabase();
      if (!supabase) return null;
      inFlightRef.current = true;
      try {
        if (mode === "delete") {
          const { error } = await supabase.from("driver_locations").delete();
          return error;
        }
        const dbStatus = currentDbStatus();
        if (!dbStatus) return null; // offline -> nothing to broadcast
        const { error } = await supabase.from("driver_locations").upsert(
          {
            // NOTE: no driver_id — the DB defaults it to auth.uid() and RLS
            // enforces `<id> = auth.uid()` on every insert/update.
            status: dbStatus,
            latitude: fix.lat,
            longitude: fix.lng,
            heading: Math.round(fix.heading * 10) / 10,
            speed_kmh: fix.speedKmh,
            accuracy_m: Math.round(fix.accuracyM),
            device_ts: new Date(fix.timestamp).toISOString(),
          },
          { onConflict: "driver_id" },
        );
        return error;
      } finally {
        inFlightRef.current = false;
      }
    },
    [currentDbStatus],
  );

  const flush = useCallback(async () => {
    if (inFlightRef.current) return; // a previous write is still running
    const fix = pendingFixRef.current;
    if (!fix) return;
    pendingFixRef.current = null;

    if (!enabledRef.current || statusRef.current === "offline") return;

    const err = await writeRow(fix, "upsert");
    if (!err) {
      backoffRef.current = 1000;
      publishedRef.current = true;
      lastPushAtRef.current = Date.now();
      setLastSyncedAt(Date.now());
      setPushCount((c) => c + 1);
      setError(null);
      // coalesce anything that arrived mid-write and is due now
      if (pendingFixRef.current && Date.now() - lastPushAtRef.current >= minIntervalMs) {
        void flush();
      }
    } else if (
      err.message.toLowerCase().includes("invalid jwt") ||
      err.message.toLowerCase().includes("refresh token")
    ) {
      // auth session missing/expired (RLS blocked us) -> re-establish link
      setError(err.message);
      setLink("session_required");
      pendingFixRef.current = fix;
      retryTimerRef.current = setTimeout(() => {
        pendingFixRef.current = fix;
        void ensureAndFlush();
      }, 1000);
    } else {
      // network/RLS error -> exponential backoff retry of the same row
      setError(err.message);
      const delay = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
      pendingFixRef.current = fix;
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        void flush();
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeRow, currentDbStatus, minIntervalMs]);

  const ensureAndFlush = useCallback(async () => {
    if (!enabledRef.current) return;
    const session = await ensureDriverSession();
    if (session.ok) {
      setLink("authenticated");
      setIdentity(DEMO_DRIVER);
      setError(null);
      if (pendingFixRef.current) void flush();
    } else {
      setLink(session.reason === "unconfigured" ? "unconfigured" : "session_required");
      setError(session.message ?? null);
    }
  }, [flush]);

  // ---- geolocation source (quality-gated fixes) ----------------------------
  const onFix = useCallback(
    (fix: GpsFix) => {
      lastFixRef.current = fix;
      if (!enabledRef.current || statusRef.current === "offline") return;

      pendingFixRef.current = fix;
      const elapsed = Date.now() - lastPushAtRef.current;
      if (elapsed >= minIntervalMs) {
        void flush();
      } else if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(
          () => {
            flushTimerRef.current = null;
            void flush();
          },
          Math.min(1000, minIntervalMs - elapsed),
        );
      }
    },

    [flush, minIntervalMs],
  );

  const geo = useGeolocation({ enabled, onFix });

  // ---- reflect geolocation state onto `run` --------------------------------
  useEffect(() => {
    if (!enabled) {
      setRun("geolocation_pending");
      return;
    }
    if (!geo.supported) {
      setRun("unsupported");
      return;
    }
    switch (geo.state) {
      case "denied":
        setRun("denied");
        break;
      case "unavailable":
        setRun("unavailable");
        break;
      case "starting":
      case "idle":
      case "stale":
        setRun("geolocation_pending");
        break;
      case "tracking":
        setRun("tracking");
        break;
    }
  }, [enabled, geo.supported, geo.state]);

  // ---- Supabase Auth session lifecycle -------------------------------------
  useEffect(() => {
    if (!enabled) {
      setLink("idle");
      return;
    }
    if (!isSupabaseConfigured()) {
      setLink("unconfigured");
      return;
    }
    let cancelled = false;
    setLink("signing");
    ensureDriverSession().then((session) => {
      if (cancelled) return;
      if (session.ok) {
        setLink("authenticated");
        setIdentity(DEMO_DRIVER);
      } else {
        setLink(session.reason === "unconfigured" ? "unconfigured" : "session_required");
        setError(session.message ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // ---- go offline / stop: best-effort DELETE of our own row ----------------
  useEffect(() => {
    if (enabled) return;
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    pendingFixRef.current = null;
    if (publishedRef.current) {
      publishedRef.current = false;
      const last = lastFixRef.current;
      if (last) void writeRow(last, "delete");
    }
  }, [enabled, writeRow]);

  // ---- unmount cleanup ------------------------------------------------------
  useEffect(
    () => () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (publishedRef.current && lastFixRef.current) {
        void writeRow(lastFixRef.current, "delete");
      }
    },
    [writeRow],
  );

  return {
    link,
    run,
    broadcasting:
      enabled && status !== "offline" && status !== "completed" ? currentDbStatus() : null,
    lastFix: lastFixRef.current,
    lastSyncedAt,
    pushCount,
    error,
    identity,
  };
}
