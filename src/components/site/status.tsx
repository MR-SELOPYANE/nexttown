import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus, TxnStatus, VerificationStatus } from "@/lib/domain/types";

const toneMap: Record<string, string> = {
  success: "bg-brand/10 text-brand-light border-brand/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-white/5 text-muted-foreground border-white/10",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

export function StatusPill({
  status,
  tone = "neutral",
  children,
}: {
  status?: string;
  tone?: keyof typeof toneMap;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border",
        toneMap[tone],
      )}
    >
      {status && <span className="size-1.5 rounded-full bg-current" />}
      {children ?? status}
    </span>
  );
}

const BOOKING_TONE: Record<BookingStatus, keyof typeof toneMap> = {
  requested: "info",
  confirmed: "success",
  in_transit: "warning",
  completed: "neutral",
  cancelled: "danger",
};

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  return <StatusPill status={status} tone={BOOKING_TONE[status]} />;
}

const TXN_TONE: Record<TxnStatus, keyof typeof toneMap> = {
  pending: "warning",
  completed: "success",
  failed: "danger",
};

export function TxnStatusPill({ status }: { status: TxnStatus }) {
  return <StatusPill status={status} tone={TXN_TONE[status]} />;
}

const KYC_TONE: Record<VerificationStatus, keyof typeof toneMap> = {
  unverified: "neutral",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

export function KycStatusPill({ status }: { status: VerificationStatus }) {
  return <StatusPill status={status} tone={KYC_TONE[status]} />;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
      <Icon className={cn("size-4 mb-3", accent ? "text-brand-light" : "text-muted-foreground")} />
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-[60ch]">{subtitle}</p>}
    </div>
  );
}
