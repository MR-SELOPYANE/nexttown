import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  Car,
  CheckCircle2,
  IdCard,
  LifeBuoy,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { RequireRole } from "@/components/site/require-auth";
import { KycStatusPill, StatCard, StatusPill } from "@/components/site/status";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/site/states";
import { PricingAdminPanel } from "@/components/site/pricing-admin-panel";
import { PickupZonesAdminPanel } from "@/components/site/pickup-zones-admin-panel";
import {
  useAdminUsers,
  useAllTickets,
  useApproveDriver,
  useApproveVehicle,
  useResolveTicket,
  useSetUserStatus,
} from "@/lib/hooks/queries";
import { ROLE_LABELS } from "@/lib/domain/roles";
import type { SessionUser, SupportTicket } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin console — Next Town" },
      {
        name: "description",
        content: "Platform administration: members, driver & vehicle approvals, and support.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Tab = "users" | "verification" | "tickets" | "pricing" | "pickup-zones";

function AdminPage() {
  return (
    <RequireRole role="admin">
      <AdminInner />
    </RequireRole>
  );
}

function AdminInner() {
  const {
    data: users = [],
    isLoading: loadingUsers,
    isError: usersError,
    refetch: refetchUsers,
  } = useAdminUsers();
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    isError: ticketsError,
    refetch: refetchTickets,
  } = useAllTickets();
  const resolve = useResolveTicket();

  const [tab, setTab] = useState<Tab>("users");

  const verified = users.filter(
    (u) =>
      u.kyc.identityStatus === "verified" &&
      u.kyc.faceStatus === "verified" &&
      u.kyc.phoneStatus === "verified",
  ).length;
  const pendingDocs = users.filter(
    (u) => u.kyc.driverStatus === "pending" || u.kyc.vehicleStatus === "pending",
  ).length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const open = tickets.filter((t) => t.status === "open").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  const emailFor = (id?: string): string => users.find((u) => u.id === id)?.email ?? "—";

  return (
    <PageShell showCompliance={false}>
      <PageHeader
        eyebrow="Platform"
        title="Admin console"
        subtitle="Members, driver & vehicle approvals and the support inbox — one view over the marketplace."
      />

      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Registered members" value={String(users.length)} />
          <StatCard icon={ShieldCheck} label="Fully verified" value={String(verified)} accent />
          <StatCard icon={IdCard} label="Pending approvals" value={String(pendingDocs)} />
          <StatCard icon={LifeBuoy} label="Open tickets" value={String(open)} />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["users", "Members"],
              ["verification", `Approvals${pendingDocs ? ` · ${pendingDocs}` : ""}`],
              ["tickets", `Support inbox${open ? ` · ${open}` : ""}`],
              ["pricing", "Pricing"],
              ["pickup-zones", "Pickup zones"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-full border transition-colors",
                tab === key
                  ? "bg-brand/15 border-brand/40 text-brand-light"
                  : "border-white/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <div className="space-y-3">
            {loadingUsers ? (
              <ListSkeleton />
            ) : usersError ? (
              <ErrorState onRetry={refetchUsers} />
            ) : users.length === 0 ? (
              <EmptyState title="No members yet" description="Accounts will appear here." />
            ) : (
              users.map((u) => <MemberRow key={u.id} user={u} />)
            )}
          </div>
        )}

        {tab === "verification" && (
          <div className="space-y-3">
            {loadingUsers ? (
              <ListSkeleton />
            ) : usersError ? (
              <ErrorState onRetry={refetchUsers} />
            ) : users.length === 0 ? (
              <EmptyState title="No members yet" description="Accounts will appear here." />
            ) : (
              users
                .filter((u) => u.role !== "traveler")
                .map((u) => <ApprovalRow key={u.id} user={u} />)
            )}
          </div>
        )}

        {tab === "tickets" && (
          <div className="space-y-3">
            {loadingTickets ? (
              <ListSkeleton />
            ) : ticketsError ? (
              <ErrorState onRetry={refetchTickets} />
            ) : tickets.length === 0 ? (
              <EmptyState
                title="Support inbox is empty"
                description="Tickets submitted from the help pages will land here."
              />
            ) : (
              tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  email={emailFor(t.userId)}
                  onResolve={resolve.mutate}
                />
              ))
            )}
          </div>
        )}

        {tab === "pricing" && <PricingAdminPanel />}

        {tab === "pickup-zones" && <PickupZonesAdminPanel />}

        {suspended > 0 && (
          <p className="text-xs text-muted-foreground">
            {suspended} suspended account{suspended > 1 ? "s" : ""} — reactivate from the Members
            tab.
          </p>
        )}
      </section>
    </PageShell>
  );
}

