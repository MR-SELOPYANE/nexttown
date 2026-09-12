import { useEffect, useState } from "react";
import { Link, useSearch as useRouteSearch } from "@tanstack/react-router";
import { Loader2, LocateFixed, Plus, Search, Share2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/store/auth-context";
import { useCreateListing, useSearch } from "@/lib/hooks/queries";
import { zar } from "@/lib/format";
import { useMyLocation } from "@/hooks/use-my-location";
import type { Listing, MarketType } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./form";
import { BookingModal } from "./booking-modal";
import { EmptyState, ErrorState, GridSkeleton } from "./states";

export type MarketConfig = {
  type: MarketType;
  cta: string;
  noun: string;
  resultsNoun: string;
  fromLabel: string;
  fromPlaceholder: string;
  toLabel: string;
  toPlaceholder: string;
  filterLabel: string;
  filterOptions: { value: string; label: string }[];
  searchLabel: string;
  postCta: string;
  postFromLabel: string;
  postToLabel: string;
  postCapacityLabel: string;
  postPriceLabel: string;
};

export function MarketplaceView({ config }: { config: MarketConfig }) {
  const { user } = useAuth();
  const urlQuery = useRouteSearch({ strict: false }) as { from?: string; to?: string };
  const [from, setFrom] = useState(urlQuery.from ?? "");
  const [to, setTo] = useState(urlQuery.to ?? "");
  const [when, setWhen] = useState("");
  const [submitted, setSubmitted] = useState(Boolean(urlQuery.from || urlQuery.to));
  const [selected, setSelected] = useState<Listing | null>(null);
  const [posting, setPosting] = useState(false);

  const search = useSearch({ type: config.type, from, to, when, limit: 30 }, submitted);
  const location = useMyLocation();

  useEffect(() => {
    if (!from && location.state.place && location.state.status === "ready") {
      setFrom(location.state.place);
    }
  }, [location.state, from]);

  useEffect(() => {
    if (location.state.status === "idle") location.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-10">
        <form
          className="glass-card rounded-2xl p-4 md:p-5 ring-1 ring-black/20 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <Field label={config.fromLabel}>
            <div className="relative">
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder={config.fromPlaceholder}
                className="h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60 pr-10"
              />
              <button
                type="button"
                onClick={location.locate}
                disabled={location.state.status === "locating"}
                aria-label="Use my current location"
                title="Use my current location"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-md flex items-center justify-center text-brand-light hover:bg-white/5 disabled:opacity-50"
              >
                {location.state.status === "locating" ? (
                  <span className="size-3.5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                ) : (
                  <LocateFixed className="size-3.5" />
                )}
              </button>
            </div>
            {location.state.status === "error" && (
              <p className="text-[11px] text-destructive mt-1">{location.state.error}</p>
            )}
          </Field>
          <Field label={config.toLabel}>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={config.toPlaceholder}
              className="h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60"
            />
          </Field>
          <Field label={config.filterLabel}>
            <select
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
            >
              <option value="">Any</option>
              {config.filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Button
            type="submit"
            className="bg-brand hover:bg-brand-light text-white h-10 rounded-lg"
          >
            <Search className="size-4" /> {config.searchLabel}
          </Button>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {submitted
              ? search.isLoading
                ? "Searching…"
                : `${search.data?.length ?? 0} ${config.resultsNoun}`
              : `Browse ${config.resultsNoun}`}
          </h2>
          <div className="flex gap-2">
            {submitted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setWhen("");
                  setSubmitted(false);
                }}
              >
                <X className="size-4" /> Clear
              </Button>
            )}
            {config.postCta && (
              <Button variant="outline" size="sm" onClick={() => setPosting(true)}>
                <Plus className="size-4" /> {config.postCta}
              </Button>
            )}
          </div>
        </div>

        {search.isLoading ? (
          <GridSkeleton />
        ) : search.isError ? (
          <ErrorState onRetry={() => search.refetch()} />
        ) : !search.data || search.data.length === 0 ? (
          <EmptyState
            title="Nothing on that route yet"
            description="Try a broader search, or check back soon — new capacity is listed daily."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setFrom("");
                  setTo("");
                }}
              >
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {search.data.map((l) => (
              <ListingCard key={l.id} listing={l} cta={config.cta} onBook={() => setSelected(l)} />
            ))}
          </div>
        )}
      </section>

      {selected && <BookingModal listing={selected} onClose={() => setSelected(null)} />}

      {posting && <PostingModal config={config} onClose={() => setPosting(false)} />}
    </>
  );
}

