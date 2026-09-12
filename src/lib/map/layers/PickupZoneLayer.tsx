import { useEffect, useRef } from "react";
import { useMapContext } from "../context";
import type { LatLng } from "@/lib/ride/types";

/**
 * Renders the hailing/pickup zone — a soft circle around the pickup point so
 * riders immediately understand where the driver is heading.
 */
export function PickupZoneLayer({
  center,
  radiusKm,
  zIndex = 1,
}: {
  center?: LatLng | null;
  radiusKm?: number;
  zIndex?: number;
}) {
  const { map, gmaps } = useMapContext();
  const circleRef = useRef<google.maps.Circle | null>(null);
  const key = `${center?.lat ?? ""},${center?.lng ?? ""}|${radiusKm ?? ""}`;

  useEffect(() => {
    if (!map || !gmaps) return;
    if (!center || !radiusKm || radiusKm <= 0) {
      circleRef.current?.setMap(null);
      return;
    }
    if (!circleRef.current) {
      circleRef.current = new gmaps.Circle({
        map,
        center,
        radius: radiusKm * 1000,
        fillColor: "#10b981",
        fillOpacity: 0.08,
        strokeColor: "#10b981",
        strokeOpacity: 0.3,
        strokeWeight: 1.5,
        zIndex,
        clickable: false,
      });
    } else {
      circleRef.current.setMap(map);
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gmaps, key, zIndex]);

  useEffect(
    () => () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    },

    [map, gmaps],
  );

  return null;
}
