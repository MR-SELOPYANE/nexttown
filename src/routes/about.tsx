import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { Rocket, Compass, Flag, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — HITCH SA" },
      {
        name: "description",
        content:
          "HITCH SA is building the digital nervous system for South African mobility — one platform for rides, parcels, freight, flights and school transport.",
      },
      { property: "og:title", content: "About — HITCH SA" },
      {
        property: "og:description",
        content: "Our mission: unify South African mobility on one platform.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const VALUES = [
  {
    icon: Compass,
    title: "One direction",
    copy: "Every product decision serves a single goal — reduce friction between where South Africans are and where they need to be.",
  },
  {
    icon: Flag,
    title: "Built locally",
    copy: "Sandton HQ, engineers in Cape Town and Durban. We ship for load-shedding, taxi ranks and the N3 — not a Silicon Valley abstraction.",
  },
  {
    icon: Users,
    title: "Operators first",
    copy: "Drivers, truckers, pilots and parents are our customers. Every feature is co-designed with the people who use it daily.",
  },
  {
    icon: Rocket,
    title: "Enterprise grade",
    copy: "Bank-level security, sub-second matching, ISO-ready processes. Consumer polish on institutional rails.",
  },
];

const MILESTONES = [
  { year: "2023", label: "Founded in Sandton with the ride + parcel core." },
  { year: "2024", label: "Freight return-load network launched across 4 corridors." },
  { year: "2025", label: "Sky Hitch and School Buddy roll out to 9 provinces." },
  { year: "2026", label: "Expansion into SADC and pan-African corridors." },
];

function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="Moving a country in one direction."
        subtitle="HITCH SA connects every mode of transport on a single, trusted platform — so South Africans, businesses and cargo move with less friction, less waste and more safety."
      />

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-2 text-muted-foreground text-[15px] leading-relaxed">
          <p>
            We started HITCH because South Africa's transport economy is
            fragmented across silos — ride-hailing, courier apps, freight
            brokers, charter agents, school-run WhatsApp groups. Each solves a
            slice; none see the whole.
          </p>
          <p>
            HITCH is the connective tissue. One identity. One wallet. One
            control tower monitoring every trip, parcel, load and seat — from
            first request to proof of delivery.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="glass-card rounded-2xl p-6 ring-1 ring-black/20"
                >
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                    <Icon className="size-5 text-brand-light" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 border-t border-white/5 pt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
            Timeline
          </h2>
          <ol className="relative border-l border-white/10 pl-6 space-y-8">
            {MILESTONES.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-brand-light ring-4 ring-background" />
                <div className="text-brand-light text-xs font-bold uppercase tracking-widest mb-1">
                  {m.year}
                </div>
                <p className="text-foreground/80 text-[15px]">{m.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
