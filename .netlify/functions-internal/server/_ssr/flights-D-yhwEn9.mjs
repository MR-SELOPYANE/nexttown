import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { t as MarketplaceView } from "./marketplace-view-CoqUhO69.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/flights-D-yhwEn9.js
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	type: "flight",
	cta: "Reserve seat",
	noun: "seat",
	resultsNoun: "flights with capacity",
	fromLabel: "From airport",
	fromPlaceholder: "JNB",
	toLabel: "To airport",
	toPlaceholder: "CPT",
	filterLabel: "Class",
	filterOptions: [
		{
			value: "scheduled",
			label: "Scheduled"
		},
		{
			value: "charter",
			label: "Charter empty-leg"
		},
		{
			value: "business jet",
			label: "Business jet"
		}
	],
	searchLabel: "Find seats",
	postCta: "List empty capacity",
	postFromLabel: "Departure",
	postToLabel: "Arrival",
	postCapacityLabel: "Aircraft & seats",
	postPriceLabel: "Rate per seat (ZAR)"
};
function FlightsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Airline & charter marketplace",
		title: "Fill the seats that would fly empty.",
		subtitle: "Last-minute airline and charter capacity across the country — verified operators, transparent pricing."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceView, { config: CONFIG })] });
}
//#endregion
export { FlightsPage as component };
