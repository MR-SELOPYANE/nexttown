import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { W as LoaderCircle, m as Star } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rating-panel-BHd2jWtu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	{
		key: "safety",
		label: "Safety"
	},
	{
		key: "punctuality",
		label: "Punctuality"
	},
	{
		key: "cleanliness",
		label: "Cleanliness"
	},
	{
		key: "communication",
		label: "Communication"
	}
];
/** BRS §22 — rate a trip across four categories with an optional comment. */
function RatingPanel({ onSubmit, busy = false, compact = false }) {
	const [values, setValues] = (0, import_react.useState)({
		safety: 5,
		punctuality: 5,
		cleanliness: 5,
		communication: 5
	});
	const [comment, setComment] = (0, import_react.useState)("");
	const avg = Math.round((values.safety + values.punctuality + values.cleanliness + values.communication) / 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: "Rate this trip"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 text-sm text-brand-light",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-current" }),
					" ",
					avg,
					"/5"
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 mb-3",
			children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 py-1 border-b border-white/5 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: c.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-0.5",
					children: [
						1,
						2,
						3,
						4,
						5
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `${c.label}: ${n} of 5`,
						onClick: () => setValues((v) => ({
							...v,
							[c.key]: n
						})),
						className: "p-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4 transition-colors", (values[c.key] ?? 0) >= n ? "fill-brand text-brand-light" : "text-muted-foreground/60 hover:text-muted-foreground") })
					}, n))
				})]
			}, c.key))
		}),
		!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			value: comment,
			onChange: (e) => setComment(e.target.value),
			placeholder: "What was the trip like? (optional)",
			rows: 2,
			className: "w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60 mb-3 resize-none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			className: "w-full bg-brand hover:bg-brand-light text-white",
			disabled: busy,
			onClick: () => onSubmit({
				...values,
				comment: comment.trim() || void 0
			}),
			children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Submitting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4" }), " Submit review"] })
		})
	] });
}
/** Read-only summary of an existing four-category review. */
function ReviewSummary({ review }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: c.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-0.5",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", (review[c.key] ?? 0) >= n ? "fill-brand text-brand-light" : "text-muted-foreground/40") }, n))
			})]
		}, c.key)), review.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted-foreground italic pt-1 border-t border-white/10",
			children: [
				"“",
				review.comment,
				"”"
			]
		})]
	});
}
//#endregion
export { ReviewSummary as n, RatingPanel as t };
