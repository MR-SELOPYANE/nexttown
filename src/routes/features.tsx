import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import {
  Car,
  Package,
  Truck,
  Plane,
  GraduationCap,
  ShieldCheck,
  Wallet,
  Radio,
  Zap,
  Users,
  BarChart3,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — HITCH SA" },
      {
        name: "description",
        content:
          "Every capability on HITCH SA: rides, parcels, freight return-loads, empty airline seats, school transport, wallet, live tracking and enterprise APIs.",
      },
      { property: "og:title", content: "Features — HITCH SA" },
      {
        property: "og:description",
        content: "The complete HITCH SA mobility toolkit for individuals and businesses.",
      },
      { property: "og:url", content: "/features" },
    ],
    links: [{ rel: "canonical", href: "/features" }],
  }),
});

const VERTICALS = [
  { icon: Car, title: "Rides", copy: "On-demand + scheduled commutes with corporate billing." },
  { icon: Package, title: "Parcels", copy: "Same-day courier with QR + OTP proof of delivery." },
  { icon: Truck, title: "Freight", copy: "Empty return-load matching across national corridors." },
  { icon: Plane, title: "Sky Hitch", copy: "Empty airline & charter seats surfaced pre-departure." },
  { icon: GraduationCap, title: "School Buddy", copy: "Verified school transport with parent tracking." },
];

const PLATFORM = [
  { icon: ShieldCheck, title: "KYC + fraud engine", copy: "SA ID, passport and vehicle disc verification, 5-tier background checks." },
  { icon: Wallet, title: "Wallet & escrow", copy: "Multi-currency wallet, split payments, driver payouts, PayFast / Ozow / Stripe rails." },
  { icon: Radio, title: "Live control tower", copy: "Real-time GPS, ETA, SOS, and 24/7 human operations." },
  { icon: Zap, title: "AI matching", copy: "Route, price and safety optimisation with demand forecasting." },
  { icon: Users, title: "Roles & RBAC", copy: "Traveler, driver, operator, business and admin roles from day one." },
  { icon: BarChart3, title: "Analytics", copy: "Per-vertical dashboards, revenue forecasting and heat maps." },
  { icon: Bell, title: "Notifications", copy: "Push, SMS, email and WhatsApp — templated and localised." },
];

function FeaturesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Features"
        title="Every mode. One platform."
        subtitle="Five mobility verticals sharing a single identity, wallet, safety layer and control tower."
      />

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Verticals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {VERTICALS.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
                >
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    <Icon className="size-5 text-brand-light" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 border-t border-white/5 pt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="glass-card rounded-2xl p-6 ring-1 ring-black/20"
                >
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    <Icon className="size-5 text-brand-light" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
