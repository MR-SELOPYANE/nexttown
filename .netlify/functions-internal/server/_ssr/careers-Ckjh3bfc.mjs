import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { Dt as ArrowRight, W as LoaderCircle, st as CircleCheck, z as MapPin } from "../_libs/lucide-react.mjs";
import { t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { P as useSubmitTicket } from "./queries-Cq7COrxw.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as Label } from "./label-xiIfTWYK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/careers-Ckjh3bfc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	{
		team: "Engineering",
		title: "Senior Backend Engineer (Go / Postgres)",
		location: "Sandton"
	},
	{
		team: "Engineering",
		title: "Realtime Systems Engineer",
		location: "Remote — SA"
	},
	{
		team: "Engineering",
		title: "Mobile Engineer (React Native)",
		location: "Cape Town"
	},
	{
		team: "Design",
		title: "Product Designer — Freight",
		location: "Sandton"
	},
	{
		team: "Operations",
		title: "Regional Ops Manager — KZN",
		location: "Durban"
	},
	{
		team: "Operations",
		title: "Driver Experience Lead",
		location: "Sandton"
	},
	{
		team: "Trust & Safety",
		title: "Fraud Analyst",
		location: "Remote — SA"
	},
	{
		team: "Sales",
		title: "Enterprise Account Executive",
		location: "Sandton"
	}
];
var PERKS = [
	"Equity in a category-defining SA business",
	"Medical aid + mental-health cover",
	"Remote-first, quarterly team weeks in Sandton",
	"Annual learning budget of R25 000",
	"MacBook Pro + generous home-office setup",
	"Parental leave — 20 weeks primary / 8 weeks secondary"
];
function CareersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Careers",
			title: "Help us move a country in one direction.",
			subtitle: "We're a small team building enterprise-grade mobility infrastructure for South Africa. If that sounds like your kind of ambition — read on."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-5xl mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6",
					children: "Open roles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "glass-card rounded-2xl ring-1 ring-black/20 divide-y divide-white/5 overflow-hidden",
					children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "mailto:careers@hitch.sa",
						className: "flex items-center gap-6 px-6 py-5 hover:bg-white/[0.03] transition-colors group",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-brand-light text-[10px] font-bold uppercase tracking-widest w-32 shrink-0",
								children: r.team
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 text-foreground font-medium",
								children: r.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden md:flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }), r.location]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-muted-foreground group-hover:text-brand-light group-hover:translate-x-1 transition-all" })
						]
					}, r.title))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 pb-24 border-t border-white/5 pt-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-5xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6",
						children: "Life at HITCH"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-3 mb-16",
						children: PERKS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "glass-card rounded-xl px-5 py-4 ring-1 ring-black/20 text-sm text-foreground/80",
							children: p
						}, p))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6",
						children: "Apply"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareerForm, {})
				]
			})
		})
	] });
}
function CareerForm() {
	const { user } = useAuth();
	const submit = useSubmitTicket();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)(user?.email ?? "");
	const [role, setRole] = (0, import_react.useState)(ROLES[0].title);
	const [message, setMessage] = (0, import_react.useState)("");
	if (submit.isSuccess) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-10 ring-1 ring-black/20 text-center max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-9 text-brand mx-auto mb-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold mb-1",
				children: "Application received"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground max-w-[42ch] mx-auto mb-6",
				children: [
					"Thanks ",
					name || "for applying",
					" — our hiring team will review your application for ",
					role,
					" ",
					"and get back to ",
					email,
					" within a few days."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => submit.reset(),
				children: "Apply for another role"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			submit.mutate({
				topic: `Careers · ${role}`,
				subject: role,
				message: message || "Application submitted via the careers page.",
				email,
				userId: user?.id
			});
		},
		className: "glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 space-y-4 max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "career-name",
					className: "mb-2 block",
					children: "Full name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "career-name",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Your name",
					required: true
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "career-email",
					className: "mb-2 block",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "career-email",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@example.com",
					required: true
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "career-role",
				className: "mb-2 block",
				children: "Role"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				id: "career-role",
				value: role,
				onChange: (e) => setRole(e.target.value),
				className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50",
				children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: r.title }, r.title))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "career-message",
				className: "mb-2 block",
				children: "A little about you"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "career-message",
				rows: 4,
				value: message,
				onChange: (e) => setMessage(e.target.value),
				placeholder: "Why HITCH SA, and what you'd bring…",
				className: "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: submit.isPending,
				className: "bg-brand hover:bg-brand-light text-white",
				children: [submit.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Submit application"]
			}),
			submit.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: submit.error?.message ?? "Something went wrong."
			})
		]
	});
}
//#endregion
export { CareersPage as component };
