import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — HITCH SA" },
      {
        name: "description",
        content:
          "Get in touch with HITCH SA — sales, partnerships, press and general enquiries. Sandton HQ.",
      },
      { property: "og:title", content: "Contact — HITCH SA" },
      { property: "og:description", content: "Talk to the HITCH SA team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        subtitle="Sales, partnerships, media or just curious — the right person will reply within one business day."
      />

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          <div className="space-y-4">
            <ContactCard
              icon={Mail}
              title="Email"
              lines={["hello@hitch.sa", "sales@hitch.sa", "press@hitch.sa"]}
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              lines={["+27 10 001 2400 (Mon–Fri, 08:00–18:00)", "0800 HITCH (24/7 emergency)"]}
            />
            <ContactCard
              icon={MapPin}
              title="Sandton HQ"
              lines={["11 Alice Lane", "Sandton, Johannesburg 2196", "South Africa"]}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" name="name" placeholder="Your name" required />
              <Field label="Email" name="email" type="email" placeholder="you@company.co.za" required />
            </div>
            <Field label="Company" name="company" placeholder="Company (optional)" />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Topic
              </label>
              <select
                name="topic"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                <option>General enquiry</option>
                <option>Sales / enterprise</option>
                <option>Driver / operator</option>
                <option>Press</option>
                <option>Partnerships</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                required
                placeholder="Tell us a little about what you need…"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sent}
              className="w-full bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ring-1 ring-brand/50 disabled:opacity-60"
            >
              {sent ? "Thanks — we'll be in touch." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="glass-card rounded-2xl p-6 ring-1 ring-black/20">
      <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
        <Icon className="size-5 text-brand-light" />
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-0.5">
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
    </div>
  );
}
