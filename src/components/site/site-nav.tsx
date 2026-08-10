import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Car, Package, Truck, Plane, GraduationCap, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useDemo } from "@/lib/demo-store";

const MARKETS = [
  { to: "/ride", label: "Ride now", icon: Zap, blurb: "Tap-to-ride, upfront fare" },
  { to: "/rides", label: "Rides", icon: Car, blurb: "Metro, airport, intercity" },
  { to: "/parcels", label: "Parcels", icon: Package, blurb: "Same-day peer delivery" },
  { to: "/freight", label: "Freight", icon: Truck, blurb: "Truck return-loads" },
  { to: "/flights", label: "Flights", icon: Plane, blurb: "Empty seats & charter" },
  { to: "/school", label: "School", icon: GraduationCap, blurb: "Vetted daily runs" },
] as const;

const NAV = [
  { to: "/drive", label: "Drive" },
  { to: "/coverage", label: "Coverage" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
] as const;


export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useDemo();
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass-card">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-brand-light font-semibold tracking-tight text-xl"
          >
            HITCH<span className="text-foreground">SA</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <div
              className="relative"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-foreground transition-colors py-2">
                Marketplace
                <ChevronDown className="size-3.5" />
              </button>
              {open && (
                <div className="absolute top-full left-0 pt-2 w-72">
                  <div className="glass-card rounded-xl p-2 ring-1 ring-black/20 border border-white/10">
                    {MARKETS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <Link
                          key={m.to}
                          to={m.to}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="mt-0.5 size-8 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {m.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {m.blurb}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-foreground" }}
                className="hover:text-foreground transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              {(
                [
                  ["/dashboard", "Dashboard"],
                  ["/ride", "Ride"],
                  ["/track", "Track"],
                  ["/wallet", "Wallet"],
                  ["/notifications", "Alerts"],
                  ["/profile", "Profile"],
                ] as const
              ).map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  activeProps={{ className: "text-foreground" }}
                  className="hidden lg:inline text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-2 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={signOut}
                className="text-sm font-medium py-2 px-4 rounded-full glass-card hover:bg-white/5 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-3 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand hover:bg-brand-light text-white text-sm font-medium py-2 px-4 rounded-full transition-colors ring-1 ring-brand/50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
