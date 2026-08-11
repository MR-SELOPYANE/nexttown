import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarRange,
  Clock,
  Repeat,
  Star,
  Trash2,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StatCard } from "@/components/site/status";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/site/states";
import { MarketField, MarketInput, MarketSelect } from "@/components/site/market-ui";
import {
  useCommutePlans,
  useCreateCommutePlan,
  useFavourites,
  useRemoveCommutePlan,
  useSubscribeCommute,
  useUnsubscribeCommute,
  useWallet,
} from "@/lib/hooks/queries";
import { COMMUTE_DAYS_LABEL } from "@/lib/services/commute-service";
import { useAuth } from "@/lib/store/auth-context";
import { zar } from "@/lib/format";
import type { CommuteDays, FavouriteDestination } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommuterView() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
  } = useCommutePlans(userId);
  const { data: wallet } = useWallet(userId);
  const { data: favourites = [] } = useFavourites(userId);
  const create = useCreateCommutePlan(userId);
  const remove = useRemoveCommutePlan(userId);
  const subscribe = useSubscribeCommute(userId);
  const unsubscribe = useUnsubscribeCommute(userId);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("07:30");
  const [days, setDays] = useState<CommuteDays>("weekdays");
  const [weeklyCost, setWeeklyCost] = useState(150);
  const [partners, setPartners] = useState(1);

  const subscribed = plans.filter((p) => p.subscribed);
  const share = (p: { weeklyCost: number; partners: number }) =>
    Math.round(p.weeklyCost / Math.max(1, p.partners));
  const totalShare = plans.reduce((s, p) => s + share(p), 0);
  const balance = wallet?.balance ?? 0;

  const applyFavourite = (f: FavouriteDestination) => {
    setFrom(f.from);
    setTo(f.to);
    toast.success(`Route "${f.label}" loaded`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) {
      toast.error("Tell us where you commute from and to.");
      return;
    }
    create.mutate(
      { from: from.trim(), to: to.trim(), time, days, weeklyCost: Math.max(1, weeklyCost), partners: Math.max(1, partners) },
      {
        onSuccess: () => {
          toast.success("Commute plan saved");
          setFrom("");
          setTo("");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <PageShell showCompliance={false}>
      <PageHeader
        eyebrow="Commuter"
        title="Daily commuting, on a schedule"
        subtitle="Plan recurring trips, split the cost with carpool partners and let a monthly pass take care of the rest."
      />

      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Repeat} label="Plans" value={String(plans.length)} />
          <StatCard icon={Zap} label="Active passes" value={String(subscribed.length)} accent />
          <StatCard icon={Users} label="Your weekly share" value={zar(totalShare)} />
          <StatCard icon={Wallet} label="Wallet balance" value={zar(balance)} />
        </div>

        {favourites.length > 0 && (
          <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="size-4 text-brand-light" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Start from a favourite
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {favourites.map((f) => (
                <button
                  key={f.id}
                  onClick={() => applyFavourite(f)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:border-brand/40 hover:text-foreground transition-colors"
                >
                  <Star className="size-3.5 text-brand-light" />
                  {f.from} → {f.to}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={submit}
          className="glass-card rounded-2xl p-5 md:p-6 ring-1 ring-black/20"
        >
          <h2 className="text-sm font-semibold mb-4">New commute plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MarketField label="From">
              <MarketInput
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. Mamelodi"
              />
            </MarketField>
            <MarketField label="To">
              <MarketInput
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="e.g. Sandton CBD"
              />
            </MarketField>
            <MarketField label="Departure time">
              <MarketInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </MarketField>
            <MarketField label="Days">
              <MarketSelect value={days} onChange={(e) => setDays(e.target.value as CommuteDays)}>
                {Object.entries(COMMUTE_DAYS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </MarketSelect>
            </MarketField>
            <MarketField label="Full fare per week (ZAR)">
              <MarketInput
                type="number"
                min={1}
                value={weeklyCost}
                onChange={(e) => setWeeklyCost(Number(e.target.value))}
              />
            </MarketField>
            <MarketField label="Carpool partners (cost split)">
              <MarketInput
                type="number"
                min={1}
                max={6}
                value={partners}
                onChange={(e) => setPartners(Number(e.target.value))}
              />
            </MarketField>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <p className="text-xs text-muted-foreground">
              Your weekly share:{" "}
              <span className="font-semibold text-brand-light tabular-nums">
                {zar(Math.round(weeklyCost / Math.max(1, partners)))}
              </span>
              {partners > 1 && (
                <span className="text-muted-foreground/70"> split across {partners} people</span>
              )}
            </p>
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-light text-white"
              disabled={create.isPending}
            >
              {create.isPending ? "Saving…" : "Save plan"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Your plans</h2>
          {isLoading ? (
            <ListSkeleton />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : plans.length === 0 ? (
            <EmptyState
              title="No commute plans yet"
              description="Save your regular route above and we'll handle the rest."
            />
          ) : (
            plans.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "glass-card rounded-2xl p-5 ring-1 ring-black/20",
                  p.subscribed && "ring-brand/40",
                )}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
                    <Repeat className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">
                        {p.from} → {p.to}
                      </h3>
                      {p.subscribed && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-light px-2 py-0.5 rounded-full border border-brand/30 bg-brand/10">
                          Monthly pass
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-brand-light" /> {p.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="size-3.5 text-brand-light" />{" "}
                        {COMMUTE_DAYS_LABEL[p.days]}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-brand-light" /> {p.partners} people
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {zar(share(p))}
                      <span className="text-xs text-muted-foreground font-normal"> /wk your share</span>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {zar(p.weeklyCost)} full fare
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {p.subscribed ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={unsubscribe.isPending}
                        onClick={() => {
                          unsubscribe.mutate(p.id);
                          toast.success("Pass cancelled");
                        }}
                      >
                        Cancel pass
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-brand hover:bg-brand-light text-white"
                        disabled={subscribe.isPending}
                        onClick={() => {
                          const monthly = Math.round(p.weeklyCost * 4.3);
                          if (balance < monthly) {
                            toast.error(
                              `Wallet needs ${zar(monthly)} for the monthly pass — top up first.`,
                            );
                            return;
                          }
                          subscribe.mutate(p.id, {
                            onSuccess: () => toast.success(`Monthly pass charged ${zar(monthly)}`),
                            onError: (err) => toast.error(err.message),
                          });
                        }}
                      >
                        Subscribe {zar(Math.round(p.weeklyCost * 4.3))}/mo
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete plan"
                      onClick={() => {
                        remove.mutate(p.id);
                        toast.success("Plan removed");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="glass-card rounded-2xl p-5 ring-1 ring-black/20 max-w-3xl text-xs text-muted-foreground space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How the pass works
          </h3>
          <p>
            Subscribing charges one month of your route to the HITCH wallet (weekly fare × 4.3) as a
            single payment. The pass covers every booked leg on that route for the month — no more
            paying per trip.
          </p>
          <p>
            Cost sharing is simple: set your carpool partners and the full fare is split across the
            group, so your weekly share drops the more people ride along.
          </p>
        </aside>
      </section>
    </PageShell>
  );
}
