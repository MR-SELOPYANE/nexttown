import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { RideMap } from "@/components/site/map";
import { useDemo, zar } from "@/lib/demo-store";
import { lookupPlace, SA_PLACES, type LatLng } from "@/lib/sa-places";
import { useRideTracker } from "@/lib/ride/use-ride-tracker";
import { useDriverPublisher } from "@/lib/realtime/use-driver-publisher";
import { gpsFixToDriverLocation } from "@/lib/realtime/location-mappers";
import type { Driver } from "@/lib/ride/types";
import { buildDriver, driverStatusForMode } from "@/lib/driver/driver-utils";
import { offsetKm } from "@/lib/ride/geo";
import { driverModeState } from "@/lib/driver/state";
import { DriverMetric } from "@/components/site/driver/driver-ui";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Power,
  Shield,
  Star,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

export type OperatorJobRequest = {
  client: string;
  rating: number;
  pickup: string;
  dropoff: string;
  detail: string;
  note: string;
};

export type OperatorConsoleConfig = {
  consoleTitle: string;
  consoleSub: string;
  eyebrow: string;
  onlineStatus: string;
  waitingTitle: string;
  waitingSub: string;
  offerBadge: string;
  metricJobLabel: string;
  phaseToPickup: string;
  phaseInTransit: string;
  ctaStart: string;
  ctaComplete: string;
  completeTitle: (payout: number) => string;
  completeSub: (job: OperatorJobRequest) => string;
  requests: OperatorJobRequest[];
  initialEarnings: number;
  initialJobs: number;
  weekData: number[];
  fareFor: (from: LatLng, to: LatLng) => { km: number; fare: number; mins: number };
  payoutRatio: number;
  pickupSub: (km: number) => string;
};

type Phase = "idle" | "offer" | "topickup" | "ontrip" | "complete";

const OFFER_SECONDS = 15;

