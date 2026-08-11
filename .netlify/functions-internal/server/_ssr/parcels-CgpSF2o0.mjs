import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { t as MarketplaceView } from "./marketplace-view-CoqUhO69.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parcels-CgpSF2o0.js
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	type: "parcel",
	cta: "Send parcel",
	noun: "courier",
	resultsNoun: "couriers on your route",
	fromLabel: "Collect from",
	fromPlaceholder: "Rosebank, JHB",
	toLabel: "Deliver to",
	toPlaceholder: "Menlyn, PTA",
	filterLabel: "Size",
	filterOptions: [
		{
			value: "doc",
			label: "Documents"
		},
		{
			value: "small",
			label: "Small · ≤ 5 kg"
		},
		{
			value: "medium",
			label: "Medium · ≤ 20 kg"
		},
		{
			value: "large",
			label: "Large · ≤ 50 kg"
		}
	],
	searchLabel: "Find couriers",
	postCta: "Post a delivery",
	postFromLabel: "Pickup",
	postToLabel: "Drop-off",
	postCapacityLabel: "Parcel size",
	postPriceLabel: "Rate (ZAR)"
};
function ParcelsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Parcel marketplace",
		title: "Send with drivers already going your way.",
		subtitle: "Documents, small packages, or bulk boxes — matched with verified drivers travelling your route today."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceView, { config: CONFIG })] });
}
//#endregion
export { ParcelsPage as component };
