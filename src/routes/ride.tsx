import { createFileRoute } from "@tanstack/react-router";
import { RideNowFlow } from "@/components/site/ride-now-flow";
import { RequireAuth } from "@/components/site/require-auth";

export const Route = createFileRoute("/ride")({
  component: RideNowPage,
  head: () => ({
    meta: [
      { title: "Request a ride — Next Town" },
      {
        name: "description",
        content:
          "Set pickup and drop-off, pick a ride class and get matched with a verified Next Town driver in seconds.",
      },
      { property: "og:title", content: "Request a ride — Next Town" },
      {
        property: "og:description",
        content: "Tap-to-ride matching with upfront ZAR fares across South Africa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function RideNowPage() {
  return (
    <RequireAuth>
      <RideNowFlow />
    </RequireAuth>
  );
}
