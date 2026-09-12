import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import {
  Car,
  Package,
  Truck,
  Plane,
  Users,
  GraduationCap,
  Briefcase,
  Clock,
  ShieldCheck,
  Compass,
  Flag,
  TrendingUp,
  Award,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Next Town" },
      {
        name: "description",
        content:
          "Next Town is a cutting-edge digital mobility platform reimagining the classic hitchhiking experience into a safe, secure and tech-savvy transportation ecosystem.",
      },
      { property: "og:title", content: "About — Next Town" },
      {
        property: "og:description",
        content: "South Africa's unified mobility and logistics platform.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const WHO_WE_CONNECT = [
  { icon: Users, title: "Travelers", copy: "Budget-friendly transport, safely matched." },
  { icon: Car, title: "Drivers", copy: "Fill unused seats and turn trips into income." },
  { icon: Truck, title: "Truck operators", copy: "Return loads instead of empty return trips." },
  { icon: Package, title: "Parcel senders", copy: "Faster, cheaper delivery for every parcel." },
  { icon: Plane, title: "Airlines", copy: "Sell vacant seats instead of flying empty." },
  {
    icon: GraduationCap,
    title: "Schools & parents",
    copy: "Dependable transport for school communities.",
  },
  { icon: Clock, title: "Daily commuters", copy: "Shared, affordable commuting every day." },
  { icon: Briefcase, title: "Businesses", copy: "Logistics, corporate travel and freight." },
];

const PROBLEMS = [
  {
    icon: Users,
    title: "Travelers",
    points: [
      "Sky-high airfares",
      "Costly bus tickets",
      "Pricey taxi fares",
      "Unsafe roadside hitchhiking",
      "Long wait times",
    ],
  },
  {
    icon: Car,
    title: "Drivers",
    points: ["Unused vehicle seats", "Rising fuel costs", "Missed income opportunities"],
  },
  {
    icon: Truck,
    title: "Truckers",
    points: ["Empty return trips", "High operating expenses"],
  },
  {
    icon: Package,
    title: "Parcel industry",
    points: ["Steep courier fees", "Slow delivery times"],
  },
  {
    icon: GraduationCap,
    title: "Schools",
    points: ["Parents face challenges with transport arrangements"],
  },
  {
    icon: Compass,
    title: "Tourism",
    points: ["High transportation costs hinder travel activity"],
  },
];

const OBJECTIVES = [
  { icon: TrendingUp, copy: "Cut down travel expenses." },
  { icon: Users, copy: "Enhance transportation accessibility." },
  { icon: ShieldCheck, copy: "Boost road safety." },
  { icon: Car, copy: "Minimise empty vehicle trips." },
  { icon: Award, copy: "Generate earning opportunities." },
  { icon: Truck, copy: "Decrease logistics costs." },
  { icon: Compass, copy: "Improve mobility in rural areas." },
  { icon: Flag, copy: "Foster tourism growth." },
  { icon: Briefcase, copy: "Create job opportunities." },
  { icon: Plane, copy: "Expand on a global scale." },
];

const REVENUE = [
  { label: "Booking fees", copy: "A percentage of travel fares." },
  { label: "Driver commission", copy: "Commission earned on rides." },
  { label: "Parcel commission", copy: "A percentage of delivery fees." },
  { label: "Truck load fees", copy: "Commission on loads transported." },
  { label: "Airline seat sales", copy: "Commission from selling empty seats." },
  { label: "Subscription plans", copy: "Premium services for drivers." },
  { label: "Advertising", copy: "In-app advertising revenue." },
  { label: "Insurance products", copy: "Offering travel insurance." },
  { label: "Corporate accounts", copy: "Transportation services for businesses." },
];

const COMPLIANCE = [
  "POPIA",
  "Road Traffic Act",
  "Consumer Protection Act",
  "Electronic Communications Act",
  "Financial regulations",
  "Passenger transport regulations",
];

function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="Moving in one direction."
        subtitle="Next Town reimagines the classic hitchhiking experience, turning it into a safe, secure and tech-savvy transportation ecosystem that connects people, vehicles, cargo and parcels across South Africa."
      />

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-2 text-muted-foreground text-[15px] leading-relaxed">
          <p>
            Next Town is a digital mobility platform built for South Africa — from daily commuters
            and travelers looking for budget-friendly transport, to drivers with extra seats to
            fill, truck operators seeking return loads, parcel senders, school communities, and
            airlines with vacant seats.
          </p>
          <p>
            With identity verification, facial recognition, vehicle validation, payment processing,
            GPS tracking and safety monitoring, the platform ensures a secure travel experience for
            everyone involved — one identity, one wallet, one platform.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
            One platform for the whole country
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHO_WE_CONNECT.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
                >
                  <div className="size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    <Icon className="size-5 text-brand-light" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
            The problem we solve
          </h2>
          <p className="text-muted-foreground mb-10 max-w-[56ch]">
            South Africa is grappling with a range of transportation issues. Next Town was built to
            close each gap in a fragmented transport economy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROBLEMS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="glass-card rounded-2xl p-6 ring-1 ring-black/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                      <Icon className="size-4 text-brand-light" />
                    </div>
                    <h3 className="font-semibold">{p.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {p.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check className="size-4 text-brand-light mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
            What we're building towards
          </h2>
          <p className="text-muted-foreground mb-10 max-w-[56ch]">
            Our goal is to become the largest mobility marketplace in Africa, seamlessly connecting
            people, vehicles, cargo, parcels and transportation services through innovative
            technology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {OBJECTIVES.map((o) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.copy}
                  className="glass-card rounded-2xl p-5 ring-1 ring-black/20 hover:border-brand/30 transition-colors"
                >
                  <Icon className="size-5 text-brand-light mb-3" />
                  <p className="text-sm text-foreground/85 leading-relaxed">{o.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">How we earn</h2>
          <p className="text-muted-foreground mb-10">
            A marketplace model that keeps the platform running while every participant earns:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVENUE.map((r) => (
              <div key={r.label} className="glass-card rounded-2xl p-5 ring-1 ring-black/20">
                <h3 className="text-sm font-semibold mb-1.5">{r.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 border-t border-white/5 pt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">Built to the law</h2>
          <p className="text-muted-foreground mb-10 max-w-[56ch]">
            Next Town is designed for full compliance with South African law and financial
            regulation.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {COMPLIANCE.map((c) => (
              <span
                key={c}
                className="px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-sm font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-10 ring-1 ring-black/20">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-balance mb-3">
            Your seat. Your journey.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-[42ch] mx-auto">
            Open an account and start moving with the platform built for every South African.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-foreground text-background font-medium py-2.5 px-6 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors"
            >
              Create an account
            </Link>
            <Link
              to="/features"
              className="glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors"
            >
              See the features
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
