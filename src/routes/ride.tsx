import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { RideNowFlow } from "@/components/site/ride-now-flow";
import { RequireAuth } from "@/components/site/require-auth";

export const Route = createFileRoute("/ride")({
  component: RideNowPage,
  head: () => ({
    meta: [
      { title: "Request a ride — HITCH SA" },
      {
        name: "description",
        content:
          "Set pickup and drop-off, pick a ride class and get matched with a verified HITCH SA driver in seconds.",
      },
      { property: "og:title", content: "Request a ride — HITCH SA" },
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
      <PageShell showCompliance={false}>
        <RideNowFlow />
      </PageShell>
    </RequireAuth>
  );
}
