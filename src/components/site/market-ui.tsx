import type { ReactNode } from "react";
import { Star } from "lucide-react";

export function MarketToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 ring-1 ring-black/20 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
      {children}
    </div>
  );
}

export function MarketField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

export function MarketInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
    />
  );
}

export function MarketSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
    />
  );
}

export function MarketButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-5 rounded-lg transition-colors";
  const styles =
    variant === "primary"
      ? "bg-brand hover:bg-brand-light text-white ring-1 ring-brand/50"
      : "glass-card hover:bg-white/5 text-foreground";
  return (
    <button {...props} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

export function ListingCard({
  eyebrow,
  title,
  route,
  price,
  meta,
  rating,
  tags,
  cta = "View",
}: {
  eyebrow: string;
  title: string;
  route: string;
  price: string;
  meta: string[];
  rating?: number;
  tags?: string[];
  cta?: string;
}) {
  return (
    <article className="glass-card rounded-2xl p-5 ring-1 ring-black/20 hover:ring-brand/30 transition-all group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light mb-1">
            {eyebrow}
          </div>
          <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{route}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-semibold text-foreground tabular-nums">{price}</div>
          {rating !== undefined && (
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5">
              <Star className="size-3 fill-brand text-brand" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        {meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand-light border border-brand/20"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <button className="w-full text-sm font-medium py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-brand hover:border-brand/50 hover:text-white transition-colors">
        {cta}
      </button>
    </article>
  );
}
