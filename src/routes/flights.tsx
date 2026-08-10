import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type Listing } from "@/components/site/market-flow";

export const Route = createFileRoute("/flights")({
  component: FlightsPage,
  head: () => ({
    meta: [
      { title: "Empty seats — HITCH SA" },
      {
        name: "description",
        content:
          "Book empty seats on scheduled and charter flights across South Africa at last-minute fares.",
      },
      { property: "og:title", content: "Empty seats — HITCH SA" },
      {
        property: "og:description",
        content: "Charter and airline empty-leg seats across SA.",
      },
    ],
  }),
});

const SEATS: Listing[] = [
  {
    id: "fl1",
    eyebrow: "Empty leg",
    title: "JNB → CPT",
    route: "Charter · King Air 350 · 21 Jul 14:20",
    price: 2950,
    meta: ["4 seats left", "2h 10m", "Lanseria"],
    rating: 4.9,
    tags: ["Charter", "Empty-leg"],
  },
  {
    id: "fl2",
    eyebrow: "Scheduled",
    title: "CPT → DUR",
    route: "Regional · Embraer E190 · 22 Jul 08:15",
    price: 1480,
    meta: ["11 seats left", "2h 05m", "Direct"],
    rating: 4.7,
    tags: ["Scheduled"],
  },
  {
    id: "fl3",
    eyebrow: "Empty leg",
    title: "JNB → George",
    route: "Charter · Pilatus PC-12 · 23 Jul 09:00",
    price: 4200,
    meta: ["6 seats left", "2h 25m", "Lanseria"],
    rating: 5.0,
    tags: ["Charter"],
  },
  {
    id: "fl4",
    eyebrow: "Empty leg",
    title: "DUR → JNB",
    route: "Charter · Citation CJ2 · 24 Jul 17:40",
    price: 3100,
    meta: ["3 seats left", "1h 05m", "King Shaka"],
    rating: 4.9,
    tags: ["Business jet"],
  },
];

function FlightsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Airline & charter"
        title="Fill the seats that would fly empty."
        subtitle="Last-minute airline and charter capacity across the country — verified operators, transparent pricing."
      />
      <MarketplaceView
        type="flight"
        listings={SEATS}
        cta="Reserve seat"
        resultsNoun="flights with capacity"
        postCta="List empty capacity"
        postCapacityLabel="Aircraft & seats"
        fields={{
          fromLabel: "From",
          fromPlaceholder: "Johannesburg (JNB)",
          toLabel: "To",
          toPlaceholder: "Cape Town (CPT)",
          filterLabel: "Class",
          filterOptions: [
            { value: "any", label: "Any" },
            { value: "scheduled", label: "Scheduled" },
            { value: "charter", label: "Charter empty-leg" },
            { value: "business", label: "Business jet" },
          ],
          searchLabel: "Find seats",
        }}
      />
    </PageShell>
  );
}
