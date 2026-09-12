import { createFileRoute } from "@tanstack/react-router";
import { LegalPageHeader, LegalBody } from "@/components/site/page-shell";
import { PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — Next Town" },
      {
        name: "description",
        content: "The terms that govern your use of the Next Town marketplace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function TermsPage() {
  return (
    <PageShell>
      <LegalPageHeader eyebrow="Legal" title="Terms of Service" />
      <LegalBody>
        <h2 className="text-lg font-semibold">Last updated: 1 August 2026</h2>
        <p>
          By registering for or using the Next Town marketplace, you agree to these Terms of
          Service. Please read them carefully. If you do not agree, do not use the platform.
        </p>

        <h3 className="font-semibold">1. The marketplace</h3>
        <p>
          Next Town connects travellers, senders and operators across five marketplaces: rides,
          parcels, freight return-loads, empty airline seats and school transport. Next Town is a
          technology platform and does not itself provide transport services.
        </p>

        <h3 className="font-semibold">2. Accounts and eligibility</h3>
        <p>
          You must be at least 18 years old and provide accurate information when registering. You
          are responsible for keeping your login credentials secure. Operators must pass identity,
          document and safety checks before publishing capacity.
        </p>

        <h3 className="font-semibold">3. Payments and escrow</h3>
        <p>
          Payments are held in escrow and released to operators when a booking is completed. The
          platform fee is disclosed before you confirm a booking. Cancellations are refunded as
          described on the wallet page and in your booking terms.
        </p>

        <h3 className="font-semibold">4. Safety and conduct</h3>
        <p>
          You agree to treat other users with respect and to comply with all applicable laws,
          including the National Road Traffic Act. Threatening, fraudulent or unsafe behaviour leads
          to suspension and, where appropriate, referral to the South African Police Service.
        </p>

        <h3 className="font-semibold">5. Ratings and reviews</h3>
        <p>
          Ratings must reflect genuine experiences. Fabricated or retaliatory reviews may be removed
          and can result in account action.
        </p>

        <h3 className="font-semibold">6. Limitation of liability</h3>
        <p>
          To the maximum extent permitted by law, Next Town is not liable for indirect or
          consequential loss arising from your use of the platform. Nothing in these terms limits
          rights you cannot lawfully waive.
        </p>

        <h3 className="font-semibold">7. Changes and termination</h3>
        <p>
          We may update these terms with notice. Either party may end the relationship as required
          by law; if we do, any funds you are owed will be settled to your nominated bank account.
        </p>

        <h3 className="font-semibold">8. Governing law</h3>
        <p>These terms are governed by the laws of the Republic of South Africa.</p>
      </LegalBody>
    </PageShell>
  );
}
