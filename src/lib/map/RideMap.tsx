import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { LocateFixed } from "lucide-react";
import { loadGoogleMaps, mapColorScheme } from "@/lib/google-maps";
import { useTheme } from "@/hooks/use-theme";
import { isValidLatLng } from "@/lib/ride/geo";
import type { Driver, LatLng } from "@/lib/ride/types";
import { MapContext } from "./context";
import { DriverLayer } from "./layers/DriverLayer";
import { RouteLayer } from "./layers/RouteLayer";
import { PickupZoneLayer } from "./layers/PickupZoneLayer";
import { PickupMarker } from "./markers/PickupMarker";
import { DropoffMarker } from "./markers/DropoffMarker";
import { StopMarker } from "./markers/StopMarker";
import { UserLocationMarker } from "./markers/UserLocationMarker";
import { crosshairIcon, locationPinIcon } from "./icons";

const DEFAULT_CENTER: LatLng = { lat: -26.2041, lng: 28.0473 };

export type MapPinMode = "pickup" | "dropoff" | null;

export type RideMapProps = {
  pickup?: LatLng | null;
  dropoff?: LatLng | null;
  stops?: LatLng[];
  userLocation?: LatLng | null;
  /** Explicit map centre (falls back to the user's location). */
  center?: LatLng | null;
  /** The ride's assigned driver — rendered with the highlighted marker. */
  activeDriver?: Driver | null;
  /** Nearby available drivers to show while planning. */
  nearbyDrivers?: Driver[];
  /** Highlight the hailing zone around the pickup point. */
  showPickupZone?: boolean;
  pickupRadiusKm?: number;
  height?: number;
  /** Labels in order [pickup, ...stops, dropoff]. */
  labels?: string[];
  loading?: boolean;
  error?: string | null;
  /** Presentation of "pickup" / "dropoff" selection on the map. */
  pinMode?: MapPinMode;
  onMapPick?: (coords: LatLng) => void;
  showCenterPin?: boolean;
  onRecenter?: () => void;
  /** Force the viewport to these coordinates (extensibility). */
  fitBounds?: LatLng[];
  /** Render a live ETA chip overlay. */
  showEta?: boolean;
  /** Optional dynamic ETA string surfaced from the ride layer. */
  etaText?: string | null;
  children?: ReactNode;
};

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-white/5 border-b border-white/10"
      style={{ height }}
      aria-hidden
    />
  );
}

function coordinatesKey(c: LatLng | null | undefined): string {
  return c ? `${c.lat.toFixed(6)},${c.lng.toFixed(6)}` : "";
}

