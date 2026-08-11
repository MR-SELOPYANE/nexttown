import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth, t as AuthService } from "./router-CEW5b3GI.mjs";
import { L as MessageSquareText, Q as FingerprintPattern, W as LoaderCircle, _ as ShieldCheck, wt as BadgeCheck, x as ScanFace } from "../_libs/lucide-react.mjs";
import { o as SiteNav, r as ROLE_HOME, s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { n as KycStatusPill } from "./status-N0G1dMzr.mjs";
import { a as TextInput, t as Field } from "./form-BV9rrkyX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-DpHQ3ZjR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VerifyPage() {
	const { user, setUser } = useAuth();
	const navigate = useNavigate();
	const [code, setCode] = (0, import_react.useState)("");
	const [working, setWorking] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	if (!user) return null;
	const uid = user.id;
	const kyc = user.kyc;
	async function run(step, pin) {
		setWorking(step);
		setError(null);
		try {
			const updated = await AuthService.verifyStep(uid, step, pin);
			setUser(updated);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Verification step failed.");
		} finally {
			setWorking(null);
		}
	}
	const steps = [
		{
			key: "identity",
			icon: FingerprintPattern,
			title: "Identity check",
			body: "Your SA ID / passport is validated against the government register.",
			status: kyc.identityStatus,
			cta: "Run ID check"
		},
		{
			key: "phone",
			icon: MessageSquareText,
			title: "Phone verification",
			body: "We send a one-time PIN to your mobile number.",
			status: kyc.phoneStatus,
			cta: "Send OTP",
			input: true
		},
		{
			key: "face",
			icon: ScanFace,
			title: "Selfie liveness",
			body: "A live selfie is matched to your identity document to prevent fraud.",
			status: kyc.faceStatus,
			cta: "Start selfie scan"
		}
	];
	const allVerified = kyc.identityStatus === "verified" && kyc.phoneStatus === "verified" && kyc.faceStatus === "verified";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 flex items-center justify-center px-6 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-lg glass-card rounded-2xl p-8 ring-1 ring-black/20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-4 size-14 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-7" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-semibold tracking-tight mb-2",
								children: "Verify your identity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Every HITCH SA account clears these checks before it can travel. Most complete in under 5 minutes."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: steps.map((s) => {
							const Icon = s.icon;
							const done = s.status === "verified";
							const pending = s.status === "pending" || working === s.key;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("rounded-2xl border p-4", done ? "border-brand/30 bg-brand/5" : "border-white/10 bg-white/[0.02]"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("size-10 rounded-xl flex items-center justify-center shrink-0 border", done ? "bg-brand/15 border-brand/30 text-brand-light" : "border-white/10 text-muted-foreground"),
										children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
													className: "text-sm font-semibold",
													children: s.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycStatusPill, { status: s.status })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-1",
												children: s.body
											}),
											s.input && !done && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "One-time PIN",
													htmlFor: "otp",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
														id: "otp",
														inputMode: "numeric",
														maxLength: 6,
														value: code,
														onChange: (e) => setCode(e.target.value.replace(/[^0-9]/g, "")),
														placeholder: "6-digit SMS PIN"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-muted-foreground mt-1",
													children: ["Demo SMS PIN: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono",
														children: "482913"
													})]
												})]
											}),
											!done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: pending ? "ghost" : "outline",
												className: "mt-3",
												disabled: !!working,
												onClick: () => run(s.key, s.input ? code : void 0),
												children: working === s.key ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Checking…"] }) : s.cta
											})
										]
									})]
								})
							}, s.key);
						})
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-destructive mt-4",
						role: "alert",
						children: error
					}),
					allVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-brand-light mb-3",
							children: "Identity verified — you're ready to move."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-brand hover:bg-brand-light text-white w-full",
							onClick: () => navigate({ to: ROLE_HOME[user.role] }),
							children: "Open dashboard"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: [
							"Already verified?",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: ROLE_HOME[user.role],
								className: "text-brand-light hover:underline",
								children: "Skip for now"
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { VerifyPage as component };
