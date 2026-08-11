import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Car, MapPin, Package, ShieldCheck, Star, Truck, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { RequireAuth } from "@/components/site/require-auth";
import { BookingStatusPill, StatCard } from "@/components/site/status";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/site/states";
import {
  useAdvanceBooking,
  useBookings,
  useCancelBooking,
  useFavourites,
  useRemoveFavourite,
  useWallet,
} from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { ROLE_HOME } from "@/lib/domain/roles";
import { zar } from "@/lib/format";
import type { Booking, MarketType } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — HITCH SA" },
      {
        name: "description",
        content: "Your personal travel hub: bookings, wallet and verification across HITCH SA.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ICONS: Record<MarketType, typeof Car> = {
  ride: Car,
  parcel: Package,
  freight: Truck,
  flight: Car,
  school: Car,
};

function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bookings, isLoading, isError, refetch } = useBookings(user?.id ?? "");
  const { data: wallet } = useWallet(user?.id ?? "");
  const { data: favourites = [] } = useFavourites(user?.id ?? "");
  const removeFavourite = useRemoveFavourite(user?.id ?? "");
  const advance = useAdvanceBooking(user?.id ?? "");
  const cancel = useCancelBooking(user?.id ?? "");

  // This dashboard is reserved for travelers. Operators land on their own console.
  useEffect(() => {
    if (user && user.role !== "traveler") navigate({ to: ROLE_HOME[user.role] });
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== "traveler") return <Navigate to={ROLE_HOME[user.role]} />;

  const active = bookings?.filter((b) => !["completed", "cancelled"].includes(b.status)) ?? [];
  const spent =
    bookings?.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.price, 0) ?? 0;
  const rated = bookings?.filter((b) => b.rating) ?? [];
  const avgRating = rated.length
    ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1)
    : "—";

  return (
    <PageShell showCompliance={false}>
      <PageHeader
        eyebrow={`Traveler · ${user.firstName} ${user.lastName}`}
        title="Your travel hub"
        subtitle="Bookings, wallet and verification — everything for your next trip in one place."
      />

      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Car} label="Active trips" value={String(active.length)} />
          <StatCard icon={Wallet} label="Lifetime spend" value={zar(spent)} accent />
          <StatCard
            icon={ShieldCheck}
            label="Wallet balance"
            value={zar(wallet?.balance ?? 0)}
            sub="escrow-ready"
          />
          <StatCard icon={Star} label="Average rating" value={avgRating} />
        </div>

        {favourites.length > 0 && (
          <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="size-4 text-brand-light" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Favourite routes
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {favourites.map((f) => (
                <div
                  key={f.id}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-1.5 py-1 text-sm hover:border-brand/40 transition-colors"
                >
                  <Link
                    to="/rides"
                    search={{ from: f.from, to: f.to }}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <MapPin className="size-3.5 text-brand-light" />
                    {f.from} → {f.to}
                  </Link>
                  <button
                    aria-label={`Remove ${f.from} → ${f.to}`}
                    onClick={() => {
                      removeFavourite.mutate(f.id);
                      toast.success("Favourite removed");
                    }}
                    className="size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              aria-pressed
              className="text-sm font-medium px-4 py-2 rounded-full border bg-brand/15 border-brand/40 text-brand-light"
            >
              My bookings
            </button>
          </div>
          <Link
            to="/rides"
            className="ml-auto inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white text-sm font-medium py-2 px-4 rounded-lg ring-1 ring-brand/50 transition-colors"
          >
            Book a ride <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <ListSkeleton />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !bookings || bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Your trips, parcels and deliveries will appear here once you book."
              action={
                <Button asChild className="bg-brand hover:bg-brand-light text-white">
                  <Link to="/rides">Book a ride</Link>
                </Button>
              }
            />
          ) : (
            bookings.map((b) => (
              <BookingRow key={b.id} booking={b} onAdvance={advance.mutate} onCancel={cancel.mutate} />
            ))
          )}
        </div>

        <aside className="glass-card rounded-2xl p-5 ring-1 ring-black/20 max-w-3xl">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Trust & safety
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  user.kyc.identityStatus === "verified" ? "bg-brand" : "bg-amber-400",
                )}
              />
              Identity {user.kyc.identityStatus}
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  user.kyc.faceStatus === "verified" ? "bg-brand" : "bg-amber-400",
                )}
              />
              Face verification {user.kyc.faceStatus}
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  user.kyc.phoneStatus === "verified" ? "bg-brand" : "bg-amber-400",
                )}
              />
              Phone {user.kyc.phoneStatus}
            </li>
          </ul>
          {user.kyc.identityStatus !== "verified" && (
            <Link
              to="/verify"
              className="mt-4 inline-block text-xs font-semibold text-brand-light underline"
            >
              Complete verification →
            </Link>
          )}
        </aside>
      </section>
    </PageShell>
  );
}

function BookingRow({
  booking,
  onAdvance,
  onCancel,
}: {
  booking: Booking;
  onAdvance: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const Icon = ICONS[booking.type];
  const actionable = booking.status === "confirmed" || booking.status === "in_transit";
  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4">
      <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold truncate">{booking.title}</h3>
          <BookingStatusPill status={booking.status} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {booking.payment}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {booking.ref} · {booking.route}
        </p>
      </div>
      <div className="text-sm font-semibold tabular-nums">{zar(booking.price)}</div>
      <div className="flex gap-2">
        {actionable && (
          <Button
            size="sm"
            className="bg-brand hover:bg-brand-light text-white"
            onClick={() => onAdvance(booking.id)}
            disabled={booking.status === "in_transit"}
          >
            {booking.status === "confirmed" ? "Start trip" : "Complete"}
          </Button>
        )}
        {(booking.status === "requested" || booking.status === "confirmed") && (
          <Button size="sm" variant="outline" onClick={() => onCancel(booking.id)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
