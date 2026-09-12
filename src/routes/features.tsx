import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import {
  Car,
  Package,
  Truck,
  Plane,
  GraduationCap,
  Clock,
  UserPlus,
  Fingerprint,
  ScanFace,
  UserCheck,
  FileCheck2,
  ShieldCheck,
  MapPin,
  Siren,
  Route as RouteIcon,
  CreditCard,
  Star,
  Headphones,
  BarChart3,
  Check,
  LineChart,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — Next Town" },
      {
        name: "description",
        content:
          "Next Town's complete mobility toolkit: verified rides, parcels, truck return-loads, airline seats, school transport, commuter plans, escrow payments, GPS tracking, SOS, ratings and analytics.",
      },
      { property: "og:title", content: "Features — Next Town" },
      {
        property: "og:description",
        content:
          "Every Next Town module: registration, verification, matching, payments, safety and analytics.",
      },
      { property: "og:url", content: "/features" },
    ],
    links: [{ rel: "canonical", href: "/features" }],
  }),
});

const VERTICALS = [
  {
    icon: Car,
    title: "Rides",
    copy: "Search rides by origin, destination, date and seats. Book online, track the driver and rate after every trip.",
  },
  {
    icon: Package,
    title: "Parcels",
    copy: "Send parcels with pickup and delivery points, photo proof, QR + OTP verification and live delivery tracking.",
  },
  {
    icon: Truck,
    title: "Truck return loads",
    copy: "Truck operators post empty capacity and routes; businesses book loads online and track cargo end to end.",
  },
  {
    icon: Plane,
    title: "Airline seats",
    copy: "Empty seats from commercial, charter and private operators — discounted, last-minute and reserveable.",
  },
  {
    icon: GraduationCap,
    title: "School transport",
    copy: "Vetted drivers, registered children and parent notifications with GPS tracking on every school run.",
  },
  {
    icon: Clock,
    title: "Daily commuter",
    copy: "Find commuting partners, share costs and book recurring trips to cut congestion and fuel bills.",
  },
];

const VERIFICATION = [
  {
    icon: UserPlus,
    title: "User registration",
    copy: "SA ID or passport, selfie, mobile and email on signup. Duplicate and fraud checks before access.",
  },
  {
    icon: Fingerprint,
    title: "Identity verification",
    copy: "Government-register ID validation for citizens and passport checks for foreign nationals.",
  },
  {
    icon: ScanFace,
    title: "Face recognition",
    copy: "Selfies matched against ID photos to detect fake identities and block duplicate accounts.",
  },
  {
    icon: UserCheck,
    title: "Driver verification",
    copy: "Licence validation, expiry checks, proof of address and bank details before a driver is approved.",
  },
  {
    icon: FileCheck2,
    title: "Vehicle verification",
    copy: "Vehicle registration, license disc and photos confirmed before any seat can be offered.",
  },
];

const SAFETY = [
  {
    icon: RouteIcon,
    title: "Ride matching",
    copy: "Matches origin, destination, date, time, seats and vehicle type — weighted by distance, ratings, price and safety score.",
  },
  {
    icon: MapPin,
    title: "GPS & tracking",
    copy: "Every trip is tracked with live locations, routes, ETAs, stops and deviation detection.",
  },
  {
    icon: Siren,
    title: "Emergency services",
    copy: "SOS button, emergency contacts, police and medical notification, and live location sharing.",
  },
];

const TRUST = [
  {
    icon: CreditCard,
    title: "Payments",
    copy: "Debit and credit cards, instant EFT, mobile wallets and bank transfers — with escrow, refunds and driver payouts.",
  },
  {
    icon: Star,
    title: "Ratings & reviews",
    copy: "Score drivers, passengers, parcels and trucks on safety, punctuality, cleanliness and communication.",
  },
  {
    icon: ShieldCheck,
    title: "Safety monitoring",
    copy: "Trip records, route history, driver behaviour and speed monitoring with SOS activation.",
  },
];

const ADMIN = [
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    copy: "Revenue, user, trip, safety, driver performance, parcel and load reports for the whole marketplace.",
  },
  {
    icon: LineChart,
    title: "Administration",
    copy: "Approve drivers and vehicles, suspend users, monitor trips, investigate incidents and generate reports.",
  },
  {
    icon: Headphones,
    title: "Customer support",
    copy: "In-app tickets, help center and a 24/7 operations desk for travelers, operators and businesses.",
  },
];

const TRAVELER_FEATURES = [
  "Search for rides",
  "Book seats online",
  "Pay securely online",
  "Track drivers live",
  "Share trips",
  "Cancel bookings",
  "Rate drivers",
  "Save favourite destinations",
];

const DRIVER_FEATURES = [
  "Create trips",
  "Set available seats",
  "Determine prices",
  "Accept passengers",
  "Track earnings",
  "Receive payouts",
  "View ratings",
  "Verified operator badge",
];

function FeatureCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Car;
  title: string;
  copy: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors">
      <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
        <Icon className="size-5 text-brand-light" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{copy}</p>
    </div>
  );
}

function FeatureSection({
  eyebrow,
  title,
  items,
  cols = "lg:grid-cols-3",
}: {
  eyebrow: string;
  title: string;
  items: { icon: typeof Car; title: string; copy: string }[];
  cols?: string;
}) {
  return (
    <section className="px-6 border-t border-white/5 pt-20 pb-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
          {eyebrow}
        </h2>
        <p className="text-2xl md:text-3xl font-medium tracking-tight text-balance mb-8">{title}</p>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-4`}>
          {items.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card rounded-2xl p-7 ring-1 ring-black/20">
      <h3 className="text-lg font-semibold mb-5">{title}</h3>
      <ul className="space-y-3">
        {items.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="size-5 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0">
              <Check className="size-3 text-brand-light" />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Features"
        title="Every mode. One platform."
        subtitle="Rides, parcels, truck loads, airline seats, school transport and commuting — sharing one identity, wallet, safety layer and control tower."
      />

      <FeatureSection
        eyebrow="Marketplace"
        title="Six ways to move"
        items={VERTICALS}
        cols="md:grid-cols-2 lg:grid-cols-3"
      />

      <FeatureSection eyebrow="Identity" title="Verified before they ride" items={VERIFICATION} />

      <FeatureSection
        eyebrow="Matching & safety"
        title="Smart matching, always watching"
        items={SAFETY}
      />

      <FeatureSection
        eyebrow="Commerce & trust"
        title="Payments that protect everyone"
        items={TRUST}
      />

      <FeatureSection eyebrow="Platform" title="Run by operators, for operators" items={ADMIN} />

      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
            For everyone
          </h2>
          <p className="text-2xl md:text-3xl font-medium tracking-tight text-balance mb-8">
            Built for travelers and drivers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <Checklist title="Travelers" items={TRAVELER_FEATURES} />
            <Checklist title="Drivers" items={DRIVER_FEATURES} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-10 ring-1 ring-black/20">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-balance mb-3">
            Ready to move in one direction?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-[42ch] mx-auto">
            Create a free account and start booking rides, sending parcels or listing capacity
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-foreground text-background font-medium py-2.5 px-6 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors"
            >
              Get started
            </Link>
            <Link
              to="/pricing"
              className="glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
