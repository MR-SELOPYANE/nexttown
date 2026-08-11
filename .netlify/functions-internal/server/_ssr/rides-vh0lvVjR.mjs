import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { b as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _t as CalendarClock, t as Zap } from "../_libs/lucide-react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { t as MarketplaceView } from "./marketplace-view-CoqUhO69.mjs";
import { t as RideNowFlow } from "./ride-now-flow-D4TjGSnM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rides-vh0lvVjR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	type: "ride",
	cta: "Book ride",
	noun: "ride",
	resultsNoun: "rides matched",
	fromLabel: "Pickup",
	fromPlaceholder: "Sandton, Johannesburg",
	toLabel: "Drop-off",
	toPlaceholder: "OR Tambo Intl.",
	filterLabel: "When",
	filterOptions: [
		{
			value: "now",
			label: "Leave now"
		},
		{
			value: "today",
			label: "Today"
		},
		{
			value: "tomorrow",
			label: "Tomorrow"
		},
		{
			value: "week",
			label: "This week"
		}
	],
	searchLabel: "Search rides",
	postCta: "Offer a ride",
	postFromLabel: "From",
	postToLabel: "To",
	postCapacityLabel: "Vehicle & seats",
	postPriceLabel: "Rate per seat (ZAR)"
};
var MODES = [{
	id: "now",
	icon: Zap,
	label: "Ride now",
	hint: "Instant driver matching"
}, {
	id: "plan",
	icon: CalendarClock,
	label: "Plan ahead",
	hint: "Book a scheduled ride"
}];
function RidesPage() {
	const search = useSearch({ from: "/rides" });
	const [mode, setMode] = (0, import_react.useState)(search.from || search.to ? "plan" : "now");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Rides",
			title: "Now or later — ride your way.",
			subtitle: "Ride now for instant matching with a verified driver, or plan ahead and book a scheduled ride at a fixed rate."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-7xl mx-auto px-6 pt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Ride timing",
				className: "grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl glass-card ring-1 ring-black/20 max-w-md mx-auto",
				children: MODES.map((m) => {
					const Icon = m.icon;
					const active = mode === m.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						role: "tab",
						"aria-selected": active,
						onClick: () => setMode(m.id),
						className: `flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl text-sm transition-colors ${active ? "bg-brand/15 ring-1 ring-brand/40 text-foreground" : "hover:bg-white/5 text-muted-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-brand-light" }), m.label]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-normal",
							children: m.hint
						})]
					}, m.id);
				})
			})
		}),
		mode === "now" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RideNowFlow, {}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceView, { config: CONFIG })
	] });
}
//#endregion
export { RidesPage as component };
