import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, CreditCard, ShieldAlert, Trash2, Truck } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { useDemo } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — HITCH SA" },
      {
        name: "description",
        content:
          "Every HITCH SA trip milestone, payment receipt and safety alert in one activity feed.",
      },
      { property: "og:title", content: "Notifications — HITCH SA" },
      {
        property: "og:description",
        content: "Trip, payment and safety alerts across the HITCH SA mobility marketplace.",
      },
    ],
  }),
  component: NotificationsPage,
});

const ICONS = { trip: Truck, payment: CreditCard, safety: ShieldAlert, system: Bell } as const;

function NotificationsPage() {
  const { notifications, markAllRead, clearNotifications } = useDemo();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle="Trip milestones, payments and safety escalations as they happen."
      />
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {unread} unread of {notifications.length}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={markAllRead}>
              <CheckCheck className="size-4" /> Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={clearNotifications}>
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="glass-card rounded-xl p-10 border border-white/10 text-center text-muted-foreground">
              You are all caught up.
            </div>
          )}
          {notifications.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <div
                key={n.id}
                className={`glass-card rounded-xl p-4 border flex gap-4 ${
                  n.read ? "border-white/10" : "border-brand/40"
                }`}
              >
                <div className="size-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString("en-ZA")}
                  </div>
                </div>
                {!n.read && <span className="size-2 rounded-full bg-brand mt-2" />}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
