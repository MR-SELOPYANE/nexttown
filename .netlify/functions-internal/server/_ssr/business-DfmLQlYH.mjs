import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar } from "./router-CEW5b3GI.mjs";
import { n as routeFare, t as OperatorConsole } from "./route-fare-DffHaKgu.mjs";
import { t as OperatorListings } from "./operator-listings-yH7AVEQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/business-DfmLQlYH.js
var import_jsx_runtime = require_jsx_runtime();
var fare = routeFare(11, 900);
function BusinessConsolePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorConsole, {
		config: {
			eyebrow: "Logistics desk",
			consoleTitle: "Business console",
			consoleSub: "Move staff, cargo and parcels at volume pricing.",
			onlineStatus: "Online · fleet available",
			waitingTitle: "Scanning for consignments…",
			waitingSub: "Volume lanes are active — expect a movement request shortly.",
			offerBadge: "New movement request",
			metricJobLabel: "Jobs",
			phaseToPickup: "Driving to pickup",
			phaseInTransit: "Delivering",
			ctaStart: "Cargo loaded — depart",
			ctaComplete: "Delivered · sign off",
			completeTitle: (p) => `${zar(p)} earned`,
			completeSub: () => "Volume invoice settles monthly · 12% platform fee.",
			requests: [
				{
					client: "Checkers Sixty60",
					rating: 4.9,
					pickup: "Johannesburg",
					dropoff: "Sandton",
					detail: "340 parcels · 2 t",
					note: "Last-mile dispatch · 8 stops"
				},
				{
					client: "Netcare Logistics",
					rating: 4.8,
					pickup: "Pretoria",
					dropoff: "Johannesburg",
					detail: "Cold chain · 1 t",
					note: "Temperature-sensitive · sealed cold chain"
				},
				{
					client: "Steers Group",
					rating: 4.7,
					pickup: "Midrand",
					dropoff: "Polokwane",
					detail: "18 pallets · 9 t",
					note: "Dry goods · dock 2 · returns pick-up"
				},
				{
					client: "Webuycars",
					rating: 5,
					pickup: "Durban",
					dropoff: "Pretoria",
					detail: "Vehicle carrier · 3 units",
					note: "Carrier trailer · insured in-transit"
				}
			],
			initialEarnings: 12600,
			initialJobs: 7,
			weekData: [
				6900,
				8800,
				7600,
				12600,
				9800,
				11800,
				1600
			],
			fareFor: fare,
			payoutRatio: .88,
			pickupSub: () => "1.8 km from depot"
		},
		sidebarExtra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorListings, {
			title: "My logistics listings",
			subtitle: "Advertise cargo capacity on your fleet.",
			markets: ["parcel", "freight"],
			postCta: "Post cargo capacity",
			capacityLabel: "Vehicle & load",
			priceLabel: "Rate (ZAR)",
			tags: ["Verified operator", "Fleet capacity"]
		})
	});
}
//#endregion
export { BusinessConsolePage as component };