function MemberRow({ user }: { user: SessionUser }) {
  const setStatus = useSetUserStatus(user.id);
  const suspended = user.status === "suspended";
  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4">
      <div className="size-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light font-semibold">
        {user.firstName.charAt(0)}
        {user.lastName.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full border border-white/10">
            {ROLE_LABELS[user.role]}
          </span>
          {suspended && <StatusPill status="suspended" tone="danger" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user.email} · {user.phone}
        </p>
      </div>
      <KycStatusPill
        status={
          user.kyc.identityStatus === "verified" &&
          user.kyc.faceStatus === "verified" &&
          user.kyc.phoneStatus === "verified"
            ? "verified"
            : "pending"
        }
      />
      <Button
        size="sm"
        variant={suspended ? "outline" : "destructive"}
        disabled={setStatus.isPending}
        onClick={() => {
          setStatus.mutate(suspended ? "active" : "suspended");
          toast.success(
            suspended ? `${user.firstName} reactivated` : `${user.firstName} suspended`,
          );
        }}
      >
        {suspended ? <UserCheck className="size-4" /> : <Ban className="size-4" />}
        {suspended ? "Reactivate" : "Suspend"}
      </Button>
    </div>
  );
}

function ApprovalRow({ user }: { user: SessionUser }) {
  const approveDriver = useApproveDriver(user.id);
  const approveVehicle = useApproveVehicle(user.id);
  const driverNeeds = user.kyc.driverStatus === "pending" || user.kyc.driverStatus === "unverified";
  const vehicleNeeds =
    user.kyc.vehicleStatus === "pending" || user.kyc.vehicleStatus === "unverified";
  if (!driverNeeds && !vehicleNeeds) return null;

  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">
              {user.firstName} {user.lastName}
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full border border-white/10">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <IdCard className="size-3.5 text-brand-light" /> Driver:{" "}
              <KycStatusPill status={user.kyc.driverStatus} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Car className="size-3.5 text-brand-light" /> Vehicle:{" "}
              <KycStatusPill status={user.kyc.vehicleStatus} />
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {driverNeeds && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={approveDriver.isPending}
                onClick={() => {
                  approveDriver.mutate("approved");
                  toast.success(`Driver licence approved for ${user.firstName}`);
                }}
              >
                <CheckCircle2 className="size-4" /> Approve licence
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={approveDriver.isPending}
                onClick={() => {
                  approveDriver.mutate("rejected");
                  toast.error(`Driver licence rejected for ${user.firstName}`);
                }}
              >
                <XCircle className="size-4" /> Reject
              </Button>
            </>
          )}
          {vehicleNeeds && (
            <>
              <Button
                size="sm"
                className="bg-brand hover:bg-brand-light text-white"
                disabled={approveVehicle.isPending}
                onClick={() => {
                  approveVehicle.mutate("approved");
                  toast.success(`Vehicle approved for ${user.firstName}`);
                }}
              >
                <CheckCircle2 className="size-4" /> Approve vehicle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={approveVehicle.isPending}
                onClick={() => {
                  approveVehicle.mutate("rejected");
                  toast.error(`Vehicle rejected for ${user.firstName}`);
                }}
              >
                <XCircle className="size-4" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketRow({
  ticket,
  email,
  onResolve,
}: {
  ticket: SupportTicket;
  email: string;
  onResolve: (id: string) => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">{ticket.subject}</h3>
            <StatusPill
              status={ticket.status}
              tone={ticket.status === "open" ? "warning" : "success"}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {ticket.topic} · {email}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleString("en-ZA")}
        </span>
        {ticket.status === "open" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onResolve(ticket.id);
              toast.success("Ticket marked as resolved");
            }}
          >
            <CheckCircle2 className="size-4" /> Resolve
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-3">{ticket.message}</p>
    </div>
  );
}
