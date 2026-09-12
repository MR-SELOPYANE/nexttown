import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type MarketConfig } from "@/components/site/marketplace-view";

export const Route = createFileRoute("/freight")({
  component: FreightPage,
  head: () => ({
    meta: [
      { title: "Freight return-loads — Next Town" },
      {
        name: "description",
        content:
          "Fill empty return legs. Match cargo with trucks already heading your direction across Southern Africa.",
      },
    ],
  }),
});

const CONFIG: MarketConfig = {
  type: "freight",
  cta: "Book capacity",
  noun: "operator",
  resultsNoun: "operators available",
  fromLabel: "Origin",
  fromPlaceholder: "Durban port",
  toLabel: "Destination",
  toPlaceholder: "Johannesburg",
  filterLabel: "Load type",
  filterOptions: [
    { value: "tautliner", label: "Tautliner" },
    { value: "refrigerated", label: "Refrigerated" },
    { value: "flatbed", label: "Flatbed" },
    { value: "tanker", label: "Tanker" },
    { value: "container", label: "Container" },
  ],
  searchLabel: "Find capacity",
  postCta: "Post a return-load",
  postFromLabel: "Origin",
  postToLabel: "Destination",
  postCapacityLabel: "Trailer & tonnage",
  postPriceLabel: "Load rate (ZAR)",
};

function FreightPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Freight marketplace"
        title="No more empty return legs."
        subtitle="Match your cargo with trucks already routing back — verified operators, live tracking, and end-to-end insurance."
      />
      <MarketplaceView config={CONFIG} />
    </PageShell>
  );
}
