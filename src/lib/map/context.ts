import { createContext, useContext } from "react";

export type MapContextValue = {
  map: google.maps.Map | null;
  gmaps: typeof google.maps | null;
  theme: "dark" | "light";
};

export const MapContext = createContext<MapContextValue>({
  map: null,
  gmaps: null,
  theme: "light",
});

/** Access the initialised Google Map instance + namespace from any layer/marker. */
export const useMapContext = (): MapContextValue => useContext(MapContext);
