import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as DialogTrigger, f as Slot, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { A as Plane, C as Repeat, F as Moon, K as LayoutDashboard, N as Package, R as Menu, X as GraduationCap, _ as ShieldCheck, ht as Car, l as Truck, n as X, p as Sun, r as Wallet, t as Zap, ut as ChevronDown, vt as Building2, xt as Bell, z as MapPin } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-B0JMzhV9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "hitch-theme";
function apply(theme) {
	const root = document.documentElement;
	root.classList.remove("dark", "light");
	root.classList.add(theme);
	root.style.colorScheme = theme;
}
function useTheme() {
	const [theme, setThemeState] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		const stored = localStorage.getItem(KEY) ?? "dark";
		setThemeState(stored);
		apply(stored);
	}, []);
	const setTheme = (next) => {
		setThemeState(next);
		apply(next);
		try {
			localStorage.setItem(KEY, next);
		} catch {}
	};
	return {
		theme,
		setTheme,
		toggle: () => setTheme(theme === "dark" ? "light" : "dark")
	};
}
function ThemeToggle() {
	const { theme, toggle } = useTheme();
	const isDark = theme === "dark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: toggle,
		"aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
		title: isDark ? "Switch to light mode" : "Switch to dark mode",
		className: "inline-flex items-center justify-center size-9 rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors",
		children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
	});
}
var ROLE_LABELS = {
	traveler: "Traveler",
	driver: "Driver",
	trucker: "Truck operator",
	airline: "Airline / charter",
	school: "School transport",
	business: "Business / logistics",
	admin: "Administrator"
};
var ROLE_SHORT = {
	traveler: "Traveler",
	driver: "Driver",
	trucker: "Trucker",
	airline: "Airline",
	school: "School",
	business: "Business",
	admin: "Admin"
};
/** Where a signed-in role lands first — operators get their working console. */
var ROLE_HOME = {
	traveler: "/dashboard",
	driver: "/drive",
	trucker: "/truck",
	airline: "/airline",
	school: "/school-ops",
	business: "/business",
	admin: "/admin"
};
/** Registration roles the public can self-select. */
var REGISTRATION_ROLES = [
	"traveler",
	"driver",
	"trucker",
	"airline",
	"school",
	"business"
];
var ROLE_TAGLINE = {
	traveler: "Book rides, send parcels and travel affordably.",
	driver: "Fill empty seats and earn from every trip.",
	trucker: "Sell return-load capacity, never drive empty.",
	airline: "Sell seats that would otherwise fly empty.",
	school: "Run verified school routes with live parent tracking.",
	business: "Move staff, cargo and parcels at volume pricing.",
	admin: "Operate and govern the platform."
};
/** Every signed-in role gets its own primary nav — console first, then its marketplace. */
var ROLE_NAV = {
	traveler: [
		{
			to: "/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard
		},
		{
			to: "/rides",
			label: "Rides",
			icon: Car
		},
		{
			to: "/commute",
			label: "Commute",
			icon: Repeat
		},
		{
			to: "/parcels",
			label: "Parcels",
			icon: Package
		},
		{
			to: "/freight",
			label: "Freight",
			icon: Truck
		},
		{
			to: "/flights",
			label: "Flights",
			icon: Plane
		},
		{
			to: "/school",
			label: "School",
			icon: GraduationCap
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	driver: [
		{
			to: "/drive",
			label: "Drive",
			icon: LayoutDashboard
		},
		{
			to: "/rides",
			label: "Find rides",
			icon: Car
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	trucker: [
		{
			to: "/truck",
			label: "Trucking",
			icon: LayoutDashboard
		},
		{
			to: "/freight",
			label: "Loads",
			icon: Truck
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	airline: [
		{
			to: "/airline",
			label: "Airline",
			icon: LayoutDashboard
		},
		{
			to: "/flights",
			label: "Seats",
			icon: Plane
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	school: [
		{
			to: "/school-ops",
			label: "Operations",
			icon: LayoutDashboard
		},
		{
			to: "/school",
			label: "Routes",
			icon: GraduationCap
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	business: [
		{
			to: "/business",
			label: "Business",
			icon: LayoutDashboard
		},
		{
			to: "/freight",
			label: "Cargo",
			icon: Truck
		},
		{
			to: "/parcels",
			label: "Parcels",
			icon: Package
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/wallet",
			label: "Wallet",
			icon: Wallet
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	],
	admin: [
		{
			to: "/admin",
			label: "Admin",
			icon: ShieldCheck
		},
		{
			to: "/track",
			label: "Track",
			icon: MapPin
		},
		{
			to: "/notifications",
			label: "Alerts",
			icon: Bell
		}
	]
};
/** Guest / signed-out nav — marketing pages, no account links. */
var GUEST_NAV = [
	{
		to: "/features",
		label: "Features",
		icon: Zap
	},
	{
		to: "/pricing",
		label: "Pricing",
		icon: Building2
	},
	{
		to: "/about",
		label: "About",
		icon: ShieldCheck
	},
	{
		to: "/support",
		label: "Support",
		icon: Bell
	}
];
/** Marketplace dropdown, shown to every visitor. */
var MARKET_NAV = [
	{
		to: "/ride",
		label: "Ride now",
		icon: Zap,
		blurb: "Tap-to-ride, upfront fare"
	},
	{
		to: "/rides",
		label: "Rides",
		icon: Car,
		blurb: "Metro, airport, intercity"
	},
	{
		to: "/commute",
		label: "Commute",
		icon: Repeat,
		blurb: "Daily runs & shared passes"
	},
	{
		to: "/parcels",
		label: "Parcels",
		icon: Package,
		blurb: "Same-day peer delivery"
	},
	{
		to: "/freight",
		label: "Freight",
		icon: Truck,
		blurb: "Truck return-loads"
	},
	{
		to: "/flights",
		label: "Flights",
		icon: Plane,
		blurb: "Empty seats & charter"
	},
	{
		to: "/school",
		label: "School",
		icon: GraduationCap,
		blurb: "Vetted daily runs"
	}
];
/** Account links shared at the tail of every role nav (kept on the right of the bar). */
var ACCOUNT_PATHS = /* @__PURE__ */ new Set([
	"/track",
	"/wallet",
	"/notifications"
]);
function isAccountLink(link) {
	return ACCOUNT_PATHS.has(link.to);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetClose = DialogClose;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
function SiteNav() {
	const [dropdown, setDropdown] = (0, import_react.useState)(false);
	const [mobile, setMobile] = (0, import_react.useState)(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const nav = user ? ROLE_NAV[user.role] : GUEST_NAV;
	const primaryLinks = nav.filter((l) => !isAccountLink(l));
	const accountLinks = nav.filter((l) => isAccountLink(l));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "sticky top-0 z-50 w-full border-b border-white/5 glass-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-6 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "text-brand-light font-semibold tracking-tight text-xl shrink-0",
					children: ["HITCH", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: "SA"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden lg:flex items-center gap-5 text-sm font-medium text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						onMouseEnter: () => setDropdown(true),
						onMouseLeave: () => setDropdown(false),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"aria-haspopup": "true",
							"aria-expanded": dropdown,
							className: "flex items-center gap-1 hover:text-foreground transition-colors py-2",
							children: ["Marketplace", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })]
						}), dropdown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-full left-0 pt-2 w-72",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "glass-card rounded-xl p-2 ring-1 ring-black/20 border border-white/10",
								children: MARKET_NAV.map((m) => {
									const Icon = m.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: m.to,
										onClick: () => setDropdown(false),
										className: "flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 size-8 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium text-foreground",
											children: m.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: m.blurb
										})] })]
									}, m.to);
								})
							})
						})]
					}), primaryLinks.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						activeProps: { className: "text-foreground" },
						className: "hover:text-foreground transition-colors",
						children: n.label
					}, n.to))]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 md:gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
					user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden xl:inline text-[10px] font-semibold uppercase tracking-widest text-brand-light px-2.5 py-1 rounded-full border border-brand/30 bg-brand/10",
							children: ROLE_SHORT[user.role]
						}),
						accountLinks.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: l.to,
							activeProps: { className: "text-foreground" },
							className: "hidden md:inline text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-2 transition-colors",
							children: l.label
						}, l.to)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "hidden md:inline-flex",
							onClick: async () => {
								await signOut();
								navigate({ to: "/" });
							},
							children: "Sign out"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden md:flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-3 transition-colors",
							children: "Login"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							className: "bg-brand hover:bg-brand-light text-white text-sm font-medium py-2 px-4 rounded-full transition-colors ring-1 ring-brand/50",
							children: "Register"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						open: mobile,
						onOpenChange: setMobile,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								className: "lg:hidden",
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "right",
							className: "w-80 p-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
								className: "border-b border-white/10 px-5 py-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
									className: "text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-brand-light font-semibold tracking-tight text-xl",
										children: ["HITCH", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: "SA"
										})]
									})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-5 py-4 overflow-y-auto h-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2",
										children: "Marketplace"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2 mb-5",
										children: MARKET_NAV.map((m) => {
											const Icon = m.icon;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: m.to,
													className: "flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-brand/40 transition-colors",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-brand-light" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium",
														children: m.label
													})]
												})
											}, m.to);
										})
									}),
									user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2",
											children: [ROLE_SHORT[user.role], " console"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1 mb-5",
											children: [nav.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: l.to,
													className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }),
														" ",
														l.label
													]
												})
											}, l.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/profile",
													className: "block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5",
													children: "Profile & verification"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											className: "w-full",
											onClick: async () => {
												setMobile(false);
												await signOut();
												navigate({ to: "/" });
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Sign out"]
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2",
											children: "Explore"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-1 mb-5",
											children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: n.to,
													className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "size-4" }),
														" ",
														n.label
													]
												})
											}, n.to))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/login",
													className: "rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium hover:bg-white/5",
													children: "Login"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/register",
													className: "rounded-lg bg-brand hover:bg-brand-light py-2.5 text-center text-sm font-medium text-white ring-1 ring-brand/50",
													children: "Create account"
												})
											})]
										})
									] })
								]
							})]
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { ROLE_TAGLINE as a, ROLE_LABELS as i, REGISTRATION_ROLES as n, SiteNav as o, ROLE_HOME as r, cn as s, Button as t };
