import { useState } from "react";
import { CalendarClock, Loader2, Pause, Play, Plus, Route as RouteIcon, Trash2 } from "lucide-react";
import { useCreateListing, useMyListings, useRemoveListing, useToggleListing } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { useDemo, zar } from "@/lib/demo-store";
import type { MarketType } from "@/lib/domain/types";

type Props = {
  title: string;
  subtitle: string;
  /** Filter listings by market. Omit to show all the operator's listings. */
  markets?: MarketType[];
  postCta: string;
  capacityLabel: string;
  priceLabel: string;
  tags: string[];
};

export function OperatorListings({
  title,
  subtitle,
  markets,
  postCta,
  capacityLabel,
  priceLabel,
  tags,
}: Props) {
  const { user } = useAuth();
  const { notify } = useDemo();
  const userId = user?.id ?? "";
  const { data: listings } = useMyListings(userId);
  const createListing = useCreateListing(userId);
  const toggleListing = useToggleListing(userId);
  const removeListing = useRemoveListing(userId);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mine =
    listings?.filter((l) => !markets || markets.includes(l.type)).sort((a, b) => b.createdAt - a.createdAt) ?? [];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const from = String(f.get("from") || "").trim();
    const to = String(f.get("to") || "").trim();
    const when = String(f.get("when") || "").trim();
    const price = Number(f.get("price") || 0);
    const capacity = String(f.get("capacity") || "").trim();
    if (!from || !to) return setError("Origin and destination are required.");
    if (price <= 0) return setError("Enter a valid rate.");
    setSubmitting(true);
    setError(null);
    try {
      await createListing.mutateAsync({
        type: markets?.[0] ?? "ride",
        title: `${from} → ${to}`,
        from,
        to,
        when: when || "Flexible",
        price,
        capacity: capacity || "Flexible",
        tags,
      });
      setOpen(false);
      notify({
        title: `Listing published · ${from} → ${to}`,
        body: "Live on the marketplace. Manage it right here.",
        kind: "trip",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl ring-1 ring-black/20 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={postCta}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-light border border-brand/30 bg-brand/10 rounded-full px-2.5 py-1 hover:bg-brand/15 transition-colors"
        >
          <Plus className="size-3" /> Post
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

      {open && (
        <form
          onSubmit={submit}
          className="space-y-3 mb-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">From</span>
              <input
                name="from"
                required
                placeholder="Johannesburg"
                className="mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">To</span>
              <input
                name="to"
                required
                placeholder="Cape Town"
                className="mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">When</span>
              <input
                name="when"
                placeholder="Fri 21 Aug"
                className="mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{capacityLabel}</span>
              <input
                name="capacity"
                placeholder="3 seats"
                className="mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{priceLabel}</span>
            <input
              name="price"
              type="number"
              min="0"
              required
              placeholder="850"
              className="mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
            />
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white text-sm font-semibold py-2.5 rounded-xl ring-1 ring-brand/50 transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Publish
          </button>
        </form>
      )}

      {mine.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing listed yet. Post capacity to start earning.</p>
      ) : (
        <div className="space-y-2">
          {mine.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
                    <RouteIcon className="size-3.5 text-brand-light shrink-0" />
                    {t.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <CalendarClock className="size-3" /> {t.when} · {t.capacity}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums">{zar(t.price)}</div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest ${
                      t.status === "live" ? "text-brand-light" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${t.status === "live" ? "bg-brand" : "bg-muted-foreground"}`}
                    />
                    {t.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => toggleListing.mutate(t.id)}
                  aria-label={t.status === "live" ? "Pause listing" : "Resume listing"}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
                >
                  {t.status === "live" ? <Pause className="size-3" /> : <Play className="size-3" />}
                  {t.status === "live" ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => removeListing.mutate(t.id)}
                  aria-label="Remove listing"
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-white/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
