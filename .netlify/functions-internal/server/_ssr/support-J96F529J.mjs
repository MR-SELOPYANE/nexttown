import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { Dt as ArrowRight, G as LifeBuoy, I as MessageSquare, W as LoaderCircle, bt as BookOpen, ht as Car, r as Wallet, st as CircleCheck, v as ShieldAlert } from "../_libs/lucide-react.mjs";
import { t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { P as useSubmitTicket } from "./queries-Cq7COrxw.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as Label } from "./label-xiIfTWYK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-J96F529J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOPICS = [
	{
		icon: Car,
		title: "Trips & bookings",
		copy: "Cancellations, refunds, disputes and driver issues."
	},
	{
		icon: Wallet,
		title: "Wallet & payments",
		copy: "Top-ups, payouts, PayFast, Ozow and card issues."
	},
	{
		icon: ShieldAlert,
		title: "Safety & emergencies",
		copy: "In-trip SOS, incident reports, missing items."
	},
	{
		icon: BookOpen,
		title: "Account & KYC",
		copy: "SA ID / passport verification, 2FA, device management."
	}
];
function SupportPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Support",
		title: "We're here 24/7.",
		subtitle: "Real humans, real tools. If something goes wrong, we're one tap away — and if it's an emergency, we're already moving."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-6 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "tel:0800448244",
						className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, { className: "size-5 text-brand-light" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold mb-1",
								children: "Emergency line"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "0800 HITCH (24/7)"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "mailto:help@hitch.sa",
						className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-5 text-brand-light" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold mb-1",
								children: "Email help"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "help@hitch.sa · replies in < 1h"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/faq",
						className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5 text-brand-light" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold mb-1",
								children: "FAQ & guides"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Search common answers"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6",
				children: "Popular topics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
				children: TOPICS.map((t) => {
					const Icon = t.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/faq",
						className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors group",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-brand-light mb-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold mb-1.5",
								children: t.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground leading-relaxed mb-4",
								children: t.copy
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs text-brand-light font-medium",
								children: ["Explore", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 group-hover:translate-x-0.5 transition-transform" })]
							})
						]
					}, t.title);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 mt-16",
				children: "Open a ticket"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportForm, {})
		]
	})] });
}
function SupportForm() {
	const { user } = useAuth();
	const submit = useSubmitTicket();
	const [topic, setTopic] = (0, import_react.useState)("Trips & bookings");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)(user?.email ?? "");
	if (submit.isSuccess) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-9 text-brand mx-auto mb-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold mb-1",
				children: "Ticket received"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground max-w-[42ch] mx-auto mb-6",
				children: [
					"Our support desk has your request and a human will pick it up shortly. You'll get a reply at ",
					email || "your account email",
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => submit.reset(),
				children: "Submit another request"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			submit.mutate({
				topic,
				subject: subject || topic,
				message,
				email,
				userId: user?.id
			});
		},
		className: "glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4 max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "support-topic",
					className: "mb-2 block",
					children: "Topic"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					id: "support-topic",
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50",
					children: TOPICS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t.title }, t.title))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "support-email",
					className: "mb-2 block",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "support-email",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@example.com",
					required: true
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "support-subject",
				className: "mb-2 block",
				children: "Subject"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "support-subject",
				value: subject,
				onChange: (e) => setSubject(e.target.value),
				placeholder: "Short summary of the issue",
				required: true
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "support-message",
				className: "mb-2 block",
				children: "Message"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "support-message",
				rows: 5,
				value: message,
				onChange: (e) => setMessage(e.target.value),
				required: true,
				placeholder: "Tell us what happened…",
				className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: submit.isPending,
				className: "bg-brand hover:bg-brand-light text-white",
				children: [submit.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Submit ticket"]
			}),
			submit.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: submit.error?.message ?? "Something went wrong."
			})
		]
	});
}
//#endregion
export { SupportPage as component };
