import { useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { loadGoogleMaps, mapColorScheme } from "@/lib/google-maps";
import { useTheme } from "@/hooks/use-theme";
import { interpolate, type LatLng } from "@/lib/sa-places";

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-white/5 border-b border-white/10"
      style={{ height }}
      aria-hidden
    />
  );
}

type LiveMapProps = {
  from: LatLng;
  to: LatLng;
  /** 0–100 progress of the vehicle along the route */
  progress: number;
  height?: number;
  labels?: [string, string];
};

function LiveMapInner({ from, to, progress, height = 320, labels }: LiveMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const vehicleRef = useRef<google.maps.Marker | null>(null);
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        const map = new maps.Map(ref.current, {
          center: interpolate(from, to, 0.5),
          zoom: 7,
          disableDefaultUI: true,
          zoomControl: true,
          colorScheme: mapColorScheme(theme),

        });
        mapRef.current = map;

        new maps.Polyline({
          path: [from, to],
          map,
          strokeColor: "#10b981",
          strokeOpacity: 0.9,
          strokeWeight: 4,
        });

        new maps.Marker({
          position: from,
          map,
          title: labels?.[0] ?? "Pickup",
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        new maps.Marker({
          position: to,
          map,
          title: labels?.[1] ?? "Drop-off",
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        vehicleRef.current = new maps.Marker({
          position: interpolate(from, to, progress / 100),
          map,
          title: "Live position",
          icon: {
            path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: "#10b981",
            strokeWeight: 3,
            rotation:
              (Math.atan2(to.lng - from.lng, to.lat - from.lat) * 180) / Math.PI,
          },
        });

        const bounds = new maps.LatLngBounds();
        bounds.extend(from);
        bounds.extend(to);
        map.fitBounds(bounds, 48);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.lat, from.lng, to.lat, to.lng, theme]);

  useEffect(() => {
    vehicleRef.current?.setPosition(interpolate(from, to, progress / 100));
  }, [progress, from, to]);

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm text-muted-foreground border-b border-white/10"
        style={{ height }}
      >
        Live map unavailable — {error}
      </div>
    );
  }

  return <div ref={ref} style={{ height }} className="w-full" />;
}

export function LiveMap(props: LiveMapProps) {
  return (
    <ClientOnly fallback={<Skeleton height={props.height ?? 320} />}>
      <LiveMapInner {...props} />
    </ClientOnly>
  );
}

type NetworkMapProps = {
  hubs: { name: string; province: string; coords: LatLng; volume: string }[];
  corridors: { name: string; path: [LatLng, LatLng]; load: string }[];
  height?: number;
  onSelectHub?: (name: string) => void;
};

function NetworkMapInner({ hubs, corridors, height = 460, onSelectHub }: NetworkMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        const map = new maps.Map(ref.current, {
          center: { lat: -28.8, lng: 25.5 },
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          colorScheme: mapColorScheme(theme),
        });

        const info = new maps.InfoWindow();

        corridors.forEach((c) => {
          new maps.Polyline({
            path: c.path,
            map,
            strokeColor: "#10b981",
            strokeOpacity: 0.5,
            strokeWeight: 3,
          });
        });

        hubs.forEach((h) => {
          const marker = new maps.Marker({
            position: h.coords,
            map,
            title: h.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#10b981",
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
          marker.addListener("click", () => {
            info.setContent(
              `<div style="color:#111;font-family:system-ui;font-size:13px"><strong>${h.name}</strong><br/>${h.province}<br/>${h.volume}</div>`,
            );
            info.open({ map, anchor: marker });
            onSelectHub?.(h.name);
          });
        });
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, hubs, corridors]);

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        Network map unavailable — {error}
      </div>
    );
  }

  return <div ref={ref} style={{ height }} className="w-full" />;
}

export function NetworkMap(props: NetworkMapProps) {
  return (
    <ClientOnly fallback={<Skeleton height={props.height ?? 460} />}>
      <NetworkMapInner {...props} />
    </ClientOnly>
  );
}
