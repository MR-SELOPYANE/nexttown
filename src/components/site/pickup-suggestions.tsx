import { useEffect, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";
import type { LatLng } from "@/lib/sa-places";
import { Navigation, MapPin } from "lucide-react";

type Suggestion = { name: string; vicinity?: string; lat: number; lng: number; distanceM?: number };

type Props = {
  center: LatLng | null;
  onSelect: (coords: LatLng, name: string) => void;
  radius?: number;
  maxResults?: number;
};

export function PickupSuggestions({ center, onSelect, radius = 300, maxResults = 5 }: Props) {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!center) {
      setItems(null);
      return;
    }
    setLoading(true);
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;
        const service = new maps.places.PlacesService(document.createElement("div"));
        const loc = new maps.LatLng(center.lat, center.lng);
        service.nearbySearch(
          { location: loc, radius, type: "establishment" },
          (results, status) => {
            if (cancelled) return;
            if (status !== maps.places.PlacesServiceStatus.OK || !results) {
              setItems([]);
              setLoading(false);
              return;
            }
            const mapped = results
              .map((r) => {
                const loc = r.geometry?.location;
                if (!loc) return null;
                const d = maps.geometry?.spherical?.computeDistanceBetween
                  ? maps.geometry.spherical.computeDistanceBetween(
                      loc,
                      new maps.LatLng(center.lat, center.lng),
                    )
                  : 0;
                return {
                  name: r.name ?? r.vicinity ?? "Unknown",
                  vicinity: r.vicinity,
                  lat: loc.lat(),
                  lng: loc.lng(),
                  distanceM: Math.round(d),
                } as Suggestion;
              })
              .filter(Boolean) as Suggestion[];
            mapped.sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
            setItems(mapped.slice(0, maxResults));
            setLoading(false);
          },
        );
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [center, radius, maxResults]);

  if (!center) return null;

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => onSelect(center, "Current location")}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand/10 border border-brand/20 hover:bg-brand/15 transition-colors text-left"
      >
        <div className="size-8 rounded-full bg-brand flex items-center justify-center shrink-0">
          <Navigation className="size-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">Use current location</div>
          <div className="text-[11px] text-muted-foreground">GPS-detected position</div>
        </div>
      </button>

      {loading && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <div className="size-3 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          Finding nearby places…
        </div>
      )}

      {!loading && items && items.length === 0 && (
        <div className="px-3 py-2 text-xs text-muted-foreground">No nearby places found</div>
      )}

      {items?.map((it, i) => (
        <button
          key={i}
          onClick={() => onSelect({ lat: it.lat, lng: it.lng }, it.name)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
        >
          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <MapPin className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{it.name}</div>
            {it.vicinity && (
              <div className="text-[11px] text-muted-foreground truncate">{it.vicinity}</div>
            )}
          </div>
          {it.distanceM != null && (
            <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
              {it.distanceM} m
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default PickupSuggestions;
