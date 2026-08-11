import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as cn } from "./site-nav-B0JMzhV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-N0G1dMzr.js
var import_jsx_runtime = require_jsx_runtime();
var toneMap = {
	success: "bg-brand/10 text-brand-light border-brand/30",
	warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
	danger: "bg-destructive/10 text-destructive border-destructive/30",
	neutral: "bg-white/5 text-muted-foreground border-white/10",
	info: "bg-sky-500/10 text-sky-400 border-sky-500/30"
};
function StatusPill({ status, tone = "neutral", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border", toneMap[tone]),
		children: [status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" }), children ?? status]
	});
}
var BOOKING_TONE = {
	requested: "info",
	confirmed: "success",
	in_transit: "warning",
	completed: "neutral",
	cancelled: "danger"
};
function BookingStatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		status,
		tone: BOOKING_TONE[status]
	});
}
var TXN_TONE = {
	pending: "warning",
	completed: "success",
	failed: "danger"
};
function TxnStatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		status,
		tone: TXN_TONE[status]
	});
}
var KYC_TONE = {
	unverified: "neutral",
	pending: "warning",
	verified: "success",
	rejected: "danger"
};
function KycStatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		status,
		tone: KYC_TONE[status]
	});
}
function StatCard({ icon: Icon, label, value, sub, accent = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4 mb-3", accent ? "text-brand-light" : "text-muted-foreground") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-semibold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: label
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted-foreground/70 mt-0.5",
				children: sub
			})
		]
	});
}
//#endregion
export { TxnStatusPill as a, StatusPill as i, KycStatusPill as n, StatCard as r, BookingStatusPill as t };
