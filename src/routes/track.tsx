import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Phone, QrCode, ShieldAlert, Star } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { RideMap } from "@/components/site/map";
import { RequireAuth } from "@/components/site/require-auth";
import { RatingPanel, ReviewSummary } from "@/components/site/rating-panel";
import { parseRoute } from "@/lib/sa-places";
import { getDirections } from "@/lib/google-maps";
import { useRideTracker } from "@/lib/ride/use-ride-tracker";
import { useLiveDriverLocations } from "@/lib/realtime/use-live-driver-locations";
import { getSupabaseSession } from "@/lib/api/supabase";
import { offsetKm } from "@/lib/ride/geo";
import type { Driver, LatLng } from "@/lib/ride/types";
import {
  useAdvanceBooking,
  useBookings,
  useCompleteParcel,
  useCreateSafetyIncident,
  useCreateTripShare,
  useRideEvents,
  useRecordRideEvent,
  useReviewBooking,
  useTriggerSos,
} from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { zar } from "@/lib/format";
import type { Booking } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Live trip tracking — Next Town" },
      {
        name: "description",
        content:
          "Follow your Next Town ride, parcel or freight load in real time: driver details, live ETA, trip milestones and one-tap SOS.",
      },
      { property: "og:title", content: "Live trip tracking — Next Town" },
      {
        property: "og:description",
        content: "Real-time ETA, driver details and safety controls for every Next Town trip.",
      },
    ],
  }),
  component: TrackPage,
});

const STAGES = ["Matched", "Driver en route", "Picked up", "In transit", "Delivered"];

const DRIVERS = [
  { name: "Sipho Ndlovu", vehicle: "Toyota Corolla · CA 421-889", rating: 4.9 },
  { name: "Lerato Mokoena", vehicle: "VW Polo · GP JHB 118-234", rating: 4.8 },
  { name: "Ayanda Khumalo", vehicle: "Isuzu FTR · ND 552-114", rating: 4.7 },
];

/** Build a stable driver object for the tracked booking, parked near its pickup point. */
function buildTrackDriver(meta: (typeof DRIVERS)[number], center: LatLng, id: string): Driver {
  const [car, plate] = meta.vehicle.split(" · ");
  return {
    id,
    name: meta.name,
    car: car ?? meta.vehicle,
    plate: plate ?? "",
    rating: meta.rating,
    trips: 1240,
    phone: "+27100000009",
    location: {
      ...offsetKm(center, 2.5, 3.5),
      heading: 0,
      status: "available",
      speedKmh: 0,
      updatedAt: Date.now(),
    },
  };
}

function TrackPage() {
  return (
    <RequireAuth>
      <TrackInner />
    </RequireAuth>
  );
}

