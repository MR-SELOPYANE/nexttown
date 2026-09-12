import { useCallback, useEffect, useRef, useState } from "react";
import { getDirections } from "@/lib/google-maps";
import { haversine } from "@/lib/sa-places";
import type { Driver, DriverLocation, LatLng, Ride, RideLeg, RideStop } from "./types";
import { startDrivingFeed, type DrivingFeed } from "./driver-feed";
import { useRouteEta, type EtaServiceOptions } from "@/lib/eta/service";
import { etaForDistanceKm, isValidLatLng, offsetKm } from "./geo";

/**
 * RIDE TRACKER
 * ------------------------------------------------------------------
 * Owns the ride lifecycle for a single screen: assignment, the live driver
 * location feed, leg transitions and dynamic ETA.
 *
 * This is the *decider* (ride logic). The map is only a renderer fed by
 * `ride.activeDriver.location` — it never simulates the driver.
 *
 * The feed itself is a demo `DriverLocationSource`; production swaps in a real
 * one. The tracker updates are identical regardless of transport.
 */

export type RideTrackerOptions = {
  pickup: LatLng;
  dropoff: LatLng;
  stops?: LatLng[];
  pickupLabel?: string;
  dropoffLabel?: string;
  stopLabels?: string[];
  /** Pool of available drivers to pick from with `assign()`. */
  drivers?: Driver[];
  /** Average speed used by the demo feed / ETA estimation. */
  speedKmh?: number;
  /** Distance (km) treated as "arrived". */
  arrivalKm?: number;
  /**
   * ETA refresh cadence (ms). The ETA service is additionally rate-limited,
   * so this is an upper bound on how often the Directions API is hit.
   * Default 30s.
   */
  etaRefreshIntervalMs?: number;
  /** ETA service tuning (traffic-aware routing, cache, rate-limit, fallback). */
  etaOptions?: EtaServiceOptions;
  /**
   * When true the tracker advances state itself (`assigned → arrived →
   * completed`) and fires the matching callbacks. When false the caller drives
   * transitions with `startTrip()` / `finish()` (used by driver consoles).
   */
  autoTransition?: boolean;
  onArrived?: () => void;
  onCompleted?: () => void;
  /**
   * When true the tracker runs in LIVE mode: the simulated driving feed is
   * disabled entirely and `liveLocation` is the authoritative position. Used
   * for real GPS on both driver consoles (own device) and passenger screens
   * (Supabase Realtime feed of the assigned driver).
   */
  live?: boolean;
  /**
   * The latest real driver position. Only applies when `live` is true. The
   * tracker never invents movement — it mirrors and derives state/ETA only.
   */
  liveLocation?: DriverLocation | null;
  /** True when a live subscription is currently connected (drives UI). */
  liveConnected?: boolean;
  /** Changing this value resets the tracker (e.g. switching tracking pages). */
  resetKey?: string;
};

export type RideTracker = {
  ride: Ride;
  /** The leg the active driver is currently performing. */
  leg: RideLeg | null;
  /** Fraction of the current leg completed by the driver's real location (0–100). */
  progressPct: number;
  /** Whether the tracker is in live mode (no simulated feed). */
  live: boolean;
  /** Whether the live source reports a connected subscription. */
  liveConnected: boolean;
  /** Assign the active driver and start the driver → pickup leg. */
  assign: (driver?: Driver) => void;
  /** Start the pickup → destination leg ("rider on board"). */
  startTrip: () => void;
  /** Snap the driver to the destination and mark the ride complete. */
  finish: () => void;
  reset: () => void;
};

function makeRide(options: RideTrackerOptions, now = Date.now()): Ride {
  return {
    id: `ride-${now}`,
    state: "searching",
    pickup: options.pickup,
    dropoff: options.dropoff,
    stops: options.stops ?? [],
    pickupLabel: options.pickupLabel ?? "",
    dropoffLabel: options.dropoffLabel ?? "",
    stopLabels: options.stopLabels ?? [],
    activeDriver: null,
    nearbyDrivers: options.drivers ?? [],
    etaMin: null,
    eta: { source: "none", loading: false, stale: false, error: false },
    distanceKm: 0,
    startedAt: null,
    createdAt: now,
  };
}

