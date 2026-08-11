import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as FAQS } from "./router-CEW5b3GI.mjs";
import { ut as ChevronDown } from "../_libs/lucide-react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faq-Dd_3VbvF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FaqPage() {
	const [open, setOpen] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "FAQ",
		title: "Answers, straight up.",
		subtitle: "Common questions across all five HITCH verticals. Can't find yours? Support is one tap away."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-6 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-3xl mx-auto space-y-3",
			children: FAQS.map((f, i) => {
				const isOpen = open === i;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl ring-1 ring-black/20 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setOpen(isOpen ? null : i),
						className: "w-full flex items-center justify-between gap-4 px-6 py-5 text-left",
						"aria-expanded": isOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base font-medium text-foreground",
							children: f.q
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}` })]
					}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-6 pb-6 -mt-1 text-sm text-muted-foreground leading-relaxed",
						children: f.a
					})]
				}, f.q);
			})
		})
	})] });
}
//#endregion
export { FaqPage as component };
