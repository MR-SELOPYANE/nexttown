import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RideMap, type MapPinMode } from "@/components/site/map";
import { useRideTracker } from "@/lib/ride/use-ride-tracker";
import type { Driver, LatLng } from "@/lib/ride/types";
import {
  createPricingInputs,
  driverNearPickup,
  EMPTY_COORDS,
  RIDE_CLASSES,
  seedDriverPool,
} from "@/lib/ride/ride-config";
import {
  useLiveDriverLocations,
  fetchNearbyAvailableDrivers,
} from "@/lib/realtime/use-live-driver-locations";
import { isSupabaseConfigured } from "@/lib/api/supabase";
import { PlaceAutocomplete } from "@/components/site/place-autocomplete";
import {
  useAdvanceBooking,
  useCancelBooking,
  useCreateBooking,
  useNotify,
  usePricingQuotes,
  useReviewBooking,
  useWallet,
} from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { zar } from "@/lib/format";
import { useMyLocation } from "@/hooks/use-my-location";
import { RatingPanel } from "@/components/site/rating-panel";
import { PickupSuggestions } from "@/components/site/pickup-suggestions";
import { PickupRecommendationCard } from "@/components/site/pickup-recommendation-card";
import { DestinationSuggestionsPanel } from "@/components/site/destination-suggestions-panel";
import { getDirections, reverseGeocode, geocodeAddress, type RouteInfo } from "@/lib/google-maps";
import { distanceKm, lookupPlace } from "@/lib/sa-places";
import {
  ArrowRight,
  Briefcase,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Phone,
  Plus,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Phase = "plan" | "select" | "matching" | "assigned" | "arrived" | "ontrip" | "done";
type InputFocus = "pickup" | "dropoff" | null;

function FareRow({
  label,
  value,
  multiplier,
}: {
  label: string;
  value: number;
  multiplier?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums">{multiplier ? `Ã—${value}` : zar(value)}</span>
    </div>
  );
}

type SavedPlace = {
  id: string;
  label: string;
  address: string;
  coords: LatLng | null;
};

const SAVED_PLACES_DEFAULTS: SavedPlace[] = [
  { id: "home", label: "Home", address: "", coords: null },
  { id: "work", label: "Work", address: "", coords: null },
];

const SAVED_PLACE_ICONS: Record<string, typeof Home> = {
  home: Home,
  work: Briefcase,
};

function resolveSavedPlace(place: Partial<SavedPlace>): SavedPlace {
  return {
    id: place.id ?? "home",
    label: place.label ?? "Home",
    address: place.address ?? "",
    coords: place.coords ?? null,
  };
}

function savedPlaceIcon(place: SavedPlace): typeof Home {
  return SAVED_PLACE_ICONS[place.id] ?? MapPin;
}

export function RideNowFlow({ className, tab }: { className?: string; tab?: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: wallet } = useWallet(userId);
  const balance = wallet?.balance ?? 0;
  const createBooking = useCreateBooking(userId);
  const advance = useAdvanceBooking(userId);
  const cancelBooking = useCancelBooking(userId);
  const review = useReviewBooking(userId);
  const notify = useNotify(userId);
  const location = useMyLocation();

  /* â”€â”€ form state â”€â”€ */
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("plan");
  const [classId, setClassId] = useState("go");
  const [payWallet, setPayWallet] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* â”€â”€ map pin picker â”€â”€ */
  const [pinMode, setPinMode] = useState<MapPinMode>(null);

  /* â”€â”€ input focus state â”€â”€ */
  const [inputFocus, setInputFocus] = useState<InputFocus>(null);

  /* â”€â”€ driver data â”€â”€ */
  /** Nearby available drivers (random, realistic spread) shown on the map while planning. */
  const [driverPool, setDriverPool] = useState<Driver[]>([]);
  /** Real nearby drivers fetched from Supabase `driver_locations` when configured. */
  const [livePool, setLivePool] = useState<Driver[]>([]);
  /** The id of the driver assigned to this ride â€” used for the Realtime sub. */
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  const liveAvailable = isSupabaseConfigured();

  /** Displayed nearby pool: real Supabase drivers when present, else demo seed. */
  const displayPool = liveAvailable && livePool.length > 0 ? livePool : driverPool;

  /* â”€â”€ share / trusted contacts â”€â”€ */
  const [shareCopied, setShareCopied] = useState(false);
  const [contactNotified, setContactNotified] = useState(false);

  /* â”€â”€ map size (full-bleed behind the floating panel) â”€â”€ */
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [mapHeight, setMapHeight] = useState(600);
  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el) return;
    const update = () => setMapHeight(Math.max(0, Math.round(el.clientHeight)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* â”€â”€ split payment â”€â”€ */
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitEmails, setSplitEmails] = useState<string[]>(["", ""]);

  /* â”€â”€ geocoded coords (set by autocomplete/select callbacks) â”€â”€ */
  const [geocodedFrom, setGeocodedFrom] = useState<LatLng | null>(null);
  const [geocodedTo, setGeocodedTo] = useState<LatLng | null>(null);
  const [geocodedStops, setGeocodedStops] = useState<(LatLng | null)[]>([]);

  /* â”€â”€ routes â”€â”€ */
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  /* â”€â”€ saved places â”€â”€ */
  const [savedPlaces] = useState<SavedPlace[]>(() => {
    try {
      const stored = localStorage.getItem(`nt-saved-places:${userId}`);
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      if (!Array.isArray(parsed) || parsed.length === 0) return SAVED_PLACES_DEFAULTS;
      return parsed.map((p) => resolveSavedPlace(p as Partial<SavedPlace>));
    } catch {
      return SAVED_PLACES_DEFAULTS;
    }
  });

  /* â”€â”€ GPS coords â”€â”€ */
  const userCoords = location.state.coords;

  /* â”€â”€ refresh real nearby drivers while planning (RLS: available only) â”€â”€ */
  useEffect(() => {
    const planning = phase === "plan" || phase === "select";
    if (!planning || !userCoords || !liveAvailable) {
      setLivePool([]);
      return;
    }
    let cancelled = false;
    const load = () =>
      fetchNearbyAvailableDrivers(userCoords, 8).then((ds) => {
        if (!cancelled) setLivePool(ds);
      });
    load();
    const tick = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [phase, userCoords, liveAvailable]);

  /* â”€â”€ derive stable coordinates â”€â”€ */
  // `from` priority: geocodedFrom (explicit) > GPS fallback (only when no pickup text) > lookupPlace > empty
  const from: LatLng = useMemo(() => {
    if (geocodedFrom) return geocodedFrom;
    if (userCoords && !pickup) return userCoords;
    const looked = lookupPlace(pickup);
    if (looked) return looked;
    return EMPTY_COORDS;
  }, [geocodedFrom, userCoords, pickup]);

  const to: LatLng = useMemo(() => {
    if (geocodedTo) return geocodedTo;
    const looked = lookupPlace(dropoff);
    if (looked) return looked;
    return EMPTY_COORDS;
  }, [geocodedTo, dropoff]);

  const stopCoords = useMemo(
    () =>
      geocodedStops.map((g, i) => g ?? lookupPlace(stops[i]) ?? null).filter(Boolean) as LatLng[],
    [geocodedStops, stops],
  );

  /* â”€â”€ auto-locate on mount â”€â”€ */
  useEffect(() => {
    if (location.state.status === "idle") location.locate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* â”€â”€ seed a stable pool of nearby drivers once we have a GPS fix â”€â”€ */
  useEffect(() => {
    if (!userCoords || driverPool.length > 0) return;
    setDriverPool(seedDriverPool(userCoords, 6));
  }, [userCoords, driverPool.length]);

  /* â”€â”€ reverse geocode GPS to readable address (once, on first GPS fix) â”€â”€ */
  const gpsGeocodedRef = useRef(false);
  useEffect(() => {
    if (phase !== "plan" || !userCoords || gpsGeocodedRef.current) return;
    gpsGeocodedRef.current = true;
    reverseGeocode(userCoords).then((addr) => {
      setPickup(addr || `${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}`);
      setGeocodedFrom(userCoords);
    });
  }, [phase, userCoords]);

  /* â”€â”€ geocode text input â†’ coords (debounced, only for typed text) â”€â”€ */
  useEffect(() => {
    if (!pickup) return;
    if (/^-?\d+\.\d+, -?\d+$/.test(pickup)) return;
    const looked = lookupPlace(pickup);
    if (looked) {
      setGeocodedFrom(looked);
      return;
    }
    // Only geocode if user typed (not from autocomplete selection)
    const timer = setTimeout(() => {
      geocodeAddress(pickup).then((co) => {
        if (co) setGeocodedFrom(co);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    if (!dropoff) return;
    if (/^-?\d+\.\d+, -?\d+$/.test(dropoff)) return;
    const looked = lookupPlace(dropoff);
    if (looked) {
      setGeocodedTo(looked);
      return;
    }
    const timer = setTimeout(() => {
      geocodeAddress(dropoff).then((co) => {
        if (co) setGeocodedTo(co);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [dropoff]);

  /* â”€â”€ fetch route when both endpoints are valid â”€â”€ */
  const routeKey = `${from.lat.toFixed(6)},${from.lng.toFixed(6)}|${to.lat.toFixed(6)},${to.lng.toFixed(6)}`;
  useEffect(() => {
    if (phase !== "plan" && phase !== "select") return;
    if (!from.lat || !to.lat) return;
    let cancelled = false;
    setRouteLoading(true);
    getDirections(from, to, stopCoords.length > 0 ? stopCoords : undefined)
      .then((info) => {
        if (!cancelled) {
          setRouteInfo(info);
          setRouteLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteInfo(null);
          setRouteLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [routeKey, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* â”€â”€ pricing (server-authoritative, explainable) â”€â”€ */
  const km = routeInfo?.distanceKm ?? (from.lat && to.lat ? Math.max(2, distanceKm(from, to)) : 0);
  const roadDuration = routeInfo?.durationMin ?? null;

  // Demand/supply derived from the live driver pool and the time of day. These
  // feed the server pricing engine which owns the final multipliers.
  const demandIndex = useMemo(() => {
    const h = new Date().getHours();
    const d = new Date().getDay();
    const weekdayPeak = d >= 1 && d <= 5 && ((h >= 6 && h <= 9) || (h >= 16 && h <= 19));
    return weekdayPeak ? 0.85 : 0.2;
  }, []);
  const driverSupply = useMemo(
    () => Math.max(0.15, Math.min(1, (displayPool.length || 2) / 6)),
    [displayPool.length],
  );
  const zoneIds = useMemo(() => {
    const text = `${pickup} ${dropoff}`.toLowerCase();
    const zones: string[] = [];
    if (/airport|or tambo|cape town intl|international terminal|intl/.test(text))
      zones.push("airport");
    if (/cbd|central|city centre|sandton|umbilo|mmabatho/.test(text)) zones.push("cbd");
    if (/campus|university|varsity|tuks|ukzn|uj |wits/.test(text)) zones.push("campus");
    if (/pavilion|mall|santana|stadium|gateway|durban cultural/.test(text)) zones.push("mall");
    return zones;
  }, [pickup, dropoff]);

  const pricingInputs = useMemo(
    () => createPricingInputs(km, roadDuration, demandIndex, driverSupply, zoneIds),
    [km, roadDuration, demandIndex, driverSupply, zoneIds],
  );
  const quoteResults = usePricingQuotes(pricingInputs);

  const quotes = useMemo(() => {
    const duration = roadDuration ?? Math.max(6, Math.round(km * 1.6));
    return RIDE_CLASSES.map((c, i) => {
      const fareQuote = quoteResults[i]?.data?.quote ?? null;
      const fare = fareQuote ? fareQuote.breakdown.total : Math.round(c.base + c.perKm * km);
      return { ...c, fare, fareQuote, duration };
    });
  }, [km, roadDuration, quoteResults]);
  const quote = quotes.find((q) => q.id === classId) ?? quotes[0];
  const splitPerPerson =
    splitEnabled && splitCount > 1 ? Math.ceil(quote.fare / splitCount) : quote.fare;

  /* â”€â”€ live ride tracker â”€â”€ */
  // The map never simulates the driver â€” a feed pushes real DriverLocation updates into
  // `tracker.ride.activeDriver` and the tracker drives the assigned/on-trip lifecycle.
  // When Supabase is configured the assigned driver's AUTHENTICATED id is tracked
  // over Realtime; otherwise the demo feed (labeled as such) takes over.
  const liveBooking = (phase as Phase) === "assigned" || phase === "arrived" || phase === "ontrip";
  const liveSub = useLiveDriverLocations({
    driverIds: liveBooking && assignedDriverId ? [assignedDriverId] : [],
    enabled: liveBooking,
  });
  const liveLoc =
    liveSub.live && assignedDriverId ? (liveSub.locations[assignedDriverId] ?? null) : null;

  const tracker = useRideTracker({
    pickup: from,
    dropoff: to,
    stops: stopCoords,
    pickupLabel: pickup,
    dropoffLabel: dropoff,
    stopLabels: stops.filter((s) => s.trim()),
    drivers: displayPool,
    autoTransition: true,
    live: liveSub.live && Boolean(assignedDriverId),
    liveLocation: liveLoc,
    liveConnected: liveSub.connection === "subscribed",
    onArrived: () => {
      setPhase("arrived");
      const d = tracker.ride.activeDriver;
      if (d) {
        notify.mutate({
          title: `${d.name} has arrived`,
          body: `${d.car} Â· ${d.plate}`,
          kind: "trip",
        });
      }
    },
    onCompleted: () => {
      if (bookingId) advance.mutate(bookingId);
      setPhase("done");
    },
  });

  const activeDriver = tracker.ride.activeDriver;
  const legToPickup = tracker.leg === "to_pickup";
  const pickupEta = legToPickup ? (tracker.ride.etaMin ?? 0) : 0;
  // ETA presentation metadata from the route service (loading / stale / fallback).
  const etaLoading = tracker.ride.eta.loading;
  const etaStale = tracker.ride.eta.stale;
  const etaFallback = tracker.ride.eta.source === "estimate";

  /* â”€â”€ auto-share trip with emergency contact when ride starts â”€â”€ */
  const emergencyName = user?.emergencyContact ?? "";
  const emergencyNumber = user?.emergencyNumber ?? "";
  useEffect(() => {
    if (contactNotified) return;
    if (phase !== "assigned" || !bookingId) return;
    setContactNotified(true);
    notify.mutate({
      title: "Ride shared with your emergency contact",
      body: `${activeDriver?.name ?? "Your driver"} Â· ${activeDriver?.car ?? ""} ${activeDriver?.plate ?? ""} â€” ${pickup} â†’ ${dropoff} Â· live tracking started`,
      kind: "safety",
    });
  }, [
    phase,
    bookingId,
    contactNotified,
    activeDriver?.name,
    activeDriver?.car,
    activeDriver?.plate,
    pickup,
    dropoff,
    notify,
  ]);

  /* â”€â”€ actions â”€â”€ */
  function requestRide() {
    setError(null);
    setPhase("matching");
    const title =
      stops.length > 0
        ? `${pickup} â†’ ${stops.join(" â†’ ")} â†’ ${dropoff}`
        : `${pickup} â†’ ${dropoff}`;
    createBooking
      .mutateAsync({
        listingId: "on-demand",
        type: "ride",
        title,
        route: `${quote.name} Â· ${km} km Â· ${quote.duration} min`,
        from: pickup,
        to: dropoff,
        price: quote.fare,
        quantity: 1,
        paidFromWallet: payWallet,
        fareQuote: quote.fareQuote ?? undefined,
        pickupLocation: from,
        dropoffLocation: to,
      })
      .then((b) => {
        setBookingId(b.id);
        // Matched driver is drawn from the live pool (real Supabase driver ids
        // when configured); fall back to one created near the pickup.
        const pool = displayPool.length > 0 ? displayPool : [driverNearPickup(from)];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setAssignedDriverId(chosen.id);
        tracker.assign(chosen);
        if (b.status === "requested") advance.mutate(b.id);
        setPhase("assigned");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong requesting your ride.");
        setPhase("plan");
      });
  }

  function startTrip() {
    if (bookingId) advance.mutate(bookingId);
    tracker.startTrip();
    setPhase("ontrip");
  }

  function cancelRide() {
    if (!bookingId || cancelling) return;
    setCancelling(true);
    cancelBooking.mutate(bookingId, {
      onSuccess: () => {
        notify.mutate({
          title: "Ride cancelled",
          body: "Your fare has been refunded.",
          kind: "trip",
        });
        resetFlow();
      },
      onError: () => setCancelling(false),
    });
  }

  function resetFlow() {
    tracker.reset();
    setPhase("plan");
    setBookingId(null);
    setAssignedDriverId(null);
    setError(null);
    setStops([]);
    setSplitEnabled(false);
    setSplitCount(2);
    setSplitEmails(["", ""]);
    setPickup("");
    setDropoff("");
    setGeocodedFrom(userCoords);
    setGeocodedTo(null);
    setGeocodedStops([]);
    setPinMode(null);
    setInputFocus(null);
    setShareCopied(false);
    setContactNotified(false);
  }

  /* â”€â”€ copy share link â”€â”€ */
  function handleShareCopy() {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  }

  const liveEta =
    tracker.leg === "to_dropoff"
      ? Math.max(1, Math.round(tracker.ride.etaMin ?? quote.duration))
      : quote.duration;
  const liveEtaLoading = tracker.leg === "to_dropoff" && tracker.ride.eta.loading;

  /* â”€â”€ map pin picker callback â”€â”€ */
  const handleMapPick = useCallback(
    (coords: LatLng) => {
      reverseGeocode(coords).then((addr) => {
        const label = addr || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        if (pinMode === "pickup") {
          setPickup(label);
          setGeocodedFrom(coords);
          setPinMode(null);
        } else if (pinMode === "dropoff") {
          setDropoff(label);
          setGeocodedTo(coords);
          setPinMode(null);
        }
      });
    },
    [pinMode],
  );

  /* â”€â”€ recenter map â”€â”€ */
  function handleRecenter() {
    if (userCoords) {
      setGeocodedFrom(userCoords);
      if (!pickup) {
        reverseGeocode(userCoords).then((addr) => {
          setPickup(addr || `${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}`);
        });
      }
    }
  }

  /* â”€â”€ stops helpers â”€â”€ */
  const totalStops = stops.length + 2;
  const canAddStop = totalStops < 6;
  function addStop() {
    if (canAddStop) {
      setStops((s) => [...s, ""]);
      setSplitEmails((e) => [...e, ""]);
    }
  }
  function removeStop(i: number) {
    setStops((s) => s.filter((_, idx) => idx !== i));
    setGeocodedStops((g) => g.filter((_, idx) => idx !== i));
  }
  function updateStop(i: number, v: string) {
    setStops((s) => s.map((val, idx) => (idx === i ? v : val)));
  }

  const allStopsValid = stops.every((s) => s.trim().length > 0);
  const showRoute = from.lat !== 0 && to.lat !== 0 && allStopsValid;
  const showCenterPin = phase === "plan" && !showRoute;
  const isPlanning = phase === "plan" || phase === "select";

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden bg-background md:flex-row ${className ?? "h-[100dvh]"}`}
    >
      {/* â”€â”€ MAP (reduced top panel, Bolt style) â”€â”€ */}
      <div
        ref={mapWrapRef}
        className="relative h-[60dvh] min-h-[360px] w-full shrink-0 md:h-auto md:min-h-0 md:flex-1"
      >
        <RideMap
          pickup={from}
          dropoff={showRoute ? to : null}
          stops={showRoute ? stopCoords : []}
          userLocation={userCoords}
          activeDriver={activeDriver}
          nearbyDrivers={isPlanning && userCoords ? displayPool : []}
          showPickupZone={isPlanning}
          pickupRadiusKm={0.6}
          labels={[pickup, ...stops.filter((s) => s.trim()), dropoff]}
          onMapPick={pinMode ? handleMapPick : undefined}
          pinMode={pinMode}
          showCenterPin={showCenterPin}
          onRecenter={handleRecenter}
          height={mapHeight}
          showEta={(phase as Phase) === "assigned" || phase === "ontrip"}
          etaText={
            (phase as Phase) === "assigned" && legToPickup
              ? etaLoading
                ? "â€¦"
                : `${pickupEta} min`
              : liveEtaLoading
                ? "â€¦"
                : `${liveEta} min`
          }
        />
      </div>

      {/* â”€â”€ PIN MODE HINT â”€â”€ */}
      {pinMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-surface/90 backdrop-blur-xl rounded-full px-4 py-2.5 border border-white/15 shadow-xl text-xs font-medium text-foreground animate-in fade-in slide-in-from-top-2 whitespace-nowrap">
          Tap map to set {pinMode === "pickup" ? "pickup" : "drop-off"}
          <button
            onClick={() => setPinMode(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Cancel map pick"
          >
            <X className="inline size-3" />
          </button>
        </div>
      )}

      {/* â”€â”€ DRIVER CARD (active ride) â”€â”€ */}
      {activeDriver &&
        ((phase as Phase) === "assigned" || phase === "arrived" || phase === "ontrip") && (
          <div className="absolute top-3 left-3 right-3 z-40 bg-surface/90 backdrop-blur-xl rounded-2xl border border-white/15 p-3 flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="size-11 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Car className="size-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{activeDriver.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeDriver.car} Â· {activeDriver.plate}
              </p>
              {tracker.live && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                    tracker.liveConnected ? "text-brand-light" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      tracker.liveConnected ? "bg-brand animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  {tracker.liveConnected ? "Live GPS" : "Reconnectingâ€¦"}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              {(phase as Phase) === "assigned" && legToPickup && (
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Driver arriving
                  </div>
                  {etaLoading ? (
                    <div className="text-sm font-semibold tabular-nums text-cyan-400">
                      <Loader2 className="size-3.5 inline animate-spin mr-1" />
                      â€¦
                    </div>
                  ) : (
                    <div className="text-lg font-semibold tabular-nums text-cyan-400">
                      {pickupEta} min
                      {etaStale && (
                        <span className="ml-1 text-[10px] text-muted-foreground">â€¢</span>
                      )}
                    </div>
                  )}
                  {etaFallback && <div className="text-[9px] text-muted-foreground">estimate</div>}
                </div>
              )}
              {phase === "arrived" && <CheckCircle2 className="size-6 text-brand" />}
              {phase === "ontrip" && (
                <div className="text-lg font-semibold tabular-nums text-brand-light">
                  {Math.round(tracker.progressPct)}%
                </div>
              )}
            </div>
            <a
              href={`tel:${activeDriver.phone}`}
              aria-label="Call driver"
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 shrink-0"
            >
              <Phone className="size-4 text-muted-foreground" />
            </a>
          </div>
        )}

      {/* â”€â”€ PROGRESS BAR (active ride) â”€â”€ */}
      {((phase as Phase) === "assigned" || phase === "ontrip") && (
        <div className="absolute top-[4.9rem] left-3 right-3 z-40">
          <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${(phase as Phase) === "assigned" ? "bg-cyan-400" : "bg-brand-light"}`}
              style={{ width: `${tracker.progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* â”€â”€ BOTTOM PANEL (Bolt-style booking surface below the map) â”€â”€ */}
      {(isPlanning ||
        phase === "matching" ||
        phase === "arrived" ||
        phase === "ontrip" ||
        phase === "done") && (
        <div className="relative z-30 flex min-h-0 flex-1 flex-col rounded-t-[1.75rem] border-t border-white/10 bg-surface shadow-[0_-18px_50px_rgba(0,0,0,0.16)] md:flex-none md:w-[min(34rem,42vw)] md:rounded-none md:border-l md:border-t-0 md:shadow-[-18px_0_50px_rgba(0,0,0,0.12)]">
          <div className="mx-auto w-full max-w-xl flex-1 flex flex-col min-h-0">
            <div className="flex justify-center pt-2.5 pb-1 md:hidden" aria-hidden>
              <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-1 md:px-6 md:pt-6">
              {phase !== "plan" && phase !== "select" && (
                <div
                  className="mb-5 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/10 px-3.5 py-3"
                  aria-live="polite"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${phase === "matching" ? "bg-amber-400 animate-pulse" : "bg-brand"}`}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-light">
                      {phase === "matching"
                        ? "Searching for a driver"
                        : (phase as Phase) === "assigned"
                          ? "Driver found"
                          : phase === "arrived"
                            ? "Driver arrived"
                            : phase === "ontrip"
                              ? "Trip started"
                              : "Trip complete"}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {phase === "matching"
                        ? "Matching you with a nearby driver"
                        : (phase as Phase) === "assigned"
                          ? `${activeDriver?.name ?? "Your driver"} is on the way`
                          : phase === "arrived"
                            ? "Check the vehicle details before boarding"
                            : phase === "ontrip"
                              ? `Heading to ${dropoff}`
                              : "Thanks for riding with Next Town"}
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€â”€ ENTRY CARD (pick a destination) â”€â”€â”€ */}
              {(phase === "plan" || phase === "select") && !showRoute && (
                <div className="space-y-4">
                  {tab && <div className="flex justify-center pt-1">{tab}</div>}

                  {/* Ride-type quick pills with from-prices */}
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="Ride types">
                    {quotes.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center gap-1.5 shrink-0 rounded-full bg-foreground/5 border border-border/70 px-3 py-1.5"
                      >
                        <span className="text-sm leading-none">{q.icon}</span>
                        <span className="text-xs font-semibold">{q.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          from {zar(q.fare)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Where-to? card */}
                  <div className="rounded-2xl border border-border bg-foreground/[0.03] overflow-hidden">
                    <div className="flex items-center gap-3 px-3.5 py-3">
                      <div className="size-2.5 rounded-full bg-brand ring-4 ring-brand/15 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Pickup
                        </div>
                        <PlaceAutocomplete
                          value={pickup}
                          onChange={setPickup}
                          onSelect={(coords, name) => {
                            setGeocodedFrom(coords);
                            setPickup(name);
                            setInputFocus(null);
                          }}
                          placeholder="Set pickup location"
                          onFocus={() => setInputFocus("pickup")}
                          className="-my-1"
                        />
                      </div>
                      <button
                        onClick={() => setPinMode(pinMode === "pickup" ? null : "pickup")}
                        aria-label="Set pickup on map"
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 ${pinMode === "pickup" ? "border-brand/50 bg-brand/10 text-brand-light" : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"}`}
                      >
                        <Navigation className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 px-3.5 py-3">
                      <div className="size-9 rounded-full bg-foreground/[0.06] grid place-items-center shrink-0">
                        <Search className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Where to?
                        </div>
                        <PlaceAutocomplete
                          value={dropoff}
                          onChange={setDropoff}
                          onSelect={(coords, name) => {
                            setGeocodedTo(coords);
                            setDropoff(name);
                            setInputFocus(null);
                          }}
                          placeholder="Enter your destinationâ€¦"
                          onFocus={() => setInputFocus("dropoff")}
                          className="-my-1"
                        />
                      </div>
                      <button
                        onClick={() => setPinMode(pinMode === "dropoff" ? null : "dropoff")}
                        aria-label="Set drop-off on map"
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 ${pinMode === "dropoff" ? "border-amber-500/50 bg-amber-500/10 text-amber-400" : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"}`}
                      >
                        <Navigation className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {!dropoff && (
                    <DestinationSuggestionsPanel
                      userId={userId}
                      currentLocation={userCoords}
                      savedPlaces={savedPlaces}
                      onSelect={(coords, name) => {
                        setGeocodedTo(coords);
                        setDropoff(name);
                        setInputFocus(null);
                      }}
                    />
                  )}

                  <PickupRecommendationCard
                    location={geocodedFrom}
                    locationLabel={pickup || "Current location"}
                    onAccept={(recommendation) => {
                      setGeocodedFrom(recommendation.zone.entrance);
                      setPickup(recommendation.zone.name);
                    }}
                  />

                  {/* Extra stops */}
                  {stops.map((stop, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-border/70 bg-foreground/[0.03]"
                    >
                      <div
                        className="size-2 rounded-full shrink-0 ring-4 ring-foreground/5"
                        style={{
                          backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"][i % 4],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <PlaceAutocomplete
                          value={stop}
                          onChange={(v) => updateStop(i, v)}
                          onSelect={(coords, name) => {
                            setGeocodedStops((prev) => {
                              const n = [...prev];
                              n[i] = coords;
                              return n;
                            });
                            updateStop(i, name);
                          }}
                          placeholder={`Stop ${i + 1}`}
                        />
                      </div>
                      <button
                        onClick={() => removeStop(i)}
                        aria-label={`Remove stop ${i + 1}`}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <Minus className="size-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Pickup suggestions when GPS searching */}
                  {inputFocus === "pickup" && userCoords && !pickup && (
                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] px-3 py-2.5">
                      <PickupSuggestions
                        center={userCoords}
                        onSelect={(coords, name) => {
                          setGeocodedFrom(coords);
                          setPickup(name);
                          setInputFocus(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Saved places + add stop */}
                  <div className="flex flex-wrap gap-2">
                    {savedPlaces.map((sp) => {
                      const Icon = savedPlaceIcon(sp);
                      return (
                        <button
                          key={sp.id}
                          onClick={() => {
                            if (sp.coords) {
                              if (inputFocus === "dropoff") {
                                setDropoff(sp.address || sp.label);
                                setGeocodedTo(sp.coords);
                              } else {
                                setPickup(sp.address || sp.label);
                                setGeocodedFrom(sp.coords);
                              }
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/5 border border-border/70 hover:bg-foreground/[0.08] transition-colors text-xs font-medium"
                        >
                          <Icon className="size-3.5 text-muted-foreground" />
                          {sp.label}
                        </button>
                      );
                    })}
                    {canAddStop && (
                      <button
                        onClick={addStop}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border hover:bg-foreground/[0.04] transition-colors text-xs font-medium text-muted-foreground"
                      >
                        <Plus className="size-3.5" /> Stop
                      </button>
                    )}
                  </div>

                  {/* Safety trust row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-brand-light" /> SAPS-screened
                    </span>
                    <span>Upfront pricing</span>
                    <span>24/7 support</span>
                  </div>
                </div>
              )}

              {/* â”€â”€â”€ RIDE OPTIONS (route set) â”€â”€â”€ */}
              {(phase === "plan" || phase === "select") && showRoute && (
                <div className="space-y-4">
                  {/* Editable trip summary */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="size-2 rounded-full bg-brand ring-4 ring-brand/15" />
                      <div className="size-2 rounded-full bg-amber-400/80 ring-4 ring-amber-400/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{pickup}</div>
                      <div className="text-xs font-semibold truncate mt-1">{dropoff}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {routeLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums">
                          <div className="size-3 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                          Calculatingâ€¦
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {km} km Â· {quote.duration} min
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setDropoff("");
                          setGeocodedTo(null);
                          setStops([]);
                          setGeocodedStops([]);
                        }}
                        className="text-xs font-semibold text-brand-light hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Choose your ride
                  </div>

                  <div
                    className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                    role="radiogroup"
                    aria-label="Ride type"
                  >
                    {quotes.map((q) => (
                      <button
                        key={q.id}
                        role="radio"
                        aria-checked={classId === q.id}
                        onClick={() => {
                          setClassId(q.id);
                          setPhase("select");
                        }}
                        className={`w-[9.5rem] shrink-0 rounded-2xl border p-3 text-left transition-all ${classId === q.id ? "border-brand bg-brand/10 shadow-md shadow-brand/5" : "border-border bg-foreground/[0.02] hover:bg-foreground/[0.05]"}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-2xl leading-none">{q.icon}</span>
                          <span
                            className={`flex size-5 items-center justify-center rounded-full border shrink-0 ${classId === q.id ? "border-brand bg-brand" : "border-border"}`}
                          >
                            {classId === q.id && <Check className="size-3 text-white" />}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-semibold">{q.name}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">
                          {q.blurb}
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-lg font-bold tabular-nums">{zar(q.fare)}</span>
                          <span className="text-[10px] text-muted-foreground">{q.etaMin} min</span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {q.duration} min trip Â· {q.seats} seats
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Fare + safety chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-foreground/5 border border-border/70 text-muted-foreground">
                      <Shield className="size-3 text-brand-light" /> SAPS-screened
                    </span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-foreground/5 border border-border/70 text-muted-foreground">
                      Upfront fare
                    </span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-foreground/5 border border-border/70 text-muted-foreground">
                      Free cancellation
                    </span>
                  </div>

                  {/* Upfront fare breakdown (explainable pricing) */}
                  {quote.fareQuote && (
                    <div className="rounded-2xl border border-border bg-foreground/[0.02] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Upfront fare breakdown
                        </span>
                        <span className="text-[10px] text-muted-foreground">ZAR</span>
                      </div>
                      <FareRow label="Base fare" value={quote.fareQuote.breakdown.baseFare} />
                      <FareRow label="Distance" value={quote.fareQuote.breakdown.distanceFare} />
                      <FareRow label="Time" value={quote.fareQuote.breakdown.timeFare} />
                      <FareRow
                        label="Demand"
                        value={quote.fareQuote.breakdown.demandMultiplier}
                        multiplier
                      />
                      {quote.fareQuote.breakdown.timeOfDayMultiplier !== 1 && (
                        <FareRow
                          label="Time of day"
                          value={quote.fareQuote.breakdown.timeOfDayMultiplier}
                          multiplier
                        />
                      )}
                      {quote.fareQuote.breakdown.zoneMultiplier !== 1 && (
                        <FareRow
                          label="Zone"
                          value={quote.fareQuote.breakdown.zoneMultiplier}
                          multiplier
                        />
                      )}
                      {quote.fareQuote.breakdown.vehicleMultiplier !== 1 && (
                        <FareRow
                          label="Vehicle"
                          value={quote.fareQuote.breakdown.vehicleMultiplier}
                          multiplier
                        />
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Service fee</span>
                        <span className="tabular-nums">
                          {zar(quote.fareQuote.breakdown.serviceFee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-sm font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums text-brand-light">
                          {zar(quote.fareQuote.breakdown.total)}
                        </span>
                      </div>
                      {quote.fareQuote && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          Quote valid until{" "}
                          {new Date(quote.fareQuote.expiresAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Split fare */}
                  <div className="rounded-2xl border border-border bg-foreground/[0.02] p-3">
                    <button
                      onClick={() => setSplitEnabled((v) => !v)}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full"
                    >
                      <Users className="size-4" /> Split fare
                      <span className="ml-auto text-brand-light">
                        {splitEnabled ? "On" : "Off"}
                      </span>
                    </button>
                    {splitEnabled && (
                      <div className="space-y-2 pt-2 mt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Passengers:</span>
                          <button
                            onClick={() => setSplitCount((c) => Math.max(2, c - 1))}
                            className="p-1 rounded-lg border border-border hover:bg-foreground/[0.04]"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {splitCount}
                          </span>
                          <button
                            onClick={() => setSplitCount((c) => Math.min(6, c + 1))}
                            className="p-1 rounded-lg border border-border hover:bg-foreground/[0.04]"
                          >
                            <Plus className="size-3" />
                          </button>
                          <span className="text-xs text-muted-foreground ml-1">
                            Â· {zar(splitPerPerson)} each
                          </span>
                        </div>
                        {Array.from({ length: splitCount - 1 }).map((_, i) => (
                          <input
                            key={i}
                            value={splitEmails[i] ?? ""}
                            onChange={(e) => {
                              const n = [...splitEmails];
                              n[i] = e.target.value;
                              setSplitEmails(n);
                            }}
                            placeholder={`Passenger ${i + 2} email`}
                            className="w-full h-9 rounded-lg bg-foreground/[0.03] border border-border px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment */}
                  <button
                    onClick={() => setPayWallet((v) => !v)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full px-1"
                  >
                    {payWallet ? <Wallet className="size-4" /> : <CreditCard className="size-4" />}
                    {payWallet ? `NT Wallet Â· ${zar(balance)}` : "Card ending 4821"}
                    <span className="ml-auto text-brand-light">Change</span>
                  </button>

                  {/* CTA */}
                  <button
                    onClick={requestRide}
                    disabled={!showRoute || (payWallet && balance < splitPerPerson)}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light disabled:opacity-40 text-white text-sm font-semibold py-4 rounded-2xl ring-1 ring-brand/50 transition-colors shadow-lg shadow-brand/20"
                  >
                    Request {quote.name} Â·{" "}
                    {splitEnabled ? `${zar(splitPerPerson)} Ã— ${splitCount}` : zar(quote.fare)}
                    <ArrowRight className="size-4" />
                  </button>
                  {payWallet && balance < splitPerPerson && (
                    <p className="text-xs text-destructive -mt-2 text-center">
                      Wallet balance too low â€” top up or switch to card.
                    </p>
                  )}
                  {error && <p className="text-xs text-destructive -mt-2 text-center">{error}</p>}
                </div>
              )}

              {/* â”€â”€â”€ MATCHING â”€â”€â”€ */}
              {phase === "matching" && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="size-12 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                  <p className="text-sm font-semibold">Searching for a driver</p>
                  <p className="text-xs text-muted-foreground">
                    {quote.name} Â· {km} km Â· ~{quote.duration} min Â· {zar(quote.fare)}
                  </p>
                  <button
                    onClick={resetFlow}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <X className="size-3" /> Cancel
                  </button>
                </div>
              )}

              {/* â”€â”€â”€ ARRIVED â”€â”€â”€ */}
              {phase === "arrived" && (
                <div className="space-y-4 py-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                      Driver arrived
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight mt-1">
                      Look for the {activeDriver?.car ?? "your driver"}
                    </h2>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    <Cell
                      label="Fare"
                      value={
                        splitEnabled ? `${zar(splitPerPerson)} Ã—${splitCount}` : zar(quote.fare)
                      }
                    />
                    <Cell label="Distance" value={`${km} km`} />
                    <Cell label="Trip time" value={`${quote.duration} min`} />
                  </dl>
                  <ShareTripCard
                    driverName={activeDriver?.name ?? "Your driver"}
                    driverCar={activeDriver ? `${activeDriver.car} Â· ${activeDriver.plate}` : ""}
                    pickup={pickup}
                    dropoff={dropoff}
                    eta={`${Math.max(1, pickupEta)} min`}
                    emergencyNumber={emergencyNumber}
                    copied={shareCopied}
                    onCopy={handleShareCopy}
                  />
                  <button
                    onClick={startTrip}
                    className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-4 rounded-2xl ring-1 ring-brand/50 transition-colors shadow-lg shadow-brand/20"
                  >
                    Start trip
                  </button>
                  <button
                    onClick={cancelRide}
                    disabled={cancelling}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-2xl border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                    {cancelling ? "Cancellingâ€¦" : "Cancel ride"}
                  </button>
                </div>
              )}

              {/* â”€â”€â”€ ON TRIP â”€â”€â”€ */}
              {phase === "ontrip" && (
                <div className="space-y-4 py-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                      On trip
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight mt-1">
                      {Math.round(tracker.progressPct)}% of the way
                    </h2>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    <Cell
                      label="Fare"
                      value={
                        splitEnabled ? `${zar(splitPerPerson)} Ã—${splitCount}` : zar(quote.fare)
                      }
                    />
                    <Cell label="Distance" value={`${km} km`} />
                    <Cell label="ETA" value={liveEtaLoading ? "â€¦" : `${liveEta} min`} />
                  </dl>
                  <p className="text-xs text-muted-foreground text-center">
                    Live location shared with your emergency contact.
                  </p>
                  <ShareTripCard
                    driverName={activeDriver?.name ?? "Your driver"}
                    driverCar={activeDriver ? `${activeDriver.car} Â· ${activeDriver.plate}` : ""}
                    pickup={pickup}
                    dropoff={dropoff}
                    eta={`${liveEta} min`}
                    emergencyNumber={emergencyNumber}
                    copied={shareCopied}
                    onCopy={handleShareCopy}
                  />
                  <button
                    onClick={cancelRide}
                    disabled={cancelling}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-2xl border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                    {cancelling ? "Cancellingâ€¦" : "Cancel ride"}
                  </button>
                </div>
              )}

              {/* â”€â”€â”€ DONE â”€â”€â”€ */}
              {phase === "done" && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-8 text-brand" />
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">Trip complete</h2>
                      <p className="text-sm text-muted-foreground">
                        {pickup} â†’ {dropoff} Â· {zar(quote.fare)}
                      </p>
                    </div>
                  </div>
                  <RatingPanel
                    compact
                    busy={review.isPending}
                    onSubmit={(r) => {
                      if (bookingId) review.mutate({ id: bookingId, review: r });
                      else
                        notify.mutate({
                          title: "Trip complete",
                          body: `${pickup} â†’ ${dropoff}`,
                          kind: "trip",
                        });
                    }}
                  />
                  <button
                    onClick={resetFlow}
                    className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-4 rounded-2xl ring-1 ring-brand/50 transition-colors shadow-lg shadow-brand/20"
                  >
                    Book another ride
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2.5">
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </dt>
    </div>
  );
}

function buildShareMessage(opts: {
  driverName: string;
  driverCar: string;
  pickup: string;
  dropoff: string;
  eta: string;
}) {
  return (
    `I'm on a ${opts.driverName} ride (${opts.driverCar}).\n` +
    `${opts.pickup} â†’ ${opts.dropoff}\n` +
    `Estimated arrival: ${opts.eta}. ` +
    `Track my trip live here: ${`${window.location.origin}/track`}\n` +
    `â€” sent via Next Town`
  );
}

function ShareTripCard({
  driverName,
  driverCar,
  pickup,
  dropoff,
  eta,
  emergencyNumber,
  copied,
  onCopy,
}: {
  driverName: string;
  driverCar: string;
  pickup: string;
  dropoff: string;
  eta: string;
  emergencyNumber: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const message = buildShareMessage({ driverName, driverCar, pickup, dropoff, eta });
  const sms = `sms:${emergencyNumber ? `?&body=${encodeURIComponent(message)}` : ""}`;
  const whatsapp = emergencyNumber
    ? `https://wa.me/${emergencyNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : "";

  const copy = () => {
    try {
      navigator.clipboard?.writeText(message);
      onCopy();
    } catch {
      onCopy();
    }
  };

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/[0.06] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="size-4 text-brand-light" />
        <span className="text-xs font-semibold">Share live trip with kin &amp; friends</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Anyone with the link can track this trip in real time.
      </p>
      <div className="flex gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium"
        >
          <Copy className="size-3.5" /> {copied ? "Copied" : "Copy link"}
        </button>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-medium transition-colors"
          >
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
        )}
        <a
          href={sms}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium"
        >
          <Phone className="size-3.5" /> SMS
        </a>
      </div>
      {emergencyNumber ? (
        <p className="text-[10px] text-muted-foreground mt-2">
          <UserPlus className="inline size-3 mr-1" />
          Emergency contact auto-notified on this number.
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground mt-2">
          <UserPlus className="inline size-3 mr-1" />
          Add an emergency contact in your profile to auto-alert them when a trip starts.
        </p>
      )}
    </div>
  );
}
