import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { ComplianceStrip } from "./compliance-strip";

export function PageShell({
  children,
  showCompliance = true,
}: {
  children: ReactNode;
  showCompliance?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      {showCompliance && <ComplianceStrip />}
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backTo,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
}) {
  return (
    <section className="relative px-6 pt-20 pb-16 border-b border-white/5 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 20%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-4xl mx-auto text-center">
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="size-4" /> Back
          </Link>
        )}
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-semibold mb-6">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground text-pretty max-w-[60ch] mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function LegalPageHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <section className="relative px-6 pt-20 pb-14 border-b border-white/5 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 20%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-3xl mx-auto text-left">
        {eyebrow && (
          <div className="text-brand-light text-xs font-bold uppercase tracking-widest mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
      </div>
    </section>
  );
}

export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <section className="px-6 py-14">
      <div className="max-w-3xl mx-auto prose-sm space-y-6 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}
