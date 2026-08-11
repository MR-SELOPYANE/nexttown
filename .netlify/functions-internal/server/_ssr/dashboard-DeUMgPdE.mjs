import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, v as Navigate, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { Dt as ArrowRight, N as Package, _ as ShieldCheck, ht as Car, l as Truck, m as Star, n as X, r as Wallet, z as MapPin } from "../_libs/lucide-react.mjs";
import { r as ROLE_HOME, s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { r as StatCard, t as BookingStatusPill } from "./status-N0G1dMzr.mjs";
import { i as ListSkeleton, n as ErrorState, t as EmptyState } from "./states-Bg8HgEai.mjs";
import { H as useWallet, O as useRemoveFavourite, S as useFavourites, h as useCancelBooking, m as useBookings, u as useAdvanceBooking } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DeUMgPdE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	ride: Car,
	parcel: Package,
	freight: Truck,
	flight: Car,
	school: Car
};
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardInner, {}) });
}
function DashboardInner() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { data: bookings, isLoading, isError, refetch } = useBookings(user?.id ?? "");
	const { data: wallet } = useWallet(user?.id ?? "");
	const { data: favourites = [] } = useFavourites(user?.id ?? "");
	const removeFavourite = useRemoveFavourite(user?.id ?? "");
	const advance = useAdvanceBooking(user?.id ?? "");
	const cancel = useCancelBooking(user?.id ?? "");
	(0, import_react.useEffect)(() => {
		if (user && user.role !== "traveler") navigate({ to: ROLE_HOME[user.role] });
	}, [user, navigate]);
	if (!user) return null;
	if (user.role !== "traveler") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: ROLE_HOME[user.role] });
	const active = bookings?.filter((b) => !["completed", "cancelled"].includes(b.status)) ?? [];
	const spent = bookings?.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.price, 0) ?? 0;
	const rated = bookings?.filter((b) => b.rating) ?? [];
	const avgRating = rated.length ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1) : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		showCompliance: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: `Traveler · ${user.firstName} ${user.lastName}`,
			title: "Your travel hub",
			subtitle: "Bookings, wallet and verification — everything for your next trip in one place."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-7xl mx-auto px-6 py-10 space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Car,
							label: "Active trips",
							value: String(active.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Wallet,
							label: "Lifetime spend",
							value: zar(spent),
							accent: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: ShieldCheck,
							label: "Wallet balance",
							value: zar(wallet?.balance ?? 0),
							sub: "escrow-ready"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Star,
							label: "Average rating",
							value: avgRating
						})
					]
				}),
				favourites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl p-5 ring-1 ring-black/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-brand-light" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
							children: "Favourite routes"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: favourites.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-1.5 py-1 text-sm hover:border-brand/40 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/rides",
								search: {
									from: f.from,
									to: f.to
								},
								className: "flex items-center gap-1.5 text-muted-foreground hover:text-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-brand-light" }),
									f.from,
									" → ",
									f.to
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": `Remove ${f.from} → ${f.to}`,
								onClick: () => {
									removeFavourite.mutate(f.id);
									toast.success("Favourite removed");
								},
								className: "size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
							})]
						}, f.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-pressed": true,
							className: "text-sm font-medium px-4 py-2 rounded-full border bg-brand/15 border-brand/40 text-brand-light",
							children: "My bookings"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/rides",
						className: "ml-auto inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white text-sm font-medium py-2 px-4 rounded-lg ring-1 ring-brand/50 transition-colors",
						children: ["Book a ride ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetch }) : !bookings || bookings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No bookings yet",
						description: "Your trips, parcels and deliveries will appear here once you book.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-brand hover:bg-brand-light text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/rides",
								children: "Book a ride"
							})
						})
					}) : bookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingRow, {
						booking: b,
						onAdvance: advance.mutate,
						onCancel: cancel.mutate
					}, b.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "glass-card rounded-2xl p-5 ring-1 ring-black/20 max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3",
							children: "Trust & safety"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", user.kyc.identityStatus === "verified" ? "bg-brand" : "bg-amber-400") }),
										"Identity ",
										user.kyc.identityStatus
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", user.kyc.faceStatus === "verified" ? "bg-brand" : "bg-amber-400") }),
										"Face verification ",
										user.kyc.faceStatus
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", user.kyc.phoneStatus === "verified" ? "bg-brand" : "bg-amber-400") }),
										"Phone ",
										user.kyc.phoneStatus
									]
								})
							]
						}),
						user.kyc.identityStatus !== "verified" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/verify",
							className: "mt-4 inline-block text-xs font-semibold text-brand-light underline",
							children: "Complete verification →"
						})
					]
				})
			]
		})]
	});
}
function BookingRow({ booking, onAdvance, onCancel }) {
	const Icon = ICONS[booking.type];
	const actionable = booking.status === "confirmed" || booking.status === "in_transit";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold truncate",
							children: booking.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusPill, { status: booking.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-widest text-muted-foreground",
							children: booking.payment
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: [
						booking.ref,
						" · ",
						booking.route
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-semibold tabular-nums",
				children: zar(booking.price)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [actionable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "bg-brand hover:bg-brand-light text-white",
					onClick: () => onAdvance(booking.id),
					disabled: booking.status === "in_transit",
					children: booking.status === "confirmed" ? "Start trip" : "Complete"
				}), (booking.status === "requested" || booking.status === "confirmed") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => onCancel(booking.id),
					children: "Cancel"
				})]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
