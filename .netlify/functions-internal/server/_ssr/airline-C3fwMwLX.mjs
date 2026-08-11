import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar } from "./router-CEW5b3GI.mjs";
import { n as routeFare, t as OperatorConsole } from "./route-fare-DffHaKgu.mjs";
import { t as OperatorListings } from "./operator-listings-yH7AVEQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/airline-C3fwMwLX.js
var import_jsx_runtime = require_jsx_runtime();
var fare = routeFare(240, 900);
function AirlineConsolePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorConsole, {
		config: {
			eyebrow: "Seat marketplace",
			consoleTitle: "Airline console",
			consoleSub: "Sell seats that would otherwise fly empty.",
			onlineStatus: "Online · seats on sale",
			waitingTitle: "Watching for seat requests…",
			waitingSub: "Your scheduled legs are live — demand peaks near 07:00 and 17:00.",
			offerBadge: "New seat request",
			metricJobLabel: "Legs",
			phaseToPickup: "Boarding",
			phaseInTransit: "En route",
			ctaStart: "Doors closed — depart",
			ctaComplete: "Arrived · confirm",
			completeTitle: (p) => `${zar(p)} earned`,
			completeSub: () => "Settles into wallet after the 12% platform fee.",
			requests: [
				{
					client: "Aviatech",
					rating: 4.9,
					pickup: "OR Tambo",
					dropoff: "Cape Town",
					detail: "2 seats · business",
					note: "Charter seat block · lounge access included"
				},
				{
					client: "SkyWings Travel",
					rating: 4.8,
					pickup: "Lanseria",
					dropoff: "Cape Town",
					detail: "1 seat · economy",
					note: "Same-day connection · priority check-in"
				},
				{
					client: "FlyAfrica",
					rating: 4.7,
					pickup: "King Shaka",
					dropoff: "OR Tambo",
					detail: "3 seats · flex",
					note: "Crew repositioning · needs seat row together"
				},
				{
					client: "Mango Charter",
					rating: 5,
					pickup: "OR Tambo",
					dropoff: "Cape Town",
					detail: "4 seats · first",
					note: "VIP group · ground transport on arrival"
				}
			],
			initialEarnings: 48600,
			initialJobs: 6,
			weekData: [
				31e3,
				48600,
				42e3,
				57e3,
				51e3,
				68e3,
				9e3
			],
			fareFor: fare,
			payoutRatio: .88,
			pickupSub: () => "Gate confirmed"
		},
		sidebarExtra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorListings, {
			title: "My seat listings",
			subtitle: "Sell empty seats on scheduled legs.",
			markets: ["flight"],
			postCta: "List empty capacity",
			capacityLabel: "Seats & class",
			priceLabel: "Rate per seat (ZAR)",
			tags: ["Verified operator", "Empty seats"]
		})
	});
}
//#endregion
export { AirlineConsolePage as component };
