import { i as __toESM } from "../_runtime.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as stringType, n as enumType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
import { c as nameSchema, h as useAuth, i as emailSchema, l as passwordSchema, u as phoneSchema } from "./router-CEW5b3GI.mjs";
import { A as Plane, Dt as ArrowRight, Ot as ArrowLeft, W as LoaderCircle, X as GraduationCap, _ as ShieldCheck, a as User, ht as Car, l as Truck, vt as Building2 } from "../_libs/lucide-react.mjs";
import { a as ROLE_TAGLINE, n as REGISTRATION_ROLES, o as SiteNav, s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { t as GuestOnly } from "./require-auth-DX6ZGA79.mjs";
import { a as TextInput, i as PasswordStrength, n as FormError, r as PasswordInput, t as Field } from "./form-BV9rrkyX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-D_KhP-U7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_ICONS = {
	traveler: User,
	driver: Car,
	trucker: Truck,
	airline: Plane,
	school: GraduationCap,
	business: Building2,
	admin: User
};
var schema = objectType({
	role: enumType([
		"traveler",
		"driver",
		"trucker",
		"airline",
		"school",
		"business",
		"admin"
	]),
	firstName: nameSchema,
	lastName: nameSchema,
	idType: enumType(["sa-id", "passport"]),
	idNumber: stringType().optional(),
	email: emailSchema,
	phone: phoneSchema,
	password: passwordSchema,
	confirm: stringType(),
	consent: booleanType().refine((v) => v, "You must accept the Terms and POPIA Notice to continue.")
});
var STEPS = [
	"Join as",
	"Identity",
	"Contact",
	"Security"
];
function RegisterPage() {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const { register, handleSubmit, trigger, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm({
		resolver: u(schema),
		defaultValues: {
			role: "traveler",
			idType: "sa-id",
			consent: false
		}
	});
	const idType = watch("idType");
	const password = watch("password") ?? "";
	async function next() {
		if (step === 0 ? true : step === 1 ? await trigger([
			"firstName",
			"lastName",
			"idType",
			"idNumber"
		]) : step === 2 ? await trigger(["email", "phone"]) : await trigger([
			"password",
			"confirm",
			"consent"
		])) setStep((s) => Math.min(s + 1, 3));
	}
	async function onSubmit(values) {
		try {
			await signUp({
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				phone: values.phone,
				password: values.password,
				role: values.role,
				idType: values.idType,
				idNumber: values.idNumber ?? ""
			});
			navigate({ to: "/verify" });
		} catch (e) {
			setError("root", { message: e instanceof Error ? e.message : "Could not create your account." });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 flex items-center justify-center px-6 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestOnly, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-2xl glass-card rounded-2xl p-8 ring-1 ring-black/20",
				style: { animation: "hitch-fade-up 0.5s ease-out both" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight mb-2",
							children: "Create your account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "One identity for every HITCH vertical — verified, secure, ready to move."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "flex items-center gap-2 mb-8",
						"aria-label": "Registration progress",
						children: STEPS.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("size-7 rounded-full border flex items-center justify-center text-[11px] font-semibold shrink-0", i < step ? "bg-brand border-brand text-white" : i === step ? "border-brand/60 text-brand-light" : "border-white/10 text-muted-foreground"),
									children: i < step ? "✓" : i + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("hidden sm:block text-xs font-medium", i <= step ? "text-foreground" : "text-muted-foreground"),
									children: label
								}),
								i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-white/10" })
							]
						}, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit(onSubmit),
						className: "space-y-5",
						children: [
							step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3",
								children: "I'm joining as"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
								children: REGISTRATION_ROLES.map((r) => {
									const Icon = ROLE_ICONS[r];
									const active = watch("role") === r;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setValue("role", r),
										"aria-pressed": active,
										className: cn("flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs font-medium transition-colors", active ? "border-brand/50 bg-brand/10 text-brand-light" : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
											ROLE_TAGLINE[r].split(" ")[0],
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-normal opacity-70",
												children: ROLE_TAGLINE[r]
											})
										]
									}, r);
								})
							})] }),
							step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "First name",
										htmlFor: "first",
										required: true,
										error: errors.firstName?.message,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											id: "first",
											autoComplete: "given-name",
											placeholder: "Thabo",
											invalid: !!errors.firstName,
											...register("firstName")
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Last name",
										htmlFor: "last",
										required: true,
										error: errors.lastName?.message,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											id: "last",
											autoComplete: "family-name",
											placeholder: "Nkosi",
											invalid: !!errors.lastName,
											...register("lastName")
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2",
										children: "Identity document"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2 mb-4",
										children: ["sa-id", "passport"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setValue("idType", t),
											"aria-pressed": idType === t,
											className: cn("rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors", idType === t ? "border-brand/50 bg-brand/10 text-brand-light" : "border-white/10 text-muted-foreground hover:text-foreground"),
											children: t === "sa-id" ? "South African ID" : "Passport (foreign nationals)"
										}, t))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: idType === "sa-id" ? "SA ID number" : "Passport number",
										htmlFor: "idNumber",
										required: true,
										error: errors.idNumber?.message,
										hint: idType === "sa-id" ? "13 digits — validated in real time against the checksum." : void 0,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											id: "idNumber",
											inputMode: "numeric",
											placeholder: idType === "sa-id" ? "9202205084083" : "P012345678",
											invalid: !!errors.idNumber,
											...register("idNumber")
										})
									})
								] })]
							}),
							step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
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
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Mobile number",
									htmlFor: "phone",
									required: true,
									error: errors.phone?.message,
									hint: "Used for OTP verification and safety alerts.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										id: "phone",
										type: "tel",
										autoComplete: "tel",
										placeholder: "+27 82 000 0000",
										invalid: !!errors.phone,
										...register("phone")
									})
								})]
							}),
							step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Password",
										htmlFor: "password",
										required: true,
										error: errors.password?.message,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											id: "password",
											autoComplete: "new-password",
											placeholder: "At least 12 characters",
											invalid: !!errors.password,
											...register("password")
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordStrength, { value: password }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Confirm password",
										htmlFor: "confirm",
										required: true,
										error: errors.confirm?.message,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											id: "confirm",
											autoComplete: "new-password",
											placeholder: "Repeat your password",
											invalid: !!errors.confirm,
											...register("confirm")
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "accent-brand mt-0.5",
											...register("consent")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"I agree to the",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/legal/terms",
												className: "text-brand-light hover:underline",
												children: "Terms"
											}),
											" ",
											"and the",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/legal/popia",
												className: "text-brand-light hover:underline",
												children: "POPIA Notice"
											}),
											". My identity document will be verified and encrypted."
										] })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormError, { message: errors.root?.message }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between pt-2",
								children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									onClick: () => setStep((s) => s - 1),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									onClick: next,
									className: "bg-brand hover:bg-brand-light text-white rounded-lg",
									children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: isSubmitting,
									className: "bg-brand hover:bg-brand-light text-white rounded-lg",
									children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Creating account…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Create account"] })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-8 text-center text-sm text-muted-foreground",
						children: [
							"Already have an account?",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-brand-light hover:underline",
								children: "Sign in"
							})
						]
					})
				]
			}) })
		})]
	});
}
//#endregion
export { RegisterPage as component };
