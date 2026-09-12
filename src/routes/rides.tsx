import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Zap } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
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
      { title: "Rides — Next Town" },
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

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Ride timing"
      className="flex items-center gap-1 p-1 rounded-full bg-foreground/5 ring-1 ring-black/10 w-max"
    >
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function RidesPage() {
  const search = useSearch({ from: "/rides" });
  const [mode, setMode] = useState<Mode>(search.from || search.to ? "plan" : "now");

  return (
    <PageShell>
      {mode === "now" ? (
        <RequireAuth>
          <div className="relative h-[calc(100dvh-4rem)]">
            <RideNowFlow className="h-full" tab={<ModeSwitch mode={mode} onChange={setMode} />} />
          </div>
        </RequireAuth>
      ) : (
        <>
          <section className="relative px-6 pt-10 pb-6 border-b border-white/5 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 18%, transparent) 0%, transparent 70%)",
              }}
            />
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-brand-light text-xs font-bold uppercase tracking-widest mb-1">
                  Plan ahead
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Book a scheduled ride
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-[52ch]">
                  Fixed-rate rides on the community marketplace — pick a listing that suits your
                  route, or offer a ride yourself.
                </p>
              </div>
              <ModeSwitch mode={mode} onChange={setMode} />
            </div>
          </section>
          <MarketplaceView config={CONFIG} />
        </>
      )}
    </PageShell>
  );
}
