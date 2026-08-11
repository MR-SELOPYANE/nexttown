import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type MarketConfig } from "@/components/site/marketplace-view";

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
    ],
  }),
});

const CONFIG: MarketConfig = {
  type: "flight",
  cta: "Reserve seat",
  noun: "seat",
  resultsNoun: "flights with capacity",
  fromLabel: "From airport",
  fromPlaceholder: "JNB",
  toLabel: "To airport",
  toPlaceholder: "CPT",
  filterLabel: "Class",
  filterOptions: [
    { value: "scheduled", label: "Scheduled" },
    { value: "charter", label: "Charter empty-leg" },
    { value: "business jet", label: "Business jet" },
  ],
  searchLabel: "Find seats",
  postCta: "List empty capacity",
  postFromLabel: "Departure",
  postToLabel: "Arrival",
  postCapacityLabel: "Aircraft & seats",
  postPriceLabel: "Rate per seat (ZAR)",
};

function FlightsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Airline & charter marketplace"
        title="Fill the seats that would fly empty."
        subtitle="Last-minute airline and charter capacity across the country — verified operators, transparent pricing."
      />
      <MarketplaceView config={CONFIG} />
    </PageShell>
  );
}
