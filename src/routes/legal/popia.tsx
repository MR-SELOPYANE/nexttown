import { createFileRoute } from "@tanstack/react-router";
import { LegalPageHeader, LegalBody } from "@/components/site/page-shell";
import { PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/legal/popia")({
  component: PopiaPage,
  head: () => ({
    meta: [
      { title: "POPIA Notice — HITCH SA" },
      {
        name: "description",
        content: "How HITCH SA complies with the Protection of Personal Information Act, 2013.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PopiaPage() {
  return (
    <PageShell>
      <LegalPageHeader eyebrow="Legal" title="POPIA Notice" />
      <LegalBody>
        <h2 className="text-lg font-semibold">Last updated: 1 August 2026</h2>
        <p>
          In terms of the Protection of Personal Information Act 4 of 2013 (POPIA), HITCH SA
          Mobility (Pty) Ltd is the responsible party for the personal information processed through
          the HITCH SA platform.
        </p>

        <h3 className="font-semibold">1. Our Information Officer</h3>
        <p>
          Our Information Officer oversees POPIA compliance and data subject requests. Contact:{" "}
          <span className="font-mono">privacy@hitch.sa</span>.
        </p>

        <h3 className="font-semibold">2. What we process and why</h3>
        <p>
          We process identity documents and biometric selfies to verify operators, location data to
          run live trips, and payment data to settle bookings. Every processing purpose is limited
          to what is necessary to deliver the service.
        </p>

        <h3 className="font-semibold">3. Security safeguards</h3>
        <p>
          Personal information is encrypted in transit and at rest. Access is restricted to
          authorised staff, and we conduct regular reviews of our security controls. We are
          committed to reporting any breach to the Information Regulator and affected persons as
          POPIA requires.
        </p>

        <h3 className="font-semibold">4. Data subject rights</h3>
        <p>
          You may request access to, correction of, or deletion of your personal information. You
          may also object to processing and lodge a complaint with the Information Regulator (Reg.
          33 / 2007) at <span className="font-mono">inforeg.org.za</span>.
        </p>

        <h3 className="font-semibold">5. Consent and withdrawal</h3>
        <p>
          Where processing relies on consent — for example marketing — you may withdraw consent at
          any time without affecting the services you receive.
        </p>
      </LegalBody>
    </PageShell>
  );
}
