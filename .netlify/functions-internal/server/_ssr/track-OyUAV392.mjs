import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { E as QrCode, dt as Check, j as Phone, m as Star, rt as Copy, v as ShieldAlert } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { R as useTriggerSos, j as useReviewBooking, m as useBookings, s as parseRoute, u as useAdvanceBooking, v as useCompleteParcel } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as LiveMap } from "./maps-B71M8okd.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
import { n as ReviewSummary, t as RatingPanel } from "./rating-panel-BHd2jWtu.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track-OyUAV392.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var STAGES = [
	"Matched",
	"Driver en route",
	"Picked up",
	"In transit",
	"Delivered"
];
var DRIVERS = [
	{
		name: "Sipho Ndlovu",
		vehicle: "Toyota Corolla · CA 421-889",
		rating: 4.9
	},
	{
		name: "Lerato Mokoena",
		vehicle: "VW Polo · GP JHB 118-234",
		rating: 4.8
	},
	{
		name: "Ayanda Khumalo",
		vehicle: "Isuzu FTR · ND 552-114",
		rating: 4.7
	}
];
function TrackPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackInner, {}) });
}
function TrackInner() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: bookings = [] } = useBookings(userId);
	const advance = useAdvanceBooking(userId);
	const review = useReviewBooking(userId);
	const pod = useCompleteParcel(userId);
	const sos = useTriggerSos(userId);
	const active = (0, import_react.useMemo)(() => bookings.filter((b) => b.status === "requested" || b.status === "confirmed" || b.status === "in_transit"), [bookings]);
	const recent = (0, import_react.useMemo)(() => bookings.filter((b) => b.status === "completed"), [bookings]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const current = bookings.find((b) => b.id === (selected ?? active[0]?.id)) ?? null;
	const [progress, setProgress] = (0, import_react.useState)(18);
	(0, import_react.useEffect)(() => {
		setProgress(current?.status === "in_transit" ? 62 : 18);
	}, [current?.id, current?.status]);
	(0, import_react.useEffect)(() => {
		if (!current || current.status === "completed" || current.status === "cancelled") return;
		const t = setInterval(() => setProgress((p) => Math.min(96, p + 1)), 1200);
		return () => clearInterval(t);
	}, [current?.id, current?.status]);
	const driver = DRIVERS[(current?.ref.charCodeAt(3) ?? 0) % DRIVERS.length];
	const geo = (0, import_react.useMemo)(() => parseRoute(current?.title ?? "Johannesburg → Pretoria"), [current?.title]);
	const stageIndex = current ? current.status === "completed" ? 4 : current.status === "in_transit" ? 3 : current.status === "confirmed" ? 1 : 0 : 0;
	const eta = Math.max(1, Math.round((100 - progress) / 100 * 42));
	const emergency = user?.emergencyContact || user?.emergencyNumber || "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Live operations",
		title: "Track your trip",
		subtitle: "Milestone updates, live ETA and safety tools for every active booking on your account."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-6 py-14 max-w-6xl mx-auto grid lg:grid-cols-[280px_1fr] gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-widest text-muted-foreground",
					children: "Active"
				}),
				active.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-xl p-4 border border-white/10 text-sm text-muted-foreground",
					children: [
						"Nothing in motion.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/rides",
							className: "text-brand-light",
							children: "Book a ride"
						}),
						"."
					]
				}),
				active.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelected(b.id),
					className: `w-full text-left glass-card rounded-xl p-4 border transition-colors ${current?.id === b.id ? "border-brand/50" : "border-white/10 hover:border-white/20"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-brand-light font-mono",
							children: b.ref
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: b.route
						})
					]
				}, b.id)),
				recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-widest text-muted-foreground pt-4",
					children: "Completed"
				}), recent.slice(0, 4).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelected(b.id),
					className: "w-full text-left glass-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-mono text-muted-foreground",
						children: b.ref
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm",
						children: b.title
					})]
				}, b.id))] })
			]
		}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl border border-white/10 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative border-b border-white/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, {
							from: geo.from,
							to: geo.to,
							labels: geo.labels,
							progress: current.status === "completed" ? 100 : progress,
							height: 280
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-3 left-4 text-xs text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded-md",
							children: [
								"Live map · ",
								geo.labels[0],
								" → ",
								geo.labels[1]
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-mono text-brand-light",
										children: current.ref
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-semibold",
										children: current.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: current.route
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "ETA"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-2xl font-semibold",
										children: current.status === "completed" ? "Arrived" : `${eta} min`
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: current.status === "completed" ? 100 : progress,
								className: "mt-5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-5 gap-2 mt-4 text-[11px]",
								children: STAGES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: i <= stageIndex ? "text-brand-light" : "text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1 rounded-full mb-2 ${i <= stageIndex ? "bg-brand" : "bg-white/10"}` }), s]
								}, s))
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid md:grid-cols-2 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-card rounded-2xl p-6 border border-white/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold mb-4",
								children: "Your operator"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-12 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center text-brand-light font-semibold",
									children: driver.name.charAt(0)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: driver.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: driver.vehicle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-brand-light flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-current" }),
											" ",
											driver.rating,
											" · Verified"
										]
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 mt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => toast("Calling operator…"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), " Call"]
								}), !(current.type === "parcel" && current.status === "in_transit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "bg-brand hover:bg-brand-light text-white",
									disabled: current.status === "completed" || current.status === "cancelled",
									onClick: () => advance.mutate(current.id),
									children: current.type === "parcel" && current.status === "confirmed" ? "Mark picked up" : "Advance status"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted-foreground mt-5",
								children: [
									"Fare ",
									zar(current.price),
									" · paid on completion"
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-card rounded-2xl p-6 border border-white/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold mb-2",
								children: "Safety"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mb-4",
								children: emergency ? `Emergency contact on file: ${emergency}` : "Add an emergency contact in your profile for automatic alerts."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								onClick: () => {
									sos.mutate(current.title);
									toast.error("SOS sent to the HITCH SA safety desk");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" }), " Trigger SOS"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-2 text-sm text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "· Trip shared with your emergency contact" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "· Route deviation alerts active" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "· 24/7 control room escalation" })
								]
							}),
							current.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 border-t border-white/10 pt-4",
								children: current.review ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium mb-3",
									children: "Your review"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewSummary, { review: current.review })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingPanel, {
									busy: review.isPending,
									onSubmit: (r) => {
										review.mutate({
											id: current.id,
											review: r
										});
										toast.success("Review submitted — thank you");
									}
								})
							})
						]
					})]
				}),
				current.type === "parcel" && current.status === "in_transit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelPodCard, {
					booking: current,
					pending: pod.isPending,
					onConfirm: (code) => {
						pod.mutate({
							id: current.id,
							code
						}, {
							onSuccess: () => toast.success("Delivery confirmed — escrow released"),
							onError: (e) => toast.error(e instanceof Error ? e.message : "Invalid OTP")
						});
					}
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "glass-card rounded-2xl p-10 border border-white/10 text-center text-muted-foreground",
			children: "Select or create a booking to see live tracking."
		})]
	})] });
}
/** Deterministic pseudo-QR rendered from the booking id — scan or read the OTP. */
function qrMatrix(seed) {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
	const size = 13;
	const cells = [];
	for (let r = 0; r < size; r++) {
		cells.push([]);
		for (let c = 0; c < size; c++) {
			if (r < 4 && c < 4 || r < 4 && c >= 9 || r >= 9 && c < 4) {
				const rr = r < 4 ? r : r - 9;
				const cc = c < 4 ? c : c - 9;
				cells[r].push(rr === 0 || rr === 3 || cc === 0 || cc === 3);
				continue;
			}
			h = h * 31 + 7 >>> 0;
			cells[r].push((h >>> c % 16) % 2 === 0);
		}
	}
	return cells;
}
function ParcelPodCard({ booking, pending, onConfirm }) {
	const [code, setCode] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const matrix = (0, import_react.useMemo)(() => qrMatrix(booking.id), [booking.id]);
	const copy = async () => {
		try {
			await navigator.clipboard?.writeText(booking.podCode ?? "");
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.info(`POD code: ${booking.podCode}`);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-6 border border-white/10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5 text-brand-light" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Proof of delivery"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid md:grid-cols-[auto_1fr] gap-6 items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl bg-white p-3 w-fit",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-13 gap-[2px]",
					style: { gridTemplateColumns: "repeat(13, minmax(0,1fr))" },
					children: matrix.flatMap((row, r) => row.map((cell, c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2.5", cell ? "bg-slate-900" : "bg-white") }, `${r}-${c}`)))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Hand the courier this code when they deliver. They verify it to release escrow to your courier.",
							" ",
							booking.parcelDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block mt-1 text-xs text-muted-foreground/80",
								children: [
									"Parcel note: “",
									booking.parcelDetails,
									"”"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-2xl font-semibold tracking-[0.3em] text-brand-light",
							children: booking.podCode
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: copy,
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Copied" : "Copy"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: code,
							onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
							placeholder: "Enter courier OTP",
							inputMode: "numeric",
							className: "w-40 h-10 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-brand hover:bg-brand-light text-white",
							disabled: code.length < 6 || pending,
							onClick: () => onConfirm(code),
							children: pending ? "Verifying…" : "Confirm delivery"
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
export { TrackPage as component };
