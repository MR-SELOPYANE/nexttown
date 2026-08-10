import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Car,
  Package,
  Truck,
  Plane,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Radio,
  MapPin,
  Wallet,
  Users,
  Zap,
} from "lucide-react";

import heroMap from "@/assets/hero-map.jpg";
import ridesImg from "@/assets/vertical-rides.jpg";
import parcelsImg from "@/assets/vertical-parcels.jpg";
import trucksImg from "@/assets/vertical-trucks.jpg";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { ComplianceStrip } from "@/components/site/compliance-strip";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "HITCH SA — Moving in one direction." },
      {
        name: "description",
        content:
          "South Africa's unified mobility marketplace. Rides, parcels, freight return-loads, empty airline seats and school transport — one platform.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

type VerticalKey = "rides" | "parcels" | "trucks" | "flights" | "school";

interface Vertical {
  key: VerticalKey;
  label: string;
  title: string;
  copy: string;
  bullets: string[];
  image: string;
  icon: typeof Car;
}

const VERTICALS: Vertical[] = [
  {
    key: "rides",
    label: "Rides",
    title: "Intelligent commuting.",
    copy: "Real-time route optimisation across metro centres. Verified drivers, transparent pricing, and corporate integration for the modern South African workforce.",
    bullets: ["In-app emergency response", "Fixed-rate airport shuttles", "Corporate ride wallets"],
    image: ridesImg,
    icon: Car,
  },
  {
    key: "parcels",
    label: "Parcels",
    title: "Same-day, everywhere.",
    copy: "Hyperlocal courier infrastructure for businesses and individuals. QR proof of delivery, live tracking and insurance on every drop.",
    bullets: ["QR + OTP proof of delivery", "Insurance up to R50 000", "API for retailers"],
    image: parcelsImg,
    icon: Package,
  },
  {
    key: "trucks",
    label: "Trucks",
    title: "Empty return legs, monetised.",
    copy: "Freight operators publish empty capacity on their return corridors. Businesses book verified trucks at up to 40% below spot rates.",
    bullets: ["National corridor matching", "Live GPS + POD", "Invoicing & escrow built in"],
    image: trucksImg,
    icon: Truck,
  },
  {
    key: "flights",
    label: "Flights",
    title: "Sky Hitch — empty seats.",
    copy: "Airlines and charter operators list unsold seats close to departure. Travellers unlock domestic routes at charter-grade prices.",
    bullets: ["Domestic + regional charter", "Boarding QR + check-in", "Full refund protection"],
    image: ridesImg,
    icon: Plane,
  },
  {
    key: "school",
    label: "School",
    title: "School Buddy transport.",
    copy: "Vetted drivers, verified schools, monthly billing. Parents get live tracking, pickup verification and emergency alerts.",
    bullets: ["Live pickup + drop verification", "SAPS-checked drivers", "Monthly parent billing"],
    image: parcelsImg,
    icon: GraduationCap,
  },
];

const STATS = [
  { label: "Active drivers", value: "14,282", accent: true },
  { label: "Trips today", value: "84,902" },
  { label: "Cities active", value: "124" },
  { label: "Platform trust", value: "99.9%" },
];

function Landing() {
  const [active, setActive] = useState<VerticalKey>("rides");
  const current = VERTICALS.find((v) => v.key === active) ?? VERTICALS[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <Hero active={active} setActive={setActive} current={current} />
      <StatStrip />
      <BentoVerticals />
      <TrustSection />
      <ComplianceStrip />
      <SiteFooter />
    </div>
  );
}

function Hero({
  active,
  setActive,
  current,
}: {
  active: VerticalKey;
  setActive: (k: VerticalKey) => void;
  current: Vertical;
}) {
  return (
    <section className="relative pt-20 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroMap}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-semibold mb-8"
          style={{ animation: "hitch-fade-up 0.6s ease-out both" }}
        >
          <span
            className="size-1.5 rounded-full bg-brand-light"
            style={{ animation: "hitch-pulse-dot 1.8s ease-in-out infinite" }}
          />
          NOW SERVING 9 PROVINCES
        </div>

        <h1
          className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-balance max-w-[18ch] mb-6"
          style={{ animation: "hitch-fade-up 0.7s ease-out 0.05s both" }}
        >
          Moving in one direction.
        </h1>

        <p
          className="text-lg text-muted-foreground max-w-[56ch] text-pretty mb-10"
          style={{ animation: "hitch-fade-up 0.7s ease-out 0.15s both" }}
        >
          The unified mobility infrastructure for South Africa. One platform for
          commuters, couriers, heavy-haulage, aviation and school transport.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 mb-16"
          style={{ animation: "hitch-fade-up 0.7s ease-out 0.25s both" }}
        >
          <Link
            to="/register"
            className="bg-foreground text-background font-medium py-2.5 px-5 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/features"
            className="glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors"
          >
            For drivers &amp; operators
          </Link>
        </div>

        {/* Vertical switcher */}
        <div
          className="w-full max-w-5xl glass-card rounded-2xl overflow-hidden ring-1 ring-black/20 shadow-2xl shadow-black/40"
          style={{ animation: "hitch-fade-up 0.8s ease-out 0.35s both" }}
        >
          <div className="grid grid-cols-5 border-b border-white/5" role="tablist">
            {VERTICALS.map((v) => {
              const Icon = v.icon;
              const isActive = v.key === active;
              return (
                <button
                  key={v.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(v.key)}
                  className={`p-3 md:p-4 flex flex-col items-center gap-1.5 border-r border-white/5 last:border-r-0 transition-colors ${
                    isActive
                      ? "bg-white/5 text-brand-light"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest">
                    {v.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            key={current.key}
            className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center"
            style={{ animation: "hitch-fade-up 0.4s ease-out both" }}
          >
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-medium mb-3 tracking-tight">{current.title}</h3>
              <p className="text-muted-foreground text-sm max-w-[48ch] mb-6 leading-relaxed">
                {current.copy}
              </p>
              <ul className="space-y-2.5">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-foreground/80">
                    <span className="size-1 rounded-full bg-brand-light" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <img
                src={current.image}
                alt={current.title}
                width={800}
                height={500}
                loading="lazy"
                className="w-full aspect-video object-cover rounded-xl outline outline-1 -outline-offset-1 outline-black/30"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatStrip() {
  return (
    <div className="border-y border-white/5 bg-white/[0.02] py-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              {s.label}
            </span>
            <span
              className={`text-xl font-medium tabular-nums ${
                s.accent ? "text-brand-light" : "text-foreground"
              }`}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoVerticals() {
  return (
    <section id="verticals" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div className="max-w-[48ch]">
            <h2 className="text-3xl md:text-4xl font-medium mb-4 text-balance tracking-tight">
              Built for the complexity of local logistics.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Specialised tools for every sector of the South African mobility
              landscape — one identity, one wallet, one control tower.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <BentoCard
            className="md:col-span-2"
            eyebrow="Parcels"
            title="Parcels & last mile"
            copy="Same-day delivery infrastructure for businesses and individuals across the republic."
            image={parcelsImg}
          />
          <BentoCard
            eyebrow="Freight"
            title="Return-load network"
            copy="Eliminate empty return legs. Connect with vetted cargo across every corridor."
            image={trucksImg}
            portrait
          />
          <BentoCard
            eyebrow="Sky Hitch"
            title="Empty airline seats"
            copy="Last-minute domestic and charter seats surfaced the moment they open up."
            icon={Plane}
          />
          <BentoCard
            className="md:col-span-2"
            eyebrow="School Buddy"
            title="Verified school transport"
            copy="Live pickup and drop verification, SAPS-checked drivers, monthly billing for parents."
            image={ridesImg}
          />
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  eyebrow,
  title,
  copy,
  image,
  icon: Icon,
  className = "",
  portrait = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image?: string;
  icon?: typeof Plane;
  className?: string;
  portrait?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 transition-colors hover:border-brand/30 ${className}`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest mb-2">
          {eyebrow}
        </div>
        <h4 className="text-xl md:text-2xl font-medium mb-2 tracking-tight">{title}</h4>
        <p className="text-muted-foreground text-sm max-w-[38ch] mb-6">{copy}</p>
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className={`mt-auto w-full ${
              portrait ? "h-64 object-cover" : "aspect-video object-cover"
            } rounded-xl outline outline-1 -outline-offset-1 outline-black/30 transition-transform duration-700 group-hover:scale-[1.02]`}
          />
        ) : Icon ? (
          <div className="mt-auto flex items-center justify-center h-40 rounded-xl bg-white/[0.03] border border-white/5">
            <Icon className="size-10 text-brand-light/70" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TrustSection() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Vetted infrastructure",
      copy: "Every driver, pilot and operator clears a 5-tier background check and equipment inspection.",
    },
    {
      icon: Wallet,
      title: "Escrowed payments",
      copy: "Funds are held until the hitch is completed. Transparent pricing, no cash risk.",
    },
    {
      icon: Radio,
      title: "Live control tower",
      copy: "GPS, ETA and emergency response monitored 24/7 by a real operations team.",
    },
    {
      icon: MapPin,
      title: "National grid",
      copy: "From Soweto streets to Sandton boardrooms — coverage across all nine provinces.",
    },
    {
      icon: Users,
      title: "One identity",
      copy: "Rider, driver, business or parent — one KYC, one wallet, one reputation.",
    },
    {
      icon: Zap,
      title: "Enterprise API",
      copy: "Book, track and reconcile from your own systems with production-grade endpoints.",
    },
  ];

  return (
    <section id="trust" className="px-6 py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-[48ch] mb-14">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 tracking-tight text-balance">
            Institutional trust. Silicon-Valley speed.
          </h2>
          <p className="text-muted-foreground text-pretty">
            HITCH SA was engineered against the same standards that regulate our
            banks — because moving people, cargo and children deserves nothing less.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
              >
                <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                  <Icon className="size-5 text-brand-light" />
                </div>
                <h4 className="text-base font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
