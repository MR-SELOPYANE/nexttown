import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { ct as CircleAlert, et as Eye, tt as EyeOff } from "../_libs/lucide-react.mjs";
import { s as cn } from "./site-nav-B0JMzhV9.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as Label } from "./label-xiIfTWYK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/form-BV9rrkyX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function Field({ label, error, hint, htmlFor, required, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor,
				className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
				children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive ml-0.5",
					children: "*"
				})]
			}),
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-1.5 text-xs text-destructive",
				role: "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 shrink-0" }), error]
			}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
var TextInput = (0, import_react.forwardRef)(({ className, invalid, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
	ref,
	"aria-invalid": invalid || void 0,
	className: cn("h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60", invalid && "border-destructive/60 focus-visible:ring-destructive/60", className),
	...props
}));
TextInput.displayName = "TextInput";
var TextArea = (0, import_react.forwardRef)(({ className, invalid, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
	ref,
	"aria-invalid": invalid || void 0,
	className: cn("rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60 min-h-24", invalid && "border-destructive/60", className),
	...props
}));
TextArea.displayName = "TextArea";
var PasswordInput = (0, import_react.forwardRef)(({ className, invalid, ...props }, ref) => {
	const [show, setShow] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			ref,
			type: show ? "text" : "password",
			"aria-invalid": invalid || void 0,
			className: cn("h-10 rounded-lg bg-white/[0.03] border-white/10 pr-10 focus-visible:ring-2 focus-visible:ring-brand/60", invalid && "border-destructive/60", className),
			...props
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setShow((s) => !s),
			"aria-label": show ? "Hide password" : "Show password",
			className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground",
			children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
		})]
	});
});
PasswordInput.displayName = "PasswordInput";
function PasswordStrength({ value }) {
	if (!value) return null;
	const checks = [
		{
			label: "12+ characters",
			ok: value.length >= 12
		},
		{
			label: "Uppercase",
			ok: /[A-Z]/.test(value)
		},
		{
			label: "Lowercase",
			ok: /[a-z]/.test(value)
		},
		{
			label: "Number",
			ok: /[0-9]/.test(value)
		},
		{
			label: "Symbol",
			ok: /[^A-Za-z0-9]/.test(value)
		}
	];
	const passed = checks.filter((c) => c.ok).length;
	const pct = passed / checks.length * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 rounded-full bg-white/10 overflow-hidden",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full transition-all", passed === 5 ? "bg-emerald-500" : passed >= 3 ? "bg-amber-500" : "bg-destructive"),
				style: { width: `${pct}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid grid-cols-2 gap-x-3 gap-y-1",
			children: checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("text-[11px] flex items-center gap-1", c.ok ? "text-brand-light" : "text-muted-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", c.ok ? "bg-brand" : "bg-white/20") }), c.label]
			}, c.label))
		})]
	});
}
function FormError({ message }) {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0" }), message]
	});
}
//#endregion
export { TextInput as a, PasswordStrength as i, FormError as n, PasswordInput as r, Field as t };
