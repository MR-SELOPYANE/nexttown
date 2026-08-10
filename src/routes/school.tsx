import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MarketplaceView, type Listing } from "@/components/site/market-flow";

export const Route = createFileRoute("/school")({
  component: SchoolPage,
  head: () => ({
    meta: [
      { title: "School transport — HITCH SA" },
      {
        name: "description",
        content:
          "Verified school transport operators with live tracking, parent notifications and SAPS-screened drivers.",
      },
      { property: "og:title", content: "School transport — HITCH SA" },
      {
        property: "og:description",
        content: "Vetted operators, live tracking, POPIA-compliant parent updates.",
      },
    ],
  }),
});

const ROUTES: Listing[] = [
  {
    id: "s1",
    eyebrow: "Morning + Afternoon",
    title: "Sandringham → St Stithians",
    route: "Mon–Fri · Seats: 3 open",
    price: 1850,
    meta: ["Vetted operator", "Live GPS", "Parent SMS"],
    rating: 5.0,
    tags: ["SAPS-verified"],
  },
  {
    id: "s2",
    eyebrow: "Morning only",
    title: "Bellville → Rondebosch Boys",
    route: "Mon–Fri · Seats: 2 open",
    price: 1250,
    meta: ["Vetted operator", "Live GPS", "Parent app"],
    rating: 4.9,
    tags: ["Verified"],
  },
  {
    id: "s3",
    eyebrow: "Morning + Afternoon",
    title: "Umhlanga → Durban Girls'",
    route: "Mon–Fri · Seats: 4 open",
    price: 1780,
    meta: ["Vetted operator", "Live GPS", "Parent SMS"],
    rating: 4.8,
    tags: ["SAPS-verified"],
  },
  {
    id: "s4",
    eyebrow: "Extra-mural",
    title: "Pretoria East → Sport Fields",
    route: "Tue/Thu · Seats: 6 open",
    price: 950,
    meta: ["Vetted operator", "Live GPS", "Coach coordinated"],
    rating: 4.9,
    tags: ["Sport"],
  },
];

function SchoolPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="School transport"
        title="Safer school runs, every single day."
        subtitle="SAPS-screened operators, live GPS tracking, and real-time parent notifications — vetted by HITCH."
      />
      <MarketplaceView
        type="school"
        listings={ROUTES}
        cta="Reserve seat"
        resultsNoun="operators near you"
        postCta="List a school route"
        postCapacityLabel="Vehicle & seats"
        fields={{
          fromLabel: "Pickup suburb",
          fromPlaceholder: "Sandringham",
          toLabel: "School",
          toPlaceholder: "St Stithians College",
          filterLabel: "Schedule",
          filterOptions: [
            { value: "both", label: "Morning + afternoon" },
            { value: "am", label: "Morning only" },
            { value: "pm", label: "Afternoon only" },
            { value: "extra", label: "Extra-mural" },
          ],
          searchLabel: "Find route",
        }}
      />
    </PageShell>
  );
}
