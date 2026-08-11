import { createFileRoute } from "@tanstack/react-router";
import { OperatorConsole } from "@/components/site/operator-console";
import { OperatorListings } from "@/components/site/operator-listings";
import { routeFare } from "@/lib/route-fare";
import { zar } from "@/lib/demo-store";

export const Route = createFileRoute("/school-ops")({
  component: SchoolConsolePage,
  head: () => ({
    meta: [
      { title: "School console — HITCH SA" },
      {
        name: "description",
        content:
          "Go online, accept school route requests, move learners with live parent tracking and build term revenue.",
      },
      { property: "og:title", content: "School console — HITCH SA" },
      {
        property: "og:description",
        content: "Bolt-style school transport console: routes, learners, parent tracking, revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const fare = routeFare(8, 180);

function SchoolConsolePage() {
  return (
    <OperatorConsole
      config={{
        eyebrow: "School routes",
        consoleTitle: "School console",
        consoleSub: "Run verified routes with live parent tracking.",
        onlineStatus: "Online · routes running",
        waitingTitle: "Waiting for route requests…",
        waitingSub: "Morning runs fill by 06:00 — afternoon runs peak at 14:00.",
        offerBadge: "New route request",
        metricJobLabel: "Runs",
        phaseToPickup: "Driving to pickup",
        phaseInTransit: "On the run",
        ctaStart: "All learners on board — depart",
        ctaComplete: "Arrived at school",
        completeTitle: (p) => `${zar(p)} earned`,
        completeSub: () => "Parents notified of arrival · term billing.",
        requests: [
          {
            client: "Parktown Boys",
            rating: 4.9,
            pickup: "Soweto",
            dropoff: "Johannesburg",
            detail: "14 learners",
            note: "AM run · 1 escort · learners on gate list",
          },
          {
            client: "St Mary's School",
            rating: 4.8,
            pickup: "Sandton",
            dropoff: "Johannesburg",
            detail: "9 learners",
            note: "PM run · car seats for 2 younger learners",
          },
          {
            client: "Bryanston High",
            rating: 5.0,
            pickup: "Midrand",
            dropoff: "Sandton",
            detail: "12 learners",
            note: "Daily contract · updated guardian list",
          },
          {
            client: "Laerskool Menlopark",
            rating: 4.7,
            pickup: "Pretoria",
            dropoff: "Menlyn",
            detail: "8 learners",
            note: "Sport's day — pickup 13:30",
          },
        ],
        initialEarnings: 3200,
        initialJobs: 5,
        weekData: [2100, 2600, 2500, 3200, 2900, 500, 300],
        fareFor: fare,
        payoutRatio: 0.88,
        pickupSub: () => "3 min away",
      }}
      sidebarExtra={
        <OperatorListings
          title="My route listings"
          subtitle="Publish daily runs parents can book."
          markets={["school"]}
          postCta="List a school route"
          capacityLabel="Learners"
          priceLabel="Term rate (ZAR)"
          tags={["Verified operator", "School run"]}
        />
      }
    />
  );
}
