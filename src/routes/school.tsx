import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type MarketConfig } from "@/components/site/marketplace-view";

export const Route = createFileRoute("/school")({
  component: SchoolPage,
  head: () => ({
    meta: [
      { title: "School transport — Next Town" },
      {
        name: "description",
        content:
          "Verified school transport operators with live tracking, parent notifications and SAPS-screened drivers.",
      },
    ],
  }),
});

const CONFIG: MarketConfig = {
  type: "school",
  cta: "Reserve seat",
  noun: "route",
  resultsNoun: "school routes near you",
  fromLabel: "Pickup suburb",
  fromPlaceholder: "Sandringham",
  toLabel: "School",
  toPlaceholder: "St Stithians College",
  filterLabel: "Filter",
  filterOptions: [
    { value: "saps-verified", label: "SAPS-verified" },
    { value: "sport", label: "Extra-mural" },
  ],
  searchLabel: "Find route",
  postCta: "List a school route",
  postFromLabel: "Pickup suburb",
  postToLabel: "School",
  postCapacityLabel: "Vehicle & seats",
  postPriceLabel: "Monthly fee (ZAR)",
};

function SchoolPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="School transport marketplace"
        title="Safer school runs, every single day."
        subtitle="SAPS-screened operators, live GPS tracking, and real-time parent notifications — vetted by Next Town."
      />
      <MarketplaceView config={CONFIG} />
    </PageShell>
  );
}
