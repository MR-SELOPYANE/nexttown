import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { C as Repeat, at as Clock, f as Trash2, gt as CalendarRange, i as Users, m as Star, r as Wallet, t as Zap } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { r as RequireRole } from "./require-auth-DX6ZGA79.mjs";
import { r as StatCard } from "./status-N0G1dMzr.mjs";
import { i as ListSkeleton, n as ErrorState, t as EmptyState } from "./states-Bg8HgEai.mjs";
import { B as useUnsubscribeCommute, D as useRemoveCommutePlan, F as useSubscribeCommute, H as useWallet, S as useFavourites, _ as useCommutePlans, b as useCreateCommutePlan, t as COMMUTE_DAYS_LABEL } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/commute-D4xExbY4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MarketField({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5",
			children: label
		}), children]
	});
}
function MarketInput(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
	});
}
function MarketSelect(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
	});
}
function CommuterView() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: plans = [], isLoading, isError, refetch } = useCommutePlans(userId);
	const { data: wallet } = useWallet(userId);
	const { data: favourites = [] } = useFavourites(userId);
	const create = useCreateCommutePlan(userId);
	const remove = useRemoveCommutePlan(userId);
	const subscribe = useSubscribeCommute(userId);
	const unsubscribe = useUnsubscribeCommute(userId);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("07:30");
	const [days, setDays] = (0, import_react.useState)("weekdays");
	const [weeklyCost, setWeeklyCost] = (0, import_react.useState)(150);
	const [partners, setPartners] = (0, import_react.useState)(1);
	const subscribed = plans.filter((p) => p.subscribed);
	const share = (p) => Math.round(p.weeklyCost / Math.max(1, p.partners));
	const totalShare = plans.reduce((s, p) => s + share(p), 0);
	const balance = wallet?.balance ?? 0;
	const applyFavourite = (f) => {
		setFrom(f.from);
		setTo(f.to);
		toast.success(`Route "${f.label}" loaded`);
	};
	const submit = (e) => {
		e.preventDefault();
		if (!from.trim() || !to.trim()) {
			toast.error("Tell us where you commute from and to.");
			return;
		}
		create.mutate({
			from: from.trim(),
			to: to.trim(),
			time,
			days,
			weeklyCost: Math.max(1, weeklyCost),
			partners: Math.max(1, partners)
		}, {
			onSuccess: () => {
				toast.success("Commute plan saved");
				setFrom("");
				setTo("");
			},
			onError: (err) => toast.error(err.message)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		showCompliance: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Commuter",
			title: "Daily commuting, on a schedule",
			subtitle: "Plan recurring trips, split the cost with carpool partners and let a monthly pass take care of the rest."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-7xl mx-auto px-6 py-10 space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Repeat,
							label: "Plans",
							value: String(plans.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Zap,
							label: "Active passes",
							value: String(subscribed.length),
							accent: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Users,
							label: "Your weekly share",
							value: zar(totalShare)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Wallet,
							label: "Wallet balance",
							value: zar(balance)
						})
					]
				}),
				favourites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl p-5 ring-1 ring-black/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-brand-light" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
							children: "Start from a favourite"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: favourites.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => applyFavourite(f),
							className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:border-brand/40 hover:text-foreground transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 text-brand-light" }),
								f.from,
								" → ",
								f.to
							]
						}, f.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "glass-card rounded-2xl p-5 md:p-6 ring-1 ring-black/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold mb-4",
							children: "New commute plan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "From",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInput, {
										value: from,
										onChange: (e) => setFrom(e.target.value),
										placeholder: "e.g. Mamelodi"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "To",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInput, {
										value: to,
										onChange: (e) => setTo(e.target.value),
										placeholder: "e.g. Sandton CBD"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "Departure time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInput, {
										type: "time",
										value: time,
										onChange: (e) => setTime(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "Days",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketSelect, {
										value: days,
										onChange: (e) => setDays(e.target.value),
										children: Object.entries(COMMUTE_DAYS_LABEL).map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value,
											children: label
										}, value))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "Full fare per week (ZAR)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInput, {
										type: "number",
										min: 1,
										value: weeklyCost,
										onChange: (e) => setWeeklyCost(Number(e.target.value))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketField, {
									label: "Carpool partners (cost split)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInput, {
										type: "number",
										min: 1,
										max: 6,
										value: partners,
										onChange: (e) => setPartners(Number(e.target.value))
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Your weekly share:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-brand-light tabular-nums",
										children: zar(Math.round(weeklyCost / Math.max(1, partners)))
									}),
									partners > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground/70",
										children: [
											" split across ",
											partners,
											" people"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "bg-brand hover:bg-brand-light text-white",
								disabled: create.isPending,
								children: create.isPending ? "Saving…" : "Save plan"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Your plans"
					}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetch }) : plans.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No commute plans yet",
						description: "Save your regular route above and we'll handle the rest."
					}) : plans.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("glass-card rounded-2xl p-5 ring-1 ring-black/20", p.subscribed && "ring-brand/40"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "text-sm font-semibold",
											children: [
												p.from,
												" → ",
												p.to
											]
										}), p.subscribed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-semibold uppercase tracking-widest text-brand-light px-2 py-0.5 rounded-full border border-brand/30 bg-brand/10",
											children: "Monthly pass"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-brand-light" }),
													" ",
													p.time
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { className: "size-3.5 text-brand-light" }),
													" ",
													COMMUTE_DAYS_LABEL[p.days]
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-brand-light" }),
													" ",
													p.partners,
													" people"
												]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-semibold tabular-nums",
										children: [zar(share(p)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground font-normal",
											children: " /wk your share"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground tabular-nums",
										children: [zar(p.weeklyCost), " full fare"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row gap-2",
									children: [p.subscribed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										disabled: unsubscribe.isPending,
										onClick: () => {
											unsubscribe.mutate(p.id);
											toast.success("Pass cancelled");
										},
										children: "Cancel pass"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "bg-brand hover:bg-brand-light text-white",
										disabled: subscribe.isPending,
										onClick: () => {
											const monthly = Math.round(p.weeklyCost * 4.3);
											if (balance < monthly) {
												toast.error(`Wallet needs ${zar(monthly)} for the monthly pass — top up first.`);
												return;
											}
											subscribe.mutate(p.id, {
												onSuccess: () => toast.success(`Monthly pass charged ${zar(monthly)}`),
												onError: (err) => toast.error(err.message)
											});
										},
										children: [
											"Subscribe ",
											zar(Math.round(p.weeklyCost * 4.3)),
											"/mo"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										"aria-label": "Delete plan",
										onClick: () => {
											remove.mutate(p.id);
											toast.success("Plan removed");
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})]
								})
							]
						})
					}, p.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "glass-card rounded-2xl p-5 ring-1 ring-black/20 max-w-3xl text-xs text-muted-foreground space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
							children: "How the pass works"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Subscribing charges one month of your route to the HITCH wallet (weekly fare × 4.3) as a single payment. The pass covers every booked leg on that route for the month — no more paying per trip." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Cost sharing is simple: set your carpool partners and the full fare is split across the group, so your weekly share drops the more people ride along." })
					]
				})
			]
		})]
	});
}
function CommutePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireRole, {
		role: "traveler",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommuterView, {})
	});
}
//#endregion
export { CommutePage as component };
