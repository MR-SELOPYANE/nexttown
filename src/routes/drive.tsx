import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { RideMap } from "@/components/site/map";
import { useDemo, zar } from "@/lib/demo-store";
import { distanceKm, lookupPlace, SA_PLACES, type LatLng } from "@/lib/sa-places";
import { getDirections, type RouteInfo } from "@/lib/google-maps";
import { useRideTracker } from "@/lib/ride/use-ride-tracker";
import { useDriverPublisher } from "@/lib/realtime/use-driver-publisher";
import { gpsFixToDriverLocation } from "@/lib/realtime/location-mappers";
import type { Driver } from "@/lib/ride/types";
import { OperatorListings } from "@/components/site/operator-listings";
import { driverModeState, openPickupNavigation } from "@/lib/driver/state";
import { DRIVER_STATE_LABELS } from "@/lib/driver/types";
import { buildDriver, driverStatusForMode } from "@/lib/driver/driver-utils";
import { offsetKm } from "@/lib/ride/geo";
import { DriverMetric } from "@/components/site/driver/driver-ui";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Power,
  Shield,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

export const Route = createFileRoute("/drive")({
  component: DrivePage,
  head: () => ({
    meta: [
      { title: "Driver mode â€” Next Town" },
      {
        name: "description",
        content:
          "Go online, accept nearby ride requests, navigate the trip and watch your Next Town earnings build in real time.",
      },
      { property: "og:title", content: "Driver mode â€” Next Town" },
      {
        property: "og:description",
        content: "Bolt-style driver console: online toggle, live requests, earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Phase = "idle" | "offer" | "accepted" | "topickup" | "arrived" | "ontrip" | "complete";

const REQUESTS = [
  { rider: "Lerato N.", rating: 4.9, pickup: "Sandton", dropoff: "OR Tambo", note: "2 bags" },
  {
    rider: "Johan V.",
    rating: 4.7,
    pickup: "Rosebank",
    dropoff: "Midrand",
    note: "Corporate wallet",
  },
  {
    rider: "Zanele P.",
    rating: 5.0,
    pickup: "Centurion",
    dropoff: "Pretoria",
    note: "Airport pickup",
  },
  {
    rider: "Ahmed S.",
    rating: 4.8,
    pickup: "Soweto",
    dropoff: "Johannesburg",
    note: "Cash disabled",
  },
];

function fareFor(fareKm: number, roadMins: number | null) {
  const km = Math.max(2, fareKm);
  const mins = roadMins ?? Math.max(6, Math.round(km * 1.6));
  return { km, fare: Math.round(22 + km * 8.5), mins };
}

function DrivePage() {
  const { notify } = useDemo();
  const [online, setOnline] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reqIndex, setReqIndex] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [trips, setTrips] = useState(6);
  const [earnings, setEarnings] = useState(1284);
  const [declines, setDeclines] = useState(1);
  const offerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const req = REQUESTS[reqIndex % REQUESTS.length];
  const from = lookupPlace(req.pickup) ?? SA_PLACES.sandton;

  const to = lookupPlace(req.dropoff) ?? SA_PLACES.centurion;

  // This driver's own live entity â€” the feed moves THIS car, not a fake one.
  const myDriver = useMemo<Driver>(
    () =>
      buildDriver(
        {
          name: "Sipho M.",
          car: "VW Polo Â· Silver",
          plate: "JH 42 KL GP",
          rating: 4.97,
          trips: 2821,
          phone: "+27100000008",
        },
        "driver-self",
        offsetKm(from, 1.5, 2.5),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from.lat, from.lng],
  );

  // ---- real-time GPS publisher: broadcasts THIS device's position ----------
  // The driver's own car is live: real GPS replaces the demo car. The
  // publisher owns the Supabase Auth session + throttled upserts to
  // driver_locations (RLS-protected; the client never sends a driver id).
  const driverMode = driverModeState(online, phase);
  const driverStatus = driverStatusForMode(online, driverMode);

  const publisher = useDriverPublisher({ enabled: online, status: driverStatus });
  const liveLoc = publisher.lastFix
    ? gpsFixToDriverLocation(publisher.lastFix, driverStatus)
    : null;

  // LIVE mode: the simulated feed is disabled; the map mirrors the real device
  // GPS (passengers see the exact same coordinates via Supabase Realtime).
  const tracker = useRideTracker({
    pickup: from,
    dropoff: to,
    pickupLabel: req.pickup,
    dropoffLabel: req.dropoff,
    drivers: [myDriver],
    speedKmh: 40,
    autoTransition: false,
    live: true,
    liveLocation: liveLoc,
    liveConnected: publisher.link === "authenticated",
  });

  // Fetch road-based route info
  useEffect(() => {
    if (phase !== "offer" && phase !== "accepted" && phase !== "topickup" && phase !== "ontrip")
      return;
    let cancelled = false;
    getDirections(from, to)
      .then((info) => {
        if (!cancelled) setRouteInfo(info);
      })
      .catch(() => {
        if (!cancelled) setRouteInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [from.lat, from.lng, to.lat, to.lng, phase]);

  const { km, fare, mins } = fareFor(
    routeInfo?.distanceKm ?? distanceKm(from, to),
    routeInfo?.durationMin ?? null,
  );
  const payout = Math.round(fare * 0.88);

  // queue a new offer while online and idle
  useEffect(() => {
    if (!online || phase !== "idle") return;
    offerTimer.current = setTimeout(() => {
      setCountdown(15);
      setPhase("offer");
    }, 2600);
    return () => {
      if (offerTimer.current) clearTimeout(offerTimer.current);
    };
  }, [online, phase, reqIndex]);

  // offer countdown
  useEffect(() => {
    if (phase !== "offer") return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "offer" && countdown <= 0) declineOffer();
  }, [countdown, phase]);

  function acceptOffer() {
    tracker.assign(myDriver);
    setPhase("accepted");
    window.setTimeout(() => setPhase("topickup"), 350);
    notify({
      title: `Trip accepted Â· ${req.pickup} â†’ ${req.dropoff}`,
      body: `Pickup at ${req.pickup}. Payout ${zar(payout)} after platform fee.`,
      kind: "trip",
    });
  }

  function markArrived() {
    setPhase("arrived");
    notify({
      title: "Pickup marked arrived",
      body: "The passenger can be notified that you are at the pickup point.",
      kind: "trip",
    });
  }

  function declineOffer() {
    setDeclines((d) => d + 1);
    setReqIndex((i) => i + 1);
    setPhase("idle");
  }

  function completeTrip() {
    tracker.finish();
    setTrips((t) => t + 1);
    setEarnings((e) => e + payout);
    notify({
      title: "Trip completed",
      body: `${zar(payout)} added to today's earnings.`,
      kind: "payment",
    });
    setPhase("complete");
  }

  function backOnline() {
    tracker.reset();
    setReqIndex((i) => i + 1);
    setPhase("idle");
  }

  const etaLoading = tracker.ride.eta.loading;
  const etaMin = tracker.ride.etaMin != null ? Math.max(1, Math.round(tracker.ride.etaMin)) : mins;
  const etaDisplay = etaLoading ? "â€¦" : `${etaMin} min`;

  const acceptance = Math.round((trips / (trips + declines)) * 100);

  function toggleOnline() {
    setOnline((v) => {
      const next = !v;
      if (!next) setPhase("idle");
      return next;
    });
  }

  return (
    <PageShell showCompliance={false}>
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
          <div className="relative rounded-3xl overflow-hidden ring-1 ring-black/20 glass-card">
            <RideMap
              pickup={from}
              dropoff={to}
              labels={[req.pickup, req.dropoff]}
              activeDriver={tracker.ride.activeDriver}
              nearbyDrivers={[]}
              height={560}
              showEta={phase === "topickup" || phase === "ontrip"}
              etaText={etaDisplay}
            />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full glass-card ring-1 ring-black/20 ${
                  online ? "text-brand-light" : "text-muted-foreground"
                }`}
                aria-live="polite"
              >
                <span
                  className={`size-2 rounded-full ${online ? "bg-brand animate-pulse" : "bg-muted-foreground"}`}
                />
                {DRIVER_STATE_LABELS[driverMode]}
              </span>
              <button
                onClick={toggleOnline}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors ring-1 ${
                  online
                    ? "glass-card ring-black/20 hover:bg-white/5"
                    : "bg-brand hover:bg-brand-light text-white ring-brand/50"
                }`}
              >
                <Power className="size-4" />
                {online ? "Go offline" : "Go online"}
              </button>
            </div>

            {online && (
              <div className="absolute top-[4.5rem] left-4 flex items-center gap-2">
                <GpsPill publisher={publisher} />
              </div>
            )}

            {online && phase === "idle" && (
              <div className="absolute bottom-4 left-4 right-4 glass-card rounded-2xl ring-1 ring-black/20 p-4 flex items-center gap-3">
                <div className="size-9 rounded-full border-2 border-brand/30 border-t-brand animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium">Waiting for requestsâ€¦</p>
                  <p className="text-xs text-muted-foreground">
                    You're in a high-demand zone â€” expect a trip shortly.
                  </p>
                </div>
              </div>
            )}

            {phase === "offer" && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                <div className="w-full max-w-md glass-card rounded-3xl ring-1 ring-brand/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                      New trip request
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                      <Clock className="size-3.5" />
                      {Math.max(0, countdown)}s
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-1000"
                      style={{ width: `${(Math.max(0, countdown) / 15) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">Ride request</div>
                      <div className="text-xs text-muted-foreground">
                        Standard ride Â· passenger details stay private
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold tabular-nums">{zar(payout)}</div>
                      <div className="text-[11px] text-muted-foreground">your payout</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Leg
                      icon={<span className="size-2.5 rounded-full bg-brand" />}
                      label={req.pickup}
                      sub={routeInfo ? `Pickup` : "Loadingâ€¦"}
                    />
                    <Leg
                      icon={<MapPin className="size-3.5 text-amber-400" />}
                      label={req.dropoff}
                      sub={`${km} km Â· ${mins} min`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={declineOffer}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-2xl border border-white/10 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" /> Decline
                    </button>
                    <button
                      onClick={acceptOffer}
                      className="flex-[2] bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3 rounded-2xl ring-1 ring-brand/50 transition-colors"
                    >
                      Accept Â· {zar(payout)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5">
              <h1 className="text-2xl font-semibold tracking-tight">Driver console</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Accept, navigate and get paid â€” all from one screen.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <DriverMetric icon={Wallet} label="Today" value={zar(earnings)} />
                <DriverMetric icon={TrendingUp} label="Trips" value={String(trips)} />
                <DriverMetric icon={Shield} label="Accept" value={`${acceptance}%`} />
              </div>
            </div>

            <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5 space-y-4">
              {phase === "idle" && (
                <p className="text-sm text-muted-foreground">
                  {online
                    ? "You're online. The next request will pop up on the map."
                    : "You're offline. Go online to start receiving trip requests."}
                </p>
              )}

              {phase === "offer" && (
                <p className="text-sm text-muted-foreground">
                  Incoming standard ride request â€” respond before the timer expires.
                </p>
              )}

              {(phase === "accepted" ||
                phase === "topickup" ||
                phase === "arrived" ||
                phase === "ontrip") && (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                    {DRIVER_STATE_LABELS[driverMode]}
                  </div>
                  <div className="text-lg font-semibold">
                    {phase === "accepted" || phase === "topickup" || phase === "arrived"
                      ? req.pickup
                      : `${req.pickup} â†’ ${req.dropoff}`}
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{ width: `${tracker.progressPct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <DriverMetric icon={Wallet} label="Payout" value={zar(payout)} />
                    <DriverMetric icon={Navigation} label="Distance" value={`${km} km`} />
                    <DriverMetric icon={Clock} label="ETA" value={etaDisplay} />
                  </div>
                  {phase === "accepted" ? (
                    <div className="rounded-2xl border border-brand/20 bg-brand/10 px-3 py-3 text-sm text-brand-light">
                      Preparing navigation to pickupâ€¦
                    </div>
                  ) : phase === "topickup" ? (
                    <>
                      <button
                        onClick={() => openPickupNavigation(from)}
                        className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl border border-brand/30 text-brand-light hover:bg-brand/10"
                      >
                        <Navigation className="size-4" /> Navigate to pickup
                      </button>
                      <button
                        onClick={markArrived}
                        className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                      >
                        Mark arrived
                      </button>
                    </>
                  ) : phase === "arrived" ? (
                    <button
                      onClick={() => {
                        tracker.startTrip();
                        setPhase("ontrip");
                      }}
                      className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                    >
                      Passenger on board â€” start trip
                    </button>
                  ) : (
                    <button
                      onClick={completeTrip}
                      className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                    >
                      Complete trip
                    </button>
                  )}
                </>
              )}

              {phase === "complete" && (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-7 text-brand" />
                    <div>
                      <div className="text-lg font-semibold">{zar(payout)} earned</div>
                      <p className="text-xs text-muted-foreground">
                        {req.pickup} â†’ {req.dropoff} Â· paid out Friday 08:00
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={backOnline}
                    className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                  >
                    Back online
                  </button>
                </>
              )}
            </div>

            <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                This week
              </h2>
              <div className="flex items-end gap-2 h-24">
                {[420, 860, 640, 1180, 980, 1284, 300].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t-md bg-brand/60"
                      style={{ height: `${(v / 1284) * 100}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <OperatorListings
              title="Future trips"
              subtitle="Plan a long trip you'll drive later and sell seats on the marketplace."
              markets={["ride"]}
              postCta="Post a future trip"
              capacityLabel="Seats"
              priceLabel="Rate per seat (ZAR)"
              tags={["Driver trip", "Verified driver"]}
            />
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function Leg({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-4 flex items-center justify-center shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs text-muted-foreground">{sub}</span>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
      <Icon className="size-3.5 text-brand-light mb-1.5" />
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

/** Small live-tracking health pill: Supabase link + geolocation state. */
function GpsPill({ publisher }: { publisher: ReturnType<typeof useDriverPublisher> }) {
  const { link, run } = publisher;

  if (link === "unconfigured") {
    return (
      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full glass-card ring-1 ring-black/20 text-muted-foreground">
        Live tracking demo â€” Supabase not configured
      </span>
    );
  }

  const color =
    link === "authenticated" && run === "tracking"
      ? "bg-brand/15 text-brand-light ring-brand/30"
      : run === "denied" ||
          run === "unavailable" ||
          run === "unsupported" ||
          link === "session_required" ||
          link === "session_error"
        ? "bg-red-500/15 text-red-400 ring-red-500/30"
        : "bg-white/10 text-muted-foreground ring-black/20";

  const label =
    run === "denied"
      ? "Location permission denied"
      : run === "unavailable" || run === "unsupported"
        ? "Location unavailable"
        : link === "signing" || run === "geolocation_pending"
          ? "Starting live trackingâ€¦"
          : link === "session_required" || link === "session_error"
            ? "Live link error â€” retrying"
            : "GPS live Â· position broadcasting";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${color}`}
    >
      <span
        className={`size-2 rounded-full ${
          label.startsWith("GPS live") ? "bg-brand animate-pulse" : "bg-current"
        }`}
      />
      {label}
    </span>
  );
}
