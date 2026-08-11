import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell, n as LegalPageHeader, t as LegalBody } from "./page-shell-VfhkVXqe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/security-D3rBTJ4d.js
var import_jsx_runtime = require_jsx_runtime();
function SecurityPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalPageHeader, {
		eyebrow: "Legal",
		title: "Security"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LegalBody, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: "Last updated: 1 August 2026"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Security is the foundation of trust on HITCH SA. Every ride, parcel, freight load, flight seat and school run is backed by identity verification, encrypted data and escrowed payments." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "1. Identity verification (KYC)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Every member verifies their identity with an SA ID or passport before operating on the platform. Driver and operator profiles require additional checks — a face liveness match, driving licence validation and, where relevant, a SAPS criminal-record check before their listings go live." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "2. Data protection in transit and at rest"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "All traffic is encrypted with TLS 1.2+ in transit. Personal information and identity documents are encrypted at rest, and access is restricted to the systems and people that need it to operate the service. We never store full card numbers — payment details are tokenised by PCI-DSS compliant processors." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "3. Escrowed payments"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Trip funds are held in escrow at booking and only released to the operator once the trip completes. If a trip is cancelled, the held amount is automatically refunded to your wallet balance. Payouts settle at 88% of gross after the 12% platform fee." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "4. Safety and SOS"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Active trips share live location only with the parties to the trip and our 24/7 safety desk. Triggering SOS immediately alerts the safety desk and your designated emergency contact, who can follow your location and route. Route-deviation alerts are monitored while a trip is active." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "5. Account security"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Passwords are stored as salted hashes and never as plain text. Two-factor authentication is available on every account and recommended for operators. Suspicious activity on an account triggers an automatic hold on bookings until it is reviewed by our trust and safety team." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "6. Reporting a vulnerability"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			"Found a security issue? Please report it privately to",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono",
				children: "security@hitch.sa"
			}),
			" — we acknowledge valid reports, fix them promptly and thank responsible researchers."
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: "7. Compliance"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			"HITCH SA operates in line with POPIA, FICA-aligned verification practices and applicable transport regulations in South Africa. Our Information Officer can be reached at",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono",
				children: "privacy@hitch.sa"
			}),
			"."
		] })
	] })] });
}
//#endregion
export { SecurityPage as component };