export function RideMapInner(props: RideMapProps) {
  const {
    pickup,
    dropoff,
    stops = [],
    userLocation,
    center,
    activeDriver,
    nearbyDrivers,
    showPickupZone = false,
    pickupRadiusKm = 0.6,
    height = 320,
    labels,
    loading = false,
    error = null,
    pinMode,
    onMapPick,
    showCenterPin = false,
    onRecenter,
    fitBounds,
    showEta = false,
    etaText,
    children,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const gmapsRef = useRef<typeof google.maps | null>(null);
  const centerPinRef = useRef<google.maps.Marker | null>(null);
  const pickerMarkerRef = useRef<google.maps.Marker | null>(null);
  const pannedToUserRef = useRef(false);
  const { theme } = useTheme();
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const hasRoute = isValidLatLng(pickup) && isValidLatLng(dropoff);
  const pickupKey = coordinatesKey(pickup);
  const dropoffKey = coordinatesKey(dropoff);
  const stopsKey = stops.map(coordinatesKey).join("|");
  const routeKey = `${pickupKey}|${dropoffKey}|${stopsKey}`;
  const driverKey = activeDriver?.id ?? "";

  /* ------------------------- map initialisation ------------------------- */

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;

        if (mapRef.current) {
          mapRef.current.setOptions({
            colorScheme: mapColorScheme(theme),
          } as google.maps.MapOptions);
          return;
        }

        const centre = center ?? userLocation ?? DEFAULT_CENTER;
        const map = new maps.Map(ref.current, {
          center: centre,
          zoom: (center ?? userLocation) ? 15 : 11,
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          colorScheme: mapColorScheme(theme),
        });
        mapRef.current = map;
        gmapsRef.current = maps;
        setMapReady(true);

        if (onMapPick) {
          map.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) onMapPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          });
        }
      })
      .catch((e: Error) => !cancelled && setMapError(e.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  /* ------------------------- fit to route ------------------------- */

  const fitList = fitBounds && fitBounds.length > 0 ? fitBounds : undefined;
  useEffect(() => {
    const map = mapRef.current;
    const gmaps = gmapsRef.current;
    if (!map || !gmaps) return;
    if (!hasRoute) return;

    const bounds = new gmaps.LatLngBounds();
    const add = (c: LatLng | null | undefined) => {
      if (c && isValidLatLng(c)) bounds.extend(c);
    };
    if (fitList) {
      fitList.forEach(add);
    } else {
      add(pickup);
      add(dropoff);
      stops.forEach(add);
      add(activeDriver?.location ?? null);
    }
    if (!bounds.isEmpty()) map.fitBounds(bounds, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, routeKey, driverKey, hasRoute]);

  /* -------- keep the view centred on the user while planning -------- */

  const userKey = coordinatesKey(userLocation);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasRoute || !userLocation || !isValidLatLng(userLocation)) return;
    if (pannedToUserRef.current) return;
    pannedToUserRef.current = true;
    map.panTo(userLocation);
    map.setZoom(15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, userKey, hasRoute]);

  /* ------------------------- center crosshair ------------------------- */

  useEffect(() => {
    const map = mapRef.current;
    const gmaps = gmapsRef.current;
    if (!map || !gmaps) return;

    if (showCenterPin && !hasRoute) {
      const pos = userLocation ?? center ?? DEFAULT_CENTER;
      if (!centerPinRef.current) {
        centerPinRef.current = new gmaps.Marker({
          position: pos,
          map,
          zIndex: 9999,
          icon: crosshairIcon(gmaps),
          title: "Your location",
        });
      } else {
        centerPinRef.current.setPosition(pos);
        centerPinRef.current.setMap(map);
      }
    } else if (centerPinRef.current) {
      centerPinRef.current.setMap(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCenterPin, hasRoute, mapReady, userKey]);

  /* ------------------------- picker marker ------------------------- */

  const pickCenter = userLocation ?? pickup ?? center ?? DEFAULT_CENTER;
  useEffect(() => {
    const map = mapRef.current;
    const gmaps = gmapsRef.current;
    if (!map || !gmaps) return;

    if (!onMapPick || !pinMode) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setMap(null);
        pickerMarkerRef.current = null;
      }
      return;
    }

    map.panTo(pickCenter);
    if (!userLocation) map.setZoom(15);

    const icon = locationPinIcon(gmaps, pinMode === "pickup" ? "#10b981" : "#f59e0b", 34);
    if (!pickerMarkerRef.current) {
      pickerMarkerRef.current = new gmaps.Marker({
        position: pickCenter,
        map,
        zIndex: 9999,
        icon,
        draggable: true,
        title: pinMode === "pickup" ? "Drag to set pickup" : "Drag to set drop-off",
      });
      pickerMarkerRef.current.addListener("dragend", () => {
        const pos = pickerMarkerRef.current?.getPosition();
        if (pos) onMapPick({ lat: pos.lat(), lng: pos.lng() });
      });
    } else {
      pickerMarkerRef.current.setPosition(pickCenter);
      pickerMarkerRef.current.setMap(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinMode, mapReady, pickCenter?.lat, pickCenter?.lng]);

  const contextValue = useMemo(
    () => ({ map: mapRef.current, gmaps: gmapsRef.current, theme }),
    // map/gmaps are refs; re-render on theme only — layers read the latest instance.

    [theme],
  );

  const cleanStops = stops.filter((s) => isValidLatLng(s)) as LatLng[];

  if (mapError || error) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        Live map unavailable — {mapError ?? error}
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={ref} className="w-full h-full" />
      {!loading && !error && !mapError && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <MapContext.Provider value={contextValue}>
            <RouteLayer
              pickup={pickup ?? null}
              dropoff={dropoff ?? null}
              stops={cleanStops}
              activeDriver={activeDriver}
            />
            {showPickupZone && (
              <PickupZoneLayer center={pickup ?? null} radiusKm={pickupRadiusKm} />
            )}
            <DriverLayer activeDriver={activeDriver} nearbyDrivers={nearbyDrivers} />
            <PickupMarker position={pickup ?? null} label={labels?.[0]} />
            {cleanStops.map((s, i) => (
              <StopMarker key={i} index={i} position={s} label={labels?.[i + 1]} />
            ))}
            <DropoffMarker position={dropoff ?? null} label={labels?.[labels.length - 1]} />
            <UserLocationMarker position={userLocation ?? null} />
            {children}
          </MapContext.Provider>
        </div>
      )}

      {/* Loading veil while route/driver data is being fetched upstream */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/30 backdrop-blur-[1px]">
          <div className="size-5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        </div>
      )}

      {/* Dynamic ETA chip */}
      {showEta && etaText && (
        <div className="absolute top-3 left-3 z-30 rounded-full bg-surface/90 backdrop-blur-md border border-white/15 px-3 py-1.5 text-xs font-semibold shadow-lg">
          ETA · {etaText}
        </div>
      )}

      {/* Recenter button */}
      {(userLocation || center) && onRecenter && !pinMode && (
        <button
          onClick={onRecenter}
          className="absolute bottom-4 right-4 z-10 size-10 rounded-full bg-surface/90 backdrop-blur-md border border-white/15 shadow-lg flex items-center justify-center hover:bg-surface transition-colors"
          title="Recenter map"
        >
          <LocateFixed className="size-5 text-foreground" />
        </button>
      )}
    </div>
  );
}

export function RideMap(props: RideMapProps) {
  return (
    <ClientOnly fallback={<Skeleton height={props.height ?? 320} />}>
      <RideMapInner {...props} />
    </ClientOnly>
  );
}
