import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Car,
  GraduationCap,
  Loader2,
  Plane,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { GuestOnly } from "@/components/site/require-auth";
import {
  Field,
  FormError,
  PasswordInput,
  PasswordStrength,
  TextInput,
} from "@/components/site/form";
import {
  emailSchema,
  idNumberSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/domain/validation";
import { useAuth } from "@/lib/store/auth-context";
import { REGISTRATION_ROLES, ROLE_TAGLINE } from "@/lib/domain/roles";
import type { Role } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register — Next Town" },
      { name: "description", content: "Create your Next Town account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ROLE_ICONS: Record<Role, typeof User> = {
  traveler: User,
  driver: Car,
  trucker: Truck,
  airline: Plane,
  school: GraduationCap,
  business: Building2,
  admin: User,
};

const schema = z.object({
  role: z.enum(["traveler", "driver", "trucker", "airline", "school", "business", "admin"]),
  firstName: nameSchema,
  lastName: nameSchema,
  idType: z.enum(["sa-id", "passport"]),
  idNumber: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirm: z.string(),
  consent: z.boolean().refine((v) => v, "You must accept the Terms and POPIA Notice to continue."),
});

type Form = z.infer<typeof schema>;

const STEPS = ["Join as", "Identity", "Contact", "Security"] as const;

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: "traveler", idType: "sa-id", consent: false },
  });

  const idType = watch("idType");
  const password = watch("password") ?? "";

  async function next() {
    const ok =
      step === 0
        ? true
        : step === 1
          ? await trigger(["firstName", "lastName", "idType", "idNumber"])
          : step === 2
            ? await trigger(["email", "phone"])
            : await trigger(["password", "confirm", "consent"]);
    if (ok) setStep((s) => Math.min(s + 1, 3));
  }

  async function onSubmit(values: Form) {
    try {
      await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
        idType: values.idType,
        idNumber: values.idNumber ?? "",
      });
      navigate({ to: "/verify" });
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Could not create your account.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <GuestOnly>
          <div
            className="w-full max-w-2xl glass-card rounded-2xl p-8 ring-1 ring-black/20"
            style={{ animation: "nt-fade-up 0.5s ease-out both" }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                One identity for every vertical — verified, secure, ready to move.
              </p>
            </div>

            {/* Stepper */}
            <ol className="flex items-center gap-2 mb-8" aria-label="Registration progress">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-2 flex-1">
                  <span
                    className={cn(
                      "size-7 rounded-full border flex items-center justify-center text-[11px] font-semibold shrink-0",
                      i < step
                        ? "bg-brand border-brand text-white"
                        : i === step
                          ? "border-brand/60 text-brand-light"
                          : "border-white/10 text-muted-foreground",
                    )}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden sm:block text-xs font-medium",
                      i <= step ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
                </li>
              ))}
            </ol>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {step === 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    I'm joining as
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REGISTRATION_ROLES.map((r) => {
                      const Icon = ROLE_ICONS[r];
                      const active = watch("role") === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setValue("role", r)}
                          aria-pressed={active}
                          className={cn(
                            "flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs font-medium transition-colors",
                            active
                              ? "border-brand/50 bg-brand/10 text-brand-light"
                              : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                          {ROLE_TAGLINE[r].split(" ")[0]}
                          <span className="text-[10px] font-normal opacity-70">
                            {ROLE_TAGLINE[r]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="First name"
                      htmlFor="first"
                      required
                      error={errors.firstName?.message}
                    >
                      <TextInput
                        id="first"
                        autoComplete="given-name"
                        placeholder="Thabo"
                        invalid={!!errors.firstName}
                        {...register("firstName")}
                      />
                    </Field>
                    <Field
                      label="Last name"
                      htmlFor="last"
                      required
                      error={errors.lastName?.message}
                    >
                      <TextInput
                        id="last"
                        autoComplete="family-name"
                        placeholder="Nkosi"
                        invalid={!!errors.lastName}
                        {...register("lastName")}
                      />
                    </Field>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Identity document
                    </span>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {(["sa-id", "passport"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue("idType", t)}
                          aria-pressed={idType === t}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                            idType === t
                              ? "border-brand/50 bg-brand/10 text-brand-light"
                              : "border-white/10 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {t === "sa-id" ? "South African ID" : "Passport (foreign nationals)"}
                        </button>
                      ))}
                    </div>
                    <Field
                      label={idType === "sa-id" ? "SA ID number" : "Passport number"}
                      htmlFor="idNumber"
                      required
                      error={errors.idNumber?.message}
                      hint={
                        idType === "sa-id"
                          ? "13 digits — validated in real time against the checksum."
                          : undefined
                      }
                    >
                      <TextInput
                        id="idNumber"
                        inputMode="numeric"
                        placeholder={idType === "sa-id" ? "9202205084083" : "P012345678"}
                        invalid={!!errors.idNumber}
                        {...register("idNumber")}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
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
                  <Field
                    label="Mobile number"
                    htmlFor="phone"
                    required
                    error={errors.phone?.message}
                    hint="Used for OTP verification and safety alerts."
                  >
                    <TextInput
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+27 82 000 0000"
                      invalid={!!errors.phone}
                      {...register("phone")}
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Field
                    label="Password"
                    htmlFor="password"
                    required
                    error={errors.password?.message}
                  >
                    <PasswordInput
                      id="password"
                      autoComplete="new-password"
                      placeholder="At least 12 characters"
                      invalid={!!errors.password}
                      {...register("password")}
                    />
                  </Field>
                  <PasswordStrength value={password} />
                  <Field
                    label="Confirm password"
                    htmlFor="confirm"
                    required
                    error={errors.confirm?.message}
                  >
                    <PasswordInput
                      id="confirm"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      invalid={!!errors.confirm}
                      {...register("confirm")}
                    />
                  </Field>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="accent-brand mt-0.5"
                      {...register("consent")}
                    />
                    <span>
                      I agree to the{" "}
                      <Link to="/legal/terms" className="text-brand-light hover:underline">
                        Terms
                      </Link>{" "}
                      and the{" "}
                      <Link to="/legal/popia" className="text-brand-light hover:underline">
                        POPIA Notice
                      </Link>
                      . My identity document will be verified and encrypted.
                    </span>
                  </label>
                </div>
              )}

              <FormError message={errors.root?.message} />

              <div className="flex items-center justify-between pt-2">
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={next}
                    className="bg-brand hover:bg-brand-light text-white rounded-lg"
                  >
                    Continue <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand hover:bg-brand-light text-white rounded-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Creating account…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" /> Create account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-light hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </GuestOnly>
      </main>
    </div>
  );
}
