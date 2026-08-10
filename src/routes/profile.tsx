import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, FileCheck2, ShieldCheck, Upload } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { useDemo } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & verification — HITCH SA" },
      {
        name: "description",
        content:
          "Manage your HITCH SA identity: FICA-aligned KYC verification, driver documents, emergency contacts and notification preferences.",
      },
      { property: "og:title", content: "Profile & verification — HITCH SA" },
      {
        property: "og:description",
        content: "Complete KYC, upload operator documents and control your safety settings.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, kyc, submitKyc, uploadKycDoc, emergencyContact, setEmergencyContact } = useDemo();
  const [idNumber, setIdNumber] = useState(kyc.idNumber);
  const [phone, setPhone] = useState(kyc.phone);
  const [licence, setLicence] = useState(kyc.licence);
  const [contact, setContact] = useState(emergencyContact);
  const [prefs, setPrefs] = useState({ push: true, sms: true, marketing: false });

  const statusTone =
    kyc.status === "verified"
      ? "bg-brand/15 border-brand/30 text-brand-light"
      : kyc.status === "pending"
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
        : "border-white/10 text-muted-foreground";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title={user ? `${user.name}'s profile` : "Your profile"}
        subtitle="Identity verification, documents and safety preferences — the trust layer behind every HITCH SA match."
      />
      <section className="px-6 py-14 max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Identity verification (KYC)</h2>
              <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusTone}`}>
                {kyc.status}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">SA ID / Passport number</Label>
                <Input id="id" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">Mobile number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 82 000 0000" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="lic">Driver / operator licence (optional)</Label>
                <Input id="lic" value={licence} onChange={(e) => setLicence(e.target.value)} placeholder="PrDP number" className="mt-2" />
              </div>
            </div>
            <Button
              className="mt-6 bg-brand hover:bg-brand-light text-white"
              onClick={() => {
                submitKyc({ idNumber, phone, licence });
                toast.success("Verification submitted for review");
              }}
            >
              <ShieldCheck className="size-4" /> Submit for verification
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Documents</h2>
            <div className="space-y-3">
              {kyc.documents.map((d) => (
                <div
                  key={d.name}
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
                      onClick={() => {
                        uploadKycDoc(d.name);
                        toast.success(`${d.name} uploaded`);
                      }}
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
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Name and number"
            />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setEmergencyContact(contact);
                toast.success("Emergency contact saved");
              }}
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
                ["marketing", "Product news"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2.5 text-sm">
                <span>{label}</span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
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
