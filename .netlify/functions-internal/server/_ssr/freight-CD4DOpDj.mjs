import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { t as MarketplaceView } from "./marketplace-view-CoqUhO69.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/freight-CD4DOpDj.js
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	type: "freight",
	cta: "Book capacity",
	noun: "operator",
	resultsNoun: "operators available",
	fromLabel: "Origin",
	fromPlaceholder: "Durban port",
	toLabel: "Destination",
	toPlaceholder: "Johannesburg",
	filterLabel: "Load type",
	filterOptions: [
		{
			value: "tautliner",
			label: "Tautliner"
		},
		{
			value: "refrigerated",
			label: "Refrigerated"
		},
		{
			value: "flatbed",
			label: "Flatbed"
		},
		{
			value: "tanker",
			label: "Tanker"
		},
		{
			value: "container",
			label: "Container"
		}
	],
	searchLabel: "Find capacity",
	postCta: "Post a return-load",
	postFromLabel: "Origin",
	postToLabel: "Destination",
	postCapacityLabel: "Trailer & tonnage",
	postPriceLabel: "Load rate (ZAR)"
};
function FreightPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Freight marketplace",
		title: "No more empty return legs.",
		subtitle: "Match your cargo with trucks already routing back — verified operators, live tracking, and end-to-end insurance."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceView, { config: CONFIG })] });
}
//#endregion
export { FreightPage as component };