function TrackInner() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: bookings = [] } = useBookings(userId);
  const advance = useAdvanceBooking(userId);
  const review = useReviewBooking(userId);
  const pod = useCompleteParcel(userId);
  const sos = useTriggerSos(userId);
  const incident = useCreateSafetyIncident(userId);
  const createShare = useCreateTripShare(userId);
  const [incidentMessage, setIncidentMessage] = useState("");

  const active = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "requested" || b.status === "confirmed" || b.status === "in_transit",
      ),
    [bookings],
  );
  const recent = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const [selected, setSelected] = useState<string | null>(null);
  const current = bookings.find((b) => b.id === (selected ?? active[0]?.id)) ?? null;
  const events = useRideEvents(userId, current?.id);
  const recordEvent = useRecordRideEvent(userId, current?.id);

  // Road-based ETA
  const [roadDuration, setRoadDuration] = useState<number | null>(null);
  const geo = useMemo(
    () => parseRoute(current?.title ?? "Johannesburg → Pretoria"),
    [current?.title],
  );

  useEffect(() => {
    if (!current || current.status === "completed" || current.status === "cancelled") return;
    let cancelled = false;
    getDirections(geo.from, geo.to, geo.stops.length > 0 ? geo.stops : undefined)
      .then((info) => {
        if (!cancelled) setRoadDuration(info.durationMin);
      })
      .catch(() => {
        if (!cancelled) setRoadDuration(null);
      });
    return () => {
      cancelled = true;
    };
  }, [current, geo.from, geo.to, geo.stops]);

  const trackDriver = useMemo(() => {
    const meta = DRIVERS[(current?.ref.charCodeAt(3) ?? 0) % DRIVERS.length];
    return buildTrackDriver(meta, geo.from, `track-${current?.id ?? "none"}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.ref, geo.from.lat, geo.from.lng]);

  // ── real-time driver identity ────────────────────────────────────────────
  // Production: the booking stores its driver id; the share link supplies it
  // (`/track?driver=<auth uid>`), which anon/passenger RLS allows reading.
  // Demo: the browser's own Supabase session (the identity signed in by the
  // driver console) doubles as the tracked driver. Unconfigured → demo feed.
  const [selfUuid, setSelfUuid] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSupabaseSession().then((s) => {
      if (!cancelled) setSelfUuid(s?.user.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveDriverIds = useMemo(() => {
    const viaLink = window.location.search
      ? new URLSearchParams(window.location.search).get("driver")
      : null;
    if (viaLink) return [viaLink];
    return selfUuid ? [selfUuid] : [];
  }, [selfUuid]);
  const liveBooking =
    Boolean(current) && current?.status !== "completed" && current?.status !== "cancelled";
  const liveSub = useLiveDriverLocations({
    driverIds: liveBooking ? liveDriverIds : [],
    enabled: liveBooking && liveDriverIds.length > 0,
  });
  const liveLoc = liveSub.live
    ? (liveDriverIds.map((id) => liveSub.locations[id]).find(Boolean) ?? null)
    : null;

  // Live ride tracker — the map renders real driver positions; milestones are
  // mirrored from the booking status (the caller keeps full control here).
  const tracker = useRideTracker({
    pickup: geo.from,
    dropoff: geo.to,
    stops: geo.stops,
    pickupLabel: geo.labels[0] ?? "",
    dropoffLabel: geo.labels[geo.labels.length - 1] ?? "",
    stopLabels: geo.labels.slice(1, -1),
    drivers: [trackDriver],
    speedKmh: 40,
    autoTransition: false,
    resetKey: current?.id,
    live: liveSub.live,
    liveLocation: liveLoc,
    liveConnected: liveSub.connection === "subscribed",
  });

  const stageIndex = current
    ? current.status === "completed"
      ? 4
      : current.status === "in_transit"
        ? 3
        : current.status === "confirmed"
          ? 1
          : 0
    : 0;

  // Mirror booking status into the tracker: confirmed → assign driver,
  // in_transit → rider on board, completed → nothing (markers show the end state).
  useEffect(() => {
    if (!current || current.status === "completed" || current.status === "cancelled") return;
    if (current.status === "in_transit") {
      if (tracker.ride.activeDriver && tracker.ride.state === "assigned") tracker.startTrip();
    } else if (current.status === "confirmed" && !tracker.ride.activeDriver) {
      tracker.assign(trackDriver);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    current?.id,
    current?.status,
    tracker.ride.state,
    tracker.ride.activeDriver?.id,
    trackDriver,
  ]);

  const displayDriver = tracker.ride.activeDriver ?? trackDriver;
  const totalTime = roadDuration ?? 42;
  const completed = current?.status === "completed" || tracker.ride.state === "completed";
  const eta = completed
    ? 0
    : Math.max(
        1,
        Math.round(
          tracker.ride.etaMin != null && tracker.ride.etaMin > 0 ? tracker.ride.etaMin : totalTime,
        ),
      );
  const emergency = user?.emergencyContact || user?.emergencyNumber || "";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Live operations"
        title="Track your trip"
        subtitle="Milestone updates, live ETA and safety tools for every active booking on your account."
      />
      <section className="px-6 py-14 max-w-6xl mx-auto grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Active</h2>
          {active.length === 0 && (
            <div className="glass-card rounded-xl p-4 border border-white/10 text-sm text-muted-foreground">
              Nothing in motion.{" "}
              <Link to="/rides" className="text-brand-light">
                Book a ride
              </Link>
              .
            </div>
          )}
          {active.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b.id)}
              className={`w-full text-left glass-card rounded-xl p-4 border transition-colors ${
                current?.id === b.id ? "border-brand/50" : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="text-xs text-brand-light font-mono">{b.ref}</div>
              <div className="text-sm font-medium">{b.title}</div>
              <div className="text-xs text-muted-foreground">{b.route}</div>
            </button>
          ))}
          {recent.length > 0 && (
            <>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground pt-4">
                Completed
              </h2>
              {recent.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelected(b.id)}
                  className="w-full text-left glass-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="text-xs font-mono text-muted-foreground">{b.ref}</div>
                  <div className="text-sm">{b.title}</div>
                </button>
              ))}
            </>
          )}
        </aside>

        {current ? (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="relative border-b border-white/10">
                <RideMap
                  pickup={geo.from}
                  dropoff={geo.to}
                  stops={geo.stops}
                  labels={geo.labels}
                  activeDriver={tracker.ride.activeDriver}
                  nearbyDrivers={[]}
                  height={280}
                />
                <div className="absolute bottom-3 left-4 text-xs text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded-md">
                  Live map · {geo.labels[0]}
                  {geo.labels.length > 2
                    ? ` → … → ${geo.labels[geo.labels.length - 1]}`
                    : ` → ${geo.labels[1]}`}
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-brand-light">{current.ref}</div>
                    <h2 className="text-xl font-semibold">{current.title}</h2>
                    <p className="text-sm text-muted-foreground">{current.route}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ETA</div>
                    <div className="text-2xl font-semibold">
                      {completed ? "Arrived" : `${eta} min`}
                    </div>
                  </div>
                </div>
                <Progress
                  value={current.status === "completed" ? 100 : Math.round(tracker.progressPct)}
                  className="mt-5"
                />
                <div className="grid grid-cols-5 gap-2 mt-4 text-[11px]">
                  {STAGES.map((s, i) => (
                    <div
                      key={s}
                      className={i <= stageIndex ? "text-brand-light" : "text-muted-foreground"}
                    >
                      <div
                        className={`h-1 rounded-full mb-2 ${i <= stageIndex ? "bg-brand" : "bg-white/10"}`}
                      />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold mb-4">Your operator</h3>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center text-brand-light font-semibold">
                    {displayDriver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{displayDriver.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {displayDriver.car} · {displayDriver.plate}
                    </div>
                    <div className="text-xs text-brand-light flex items-center gap-1">
                      <Star className="size-3 fill-current" /> {displayDriver.rating}
                      {displayDriver.identityVerified && displayDriver.vehicleVerified
                        ? " · Identity & vehicle verified"
                        : " · Verification pending"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" size="sm" onClick={() => toast("Calling operator…")}>
                    <Phone className="size-4" /> Call
                  </Button>
                  {!(current.type === "parcel" && current.status === "in_transit") && (
                    <Button
                      size="sm"
                      className="bg-brand hover:bg-brand-light text-white"
                      disabled={current.status === "completed" || current.status === "cancelled"}
                      onClick={() => advance.mutate(current.id)}
                    >
                      {current.type === "parcel" && current.status === "confirmed"
                        ? "Mark picked up"
                        : "Advance status"}
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-5">
                  Fare {zar(current.price)} · paid on completion
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Safety</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {emergency
                    ? `Emergency contact on file: ${emergency}`
                    : "Add an emergency contact in your profile for automatic alerts."}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    sos.mutate(current.title, {
                      onSuccess: () => {
                        incident.mutate({
                          kind: "sos",
                          message: "Emergency assistance requested from active trip.",
                          bookingId: current.id,
                        });
                        recordEvent.mutate({ type: "SOS_REQUESTED" });
                        toast.error("SOS recorded and sent to the safety desk");
                      },
                    });
                  }}
                  disabled={sos.isPending || incident.isPending}
                >
                  <ShieldAlert className="size-4" /> Trigger SOS
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    createShare.mutate(current.id, {
                      onSuccess: async (share) => {
                        const url = `${window.location.origin}/track?share=${share.shareToken}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          toast.success("Secure trip link copied");
                        } catch {
                          toast.info(url);
                        }
                      },
                    })
                  }
                  disabled={createShare.isPending}
                >
                  <Copy className="size-4" />{" "}
                  {createShare.isPending ? "Creating link…" : "Share trip"}
                </Button>
                <form
                  className="mt-4 space-y-2 border-t border-white/10 pt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!incidentMessage.trim()) return;
                    incident.mutate(
                      { kind: "support_report", message: incidentMessage, bookingId: current.id },
                      {
                        onSuccess: () => {
                          setIncidentMessage("");
                          toast.success("Incident report submitted");
                        },
                      },
                    );
                  }}
                >
                  <label htmlFor="incident-report" className="text-xs font-semibold">
                    Report an incident
                  </label>
                  <textarea
                    id="incident-report"
                    value={incidentMessage}
                    onChange={(event) => setIncidentMessage(event.target.value)}
                    placeholder="Tell the safety desk what happened"
                    className="min-h-20 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={incident.isPending || !incidentMessage.trim()}
                  >
                    Submit report
                  </Button>
                </form>
                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <div>· Trip shared with your emergency contact</div>
                  <div>· Route deviation alerts active</div>
                  <div>· 24/7 control room escalation</div>
                </div>
                {current.status === "completed" && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    {current.review ? (
                      <>
                        <div className="text-sm font-medium mb-3">Your review</div>
                        <ReviewSummary review={current.review} />
                      </>
                    ) : (
                      <RatingPanel
                        busy={review.isPending}
                        onSubmit={(r) => {
                          review.mutate({ id: current.id, review: r });
                          toast.success("Review submitted — thank you");
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {events.data && events.data.length > 0 && (
              <div className="glass-card rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold mb-4">Ride event history</h3>
                <ol className="space-y-3">
                  {events.data.map((event) => (
                    <li key={event.id} className="flex items-center gap-3 text-sm">
                      <span className="size-2 rounded-full bg-brand shrink-0" />
                      <span className="font-medium">{event.type.replaceAll("_", " ")}</span>
                      <time
                        className="ml-auto text-xs text-muted-foreground"
                        dateTime={new Date(event.occurredAt).toISOString()}
                      >
                        {new Date(event.occurredAt).toLocaleString("en-ZA")}
                      </time>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {current.type === "parcel" && current.status === "in_transit" && (
              <ParcelPodCard
                booking={current}
                pending={pod.isPending}
                onConfirm={(code) => {
                  pod.mutate(
                    { id: current.id, code },
                    {
                      onSuccess: () => toast.success("Delivery confirmed — escrow released"),
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Invalid OTP"),
                    },
                  );
                }}
              />
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-10 border border-white/10 text-center text-muted-foreground">
            Select or create a booking to see live tracking.
          </div>
        )}
      </section>
    </PageShell>
  );
}

/** Deterministic pseudo-QR rendered from the booking id — scan or read the OTP. */
function qrMatrix(seed: string): boolean[][] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const size = 13;
  const cells: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    cells.push([]);
    for (let c = 0; c < size; c++) {
      const inFinder = (r < 4 && c < 4) || (r < 4 && c >= size - 4) || (r >= size - 4 && c < 4);
      if (inFinder) {
        const rr = r < 4 ? r : r - (size - 4);
        const cc = c < 4 ? c : c - (size - 4);
        cells[r].push(rr === 0 || rr === 3 || cc === 0 || cc === 3);
        continue;
      }
      h = (h * 31 + 7) >>> 0;
      cells[r].push((h >>> (c % 16)) % 2 === 0);
    }
  }
  return cells;
}

function ParcelPodCard({
  booking,
  pending,
  onConfirm,
}: {
  booking: Booking;
  pending: boolean;
  onConfirm: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const matrix = useMemo(() => qrMatrix(booking.id), [booking.id]);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(booking.podCode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.info(`POD code: ${booking.podCode}`);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="size-5 text-brand-light" />
        <h3 className="font-semibold">Proof of delivery</h3>
      </div>
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="rounded-xl bg-white p-3 w-fit">
          <div
            className="grid grid-cols-13 gap-[2px]"
            style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}
          >
            {matrix.flatMap((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className={cn("size-2.5", cell ? "bg-slate-900" : "bg-white")}
                />
              )),
            )}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Hand the courier this code when they deliver. They verify it to release escrow to your
            courier.{" "}
            {booking.parcelDetails && (
              <span className="block mt-1 text-xs text-muted-foreground/80">
                Parcel note: “{booking.parcelDetails}”
              </span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold tracking-[0.3em] text-brand-light">
              {booking.podCode}
            </span>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter courier OTP"
              inputMode="numeric"
              className="w-40 h-10 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
            />
            <Button
              className="bg-brand hover:bg-brand-light text-white"
              disabled={code.length < 6 || pending}
              onClick={() => onConfirm(code)}
            >
              {pending ? "Verifying…" : "Confirm delivery"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
