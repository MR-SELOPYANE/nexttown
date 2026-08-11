import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { $ as FileCheckCorner, A as Plane, N as Package, Q as FingerprintPattern, S as Route, X as GraduationCap, Y as Headphones, _ as ShieldCheck, at as Clock, dt as Check, h as Siren, ht as Car, l as Truck, m as Star, mt as ChartColumn, nt as CreditCard, o as UserPlus, pt as ChartLine, s as UserCheck, x as ScanFace, z as MapPin } from "../_libs/lucide-react.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/features-D2IfWEab.js
var import_jsx_runtime = require_jsx_runtime();
var VERTICALS = [
	{
		icon: Car,
		title: "Rides",
		copy: "Search rides by origin, destination, date and seats. Book online, track the driver and rate after every trip."
	},
	{
		icon: Package,
		title: "Parcels",
		copy: "Send parcels with pickup and delivery points, photo proof, QR + OTP verification and live delivery tracking."
	},
	{
		icon: Truck,
		title: "Truck return loads",
		copy: "Truck operators post empty capacity and routes; businesses book loads online and track cargo end to end."
	},
	{
		icon: Plane,
		title: "Airline seats",
		copy: "Empty seats from commercial, charter and private operators — discounted, last-minute and reserveable."
	},
	{
		icon: GraduationCap,
		title: "School transport",
		copy: "Vetted drivers, registered children and parent notifications with GPS tracking on every school run."
	},
	{
		icon: Clock,
		title: "Daily commuter",
		copy: "Find commuting partners, share costs and book recurring trips to cut congestion and fuel bills."
	}
];
var VERIFICATION = [
	{
		icon: UserPlus,
		title: "User registration",
		copy: "SA ID or passport, selfie, mobile and email on signup. Duplicate and fraud checks before access."
	},
	{
		icon: FingerprintPattern,
		title: "Identity verification",
		copy: "Government-register ID validation for citizens and passport checks for foreign nationals."
	},
	{
		icon: ScanFace,
		title: "Face recognition",
		copy: "Selfies matched against ID photos to detect fake identities and block duplicate accounts."
	},
	{
		icon: UserCheck,
		title: "Driver verification",
		copy: "Licence validation, expiry checks, proof of address and bank details before a driver is approved."
	},
	{
		icon: FileCheckCorner,
		title: "Vehicle verification",
		copy: "Vehicle registration, license disc and photos confirmed before any seat can be offered."
	}
];
var SAFETY = [
	{
		icon: Route,
		title: "Ride matching",
		copy: "Matches origin, destination, date, time, seats and vehicle type — weighted by distance, ratings, price and safety score."
	},
	{
		icon: MapPin,
		title: "GPS & tracking",
		copy: "Every trip is tracked with live locations, routes, ETAs, stops and deviation detection."
	},
	{
		icon: Siren,
		title: "Emergency services",
		copy: "SOS button, emergency contacts, police and medical notification, and live location sharing."
	}
];
var TRUST = [
	{
		icon: CreditCard,
		title: "Payments",
		copy: "Debit and credit cards, instant EFT, mobile wallets and bank transfers — with escrow, refunds and driver payouts."
	},
	{
		icon: Star,
		title: "Ratings & reviews",
		copy: "Score drivers, passengers, parcels and trucks on safety, punctuality, cleanliness and communication."
	},
	{
		icon: ShieldCheck,
		title: "Safety monitoring",
		copy: "Trip records, route history, driver behaviour and speed monitoring with SOS activation."
	}
];
var ADMIN = [
	{
		icon: ChartColumn,
		title: "Analytics dashboard",
		copy: "Revenue, user, trip, safety, driver performance, parcel and load reports for the whole marketplace."
	},
	{
		icon: ChartLine,
		title: "Administration",
		copy: "Approve drivers and vehicles, suspend users, monitor trips, investigate incidents and generate reports."
	},
	{
		icon: Headphones,
		title: "Customer support",
		copy: "In-app tickets, help center and a 24/7 operations desk for travelers, operators and businesses."
	}
];
var TRAVELER_FEATURES = [
	"Search for rides",
	"Book seats online",
	"Pay securely online",
	"Track drivers live",
	"Share trips",
	"Cancel bookings",
	"Rate drivers",
	"Save favourite destinations"
];
var DRIVER_FEATURES = [
	"Create trips",
	"Set available seats",
	"Determine prices",
	"Accept passengers",
	"Track earnings",
	"Receive payouts",
	"View ratings",
	"Verified operator badge"
];
function FeatureCard({ icon: Icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-6 ring-1 ring-black/20 hover:border-brand/30 transition-colors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-brand-light" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold mb-1.5",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground leading-relaxed",
				children: copy
			})
		]
	});
}
function FeatureSection({ eyebrow, title, items, cols = "lg:grid-cols-3" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-6 border-t border-white/5 pt-20 pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2",
					children: eyebrow
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl md:text-3xl font-medium tracking-tight text-balance mb-8",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `grid grid-cols-1 md:grid-cols-2 ${cols} gap-4`,
					children: items.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, { ...f }, f.title))
				})
			]
		})
	});
}
function Checklist({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-7 ring-1 ring-black/20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-lg font-semibold mb-5",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: items.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-5 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-brand-light" })
				}), f]
			}, f))
		})]
	});
}
function FeaturesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Features",
			title: "Every mode. One platform.",
			subtitle: "Rides, parcels, truck loads, airline seats, school transport and commuting — sharing one identity, wallet, safety layer and control tower."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSection, {
			eyebrow: "Marketplace",
			title: "Six ways to move",
			items: VERTICALS,
			cols: "md:grid-cols-2 lg:grid-cols-3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSection, {
			eyebrow: "Identity",
			title: "Verified before they ride",
			items: VERIFICATION
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSection, {
			eyebrow: "Matching & safety",
			title: "Smart matching, always watching",
			items: SAFETY
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSection, {
			eyebrow: "Commerce & trust",
			title: "Payments that protect everyone",
			items: TRUST
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSection, {
			eyebrow: "Platform",
			title: "Run by operators, for operators",
			items: ADMIN
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 py-20 border-t border-white/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-7xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2",
						children: "For everyone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl md:text-3xl font-medium tracking-tight text-balance mb-8",
						children: "Built for travelers and drivers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checklist, {
							title: "Travelers",
							items: TRAVELER_FEATURES
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checklist, {
							title: "Drivers",
							items: DRIVER_FEATURES
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-6 pb-28",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl mx-auto text-center glass-card rounded-3xl p-10 ring-1 ring-black/20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl md:text-3xl font-medium tracking-tight text-balance mb-3",
						children: "Ready to move in one direction?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground mb-8 max-w-[42ch] mx-auto",
						children: "Create a free account and start booking rides, sending parcels or listing capacity today."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row gap-3 justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							className: "bg-foreground text-background font-medium py-2.5 px-6 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 hover:bg-white/90 transition-colors",
							children: "Get started"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pricing",
							className: "glass-card text-foreground font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-colors",
							children: "View pricing"
						})]
					})
				]
			})
		})
	] });
}
//#endregion
export { FeaturesPage as component };
