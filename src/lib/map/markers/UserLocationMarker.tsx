import { useMapMarker } from "../use-marker";
import { userLocationIcon } from "../icons";
import type { LatLng } from "@/lib/ride/types";

/** Green "you are here" dot rendered for the passenger's GPS position. */
export function UserLocationMarker({
  position,
  zIndex = 30,
}: {
  position: LatLng | null;
  zIndex?: number;
}) {
  useMapMarker([position?.lat, position?.lng, zIndex], (gmaps) => {
    if (!position) return null;
    return {
      position,
      title: "You are here",
      zIndex,
      icon: userLocationIcon(gmaps),
    };
  });

  return null;
}
