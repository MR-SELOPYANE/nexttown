import { createFileRoute } from "@tanstack/react-router";
import { LegalPageHeader, LegalBody } from "@/components/site/page-shell";
import { PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/legal/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Cookie Policy — HITCH SA" },
      { name: "description", content: "How HITCH SA uses cookies and similar technologies." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CookiesPage() {
  return (
    <PageShell>
      <LegalPageHeader eyebrow="Legal" title="Cookie Policy" />
      <LegalBody>
        <h2 className="text-lg font-semibold">Last updated: 1 August 2026</h2>
        <p>
          This policy explains how HITCH SA uses cookies and similar technologies to keep the
          platform secure, remember your preferences and measure how the service performs.
        </p>

        <h3 className="font-semibold">1. What cookies are</h3>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the
          site remember information about your visit, such as your session and preferences.
        </p>

        <h3 className="font-semibold">2. Cookies we use</h3>
        <p>
          <span className="font-semibold">Essential cookies</span> are required for the platform to
          work — signing in, keeping your session secure and preventing fraud.{" "}
          <span className="font-semibold">Preference cookies</span> remember settings such as your
          region and language. <span className="font-semibold">Analytics cookies</span> (where you
          consent) help us understand which parts of the platform are used so we can improve it.
        </p>

        <h3 className="font-semibold">3. Managing cookies</h3>
        <p>
          You can control cookies in your browser settings. Blocking essential cookies will prevent
          you from using the platform. Consent for non-essential cookies can be withdrawn at any
          time through your browser or the preference centre.
        </p>

        <h3 className="font-semibold">4. Contact</h3>
        <p>
          Questions about this policy can be sent to{" "}
          <span className="font-mono">privacy@hitch.sa</span>.
        </p>
      </LegalBody>
    </PageShell>
  );
}
