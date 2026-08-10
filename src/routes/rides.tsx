import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type Listing } from "@/components/site/market-flow";

export const Route = createFileRoute("/rides")({
  component: RidesPage,
  head: () => ({
    meta: [
      { title: "Rides — HITCH SA" },
      {
        name: "description",
        content:
          "Find verified rides across South Africa. Metro commuting, airport transfers and intercity trips with transparent pricing.",
      },
      { property: "og:title", content: "Rides — HITCH SA" },
      {
        property: "og:description",
        content: "Verified drivers, transparent pricing, intelligent matching across SA.",
      },
    ],
  }),
});

const RIDES: Listing[] = [
  {
    id: "r1",
    eyebrow: "Metro",
    title: "Sandton → OR Tambo",
    route: "Departs 06:15 · Mon–Fri",
    price: 189,
    meta: ["Sedan · 3 seats", "35 min", "Fixed fare"],
    rating: 4.9,
    tags: ["Airport", "Corporate"],
  },
  {
    id: "r2",
    eyebrow: "Intercity",
    title: "Cape Town → Stellenbosch",
    route: "Departs 07:00 · Daily",
    price: 145,
    meta: ["SUV · 4 seats", "55 min", "Split fare"],
    rating: 4.8,
    tags: ["Commuter"],
  },
  {
    id: "r3",
    eyebrow: "Metro",
    title: "Umhlanga → Durban CBD",
    route: "Departs 06:45 · Mon–Fri",
    price: 95,
    meta: ["Hatch · 2 seats", "25 min", "Corporate wallet"],
    rating: 5.0,
    tags: ["Verified", "Wallet"],
  },
  {
    id: "r4",
    eyebrow: "Airport",
    title: "Rosebank → Lanseria",
    route: "On-demand · 24/7",
    price: 260,
    meta: ["Sedan · 4 seats", "40 min", "Fixed fare"],
    rating: 4.9,
    tags: ["Airport"],
  },
  {
    id: "r5",
    eyebrow: "Long haul",
    title: "Pretoria → Bloemfontein",
    route: "Departs Fri 15:00",
    price: 520,
    meta: ["SUV · 3 seats", "4h 30m", "Split fare"],
    rating: 4.7,
    tags: ["Weekend"],
  },
  {
    id: "r6",
    eyebrow: "Metro",
    title: "Century City → V&A",
    route: "Departs 07:30 · Mon–Fri",
    price: 78,
    meta: ["Sedan · 3 seats", "20 min", "Corporate wallet"],
    rating: 4.9,
    tags: ["Commuter"],
  },
];

function RidesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Rides marketplace"
        title="Every direction, one app."
        subtitle="Metro commuting, airport transfers and intercity trips — matched in real time with verified, SAPS-screened drivers."
      />
      <MarketplaceView
        type="ride"
        listings={RIDES}
        cta="Book ride"
        resultsNoun="rides matched"
        postCta="Offer a ride"
        postCapacityLabel="Vehicle & seats"
        fields={{
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
          searchLabel: "Search",
        }}
      />
    </PageShell>
  );
}
