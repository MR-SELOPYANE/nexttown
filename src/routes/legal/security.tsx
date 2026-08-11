import { createFileRoute } from "@tanstack/react-router";
import { PageShell, LegalPageHeader, LegalBody } from "@/components/site/page-shell";

export const Route = createFileRoute("/legal/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "Security — HITCH SA" },
      {
        name: "description",
        content: "How HITCH SA protects your identity, payments and trip data.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SecurityPage() {
  return (
    <PageShell>
      <LegalPageHeader eyebrow="Legal" title="Security" />
      <LegalBody>
        <h2 className="text-lg font-semibold">Last updated: 1 August 2026</h2>
        <p>
          Security is the foundation of trust on HITCH SA. Every ride, parcel, freight load, flight
          seat and school run is backed by identity verification, encrypted data and escrowed
          payments.
        </p>

        <h3 className="font-semibold">1. Identity verification (KYC)</h3>
        <p>
          Every member verifies their identity with an SA ID or passport before operating on the
          platform. Driver and operator profiles require additional checks — a face liveness match,
          driving licence validation and, where relevant, a SAPS criminal-record check before their
          listings go live.
        </p>

        <h3 className="font-semibold">2. Data protection in transit and at rest</h3>
        <p>
          All traffic is encrypted with TLS 1.2+ in transit. Personal information and identity
          documents are encrypted at rest, and access is restricted to the systems and people that
          need it to operate the service. We never store full card numbers — payment details are
          tokenised by PCI-DSS compliant processors.
        </p>

        <h3 className="font-semibold">3. Escrowed payments</h3>
        <p>
          Trip funds are held in escrow at booking and only released to the operator once the trip
          completes. If a trip is cancelled, the held amount is automatically refunded to your
          wallet balance. Payouts settle at 88% of gross after the 12% platform fee.
        </p>

        <h3 className="font-semibold">4. Safety and SOS</h3>
        <p>
          Active trips share live location only with the parties to the trip and our 24/7 safety
          desk. Triggering SOS immediately alerts the safety desk and your designated emergency
          contact, who can follow your location and route. Route-deviation alerts are monitored
          while a trip is active.
        </p>

        <h3 className="font-semibold">5. Account security</h3>
        <p>
          Passwords are stored as salted hashes and never as plain text. Two-factor authentication
          is available on every account and recommended for operators. Suspicious activity on an
          account triggers an automatic hold on bookings until it is reviewed by our trust and
          safety team.
        </p>

        <h3 className="font-semibold">6. Reporting a vulnerability</h3>
        <p>
          Found a security issue? Please report it privately to{" "}
          <span className="font-mono">security@hitch.sa</span> — we acknowledge valid reports, fix
          them promptly and thank responsible researchers.
        </p>

        <h3 className="font-semibold">7. Compliance</h3>
        <p>
          HITCH SA operates in line with POPIA, FICA-aligned verification practices and applicable
          transport regulations in South Africa. Our Information Officer can be reached at{" "}
          <span className="font-mono">privacy@hitch.sa</span>.
        </p>
      </LegalBody>
    </PageShell>
  );
}
