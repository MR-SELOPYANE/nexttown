import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { MapPin, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useSubmitTicket } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () => ({
    meta: [
      { title: "Careers — Next Town" },
      {
        name: "description",
        content:
          "Join Next Town. Open engineering, design, operations and driver-experience roles in Sandton, Cape Town and Durban.",
      },
      { property: "og:title", content: "Careers — Next Town" },
      { property: "og:description", content: "Help us move a country in one direction." },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
});

const ROLES = [
  { team: "Engineering", title: "Senior Backend Engineer (Go / Postgres)", location: "Sandton" },
  { team: "Engineering", title: "Realtime Systems Engineer", location: "Remote — SA" },
  { team: "Engineering", title: "Mobile Engineer (React Native)", location: "Cape Town" },
  { team: "Design", title: "Product Designer — Freight", location: "Sandton" },
  { team: "Operations", title: "Regional Ops Manager — KZN", location: "Durban" },
  { team: "Operations", title: "Driver Experience Lead", location: "Sandton" },
  { team: "Trust & Safety", title: "Fraud Analyst", location: "Remote — SA" },
  { team: "Sales", title: "Enterprise Account Executive", location: "Sandton" },
];

const PERKS = [
  "Equity in a category-defining SA business",
  "Medical aid + mental-health cover",
  "Remote-first, quarterly team weeks in Sandton",
  "Annual learning budget of R25 000",
  "MacBook Pro + generous home-office setup",
  "Parental leave — 20 weeks primary / 8 weeks secondary",
];

function CareersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Careers"
        title="Help us move a country in one direction."
        subtitle="We're a small team building enterprise-grade mobility infrastructure for South Africa. If that sounds like your kind of ambition — read on."
      />

      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Open roles
          </h2>
          <div className="glass-card rounded-2xl ring-1 ring-black/20 divide-y divide-white/5 overflow-hidden">
            {ROLES.map((r) => (
              <a
                key={r.title}
                href="mailto:careers@nexttown.co.za"
                className="flex items-center gap-6 px-6 py-5 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="text-brand-light text-[10px] font-bold uppercase tracking-widest w-32 shrink-0">
                  {r.team}
                </div>
                <div className="flex-1 text-foreground font-medium">{r.title}</div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {r.location}
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-light group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Life at Next Town
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-16">
            {PERKS.map((p) => (
              <li
                key={p}
                className="glass-card rounded-xl px-5 py-4 ring-1 ring-black/20 text-sm text-foreground/80"
              >
                {p}
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Apply
          </h2>
          <CareerForm />
        </div>
      </section>
    </PageShell>
  );
}

function CareerForm() {
  const { user } = useAuth();
  const submit = useSubmitTicket();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(ROLES[0].title);
  const [message, setMessage] = useState("");

  if (submit.isSuccess) {
    return (
      <div className="glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center max-w-2xl">
        <CheckCircle2 className="size-9 text-brand mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">Application received</h3>
        <p className="text-sm text-muted-foreground max-w-[42ch] mx-auto mb-6">
          Thanks {name || "for applying"} — our hiring team will review your application for {role}{" "}
          and get back to {email} within a few days.
        </p>
        <Button variant="outline" onClick={() => submit.reset()}>
          Apply for another role
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate({
          topic: `Careers · ${role}`,
          subject: role,
          message: message || "Application submitted via the careers page.",
          email,
          userId: user?.id,
        });
      }}
      className="glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4 max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="career-name" className="mb-2 block">
            Full name
          </Label>
          <Input
            id="career-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <Label htmlFor="career-email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="career-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="career-role" className="mb-2 block">
          Role
        </Label>
        <select
          id="career-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          {ROLES.map((r) => (
            <option key={r.title}>{r.title}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="career-message" className="mb-2 block">
          A little about you
        </Label>
        <textarea
          id="career-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why Next Town, and what you'd bring…"
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={submit.isPending}
        className="bg-brand hover:bg-brand-light text-white"
      >
        {submit.isPending && <Loader2 className="size-4 animate-spin" />} Submit application
      </Button>
      {submit.isError && (
        <p className="text-sm text-destructive">
          {submit.error?.message ?? "Something went wrong."}
        </p>
      )}
    </form>
  );
}
