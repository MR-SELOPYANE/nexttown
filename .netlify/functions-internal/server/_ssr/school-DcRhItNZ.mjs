import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { t as MarketplaceView } from "./marketplace-view-CoqUhO69.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/school-DcRhItNZ.js
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	type: "school",
	cta: "Reserve seat",
	noun: "route",
	resultsNoun: "school routes near you",
	fromLabel: "Pickup suburb",
	fromPlaceholder: "Sandringham",
	toLabel: "School",
	toPlaceholder: "St Stithians College",
	filterLabel: "Filter",
	filterOptions: [{
		value: "saps-verified",
		label: "SAPS-verified"
	}, {
		value: "sport",
		label: "Extra-mural"
	}],
	searchLabel: "Find route",
	postCta: "List a school route",
	postFromLabel: "Pickup suburb",
	postToLabel: "School",
	postCapacityLabel: "Vehicle & seats",
	postPriceLabel: "Monthly fee (ZAR)"
};
function SchoolPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "School transport marketplace",
		title: "Safer school runs, every single day.",
		subtitle: "SAPS-screened operators, live GPS tracking, and real-time parent notifications — vetted by HITCH."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceView, { config: CONFIG })] });
}
//#endregion
export { SchoolPage as component };
