import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Car, CalendarClock, Zap } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type MarketConfig } from "@/components/site/marketplace-view";
import { RideNowFlow } from "@/components/site/ride-now-flow";
import { RequireAuth } from "@/components/site/require-auth";

export const Route = createFileRoute("/rides")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search.from === "string" ? { from: search.from } : {}),
    ...(typeof search.to === "string" ? { to: search.to } : {}),
  }),
  component: RidesPage,
  head: () => ({
    meta: [
      { title: "Rides — HITCH SA" },
      {
        name: "description",
        content:
          "Ride now with instant driver matching, or find verified rides across South Africa — metro commuting, airport transfers and intercity trips with transparent pricing.",
      },
    ],
  }),
});

const CONFIG: MarketConfig = {
  type: "ride",
  cta: "Book ride",
  noun: "ride",
  resultsNoun: "rides matched",
  fromLabel: "Pickup",
  fromPlaceholder: "Sandton, Johannesburg",
  toLabel: "Drop-off",
  toPlaceholder: "OR Tambo Intl.",
  filterLabel: "When",
  filterOptions: [
    { value: "now", label: "Leave now" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "week", label: "This week" },
  ],
  searchLabel: "Search rides",
  postCta: "Offer a ride",
  postFromLabel: "From",
  postToLabel: "To",
  postCapacityLabel: "Vehicle & seats",
  postPriceLabel: "Rate per seat (ZAR)",
};

type Mode = "now" | "plan";

const MODES: { id: Mode; icon: typeof Zap; label: string; hint: string }[] = [
  { id: "now", icon: Zap, label: "Ride now", hint: "Instant driver matching" },
  { id: "plan", icon: CalendarClock, label: "Plan ahead", hint: "Book a scheduled ride" },
];

function RidesPage() {
  const search = useSearch({ from: "/rides" });
  const [mode, setMode] = useState<Mode>(search.from || search.to ? "plan" : "now");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Rides"
        title="Now or later — ride your way."
        subtitle="Ride now for instant matching with a verified driver, or plan ahead and book a scheduled ride at a fixed rate."
      />
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div
          role="tablist"
          aria-label="Ride timing"
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl glass-card ring-1 ring-black/20 max-w-md mx-auto"
        >
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-brand/15 ring-1 ring-brand/40 text-foreground"
                    : "hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Icon className="size-4 text-brand-light" />
                  {m.label}
                </span>
                <span className="text-[11px] font-normal">{m.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
      {mode === "now" ? (
        <RequireAuth>
          <RideNowFlow />
        </RequireAuth>
      ) : (
        <MarketplaceView config={CONFIG} />
      )}
    </PageShell>
  );
}
