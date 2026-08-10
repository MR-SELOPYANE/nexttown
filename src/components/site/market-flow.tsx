import { useMemo, useState } from "react";
import { Search, X, Check, Plus } from "lucide-react";
import {
  MarketToolbar,
  MarketField,
  MarketInput,
  MarketSelect,
  MarketButton,
} from "@/components/site/market-ui";
import { useDemo, zar, type MarketType } from "@/lib/demo-store";
import { Star } from "lucide-react";

export type Listing = {
  id: string;
  eyebrow: string;
  title: string;
  route: string;
  price: number;
  meta: string[];
  rating: number;
  tags: string[];
};

type Props = {
  type: MarketType;
  listings: Listing[];
  cta: string;
  fields: {
    fromLabel: string;
    fromPlaceholder: string;
    toLabel: string;
    toPlaceholder: string;
    filterLabel: string;
    filterOptions: { value: string; label: string }[];
    searchLabel: string;
  };
  resultsNoun: string;
  postCta?: string;
  postCapacityLabel?: string;
};

export function MarketplaceView({
  type,
  listings,
  cta,
  fields,
  resultsNoun,
  postCta,
  postCapacityLabel = "Capacity",
}: Props) {
  const { addBooking, addPosting } = useDemo();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState(fields.filterOptions[0]?.value ?? "");
  const [query, setQuery] = useState({ from: "", to: "" });
  const [selected, setSelected] = useState<Listing | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const results = useMemo(() => {
    const match = (l: Listing, term: string) =>
      !term || `${l.title} ${l.route} ${l.eyebrow}`.toLowerCase().includes(term.toLowerCase());
    return listings.filter((l) => match(l, query.from) && match(l, query.to));
  }, [listings, query]);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ from, to });
          }}
        >
          <MarketToolbar>
            <MarketField label={fields.fromLabel}>
              <MarketInput
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder={fields.fromPlaceholder}
              />
            </MarketField>
            <MarketField label={fields.toLabel}>
              <MarketInput
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={fields.toPlaceholder}
              />
            </MarketField>
            <MarketField label={fields.filterLabel}>
              <MarketSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
                {fields.filterOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </MarketSelect>
            </MarketField>
            <MarketButton type="submit">
              <Search className="size-4" />
              {fields.searchLabel}
            </MarketButton>
          </MarketToolbar>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {results.length} {resultsNoun}
            {(query.from || query.to) && (
              <button
                onClick={() => {
                  setQuery({ from: "", to: "" });
                  setFrom("");
                  setTo("");
                }}
                className="ml-3 text-xs font-medium text-brand-light hover:underline"
              >
                Clear search
              </button>
            )}
          </h2>
          {postCta && (
            <MarketButton variant="ghost" onClick={() => setPosting(true)}>
              <Plus className="size-4" />
              {postCta}
            </MarketButton>
          )}
        </div>

        {results.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center ring-1 ring-black/20">
            <p className="text-sm text-muted-foreground">
              Nothing on that route yet. Try a broader search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((l) => (
              <article
                key={l.id}
                className="glass-card rounded-2xl p-5 ring-1 ring-black/20 hover:ring-brand/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light mb-1">
                      {l.eyebrow}
                    </div>
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {l.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.route}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold tabular-nums">{zar(l.price)}</div>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5">
                      <Star className="size-3 fill-brand text-brand" />
                      {l.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                  {l.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {l.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand-light border border-brand/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelected(l)}
                  className="w-full text-sm font-medium py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-brand hover:border-brand/50 hover:text-white transition-colors"
                >
                  {cta}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <Modal title={cta} onClose={() => setSelected(null)}>
          <div className="space-y-1 mb-5">
            <div className="text-sm font-semibold">{selected.title}</div>
            <div className="text-xs text-muted-foreground">{selected.route}</div>
          </div>
          <dl className="glass-card rounded-xl p-4 ring-1 ring-black/20 text-sm space-y-2 mb-5">
            {selected.meta.map((m) => (
              <div key={m} className="flex justify-between gap-4">
                <dt className="text-muted-foreground text-xs">Detail</dt>
                <dd className="text-xs text-right">{m}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Total
              </dt>
              <dd className="text-base font-semibold tabular-nums">{zar(selected.price)}</dd>
            </div>
          </dl>
          <MarketButton
            onClick={() => {
              const b = addBooking({
                type,
                title: selected.title,
                route: selected.route,
                price: selected.price,
              });
              setSelected(null);
              setConfirmation(b.ref);
            }}
          >
            <Check className="size-4" />
            Confirm · {zar(selected.price)}
          </MarketButton>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Demo mode — no payment is taken. Booking appears in your dashboard.
          </p>
        </Modal>
      )}

      {posting && postCta && (
        <Modal title={postCta} onClose={() => setPosting(false)}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const p = addPosting({
                type,
                title: `${form.get("from")} → ${form.get("to")}`,
                route: String(form.get("when") || "Flexible"),
                price: Number(form.get("price") || 0),
                capacity: String(form.get("capacity") || ""),
              });
              setPosting(false);
              setConfirmation(`listing ${p.id.toUpperCase()}`);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <MarketField label="From">
                <MarketInput name="from" required placeholder="Durban" />
              </MarketField>
              <MarketField label="To">
                <MarketInput name="to" required placeholder="Johannesburg" />
              </MarketField>
            </div>
            <MarketField label="When">
              <MarketInput name="when" placeholder="Available 21 Jul" />
            </MarketField>
            <div className="grid grid-cols-2 gap-3">
              <MarketField label={postCapacityLabel}>
                <MarketInput name="capacity" placeholder="Tautliner · 34 t" />
              </MarketField>
              <MarketField label="Rate (ZAR)">
                <MarketInput name="price" type="number" min="0" required placeholder="12400" />
              </MarketField>
            </div>
            <MarketButton type="submit">
              <Plus className="size-4" />
              Publish listing
            </MarketButton>
          </form>
        </Modal>
      )}

      {confirmation && (
        <Modal title="Confirmed" onClose={() => setConfirmation(null)}>
          <div className="text-center py-2">
            <div className="mx-auto mb-4 size-12 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light">
              <Check className="size-6" />
            </div>
            <p className="text-sm font-semibold mb-1">Reference {confirmation}</p>
            <p className="text-xs text-muted-foreground mb-5">
              Tracked live in your dashboard.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 px-5 rounded-lg ring-1 ring-brand/50 transition-colors"
            >
              Open dashboard
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-card rounded-2xl p-6 ring-1 ring-black/30"
        style={{ animation: "hitch-fade-up 0.25s ease-out both" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
