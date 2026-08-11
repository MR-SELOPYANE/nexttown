import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAuth } from "@/lib/store/auth-context";
import { ROLE_SHORT } from "@/lib/domain/roles";
import { GUEST_NAV, MARKET_NAV, ROLE_NAV, isAccountLink } from "@/lib/domain/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteNav() {
  const [dropdown, setDropdown] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const nav = user ? ROLE_NAV[user.role] : GUEST_NAV;
  const primaryLinks = nav.filter((l) => !isAccountLink(l));
  const accountLinks = nav.filter((l) => isAccountLink(l));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link to="/" className="text-brand-light font-semibold tracking-tight text-xl shrink-0">
            HITCH<span className="text-foreground">SA</span>
          </Link>
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <div
              className="relative"
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
            >
              <button
                aria-haspopup="true"
                aria-expanded={dropdown}
                className="flex items-center gap-1 hover:text-foreground transition-colors py-2"
              >
                Marketplace
                <ChevronDown className="size-3.5" />
              </button>
              {dropdown && (
                <div className="absolute top-full left-0 pt-2 w-72">
                  <div className="glass-card rounded-xl p-2 ring-1 ring-black/20 border border-white/10">
                    {MARKET_NAV.map((m) => {
                      const Icon = m.icon;
                      return (
                        <Link
                          key={m.to}
                          to={m.to}
                          onClick={() => setDropdown(false)}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="mt-0.5 size-8 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{m.label}</div>
                            <div className="text-xs text-muted-foreground">{m.blurb}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {primaryLinks.map((n) => (
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

        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden xl:inline text-[10px] font-semibold uppercase tracking-widest text-brand-light px-2.5 py-1 rounded-full border border-brand/30 bg-brand/10">
                {ROLE_SHORT[user.role]}
              </span>
              {accountLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeProps={{ className: "text-foreground" }}
                  className="hidden md:inline text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-2 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
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
            </div>
          )}
          <Sheet open={mobile} onOpenChange={setMobile}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="border-b border-white/10 px-5 py-4">
                <SheetTitle className="text-left">
                  <span className="text-brand-light font-semibold tracking-tight text-xl">
                    HITCH<span className="text-foreground">SA</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="px-5 py-4 overflow-y-auto h-full">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Marketplace
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {MARKET_NAV.map((m) => {
                    const Icon = m.icon;
                    return (
                      <SheetClose asChild key={m.to}>
                        <Link
                          to={m.to}
                          className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-brand/40 transition-colors"
                        >
                          <Icon className="size-4 text-brand-light" />
                          <span className="text-xs font-medium">{m.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
                {user ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {ROLE_SHORT[user.role]} console
                    </div>
                    <div className="space-y-1 mb-5">
                      {nav.map((l) => (
                        <SheetClose asChild key={l.to}>
                          <Link
                            to={l.to}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                          >
                            <l.icon className="size-4" /> {l.label}
                          </Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild>
                        <Link
                          to="/profile"
                          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                        >
                          Profile &amp; verification
                        </Link>
                      </SheetClose>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        setMobile(false);
                        await signOut();
                        navigate({ to: "/" });
                      }}
                    >
                      <X className="size-4" /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Explore
                    </div>
                    <div className="space-y-1 mb-5">
                      {nav.map((n) => (
                        <SheetClose asChild key={n.to}>
                          <Link
                            to={n.to}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                          >
                            <n.icon className="size-4" /> {n.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link
                          to="/login"
                          className="rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium hover:bg-white/5"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/register"
                          className="rounded-lg bg-brand hover:bg-brand-light py-2.5 text-center text-sm font-medium text-white ring-1 ring-brand/50"
                        >
                          Create account
                        </Link>
                      </SheetClose>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