export function useRideTracker(options: RideTrackerOptions): RideTracker {
  const optsRef = useRef(options);
  optsRef.current = options;

  const [ride, setRide] = useState<Ride>(() => makeRide(options));
  const [leg, setLegState] = useState<RideLeg | null>(null);
  const [progressPct, setProgressPct] = useState(0);

  const rideRef = useRef(ride);
  const legRef = useRef<RideLeg | null>(null);
  const feedRef = useRef<DrivingFeed | null>(null);
  const generation = useRef(0);
  const legStartedAtRef = useRef(0);
  const arrivedFiredRef = useRef(false);
  const completedFiredRef = useRef(false);

  useEffect(() => {
    rideRef.current = ride;
  }, [ride]);

  const setLeg = (next: RideLeg | null) => {
    legRef.current = next;
    setLegState(next);
  };

  const clearFeed = () => {
    feedRef.current?.dispose();
    feedRef.current = null;
  };

  // Cleanup on unmount.
  useEffect(() => () => clearFeed(), []);

  // Reset when the caller swaps to a different ride context.
  const reset = useCallback(() => {
    generation.current += 1;
    clearFeed();
    setLeg(null);
    setProgressPct(0);
    legStartedAtRef.current = 0;
    arrivedFiredRef.current = false;
    completedFiredRef.current = false;
    setRide((r) => {
      const fresh = makeRide(optsRef.current, r.createdAt);
      return { ...fresh, nearbyDrivers: r.nearbyDrivers };
    });
  }, []);

  const { resetKey } = options;
  useEffect(() => {
    if (!resetKey) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Keep ride metadata (coords, labels, nearby drivers) in sync with props.
  useEffect(() => {
    setRide((r) => ({
      ...r,
      pickup: isValidLatLng(options.pickup) ? options.pickup : r.pickup,
      dropoff: isValidLatLng(options.dropoff) ? options.dropoff : r.dropoff,
      stops: options.stops ?? r.stops,
      pickupLabel: options.pickupLabel ?? r.pickupLabel,
      dropoffLabel: options.dropoffLabel ?? r.dropoffLabel,
      stopLabels: options.stopLabels ?? r.stopLabels,
      nearbyDrivers: options.drivers ?? r.nearbyDrivers,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options.pickup?.lat,
    options.pickup?.lng,
    options.dropoff?.lat,
    options.dropoff?.lng,
    options.stops,
    options.pickupLabel,
    options.dropoffLabel,
    options.stopLabels,
    options.drivers,
  ]);

  /** Start a driving feed over `points`; streams locations into the ride state. */
  const startFeed = (
    points: LatLng[],
    start: LatLng,
    status: DriverLocation["status"],
    target: LatLng,
  ) => {
    const o = optsRef.current;
    clearFeed();
    const feed = startDrivingFeed({
      points,
      start,
      speedKmh: o.speedKmh ?? 40,
      status,
      onLocation: (loc, meta) => {
        setProgressPct(
          meta.totalKm > 0 ? Math.min(100, (meta.traveledKm / meta.totalKm) * 100) : 0,
        );
        setRide((r) => {
          if (!r.activeDriver) return r;
          return {
            ...r,
            activeDriver: { ...r.activeDriver, location: loc },
            distanceKm: meta.totalKm,
          };
        });
      },
      onReached: () => onFeedReached(target),
    });
    feedRef.current = feed;
  };

  const onFeedReached = (target: LatLng) => {
    const o = optsRef.current;
    const currentLeg = legRef.current;
    const nextStatus: DriverLocation["status"] =
      currentLeg === "to_dropoff" ? "completed" : "arrived";
    const nextState: Ride["state"] =
      currentLeg === "to_dropoff" ? "completed" : o.autoTransition ? "arrived" : "assigned";

    setProgressPct(100);
    setRide((r) => {
      if (!r.activeDriver) return r;
      const base = r.activeDriver.location ?? {
        lat: target.lat,
        lng: target.lng,
        heading: 0,
        speedKmh: 0,
        updatedAt: Date.now(),
        status: nextStatus,
      };
      return {
        ...r,
        state: nextState,
        activeDriver: {
          ...r.activeDriver,
          location: {
            ...base,
            lat: target.lat,
            lng: target.lng,
            status: nextStatus,
            speedKmh: 0,
            updatedAt: Date.now(),
          },
        },
        etaMin: 1,
      };
    });
    clearFeed();

    if (currentLeg === "to_pickup") {
      if (o.autoTransition) o.onArrived?.();
    } else {
      if (o.autoTransition) o.onCompleted?.();
    }
  };

  /** Assign a driver and begin the driver → pickup leg. */
  const assign = useCallback((driver?: Driver) => {
    const o = optsRef.current;
    if (!isValidLatLng(o.pickup) || !isValidLatLng(o.dropoff)) return;
    const chosen = driver ?? o.drivers?.[0];
    if (!chosen) return;

    const start: LatLng = chosen.location
      ? { lat: chosen.location.lat, lng: chosen.location.lng }
      : offsetKm(o.pickup, 2, 4);

    const generationNow = ++generation.current;
    clearFeed();
    setLeg("to_pickup");
    setProgressPct(0);

    const initialLoc: DriverLocation = chosen.location ?? {
      ...start,
      heading: 0,
      status: "enroute",
      speedKmh: 0,
      updatedAt: Date.now(),
    };

    setRide((r) => ({
      ...r,
      id: `ride-${Date.now()}`,
      state: "assigned",
      activeDriver: {
        ...chosen,
        location: { ...initialLoc, status: "enroute", updatedAt: Date.now() } as DriverLocation,
      },
      etaMin: null,
      eta: { source: "none", loading: false, stale: false, error: false },
      distanceKm: 0,
      startedAt: Date.now(),
    }));

    const begin = (points: LatLng[]) => {
      if (generation.current !== generationNow) return;
      startFeed(points, start, "enroute", o.pickup);
    };

    legStartedAtRef.current = Date.now();
    if (o.live) return; // live mode: no simulated feed; `liveLocation` streams real fixes

    getDirections(start, o.pickup)
      .then((info) => begin(info.points.length > 0 ? info.points : [start, o.pickup]))
      .catch(() => begin([start, o.pickup]));
    // startFeed is re-created per render and reads optsRef inside; keeping it
    // out of the deps avoids re-assigning the driver every feed tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Begin the pickup → destination leg ("rider on board"). */
  const startTrip = useCallback(() => {
    const o = optsRef.current;
    const r = rideRef.current;
    const driver = r?.activeDriver;
    if (!driver) return;
    if (!isValidLatLng(o.dropoff)) return;

    const start: LatLng = driver.location
      ? { lat: driver.location.lat, lng: driver.location.lng }
      : o.pickup;
    const stops = (o.stops ?? []).filter(isValidLatLng);
    const generationNow = ++generation.current;
    clearFeed();
    setLeg("to_dropoff");
    setProgressPct(0);

    setRide((rd) => ({
      ...rd,
      state: "ontrip",
      activeDriver: rd.activeDriver
        ? {
            ...rd.activeDriver,
            location: {
              ...(rd.activeDriver.location as DriverLocation),
              status: "ontrip",
              updatedAt: Date.now(),
            },
          }
        : rd.activeDriver,
      etaMin: null,
      eta: { source: "none", loading: false, stale: false, error: false },
      distanceKm: 0,
      startedAt: Date.now(),
    }));

    const begin = (points: LatLng[]) => {
      if (generation.current !== generationNow) return;
      startFeed(points, start, "ontrip", o.dropoff);
    };

    legStartedAtRef.current = Date.now();
    if (o.live) return; // live mode: real positions stream via `liveLocation`

    getDirections(start, o.dropoff, stops.length > 0 ? stops : undefined)
      .then((info) => begin(info.points.length > 0 ? info.points : [start, ...stops, o.dropoff]))
      .catch(() => begin([start, ...stops, o.dropoff]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** LIVE MODE: mirror real positions, derive ETA/progress and state from the
   *  driver's actual reported status. Never simulates movement. */
  const liveMode = options.live === true;
  const liveLocationKey = options.liveLocation
    ? `${options.liveLocation.updatedAt}-${options.liveLocation.lat}-${options.liveLocation.lng}`
    : null;
  useEffect(() => {
    if (!liveMode) return;
    const live = optsRef.current.liveLocation;
    const driver = rideRef.current?.activeDriver;
    if (!live || !driver) return;
    const state = rideRef.current.state;
    const currentLeg = legRef.current;

    // mirror the authoritative position into the ride the map renders
    setRide((r) =>
      r.activeDriver ? { ...r, activeDriver: { ...r.activeDriver, location: live } } : r,
    );

    // input leg for progress/ETA estimation
    const target: LatLng =
      currentLeg === "to_dropoff" ? optsRef.current.dropoff : optsRef.current.pickup;
    const distKm = haversine({ lat: live.lat, lng: live.lng }, target);
    const etaMin = etaForDistanceKm(distKm, optsRef.current.speedKmh ?? 40);

    // time/ETA-based progress ESTIMATE (never a position: the marker renders
    // only real `live` fixes).
    let progress = 0;
    if (currentLeg && legStartedAtRef.current > 0) {
      const etaMs = etaMin * 60_000;
      progress =
        etaMs > 0 ? Math.min(100, ((Date.now() - legStartedAtRef.current) / etaMs) * 100) : 0;
    }
    if (live.status === "arrived" || live.status === "completed") progress = 100;

    setProgressPct(progress);

    // automatic state transitions (passenger screens, autoTransition: true)
    const auto = optsRef.current.autoTransition === true;
    if (!auto) return;

    if (live.status === "arrived" && state === "assigned" && currentLeg === "to_pickup") {
      if (!arrivedFiredRef.current) {
        arrivedFiredRef.current = true;
        setLeg("to_pickup");
        setProgressPct(100);
        setRide((r) => ({ ...r, state: "arrived" as Ride["state"] }));
        optsRef.current.onArrived?.();
      }
      return;
    }

    if (live.status === "ontrip" && (state === "arrived" || state === "assigned")) {
      // rider on board: driver just started the trip leg
      setLeg("to_dropoff");
      legStartedAtRef.current = Date.now();
      setRide((r) => ({ ...r, state: "ontrip" as Ride["state"] }));
      return;
    }

    if (
      (live.status === "completed" || live.status === "offline") &&
      state === "ontrip" &&
      currentLeg === "to_dropoff"
    ) {
      // driver finished the trip and went in-service/offline
      if (!completedFiredRef.current) {
        completedFiredRef.current = true;
        setLeg("to_dropoff");
        setProgressPct(100);
        setRide((r) => ({ ...r, state: "completed" as Ride["state"] }));
        optsRef.current.onCompleted?.();
      }
    }
  }, [liveMode, liveLocationKey]);

  /** Snap the driver to the destination and complete the ride. */
  const finish = useCallback(() => {
    const o = optsRef.current;
    const driver = rideRef.current?.activeDriver;
    if (!driver) return;
    generation.current += 1;
    clearFeed();
    setLeg("to_dropoff");
    setProgressPct(100);
    setRide((r) => {
      if (!r.activeDriver) return r;
      const base = r.activeDriver.location ?? {
        lat: o.dropoff.lat,
        lng: o.dropoff.lng,
        heading: 0,
        speedKmh: 0,
        updatedAt: Date.now(),
        status: "completed" as const,
      };
      return {
        ...r,
        state: "completed",
        activeDriver: {
          ...r.activeDriver,
          // live mode: keep the real GPS coordinate; only flag completion
          location:
            o.live === true
              ? { ...base, status: "completed", updatedAt: Date.now() }
              : {
                  ...base,
                  lat: o.dropoff.lat,
                  lng: o.dropoff.lng,
                  status: "completed",
                  speedKmh: 0,
                  updatedAt: Date.now(),
                },
        },
        etaMin: 1,
        distanceKm: r.distanceKm,
      };
    });
  }, []);

  /* ── ROUTE-BASED ETA ───────────────────────────────────────────────
   * The ETA service resolves a real routed (traffic-aware) duration from the
   * driver's CURRENT position to the active leg's target (pickup or dropoff).
   * It is cached + rate-limited, so rapid position updates / re-renders do
   * not hammer the Directions API. `eta` also carries loading/stale/fallback
   * metadata for presentation. */
  const driverPos = ride.activeDriver?.location;
  const hasDriver = !!driverPos && isValidLatLng({ lat: driverPos.lat, lng: driverPos.lng });
  const etaOrigin: LatLng | null = hasDriver ? { lat: driverPos!.lat, lng: driverPos!.lng } : null;
  const etaTarget: LatLng | null =
    leg === "to_dropoff"
      ? isValidLatLng(ride.dropoff)
        ? ride.dropoff
        : null
      : leg === "to_pickup"
        ? isValidLatLng(ride.pickup)
          ? ride.pickup
          : null
        : null;

  const etaActive = leg !== null && hasDriver && etaTarget !== null;
  const etaRefresh = optsRef.current.etaRefreshIntervalMs ?? 30_000;
  const routeEta = useRouteEta({
    origin: etaActive ? etaOrigin : null,
    destination: etaActive ? etaTarget : null,
    refreshIntervalMs: optsRef.current.live ? etaRefresh : 0,
    options: optsRef.current.etaOptions,
  });

  // Merge the service ETA into the exposed ride only while a leg is active.
  const rideWithEta: Ride =
    leg !== null &&
    (ride.state === "assigned" || ride.state === "ontrip") &&
    routeEta.eta.etaMin != null
      ? {
          ...ride,
          etaMin: routeEta.eta.etaMin,
          eta: {
            source: routeEta.eta.source,
            loading: routeEta.loading,
            stale: routeEta.eta.stale,
            error: routeEta.eta.error,
          },
        }
      : ride;

  return {
    ride: rideWithEta,
    leg,
    progressPct,
    live: liveMode,
    liveConnected: options.liveConnected === true,
    assign,
    startTrip,
    finish,
    reset,
  };
}

export type { RideLeg, RideStop };
