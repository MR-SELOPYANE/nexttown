import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as zar, g as useDemo, h as useAuth } from "./router-CEW5b3GI.mjs";
import { M as Pause, O as Plus, S as Route, W as LoaderCircle, _t as CalendarClock, f as Trash2, k as Play } from "../_libs/lucide-react.mjs";
import { I as useToggleListing, k as useRemoveListing, w as useMyListings, x as useCreateListing } from "./queries-Cq7COrxw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operator-listings-yH7AVEQh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OperatorListings({ title, subtitle, markets, postCta, capacityLabel, priceLabel, tags }) {
	const { user } = useAuth();
	const { notify } = useDemo();
	const userId = user?.id ?? "";
	const { data: listings } = useMyListings(userId);
	const createListing = useCreateListing(userId);
	const toggleListing = useToggleListing(userId);
	const removeListing = useRemoveListing(userId);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const mine = listings?.filter((l) => !markets || markets.includes(l.type)).sort((a, b) => b.createdAt - a.createdAt) ?? [];
	async function submit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		const from = String(f.get("from") || "").trim();
		const to = String(f.get("to") || "").trim();
		const when = String(f.get("when") || "").trim();
		const price = Number(f.get("price") || 0);
		const capacity = String(f.get("capacity") || "").trim();
		if (!from || !to) return setError("Origin and destination are required.");
		if (price <= 0) return setError("Enter a valid rate.");
		setSubmitting(true);
		setError(null);
		try {
			await createListing.mutateAsync({
				type: markets?.[0] ?? "ride",
				title: `${from} → ${to}`,
				from,
				to,
				when: when || "Flexible",
				price,
				capacity: capacity || "Flexible",
				tags
			});
			setOpen(false);
			notify({
				title: `Listing published · ${from} → ${to}`,
				body: "Live on the marketplace. Manage it right here.",
				kind: "trip"
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not publish the listing.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-3xl ring-1 ring-black/20 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen((v) => !v),
					"aria-label": postCta,
					className: "inline-flex items-center gap-1 text-xs font-semibold text-brand-light border border-brand/30 bg-brand/10 rounded-full px-2.5 py-1 hover:bg-brand/15 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), " Post"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-4",
				children: subtitle
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3 mb-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "from",
								required: true,
								placeholder: "Johannesburg",
								className: "mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground",
								children: "To"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "to",
								required: true,
								placeholder: "Cape Town",
								className: "mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground",
								children: "When"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "when",
								placeholder: "Fri 21 Aug",
								className: "mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground",
								children: capacityLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "capacity",
								placeholder: "3 seats",
								className: "mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-widest text-muted-foreground",
							children: priceLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "price",
							type: "number",
							min: "0",
							required: true,
							placeholder: "850",
							className: "mt-1 w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60"
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: submitting,
						className: "w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white text-sm font-semibold py-2.5 rounded-xl ring-1 ring-brand/50 transition-colors disabled:opacity-60",
						children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Publish"]
					})
				]
			}),
			mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Nothing listed yet. Post capacity to start earning."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: mine.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/10 bg-white/[0.03] p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-sm font-semibold truncate",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-3.5 text-brand-light shrink-0" }), t.title]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3" }),
									" ",
									t.when,
									" · ",
									t.capacity
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold tabular-nums",
								children: zar(t.price)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest ${t.status === "live" ? "text-brand-light" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${t.status === "live" ? "bg-brand" : "bg-muted-foreground"}` }), t.status]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleListing.mutate(t.id),
							"aria-label": t.status === "live" ? "Pause listing" : "Resume listing",
							className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground",
							children: [t.status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), t.status === "live" ? "Pause" : "Resume"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => removeListing.mutate(t.id),
							"aria-label": "Remove listing",
							className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-white/10 text-muted-foreground hover:text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), " Remove"]
						})]
					})]
				}, t.id))
			})
		]
	});
}
//#endregion
export { OperatorListings as t };
