import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type MarketConfig } from "@/components/site/marketplace-view";

export const Route = createFileRoute("/parcels")({
  component: ParcelsPage,
  head: () => ({
    meta: [
      { title: "Parcels — Next Town" },
      {
        name: "description",
        content:
          "Send documents and packages with verified couriers riding routes you're already travelling.",
      },
    ],
  }),
});

const CONFIG: MarketConfig = {
  type: "parcel",
  cta: "Send parcel",
  noun: "courier",
  resultsNoun: "couriers on your route",
  fromLabel: "Collect from",
  fromPlaceholder: "Rosebank, JHB",
  toLabel: "Deliver to",
  toPlaceholder: "Menlyn, PTA",
  filterLabel: "Size",
  filterOptions: [
    { value: "doc", label: "Documents" },
    { value: "small", label: "Small · ≤ 5 kg" },
    { value: "medium", label: "Medium · ≤ 20 kg" },
    { value: "large", label: "Large · ≤ 50 kg" },
  ],
  searchLabel: "Find couriers",
  postCta: "Post a delivery",
  postFromLabel: "Pickup",
  postToLabel: "Drop-off",
  postCapacityLabel: "Parcel size",
  postPriceLabel: "Rate (ZAR)",
};

function ParcelsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Parcel marketplace"
        title="Send with drivers already going your way."
        subtitle="Documents, small packages, or bulk boxes — matched with verified drivers travelling your route today."
      />
      <MarketplaceView config={CONFIG} />
    </PageShell>
  );
}
