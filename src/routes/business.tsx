import { createFileRoute } from "@tanstack/react-router";
import { OperatorConsole } from "@/components/site/operator-console";
import { OperatorListings } from "@/components/site/operator-listings";
import { routeFare } from "@/lib/route-fare";
import { zar } from "@/lib/demo-store";

export const Route = createFileRoute("/business")({
  component: BusinessConsolePage,
  head: () => ({
    meta: [
      { title: "Business console — Next Town" },
      {
        name: "description",
        content:
          "Go online, accept staff and cargo movement requests, dispatch your fleet and manage volume logistics.",
      },
      { property: "og:title", content: "Business console — Next Town" },
      {
        property: "og:description",
        content: "Bolt-style business console: dispatch, cargo movement, fleet, volume pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const fare = routeFare(11, 900);

function BusinessConsolePage() {
  return (
    <OperatorConsole
      config={{
        eyebrow: "Logistics desk",
        consoleTitle: "Business console",
        consoleSub: "Move staff, cargo and parcels at volume pricing.",
        onlineStatus: "Online · fleet available",
        waitingTitle: "Scanning for consignments…",
        waitingSub: "Volume lanes are active — expect a movement request shortly.",
        offerBadge: "New movement request",
        metricJobLabel: "Jobs",
        phaseToPickup: "Driving to pickup",
        phaseInTransit: "Delivering",
        ctaStart: "Cargo loaded — depart",
        ctaComplete: "Delivered · sign off",
        completeTitle: (p) => `${zar(p)} earned`,
        completeSub: () => "Volume invoice settles monthly · 12% platform fee.",
        requests: [
          {
            client: "Checkers Sixty60",
            rating: 4.9,
            pickup: "Johannesburg",
            dropoff: "Sandton",
            detail: "340 parcels · 2 t",
            note: "Last-mile dispatch · 8 stops",
          },
          {
            client: "Netcare Logistics",
            rating: 4.8,
            pickup: "Pretoria",
            dropoff: "Johannesburg",
            detail: "Cold chain · 1 t",
            note: "Temperature-sensitive · sealed cold chain",
          },
          {
            client: "Steers Group",
            rating: 4.7,
            pickup: "Midrand",
            dropoff: "Polokwane",
            detail: "18 pallets · 9 t",
            note: "Dry goods · dock 2 · returns pick-up",
          },
          {
            client: "Webuycars",
            rating: 5.0,
            pickup: "Durban",
            dropoff: "Pretoria",
            detail: "Vehicle carrier · 3 units",
            note: "Carrier trailer · insured in-transit",
          },
        ],
        initialEarnings: 12600,
        initialJobs: 7,
        weekData: [6900, 8800, 7600, 12600, 9800, 11800, 1600],
        fareFor: fare,
        payoutRatio: 0.88,
        pickupSub: () => "1.8 km from depot",
      }}
      sidebarExtra={
        <OperatorListings
          title="My logistics listings"
          subtitle="Advertise cargo capacity on your fleet."
          markets={["parcel", "freight"]}
          postCta="Post cargo capacity"
          capacityLabel="Vehicle & load"
          priceLabel="Rate (ZAR)"
          tags={["Verified operator", "Fleet capacity"]}
        />
      }
    />
  );
}
