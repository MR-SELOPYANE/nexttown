import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, CreditCard, ShieldAlert, Trash2, Truck } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { RequireAuth } from "@/components/site/require-auth";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/site/states";
import { useClearNotifications, useMarkAllRead, useNotifications } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import type { NotificationKind } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Next Town" },
      {
        name: "description",
        content:
          "Every Next Town trip milestone, payment receipt and safety alert in one activity feed.",
      },
      { property: "og:title", content: "Notifications — Next Town" },
      {
        property: "og:description",
        content: "Trip, payment and safety alerts across the Next Town mobility marketplace.",
      },
    ],
  }),
  component: NotificationsPage,
});

const ICONS = { trip: Truck, payment: CreditCard, safety: ShieldAlert, system: Bell } as const;

const FILTERS: { key: NotificationKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "trip", label: "Trips" },
  { key: "payment", label: "Payments" },
  { key: "safety", label: "Safety" },
  { key: "system", label: "System" },
];

function dayLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const key = (x: Date) => x.toDateString();
  if (key(d) === key(today)) return "Today";
  if (key(d) === key(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}

function NotificationsInner() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: notes, isLoading, isError, refetch } = useNotifications(userId);
  const markAllRead = useMarkAllRead(userId);
  const clearNotifications = useClearNotifications(userId);

  const [kind, setKind] = useState<NotificationKind | "all">("all");

  const notifications = notes ?? [];
  const filtered = kind === "all" ? notifications : notifications.filter((n) => n.kind === kind);
  const unread = notifications.filter((n) => !n.read).length;

  const groups = filtered.reduce<{ label: string; items: typeof filtered }[]>((acc, n) => {
    const label = dayLabel(n.createdAt);
    const last = acc[acc.length - 1];
    if (last && last.label === label) last.items.push(n);
    else acc.push({ label, items: [n] });
    return acc;
  }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle="Trip milestones, payments and safety escalations as they happen."
      />
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-sm text-muted-foreground">
            {unread} unread of {notifications.length}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllRead.mutate()}
              disabled={unread === 0}
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={() => clearNotifications.mutate()}>
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setKind(f.key)}
              aria-pressed={kind === f.key}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                kind === f.key
                  ? "bg-brand/15 border-brand/40 text-brand-light"
                  : "border-white/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : groups.length === 0 ? (
          <EmptyState
            title="You are all caught up"
            description={
              kind === "all"
                ? "Trip milestones, receipts and safety alerts will appear here."
                : "No notifications in this category yet."
            }
          />
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {g.label}
                </div>
                <div className="space-y-3">
                  {g.items.map((n) => {
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
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
