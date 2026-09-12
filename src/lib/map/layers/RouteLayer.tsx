import { useEffect, useRef } from "react";
import { useMapContext } from "../context";
import { getDirections } from "@/lib/google-maps";
import { getRouteInfo } from "@/lib/eta/service";
import { isValidLatLng, nearestPathIndex } from "@/lib/ride/geo";
import type { Driver, LatLng } from "@/lib/ride/types";

/**
 * Route layer — purely visual.
 *
 * Draws two polylines:
 *  - dashed cyan  : driver → pickup (updates live as the driver's real
 *                   location moves, without re-fetching directions)
 *  - solid green  : pickup → dropoff, threaded through any stops
 *
 * It consumes decoded directions and never produces ride state.
 */
export function RouteLayer({
  pickup,
  dropoff,
  stops = [],
  activeDriver,
}: {
  pickup: LatLng | null;
  dropoff: LatLng | null;
  stops?: LatLng[];
  activeDriver?: Driver | null;
}) {
  const { map, gmaps } = useMapContext();
  const pickupLineRef = useRef<google.maps.Polyline | null>(null);
  const tripLineRef = useRef<google.maps.Polyline | null>(null);
  const pickupPointsRef = useRef<LatLng[]>([]);
  const fetchCount = useRef(0);

  const hasTrip = !!pickup && !!dropoff && isValidLatLng(pickup) && isValidLatLng(dropoff);
  const pickupKey = pickup ? `${pickup.lat},${pickup.lng}` : "";
  const dropoffKey = dropoff ? `${dropoff.lat},${dropoff.lng}` : "";
  const stopsKey = stops.map((s) => `${s.lat},${s.lng}`).join("|");

  const driverStatus = activeDriver?.location?.status;
  const driverLocKey = activeDriver?.location
    ? `${activeDriver.location.lat},${activeDriver.location.lng}`
    : "";
  const driverIdentityKey = `${activeDriver?.id ?? ""}|${driverStatus ?? ""}`;
  const showPickupRoute =
    hasTrip &&
    !!activeDriver?.location &&
    ["enroute", "arrived", "available"].includes(driverStatus ?? "");

  /* -------- pickup → destination route (with stops) -------- */
  useEffect(() => {
    tripLineRef.current?.setMap(null);
    tripLineRef.current = null;
    if (!map || !gmaps || !hasTrip || !pickup || !dropoff) return;

    let cancelled = false;
    const count = ++fetchCount.current;
    const fallback = (): LatLng[] => [pickup, ...stops, dropoff];

    (async () => {
      let points: LatLng[];
      try {
        const info = await getDirections(pickup, dropoff, stops.length > 0 ? stops : undefined);
        points = info.points.length > 0 ? info.points : fallback();
      } catch {
        points = fallback();
      }
      if (cancelled || count !== fetchCount.current) return;
      tripLineRef.current = new gmaps.Polyline({
        path: points,
        map,
        strokeColor: "#10b981",
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gmaps, pickupKey, dropoffKey, stopsKey, hasTrip]);

  /* -------- driver → pickup route (fetch on assignment) -------- */
  useEffect(() => {
    pickupLineRef.current?.setMap(null);
    pickupLineRef.current = null;
    pickupPointsRef.current = [];

    if (!map || !gmaps || !showPickupRoute || !pickup || !activeDriver?.location) return;

    const origin = { lat: activeDriver.location.lat, lng: activeDriver.location.lng };
    const count = ++fetchCount.current;
    let cancelled = false;

    const draw = (points: LatLng[]) => {
      if (cancelled || count !== fetchCount.current) return;
      pickupPointsRef.current = points;
      if (pickupLineRef.current) {
        pickupLineRef.current.setPath(points);
        pickupLineRef.current.setMap(map);
      } else {
        pickupLineRef.current = new gmaps.Polyline({
          path: points,
          map,
          strokeColor: "#06b6d4",
          strokeOpacity: 0.6,
          strokeWeight: 3,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#06b6d4",
              },
              offset: "0",
              repeat: "12px",
            },
          ],
        });
      }
    };

    getRouteInfo(origin, pickup)
      .then((info) => draw(info && info.points.length > 0 ? info.points : [origin, pickup]))
      .catch(() => draw([origin, pickup]));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gmaps, pickupKey, driverIdentityKey, showPickupRoute]);

  /* -------- keep the dashed line's origin glued to the driver's real position -------- */
  useEffect(() => {
    const line = pickupLineRef.current;
    const pts = pickupPointsRef.current;
    const loc = activeDriver?.location;
    if (!map || !gmaps || !line || !loc || pts.length < 2) return;
    const nearest = nearestPathIndex(pts, { lat: loc.lat, lng: loc.lng });
    if (nearest < 0) return;
    line.setPath([{ lat: loc.lat, lng: loc.lng }, ...pts.slice(nearest)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gmaps, pickupKey, driverLocKey, showPickupRoute]);

  return null;
}
