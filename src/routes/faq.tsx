import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Next Town" },
      {
        name: "description",
        content:
          "Answers to the most common questions about Next Town — accounts, payments, safety, drivers and business features.",
      },
      { property: "og:title", content: "FAQ — Next Town" },
      { property: "og:description", content: "The most common questions, answered." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

const FAQS = [
  {
    q: "Which cities does Next Town operate in?",
    a: "We're live across all nine South African provinces, with the deepest coverage in Gauteng, Western Cape and KwaZulu-Natal. Regional coverage varies by vertical.",
  },
  {
    q: "How are drivers verified?",
    a: "Every driver clears a 5-tier check: SA ID verification, PrDP validation, criminal record check via SAPS partners, vehicle roadworthy inspection, and platform onboarding assessment.",
  },
  {
    q: "How does the wallet work?",
    a: "Your Next Town wallet holds funds for rides, parcels, freight, seats and school transport. Top up via PayFast, Ozow or card. Operators receive payouts to their linked bank account.",
  },
  {
    q: "What happens if I have an emergency during a trip?",
    a: "Tap the in-app SOS button. Your live location, trip and driver details are sent to our 24/7 operations centre, your emergency contacts and — if you opt in — private security response.",
  },
  {
    q: "Can businesses integrate Next Town into their systems?",
    a: "Yes. Our enterprise API covers bookings, tracking, invoicing and webhooks. Contact sales for SLAs, SSO and white-label options.",
  },
  {
    q: "Is Next Town POPIA compliant?",
    a: "Yes. All personal data is stored on encrypted infrastructure inside South Africa, processed under a POPIA-registered Information Officer, and available for export or deletion on request.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell>
      <PageHeader
        eyebrow="FAQ"
        title="Answers, straight up."
        subtitle="Common questions across all five verticals. Can't find yours? Support is one tap away."
      />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="glass-card rounded-2xl ring-1 ring-black/20 overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 -mt-1 text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
