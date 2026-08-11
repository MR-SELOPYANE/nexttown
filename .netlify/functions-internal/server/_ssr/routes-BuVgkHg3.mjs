import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as Plane, Dt as ArrowRight, N as Package, T as Radio, X as GraduationCap, _ as ShieldCheck, ht as Car, i as Users, l as Truck, r as Wallet, t as Zap, z as MapPin } from "../_libs/lucide-react.mjs";
import { o as SiteNav } from "./site-nav-B0JMzhV9.mjs";
import { n as SiteFooter, t as ComplianceStrip } from "./compliance-strip-DCoN_Tqx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BuVgkHg3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hero_map_default = "/assets/hero-map-DvkWw8P4.jpg";
var vertical_rides_default = "/assets/vertical-rides-BD5htoa3.jpg";
var vertical_parcels_default = "/assets/vertical-parcels-Dh5MemCY.jpg";
var vertical_trucks_default = "/assets/vertical-trucks-CqLJ5cqM.jpg";
var VERTICALS = [
	{
		key: "rides",
		label: "Rides",
		title: "Intelligent commuting.",
		copy: "Real-time route optimisation across metro centres. Verified drivers, transparent pricing, and corporate integration for the modern South African workforce.",
		bullets: [
			"In-app emergency response",
			"Fixed-rate airport shuttles",
			"Corporate ride wallets"
		],
		image: vertical_rides_default,
		icon: Car
	},
	{
		key: "parcels",
		label: "Parcels",
		title: "Same-day, everywhere.",
		copy: "Hyperlocal courier infrastructure for businesses and individuals. QR proof of delivery, live tracking and insurance on every drop.",
		bullets: [
			"QR + OTP proof of delivery",
			"Insurance up to R50 000",
			"API for retailers"
		],
		image: vertical_parcels_default,
		icon: Package
	},
	{
		key: "trucks",
		label: "Trucks",
		title: "Empty return legs, monetised.",
		copy: "Freight operators publish empty capacity on their return corridors. Businesses book verified trucks at up to 40% below spot rates.",
		bullets: [
			"National corridor matching",
			"Live GPS + POD",
			"Invoicing & escrow built in"
		],
		image: vertical_trucks_default,
		icon: Truck
	},
	{
		key: "flights",
		label: "Flights",
		title: "Sky Hitch — empty seats.",
		copy: "Airlines and charter operators list unsold seats close to departure. Travellers unlock domestic routes at charter-grade prices.",
		bullets: [
			"Domestic + regional charter",
			"Boarding QR + check-in",
			"Full refund protection"
		],
		image: vertical_rides_default,
		icon: Plane
	},
	{
		key: "school",
		label: "School",
		title: "School Buddy transport.",
		copy: "Vetted drivers, verified schools, monthly billing. Parents get live tracking, pickup verification and emergency alerts.",
		bullets: [
			"Live pickup + drop verification",
			"SAPS-checked drivers",
			"Monthly parent billing"
		],
		image: vertical_parcels_default,
		icon: GraduationCap
	}
];
var STATS = [
	{
		label: "Active drivers",
		value: "14,282",
		accent: true
	},
	{
		label: "Trips today",
		value: "84,902"
	},
	{
		label: "Cities active",
		value: "124"
	},
	{
		label: "Platform trust",
		value: "99.9%"
	}
];
function Landing() {
	const [active, setActive] = (0, import_react.useState)("rides");
	const current = VERTICALS.find((v) => v.key === active) ?? VERTICALS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {
				active,
				setActive,
				current
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerLogos, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoVerticals, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessSegment, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonials, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComplianceStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Hero({ active, setActive, current }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative pt-20 pb-24 px-6 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 -z-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hero_map_default,
				alt: "",
				"aria-hidden": "true",
				width: 1920,
				height: 1080,
				className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none opacity-25"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-semibold mb-8",
					style: { animation: "hitch-fade-up 0.6s ease-out both" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-1.5 rounded-full bg-brand-light",
						style: { animation: "hitch-pulse-dot 1.8s ease-in-out infinite" }
					}), "NOW SERVING 9 PROVINCES"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-balance max-w-[18ch] mb-6",
					style: { animation: "hitch-fade-up 0.7s ease-out 0.05s both" },
					children: "Moving in one direction."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg text-muted-foreground max-w-[56ch] text-pretty mb-10",
					style: { animation: "hitch-fade-up 0.7s ease-out 0.15s both" },
					children: "The unified mobility infrastructure for South Africa. One platform for commuters, couriers, heavy-haulage, aviation and school transport."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3 mb-16",
					style: { animation: "hitch-fade-up 0.7s ease-out 0.25s both" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/register",
						className: "bg-foreground text-background font-medium py-2.5 px-5 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors",
						children: ["Get started", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/features",
						className: "glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors",
						children: "For drivers & operators"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-5xl glass-card rounded-2xl overflow-hidden ring-1 ring-black/20 shadow-2xl shadow-black/40",
					style: { animation: "hitch-fade-up 0.8s ease-out 0.35s both" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 border-b border-white/5",
						role: "tablist",
						children: VERTICALS.map((v) => {
							const Icon = v.icon;
							const isActive = v.key === active;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								role: "tab",
								"aria-selected": isActive,
								onClick: () => setActive(v.key),
								className: `p-3 md:p-4 flex flex-col items-center gap-1.5 border-r border-white/5 last:border-r-0 transition-colors ${isActive ? "bg-white/5 text-brand-light" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] md:text-xs font-semibold uppercase tracking-widest",
									children: v.label
								})]
							}, v.key);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center",
						style: { animation: "hitch-fade-up 0.4s ease-out both" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-medium mb-3 tracking-tight",
									children: current.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-sm max-w-[48ch] mb-6 leading-relaxed",
									children: current.copy
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-2.5",
									children: current.bullets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-3 text-sm text-foreground/80",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1 rounded-full bg-brand-light" }), b]
									}, b))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: current.image,
								alt: current.title,
								width: 800,
								height: 500,
								loading: "lazy",
								className: "w-full aspect-video object-cover rounded-xl outline outline-1 -outline-offset-1 outline-black/30"
							})
						})]
					}, current.key)]
				})
			]
		})]
	});
}
function StatStrip() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-y border-white/5 bg-white/[0.02] py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8",
			children: STATS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground text-[10px] font-bold uppercase tracking-widest",
					children: s.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `text-xl font-medium tabular-nums ${s.accent ? "text-brand-light" : "text-foreground"}`,
					children: s.value
				})]
			}, s.label))
		})
	});
}
function BentoVerticals() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "verticals",
		className: "py-24 md:py-32 px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-[48ch]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl md:text-4xl font-medium mb-4 text-balance tracking-tight",
						children: "Built for the complexity of local logistics."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-pretty",
						children: "Specialised tools for every sector of the South African mobility landscape — one identity, one wallet, one control tower."
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoCard, {
						className: "md:col-span-2",
						eyebrow: "Parcels",
						title: "Parcels & last mile",
						copy: "Same-day delivery infrastructure for businesses and individuals across the republic.",
						image: vertical_parcels_default
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoCard, {
						eyebrow: "Freight",
						title: "Return-load network",
						copy: "Eliminate empty return legs. Connect with vetted cargo across every corridor.",
						image: vertical_trucks_default,
						portrait: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoCard, {
						eyebrow: "Sky Hitch",
						title: "Empty airline seats",
						copy: "Last-minute domestic and charter seats surfaced the moment they open up.",
						icon: Plane
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoCard, {
						className: "md:col-span-2",
						eyebrow: "School Buddy",
						title: "Verified school transport",
						copy: "Live pickup and drop verification, SAPS-checked drivers, monthly billing for parents.",
						image: vertical_rides_default
					})
				]
			})]
		})
	});
}
function PartnerLogos() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-12 px-6 border-b border-white/5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6",
				children: "Moving operators & cargo across South Africa"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center justify-center gap-x-10 gap-y-4",
				children: [
					"Goldrush Logistics",
					"Ndlovu Transport",
					"Songe Air Charter",
					"Kodwa Couriers",
					"Cape Coast Movers",
					"Tshwane Interlink"
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-lg font-semibold tracking-tight text-muted-foreground/60",
					children: p
				}, p))
			})]
		})
	});
}
function BusinessSegment() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "business",
		className: "px-6 py-24 md:py-32 border-t border-white/5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-brand-light text-[10px] font-bold uppercase tracking-widest mb-3",
					children: "HITCH SA for Business"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl md:text-4xl font-medium mb-4 tracking-tight text-balance",
					children: "Corporate mobility with one invoice."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-pretty mb-6",
					children: "Give teams shared ride wallets, dispatch business parcels, move cargo on return-load corridors and book vetted airport transfers — all reconciled through one control tower and settled on NET-30 terms."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2.5 mb-8",
					children: [
						"Shared team wallets with per-employee limits",
						"Volume pricing on parcels, freight and charters",
						"Live dashboards, receipts and VAT-ready invoicing",
						"API access to book and track from your own systems"
					].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 text-sm text-foreground/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1 rounded-full bg-brand-light" }), b]
					}, b))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/register",
						className: "bg-foreground text-background font-medium py-2.5 px-5 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors",
						children: ["Create a business account ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/support",
						className: "glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors",
						children: "Talk to sales"
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-8 ring-1 ring-black/20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [
						{
							label: "Rides booked",
							value: "2.1M"
						},
						{
							label: "Parcels shipped",
							value: "1.4M"
						},
						{
							label: "Freight ton-km",
							value: "48M"
						},
						{
							label: "Avg. settlement",
							value: "2.1 days"
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-white/10 p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-semibold tabular-nums text-brand-light",
							children: s.value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-1",
							children: s.label
						})]
					}, s.label))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-6",
					children: "Operators on HITCH SA settle 88% of gross within 48 hours of trip completion."
				})]
			})]
		})
	});
}
function Testimonials() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "testimonials",
		className: "px-6 py-24 md:py-32 border-t border-white/5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-[48ch] mb-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl md:text-4xl font-medium mb-4 tracking-tight text-balance",
					children: "Moving real people, real cargo."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-pretty",
					children: "From commuters to fleet managers — hear it from the people who hitch every day."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4",
				children: [
					{
						quote: "My team books airport transfers through the same wallet we use for parcels. One invoice, zero excuses.",
						name: "Zanele M.",
						role: "Ops director, Johannesburg"
					},
					{
						quote: "The return-load network filled a corridor I'd been running empty for months. My truck never sits idle now.",
						name: "Hendrik V.",
						role: "Truck operator, Durban"
					},
					{
						quote: "Live pickup alerts mean I don't chase the school bus anymore. The SAPS-checked drivers made the decision easy.",
						name: "Priya N.",
						role: "Parent, Pretoria"
					}
				].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
					className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
						className: "text-sm text-foreground/90 leading-relaxed flex-1",
						children: [
							"“",
							q.quote,
							"”"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-sm",
							children: q.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: q.role
						})]
					})]
				}, q.name))
			})]
		})
	});
}
function BentoCard({ eyebrow, title, copy, image, icon: Icon, className = "", portrait = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `group relative overflow-hidden glass-card rounded-2xl p-6 md:p-8 ring-1 ring-black/20 transition-colors hover:border-brand/30 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex flex-col h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-brand-light text-[10px] font-bold uppercase tracking-widest mb-2",
					children: eyebrow
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "text-xl md:text-2xl font-medium mb-2 tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm max-w-[38ch] mb-6",
					children: copy
				}),
				image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					loading: "lazy",
					className: `mt-auto w-full ${portrait ? "h-64 object-cover" : "aspect-video object-cover"} rounded-xl outline outline-1 -outline-offset-1 outline-black/30 transition-transform duration-700 group-hover:scale-[1.02]`
				}) : Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto flex items-center justify-center h-40 rounded-xl bg-white/[0.03] border border-white/5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-10 text-brand-light/70" })
				}) : null
			]
		})
	});
}
function TrustSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "trust",
		className: "px-6 py-24 md:py-32 border-t border-white/5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-[48ch] mb-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl md:text-4xl font-medium mb-4 tracking-tight text-balance",
					children: "Institutional trust. Silicon-Valley speed."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-pretty",
					children: "HITCH SA was engineered against the same standards that regulate our banks — because moving people, cargo and children deserves nothing less."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: [
					{
						icon: ShieldCheck,
						title: "Vetted infrastructure",
						copy: "Every driver, pilot and operator clears a 5-tier background check and equipment inspection."
					},
					{
						icon: Wallet,
						title: "Escrowed payments",
						copy: "Funds are held until the hitch is completed. Transparent pricing, no cash risk."
					},
					{
						icon: Radio,
						title: "Live control tower",
						copy: "GPS, ETA and emergency response monitored 24/7 by a real operations team."
					},
					{
						icon: MapPin,
						title: "National grid",
						copy: "From Soweto streets to Sandton boardrooms — coverage across all nine provinces."
					},
					{
						icon: Users,
						title: "One identity",
						copy: "Rider, driver, business or parent — one KYC, one wallet, one reputation."
					},
					{
						icon: Zap,
						title: "Enterprise API",
						copy: "Book, track and reconcile from your own systems with production-grade endpoints."
					}
				].map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-brand-light" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-base font-semibold mb-2",
								children: item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: item.copy
							})
						]
					}, item.title);
				})
			})]
		})
	});
}
//#endregion
export { Landing as component };
