import type { LucideIcon } from "lucide-react";
import { DRIVER_STATE_LABELS, type DriverModeState } from "@/lib/driver/types";

export function DriverStatusBadge({ state }: { state: DriverModeState }) {
  const active = state !== "offline";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-black/20 glass-card ${
        active ? "text-brand-light" : "text-muted-foreground"
      }`}
      aria-live="polite"
    >
      <span
        className={`size-2 rounded-full ${active ? "bg-brand animate-pulse" : "bg-muted-foreground"}`}
      />
      {DRIVER_STATE_LABELS[state]}
    </span>
  );
}

export function DriverMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
      <Icon className="mb-1.5 size-3.5 text-brand-light" />
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
