import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import {
  Field,
  FormError,
  PasswordInput,
  PasswordStrength,
  TextInput,
} from "@/components/site/form";
import { emailSchema, passwordSchema } from "@/lib/domain/validation";
import { AuthService } from "@/lib/services/auth-service";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — Next Town" },
      { name: "description", content: "Reset your Next Town password." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const emailOnly = z.object({ email: emailSchema });
type EmailForm = z.infer<typeof emailOnly>;

const reset = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });
type ResetForm = z.infer<typeof reset>;

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailOnly) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(reset) });

  async function sendEmail(values: EmailForm) {
    try {
      await AuthService.requestOtp(values.email);
      setEmail(values.email);
      setSent(true);
    } catch (e) {
      emailForm.setError("root", {
        message: e instanceof Error ? e.message : "Could not send the reset email.",
      });
    }
  }

  async function resetPassword(values: ResetForm) {
    try {
      await AuthService.resetPassword(email, values.password);
      setDone(true);
    } catch (e) {
      resetForm.setError("root", {
        message: e instanceof Error ? e.message : "Could not reset the password.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-md glass-card rounded-2xl p-8 ring-1 ring-black/20"
          style={{ animation: "nt-fade-up 0.5s ease-out both" }}
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="size-4" /> Back to login
          </Link>

          {done ? (
            <div className="text-center py-6">
              <MailCheck className="size-12 text-brand mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Password updated</h1>
              <p className="text-sm text-muted-foreground mb-6">
                You can now sign in with your new password.
              </p>
              <Button asChild className="bg-brand hover:bg-brand-light text-white w-full">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          ) : !sent ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we'll send a one-time PIN to reset your password.
              </p>
              <form onSubmit={emailForm.handleSubmit(sendEmail)} className="space-y-4">
                <Field
                  label="Email"
                  htmlFor="email"
                  required
                  error={emailForm.formState.errors.email?.message}
                >
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="you@nexttown.co.za"
                    invalid={!!emailForm.formState.errors.email}
                    {...emailForm.register("email")}
                  />
                </Field>
                <FormError message={emailForm.formState.errors.root?.message} />
                <Button
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  className="w-full bg-brand hover:bg-brand-light text-white h-11"
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send reset PIN"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Choose a new password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Reset PIN sent to <span className="text-foreground">{email}</span>. Demo PIN:{" "}
                <span className="font-mono">482913</span>
              </p>
              <form onSubmit={resetForm.handleSubmit(resetPassword)} className="space-y-4">
                <Field
                  label="New password"
                  htmlFor="pw"
                  required
                  error={resetForm.formState.errors.password?.message}
                >
                  <PasswordInput
                    id="pw"
                    invalid={!!resetForm.formState.errors.password}
                    {...resetForm.register("password")}
                  />
                </Field>
                <PasswordStrength value={resetForm.watch("password") ?? ""} />
                <Field
                  label="Confirm password"
                  htmlFor="confirm"
                  required
                  error={resetForm.formState.errors.confirm?.message}
                >
                  <PasswordInput
                    id="confirm"
                    invalid={!!resetForm.formState.errors.confirm}
                    {...resetForm.register("confirm")}
                  />
                </Field>
                <FormError message={resetForm.formState.errors.root?.message} />
                <Button
                  type="submit"
                  disabled={resetForm.formState.isSubmitting}
                  className="w-full bg-brand hover:bg-brand-light text-white h-11"
                >
                  {resetForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
