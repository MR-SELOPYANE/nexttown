import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
import { h as useAuth, i as emailSchema } from "./router-CEW5b3GI.mjs";
import { W as LoaderCircle } from "../_libs/lucide-react.mjs";
import { o as SiteNav, r as ROLE_HOME, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { t as GuestOnly } from "./require-auth-DX6ZGA79.mjs";
import { a as TextInput, n as FormError, r as PasswordInput, t as Field } from "./form-BV9rrkyX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-2fuMxFO5.js
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	email: emailSchema,
	password: stringType().min(1, "Password is required")
});
function LoginPage() {
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: u(schema) });
	async function onSubmit(values) {
		try {
			const u = await signIn(values.email, values.password);
			navigate({ to: ROLE_HOME[u.role] });
		} catch (e) {
			setError("root", { message: e instanceof Error ? e.message : "Could not sign you in." });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 flex items-center justify-center px-6 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestOnly, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md glass-card rounded-2xl p-8 ring-1 ring-black/20",
				style: { animation: "hitch-fade-up 0.5s ease-out both" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight mb-2",
							children: "Welcome back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Sign in to keep moving in one direction."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit(onSubmit),
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email",
								htmlFor: "email",
								required: true,
								error: errors.email?.message,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "email",
									type: "email",
									autoComplete: "email",
									placeholder: "you@hitch.sa",
									invalid: !!errors.email,
									...register("email")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Password",
								htmlFor: "password",
								required: true,
								error: errors.password?.message,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									id: "password",
									autoComplete: "current-password",
									placeholder: "Enter your password",
									invalid: !!errors.password,
									...register("password")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/forgot-password",
									className: "text-xs text-brand-light hover:underline",
									children: "Forgot password?"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormError, { message: errors.root?.message }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: isSubmitting,
								className: "w-full bg-brand hover:bg-brand-light text-white h-11 rounded-lg",
								children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Signing in…"] }) : "Sign in"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-white/10" }),
							"or",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-white/10" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-foreground",
								children: "Demo accounts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "traveler@hitch.sa · driver@hitch.sa · trucker@hitch.sa · airline@hitch.sa · school@hitch.sa · business@hitch.sa · admin@hitch.sa" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[11px]",
								children: "password: Hitch#2026"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-8 text-center text-sm text-muted-foreground",
						children: [
							"No account yet?",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								className: "text-brand-light hover:underline",
								children: "Create one"
							})
						]
					})
				]
			}) })
		})]
	});
}
//#endregion
export { LoginPage as component };