export function ListingCard({
  listing,
  cta,
  onBook,
}: {
  listing: Listing;
  cta: string;
  onBook: () => void;
}) {
  return (
    <article className="glass-card rounded-2xl p-5 ring-1 ring-black/20 hover:ring-brand/30 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light mb-1">
            {listing.from} → {listing.to}
          </div>
          <h3 className="text-base font-semibold text-foreground truncate">{listing.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{listing.when}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-semibold tabular-nums">{zar(listing.price)}</div>
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5">
            <Star className="size-3 fill-brand text-brand" />
            {listing.rating.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        <span>{listing.capacity}</span>
        {listing.meta.slice(0, 2).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {listing.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand-light border border-brand/20"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-auto">
        <Button
          onClick={onBook}
          className="flex-1 bg-brand hover:bg-brand-light text-white rounded-lg"
        >
          {cta}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Share this trip"
          title="Share"
          onClick={async () => {
            const text = `${listing.title} on Next Town · ${listing.when} · ${zar(listing.price)} — book on the marketplace`;
            try {
              await navigator.clipboard?.writeText(text);
              toast.success("Trip details copied to clipboard");
            } catch {
              toast.info(text);
            }
          }}
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}

function PostingModal({ config, onClose }: { config: MarketConfig; onClose: () => void }) {
  const { user } = useAuth();
  const createListing = useCreateListing(user?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const from = String(f.get("from") || "");
    const to = String(f.get("to") || "");
    const when = String(f.get("when") || "");
    const capacity = String(f.get("capacity") || "");
    const price = Number(f.get("price") || 0);
    if (!from || !to) return setError("Origin and destination are required.");
    if (price <= 0) return setError("Enter a valid rate.");
    try {
      await createListing.mutateAsync({
        type: config.type,
        title: `${from} → ${to}`,
        from,
        to,
        when: when || "Flexible",
        price,
        capacity,
        tags: ["Verified operator"],
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish the listing.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={config.postCta}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl p-6 ring-1 ring-black/30 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {config.postCta}
          </h3>
          <button
            onClick={onClose}
            disabled={createListing.isPending}
            aria-label="Close"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label={config.postFromLabel} required>
              <Input
                name="from"
                required
                placeholder="Durban"
                className="h-10 rounded-lg bg-white/[0.03] border-white/10"
              />
            </Field>
            <Field label={config.postToLabel} required>
              <Input
                name="to"
                required
                placeholder="Johannesburg"
                className="h-10 rounded-lg bg-white/[0.03] border-white/10"
              />
            </Field>
          </div>
          <Field label="When">
            <Input
              name="when"
              placeholder="Available 21 Jul"
              className="h-10 rounded-lg bg-white/[0.03] border-white/10"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={config.postCapacityLabel}>
              <Input
                name="capacity"
                placeholder="Sedan · 3 seats"
                className="h-10 rounded-lg bg-white/[0.03] border-white/10"
              />
            </Field>
            <Field label={config.postPriceLabel} required>
              <Input
                name="price"
                type="number"
                min="0"
                required
                placeholder="189"
                className="h-10 rounded-lg bg-white/[0.03] border-white/10"
              />
            </Field>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!user && (
            <p className="text-xs text-muted-foreground">
              <Link to="/login" className="text-brand-light underline">
                Sign in
              </Link>{" "}
              to publish a listing.
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-light text-white"
            disabled={!user || createListing.isPending}
          >
            {createListing.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Publishing…
              </>
            ) : (
              <>
                <Plus className="size-4" /> Publish listing
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
