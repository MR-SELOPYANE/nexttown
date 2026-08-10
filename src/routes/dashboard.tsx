import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { useDemo, zar, type Booking, type DemoUser, type MarketType } from "@/lib/demo-store";
import {
  Car,
  Package,
  Truck,
  Plane,
  GraduationCap,
  TrendingUp,
  Wallet,
  Users,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — HITCH SA" },
      {
        name: "description",
        content:
          "Track your HITCH SA bookings, deliveries and operator listings in one control tower.",
      },
      { property: "og:title", content: "Dashboard — HITCH SA" },
      {
        property: "og:description",
        content: "Bookings, deliveries, listings and earnings in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ICONS: Record<MarketType, typeof Car> = {
  ride: Car,
  parcel: Package,
  freight: Truck,
  flight: Plane,
  school: GraduationCap,
};

const STATUS_STYLE: Record<Booking["status"], string> = {
  confirmed: "bg-brand/10 text-brand-light border-brand/20",
  "in-transit": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-white/5 text-muted-foreground border-white/10",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

type Role = DemoUser["role"];

const ROLE_COPY: Record<
  Role,
  { label: string; operatorTab: string; operatorFirst: boolean; postTo: string; postCta: string }
> = {
  traveler: {
    label: "Traveler",
    operatorTab: "Offer a ride",
    operatorFirst: false,
    postTo: "/rides",
    postCta: "Browse rides",
  },
  driver: {
    label: "Driver",
    operatorTab: "My rides",
    operatorFirst: true,
    postTo: "/rides",
    postCta: "Offer a ride",
  },
  trucker: {
    label: "Truck operator",
    operatorTab: "My loads",
    operatorFirst: true,
    postTo: "/freight",
    postCta: "Post a return-load",
  },
  parcel: {
    label: "Parcel customer",
    operatorTab: "My deliveries",
    operatorFirst: false,
    postTo: "/parcels",
    postCta: "Send a parcel",
  },
  airline: {
    label: "Airline / charter",
    operatorTab: "My flights",
    operatorFirst: true,
    postTo: "/flights",
    postCta: "List empty capacity",
  },
  school: {
    label: "School transport",
    operatorTab: "My routes",
    operatorFirst: true,
    postTo: "/school",
    postCta: "List a school route",
  },
};

const GUEST_COPY = ROLE_COPY.traveler;

function DashboardPage() {
  const { user, bookings, postings, advanceBooking, cancelBooking, togglePosting, removePosting, reset } =
    useDemo();
  const copy = user ? ROLE_COPY[user.role] : GUEST_COPY;
  const [tab, setTab] = useState<"traveler" | "operator">(
    copy.operatorFirst ? "operator" : "traveler",
  );

  const active = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const spend = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.price, 0);
  const earnings = Math.round(spend * 0.88);


  return (
    <PageShell showCompliance={false}>
      <PageHeader
        eyebrow={user ? `${copy.label} · ${user.name}` : "Demo workspace · guest"}
        title="Your control tower"
        subtitle="Every booking, delivery and listing across the HITCH marketplace — live."
      />

      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {!user && (
          <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1 min-w-0">
              You're browsing the shared demo workspace. Sign in to see the view for your role.
            </p>
            <Link
              to="/login"
              className="text-sm font-medium py-2 px-4 rounded-lg bg-brand hover:bg-brand-light text-white ring-1 ring-brand/50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={TrendingUp} label="Active jobs" value={String(active.length)} />
          <Stat icon={Wallet} label="Lifetime spend" value={zar(spend)} />
          <Stat icon={Users} label="Live listings" value={String(postings.filter((p) => p.status === "live").length)} />
          <Stat icon={TrendingUp} label="Operator payout" value={zar(earnings)} />
        </div>

        <div className="flex items-center gap-2">
          {(["traveler", "operator"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                tab === t
                  ? "bg-brand/15 border-brand/40 text-brand-light"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "traveler" ? "My bookings" : copy.operatorTab}
            </button>
          ))}

          <button
            onClick={reset}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Reset demo data
          </button>
        </div>

        {tab === "traveler" ? (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <Empty text="No bookings yet." to={copy.postTo} cta={copy.postCta} />
            )}
            {bookings.map((b) => {
              const Icon = ICONS[b.type];
              return (
                <div
                  key={b.id}
                  className="glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4"
                >
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{b.title}</h3>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLE[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.ref} · {b.route}
                    </p>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{zar(b.price)}</div>
                  <div className="flex gap-2">
                    {(b.status === "confirmed" || b.status === "in-transit") && (
                      <>
                        <button
                          onClick={() => advanceBooking(b.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-light text-white ring-1 ring-brand/50 transition-colors"
                        >
                          {b.status === "confirmed" ? "Start trip" : "Complete"}
                        </button>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                My listings
              </h2>
              {postings.length === 0 && (
                <Empty text="No listings yet." to={copy.postTo} cta={copy.postCta} />
              )}
              {postings.map((p) => {
                const Icon = ICONS[p.type];
                return (
                  <div
                    key={p.id}
                    className="glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4"
                  >
                    <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{p.title}</h3>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            p.status === "live"
                              ? "bg-brand/10 text-brand-light border-brand/20"
                              : "bg-white/5 text-muted-foreground border-white/10"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.route} · {p.capacity}
                      </p>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{zar(p.price)}</div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => togglePosting(p.id)}
                        aria-label={p.status === "live" ? "Pause listing" : "Resume listing"}
                        className="p-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
                      >
                        {p.status === "live" ? (
                          <Pause className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removePosting(p.id)}
                        aria-label="Remove listing"
                        className="p-2 rounded-lg border border-white/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <aside className="space-y-4">
              <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Earnings summary
                </h3>
                <div className="text-3xl font-semibold tabular-nums mb-1">{zar(earnings)}</div>
                <p className="text-xs text-muted-foreground mb-4">
                  After 12% platform take-rate
                </p>
                <div className="space-y-2 text-xs">
                  <Row label="Gross bookings" value={zar(spend)} />
                  <Row label="Platform fee" value={`- ${zar(spend - earnings)}`} />
                  <Row label="Next payout" value="Fri 08:00" />
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Compliance
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>✓ Identity verified (KYC)</li>
                  <li>✓ SAPS background check</li>
                  <li>✓ Vehicle roadworthy certificate</li>
                  <li>✓ Goods-in-transit insurance</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Car;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
      <Icon className="size-4 text-brand-light mb-3" />
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function Empty({ text, to, cta }: { text: string; to: string; cta: string }) {
  return (
    <div className="glass-card rounded-2xl p-10 text-center ring-1 ring-black/20">
      <p className="text-sm text-muted-foreground mb-4">{text}</p>
      <Link
        to={to}
        className="inline-flex items-center justify-center bg-brand hover:bg-brand-light text-white text-sm font-medium py-2 px-4 rounded-lg ring-1 ring-brand/50 transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
