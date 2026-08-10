import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () => ({
    meta: [
      { title: "Careers — HITCH SA" },
      {
        name: "description",
        content:
          "Join HITCH SA. Open engineering, design, operations and driver-experience roles in Sandton, Cape Town and Durban.",
      },
      { property: "og:title", content: "Careers — HITCH SA" },
      { property: "og:description", content: "Help us move a country in one direction." },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
});

const ROLES = [
  { team: "Engineering", title: "Senior Backend Engineer (Go / Postgres)", location: "Sandton" },
  { team: "Engineering", title: "Realtime Systems Engineer", location: "Remote — SA" },
  { team: "Engineering", title: "Mobile Engineer (React Native)", location: "Cape Town" },
  { team: "Design", title: "Product Designer — Freight", location: "Sandton" },
  { team: "Operations", title: "Regional Ops Manager — KZN", location: "Durban" },
  { team: "Operations", title: "Driver Experience Lead", location: "Sandton" },
  { team: "Trust & Safety", title: "Fraud Analyst", location: "Remote — SA" },
  { team: "Sales", title: "Enterprise Account Executive", location: "Sandton" },
];

const PERKS = [
  "Equity in a category-defining SA business",
  "Medical aid + mental-health cover",
  "Remote-first, quarterly team weeks in Sandton",
  "Annual learning budget of R25 000",
  "MacBook Pro + generous home-office setup",
  "Parental leave — 20 weeks primary / 8 weeks secondary",
];

function CareersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Careers"
        title="Help us move a country in one direction."
        subtitle="We're a small team building enterprise-grade mobility infrastructure for South Africa. If that sounds like your kind of ambition — read on."
      />

      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Open roles
          </h2>
          <div className="glass-card rounded-2xl ring-1 ring-black/20 divide-y divide-white/5 overflow-hidden">
            {ROLES.map((r) => (
              <a
                key={r.title}
                href="mailto:careers@hitch.sa"
                className="flex items-center gap-6 px-6 py-5 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest w-32 shrink-0">
                  {r.team}
                </div>
                <div className="flex-1 text-foreground font-medium">{r.title}</div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {r.location}
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-light group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Life at HITCH
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERKS.map((p) => (
              <li
                key={p}
                className="glass-card rounded-xl px-5 py-4 ring-1 ring-black/20 text-sm text-foreground/80"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
