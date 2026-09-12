import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useSubmitTicket } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Next Town" },
      {
        name: "description",
        content:
          "Get in touch with Next Town — sales, partnerships, press and general enquiries. Sandton HQ.",
      },
      { property: "og:title", content: "Contact — Next Town" },
      { property: "og:description", content: "Talk to the Next Town team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const { user } = useAuth();
  const submit = useSubmitTicket();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("General enquiry");
  const [message, setMessage] = useState("");

  const sent = submit.isSuccess;

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
              lines={["hello@nexttown.co.za", "sales@nexttown.co.za", "press@nexttown.co.za"]}
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              lines={["+27 10 001 2400 (Mon–Fri, 08:00–18:00)", "0800 NEXTTOWN (24/7 emergency)"]}
            />
            <ContactCard
              icon={MapPin}
              title="Sandton HQ"
              lines={["11 Alice Lane", "Sandton, Johannesburg 2196", "South Africa"]}
            />
          </div>

          {sent ? (
            <div className="glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center flex flex-col items-center justify-center">
              <div className="size-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mb-4">
                <Mail className="size-5 text-brand-light" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Message sent</h3>
              <p className="text-sm text-muted-foreground max-w-[40ch]">
                Thanks {name || "there"} — we've logged your enquiry and a real human will reply to{" "}
                {email} within one business day.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate({
                  topic,
                  subject: `${topic}${company ? ` · ${company}` : ""}`,
                  message,
                  email,
                  userId: user?.id,
                });
              }}
              className="glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  name="name"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@company.co.za"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Field
                label="Company"
                name="company"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Topic
                </label>
                <select
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us a little about what you need…"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submit.isPending}
                className="w-full bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ring-1 ring-brand/50 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {submit.isPending && <Loader2 className="size-4 animate-spin" />} Send message
              </button>
              {submit.isError && (
                <p className="text-sm text-destructive">
                  {submit.error?.message ?? "Something went wrong. Please try again."}
                </p>
              )}
            </form>
          )}
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
