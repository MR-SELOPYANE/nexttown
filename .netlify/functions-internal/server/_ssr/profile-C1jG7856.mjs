import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { $ as FileCheckCorner, _ as ShieldCheck, c as Upload, wt as BadgeCheck } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { n as KycStatusPill } from "./status-N0G1dMzr.mjs";
import { V as useUpdateProfile } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as Label } from "./label-xiIfTWYK.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-C1jG7856.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function ProfilePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileInner, {}) });
}
function ProfileInner() {
	const { user, setUser } = useAuth();
	const update = useUpdateProfile();
	const [idNumber, setIdNumber] = (0, import_react.useState)(user?.kyc.idNumber ?? "");
	const [phone, setPhone] = (0, import_react.useState)(user?.phone ?? "");
	const [licence, setLicence] = (0, import_react.useState)(user?.kyc.licenceNumber ?? "");
	const [contactName, setContactName] = (0, import_react.useState)(user?.emergencyContact ?? "");
	const [contactNumber, setContactNumber] = (0, import_react.useState)(user?.emergencyNumber ?? "");
	const [prefs, setPrefs] = (0, import_react.useState)(user?.preferences ?? {
		push: true,
		sms: true,
		email: true,
		marketing: false
	});
	if (!user) return null;
	const kyc = user.kyc;
	const overall = (() => {
		const s = [
			kyc.identityStatus,
			kyc.faceStatus,
			kyc.phoneStatus
		];
		if (s.every((v) => v === "verified")) return "verified";
		if (s.some((v) => v === "pending" || v === "rejected")) return "pending";
		return "unverified";
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Account",
		title: `${user.firstName}'s profile`,
		subtitle: "Identity verification, documents and safety preferences — the trust layer behind every HITCH SA match."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-6 py-14 max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-6 border border-white/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Identity verification (KYC)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycStatusPill, { status: overall })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "id",
								children: "SA ID / Passport number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "id",
								value: idNumber,
								onChange: (e) => setIdNumber(e.target.value),
								className: "mt-2"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Mobile number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								placeholder: "+27 82 000 0000",
								className: "mt-2"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "lic",
									children: "Driver / operator licence (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "lic",
									value: licence,
									onChange: (e) => setLicence(e.target.value),
									placeholder: "PrDP number",
									className: "mt-2"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-6 bg-brand hover:bg-brand-light text-white",
						onClick: () => update.mutate({
							id: user.id,
							phone,
							kyc: {
								...kyc,
								idNumber,
								licenceNumber: licence,
								identityStatus: kyc.identityStatus === "verified" ? "verified" : "pending"
							}
						}, {
							onSuccess: (u) => {
								setUser(u);
								toast.success("Verification submitted for review");
							},
							onError: (e) => toast.error(e.message)
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Submit for verification"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-6 border border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold mb-4",
					children: "Documents"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: kyc.documents.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl border border-white/10 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: `size-4 ${d.uploaded ? "text-brand-light" : "text-muted-foreground"}` }), d.name]
						}), d.uploaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-brand-light flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4" }), " Uploaded"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => update.mutate({
								id: user.id,
								kyc: {
									...kyc,
									documents: kyc.documents.map((doc) => doc.id === d.id ? {
										...doc,
										uploaded: true
									} : doc)
								}
							}, {
								onSuccess: (u) => {
									setUser(u);
									toast.success(`${d.name} uploaded`);
								},
								onError: (e) => toast.error(e.message)
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Upload"]
						})]
					}, d.id))
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl p-6 border border-white/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold mb-4",
							children: "Emergency contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact-name",
								children: "Contact name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "contact-name",
								value: contactName,
								onChange: (e) => setContactName(e.target.value),
								placeholder: "e.g. Lerato Mokoena",
								className: "mt-2"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact-number",
								children: "Contact number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "contact-number",
								value: contactNumber,
								onChange: (e) => setContactNumber(e.target.value),
								placeholder: "+27 82 000 0000",
								className: "mt-2"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "mt-4 w-full",
							onClick: () => update.mutate({
								id: user.id,
								emergencyContact: contactName,
								emergencyNumber: contactNumber
							}, {
								onSuccess: (u) => {
									setUser(u);
									toast.success("Emergency contact saved");
								},
								onError: (e) => toast.error(e.message)
							}),
							children: "Save contact"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl p-6 border border-white/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold mb-4",
						children: "Notifications"
					}), [
						["push", "Trip push alerts"],
						["sms", "SMS fallback"],
						["email", "Email receipts"],
						["marketing", "Product news"]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between py-2.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: prefs[key],
							onCheckedChange: (v) => {
								const next = {
									...prefs,
									[key]: v
								};
								setPrefs(next);
								update.mutate({
									id: user.id,
									preferences: next
								}, { onSuccess: (u) => setUser(u) });
							}
						})]
					}, key))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-2xl p-6 border border-white/10 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-foreground mb-2",
						children: "POPIA"
					}), "Your identity documents are encrypted at rest and only shared with counterparties as required to complete a trip."]
				})
			]
		})]
	})] });
}
//#endregion
export { ProfilePage as component };
