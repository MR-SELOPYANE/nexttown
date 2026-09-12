import { createFileRoute } from "@tanstack/react-router";
import { OperatorConsole } from "@/components/site/operator-console";
import { OperatorListings } from "@/components/site/operator-listings";
import { routeFare } from "@/lib/route-fare";
import { zar } from "@/lib/demo-store";

export const Route = createFileRoute("/airline")({
  component: AirlineConsolePage,
  head: () => ({
    meta: [
      { title: "Airline console — Next Town" },
      {
        name: "description",
        content:
          "Go online, accept seat reservation requests on scheduled legs, manage boarding and watch your Next Town revenue build.",
      },
      { property: "og:title", content: "Airline console — Next Town" },
      {
        property: "og:description",
        content: "Bolt-style airline console: online toggle, seat requests, boarding, revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const fare = routeFare(240, 900);

function AirlineConsolePage() {
  return (
    <OperatorConsole
      config={{
        eyebrow: "Seat marketplace",
        consoleTitle: "Airline console",
        consoleSub: "Sell seats that would otherwise fly empty.",
        onlineStatus: "Online · seats on sale",
        waitingTitle: "Watching for seat requests…",
        waitingSub: "Your scheduled legs are live — demand peaks near 07:00 and 17:00.",
        offerBadge: "New seat request",
        metricJobLabel: "Legs",
        phaseToPickup: "Boarding",
        phaseInTransit: "En route",
        ctaStart: "Doors closed — depart",
        ctaComplete: "Arrived · confirm",
        completeTitle: (p) => `${zar(p)} earned`,
        completeSub: () => "Settles into wallet after the 12% platform fee.",
        requests: [
          {
            client: "Aviatech",
            rating: 4.9,
            pickup: "OR Tambo",
            dropoff: "Cape Town",
            detail: "2 seats · business",
            note: "Charter seat block · lounge access included",
          },
          {
            client: "SkyWings Travel",
            rating: 4.8,
            pickup: "Lanseria",
            dropoff: "Cape Town",
            detail: "1 seat · economy",
            note: "Same-day connection · priority check-in",
          },
          {
            client: "FlyAfrica",
            rating: 4.7,
            pickup: "King Shaka",
            dropoff: "OR Tambo",
            detail: "3 seats · flex",
            note: "Crew repositioning · needs seat row together",
          },
          {
            client: "Mango Charter",
            rating: 5.0,
            pickup: "OR Tambo",
            dropoff: "Cape Town",
            detail: "4 seats · first",
            note: "VIP group · ground transport on arrival",
          },
        ],
        initialEarnings: 48600,
        initialJobs: 6,
        weekData: [31000, 48600, 42000, 57000, 51000, 68000, 9000],
        fareFor: fare,
        payoutRatio: 0.88,
        pickupSub: () => "Gate confirmed",
      }}
      sidebarExtra={
        <OperatorListings
          title="My seat listings"
          subtitle="Sell empty seats on scheduled legs."
          markets={["flight"]}
          postCta="List empty capacity"
          capacityLabel="Seats & class"
          priceLabel="Rate per seat (ZAR)"
          tags={["Verified operator", "Empty seats"]}
        />
      }
    />
  );
}
