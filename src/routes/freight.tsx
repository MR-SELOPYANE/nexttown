import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type Listing } from "@/components/site/market-flow";

export const Route = createFileRoute("/freight")({
  component: FreightPage,
  head: () => ({
    meta: [
      { title: "Freight return-loads — HITCH SA" },
      {
        name: "description",
        content:
          "Fill empty return legs. Match cargo with trucks already heading your direction across Southern Africa.",
      },
      { property: "og:title", content: "Freight return-loads — HITCH SA" },
      {
        property: "og:description",
        content: "Reduce empty kilometres. Book verified truck return-loads across SA.",
      },
    ],
  }),
});

const LOADS: Listing[] = [
  {
    id: "f1",
    eyebrow: "Return-load",
    title: "Durban → Johannesburg",
    route: "Available 21 Jul · 34-ton capacity",
    price: 12400,
    meta: ["Tautliner", "34 t · 82 m³", "Cross-dock ready"],
    rating: 4.9,
    tags: ["Verified", "Insured"],
  },
  {
    id: "f2",
    eyebrow: "Return-load",
    title: "Cape Town → Port Elizabeth",
    route: "Available 22 Jul · 18-ton capacity",
    price: 8600,
    meta: ["Refrigerated", "18 t · 40 m³", "Temp-controlled"],
    rating: 4.8,
    tags: ["Cold-chain"],
  },
  {
    id: "f3",
    eyebrow: "Return-load",
    title: "Bloemfontein → Kimberley",
    route: "Available today · 8-ton capacity",
    price: 4200,
    meta: ["Flatbed", "8 t · 22 m³", "Same-day"],
    rating: 4.7,
    tags: ["Same-day"],
  },
  {
    id: "f4",
    eyebrow: "Cross-border",
    title: "Johannesburg → Gaborone",
    route: "Available 23 Jul · 26-ton capacity",
    price: 18900,
    meta: ["Tautliner", "26 t · 68 m³", "SAD-500 assist"],
    rating: 4.9,
    tags: ["Cross-border"],
  },
];

function FreightPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Freight marketplace"
        title="No more empty return legs."
        subtitle="Match your cargo with trucks already routing back — verified operators, live tracking, and end-to-end insurance."
      />
      <MarketplaceView
        type="freight"
        listings={LOADS}
        cta="Book capacity"
        resultsNoun="operators available"
        postCta="Post a return-load"
        postCapacityLabel="Trailer & tonnage"
        fields={{
          fromLabel: "Origin",
          fromPlaceholder: "Durban port",
          toLabel: "Destination",
          toPlaceholder: "Johannesburg",
          filterLabel: "Load type",
          filterOptions: [
            { value: "tautliner", label: "Tautliner" },
            { value: "reefer", label: "Refrigerated" },
            { value: "flatbed", label: "Flatbed" },
            { value: "tanker", label: "Tanker" },
            { value: "container", label: "Container" },
          ],
          searchLabel: "Find capacity",
        }}
      />
    </PageShell>
  );
}
