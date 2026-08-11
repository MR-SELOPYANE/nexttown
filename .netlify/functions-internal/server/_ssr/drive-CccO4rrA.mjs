import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar, g as useDemo } from "./router-CEW5b3GI.mjs";
import { D as Power, P as Navigation, at as Clock, d as TrendingUp, g as Shield, m as Star, n as X, r as Wallet, st as CircleCheck, z as MapPin } from "../_libs/lucide-react.mjs";
import { i as PageShell } from "./page-shell-VfhkVXqe.mjs";
import { a as lookupPlace, i as distanceKm, r as SA_PLACES } from "./queries-Cq7COrxw.mjs";
import { t as LiveMap } from "./maps-B71M8okd.mjs";
import { t as OperatorListings } from "./operator-listings-yH7AVEQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/drive-CccO4rrA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REQUESTS = [
	{
		rider: "Lerato N.",
		rating: 4.9,
		pickup: "Sandton",
		dropoff: "OR Tambo",
		note: "2 bags"
	},
	{
		rider: "Johan V.",
		rating: 4.7,
		pickup: "Rosebank",
		dropoff: "Midrand",
		note: "Corporate wallet"
	},
	{
		rider: "Zanele P.",
		rating: 5,
		pickup: "Centurion",
		dropoff: "Pretoria",
		note: "Airport pickup"
	},
	{
		rider: "Ahmed S.",
		rating: 4.8,
		pickup: "Soweto",
		dropoff: "Johannesburg",
		note: "Cash disabled"
	}
];
function fareFor(from, to) {
	const km = Math.max(2, distanceKm(from, to));
	return {
		km,
		fare: Math.round(22 + km * 8.5),
		mins: Math.max(6, Math.round(km * 1.6))
	};
}
function DrivePage() {
	const { notify } = useDemo();
	const [online, setOnline] = (0, import_react.useState)(false);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [reqIndex, setReqIndex] = (0, import_react.useState)(0);
	const [countdown, setCountdown] = (0, import_react.useState)(15);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [trips, setTrips] = (0, import_react.useState)(6);
	const [earnings, setEarnings] = (0, import_react.useState)(1284);
	const [declines, setDeclines] = (0, import_react.useState)(1);
	const offerTimer = (0, import_react.useRef)(null);
	const req = REQUESTS[reqIndex % REQUESTS.length];
	const from = lookupPlace(req.pickup) ?? SA_PLACES.sandton;
	const to = lookupPlace(req.dropoff) ?? SA_PLACES.pretoria;
	const { km, fare, mins } = fareFor(from, to);
	const payout = Math.round(fare * .88);
	(0, import_react.useEffect)(() => {
		if (!online || phase !== "idle") return;
		offerTimer.current = setTimeout(() => {
			setCountdown(15);
			setPhase("offer");
		}, 2600);
		return () => {
			if (offerTimer.current) clearTimeout(offerTimer.current);
		};
	}, [
		online,
		phase,
		reqIndex
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "offer") return;
		const t = setInterval(() => setCountdown((c) => c - 1), 1e3);
		return () => clearInterval(t);
	}, [phase]);
	(0, import_react.useEffect)(() => {
		if (phase === "offer" && countdown <= 0) declineOffer();
	}, [countdown, phase]);
	(0, import_react.useEffect)(() => {
		if (phase !== "topickup" && phase !== "ontrip") return;
		const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 260);
		return () => clearInterval(t);
	}, [phase]);
	function acceptOffer() {
		setProgress(0);
		setPhase("topickup");
		notify({
			title: `Trip accepted · ${req.pickup} → ${req.dropoff}`,
			body: `${req.rider} is waiting. Payout ${zar(payout)} after platform fee.`,
			kind: "trip"
		});
	}
	function declineOffer() {
		setDeclines((d) => d + 1);
		setReqIndex((i) => i + 1);
		setPhase("idle");
	}
	function completeTrip() {
		setTrips((t) => t + 1);
		setEarnings((e) => e + payout);
		notify({
			title: "Trip completed",
			body: `${zar(payout)} added to today's earnings.`,
			kind: "payment"
		});
		setPhase("complete");
	}
	function backOnline() {
		setReqIndex((i) => i + 1);
		setProgress(0);
		setPhase("idle");
	}
	const acceptance = Math.round(trips / (trips + declines) * 100);
	function toggleOnline() {
		setOnline((v) => {
			const next = !v;
			if (!next) setPhase("idle");
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		showCompliance: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "max-w-7xl mx-auto px-4 md:px-6 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative rounded-3xl overflow-hidden ring-1 ring-black/20 glass-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, {
							from,
							to,
							progress: phase === "ontrip" ? progress : 0,
							height: 560,
							labels: [req.pickup, req.dropoff]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-4 left-4 right-4 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full glass-card ring-1 ring-black/20 ${online ? "text-brand-light" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2 rounded-full ${online ? "bg-brand animate-pulse" : "bg-muted-foreground"}` }), online ? "Online · accepting trips" : "Offline"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: toggleOnline,
								className: `inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors ring-1 ${online ? "glass-card ring-black/20 hover:bg-white/5" : "bg-brand hover:bg-brand-light text-white ring-brand/50"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-4" }), online ? "Go offline" : "Go online"]
							})]
						}),
						online && phase === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-4 left-4 right-4 glass-card rounded-2xl ring-1 ring-black/20 p-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9 rounded-full border-2 border-brand/30 border-t-brand animate-spin shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Waiting for requests…"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "You're in a high-demand zone — expect a trip shortly."
							})] })]
						}),
						phase === "offer" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 bg-background/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-md glass-card rounded-3xl ring-1 ring-brand/30 p-5 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-bold uppercase tracking-widest text-brand-light",
											children: "New trip request"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
												Math.max(0, countdown),
												"s"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1 rounded-full bg-white/10 overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-brand transition-all duration-1000",
											style: { width: `${Math.max(0, countdown) / 15 * 100}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-lg font-semibold",
											children: req.rider
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-brand text-brand" }),
												req.rating,
												" · ",
												req.note
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xl font-semibold tabular-nums",
												children: zar(payout)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground",
												children: "your payout"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-brand" }),
											label: req.pickup,
											sub: "4 min away"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-amber-400" }),
											label: req.dropoff,
											sub: `${km} km · ${mins} min`
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: declineOffer,
											className: "flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-2xl border border-white/10 text-muted-foreground hover:text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Decline"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: acceptOffer,
											className: "flex-[2] bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3 rounded-2xl ring-1 ring-brand/50 transition-colors",
											children: ["Accept · ", zar(payout)]
										})]
									})
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-card rounded-3xl ring-1 ring-black/20 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-semibold tracking-tight",
									children: "Driver console"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground mt-1",
									children: "Accept, navigate and get paid — all from one screen."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2 mt-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											icon: Wallet,
											label: "Today",
											value: zar(earnings)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											icon: TrendingUp,
											label: "Trips",
											value: String(trips)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											icon: Shield,
											label: "Accept",
											value: `${acceptance}%`
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-card rounded-3xl ring-1 ring-black/20 p-5 space-y-4",
							children: [
								phase === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: online ? "You're online. The next request will pop up on the map." : "You're offline. Go online to start receiving trip requests."
								}),
								phase === "offer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Incoming request from ",
										req.rider,
										" — respond on the map."
									]
								}),
								(phase === "topickup" || phase === "ontrip") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-widest text-brand-light",
										children: phase === "topickup" ? "Driving to pickup" : "Trip in progress"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-lg font-semibold",
										children: phase === "topickup" ? req.pickup : `${req.pickup} → ${req.dropoff}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1.5 rounded-full bg-white/10 overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-brand transition-all",
											style: { width: `${progress}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
												icon: Wallet,
												label: "Payout",
												value: zar(payout)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
												icon: Navigation,
												label: "Distance",
												value: `${km} km`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
												icon: Clock,
												label: "ETA",
												value: `${mins} min`
											})
										]
									}),
									phase === "topickup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setProgress(0);
											setPhase("ontrip");
										},
										className: "w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
										children: "Rider on board — start trip"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: completeTrip,
										className: "w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
										children: "Complete trip"
									})
								] }),
								phase === "complete" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-7 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-lg font-semibold",
										children: [zar(payout), " earned"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											req.pickup,
											" → ",
											req.dropoff,
											" · paid out Friday 08:00"
										]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: backOnline,
									className: "w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
									children: "Back online"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-card rounded-3xl ring-1 ring-black/20 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3",
								children: "This week"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end gap-2 h-24",
								children: [
									420,
									860,
									640,
									1180,
									980,
									1284,
									300
								].map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 flex flex-col items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-full rounded-t-md bg-brand/60",
										style: { height: `${v / 1284 * 100}%` }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: [
											"M",
											"T",
											"W",
											"T",
											"F",
											"S",
											"S"
										][i]
									})]
								}, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorListings, {
							title: "Future trips",
							subtitle: "Plan a long trip you'll drive later and sell seats on the marketplace.",
							markets: ["ride"],
							postCta: "Post a future trip",
							capacityLabel: "Seats",
							priceLabel: "Rate per seat (ZAR)",
							tags: ["Driver trip", "Verified driver"]
						})
					]
				})]
			})
		})
	});
}
function Leg({ icon, label, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-4 flex items-center justify-center shrink-0",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-auto text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function Metric({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-white/10 bg-white/[0.03] p-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-brand-light mb-1.5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-semibold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-widest text-muted-foreground",
				children: label
			})
		]
	});
}
//#endregion
export { DrivePage as component };
