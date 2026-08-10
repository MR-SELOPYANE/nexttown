import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MapPin, Navigation, Phone, ShieldAlert, Star } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { LiveMap } from "@/components/site/maps";
import { parseRoute } from "@/lib/sa-places";
import { useDemo, zar } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";


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
  const { bookings, advanceBooking, rateBooking, triggerSos, emergencyContact } = useDemo();
  const active = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" || b.status === "in-transit"),
    [bookings],
  );
  const recent = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const [selected, setSelected] = useState<string | null>(null);
  const current = bookings.find((b) => b.id === (selected ?? active[0]?.id)) ?? null;

  const [progress, setProgress] = useState(18);
  useEffect(() => {
    setProgress(current?.status === "in-transit" ? 62 : 18);
  }, [current?.id, current?.status]);

  useEffect(() => {
    if (!current || current.status === "completed" || current.status === "cancelled") return;
    const t = setInterval(() => setProgress((p) => Math.min(96, p + 1)), 1200);
    return () => clearInterval(t);
  }, [current?.id, current?.status]);

  const driver = DRIVERS[(current?.ref.charCodeAt(3) ?? 0) % DRIVERS.length];
  const geo = useMemo(() => parseRoute(current?.title ?? "Johannesburg → Pretoria"), [current?.title]);
  const stageIndex = current

    ? current.status === "completed"
      ? 4
      : current.status === "in-transit"
        ? 3
        : 1
    : 0;
  const eta = Math.max(1, Math.round(((100 - progress) / 100) * 42));

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
                <Progress value={current.status === "completed" ? 100 : progress} className="mt-5" />
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
                  <Button
                    size="sm"
                    className="bg-brand hover:bg-brand-light text-white"
                    disabled={current.status === "completed" || current.status === "cancelled"}
                    onClick={() => advanceBooking(current.id)}
                  >
                    Advance status
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-5">
                  Fare {zar(current.price)} · paid on completion
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Safety</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {emergencyContact
                    ? `Emergency contact on file: ${emergencyContact}`
                    : "Add an emergency contact in your profile for automatic alerts."}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    triggerSos(current.title);
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
                    <div className="text-sm font-medium mb-2">Rate this trip</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          aria-label={`Rate ${n} stars`}
                          onClick={() => {
                            rateBooking(current.id, n);
                            toast.success("Thanks for the feedback");
                          }}
                        >
                          <Star
                            className={`size-5 ${
                              (current.rating ?? 0) >= n
                                ? "fill-current text-brand-light"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
