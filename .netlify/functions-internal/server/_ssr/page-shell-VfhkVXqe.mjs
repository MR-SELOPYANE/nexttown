import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { lt as ChevronLeft } from "../_libs/lucide-react.mjs";
import { o as SiteNav } from "./site-nav-B0JMzhV9.mjs";
import { n as SiteFooter, t as ComplianceStrip } from "./compliance-strip-DCoN_Tqx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-shell-VfhkVXqe.js
var import_jsx_runtime = require_jsx_runtime();
function PageShell({ children, showCompliance = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children
			}),
			showCompliance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComplianceStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function PageHeader({ eyebrow, title, subtitle, backTo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative px-6 pt-20 pb-16 border-b border-white/5 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "absolute inset-0 -z-10 opacity-60",
			style: { background: "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 20%, transparent) 0%, transparent 70%)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl mx-auto text-center",
			children: [
				backTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: backTo,
					className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), " Back"]
				}),
				eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-semibold mb-6",
					children: eyebrow
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl md:text-5xl font-semibold tracking-tight text-balance mb-4",
					children: title
				}),
				subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg text-muted-foreground text-pretty max-w-[60ch] mx-auto",
					children: subtitle
				})
			]
		})]
	});
}
function LegalPageHeader({ eyebrow, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative px-6 pt-20 pb-14 border-b border-white/5 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "absolute inset-0 -z-10 opacity-60",
			style: { background: "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 20%, transparent) 0%, transparent 70%)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl mx-auto text-left",
			children: [eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-brand-light text-xs font-bold uppercase tracking-widest mb-3",
				children: eyebrow
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl md:text-4xl font-semibold tracking-tight",
				children: title
			})]
		})]
	});
}
function LegalBody({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-6 py-14",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-3xl mx-auto prose-sm space-y-6 text-sm leading-relaxed text-foreground/85",
			children
		})
	});
}
//#endregion
export { PageShell as i, LegalPageHeader as n, PageHeader as r, LegalBody as t };
