import { useMapMarker } from "../use-marker";
import { locationPinIcon } from "../icons";
import type { LatLng } from "@/lib/ride/types";

export function PickupMarker({
  position,
  label,
  zIndex = 10,
}: {
  position: LatLng | null;
  label?: string;
  zIndex?: number;
}) {
  useMapMarker([position?.lat, position?.lng, label, zIndex], (gmaps) => {
    if (!position) return null;
    return {
      position,
      title: label ?? "Pickup",
      zIndex,
      icon: locationPinIcon(gmaps, "#10b981", 30),
    };
  });

  return null;
}
