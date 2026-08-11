import { createFileRoute } from "@tanstack/react-router";
import { CommuterView } from "@/components/site/commuter-view";
import { RequireRole } from "@/components/site/require-auth";

export const Route = createFileRoute("/commute")({
  component: CommutePage,
  head: () => ({
    meta: [
      { title: "Commute — HITCH SA" },
      {
        name: "description",
        content: "Recurring commute plans, carpool cost sharing and monthly commuter passes.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CommutePage() {
  return (
    <RequireRole role="traveler">
      <CommuterView />
    </RequireRole>
  );
}
