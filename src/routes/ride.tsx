import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { LiveMap } from "@/components/site/maps";
import { useDemo, zar } from "@/lib/demo-store";
import {
  distanceKm,
  lookupPlace,
  PLACE_SUGGESTIONS,
  SA_PLACES,
  type LatLng,
} from "@/lib/sa-places";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  CreditCard,
  Locate,
  MapPin,
  Phone,
  Shield,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";

export const Route = createFileRoute("/ride")({
  component: RideNowPage,
  head: () => ({
    meta: [
      { title: "Request a ride — HITCH SA" },
      {
        name: "description",
        content:
          "Set pickup and drop-off, pick a ride class and get matched with a verified HITCH SA driver in seconds.",
      },
      { property: "og:title", content: "Request a ride — HITCH SA" },
      {
        property: "og:description",
        content: "Tap-to-ride matching with upfront ZAR fares across South Africa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Phase = "plan" | "select" | "matching" | "assigned" | "ontrip" | "done";

const CLASSES = [
  {
    id: "go",
    name: "HITCH Go",
    blurb: "Affordable everyday sedans",
    seats: 4,
    base: 22,
    perKm: 8.5,
    etaMin: 3,
  },
  {
    id: "comfort",
    name: "HITCH Comfort",
    blurb: "Newer cars, top-rated drivers",
    seats: 4,
    base: 30,
    perKm: 11.5,
    etaMin: 5,
  },
  {
    id: "xl",
    name: "HITCH XL",
    blurb: "Up to 6 seats, extra luggage",
    seats: 6,
    base: 38,
    perKm: 14,
    etaMin: 7,
  },
] as const;

const DRIVERS = [
  { name: "Thabo M.", car: "VW Polo · Silver", plate: "JH 42 KL GP", rating: 4.93, trips: 2841 },
  { name: "Naledi K.", car: "Toyota Corolla · White", plate: "CA 118 992", rating: 4.88, trips: 1520 },
  { name: "Sipho D.", car: "Hyundai i20 · Grey", plate: "ND 77 210", rating: 4.97, trips: 3390 },
];

function RideNowPage() {
  const { addBooking, advanceBooking, rateBooking, payFromWallet, balance, notify } = useDemo();

  const [pickup, setPickup] = useState("Sandton");
  const [dropoff, setDropoff] = useState("OR Tambo");
  const [phase, setPhase] = useState<Phase>("plan");
  const [classId, setClassId] = useState<string>("go");
  const [payWallet, setPayWallet] = useState(true);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [driver] = useState(() => DRIVERS[Math.floor(Math.random() * DRIVERS.length)]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const from: LatLng = lookupPlace(pickup) ?? SA_PLACES.sandton;
  const to: LatLng = lookupPlace(dropoff) ?? SA_PLACES["or tambo"];
  const km = Math.max(2, distanceKm(from, to));

  const quotes = useMemo(
    () =>
      CLASSES.map((c) => ({
        ...c,
        fare: Math.round(c.base + c.perKm * km),
        duration: Math.max(6, Math.round(km * 1.6)),
      })),
    [km],
  );
  const quote = quotes.find((q) => q.id === classId) ?? quotes[0];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (phase !== "ontrip") return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 2;
      });
    }, 320);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "ontrip" && progress >= 100) {
      if (bookingId) advanceBooking(bookingId);
      setPhase("done");
    }
  }, [progress, phase, bookingId, advanceBooking]);

  function requestRide() {
    setPhase("matching");
    const t = setTimeout(() => {
      const b = addBooking({
        type: "ride",
        title: `${pickup} → ${dropoff}`,
        route: `${quote.name} · ${km} km · ${quote.duration} min`,
        price: quote.fare,
        paidWithWallet: payWallet,
      });
      setBookingId(b.id);
      if (payWallet) payFromWallet(quote.fare, `${pickup} → ${dropoff}`);
      notify({
        title: `${driver.name} is on the way`,
        body: `${driver.car} · ${driver.plate} · arriving in ${quote.etaMin} min`,
        kind: "trip",
      });
      setPhase("assigned");
    }, 2400);
    timers.current.push(t);
  }

  function startTrip() {
    if (bookingId) advanceBooking(bookingId);
    setProgress(0);
    setPhase("ontrip");
  }

  function resetFlow() {
    setPhase("plan");
    setProgress(0);
    setRating(0);
    setBookingId(null);
  }

  return (
    <PageShell showCompliance={false}>
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
          <div className="relative rounded-3xl overflow-hidden ring-1 ring-black/20 glass-card">
            <LiveMap
              from={from}
              to={to}
              progress={phase === "ontrip" || phase === "done" ? progress : 0}
              height={560}
              labels={[pickup, dropoff]}
            />
            <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
              <Badge icon={Shield}>SAPS-screened drivers</Badge>
              <Badge icon={Locate}>{km} km · {quote.duration} min</Badge>
            </div>
            {phase === "matching" && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="size-16 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                <p className="text-sm font-medium">Finding your closest driver…</p>
                <p className="text-xs text-muted-foreground">
                  Matching against {12 + Math.round(km)} verified drivers nearby
                </p>
              </div>
            )}
          </div>

          <aside className="glass-card rounded-3xl ring-1 ring-black/20 p-5 flex flex-col gap-5">
            {(phase === "plan" || phase === "select") && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Where to?</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upfront fare. No surge surprises.
                  </p>
                </div>

                <datalist id="sa-places">
                  {PLACE_SUGGESTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
                  <PlaceInput
                    icon={<span className="size-2.5 rounded-full bg-brand" />}
                    value={pickup}
                    onChange={setPickup}
                    placeholder="Pickup location"
                  />
                  <PlaceInput
                    icon={<MapPin className="size-3.5 text-amber-400" />}
                    value={dropoff}
                    onChange={setDropoff}
                    placeholder="Where to?"
                  />
                </div>

                <div className="space-y-2">
                  {quotes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setClassId(q.id);
                        setPhase("select");
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors ${
                        classId === q.id
                          ? "border-brand/50 bg-brand/10"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="size-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0">
                        <Car className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{q.name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Users className="size-3" />
                            {q.seats}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {q.blurb} · {q.etaMin} min away
                        </p>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">{zar(q.fare)}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPayWallet((v) => !v)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {payWallet ? <Wallet className="size-4" /> : <CreditCard className="size-4" />}
                  {payWallet ? `HITCH Wallet · ${zar(balance)}` : "Card ending 4821"}
                  <span className="ml-auto text-brand-light">Change</span>
                </button>

                <button
                  onClick={requestRide}
                  disabled={payWallet && balance < quote.fare}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light disabled:opacity-40 text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                >
                  Request {quote.name} · {zar(quote.fare)}
                  <ArrowRight className="size-4" />
                </button>
                {payWallet && balance < quote.fare && (
                  <p className="text-xs text-destructive -mt-3">
                    Wallet balance too low — top up or switch to card.
                  </p>
                )}
              </>
            )}

            {phase === "matching" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <div className="size-12 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                <p className="text-sm font-medium">Requesting {quote.name}…</p>
                <button
                  onClick={resetFlow}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <X className="size-3" /> Cancel request
                </button>
              </div>
            )}

            {(phase === "assigned" || phase === "ontrip") && (
              <>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                    {phase === "assigned" ? `Arriving in ${quote.etaMin} min` : "On trip"}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight mt-1">
                    {phase === "assigned" ? "Your driver is on the way" : `${progress}% of the way`}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                  <div className="size-12 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light font-semibold">
                    {driver.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{driver.name}</div>
                    <p className="text-xs text-muted-foreground truncate">
                      {driver.car} · {driver.plate}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Star className="size-3 fill-brand text-brand" />
                      {driver.rating} · {driver.trips.toLocaleString("en-ZA")} trips
                    </div>
                  </div>
                  <a
                    href="tel:+27100000000"
                    aria-label="Call driver"
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5"
                  >
                    <Phone className="size-4" />
                  </a>
                </div>

                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${phase === "ontrip" ? progress : 0}%` }}
                  />
                </div>

                <dl className="grid grid-cols-3 gap-2 text-center">
                  <Cell label="Fare" value={zar(quote.fare)} />
                  <Cell label="Distance" value={`${km} km`} />
                  <Cell label="ETA" value={`${quote.duration} min`} />
                </dl>

                {phase === "assigned" ? (
                  <button
                    onClick={startTrip}
                    className="mt-auto w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                  >
                    Driver arrived — start trip
                  </button>
                ) : (
                  <p className="mt-auto text-xs text-muted-foreground text-center">
                    Live location shared with your emergency contact.
                  </p>
                )}
              </>
            )}

            {phase === "done" && (
              <div className="flex-1 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-8 text-brand" />
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Trip complete</h2>
                    <p className="text-sm text-muted-foreground">
                      {pickup} → {dropoff} · {zar(quote.fare)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm mb-2">Rate {driver.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        aria-label={`Rate ${n} stars`}
                        onClick={() => {
                          setRating(n);
                          if (bookingId) rateBooking(bookingId, n);
                        }}
                        className="p-1"
                      >
                        <Star
                          className={`size-7 ${n <= rating ? "fill-brand text-brand" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={resetFlow}
                  className="mt-auto w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors"
                >
                  Book another ride
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function PlaceInput({
  icon,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="size-4 flex items-center justify-center shrink-0">{icon}</span>
      <input
        value={value}
        list="sa-places"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

function Badge({ icon: Icon, children }: { icon: typeof Shield; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full glass-card ring-1 ring-black/20 text-muted-foreground">
      <Icon className="size-3.5 text-brand-light" />
      {children}
    </span>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2.5">
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </dt>
    </div>
  );
}
