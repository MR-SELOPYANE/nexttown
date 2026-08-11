import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { dt as Check } from "../_libs/lucide-react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-DZ3CV_Sc.js
var import_jsx_runtime = require_jsx_runtime();
var TIERS = [
	{
		name: "Individual",
		tag: "Riders, senders, parents",
		price: "Free",
		priceSub: "Pay only per trip",
		features: [
			"All 5 verticals in one app",
			"Wallet, split pay, receipts",
			"Live tracking + SOS",
			"In-app support"
		],
		cta: "Create account",
		href: "/register",
		highlight: false
	},
	{
		name: "Operator",
		tag: "Drivers, truckers, pilots",
		price: "12%",
		priceSub: "Take rate on each completed hitch",
		features: [
			"Instant payouts to your wallet",
			"Driver-level performance dashboard",
			"Recurring trips & schedules",
			"Priority dispatch as you rank up",
			"Fuel and insurance partner rates"
		],
		cta: "Apply to drive",
		href: "/register",
		highlight: true
	},
	{
		name: "Business",
		tag: "SMBs, retailers, schools",
		price: "Custom",
		priceSub: "Volume pricing + enterprise API",
		features: [
			"Central billing & cost centres",
			"SLAs and account manager",
			"API + webhooks",
			"SSO and audit logs",
			"White-label options"
		],
		cta: "Talk to sales",
		href: "/contact",
		highlight: false
	}
];
function PricingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Pricing",
			title: "Simple, transparent pricing.",
			subtitle: "No booking fees for riders. Fair take-rates for operators. Volume pricing for businesses that move at scale."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 py-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5",
				children: TIERS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `glass-card rounded-2xl p-8 ring-1 ring-black/20 flex flex-col ${t.highlight ? "border-brand/40 shadow-2xl shadow-brand/10" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-brand-light text-[10px] font-bold uppercase tracking-widest mb-2",
							children: t.tag
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold mb-4",
							children: t.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-baseline gap-2 mb-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-4xl font-semibold tracking-tight",
								children: t.price
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-6",
							children: t.priceSub
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3 mb-8 flex-1",
							children: t.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3 text-sm text-foreground/80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-brand-light shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
							}, f))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: t.href,
							className: `w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${t.highlight ? "bg-brand hover:bg-brand-light text-white ring-1 ring-brand/50" : "glass-card hover:bg-white/5 text-foreground"}`,
							children: t.cta
						})
					]
				}, t.name))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 pb-24 border-t border-white/5 pt-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-4xl mx-auto text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-medium tracking-tight mb-3",
					children: "No hidden fees, ever."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "What you see is what you pay. Detailed price breakdowns are shown before every hitch — for every party involved."
				})]
			})
		})
	] });
}
//#endregion
export { PricingPage as component };
