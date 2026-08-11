import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { Dt as ArrowRight, H as Locate, U as LocateFixed, g as Shield, ht as Car, i as Users, j as Phone, m as Star, n as X, nt as CreditCard, r as Wallet, st as CircleCheck, z as MapPin } from "../_libs/lucide-react.mjs";
import { E as useNotify, H as useWallet, a as lookupPlace, i as distanceKm, j as useReviewBooking, n as PLACE_SUGGESTIONS, r as SA_PLACES, u as useAdvanceBooking, y as useCreateBooking } from "./queries-Cq7COrxw.mjs";
import { t as LiveMap } from "./maps-B71M8okd.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
import { t as useMyLocation } from "./use-my-location-BCbOXKbn.mjs";
import { t as RatingPanel } from "./rating-panel-BHd2jWtu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ride-now-flow-D4TjGSnM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CLASSES = [
	{
		id: "go",
		name: "HITCH Go",
		blurb: "Affordable everyday sedans",
		seats: 4,
		base: 22,
		perKm: 8.5,
		etaMin: 3
	},
	{
		id: "comfort",
		name: "HITCH Comfort",
		blurb: "Newer cars, top-rated drivers",
		seats: 4,
		base: 30,
		perKm: 11.5,
		etaMin: 5
	},
	{
		id: "xl",
		name: "HITCH XL",
		blurb: "Up to 6 seats, extra luggage",
		seats: 6,
		base: 38,
		perKm: 14,
		etaMin: 7
	}
];
var DRIVERS = [
	{
		name: "Thabo M.",
		car: "VW Polo · Silver",
		plate: "JH 42 KL GP",
		rating: 4.93,
		trips: 2841
	},
	{
		name: "Naledi K.",
		car: "Toyota Corolla · White",
		plate: "CA 118 992",
		rating: 4.88,
		trips: 1520
	},
	{
		name: "Sipho D.",
		car: "Hyundai i20 · Grey",
		plate: "ND 77 210",
		rating: 4.97,
		trips: 3390
	}
];
function RideNowFlow() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: wallet } = useWallet(userId);
	const balance = wallet?.balance ?? 0;
	const createBooking = useCreateBooking(userId);
	const advance = useAdvanceBooking(userId);
	const review = useReviewBooking(userId);
	const notify = useNotify(userId);
	const [pickup, setPickup] = (0, import_react.useState)("Sandton");
	const [dropoff, setDropoff] = (0, import_react.useState)("OR Tambo");
	const [phase, setPhase] = (0, import_react.useState)("plan");
	const [classId, setClassId] = (0, import_react.useState)("go");
	const [payWallet, setPayWallet] = (0, import_react.useState)(true);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [bookingId, setBookingId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [driver] = (0, import_react.useState)(() => DRIVERS[Math.floor(Math.random() * DRIVERS.length)]);
	const location = useMyLocation();
	(0, import_react.useEffect)(() => {
		if (phase === "plan" && location.state.pickup && location.state.status === "ready") setPickup(location.state.pickup);
	}, [phase, location.state]);
	(0, import_react.useEffect)(() => {
		if (location.state.status === "idle") location.locate();
	}, []);
	const from = lookupPlace(pickup) ?? SA_PLACES.sandton;
	const to = lookupPlace(dropoff) ?? SA_PLACES["or tambo"];
	const km = Math.max(2, distanceKm(from, to));
	const quotes = (0, import_react.useMemo)(() => CLASSES.map((c) => ({
		...c,
		fare: Math.round(c.base + c.perKm * km),
		duration: Math.max(6, Math.round(km * 1.6))
	})), [km]);
	const quote = quotes.find((q) => q.id === classId) ?? quotes[0];
	(0, import_react.useEffect)(() => {
		if (phase !== "ontrip") return;
		const t = setInterval(() => {
			setProgress((p) => {
				if (p >= 100) {
					clearInterval(t);
					return 100;
				}
				return p + 2;
			});
		}, 320);
		return () => clearInterval(t);
	}, [phase]);
	(0, import_react.useEffect)(() => {
		if (phase === "ontrip" && progress >= 100) {
			if (bookingId) advance.mutate(bookingId);
			setPhase("done");
		}
	}, [
		progress,
		phase,
		bookingId,
		advance
	]);
	function requestRide() {
		setError(null);
		setPhase("matching");
		createBooking.mutateAsync({
			listingId: "on-demand",
			type: "ride",
			title: `${pickup} → ${dropoff}`,
			route: `${quote.name} · ${km} km · ${quote.duration} min`,
			from: pickup,
			to: dropoff,
			price: quote.fare,
			quantity: 1,
			paidFromWallet: payWallet
		}).then((b) => {
			setBookingId(b.id);
			if (b.status === "requested") advance.mutate(b.id);
			notify.mutate({
				title: `${driver.name} is on the way`,
				body: `${driver.car} · ${driver.plate} · arriving in ${quote.etaMin} min`,
				kind: "trip"
			});
			setPhase("assigned");
		}).catch((err) => {
			setError(err instanceof Error ? err.message : "Something went wrong requesting your ride.");
			setPhase("plan");
		});
	}
	function startTrip() {
		if (bookingId) advance.mutate(bookingId);
		setProgress(0);
		setPhase("ontrip");
	}
	function resetFlow() {
		setPhase("plan");
		setProgress(0);
		setBookingId(null);
		setError(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "max-w-7xl mx-auto px-4 md:px-6 py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative rounded-3xl overflow-hidden ring-1 ring-black/20 glass-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, {
						from,
						to,
						progress: phase === "ontrip" || phase === "done" ? progress : 0,
						height: 560,
						labels: [pickup, dropoff]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-4 left-4 right-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							icon: Shield,
							children: "SAPS-screened drivers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							icon: Locate,
							children: [
								km,
								" km · ",
								quote.duration,
								" min"
							]
						})]
					}),
					phase === "matching" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-16 rounded-full border-2 border-brand/30 border-t-brand animate-spin" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Finding your closest driver…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Matching against ",
									12 + Math.round(km),
									" verified drivers nearby"
								]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "glass-card rounded-3xl ring-1 ring-black/20 p-5 flex flex-col gap-5",
				children: [
					(phase === "plan" || phase === "select") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-semibold tracking-tight",
								children: "Where to?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: "Upfront fare. No surge surprises."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: location.locate,
								disabled: location.state.status === "locating",
								className: "mt-3 inline-flex items-center gap-2 text-xs font-medium text-brand-light border border-brand/30 bg-brand/10 rounded-full px-3 py-1.5 hover:bg-brand/15 disabled:opacity-50 transition-colors",
								children: [location.state.status === "locating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3.5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-3.5" }), location.state.status === "locating" ? "Detecting your location…" : "Use my current location"]
							}),
							location.state.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-destructive mt-2",
								children: location.state.error
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "sa-places",
							children: PLACE_SUGGESTIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: p }, p))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceInput, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-brand" }),
								value: pickup,
								onChange: setPickup,
								placeholder: "Pickup location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceInput, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-amber-400" }),
								value: dropoff,
								onChange: setDropoff,
								placeholder: "Where to?"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: quotes.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setClassId(q.id);
									setPhase("select");
								},
								className: `w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors ${classId === q.id ? "border-brand/50 bg-brand/10" : "border-white/10 hover:bg-white/5"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-semibold",
												children: q.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }), q.seats]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground truncate",
											children: [
												q.blurb,
												" · ",
												q.etaMin,
												" min away"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold tabular-nums",
										children: zar(q.fare)
									})
								]
							}, q.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setPayWallet((v) => !v),
							className: "flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground",
							children: [
								payWallet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" }),
								payWallet ? `HITCH Wallet · ${zar(balance)}` : "Card ending 4821",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto text-brand-light",
									children: "Change"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: requestRide,
							disabled: payWallet && balance < quote.fare,
							className: "mt-auto w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light disabled:opacity-40 text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
							children: [
								"Request ",
								quote.name,
								" · ",
								zar(quote.fare),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
							]
						}),
						payWallet && balance < quote.fare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive -mt-3",
							children: "Wallet balance too low — top up or switch to card."
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive -mt-3",
							children: error
						})
					] }),
					phase === "matching" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex flex-col items-center justify-center gap-3 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-12 rounded-full border-2 border-brand/30 border-t-brand animate-spin" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [
									"Requesting ",
									quote.name,
									"…"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: resetFlow,
								className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }), " Cancel request"]
							})
						]
					}),
					(phase === "assigned" || phase === "ontrip") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-bold uppercase tracking-widest text-brand-light",
							children: phase === "assigned" ? `Arriving in ${quote.etaMin} min` : "On trip"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold tracking-tight mt-1",
							children: phase === "assigned" ? "Your driver is on the way" : `${progress}% of the way`
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-12 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light font-semibold",
									children: driver.name.slice(0, 1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-semibold",
											children: driver.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground truncate",
											children: [
												driver.car,
												" · ",
												driver.plate
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 text-xs text-muted-foreground mt-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-brand text-brand" }),
												driver.rating,
												" · ",
												driver.trips.toLocaleString("en-ZA"),
												" trips"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "tel:+27100000000",
									"aria-label": "Call driver",
									className: "p-2.5 rounded-xl border border-white/10 hover:bg-white/5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 rounded-full bg-white/10 overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-brand transition-all",
								style: { width: `${phase === "ontrip" ? progress : 0}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-3 gap-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									label: "Fare",
									value: zar(quote.fare)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									label: "Distance",
									value: `${km} km`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									label: "ETA",
									value: `${quote.duration} min`
								})
							]
						}),
						phase === "assigned" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: startTrip,
							className: "mt-auto w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
							children: "Driver arrived — start trip"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-auto text-xs text-muted-foreground text-center",
							children: "Live location shared with your emergency contact."
						})
					] }),
					phase === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-8 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-semibold tracking-tight",
									children: "Trip complete"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										pickup,
										" → ",
										dropoff,
										" · ",
										zar(quote.fare)
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingPanel, {
								compact: true,
								busy: review.isPending,
								onSubmit: (r) => {
									if (bookingId) review.mutate({
										id: bookingId,
										review: r
									});
									else notify.mutate({
										title: "Trip complete",
										body: `${pickup} → ${dropoff}`,
										kind: "trip"
									});
								}
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: resetFlow,
								className: "mt-auto w-full bg-brand hover:bg-brand-light text-white text-sm font-semibold py-3.5 rounded-2xl ring-1 ring-brand/50 transition-colors",
								children: "Book another ride"
							})
						]
					})
				]
			})]
		})
	});
}
function PlaceInput({ icon, value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-4 flex items-center justify-center shrink-0",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			list: "sa-places",
			onChange: (e) => onChange(e.target.value),
			placeholder,
			"aria-label": placeholder,
			className: "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
		})]
	});
}
function Badge({ icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full glass-card ring-1 ring-black/20 text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-brand-light" }), children]
	});
}
function Cell({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-white/10 bg-white/[0.03] py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-sm font-semibold tabular-nums",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5",
			children: label
		})]
	});
}
//#endregion
export { RideNowFlow as t };
