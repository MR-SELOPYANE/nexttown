import { useMapMarker } from "../use-marker";
import { locationPinIcon } from "../icons";
import type { LatLng } from "@/lib/ride/types";

export function DropoffMarker({
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
      title: label ?? "Drop-off",
      zIndex,
      icon: locationPinIcon(gmaps, "#f59e0b", 30),
    };
  });

  return null;
}
