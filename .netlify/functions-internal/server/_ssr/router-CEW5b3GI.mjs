import { i as __toESM, n as __exportAll$1 } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { i as stringType, n as enumType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CEW5b3GI.js
var router_CEW5b3GI_exports = /* @__PURE__ */ __exportAll$1({
	_: () => zar,
	a: () => phoneSchema,
	c: () => AuthService,
	d: () => makeRef,
	f: () => saveJson,
	g: () => useDemo,
	getRouter: () => getRouter,
	h: () => SEED_LISTINGS,
	i: () => passwordSchema,
	l: () => latency,
	m: () => uid,
	n: () => emailSchema,
	o: () => FAQS,
	p: () => storageKey,
	r: () => nameSchema,
	s: () => useAuth,
	t: () => router_exports,
	u: () => loadJson
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-DFKtTbyO.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var KEY = "hitch-demo-state";
var SEED_POSTINGS = [
	{
		id: "p-seed-1",
		type: "ride",
		title: "Sandton → OR Tambo",
		route: "Departs 06:15 · Mon–Fri",
		price: 189,
		capacity: "Sedan · 3 seats",
		status: "live",
		createdAt: Date.now() - 5184e5
	},
	{
		id: "p-seed-2",
		type: "parcel",
		title: "Johannesburg → Pretoria",
		route: "Leaving 09:30 daily",
		price: 65,
		capacity: "Up to 5 kg",
		status: "live",
		createdAt: Date.now() - 3456e5
	},
	{
		id: "p-seed-3",
		type: "freight",
		title: "Durban → Johannesburg",
		route: "Return-load · 21 Jul",
		price: 12400,
		capacity: "Tautliner · 34 t",
		status: "live",
		createdAt: Date.now() - 1728e5
	}
];
var EMPTY = {
	user: null,
	bookings: [{
		id: "b-seed-1",
		ref: "HS-4821",
		type: "ride",
		title: "Rosebank → Lanseria",
		route: "Yesterday 14:20",
		price: 260,
		status: "completed",
		createdAt: Date.now() - 864e5,
		rating: 5
	}, {
		id: "b-seed-2",
		ref: "HS-4907",
		type: "parcel",
		title: "Sandton → Rosebank",
		route: "Docs · < 2 kg",
		price: 45,
		status: "in-transit",
		createdAt: Date.now() - 18e6
	}],
	postings: SEED_POSTINGS,
	balance: 240,
	txns: [{
		id: "t-seed-1",
		label: "Wallet top-up",
		amount: 500,
		method: "Ozow",
		createdAt: Date.now() - 2592e5
	}, {
		id: "t-seed-2",
		label: "Rosebank → Lanseria",
		amount: -260,
		method: "Wallet",
		createdAt: Date.now() - 864e5
	}],
	notifications: [{
		id: "n-seed-1",
		title: "Parcel HS-4907 picked up",
		body: "Your courier is en route to Rosebank. Track live from your dashboard.",
		kind: "trip",
		read: false,
		createdAt: Date.now() - 144e5
	}, {
		id: "n-seed-2",
		title: "Wallet top-up successful",
		body: "R 500 added via Ozow instant EFT.",
		kind: "payment",
		read: true,
		createdAt: Date.now() - 2592e5
	}],
	kyc: {
		status: "unverified",
		idNumber: "",
		phone: "",
		licence: "",
		documents: [
			{
				name: "SA ID / Passport",
				uploaded: false
			},
			{
				name: "Proof of address",
				uploaded: false
			},
			{
				name: "Selfie liveness check",
				uploaded: false
			}
		]
	},
	emergencyContact: "",
	sosLog: []
};
var DemoContext = (0, import_react.createContext)(null);
var uid$1 = () => Math.random().toString(36).slice(2, 9);
var makeRef$1 = () => `HS-${Math.floor(1e3 + Math.random() * 8999)}`;
function DemoProvider({ children }) {
	const [state, setState] = (0, import_react.useState)(EMPTY);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setState({
				...EMPTY,
				...JSON.parse(raw)
			});
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch {}
	}, [state]);
	const pushNote = (s, n) => ({
		...s,
		notifications: [{
			...n,
			id: uid$1(),
			read: false,
			createdAt: Date.now()
		}, ...s.notifications].slice(0, 40)
	});
	const signIn = (0, import_react.useCallback)((user) => setState((s) => ({
		...s,
		user
	})), []);
	const signOut = (0, import_react.useCallback)(() => setState((s) => ({
		...s,
		user: null
	})), []);
	const addBooking = (0, import_react.useCallback)((b) => {
		const booking = {
			...b,
			id: uid$1(),
			ref: makeRef$1(),
			status: "confirmed",
			createdAt: Date.now()
		};
		setState((s) => pushNote({
			...s,
			bookings: [booking, ...s.bookings]
		}, {
			title: `Booking ${booking.ref} confirmed`,
			body: `${booking.title} · ${booking.route}`,
			kind: "trip"
		}));
		return booking;
	}, []);
	const advanceBooking = (0, import_react.useCallback)((id) => {
		const next = {
			confirmed: "in-transit",
			"in-transit": "completed"
		};
		setState((s) => {
			const target = s.bookings.find((b) => b.id === id);
			const updated = {
				...s,
				bookings: s.bookings.map((b) => b.id === id && (b.status === "confirmed" || b.status === "in-transit") ? {
					...b,
					status: next[b.status]
				} : b)
			};
			if (!target || target.status !== "confirmed" && target.status !== "in-transit") return updated;
			return pushNote(updated, {
				title: `${target.ref} ${next[target.status] === "in-transit" ? "in transit" : "completed"}`,
				body: target.title,
				kind: "trip"
			});
		});
	}, []);
	const cancelBooking = (0, import_react.useCallback)((id) => {
		setState((s) => ({
			...s,
			bookings: s.bookings.map((b) => b.id === id ? {
				...b,
				status: "cancelled"
			} : b)
		}));
	}, []);
	const rateBooking = (0, import_react.useCallback)((id, rating) => {
		setState((s) => ({
			...s,
			bookings: s.bookings.map((b) => b.id === id ? {
				...b,
				rating
			} : b)
		}));
	}, []);
	const addPosting = (0, import_react.useCallback)((p) => {
		const posting = {
			...p,
			id: uid$1(),
			status: "live",
			createdAt: Date.now()
		};
		setState((s) => pushNote({
			...s,
			postings: [posting, ...s.postings]
		}, {
			title: "Listing published",
			body: `${posting.title} is live on the marketplace.`,
			kind: "system"
		}));
		return posting;
	}, []);
	const togglePosting = (0, import_react.useCallback)((id) => {
		setState((s) => ({
			...s,
			postings: s.postings.map((p) => p.id === id ? {
				...p,
				status: p.status === "live" ? "paused" : "live"
			} : p)
		}));
	}, []);
	const removePosting = (0, import_react.useCallback)((id) => {
		setState((s) => ({
			...s,
			postings: s.postings.filter((p) => p.id !== id)
		}));
	}, []);
	const topUp = (0, import_react.useCallback)((amount, method) => {
		setState((s) => pushNote({
			...s,
			balance: s.balance + amount,
			txns: [{
				id: uid$1(),
				label: "Wallet top-up",
				amount,
				method,
				createdAt: Date.now()
			}, ...s.txns]
		}, {
			title: "Wallet top-up successful",
			body: `R ${amount} added via ${method}.`,
			kind: "payment"
		}));
	}, []);
	const payFromWallet = (0, import_react.useCallback)((amount, label) => {
		let ok = false;
		setState((s) => {
			if (s.balance < amount) return s;
			ok = true;
			return {
				...s,
				balance: s.balance - amount,
				txns: [{
					id: uid$1(),
					label,
					amount: -amount,
					method: "Wallet",
					createdAt: Date.now()
				}, ...s.txns]
			};
		});
		return ok;
	}, []);
	const withdraw = (0, import_react.useCallback)((amount) => {
		let ok = false;
		setState((s) => {
			if (s.balance < amount) return s;
			ok = true;
			return {
				...s,
				balance: s.balance - amount,
				txns: [{
					id: uid$1(),
					label: "Payout to bank account",
					amount: -amount,
					method: "Payout",
					createdAt: Date.now()
				}, ...s.txns]
			};
		});
		return ok;
	}, []);
	const notify = (0, import_react.useCallback)((n) => setState((s) => pushNote(s, n)), []);
	const markAllRead = (0, import_react.useCallback)(() => setState((s) => ({
		...s,
		notifications: s.notifications.map((n) => ({
			...n,
			read: true
		}))
	})), []);
	const clearNotifications = (0, import_react.useCallback)(() => setState((s) => ({
		...s,
		notifications: []
	})), []);
	const submitKyc = (0, import_react.useCallback)((k) => {
		setState((s) => pushNote({
			...s,
			kyc: {
				...s.kyc,
				...k,
				status: "pending"
			}
		}, {
			title: "Verification submitted",
			body: "Our compliance team reviews most profiles within 4 hours.",
			kind: "system"
		}));
		setTimeout(() => {
			setState((s) => s.kyc.status === "pending" ? {
				...s,
				kyc: {
					...s.kyc,
					status: "verified"
				}
			} : s);
		}, 4e3);
	}, []);
	const uploadKycDoc = (0, import_react.useCallback)((name) => {
		setState((s) => ({
			...s,
			kyc: {
				...s.kyc,
				documents: s.kyc.documents.map((d) => d.name === name ? {
					...d,
					uploaded: true
				} : d)
			}
		}));
	}, []);
	const setEmergencyContact = (0, import_react.useCallback)((v) => setState((s) => ({
		...s,
		emergencyContact: v
	})), []);
	const triggerSos = (0, import_react.useCallback)((where) => {
		setState((s) => pushNote({
			...s,
			sosLog: [{
				id: uid$1(),
				at: Date.now(),
				where
			}, ...s.sosLog]
		}, {
			title: "SOS dispatched",
			body: `Live location shared with the HITCH SA safety desk and your emergency contact.`,
			kind: "safety"
		}));
	}, []);
	const reset = (0, import_react.useCallback)(() => setState(EMPTY), []);
	const value = (0, import_react.useMemo)(() => ({
		...state,
		signIn,
		signOut,
		addBooking,
		advanceBooking,
		cancelBooking,
		rateBooking,
		addPosting,
		togglePosting,
		removePosting,
		topUp,
		payFromWallet,
		withdraw,
		notify,
		markAllRead,
		clearNotifications,
		submitKyc,
		uploadKycDoc,
		setEmergencyContact,
		triggerSos,
		reset
	}), [
		state,
		signIn,
		signOut,
		addBooking,
		advanceBooking,
		cancelBooking,
		rateBooking,
		addPosting,
		togglePosting,
		removePosting,
		topUp,
		payFromWallet,
		withdraw,
		notify,
		markAllRead,
		clearNotifications,
		submitKyc,
		uploadKycDoc,
		setEmergencyContact,
		triggerSos,
		reset
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoContext.Provider, {
		value,
		children
	});
}
function useDemo() {
	const ctx = (0, import_react.useContext)(DemoContext);
	if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
	return ctx;
}
var zar = (n) => `R ${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
var SEED_OPERATOR_ID = "seed-operator";
var SEED_LISTINGS = [
	{
		id: "ride-1",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Sandton → OR Tambo",
		from: "Sandton",
		to: "OR Tambo",
		when: "Departs 06:15 · Mon–Fri",
		price: 189,
		capacity: "Sedan · 3 seats",
		seats: 3,
		meta: [
			"35 min",
			"Fixed fare",
			"Verified driver"
		],
		rating: 4.9,
		tags: ["Airport", "Corporate"],
		status: "live",
		createdAt: Date.now() - 5184e5
	},
	{
		id: "ride-2",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Cape Town → Stellenbosch",
		from: "Cape Town",
		to: "Stellenbosch",
		when: "Departs 07:00 · Daily",
		price: 145,
		capacity: "SUV · 4 seats",
		seats: 4,
		meta: [
			"55 min",
			"Split fare",
			"SAPS-screened"
		],
		rating: 4.8,
		tags: ["Commuter"],
		status: "live",
		createdAt: Date.now() - 432e6
	},
	{
		id: "ride-3",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Umhlanga → Durban CBD",
		from: "Umhlanga",
		to: "Durban CBD",
		when: "Departs 06:45 · Mon–Fri",
		price: 95,
		capacity: "Hatch · 2 seats",
		seats: 2,
		meta: [
			"25 min",
			"Corporate wallet",
			"Verified driver"
		],
		rating: 5,
		tags: ["Verified", "Wallet"],
		status: "live",
		createdAt: Date.now() - 3456e5
	},
	{
		id: "ride-4",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Rosebank → Lanseria",
		from: "Rosebank",
		to: "Lanseria",
		when: "On-demand · 24/7",
		price: 260,
		capacity: "Sedan · 4 seats",
		seats: 4,
		meta: [
			"40 min",
			"Fixed fare",
			"Verified driver"
		],
		rating: 4.9,
		tags: ["Airport"],
		status: "live",
		createdAt: Date.now() - 2592e5
	},
	{
		id: "ride-5",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Pretoria → Bloemfontein",
		from: "Pretoria",
		to: "Bloemfontein",
		when: "Departs Fri 15:00",
		price: 520,
		capacity: "SUV · 3 seats",
		seats: 3,
		meta: [
			"4h 30m",
			"Split fare",
			"Verified driver"
		],
		rating: 4.7,
		tags: ["Weekend"],
		status: "live",
		createdAt: Date.now() - 1728e5
	},
	{
		id: "ride-6",
		ownerId: SEED_OPERATOR_ID,
		type: "ride",
		title: "Century City → V&A Waterfront",
		from: "Century City",
		to: "V&A Waterfront",
		when: "Departs 07:30 · Mon–Fri",
		price: 78,
		capacity: "Sedan · 3 seats",
		seats: 3,
		meta: [
			"20 min",
			"Corporate wallet",
			"Verified driver"
		],
		rating: 4.9,
		tags: ["Commuter"],
		status: "live",
		createdAt: Date.now() - 864e5
	},
	{
		id: "parcel-1",
		ownerId: SEED_OPERATOR_ID,
		type: "parcel",
		title: "Johannesburg → Pretoria",
		from: "Johannesburg",
		to: "Pretoria",
		when: "Driver leaving 09:30",
		price: 65,
		capacity: "Up to 5 kg",
		seats: 12,
		meta: ["Signature on delivery", "Live GPS"],
		rating: 4.9,
		tags: ["Insured", "Same-day"],
		status: "live",
		createdAt: Date.now() - 3456e5
	},
	{
		id: "parcel-2",
		ownerId: SEED_OPERATOR_ID,
		type: "parcel",
		title: "Cape Town → George",
		from: "Cape Town",
		to: "George",
		when: "Departs 18:00 today",
		price: 180,
		capacity: "Up to 20 kg",
		seats: 8,
		meta: ["Photo proof", "Insured to R5k"],
		rating: 4.8,
		tags: ["Overnight"],
		status: "live",
		createdAt: Date.now() - 2592e5
	},
	{
		id: "parcel-3",
		ownerId: SEED_OPERATOR_ID,
		type: "parcel",
		title: "Sandton → Rosebank",
		from: "Sandton",
		to: "Rosebank",
		when: "Pickup in 15 min",
		price: 45,
		capacity: "Docs · < 2 kg",
		seats: 20,
		meta: ["45 min ETA", "Live GPS"],
		rating: 5,
		tags: ["Express", "Docs"],
		status: "live",
		createdAt: Date.now() - 1728e5
	},
	{
		id: "parcel-4",
		ownerId: SEED_OPERATOR_ID,
		type: "parcel",
		title: "Durban → Pietermaritzburg",
		from: "Durban",
		to: "Pietermaritzburg",
		when: "Driver leaving 11:00",
		price: 95,
		capacity: "Up to 10 kg",
		seats: 10,
		meta: ["Signature on delivery", "Insured"],
		rating: 4.7,
		tags: ["Same-day"],
		status: "live",
		createdAt: Date.now() - 864e5
	},
	{
		id: "freight-1",
		ownerId: SEED_OPERATOR_ID,
		type: "freight",
		title: "Durban → Johannesburg",
		from: "Durban",
		to: "Johannesburg",
		when: "Available 21 Jul · 34-ton capacity",
		price: 12400,
		capacity: "34 t · 82 m³",
		seats: 1,
		meta: ["Tautliner", "Cross-dock ready"],
		rating: 4.9,
		tags: ["Verified", "Insured"],
		status: "live",
		createdAt: Date.now() - 2592e5
	},
	{
		id: "freight-2",
		ownerId: SEED_OPERATOR_ID,
		type: "freight",
		title: "Cape Town → Port Elizabeth",
		from: "Cape Town",
		to: "Port Elizabeth",
		when: "Available 22 Jul · 18-ton capacity",
		price: 8600,
		capacity: "18 t · 40 m³",
		seats: 1,
		meta: ["Refrigerated", "Temp-controlled"],
		rating: 4.8,
		tags: ["Cold-chain"],
		status: "live",
		createdAt: Date.now() - 1728e5
	},
	{
		id: "freight-3",
		ownerId: SEED_OPERATOR_ID,
		type: "freight",
		title: "Bloemfontein → Kimberley",
		from: "Bloemfontein",
		to: "Kimberley",
		when: "Available today · 8-ton capacity",
		price: 4200,
		capacity: "8 t · 22 m³",
		seats: 1,
		meta: ["Flatbed", "Same-day"],
		rating: 4.7,
		tags: ["Same-day"],
		status: "live",
		createdAt: Date.now() - 864e5
	},
	{
		id: "freight-4",
		ownerId: SEED_OPERATOR_ID,
		type: "freight",
		title: "Johannesburg → Gaborone",
		from: "Johannesburg",
		to: "Gaborone",
		when: "Available 23 Jul · 26-ton capacity",
		price: 18900,
		capacity: "26 t · 68 m³",
		seats: 1,
		meta: ["Tautliner", "SAD-500 assist"],
		rating: 4.9,
		tags: ["Cross-border"],
		status: "live",
		createdAt: Date.now() - 864e5
	},
	{
		id: "flight-1",
		ownerId: SEED_OPERATOR_ID,
		type: "flight",
		title: "JNB → CPT",
		from: "JNB",
		to: "CPT",
		when: "Charter · King Air 350 · 21 Jul 14:20",
		price: 2950,
		capacity: "4 seats left",
		seats: 4,
		meta: ["2h 10m", "Lanseria"],
		rating: 4.9,
		tags: ["Charter", "Empty-leg"],
		status: "live",
		createdAt: Date.now() - 3456e5
	},
	{
		id: "flight-2",
		ownerId: SEED_OPERATOR_ID,
		type: "flight",
		title: "CPT → DUR",
		from: "CPT",
		to: "DUR",
		when: "Regional · Embraer E190 · 22 Jul 08:15",
		price: 1480,
		capacity: "11 seats left",
		seats: 11,
		meta: ["2h 05m", "Direct"],
		rating: 4.7,
		tags: ["Scheduled"],
		status: "live",
		createdAt: Date.now() - 2592e5
	},
	{
		id: "flight-3",
		ownerId: SEED_OPERATOR_ID,
		type: "flight",
		title: "JNB → George",
		from: "JNB",
		to: "George",
		when: "Charter · Pilatus PC-12 · 23 Jul 09:00",
		price: 4200,
		capacity: "6 seats left",
		seats: 6,
		meta: ["2h 25m", "Lanseria"],
		rating: 5,
		tags: ["Charter"],
		status: "live",
		createdAt: Date.now() - 1728e5
	},
	{
		id: "flight-4",
		ownerId: SEED_OPERATOR_ID,
		type: "flight",
		title: "DUR → JNB",
		from: "DUR",
		to: "JNB",
		when: "Charter · Citation CJ2 · 24 Jul 17:40",
		price: 3100,
		capacity: "3 seats left",
		seats: 3,
		meta: ["1h 05m", "King Shaka"],
		rating: 4.9,
		tags: ["Business jet"],
		status: "live",
		createdAt: Date.now() - 864e5
	},
	{
		id: "school-1",
		ownerId: SEED_OPERATOR_ID,
		type: "school",
		title: "Sandringham → St Stithians",
		from: "Sandringham",
		to: "St Stithians",
		when: "Mon–Fri · Seats: 3 open",
		price: 1850,
		capacity: "Monthly · per child",
		seats: 3,
		meta: [
			"Vetted operator",
			"Live GPS",
			"Parent SMS"
		],
		rating: 5,
		tags: ["SAPS-verified"],
		status: "live",
		createdAt: Date.now() - 5184e5
	},
	{
		id: "school-2",
		ownerId: SEED_OPERATOR_ID,
		type: "school",
		title: "Bellville → Rondebosch Boys",
		from: "Bellville",
		to: "Rondebosch Boys",
		when: "Mon–Fri · Seats: 2 open",
		price: 1250,
		capacity: "Monthly · per child",
		seats: 2,
		meta: [
			"Vetted operator",
			"Live GPS",
			"Parent app"
		],
		rating: 4.9,
		tags: ["Verified"],
		status: "live",
		createdAt: Date.now() - 432e6
	},
	{
		id: "school-3",
		ownerId: SEED_OPERATOR_ID,
		type: "school",
		title: "Umhlanga → Durban Girls'",
		from: "Umhlanga",
		to: "Durban Girls'",
		when: "Mon–Fri · Seats: 4 open",
		price: 1780,
		capacity: "Monthly · per child",
		seats: 4,
		meta: [
			"Vetted operator",
			"Live GPS",
			"Parent SMS"
		],
		rating: 4.8,
		tags: ["SAPS-verified"],
		status: "live",
		createdAt: Date.now() - 3456e5
	},
	{
		id: "school-4",
		ownerId: SEED_OPERATOR_ID,
		type: "school",
		title: "Pretoria East → Sport Fields",
		from: "Pretoria East",
		to: "Sport Fields",
		when: "Tue/Thu · Seats: 6 open",
		price: 950,
		capacity: "Per term · per child",
		seats: 6,
		meta: [
			"Vetted operator",
			"Live GPS",
			"Coach coordinated"
		],
		rating: 4.9,
		tags: ["Sport"],
		status: "live",
		createdAt: Date.now() - 2592e5
	}
];
var DEMO_ACCOUNTS = [
	{
		email: "traveler@hitch.sa",
		password: "Hitch#2026",
		firstName: "Thabo",
		lastName: "Nkosi",
		phone: "+27 82 123 4567",
		role: "traveler"
	},
	{
		email: "driver@hitch.sa",
		password: "Hitch#2026",
		firstName: "Lerato",
		lastName: "Mokoena",
		phone: "+27 83 222 3344",
		role: "driver"
	},
	{
		email: "trucker@hitch.sa",
		password: "Hitch#2026",
		firstName: "Sipho",
		lastName: "Dlamini",
		phone: "+27 84 555 6677",
		role: "trucker"
	},
	{
		email: "airline@hitch.sa",
		password: "Hitch#2026",
		firstName: "Aisha",
		lastName: "Patel",
		phone: "+27 82 888 9900",
		role: "airline"
	},
	{
		email: "school@hitch.sa",
		password: "Hitch#2026",
		firstName: "Naledi",
		lastName: "Khumalo",
		phone: "+27 83 444 5566",
		role: "school"
	},
	{
		email: "business@hitch.sa",
		password: "Hitch#2026",
		firstName: "Pieter",
		lastName: "Botha",
		phone: "+27 82 777 8899",
		role: "business"
	},
	{
		email: "admin@hitch.sa",
		password: "Hitch#2026",
		firstName: "Gladwin",
		lastName: "Malishe",
		phone: "+27 73 165 4427",
		role: "admin"
	}
];
var PREFIX = "hitch-sa:";
function storageKey(...parts) {
	return [PREFIX, ...parts].join(":");
}
function loadJson(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function saveJson(key, value) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function removeKey(key) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(key);
	} catch {}
}
var uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
var makeRef = (prefix = "HS") => {
	return `${prefix}-${Math.floor(1e3 + Math.random() * 8999)}`;
};
/** Simulated network latency so loading states behave like a real API. */
function latency(ms = 350) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
var USERS_KEY = storageKey("db", "users");
var SESSION_KEY = storageKey("session");
async function sha256(text) {
	if (typeof crypto !== "undefined" && crypto.subtle) {
		const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
		return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	let hash = 5381;
	for (let i = 0; i < text.length; i++) hash = hash * 33 ^ text.charCodeAt(i);
	return `fallback-${(hash >>> 0).toString(16)}`;
}
function publicUser(u) {
	return {
		id: u.id,
		firstName: u.firstName,
		lastName: u.lastName,
		email: u.email,
		phone: u.phone,
		role: u.role,
		status: u.status,
		twoFactorEnabled: u.twoFactorEnabled,
		kyc: u.kyc,
		emergencyContact: u.emergencyContact,
		emergencyNumber: u.emergencyNumber,
		preferences: u.preferences,
		createdAt: u.createdAt
	};
}
function readUsers() {
	return loadJson(USERS_KEY, []);
}
function writeUsers(users) {
	saveJson(USERS_KEY, users);
}
function makeKyc(idType) {
	return {
		identityStatus: "unverified",
		faceStatus: "unverified",
		phoneStatus: "unverified",
		driverStatus: "unverified",
		vehicleStatus: "unverified",
		idType,
		idNumber: "",
		licenceNumber: "",
		documents: [
			{
				id: "doc-id",
				name: "SA ID / Passport",
				kind: "id",
				uploaded: false
			},
			{
				id: "doc-selfie",
				name: "Selfie liveness check",
				kind: "selfie",
				uploaded: false
			},
			{
				id: "doc-address",
				name: "Proof of address",
				kind: "address",
				uploaded: false
			},
			{
				id: "doc-licence",
				name: "Driver's licence",
				kind: "licence",
				uploaded: false
			},
			{
				id: "doc-vehicle",
				name: "Vehicle registration & photos",
				kind: "vehicle",
				uploaded: false
			}
		]
	};
}
var AuthService = {
	async register(input) {
		await latency(500);
		const users = readUsers();
		const email = input.email.trim().toLowerCase();
		if (users.some((u) => u.email === email)) throw new Error("An account with this email already exists. Try signing in.");
		if (users.some((u) => u.phone === input.phone.trim())) throw new Error("This mobile number is already registered.");
		const passwordHash = await sha256(`hitch-sa::${input.email.toLowerCase()}::${input.password}`);
		const user = {
			id: uid(),
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
			email,
			phone: input.phone.trim(),
			role: input.role,
			status: "active",
			passwordHash,
			twoFactorEnabled: false,
			kyc: {
				...makeKyc(input.idType),
				idNumber: input.idNumber.trim(),
				identityStatus: "pending",
				phoneStatus: "pending"
			},
			emergencyContact: "",
			emergencyNumber: "",
			preferences: {
				push: true,
				sms: true,
				email: true,
				marketing: false
			},
			createdAt: Date.now()
		};
		writeUsers([...users, user]);
		saveJson(SESSION_KEY, publicUser(user));
		return publicUser(user);
	},
	async login(email, password) {
		await latency(450);
		const users = readUsers();
		const normalized = email.trim().toLowerCase();
		const user = users.find((u) => u.email === normalized);
		if (!user) throw new Error("No account found for that email address.");
		if (user.status === "suspended") throw new Error("This account has been suspended. Contact support for assistance.");
		if (await sha256(`hitch-sa::${normalized}::${password}`) !== user.passwordHash) throw new Error("Incorrect password. Please try again.");
		saveJson(SESSION_KEY, publicUser(user));
		return publicUser(user);
	},
	async currentSession() {
		const raw = loadJson(SESSION_KEY, null);
		if (!raw) return null;
		const live = readUsers().find((u) => u.id === raw.id);
		return live ? publicUser(live) : null;
	},
	async refreshSession() {
		await latency(80);
		return this.currentSession();
	},
	async logout() {
		removeKey(SESSION_KEY);
	},
	async requestOtp(email) {
		await latency(400);
		if (!readUsers().some((u) => u.email === email.trim().toLowerCase())) throw new Error("No account found for that email address.");
		return "482913";
	},
	async resetPassword(email, newPassword) {
		await latency(500);
		const users = readUsers();
		const normalized = email.trim().toLowerCase();
		const idx = users.findIndex((u) => u.email === normalized);
		if (idx === -1) throw new Error("No account found for that email address.");
		const updated = [...users];
		updated[idx] = {
			...updated[idx],
			passwordHash: await sha256(`hitch-sa::${normalized}::${newPassword}`)
		};
		writeUsers(updated);
	},
	async updateUser(updates) {
		await latency(250);
		const users = readUsers();
		const idx = users.findIndex((u) => u.id === updates.id);
		if (idx === -1) throw new Error("Account not found.");
		const merged = {
			...users[idx],
			...updates,
			id: users[idx].id
		};
		const next = [...users];
		next[idx] = merged;
		writeUsers(next);
		saveJson(SESSION_KEY, publicUser(merged));
		return publicUser(merged);
	},
	async allUsers() {
		await latency(300);
		return readUsers().map(publicUser);
	},
	/**
	* Simulated verification steps per the BRS: ID check, phone OTP, selfie
	* liveness. Marks the relevant KYC status verified on the live user.
	*/
	async verifyStep(userId, step, code) {
		await latency(700);
		const users = readUsers();
		const idx = users.findIndex((u) => u.id === userId);
		if (idx === -1) throw new Error("Account not found.");
		if (step === "phone" && code !== "482913") throw new Error("That OTP is incorrect. Use 482913 for this demo.");
		const user = users[idx];
		const kyc = { ...user.kyc };
		if (step === "identity") kyc.identityStatus = "verified";
		if (step === "phone") kyc.phoneStatus = "verified";
		if (step === "face") kyc.faceStatus = "verified";
		const merged = {
			...user,
			kyc
		};
		const next = [...users];
		next[idx] = merged;
		writeUsers(next);
		saveJson(SESSION_KEY, publicUser(merged));
		return publicUser(merged);
	},
	/** Seeded accounts so reviewers can sign in instantly. Runs on first boot. */ async ensureDemoAccounts() {
		if (readUsers().length > 0) return;
		writeUsers(await Promise.all(DEMO_ACCOUNTS.map(async (d) => {
			const passwordHash = await sha256(`hitch-sa::${d.email}::${d.password}`);
			return {
				id: uid(),
				firstName: d.firstName,
				lastName: d.lastName,
				email: d.email,
				phone: d.phone,
				role: d.role,
				status: "active",
				passwordHash,
				twoFactorEnabled: false,
				kyc: {
					...makeKyc("sa-id"),
					idNumber: "9202205084083",
					identityStatus: "verified",
					faceStatus: "verified",
					phoneStatus: "verified",
					driverStatus: "verified",
					vehicleStatus: "verified"
				},
				emergencyContact: "",
				emergencyNumber: "",
				preferences: {
					push: true,
					sms: true,
					email: true,
					marketing: false
				},
				createdAt: Date.now()
			};
		})));
	},
	/** Admin approval of driver or vehicle verification (BRS §23). */
	async approveDoc(userId, kind, decision) {
		await latency(400);
		const users = readUsers();
		const idx = users.findIndex((u) => u.id === userId);
		if (idx === -1) throw new Error("Account not found.");
		const user = users[idx];
		const kyc = { ...user.kyc };
		if (kind === "driver") kyc.driverStatus = decision === "approved" ? "verified" : "rejected";
		if (kind === "vehicle") kyc.vehicleStatus = decision === "approved" ? "verified" : "rejected";
		const merged = {
			...user,
			kyc
		};
		const next = [...users];
		next[idx] = merged;
		writeUsers(next);
		saveJson(SESSION_KEY, publicUser(merged));
		return publicUser(merged);
	},
	/** Admin suspension or reactivation of a member (BRS §23). */
	async setUserStatus(userId, status) {
		await latency(350);
		const users = readUsers();
		const idx = users.findIndex((u) => u.id === userId);
		if (idx === -1) throw new Error("Account not found.");
		const merged = {
			...users[idx],
			status
		};
		const next = [...users];
		next[idx] = merged;
		writeUsers(next);
		return publicUser(merged);
	}
};
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		(async () => {
			await AuthService.ensureDemoAccounts();
			const session = await AuthService.currentSession();
			if (active) {
				setUser(session);
				setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
	}, []);
	const value = {
		user,
		loading,
		signIn: (0, import_react.useCallback)(async (email, password) => {
			const u = await AuthService.login(email, password);
			setUser(u);
			return u;
		}, []),
		signUp: (0, import_react.useCallback)(async (input) => {
			const u = await AuthService.register(input);
			setUser(u);
			return u;
		}, []),
		signOut: (0, import_react.useCallback)(async () => {
			await AuthService.logout();
			setUser(null);
		}, []),
		refresh: (0, import_react.useCallback)(async () => {
			const u = await AuthService.refreshSession();
			setUser(u);
		}, []),
		setUser
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$35 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "HITCH SA — Moving in one direction." },
			{
				name: "description",
				content: "HITCH SA is South Africa's unified mobility marketplace — rides, parcels, freight return-loads, empty airline seats, and school transport on one platform."
			},
			{
				name: "author",
				content: "HITCH SA"
			},
			{
				name: "theme-color",
				content: "#09090b"
			},
			{
				property: "og:site_name",
				content: "HITCH SA"
			},
			{
				property: "og:title",
				content: "HITCH SA — Moving in one direction."
			},
			{
				property: "og:description",
				content: "South Africa's unified mobility marketplace: rides, parcels, freight, flights, school transport."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "HITCH SA — Moving in one direction."
			},
			{
				name: "twitter:description",
				content: "South Africa's unified mobility marketplace."
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: ""
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
var THEME_INIT = `(function(){try{var t=localStorage.getItem('hitch-theme')||'dark';var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(t);r.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		style: { colorScheme: "dark" },
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_INIT } }),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$35.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) })
	});
}
var $$splitComponentImporter$34 = () => import("./routes-BuVgkHg3.mjs");
var Route$34 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$34, "component"),
	head: () => ({
		meta: [
			{ title: "HITCH SA — Moving in one direction." },
			{
				name: "description",
				content: "South Africa's unified mobility marketplace. Rides, parcels, freight return-loads, empty airline seats and school transport — one platform."
			},
			{
				property: "og:url",
				content: "/"
			}
		],
		links: [{
			rel: "canonical",
			href: "/"
		}]
	})
});
var $$splitComponentImporter$33 = () => import("./about-DE1Kifac.mjs");
var Route$33 = createFileRoute("/about")({
	component: lazyRouteComponent($$splitComponentImporter$33, "component"),
	head: () => ({
		meta: [
			{ title: "About — HITCH SA" },
			{
				name: "description",
				content: "HITCH SA is a cutting-edge digital mobility platform reimagining the classic hitchhiking experience into a safe, secure and tech-savvy transportation ecosystem."
			},
			{
				property: "og:title",
				content: "About — HITCH SA"
			},
			{
				property: "og:description",
				content: "South Africa's unified mobility, hitchhiking and logistics platform."
			},
			{
				property: "og:url",
				content: "/about"
			}
		],
		links: [{
			rel: "canonical",
			href: "/about"
		}]
	})
});
var $$splitComponentImporter$32 = () => import("./admin-DINqd-zt.mjs");
var Route$32 = createFileRoute("/admin")({
	component: lazyRouteComponent($$splitComponentImporter$32, "component"),
	head: () => ({ meta: [
		{ title: "Admin console — HITCH SA" },
		{
			name: "description",
			content: "Platform administration: members, driver & vehicle approvals, and support."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$31 = () => import("./airline-C3fwMwLX.mjs");
var Route$31 = createFileRoute("/airline")({
	component: lazyRouteComponent($$splitComponentImporter$31, "component"),
	head: () => ({ meta: [
		{ title: "Airline console — HITCH SA" },
		{
			name: "description",
			content: "Go online, accept seat reservation requests on scheduled legs, manage boarding and watch your HITCH SA revenue build."
		},
		{
			property: "og:title",
			content: "Airline console — HITCH SA"
		},
		{
			property: "og:description",
			content: "Bolt-style airline console: online toggle, seat requests, boarding, revenue."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$30 = () => import("./business-DfmLQlYH.mjs");
var Route$30 = createFileRoute("/business")({
	component: lazyRouteComponent($$splitComponentImporter$30, "component"),
	head: () => ({ meta: [
		{ title: "Business console — HITCH SA" },
		{
			name: "description",
			content: "Go online, accept staff and cargo movement requests, dispatch your fleet and manage volume logistics."
		},
		{
			property: "og:title",
			content: "Business console — HITCH SA"
		},
		{
			property: "og:description",
			content: "Bolt-style business console: dispatch, cargo movement, fleet, volume pricing."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$29 = () => import("./careers-Ckjh3bfc.mjs");
var Route$29 = createFileRoute("/careers")({
	component: lazyRouteComponent($$splitComponentImporter$29, "component"),
	head: () => ({
		meta: [
			{ title: "Careers — HITCH SA" },
			{
				name: "description",
				content: "Join HITCH SA. Open engineering, design, operations and driver-experience roles in Sandton, Cape Town and Durban."
			},
			{
				property: "og:title",
				content: "Careers — HITCH SA"
			},
			{
				property: "og:description",
				content: "Help us move a country in one direction."
			},
			{
				property: "og:url",
				content: "/careers"
			}
		],
		links: [{
			rel: "canonical",
			href: "/careers"
		}]
	})
});
var $$splitComponentImporter$28 = () => import("./commute-D4xExbY4.mjs");
var Route$28 = createFileRoute("/commute")({
	component: lazyRouteComponent($$splitComponentImporter$28, "component"),
	head: () => ({ meta: [
		{ title: "Commute — HITCH SA" },
		{
			name: "description",
			content: "Recurring commute plans, carpool cost sharing and monthly commuter passes."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$27 = () => import("./contact-CjOuxwyp.mjs");
var Route$27 = createFileRoute("/contact")({
	component: lazyRouteComponent($$splitComponentImporter$27, "component"),
	head: () => ({
		meta: [
			{ title: "Contact — HITCH SA" },
			{
				name: "description",
				content: "Get in touch with HITCH SA — sales, partnerships, press and general enquiries. Sandton HQ."
			},
			{
				property: "og:title",
				content: "Contact — HITCH SA"
			},
			{
				property: "og:description",
				content: "Talk to the HITCH SA team."
			},
			{
				property: "og:url",
				content: "/contact"
			}
		],
		links: [{
			rel: "canonical",
			href: "/contact"
		}]
	})
});
var $$splitComponentImporter$26 = () => import("./dashboard-DeUMgPdE.mjs");
var Route$26 = createFileRoute("/dashboard")({
	component: lazyRouteComponent($$splitComponentImporter$26, "component"),
	head: () => ({ meta: [
		{ title: "Dashboard — HITCH SA" },
		{
			name: "description",
			content: "Your personal travel hub: bookings, wallet and verification across HITCH SA."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$25 = () => import("./drive-CccO4rrA.mjs");
var Route$25 = createFileRoute("/drive")({
	component: lazyRouteComponent($$splitComponentImporter$25, "component"),
	head: () => ({ meta: [
		{ title: "Driver mode — HITCH SA" },
		{
			name: "description",
			content: "Go online, accept nearby ride requests, navigate the trip and watch your HITCH SA earnings build in real time."
		},
		{
			property: "og:title",
			content: "Driver mode — HITCH SA"
		},
		{
			property: "og:description",
			content: "Bolt-style driver console: online toggle, live requests, earnings."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var FAQS = [
	{
		q: "Which cities does HITCH SA operate in?",
		a: "We're live across all nine South African provinces, with the deepest coverage in Gauteng, Western Cape and KwaZulu-Natal. Regional coverage varies by vertical."
	},
	{
		q: "How are drivers verified?",
		a: "Every driver clears a 5-tier check: SA ID verification, PrDP validation, criminal record check via SAPS partners, vehicle roadworthy inspection, and platform onboarding assessment."
	},
	{
		q: "How does the wallet work?",
		a: "Your HITCH wallet holds funds for rides, parcels, freight, seats and school transport. Top up via PayFast, Ozow or card. Operators receive payouts to their linked bank account."
	},
	{
		q: "What happens if I have an emergency during a trip?",
		a: "Tap the in-app SOS button. Your live location, trip and driver details are sent to our 24/7 operations centre, your emergency contacts and — if you opt in — private security response."
	},
	{
		q: "Can businesses integrate HITCH into their systems?",
		a: "Yes. Our enterprise API covers bookings, tracking, invoicing and webhooks. Contact sales for SLAs, SSO and white-label options."
	},
	{
		q: "Is HITCH POPIA compliant?",
		a: "Yes. All personal data is stored on encrypted infrastructure inside South Africa, processed under a POPIA-registered Information Officer, and available for export or deletion on request."
	}
];
var $$splitComponentImporter$24 = () => import("./faq-Dd_3VbvF.mjs");
var Route$24 = createFileRoute("/faq")({
	component: lazyRouteComponent($$splitComponentImporter$24, "component"),
	head: () => ({
		meta: [
			{ title: "FAQ — HITCH SA" },
			{
				name: "description",
				content: "Answers to the most common questions about HITCH SA — accounts, payments, safety, drivers and business features."
			},
			{
				property: "og:title",
				content: "FAQ — HITCH SA"
			},
			{
				property: "og:description",
				content: "The most common questions, answered."
			},
			{
				property: "og:url",
				content: "/faq"
			}
		],
		links: [{
			rel: "canonical",
			href: "/faq"
		}],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: FAQS.map((f) => ({
					"@type": "Question",
					name: f.q,
					acceptedAnswer: {
						"@type": "Answer",
						text: f.a
					}
				}))
			})
		}]
	})
});
var $$splitComponentImporter$23 = () => import("./features-D2IfWEab.mjs");
var Route$23 = createFileRoute("/features")({
	component: lazyRouteComponent($$splitComponentImporter$23, "component"),
	head: () => ({
		meta: [
			{ title: "Features — HITCH SA" },
			{
				name: "description",
				content: "HITCH SA's complete mobility toolkit: verified rides, parcels, truck return-loads, airline seats, school transport, commuter plans, escrow payments, GPS tracking, SOS, ratings and analytics."
			},
			{
				property: "og:title",
				content: "Features — HITCH SA"
			},
			{
				property: "og:description",
				content: "Every HITCH SA module: registration, verification, matching, payments, safety and analytics."
			},
			{
				property: "og:url",
				content: "/features"
			}
		],
		links: [{
			rel: "canonical",
			href: "/features"
		}]
	})
});
var $$splitComponentImporter$22 = () => import("./flights-D-yhwEn9.mjs");
var Route$22 = createFileRoute("/flights")({
	component: lazyRouteComponent($$splitComponentImporter$22, "component"),
	head: () => ({ meta: [{ title: "Empty seats — HITCH SA" }, {
		name: "description",
		content: "Book empty seats on scheduled and charter flights across South Africa at last-minute fares."
	}] })
});
var emailSchema = stringType().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address");
var nameSchema = stringType().trim().min(2, "Must be at least 2 characters").max(40, "Must be under 40 characters").regex(/^[a-zA-ZÀ-ÿ' -]+$/, "Letters, spaces and hyphens only");
var phoneSchema = stringType().trim().min(1, "Mobile number is required").regex(/^(\+27|0027|0)[0-9]{9}$/, "Use a South African number, e.g. +27 82 123 4567");
var passwordSchema = stringType().min(12, "At least 12 characters").regex(/[A-Z]/, "Add an uppercase letter").regex(/[a-z]/, "Add a lowercase letter").regex(/[0-9]/, "Add a number").regex(/[^A-Za-z0-9]/, "Add a symbol");
stringType().trim().min(2, "Enter a contact name").max(60, "Keep it under 60 characters");
var $$splitComponentImporter$21 = () => import("./forgot-password-yzhubDdn.mjs");
var Route$21 = createFileRoute("/forgot-password")({
	component: lazyRouteComponent($$splitComponentImporter$21, "component"),
	head: () => ({ meta: [
		{ title: "Reset password — HITCH SA" },
		{
			name: "description",
			content: "Reset your HITCH SA password."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
objectType({ email: emailSchema });
objectType({
	password: passwordSchema,
	confirm: stringType()
}).refine((d) => d.password === d.confirm, {
	path: ["confirm"],
	message: "Passwords do not match."
});
var $$splitComponentImporter$20 = () => import("./freight-CD4DOpDj.mjs");
var Route$20 = createFileRoute("/freight")({
	component: lazyRouteComponent($$splitComponentImporter$20, "component"),
	head: () => ({ meta: [{ title: "Freight return-loads — HITCH SA" }, {
		name: "description",
		content: "Fill empty return legs. Match cargo with trucks already heading your direction across Southern Africa."
	}] })
});
var $$splitComponentImporter$19 = () => import("./login-2fuMxFO5.mjs");
var Route$19 = createFileRoute("/login")({
	component: lazyRouteComponent($$splitComponentImporter$19, "component"),
	head: () => ({ meta: [
		{ title: "Login — HITCH SA" },
		{
			name: "description",
			content: "Sign in to your HITCH SA account."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
objectType({
	email: emailSchema,
	password: stringType().min(1, "Password is required")
});
var $$splitComponentImporter$18 = () => import("./notifications-ACVTJg6Q.mjs");
var Route$18 = createFileRoute("/notifications")({
	head: () => ({ meta: [
		{ title: "Notifications — HITCH SA" },
		{
			name: "description",
			content: "Every HITCH SA trip milestone, payment receipt and safety alert in one activity feed."
		},
		{
			property: "og:title",
			content: "Notifications — HITCH SA"
		},
		{
			property: "og:description",
			content: "Trip, payment and safety alerts across the HITCH SA mobility marketplace."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./parcels-CgpSF2o0.mjs");
var Route$17 = createFileRoute("/parcels")({
	component: lazyRouteComponent($$splitComponentImporter$17, "component"),
	head: () => ({ meta: [{ title: "Parcels — HITCH SA" }, {
		name: "description",
		content: "Send documents and packages with verified couriers riding routes you're already travelling."
	}] })
});
var $$splitComponentImporter$16 = () => import("./pricing-DZ3CV_Sc.mjs");
var Route$16 = createFileRoute("/pricing")({
	component: lazyRouteComponent($$splitComponentImporter$16, "component"),
	head: () => ({
		meta: [
			{ title: "Pricing — HITCH SA" },
			{
				name: "description",
				content: "Transparent, take-rate pricing for individuals, drivers, operators and businesses on HITCH SA."
			},
			{
				property: "og:title",
				content: "Pricing — HITCH SA"
			},
			{
				property: "og:description",
				content: "Simple, transparent pricing across every vertical."
			},
			{
				property: "og:url",
				content: "/pricing"
			}
		],
		links: [{
			rel: "canonical",
			href: "/pricing"
		}]
	})
});
var $$splitComponentImporter$15 = () => import("./profile-C1jG7856.mjs");
var Route$15 = createFileRoute("/profile")({
	head: () => ({ meta: [
		{ title: "Profile & verification — HITCH SA" },
		{
			name: "description",
			content: "Manage your HITCH SA identity: FICA-aligned KYC verification, driver documents, emergency contacts and notification preferences."
		},
		{
			property: "og:title",
			content: "Profile & verification — HITCH SA"
		},
		{
			property: "og:description",
			content: "Complete KYC, upload operator documents and control your safety settings."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./register-D_KhP-U7.mjs");
var Route$14 = createFileRoute("/register")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	head: () => ({ meta: [
		{ title: "Register — HITCH SA" },
		{
			name: "description",
			content: "Create your HITCH SA account."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
objectType({
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
var $$splitComponentImporter$13 = () => import("./ride-C-K3ucuf.mjs");
var Route$13 = createFileRoute("/ride")({
	component: lazyRouteComponent($$splitComponentImporter$13, "component"),
	head: () => ({ meta: [
		{ title: "Request a ride — HITCH SA" },
		{
			name: "description",
			content: "Set pickup and drop-off, pick a ride class and get matched with a verified HITCH SA driver in seconds."
		},
		{
			property: "og:title",
			content: "Request a ride — HITCH SA"
		},
		{
			property: "og:description",
			content: "Tap-to-ride matching with upfront ZAR fares across South Africa."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$12 = () => import("./rides-vh0lvVjR.mjs");
var Route$12 = createFileRoute("/rides")({
	validateSearch: (search) => ({
		...typeof search.from === "string" ? { from: search.from } : {},
		...typeof search.to === "string" ? { to: search.to } : {}
	}),
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	head: () => ({ meta: [{ title: "Rides — HITCH SA" }, {
		name: "description",
		content: "Ride now with instant driver matching, or find verified rides across South Africa — metro commuting, airport transfers and intercity trips with transparent pricing."
	}] })
});
var $$splitComponentImporter$11 = () => import("./school-DcRhItNZ.mjs");
var Route$11 = createFileRoute("/school")({
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: () => ({ meta: [{ title: "School transport — HITCH SA" }, {
		name: "description",
		content: "Verified school transport operators with live tracking, parent notifications and SAPS-screened drivers."
	}] })
});
var $$splitComponentImporter$10 = () => import("./school-ops-DY7Uxn2X.mjs");
var Route$10 = createFileRoute("/school-ops")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	head: () => ({ meta: [
		{ title: "School console — HITCH SA" },
		{
			name: "description",
			content: "Go online, accept school route requests, move learners with live parent tracking and build term revenue."
		},
		{
			property: "og:title",
			content: "School console — HITCH SA"
		},
		{
			property: "og:description",
			content: "Bolt-style school transport console: routes, learners, parent tracking, revenue."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$9 = () => import("./support-J96F529J.mjs");
var Route$9 = createFileRoute("/support")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({
		meta: [
			{ title: "Support — HITCH SA" },
			{
				name: "description",
				content: "Get help with HITCH SA. Emergency response, wallet issues, driver support and 24/7 live chat."
			},
			{
				property: "og:title",
				content: "Support — HITCH SA"
			},
			{
				property: "og:description",
				content: "24/7 support for every HITCH SA user."
			},
			{
				property: "og:url",
				content: "/support"
			}
		],
		links: [{
			rel: "canonical",
			href: "/support"
		}]
	})
});
var $$splitComponentImporter$8 = () => import("./track-OyUAV392.mjs");
var Route$8 = createFileRoute("/track")({
	head: () => ({ meta: [
		{ title: "Live trip tracking — HITCH SA" },
		{
			name: "description",
			content: "Follow your HITCH SA ride, parcel or freight load in real time: driver details, live ETA, trip milestones and one-tap SOS."
		},
		{
			property: "og:title",
			content: "Live trip tracking — HITCH SA"
		},
		{
			property: "og:description",
			content: "Real-time ETA, driver details and safety controls for every HITCH SA trip."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
/** Deterministic pseudo-QR rendered from the booking id — scan or read the OTP. */
var $$splitComponentImporter$7 = () => import("./truck-DTlXNZGm.mjs");
var Route$7 = createFileRoute("/truck")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [
		{ title: "Trucker console — HITCH SA" },
		{
			name: "description",
			content: "Go online, accept return-load freight requests, haul the route and watch your HITCH SA earnings build in real time."
		},
		{
			property: "og:title",
			content: "Trucker console — HITCH SA"
		},
		{
			property: "og:description",
			content: "Bolt-style trucker console: online toggle, return-load requests, earnings."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$6 = () => import("./verify-DpHQ3ZjR.mjs");
var Route$6 = createFileRoute("/verify")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [
		{ title: "Verify your identity — HITCH SA" },
		{
			name: "description",
			content: "Complete the HITCH SA identity verification steps."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$5 = () => import("./wallet-BOIZke2Y.mjs");
var Route$5 = createFileRoute("/wallet")({
	head: () => ({ meta: [
		{ title: "HITCH SA Wallet — Top up, pay and get paid" },
		{
			name: "description",
			content: "Manage your HITCH SA wallet: instant EFT top-ups with Ozow and PayFast, trip payments, operator payouts and a full transaction history."
		},
		{
			property: "og:title",
			content: "HITCH SA Wallet"
		},
		{
			property: "og:description",
			content: "Top up, pay for trips and withdraw operator earnings in one South African mobility wallet."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./cookies-B1ruCgIc.mjs");
var Route$4 = createFileRoute("/legal/cookies")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [
		{ title: "Cookie Policy — HITCH SA" },
		{
			name: "description",
			content: "How HITCH SA uses cookies and similar technologies."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$3 = () => import("./popia-DxRUes_0.mjs");
var Route$3 = createFileRoute("/legal/popia")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [
		{ title: "POPIA Notice — HITCH SA" },
		{
			name: "description",
			content: "How HITCH SA complies with the Protection of Personal Information Act, 2013."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$2 = () => import("./privacy-DFjEG8yc.mjs");
var Route$2 = createFileRoute("/legal/privacy")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [
		{ title: "Privacy Policy — HITCH SA" },
		{
			name: "description",
			content: "How HITCH SA collects, uses and protects your personal information."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter$1 = () => import("./security-D3rBTJ4d.mjs");
var Route$1 = createFileRoute("/legal/security")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [
		{ title: "Security — HITCH SA" },
		{
			name: "description",
			content: "How HITCH SA protects your identity, payments and trip data."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var $$splitComponentImporter = () => import("./terms-CvehQKd7.mjs");
var Route = createFileRoute("/legal/terms")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [
		{ title: "Terms of Service — HITCH SA" },
		{
			name: "description",
			content: "The terms that govern your use of the HITCH SA marketplace."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
var rootRouteChildren = {
	IndexRoute: Route$34.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$35
	}),
	AboutRoute: Route$33.update({
		id: "/about",
		path: "/about",
		getParentRoute: () => Route$35
	}),
	AdminRoute: Route$32.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$35
	}),
	AirlineRoute: Route$31.update({
		id: "/airline",
		path: "/airline",
		getParentRoute: () => Route$35
	}),
	BusinessRoute: Route$30.update({
		id: "/business",
		path: "/business",
		getParentRoute: () => Route$35
	}),
	CareersRoute: Route$29.update({
		id: "/careers",
		path: "/careers",
		getParentRoute: () => Route$35
	}),
	CommuteRoute: Route$28.update({
		id: "/commute",
		path: "/commute",
		getParentRoute: () => Route$35
	}),
	ContactRoute: Route$27.update({
		id: "/contact",
		path: "/contact",
		getParentRoute: () => Route$35
	}),
	DashboardRoute: Route$26.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$35
	}),
	DriveRoute: Route$25.update({
		id: "/drive",
		path: "/drive",
		getParentRoute: () => Route$35
	}),
	FaqRoute: Route$24.update({
		id: "/faq",
		path: "/faq",
		getParentRoute: () => Route$35
	}),
	FeaturesRoute: Route$23.update({
		id: "/features",
		path: "/features",
		getParentRoute: () => Route$35
	}),
	FlightsRoute: Route$22.update({
		id: "/flights",
		path: "/flights",
		getParentRoute: () => Route$35
	}),
	ForgotPasswordRoute: Route$21.update({
		id: "/forgot-password",
		path: "/forgot-password",
		getParentRoute: () => Route$35
	}),
	FreightRoute: Route$20.update({
		id: "/freight",
		path: "/freight",
		getParentRoute: () => Route$35
	}),
	LoginRoute: Route$19.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$35
	}),
	NotificationsRoute: Route$18.update({
		id: "/notifications",
		path: "/notifications",
		getParentRoute: () => Route$35
	}),
	ParcelsRoute: Route$17.update({
		id: "/parcels",
		path: "/parcels",
		getParentRoute: () => Route$35
	}),
	PricingRoute: Route$16.update({
		id: "/pricing",
		path: "/pricing",
		getParentRoute: () => Route$35
	}),
	ProfileRoute: Route$15.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$35
	}),
	RegisterRoute: Route$14.update({
		id: "/register",
		path: "/register",
		getParentRoute: () => Route$35
	}),
	RideRoute: Route$13.update({
		id: "/ride",
		path: "/ride",
		getParentRoute: () => Route$35
	}),
	RidesRoute: Route$12.update({
		id: "/rides",
		path: "/rides",
		getParentRoute: () => Route$35
	}),
	SchoolRoute: Route$11.update({
		id: "/school",
		path: "/school",
		getParentRoute: () => Route$35
	}),
	SchoolOpsRoute: Route$10.update({
		id: "/school-ops",
		path: "/school-ops",
		getParentRoute: () => Route$35
	}),
	SupportRoute: Route$9.update({
		id: "/support",
		path: "/support",
		getParentRoute: () => Route$35
	}),
	TrackRoute: Route$8.update({
		id: "/track",
		path: "/track",
		getParentRoute: () => Route$35
	}),
	TruckRoute: Route$7.update({
		id: "/truck",
		path: "/truck",
		getParentRoute: () => Route$35
	}),
	VerifyRoute: Route$6.update({
		id: "/verify",
		path: "/verify",
		getParentRoute: () => Route$35
	}),
	WalletRoute: Route$5.update({
		id: "/wallet",
		path: "/wallet",
		getParentRoute: () => Route$35
	}),
	LegalCookiesRoute: Route$4.update({
		id: "/legal/cookies",
		path: "/legal/cookies",
		getParentRoute: () => Route$35
	}),
	LegalPopiaRoute: Route$3.update({
		id: "/legal/popia",
		path: "/legal/popia",
		getParentRoute: () => Route$35
	}),
	LegalPrivacyRoute: Route$2.update({
		id: "/legal/privacy",
		path: "/legal/privacy",
		getParentRoute: () => Route$35
	}),
	LegalSecurityRoute: Route$1.update({
		id: "/legal/security",
		path: "/legal/security",
		getParentRoute: () => Route$35
	}),
	LegalTermsRoute: Route.update({
		id: "/legal/terms",
		path: "/legal/terms",
		getParentRoute: () => Route$35
	})
};
var routeTree = Route$35._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { zar as _, latency as a, nameSchema as c, router_CEW5b3GI_exports as d, saveJson as f, useDemo as g, useAuth as h, emailSchema as i, passwordSchema as l, uid as m, FAQS as n, loadJson as o, storageKey as p, SEED_LISTINGS as r, makeRef as s, AuthService as t, phoneSchema as u };
