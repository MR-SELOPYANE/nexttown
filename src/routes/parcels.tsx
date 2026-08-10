import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type Listing } from "@/components/site/market-flow";

export const Route = createFileRoute("/parcels")({
  component: ParcelsPage,
  head: () => ({
    meta: [
      { title: "Parcels — HITCH SA" },
      {
        name: "description",
        content:
          "Send documents and packages with verified couriers riding routes you're already travelling.",
      },
      { property: "og:title", content: "Parcels — HITCH SA" },
      {
        property: "og:description",
        content: "Peer-to-peer parcel delivery across SA with verified drivers.",
      },
    ],
  }),
});

const PARCELS: Listing[] = [
  {
    id: "p1",
    eyebrow: "Same-day",
    title: "Johannesburg → Pretoria",
    route: "Driver leaving 09:30",
    price: 65,
    meta: ["Up to 5 kg", "Signature on delivery", "Live GPS"],
    rating: 4.9,
    tags: ["Insured", "Same-day"],
  },
  {
    id: "p2",
    eyebrow: "Overnight",
    title: "Cape Town → George",
    route: "Departs 18:00 today",
    price: 180,
    meta: ["Up to 20 kg", "Photo proof", "Insured to R5k"],
    rating: 4.8,
    tags: ["Overnight"],
  },
  {
    id: "p3",
    eyebrow: "Express",
    title: "Sandton → Rosebank",
    route: "Pickup in 15 min",
    price: 45,
    meta: ["Docs · < 2 kg", "45 min ETA", "Live GPS"],
    rating: 5.0,
    tags: ["Express", "Docs"],
  },
  {
    id: "p4",
    eyebrow: "Same-day",
    title: "Durban → Pietermaritzburg",
    route: "Driver leaving 11:00",
    price: 95,
    meta: ["Up to 10 kg", "Signature on delivery", "Insured"],
    rating: 4.7,
    tags: ["Same-day"],
  },
];

function ParcelsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Parcel marketplace"
        title="Send with drivers already going your way."
        subtitle="Documents, small packages, or bulk boxes — matched with verified drivers travelling your route today."
      />
      <MarketplaceView
        type="parcel"
        listings={PARCELS}
        cta="Send parcel"
        resultsNoun="couriers on your route"
        postCta="Post a delivery"
        postCapacityLabel="Parcel size"
        fields={{
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
        }}
      />
    </PageShell>
  );
}
