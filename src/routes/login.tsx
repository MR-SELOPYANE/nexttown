import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { GuestOnly } from "@/components/site/require-auth";
import { Field, FormError, PasswordInput, TextInput } from "@/components/site/form";
import { emailSchema, passwordSchema } from "@/lib/domain/validation";
import { useAuth } from "@/lib/store/auth-context";
import { ROLE_HOME } from "@/lib/domain/roles";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — Next Town" },
      { name: "description", content: "Sign in to your Next Town account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    try {
      const u = await signIn(values.email, values.password);
      navigate({ to: ROLE_HOME[u.role] });
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Could not sign you in.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <GuestOnly>
          <div
            className="w-full max-w-md glass-card rounded-2xl p-8 ring-1 ring-black/20"
            style={{ animation: "nt-fade-up 0.5s ease-out both" }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to keep moving in one direction.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                <TextInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@nexttown.co.za"
                  invalid={!!errors.email}
                  {...register("email")}
                />
              </Field>
              <Field label="Password" htmlFor="password" required error={errors.password?.message}>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  invalid={!!errors.password}
                  {...register("password")}
                />
              </Field>

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-xs text-brand-light hover:underline">
                  Forgot password?
                </Link>
              </div>

              <FormError message={errors.root?.message} />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand hover:bg-brand-light text-white h-11 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="h-px flex-1 bg-white/10" />
              or
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="text-xs text-muted-foreground space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="font-semibold text-foreground">Demo accounts</p>
              <p>
                traveler@nexttown.co.za · driver@nexttown.co.za · trucker@nexttown.co.za ·
                airline@nexttown.co.za · school@nexttown.co.za · business@nexttown.co.za ·
                admin@nexttown.co.za
              </p>
              <p className="font-mono text-[11px]">password: Hitch#2026</p>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              No account yet?{" "}
              <Link to="/register" className="text-brand-light hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </GuestOnly>
      </main>
    </div>
  );
}
