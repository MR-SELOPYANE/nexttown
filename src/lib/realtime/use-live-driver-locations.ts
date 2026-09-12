import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/api/supabase";
import { rowToDriver, rowToDriverLocation, type DriverLocationRow } from "./location-mappers";
import { acquireRealtimeChannel } from "./realtime-channel";
import { haversine } from "@/lib/sa-places";
import type { Driver, DriverLocation, LatLng } from "@/lib/ride/types";

/**
 * PASSENGER-SIDE LIVE DRIVER LOCATIONS
 * ------------------------------------------------------------------
 * Keeps `driverId -> DriverLocation` in sync with the `driver_locations`
 * table over a Supabase Realtime `postgres_changes` subscription.
 *
 * HARDENING (per the requirements)
 * - Deduplication: one physical channel per id-set (module-level registry), so
 *   two open maps/tabs never open duplicate subscriptions.
 * - Duplicate-event suppression: repeated UPDATEs carrying the same DB
 *   `updated_at` (re-transmits / mirror copies) are ignored.
 * - Reconnect: CHANNEL_ERROR / TIMED_OUT and offline->online are retried with
 *   exponential backoff (capped at 15s).
 * - Cleanup: channel holds are released on unmount / id-set / enabled change,
 *   closing the underlying channel when the last holder releases.
 * - RLS: reads go through the publishable-key SELECT policy
 *   (`status <> 'offline'`), so offline drivers never appear.
 *
 * When Supabase is not configured (no VITE env), returns `{ live: false }` and
 * consumers fall back to the labelled demo feed.
 */

type PostgresChange = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<DriverLocationRow> | null;
  old: Partial<DriverLocationRow> | null;
};

export type LiveDriverConnection = "idle" | "connecting" | "subscribed" | "error" | "closed";

export type UseLiveDriverLocationsOptions = {
  /** Driver ids to track. Empty = no-op. */
  driverIds: string[];
  /** When false, the subscription is suspended (default true). */
  enabled?: boolean;
};

export function useLiveDriverLocations({
  driverIds,
  enabled = true,
}: UseLiveDriverLocationsOptions) {
  const [locations, setLocations] = useState<Record<string, DriverLocation>>({});
  const [connection, setConnection] = useState<LiveDriverConnection>("idle");
  const [offline, setOffline] = useState(false);
  const [lastErrorAt, setLastErrorAt] = useState<number | null>(null);

  const lastRowsRef = useRef<Record<string, string>>({});
  const releaseRef = useRef<(() => void) | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000);

  const idsKey = useMemo(
    () => [...new Set(driverIds.filter(Boolean))].sort().join(","),
    [driverIds],
  );

  useEffect(() => {
    // -- teardown any previous attempt --------------------------------------
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    lastRowsRef.current = {};

    const ids = idsKey ? idsKey.split(",") : [];
    if (!enabled || ids.length === 0 || !isSupabaseConfigured()) {
      setLocations({});
      setConnection("idle");
      return undefined;
    }

    const client = getSupabase();
    if (!client) return undefined;

    let disposed = false;
    let dropped = false; // channel errored; waiting for a backoff re-acquire

    const acquire = () => {
      if (disposed || dropped) return;
      setConnection("connecting");
      backoffRef.current = 1000;

      const handle = acquireRealtimeChannel(client, {
        signature: `hitch:driver-locs:${idsKey}`,
        setup: (channel) => {
          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "driver_locations",
              filter: `driver_id=in.(${ids.join(",")})`,
            },
            (payload) => {
              if (disposed) return;
              const change = payload as unknown as PostgresChange;
              if (!change?.eventType) return;

              if (change.eventType === "DELETE") {
                const rid = change.old?.driver_id;
                if (rid) {
                  setLocations((prev) => {
                    if (!(rid in prev)) return prev;
                    const next = { ...prev };
                    delete next[rid];
                    return next;
                  });
                }
                return;
              }

              const row = change.new as DriverLocationRow | null;
              if (
                !row?.driver_id ||
                typeof row.latitude !== "number" ||
                typeof row.longitude !== "number"
              ) {
                return;
              }

              // suppress re-transmits of the same DB write
              const rowKey = row.updated_at ?? new Date(row.device_ts ?? 0).toISOString();
              if (lastRowsRef.current[row.driver_id] === rowKey) return;
              lastRowsRef.current[row.driver_id] = rowKey;

              const loc = rowToDriverLocation(row);
              setLocations((prev) =>
                prev[row.driver_id]?.updatedAt === loc.updatedAt
                  ? prev
                  : { ...prev, [row.driver_id]: loc },
              );
            },
          );
        },
        onStateChange: (state) => {
          if (disposed) return;
          setConnection(state);
          if (state === "error" && !dropped) {
            dropped = true;
            setLastErrorAt(Date.now());
            const delay = backoffRef.current;
            backoffRef.current = Math.min(backoffRef.current * 2, 15_000);
            retryTimerRef.current = setTimeout(() => {
              retryTimerRef.current = null;
              if (disposed) return;
              releaseRef.current?.();
              releaseRef.current = null;
              dropped = false;
              acquire();
            }, delay);
          }
        },
      });

      releaseRef.current = () => {
        try {
          handle.release();
        } finally {
          releaseRef.current = null;
        }
      };
    };

    acquire();
    // -- network resilience: reconnect immediately when back online -------------
    const onOnline = () => {
      setOffline(false);
      if (disposed) return;
      dropped = true; // ensure acquire() doesn't run behind the refresh
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      releaseRef.current?.();
      releaseRef.current = null;
      dropped = false;
      acquire();
    };
    const onOffline = () => {
      setOffline(true);
      setConnection("error");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      disposed = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [idsKey, enabled]);

  return useMemo(() => {
    const configured = isSupabaseConfigured() && enabled && idsKey.length > 0;
    return {
      locations,
      connection,
      offline,
      lastErrorAt,
      /** False when we never subscribed (no supabase / no ids / disabled). */
      live: configured,
    };
  }, [locations, connection, offline, lastErrorAt, enabled, idsKey]);
}

/**
 * One-shot query of currently-available drivers near `center`, sorted by
 * distance. RLS restricts this to non-offline rows; the client never reads
 * more than it needs. Falls back to `[]` when Supabase isn't configured.
 */
export async function fetchNearbyAvailableDrivers(center: LatLng, limit = 8): Promise<Driver[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("driver_locations")
    .select(
      "driver_id, status, latitude, longitude, heading, speed_kmh, accuracy_m, device_ts, updated_at",
    )
    .eq("status", "available")
    .limit(limit * 3);
  if (error) return [];

  const rows = (data ?? []) as unknown as DriverLocationRow[];
  return rows
    .map((row) => ({ row, dist: haversine(center, { lat: row.latitude, lng: row.longitude }) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(({ row }) => rowToDriver(row));
}
