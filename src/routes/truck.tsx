import { createFileRoute } from "@tanstack/react-router";
import { OperatorConsole } from "@/components/site/operator-console";
import { OperatorListings } from "@/components/site/operator-listings";
import { routeFare } from "@/lib/route-fare";
import { zar } from "@/lib/demo-store";

export const Route = createFileRoute("/truck")({
  component: TruckConsolePage,
  head: () => ({
    meta: [
      { title: "Trucker console — Next Town" },
      {
        name: "description",
        content:
          "Go online, accept return-load freight requests, haul the route and watch your Next Town earnings build in real time.",
      },
      { property: "og:title", content: "Trucker console — Next Town" },
      {
        property: "og:description",
        content: "Bolt-style trucker console: online toggle, return-load requests, earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const fare = routeFare(14, 650);

function TruckConsolePage() {
  return (
    <OperatorConsole
      config={{
        eyebrow: "Freight network",
        consoleTitle: "Trucker console",
        consoleSub: "Never drive empty — accept return-loads and get paid.",
        onlineStatus: "Online · accepting loads",
        waitingTitle: "Scanning for return-loads…",
        waitingSub: "High tonnage available on this corridor — expect a load shortly.",
        offerBadge: "New return-load request",
        metricJobLabel: "Loads",
        phaseToPickup: "Driving to pickup",
        phaseInTransit: "Hauling freight",
        ctaStart: "Loaded — start haul",
        ctaComplete: "Complete delivery",
        completeTitle: (p) => `${zar(p)} earned`,
        completeSub: () => "Paid out Friday 08:00 after the 12% platform fee.",
        requests: [
          {
            client: "SAB Logistics",
            rating: 4.9,
            pickup: "Johannesburg",
            dropoff: "Durban",
            detail: "22 t palletised",
            note: "Dock 4 · tail lift required · 2 stops",
          },
          {
            client: "Bidfreight",
            rating: 4.8,
            pickup: "Midrand",
            dropoff: "Cape Town",
            detail: "18 t container",
            note: "Full container · sealed · weighbridge pass",
          },
          {
            client: "Unitrans",
            rating: 4.7,
            pickup: "Pretoria",
            dropoff: "Polokwane",
            detail: "14 t steel",
            note: "Tarpaulin available if raining",
          },
          {
            client: "Chep",
            rating: 5.0,
            pickup: "Bloemfontein",
            dropoff: "Port Elizabeth",
            detail: "26 t pallets",
            note: "Pallets on ground · 2 forklifts on site",
          },
        ],
        initialEarnings: 8400,
        initialJobs: 4,
        weekData: [4100, 6200, 5600, 8400, 7100, 9400, 1200],
        fareFor: fare,
        payoutRatio: 0.88,
        pickupSub: () => "2.4 km from yard",
      }}
      sidebarExtra={
        <OperatorListings
          title="My freight listings"
          subtitle="Sell return-load capacity you'll haul later."
          markets={["freight"]}
          postCta="Post a return-load"
          capacityLabel="Load & tonnage"
          priceLabel="Rate (ZAR)"
          tags={["Verified operator", "Return-load"]}
        />
      }
    />
  );
}
