import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { useSubmitTicket } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import {
  LifeBuoy,
  MessageSquare,
  ShieldAlert,
  BookOpen,
  Wallet,
  Car,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Support — HITCH SA" },
      {
        name: "description",
        content:
          "Get help with HITCH SA. Emergency response, wallet issues, driver support and 24/7 live chat.",
      },
      { property: "og:title", content: "Support — HITCH SA" },
      { property: "og:description", content: "24/7 support for every HITCH SA user." },
      { property: "og:url", content: "/support" },
    ],
    links: [{ rel: "canonical", href: "/support" }],
  }),
});

const TOPICS = [
  {
    icon: Car,
    title: "Trips & bookings",
    copy: "Cancellations, refunds, disputes and driver issues.",
  },
  {
    icon: Wallet,
    title: "Wallet & payments",
    copy: "Top-ups, payouts, PayFast, Ozow and card issues.",
  },
  {
    icon: ShieldAlert,
    title: "Safety & emergencies",
    copy: "In-trip SOS, incident reports, missing items.",
  },
  {
    icon: BookOpen,
    title: "Account & KYC",
    copy: "SA ID / passport verification, 2FA, device management.",
  },
];

function SupportPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Support"
        title="We're here 24/7."
        subtitle="Real humans, real tools. If something goes wrong, we're one tap away — and if it's an emergency, we're already moving."
      />

      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <a
            href="tel:0800448244"
            className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
          >
            <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <LifeBuoy className="size-5 text-brand-light" />
            </div>
            <h3 className="text-base font-semibold mb-1">Emergency line</h3>
            <p className="text-sm text-muted-foreground">0800 HITCH (24/7)</p>
          </a>
          <a
            href="mailto:help@hitch.sa"
            className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
          >
            <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <MessageSquare className="size-5 text-brand-light" />
            </div>
            <h3 className="text-base font-semibold mb-1">Email help</h3>
            <p className="text-sm text-muted-foreground">help@hitch.sa · replies in &lt; 1h</p>
          </a>
          <Link
            to="/faq"
            className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
          >
            <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <BookOpen className="size-5 text-brand-light" />
            </div>
            <h3 className="text-base font-semibold mb-1">FAQ &amp; guides</h3>
            <p className="text-sm text-muted-foreground">Search common answers</p>
          </Link>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
          Popular topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                to="/faq"
                key={t.title}
                className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors group"
              >
                <Icon className="size-5 text-brand-light mb-4" />
                <h3 className="text-base font-semibold mb-1.5">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.copy}</p>
                <div className="flex items-center gap-1.5 text-xs text-brand-light font-medium">
                  Explore
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 mt-16">
          Open a ticket
        </h2>
        <SupportForm />
      </section>
    </PageShell>
  );
}

function SupportForm() {
  const { user } = useAuth();
  const submit = useSubmitTicket();
  const [topic, setTopic] = useState("Trips & bookings");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");

  if (submit.isSuccess) {
    return (
      <div className="glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center max-w-2xl">
        <CheckCircle2 className="size-9 text-brand mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">Ticket received</h3>
        <p className="text-sm text-muted-foreground max-w-[42ch] mx-auto mb-6">
          Our support desk has your request and a human will pick it up shortly. You'll get a reply
          at {email || "your account email"}.
        </p>
        <Button variant="outline" onClick={() => submit.reset()}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate({ topic, subject: subject || topic, message, email, userId: user?.id });
      }}
      className="glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4 max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="support-topic" className="mb-2 block">
            Topic
          </Label>
          <select
            id="support-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {TOPICS.map((t) => (
              <option key={t.title}>{t.title}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="support-email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="support-subject" className="mb-2 block">
          Subject
        </Label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary of the issue"
          required
        />
      </div>
      <div>
        <Label htmlFor="support-message" className="mb-2 block">
          Message
        </Label>
        <textarea
          id="support-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Tell us what happened…"
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={submit.isPending}
        className="bg-brand hover:bg-brand-light text-white"
      >
        {submit.isPending && <Loader2 className="size-4 animate-spin" />} Submit ticket
      </Button>
      {submit.isError && (
        <p className="text-sm text-destructive">
          {submit.error?.message ?? "Something went wrong."}
        </p>
      )}
    </form>
  );
}
