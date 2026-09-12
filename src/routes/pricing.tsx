import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Next Town" },
      {
        name: "description",
        content:
          "Transparent, take-rate pricing for individuals, drivers, operators and businesses on Next Town.",
      },
      { property: "og:title", content: "Pricing — Next Town" },
      { property: "og:description", content: "Simple, transparent pricing across every vertical." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const TIERS = [
  {
    name: "Individual",
    tag: "Riders, senders, parents",
    price: "Free",
    priceSub: "Pay only per trip",
    features: [
      "All 5 verticals in one app",
      "Wallet, split pay, receipts",
      "Live tracking + SOS",
      "In-app support",
    ],
    cta: "Create account",
    href: "/register",
    highlight: false,
  },
  {
    name: "Operator",
    tag: "Drivers, truckers, pilots",
    price: "12%",
    priceSub: "Take rate on each completed trip",
    features: [
      "Instant payouts to your wallet",
      "Driver-level performance dashboard",
      "Recurring trips & schedules",
      "Priority dispatch as you rank up",
      "Fuel and insurance partner rates",
    ],
    cta: "Apply to drive",
    href: "/register",
    highlight: true,
  },
  {
    name: "Business",
    tag: "SMBs, retailers, schools",
    price: "Custom",
    priceSub: "Volume pricing + enterprise API",
    features: [
      "Central billing & cost centres",
      "SLAs and account manager",
      "API + webhooks",
      "SSO and audit logs",
      "White-label options",
    ],
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Pricing"
        title="Simple, transparent pricing."
        subtitle="No booking fees for riders. Fair take-rates for operators. Volume pricing for businesses that move at scale."
      />

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`glass-card rounded-2xl p-8 ring-1 ring-black/20 flex flex-col ${
                t.highlight ? "border-brand/40 shadow-2xl shadow-brand/10" : ""
              }`}
            >
              <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest mb-2">
                {t.tag}
              </div>
              <h3 className="text-xl font-semibold mb-4">{t.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{t.priceSub}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-foreground/80">
                    <Check className="size-4 text-brand-light shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={t.href}
                className={`w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  t.highlight
                    ? "bg-brand hover:bg-brand-light text-white ring-1 ring-brand/50"
                    : "glass-card hover:bg-white/5 text-foreground"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium tracking-tight mb-3">No hidden fees, ever.</h2>
          <p className="text-muted-foreground">
            What you see is what you pay. Detailed price breakdowns are shown before every trip —
            for every party involved.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
