import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Fingerprint,
  Loader2,
  MessageSquareText,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { Field, TextInput } from "@/components/site/form";
import { KycStatusPill } from "@/components/site/status";
import { useAuth } from "@/lib/store/auth-context";
import { AuthService } from "@/lib/services/auth-service";
import { ROLE_HOME } from "@/lib/domain/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  head: () => ({
    meta: [
      { title: "Verify your identity — HITCH SA" },
      { name: "description", content: "Complete the HITCH SA identity verification steps." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function VerifyPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const uid = user.id;
  const kyc = user.kyc;

  async function run(step: "identity" | "phone" | "face", pin?: string) {
    setWorking(step);
    setError(null);
    try {
      const updated = await AuthService.verifyStep(uid, step, pin);
      setUser(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification step failed.");
    } finally {
      setWorking(null);
    }
  }

  const steps = [
    {
      key: "identity" as const,
      icon: Fingerprint,
      title: "Identity check",
      body: "Your SA ID / passport is validated against the government register.",
      status: kyc.identityStatus,
      cta: "Run ID check",
    },
    {
      key: "phone" as const,
      icon: MessageSquareText,
      title: "Phone verification",
      body: "We send a one-time PIN to your mobile number.",
      status: kyc.phoneStatus,
      cta: "Send OTP",
      input: true,
    },
    {
      key: "face" as const,
      icon: ScanFace,
      title: "Selfie liveness",
      body: "A live selfie is matched to your identity document to prevent fraud.",
      status: kyc.faceStatus,
      cta: "Start selfie scan",
    },
  ];

  const allVerified =
    kyc.identityStatus === "verified" &&
    kyc.phoneStatus === "verified" &&
    kyc.faceStatus === "verified";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg glass-card rounded-2xl p-8 ring-1 ring-black/20">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 size-14 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Verify your identity</h1>
            <p className="text-sm text-muted-foreground">
              Every HITCH SA account clears these checks before it can travel. Most complete in
              under 5 minutes.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              const done = s.status === "verified";
              const pending = s.status === "pending" || working === s.key;
              return (
                <div
                  key={s.key}
                  className={cn(
                    "rounded-2xl border p-4",
                    done ? "border-brand/30 bg-brand/5" : "border-white/10 bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 border",
                        done
                          ? "bg-brand/15 border-brand/30 text-brand-light"
                          : "border-white/10 text-muted-foreground",
                      )}
                    >
                      {done ? <BadgeCheck className="size-5" /> : <Icon className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold">{s.title}</h2>
                        <KycStatusPill status={s.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.body}</p>
                      {s.input && !done && (
                        <div className="mt-3">
                          <Field label="One-time PIN" htmlFor="otp">
                            <TextInput
                              id="otp"
                              inputMode="numeric"
                              maxLength={6}
                              value={code}
                              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="6-digit SMS PIN"
                            />
                          </Field>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Demo SMS PIN: <span className="font-mono">482913</span>
                          </p>
                        </div>
                      )}
                      {!done && (
                        <Button
                          size="sm"
                          variant={pending ? "ghost" : "outline"}
                          className="mt-3"
                          disabled={!!working}
                          onClick={() => run(s.key, s.input ? code : undefined)}
                        >
                          {working === s.key ? (
                            <>
                              <Loader2 className="size-4 animate-spin" /> Checking…
                            </>
                          ) : (
                            s.cta
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="text-xs text-destructive mt-4" role="alert">
              {error}
            </p>
          )}

          {allVerified && (
            <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-center">
              <p className="text-sm font-semibold text-brand-light mb-3">
                Identity verified — you're ready to move.
              </p>
              <Button
                className="bg-brand hover:bg-brand-light text-white w-full"
                onClick={() => navigate({ to: ROLE_HOME[user.role] })}
              >
                Open dashboard
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already verified?{" "}
            <Link to={ROLE_HOME[user.role]} className="text-brand-light hover:underline">
              Skip for now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
