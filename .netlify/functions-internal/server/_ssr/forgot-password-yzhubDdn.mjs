import { i as __toESM } from "../_runtime.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
import { i as emailSchema, l as passwordSchema, t as AuthService } from "./router-CEW5b3GI.mjs";
import { Ot as ArrowLeft, V as MailCheck, W as LoaderCircle } from "../_libs/lucide-react.mjs";
import { o as SiteNav, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { a as TextInput, i as PasswordStrength, n as FormError, r as PasswordInput, t as Field } from "./form-BV9rrkyX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-yzhubDdn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emailOnly = objectType({ email: emailSchema });
var reset = objectType({
	password: passwordSchema,
	confirm: stringType()
}).refine((d) => d.password === d.confirm, {
	path: ["confirm"],
	message: "Passwords do not match."
});
function ForgotPasswordPage() {
	const [sent, setSent] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const emailForm = useForm({ resolver: u(emailOnly) });
	const resetForm = useForm({ resolver: u(reset) });
	async function sendEmail(values) {
		try {
			await AuthService.requestOtp(values.email);
			setEmail(values.email);
			setSent(true);
		} catch (e) {
			emailForm.setError("root", { message: e instanceof Error ? e.message : "Could not send the reset email." });
		}
	}
	async function resetPassword(values) {
		try {
			await AuthService.resetPassword(email, values.password);
			setDone(true);
		} catch (e) {
			resetForm.setError("root", { message: e instanceof Error ? e.message : "Could not reset the password." });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 flex items-center justify-center px-6 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md glass-card rounded-2xl p-8 ring-1 ring-black/20",
				style: { animation: "hitch-fade-up 0.5s ease-out both" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/login",
					className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back to login"]
				}), done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailCheck, { className: "size-12 text-brand mx-auto mb-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-semibold mb-2",
							children: "Password updated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mb-6",
							children: "You can now sign in with your new password."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-brand hover:bg-brand-light text-white w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Sign in"
							})
						})
					]
				}) : !sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight mb-2",
						children: "Forgot password?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mb-6",
						children: "Enter your email and we'll send a one-time PIN to reset your password."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: emailForm.handleSubmit(sendEmail),
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email",
								htmlFor: "email",
								required: true,
								error: emailForm.formState.errors.email?.message,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "email",
									type: "email",
									placeholder: "you@hitch.sa",
									invalid: !!emailForm.formState.errors.email,
									...emailForm.register("email")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormError, { message: emailForm.formState.errors.root?.message }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: emailForm.formState.isSubmitting,
								className: "w-full bg-brand hover:bg-brand-light text-white h-11",
								children: emailForm.formState.isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Sending…"] }) : "Send reset PIN"
							})
						]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight mb-2",
						children: "Choose a new password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mb-6",
						children: [
							"Reset PIN sent to ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: email
							}),
							". Demo PIN:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: "482913"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: resetForm.handleSubmit(resetPassword),
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "New password",
								htmlFor: "pw",
								required: true,
								error: resetForm.formState.errors.password?.message,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									id: "pw",
									invalid: !!resetForm.formState.errors.password,
									...resetForm.register("password")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordStrength, { value: resetForm.watch("password") ?? "" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Confirm password",
								htmlFor: "confirm",
								required: true,
								error: resetForm.formState.errors.confirm?.message,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									id: "confirm",
									invalid: !!resetForm.formState.errors.confirm,
									...resetForm.register("confirm")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormError, { message: resetForm.formState.errors.root?.message }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: resetForm.formState.isSubmitting,
								className: "w-full bg-brand hover:bg-brand-light text-white h-11",
								children: resetForm.formState.isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Updating…"] }) : "Update password"
							})
						]
					})
				] })]
			})
		})]
	});
}
//#endregion
export { ForgotPasswordPage as component };
