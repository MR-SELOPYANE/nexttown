import { useEffect, useRef } from "react";
import { useMapMarker } from "../use-marker";
import { useMapContext } from "../context";
import { driverIcon } from "../icons";
import { haversine } from "@/lib/sa-places";
import type { Driver } from "@/lib/ride/types";

/**
 * A single driver on the map. The marker renders the latest *reported*
 * position and never invents one.
 *
 * SMOOTH ANIMATION
 * Consecutive real GPS fixes (typically ~2–4 s apart) are bridged with a
 * short rAF lerp so the marker glides between real positions rather than
 * snapping. This is NOT route-following or interpolating a progress fraction
 * as GPS: the endpoints are always real fixes, and if a gap is too large to
 * be a plausible move (teleport / fresh session) the marker snaps instead.
 * Heading is applied at 15° icon bins while in motion.
 *
 * The animation loop owns the marker's `position` and current icon;
 * `useMapMarker` builds the marker with a position-free, stable option set so
 * the marker is never re-created and never snaps itself.
 */

const BIN = 15; // heading icon bin in degrees
const SNAP_METERS = 2000; // larger gaps snap instead of animating
const MIN_MS = 350;
const MAX_MS = 1100;

type AnimFrames = {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  start: number;
  duration: number;
};

function shortestAngleDiff(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function DriverMarker({
  driver,
  active = false,
  zIndex,
}: {
  driver: Driver;
  /** Highlight style used for the ride's assigned driver. */
  active?: boolean;
  zIndex?: number;
}) {
  const loc = driver.location;
  const layer = zIndex ?? (active ? 999 : 4);
  const { map, gmaps } = useMapContext();

  const markerRef = useMapMarker(
    // Stable inputs — the position is owned by the animation loop below. The
    // `locKey` shows/hides the marker when a driver first becomes located
    // (build() returns null for off-map drivers) without triggering per-fix
    // snaps.
    [driver.id, active, driver.name, loc ? `${loc.updatedAt}-${loc.heading}` : "off"],
    (_g, _map) => {
      if (!loc) return null;
      const icon = driverIcon(_g, driver, active);
      return {
        title: driver.name,
        zIndex: layer,
        icon: {
          url: icon.url,
          scaledSize: icon.scaledSize,
          anchor: icon.anchor,
        },
      };
    },
  );

  const animRef = useRef<AnimFrames | null>(null);
  const headingRef = useRef<number>(0);
  const iconBinRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const layerRef = useRef(layer);
  layerRef.current = layer;

  // ---- apply a heading icon if the 15° bin changed --------------------------
  const applyHeading = (heading: number) => {
    const polished = Number.isFinite(heading) ? ((heading % 360) + 360) % 360 : 0;
    const bin = Math.round(polished / BIN) * BIN;
    if (iconBinRef.current === bin) return;
    iconBinRef.current = bin;
    if (gmaps && markerRef.current && loc) {
      const icon = driverIcon(gmaps, { ...driver, location: { ...loc, heading: bin } }, active);
      markerRef.current.setIcon({
        url: icon.url,
        scaledSize: icon.scaledSize,
        anchor: icon.anchor,
      });
    }
  };

  // ---- position the marker at a point immediately (no animation) ------------
  const snapTo = (lat: number, lng: number, heading: number) => {
    if (!gmaps || !markerRef.current) return;
    markerRef.current.setPosition({ lat, lng });
    applyHeading(heading);
  };

  // ---- start a lerp from `from` to the real fix `target` --------------------
  const startAnimation = (
    from: { lat: number; lng: number },
    target: { lat: number; lng: number },
    heading: number,
  ) => {
    if (!gmaps || !markerRef.current) return;
    const dist = haversine(from, target);
    const duration = Math.min(MAX_MS, Math.max(MIN_MS, dist * 25));

    const lastHeading = headingRef.current;

    animRef.current = { from, to: target, start: performance.now(), duration };
    headingRef.current = heading;
    applyHeading(lastHeading);

    const tick = (now: number) => {
      const anim = animRef.current;
      if (!anim) return;
      const t = Math.min(1, Math.max(0, (now - anim.start) / anim.duration));
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const lat = anim.from.lat + (anim.to.lat - anim.from.lat) * eased;
      const lng = anim.from.lng + (anim.to.lng - anim.from.lng) * eased;
      markerRef.current?.setPosition({ lat, lng });

      // heading interpolates on the shortest arc; icon refreshes at 15° bins
      const head = lastHeading + shortestAngleDiff(lastHeading, heading) * eased;
      applyHeading(head);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        applyHeading(heading); // final heading at the new fix
        headingRef.current = heading;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // ---- each new fix ("target") is moved to with a bridge --------------------
  const locKey = loc ? `${loc.updatedAt}-${loc.lat}-${loc.lng}` : "none";
  useEffect(() => {
    if (!gmaps || !map) return;
    const target = loc ? { lat: loc.lat, lng: loc.lng } : null;
    const heading = loc?.heading ?? 0;
    if (!target) {
      markerRef.current?.setMap(null);
      return;
    }

    const current = markerRef.current?.getPosition();
    const anim = animRef.current;

    if (current && !anim) {
      // marker already sitting somewhere: decide snap vs animate
      const dist = haversine({ lat: current.lat(), lng: current.lng() }, target);
      if (dist > SNAP_METERS) {
        snapTo(target.lat, target.lng, heading);
      } else if (dist < 1.5) {
        snapTo(target.lat, target.lng, heading);
      } else {
        startAnimation({ lat: current.lat(), lng: current.lng() }, target, heading);
      }
    } else if (anim) {
      // mid-flight fix: retarget from the current interpolated position
      const elapsed = performance.now() - anim.start;
      const t = Math.min(1, elapsed / anim.duration);
      const lat = anim.from.lat + (anim.to.lat - anim.from.lat) * t;
      const lng = anim.from.lng + (anim.to.lng - anim.from.lng) * t;
      const dist = haversine({ lat, lng }, target);
      if (dist > SNAP_METERS) {
        snapTo(target.lat, target.lng, heading);
      } else {
        startAnimation({ lat, lng }, target, heading);
      }
    } else {
      // first fix ever: place immediately
      snapTo(target.lat, target.lng, heading);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmaps, map, markerRef, locKey]);

  // ---- unmount: halt any running loop ---------------------------------------
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      animRef.current = null;
    },
    [],
  );

  return null;
}
