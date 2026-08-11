import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compliance-strip-DCoN_Tqx.js
var import_jsx_runtime = require_jsx_runtime();
function FooterCol({ title, links }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
		className: "text-foreground text-sm font-semibold mb-4",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3 text-sm text-muted-foreground",
		children: links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: l.to,
			className: "hover:text-foreground transition-colors",
			children: l.label
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: l.href ?? "#",
			className: "hover:text-foreground transition-colors",
			children: l.label
		}) }, l.label))
	})] });
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "bg-background pt-20 pb-10 px-6 border-t border-white/5 mt-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "text-brand-light font-semibold tracking-tight text-xl mb-5 block",
							children: ["HITCH", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "SA"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-sm max-w-[38ch] leading-relaxed",
							children: "South Africa's unified mobility marketplace — rides, parcels, freight return-loads, empty airline seats and school transport. Moving in one direction."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 mt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-white/10 rounded-full px-3 py-1",
									children: "POPIA"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-white/10 rounded-full px-3 py-1",
									children: "PCI-DSS"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-white/10 rounded-full px-3 py-1",
									children: "SAPS-verified"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterCol, {
					title: "Marketplace",
					links: [
						{
							label: "Ride now",
							to: "/ride"
						},
						{
							label: "Rides",
							to: "/rides"
						},
						{
							label: "Parcels",
							to: "/parcels"
						},
						{
							label: "Freight",
							to: "/freight"
						},
						{
							label: "Flights",
							to: "/flights"
						},
						{
							label: "School",
							to: "/school"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterCol, {
					title: "Company",
					links: [
						{
							label: "About",
							to: "/about"
						},
						{
							label: "Features",
							to: "/features"
						},
						{
							label: "Pricing",
							to: "/pricing"
						},
						{
							label: "Careers",
							to: "/careers"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterCol, {
					title: "Support & Legal",
					links: [
						{
							label: "Help Center",
							to: "/support"
						},
						{
							label: "FAQ",
							to: "/faq"
						},
						{
							label: "Contact",
							to: "/contact"
						},
						{
							label: "Privacy",
							to: "/legal/privacy"
						},
						{
							label: "Terms",
							to: "/legal/terms"
						},
						{
							label: "Cookies",
							to: "/legal/cookies"
						},
						{
							label: "POPIA",
							to: "/legal/popia"
						}
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Hitch SA Mobility (Pty) Ltd. All rights reserved."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-5 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "Twitter"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "LinkedIn"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "Instagram"
					})
				]
			})]
		})]
	});
}
function ComplianceStrip() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-white/[0.02] border-y border-white/5 py-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-6 gap-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
						children: "Security standards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-foreground/80",
						children: "POPIA Compliant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-foreground/80",
						children: "256-bit Encryption"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-foreground/80",
						children: "SAPS-verified drivers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-foreground/80",
						children: "PCI-DSS payments"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-muted-foreground",
				children: "Regulated by the National Department of Transport"
			})]
		})
	});
}
//#endregion
export { SiteFooter as n, ComplianceStrip as t };
