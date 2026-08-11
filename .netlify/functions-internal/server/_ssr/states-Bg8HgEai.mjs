import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { q as Inbox, u as TriangleAlert, w as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as Button } from "./site-nav-B0JMzhV9.mjs";
import { t as Skeleton } from "./skeleton-D3BesEWt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/states-Bg8HgEai.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ icon: Icon = Inbox, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-10 text-center ring-1 ring-black/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-4 size-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold mb-1",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mx-auto max-w-sm",
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: action
			})
		]
	});
}
function ErrorState({ title = "Something went wrong", description = "We couldn't load this. Check your connection and try again.", onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-10 text-center ring-1 ring-black/20 border-destructive/30",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-4 size-12 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold mb-1",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mx-auto max-w-sm mb-5",
				children: description
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: onRetry,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Try again"]
			})
		]
	});
}
function ListSkeleton({ rows = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-2xl" }, i))
	});
}
function GridSkeleton({ cards = 6 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
		children: Array.from({ length: cards }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 rounded-2xl" }, i))
	});
}
//#endregion
export { ListSkeleton as i, ErrorState as n, GridSkeleton as r, EmptyState as t };
