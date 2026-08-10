import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site/site-nav";
import { useDemo } from "@/lib/demo-store";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — HITCH SA" },
      { name: "description", content: "Sign in to your HITCH SA account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const { signIn } = useDemo();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-md glass-card rounded-2xl p-8 ring-1 ring-black/20"
          style={{ animation: "hitch-fade-up 0.5s ease-out both" }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to keep moving in one direction.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = String(new FormData(e.currentTarget).get("email") || "demo@hitch.sa");
              signIn({ name: email.split("@")[0] || "Demo user", email, role: "traveler" });
              navigate({ to: "/dashboard" });
            }}
            className="space-y-4"
          >
            <AuthField
              label="Email or phone"
              name="email"
              type="text"
              placeholder="you@hitch.sa"
              required
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <a href="#" className="text-xs text-brand-light hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="••••••••"
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

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="accent-brand" />
              Remember me on this device
            </label>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 rounded-lg transition-colors ring-1 ring-brand/50"
            >
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="glass-card text-sm font-medium py-2.5 rounded-lg hover:bg-white/5 transition-colors">
              Google
            </button>
            <button className="glass-card text-sm font-medium py-2.5 rounded-lg hover:bg-white/5 transition-colors">
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="text-brand-light hover:underline">
              Create one
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