export function OperatorConsole({
  config,
  sidebarExtra,
}: {
  config: OperatorConsoleConfig;
  sidebarExtra?: React.ReactNode;
}) {
  const { notify } = useDemo();
  const [online, setOnline] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reqIndex, setReqIndex] = useState(0);
  const [countdown, setCountdown] = useState(OFFER_SECONDS);
  const [jobs, setJobs] = useState(config.initialJobs);
  const [earnings, setEarnings] = useState(config.initialEarnings);
  const [declines, setDeclines] = useState(1);
  const offerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const req = config.requests[reqIndex % config.requests.length];
  const from = lookupPlace(req.pickup) ?? SA_PLACES.sandton;
  const to = lookupPlace(req.dropoff) ?? SA_PLACES.pretoria;
  const { km, fare, mins } = config.fareFor(from, to);
  const payout = Math.round(fare * config.payoutRatio);

  // This operator's own live entity — the feed moves THIS vehicle.
  const myDriver = useMemo<Driver>(
    () =>
      buildDriver(
        {
          name: "Sipho M.",
          car: "VW Polo · Silver",
          plate: "JH 42 KL GP",
          rating: 4.97,
          trips: 2821,
          phone: "+27100000008",
        },
        "operator-self",
        offsetKm(from, 1.5, 2.5),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from.lat, from.lng],
  );

  // ---- real-time GPS publisher: broadcasts THIS device's position ----------
  // Real GPS replaces the demo car; passengers see these exact coordinates
  // via Supabase Realtime (RLS-protected, client never sends a driver id).
  const driverMode = driverModeState(online, phase);
  const driverStatus = driverStatusForMode(online, driverMode);

  const publisher = useDriverPublisher({ enabled: online, status: driverStatus });
  const liveLoc = publisher.lastFix
    ? gpsFixToDriverLocation(publisher.lastFix, driverStatus)
    : null;

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

  // queue a new offer while online and idle
  useEffect(() => {
    if (!online || phase !== "idle") return;
    offerTimer.current = setTimeout(() => {
      setCountdown(OFFER_SECONDS);
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
    setPhase("topickup");
    notify({
      title: `Accepted · ${req.pickup} → ${req.dropoff}`,
      body: `${req.client} confirmed. Payout ${zar(payout)} after platform fee.`,
      kind: "trip",
    });
  }

  function declineOffer() {
    setDeclines((d) => d + 1);
    setReqIndex((i) => i + 1);
    setPhase("idle");
  }

  function completeJob() {
    tracker.finish();
    setJobs((t) => t + 1);
    setEarnings((e) => e + payout);
    notify({
      title: "Job completed",
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
  const etaDisplay = etaLoading ? "…" : `${etaMin} min`;

  const acceptance = Math.round((jobs / (jobs + declines)) * 100);

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
              >
                <span
                  className={`size-2 rounded-full ${online ? "bg-brand animate-pulse" : "bg-muted-foreground"}`}
                />
                {online ? config.onlineStatus : "Offline"}
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
              <div className="absolute top-[4.5rem] left-4">
                <OperatorGpsPill publisher={publisher} />
              </div>
            )}

            {online && phase === "idle" && (
              <div className="absolute bottom-4 left-4 right-4 glass-card rounded-2xl ring-1 ring-black/20 p-4 flex items-center gap-3">
                <div className="size-9 rounded-full border-2 border-brand/30 border-t-brand animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium">{config.waitingTitle}</p>
                  <p className="text-xs text-muted-foreground">{config.waitingSub}</p>
                </div>
              </div>
            )}

            {phase === "offer" && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                <div className="w-full max-w-md glass-card rounded-3xl ring-1 ring-brand/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                      {config.offerBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                      <Clock className="size-3.5" />
                      {Math.max(0, countdown)}s
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-1000"
                      style={{ width: `${(Math.max(0, countdown) / OFFER_SECONDS) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{req.client}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-brand text-brand" />
                        {req.rating} · {req.detail}
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
                      sub={config.pickupSub(km)}
                    />
                    <Leg
                      icon={<MapPin className="size-3.5 text-amber-400" />}
                      label={req.dropoff}
                      sub={`${km} km · ${mins} min`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    {req.note}
                  </p>
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
                      Accept · {zar(payout)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5">
              <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest mb-1">
                {config.eyebrow}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{config.consoleTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">{config.consoleSub}</p>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <DriverMetric icon={Wallet} label="Today" value={zar(earnings)} />
                <DriverMetric
                  icon={TrendingUp}
                  label={config.metricJobLabel}
                  value={String(jobs)}
                />
                <DriverMetric icon={Shield} label="Accept" value={`${acceptance}%`} />
              </div>
            </div>

            <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5 space-y-4">
              {phase === "idle" && (
                <p className="text-sm text-muted-foreground">
                  {online
                    ? "You're online. The next request will pop up on the map."
                    : "You're offline. Go online to start receiving requests."}
                </p>
              )}

              {phase === "offer" && (
                <p className="text-sm text-muted-foreground">
                  Incoming request from {req.client} — respond on the map.
                </p>
              )}

              {(phase === "topickup" || phase === "ontrip") && (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                    {phase === "topickup" ? config.phaseToPickup : config.phaseInTransit}
                  </div>
                  <div className="text-lg font-semibold">
                    {phase === "topickup"
                      ? `${req.pickup} · ${req.detail}`
                      : `${req.pickup} → ${req.dropoff}`}
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
                  {phase === "topickup" ? (
                    <button
                      onClick={() => {
                        tracker.startTrip();
                        setPhase("ontrip");
                      }}
                      className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                    >
                      {config.ctaStart}
                    </button>
                  ) : (
                    <button
                      onClick={completeJob}
                      className="w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                    >
                      {config.ctaComplete}
                    </button>
                  )}
                </>
              )}

              {phase === "complete" && (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-7 text-brand" />
                    <div>
                      <div className="text-lg font-semibold">{config.completeTitle(payout)}</div>
                      <p className="text-xs text-muted-foreground">{config.completeSub(req)}</p>
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
                {config.weekData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t-md bg-brand/60"
                      style={{ height: `${(v / Math.max(...config.weekData)) * 100}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {sidebarExtra}
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

/** Small live-tracking health pill: Supabase link + geolocation state. */
function OperatorGpsPill({ publisher }: { publisher: ReturnType<typeof useDriverPublisher> }) {
  const { link, run } = publisher;

  if (link === "unconfigured") {
    return (
      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full glass-card ring-1 ring-black/20 text-muted-foreground">
        Live tracking demo — Supabase not configured
      </span>
    );
  }

  const degraded =
    run === "denied" ||
    run === "unavailable" ||
    run === "unsupported" ||
    link === "session_required";
  const color =
    link === "authenticated" && run === "tracking"
      ? "bg-brand/15 text-brand-light ring-brand/30"
      : degraded
        ? "bg-red-500/15 text-red-400 ring-red-500/30"
        : "bg-white/10 text-muted-foreground ring-black/20";

  const label =
    run === "denied"
      ? "Location permission denied"
      : run === "unavailable" || run === "unsupported"
        ? "Location unavailable"
        : link === "signing" || run === "geolocation_pending"
          ? "Starting live tracking…"
          : link === "session_required"
            ? "Live link error — retrying"
            : "GPS live · position broadcasting";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${color}`}
    >
      <span
        className={`size-2 rounded-full ${label.startsWith("GPS live") ? "bg-brand animate-pulse" : "bg-current"}`}
      />
      {label}
    </span>
  );
}
