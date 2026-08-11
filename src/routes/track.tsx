import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Phone, QrCode, ShieldAlert, Star } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { LiveMap } from "@/components/site/maps";
import { RequireAuth } from "@/components/site/require-auth";
import { RatingPanel, ReviewSummary } from "@/components/site/rating-panel";
import { parseRoute } from "@/lib/sa-places";
import {
  useAdvanceBooking,
  useBookings,
  useCompleteParcel,
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
      { title: "Live trip tracking — HITCH SA" },
      {
        name: "description",
        content:
          "Follow your HITCH SA ride, parcel or freight load in real time: driver details, live ETA, trip milestones and one-tap SOS.",
      },
      { property: "og:title", content: "Live trip tracking — HITCH SA" },
      {
        property: "og:description",
        content: "Real-time ETA, driver details and safety controls for every HITCH SA trip.",
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

  const [progress, setProgress] = useState(18);
  useEffect(() => {
    setProgress(current?.status === "in_transit" ? 62 : 18);
  }, [current?.id, current?.status]);

  useEffect(() => {
    if (!current || current.status === "completed" || current.status === "cancelled") return;
    const t = setInterval(() => setProgress((p) => Math.min(96, p + 1)), 1200);
    return () => clearInterval(t);
  }, [current?.id, current?.status]);

  const driver = DRIVERS[(current?.ref.charCodeAt(3) ?? 0) % DRIVERS.length];
  const geo = useMemo(
    () => parseRoute(current?.title ?? "Johannesburg → Pretoria"),
    [current?.title],
  );
  const stageIndex = current
    ? current.status === "completed"
      ? 4
      : current.status === "in_transit"
        ? 3
        : current.status === "confirmed"
          ? 1
          : 0
    : 0;
  const eta = Math.max(1, Math.round(((100 - progress) / 100) * 42));
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
                <LiveMap
                  from={geo.from}
                  to={geo.to}
                  labels={geo.labels}
                  progress={current.status === "completed" ? 100 : progress}
                  height={280}
                />
                <div className="absolute bottom-3 left-4 text-xs text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded-md">
                  Live map · {geo.labels[0]} → {geo.labels[1]}
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
                      {current.status === "completed" ? "Arrived" : `${eta} min`}
                    </div>
                  </div>
                </div>
                <Progress
                  value={current.status === "completed" ? 100 : progress}
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
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">{driver.vehicle}</div>
                    <div className="text-xs text-brand-light flex items-center gap-1">
                      <Star className="size-3 fill-current" /> {driver.rating} · Verified
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
                    sos.mutate(current.title);
                    toast.error("SOS sent to the HITCH SA safety desk");
                  }}
                >
                  <ShieldAlert className="size-4" /> Trigger SOS
                </Button>
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
          <div className="grid grid-cols-13 gap-[2px]" style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}>
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
            Hand the courier this code when they deliver. They verify it to release escrow to
            your courier.{" "}
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
