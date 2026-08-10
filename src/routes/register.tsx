import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDemo } from "@/lib/demo-store";
import { useState } from "react";
import { SiteNav } from "@/components/site/site-nav";
import { Eye, EyeOff, Car, Package, Truck, Plane, GraduationCap, User } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register — HITCH SA" },
      { name: "description", content: "Create your HITCH SA account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ROLES = [
  { key: "traveler", icon: User, label: "Traveler" },
  { key: "driver", icon: Car, label: "Driver" },
  { key: "trucker", icon: Truck, label: "Trucker" },
  { key: "parcel", icon: Package, label: "Parcel" },
  { key: "airline", icon: Plane, label: "Airline" },
  { key: "school", icon: GraduationCap, label: "School" },
] as const;

function RegisterPage() {
  const [role, setRole] = useState<(typeof ROLES)[number]["key"]>("traveler");
  const [show, setShow] = useState(false);
  const { signIn } = useDemo();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-xl glass-card rounded-2xl p-8 ring-1 ring-black/20"
          style={{ animation: "hitch-fade-up 0.5s ease-out both" }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              One identity for every HITCH vertical.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              I'm joining as
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-brand/50 bg-brand/10 text-brand-light"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const email = String(f.get("email") || "demo@hitch.sa");
              signIn({
                name: `${f.get("first") ?? "Demo"} ${f.get("last") ?? "User"}`.trim(),
                email,
                role,
              });
              navigate({ to: "/dashboard" });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthField label="First name" name="first" placeholder="Thabo" required />
              <AuthField label="Last name" name="last" placeholder="Nkosi" required />
            </div>
            <AuthField label="Email" name="email" type="email" placeholder="you@hitch.sa" required />
            <AuthField label="Mobile" type="tel" placeholder="+27 82 000 0000" required />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="At least 12 characters"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" required className="accent-brand mt-0.5" />
              <span>
                I agree to the <a href="#" className="text-brand-light hover:underline">Terms</a>{" "}
                and <a href="#" className="text-brand-light hover:underline">POPIA Notice</a>.
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 rounded-lg transition-colors ring-1 ring-brand/50"
            >
              Create account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function AuthField({
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
