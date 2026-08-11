import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar } from "./router-CEW5b3GI.mjs";
import { n as routeFare, t as OperatorConsole } from "./route-fare-DffHaKgu.mjs";
import { t as OperatorListings } from "./operator-listings-yH7AVEQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/truck-DTlXNZGm.js
var import_jsx_runtime = require_jsx_runtime();
var fare = routeFare(14, 650);
function TruckConsolePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorConsole, {
		config: {
			eyebrow: "Freight network",
			consoleTitle: "Trucker console",
			consoleSub: "Never drive empty — accept return-loads and get paid.",
			onlineStatus: "Online · accepting loads",
			waitingTitle: "Scanning for return-loads…",
			waitingSub: "High tonnage available on this corridor — expect a load shortly.",
			offerBadge: "New return-load request",
			metricJobLabel: "Loads",
			phaseToPickup: "Driving to pickup",
			phaseInTransit: "Hauling freight",
			ctaStart: "Loaded — start haul",
			ctaComplete: "Complete delivery",
			completeTitle: (p) => `${zar(p)} earned`,
			completeSub: () => "Paid out Friday 08:00 after the 12% platform fee.",
			requests: [
				{
					client: "SAB Logistics",
					rating: 4.9,
					pickup: "Johannesburg",
					dropoff: "Durban",
					detail: "22 t palletised",
					note: "Dock 4 · tail lift required · 2 stops"
				},
				{
					client: "Bidfreight",
					rating: 4.8,
					pickup: "Midrand",
					dropoff: "Cape Town",
					detail: "18 t container",
					note: "Full container · sealed · weighbridge pass"
				},
				{
					client: "Unitrans",
					rating: 4.7,
					pickup: "Pretoria",
					dropoff: "Polokwane",
					detail: "14 t steel",
					note: "Tarpaulin available if raining"
				},
				{
					client: "Chep",
					rating: 5,
					pickup: "Bloemfontein",
					dropoff: "Port Elizabeth",
					detail: "26 t pallets",
					note: "Pallets on ground · 2 forklifts on site"
				}
			],
			initialEarnings: 8400,
			initialJobs: 4,
			weekData: [
				4100,
				6200,
				5600,
				8400,
				7100,
				9400,
				1200
			],
			fareFor: fare,
			payoutRatio: .88,
			pickupSub: () => "2.4 km from yard"
		},
		sidebarExtra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorListings, {
			title: "My freight listings",
			subtitle: "Sell return-load capacity you'll haul later.",
			markets: ["freight"],
			postCta: "Post a return-load",
			capacityLabel: "Load & tonnage",
			priceLabel: "Rate (ZAR)",
			tags: ["Verified operator", "Return-load"]
		})
	});
}
//#endregion
export { TruckConsolePage as component };
