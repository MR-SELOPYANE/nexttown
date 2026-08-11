import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar } from "./router-CEW5b3GI.mjs";
import { n as routeFare, t as OperatorConsole } from "./route-fare-DffHaKgu.mjs";
import { t as OperatorListings } from "./operator-listings-yH7AVEQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/school-ops-DY7Uxn2X.js
var import_jsx_runtime = require_jsx_runtime();
var fare = routeFare(8, 180);
function SchoolConsolePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorConsole, {
		config: {
			eyebrow: "School routes",
			consoleTitle: "School console",
			consoleSub: "Run verified routes with live parent tracking.",
			onlineStatus: "Online · routes running",
			waitingTitle: "Waiting for route requests…",
			waitingSub: "Morning runs fill by 06:00 — afternoon runs peak at 14:00.",
			offerBadge: "New route request",
			metricJobLabel: "Runs",
			phaseToPickup: "Driving to pickup",
			phaseInTransit: "On the run",
			ctaStart: "All learners on board — depart",
			ctaComplete: "Arrived at school",
			completeTitle: (p) => `${zar(p)} earned`,
			completeSub: () => "Parents notified of arrival · term billing.",
			requests: [
				{
					client: "Parktown Boys",
					rating: 4.9,
					pickup: "Soweto",
					dropoff: "Johannesburg",
					detail: "14 learners",
					note: "AM run · 1 escort · learners on gate list"
				},
				{
					client: "St Mary's School",
					rating: 4.8,
					pickup: "Sandton",
					dropoff: "Johannesburg",
					detail: "9 learners",
					note: "PM run · car seats for 2 younger learners"
				},
				{
					client: "Bryanston High",
					rating: 5,
					pickup: "Midrand",
					dropoff: "Sandton",
					detail: "12 learners",
					note: "Daily contract · updated guardian list"
				},
				{
					client: "Laerskool Menlopark",
					rating: 4.7,
					pickup: "Pretoria",
					dropoff: "Menlyn",
					detail: "8 learners",
					note: "Sport's day — pickup 13:30"
				}
			],
			initialEarnings: 3200,
			initialJobs: 5,
			weekData: [
				2100,
				2600,
				2500,
				3200,
				2900,
				500,
				300
			],
			fareFor: fare,
			payoutRatio: .88,
			pickupSub: () => "3 min away"
		},
		sidebarExtra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorListings, {
			title: "My route listings",
			subtitle: "Publish daily runs parents can book.",
			markets: ["school"],
			postCta: "List a school route",
			capacityLabel: "Learners",
			priceLabel: "Term rate (ZAR)",
			tags: ["Verified operator", "School run"]
		})
	});
}
//#endregion
export { SchoolConsolePage as component };
