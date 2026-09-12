import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, FileCheck2, ShieldCheck, Upload } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { RequireAuth } from "@/components/site/require-auth";
import { KycStatusPill } from "@/components/site/status";
import { useUpdateProfile } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import type { Preferences, VerificationStatus } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & verification — Next Town" },
      {
        name: "description",
        content:
          "Manage your Next Town identity: FICA-aligned KYC verification, driver documents, emergency contacts and notification preferences.",
      },
      { property: "og:title", content: "Profile & verification — Next Town" },
      {
        property: "og:description",
        content: "Complete KYC, upload operator documents and control your safety settings.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const { user, setUser } = useAuth();
  const update = useUpdateProfile();

  const [idNumber, setIdNumber] = useState(user?.kyc.idNumber ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [licence, setLicence] = useState(user?.kyc.licenceNumber ?? "");
  const [contactName, setContactName] = useState(user?.emergencyContact ?? "");
  const [contactNumber, setContactNumber] = useState(user?.emergencyNumber ?? "");
  const [prefs, setPrefs] = useState<Preferences>(
    user?.preferences ?? { push: true, sms: true, email: true, marketing: false },
  );

  if (!user) return null;
  const kyc = user.kyc;

  const overall: VerificationStatus = (() => {
    const s = [kyc.identityStatus, kyc.faceStatus, kyc.phoneStatus];
    if (s.every((v) => v === "verified")) return "verified";
    if (s.some((v) => v === "pending" || v === "rejected")) return "pending";
    return "unverified";
  })();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title={`${user.firstName}'s profile`}
        subtitle="Identity verification, documents and safety preferences — the trust layer behind every Next Town match."
      />
      <section className="px-6 py-14 max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Identity verification (KYC)</h2>
              <KycStatusPill status={overall} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">SA ID / Passport number</Label>
                <Input
                  id="id"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 82 000 0000"
                  className="mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="lic">Driver / operator licence (optional)</Label>
                <Input
                  id="lic"
                  value={licence}
                  onChange={(e) => setLicence(e.target.value)}
                  placeholder="PrDP number"
                  className="mt-2"
                />
              </div>
            </div>
            <Button
              className="mt-6 bg-brand hover:bg-brand-light text-white"
              onClick={() =>
                update.mutate(
                  {
                    id: user.id,
                    phone,
                    kyc: {
                      ...kyc,
                      idNumber,
                      licenceNumber: licence,
                      identityStatus: kyc.identityStatus === "verified" ? "verified" : "pending",
                    },
                  },
                  {
                    onSuccess: (u) => {
                      setUser(u);
                      toast.success("Verification submitted for review");
                    },
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              <ShieldCheck className="size-4" /> Submit for verification
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Documents</h2>
            <div className="space-y-3">
              {kyc.documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <FileCheck2
                      className={`size-4 ${d.uploaded ? "text-brand-light" : "text-muted-foreground"}`}
                    />
                    {d.name}
                  </div>
                  {d.uploaded ? (
                    <span className="text-xs text-brand-light flex items-center gap-1">
                      <BadgeCheck className="size-4" /> Uploaded
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate(
                          {
                            id: user.id,
                            kyc: {
                              ...kyc,
                              documents: kyc.documents.map((doc) =>
                                doc.id === d.id ? { ...doc, uploaded: true } : doc,
                              ),
                            },
                          },
                          {
                            onSuccess: (u) => {
                              setUser(u);
                              toast.success(`${d.name} uploaded`);
                            },
                            onError: (e) => toast.error(e.message),
                          },
                        )
                      }
                    >
                      <Upload className="size-4" /> Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Emergency contact</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="contact-name">Contact name</Label>
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Lerato Mokoena"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="contact-number">Contact number</Label>
                <Input
                  id="contact-number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+27 82 000 0000"
                  className="mt-2"
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() =>
                update.mutate(
                  { id: user.id, emergencyContact: contactName, emergencyNumber: contactNumber },
                  {
                    onSuccess: (u) => {
                      setUser(u);
                      toast.success("Emergency contact saved");
                    },
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              Save contact
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Notifications</h2>
            {(
              [
                ["push", "Trip push alerts"],
                ["sms", "SMS fallback"],
                ["email", "Email receipts"],
                ["marketing", "Product news"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2.5 text-sm">
                <span>{label}</span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(v) => {
                    const next = { ...prefs, [key]: v };
                    setPrefs(next);
                    update.mutate(
                      { id: user.id, preferences: next },
                      { onSuccess: (u) => setUser(u) },
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground mb-2">POPIA</div>
            Your identity documents are encrypted at rest and only shared with counterparties as
            required to complete a trip.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
