import { useMapMarker } from "../use-marker";
import { locationPinIcon } from "../icons";
import type { LatLng } from "@/lib/ride/types";

const STOP_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"];

export function StopMarker({
  index,
  position,
  label,
  zIndex = 5,
}: {
  index: number;
  position: LatLng | null;
  label?: string;
  zIndex?: number;
}) {
  useMapMarker([index, position?.lat, position?.lng, label, zIndex], (gmaps) => {
    if (!position) return null;
    return {
      position,
      title: label ?? `Stop ${index + 1}`,
      zIndex,
      icon: locationPinIcon(gmaps, STOP_COLORS[index % STOP_COLORS.length], 24),
    };
  });

  return null;
}
