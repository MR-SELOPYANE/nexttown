import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { useMapContext } from "./context";

/**
 * Manages the full lifecycle of a Google Maps marker tied to the current map
 * instance: create once, update options when inputs change, hide when the
 * build function returns null, and destroy on unmount / map swap.
 */
export function useMapMarker(
  deps: DependencyList,
  build: (gmaps: typeof google.maps, map: google.maps.Map) => google.maps.MarkerOptions | null,
): RefObject<google.maps.Marker | null> {
  const { map, gmaps } = useMapContext();
  const ref = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || !gmaps) {
      ref.current?.setMap(null);
      return;
    }
    const options = build(gmaps, map);
    if (!options) {
      ref.current?.setMap(null);
      return;
    }
    if (!ref.current) {
      ref.current = new gmaps.Marker({ ...options, map });
    } else {
      ref.current.setOptions(options);
      ref.current.setMap(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gmaps, ...deps]);

  useEffect(
    () => () => {
      ref.current?.setMap(null);
      ref.current = null;
    },

    [map, gmaps],
  );

  return ref;
}
