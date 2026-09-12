import { createFileRoute } from "@tanstack/react-router";
import { LegalPageHeader, LegalBody } from "@/components/site/page-shell";
import { PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Next Town" },
      {
        name: "description",
        content: "How Next Town collects, uses and protects your personal information.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <PageShell>
      <LegalPageHeader eyebrow="Legal" title="Privacy Policy" />
      <LegalBody>
        <h2 className="text-lg font-semibold">Last updated: 1 August 2026</h2>
        <p>
          Next Town NT (Pty) Ltd ("Next Town", "we", "us") is committed to protecting your personal
          information in line with the Protection of Personal Information Act 4 of 2013 (POPIA).
          This policy explains what we collect, why we collect it, and the choices you have.
        </p>

        <h3 className="font-semibold">1. Information we collect</h3>
        <p>
          We collect the information you give us directly: your name, contact details, SA ID or
          passport number (for verification only), driving licence and vehicle details where you
          operate, payment details, and the content of support requests. We also collect technical
          data such as device type, IP address and location data when you travel, book or dispatch.
        </p>

        <h3 className="font-semibold">2. Why we collect it</h3>
        <p>
          We process personal information to deliver the service you asked for — matching trips,
          securing payments, verifying operators, and responding to emergencies. Where we rely on
          consent, we will always make that clear and give you a simple way to withdraw it. We never
          sell your personal information to third parties.
        </p>

        <h3 className="font-semibold">3. Location and trip data</h3>
        <p>
          Live location is shared only with the parties to your trip and with our safety desk while
          a trip is active. Emergency contacts are notified only when you trigger SOS or when our
          safety team determines there is a genuine emergency.
        </p>

        <h3 className="font-semibold">4. Sharing with operators and service providers</h3>
        <p>
          When you book, the operator delivering your service receives the details needed to fulfil
          it. Payment information is handled by PCI-DSS compliant processors; we do not store your
          full card numbers.
        </p>

        <h3 className="font-semibold">5. How long we keep it</h3>
        <p>
          We retain personal information for as long as your account is active and for the period
          required by law afterwards. You may request deletion of your account and your data at any
          time, subject to legal retention obligations.
        </p>

        <h3 className="font-semibold">6. Your rights</h3>
        <p>
          Under POPIA you have the right to access, correct, object to, or request deletion of your
          personal information. To exercise any of these rights, contact our Information Officer at{" "}
          <span className="font-mono">privacy@nexttown.co.za</span>.
        </p>

        <h3 className="font-semibold">7. Changes to this policy</h3>
        <p>
          We may update this policy from time to time. Material changes will be notified in-app and
          by email before they take effect.
        </p>
      </LegalBody>
    </PageShell>
  );
}
