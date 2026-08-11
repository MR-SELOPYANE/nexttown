import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { B as Mail, W as LoaderCircle, j as Phone, z as MapPin } from "../_libs/lucide-react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { P as useSubmitTicket } from "./queries-Cq7COrxw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-CjOuxwyp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	const { user } = useAuth();
	const submit = useSubmitTicket();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)(user?.email ?? "");
	const [company, setCompany] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("General enquiry");
	const [message, setMessage] = (0, import_react.useState)("");
	const sent = submit.isSuccess;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Contact",
		title: "Let's talk.",
		subtitle: "Sales, partnerships, media or just curious — the right person will reply within one business day."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-6 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactCard, {
						icon: Mail,
						title: "Email",
						lines: [
							"hello@hitch.sa",
							"sales@hitch.sa",
							"press@hitch.sa"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactCard, {
						icon: Phone,
						title: "Phone",
						lines: ["+27 10 001 2400 (Mon–Fri, 08:00–18:00)", "0800 HITCH (24/7 emergency)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactCard, {
						icon: MapPin,
						title: "Sandton HQ",
						lines: [
							"11 Alice Lane",
							"Sandton, Johannesburg 2196",
							"South Africa"
						]
					})
				]
			}), sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center flex flex-col items-center justify-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5 text-brand-light" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold mb-1",
						children: "Message sent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground max-w-[40ch]",
						children: [
							"Thanks ",
							name || "there",
							" — we've logged your enquiry and a real human will reply to",
							" ",
							email,
							" within one business day."
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					submit.mutate({
						topic,
						subject: `${topic}${company ? ` · ${company}` : ""}`,
						message,
						email,
						userId: user?.id
					});
				},
				className: "glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							name: "name",
							placeholder: "Your name",
							required: true,
							value: name,
							onChange: (e) => setName(e.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							name: "email",
							type: "email",
							placeholder: "you@company.co.za",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Company",
						name: "company",
						placeholder: "Company (optional)",
						value: company,
						onChange: (e) => setCompany(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2",
						children: "Topic"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: "topic",
						value: topic,
						onChange: (e) => setTopic(e.target.value),
						className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "General enquiry" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Sales / enterprise" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Driver / operator" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Press" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Partnerships" })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2",
						children: "Message"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "message",
						rows: 5,
						required: true,
						value: message,
						onChange: (e) => setMessage(e.target.value),
						placeholder: "Tell us a little about what you need…",
						className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: submit.isPending,
						className: "w-full bg-brand hover:bg-brand-light text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ring-1 ring-brand/50 disabled:opacity-60 inline-flex items-center justify-center gap-2",
						children: [submit.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Send message"]
					}),
					submit.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: submit.error?.message ?? "Something went wrong. Please try again."
					})
				]
			})]
		})
	})] });
}
function ContactCard({ icon: Icon, title, lines }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-6 ring-1 ring-black/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-brand-light" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold mb-2",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground leading-relaxed space-y-0.5",
				children: lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: l }, l))
			})
		]
	});
}
function Field({ label, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
	})] });
}
//#endregion
export { ContactPage as component };
