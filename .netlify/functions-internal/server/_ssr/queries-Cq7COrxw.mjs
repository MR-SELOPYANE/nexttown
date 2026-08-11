import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as latency, f as saveJson, m as uid, o as loadJson, p as storageKey, r as SEED_LISTINGS, s as makeRef, t as AuthService } from "./router-CEW5b3GI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-Cq7COrxw.js
/** Approximate coordinates for common HITCH SA pickup / drop-off points. */
var SA_PLACES = {
	johannesburg: {
		lat: -26.2041,
		lng: 28.0473
	},
	jhb: {
		lat: -26.2041,
		lng: 28.0473
	},
	jnb: {
		lat: -26.1392,
		lng: 28.246
	},
	sandton: {
		lat: -26.1076,
		lng: 28.0567
	},
	rosebank: {
		lat: -26.1467,
		lng: 28.0436
	},
	midrand: {
		lat: -25.9992,
		lng: 28.1263
	},
	soweto: {
		lat: -26.2678,
		lng: 27.8585
	},
	"or tambo": {
		lat: -26.1392,
		lng: 28.246
	},
	lanseria: {
		lat: -25.9385,
		lng: 27.9261
	},
	pretoria: {
		lat: -25.7479,
		lng: 28.2293
	},
	pta: {
		lat: -25.7479,
		lng: 28.2293
	},
	menlyn: {
		lat: -25.7828,
		lng: 28.2764
	},
	centurion: {
		lat: -25.8603,
		lng: 28.1894
	},
	"cape town": {
		lat: -33.9249,
		lng: 18.4241
	},
	cpt: {
		lat: -33.9249,
		lng: 18.4241
	},
	stellenbosch: {
		lat: -33.9321,
		lng: 18.8602
	},
	paarl: {
		lat: -33.7342,
		lng: 18.9621
	},
	durban: {
		lat: -29.8587,
		lng: 31.0218
	},
	dur: {
		lat: -29.8587,
		lng: 31.0218
	},
	"king shaka": {
		lat: -29.6144,
		lng: 31.1197
	},
	pietermaritzburg: {
		lat: -29.6006,
		lng: 30.3794
	},
	"port elizabeth": {
		lat: -33.9608,
		lng: 25.6022
	},
	gqeberha: {
		lat: -33.9608,
		lng: 25.6022
	},
	bloemfontein: {
		lat: -29.0852,
		lng: 26.1596
	},
	kimberley: {
		lat: -28.7282,
		lng: 24.7499
	},
	polokwane: {
		lat: -23.9045,
		lng: 29.4689
	},
	nelspruit: {
		lat: -25.4753,
		lng: 30.9694
	},
	mbombela: {
		lat: -25.4753,
		lng: 30.9694
	},
	george: {
		lat: -33.963,
		lng: 22.4617
	},
	"east london": {
		lat: -33.0153,
		lng: 27.9116
	},
	rustenburg: {
		lat: -25.6672,
		lng: 27.2424
	},
	gaborone: {
		lat: -24.6282,
		lng: 25.9231
	},
	maputo: {
		lat: -25.9692,
		lng: 32.5732
	},
	windhoek: {
		lat: -22.5597,
		lng: 17.0832
	},
	harare: {
		lat: -17.8252,
		lng: 31.0335
	}
};
var FALLBACK = {
	lat: -26.2041,
	lng: 28.0473
};
function lookupPlace(raw) {
	const q = raw.toLowerCase().replace(/[()]/g, " ").trim();
	if (!q) return null;
	if (SA_PLACES[q]) return SA_PLACES[q];
	const hit = Object.keys(SA_PLACES).sort((a, b) => b.length - a.length).find((k) => q.includes(k));
	return hit ? SA_PLACES[hit] : null;
}
/** Parse titles like "Sandton → OR Tambo" or "Durban - Johannesburg". */
function parseRoute(title) {
	const parts = title.split(/→|->|–|—| to /i).map((p) => p.trim());
	const fromLabel = parts[0] ?? "Johannesburg";
	const toLabel = parts[1] ?? "Pretoria";
	return {
		from: lookupPlace(fromLabel) ?? FALLBACK,
		to: lookupPlace(toLabel) ?? SA_PLACES.pretoria,
		labels: [fromLabel, toLabel]
	};
}
/** Great-circle distance in km between two points. */
function distanceKm(a, b) {
	const R = 6371;
	const dLat = (b.lat - a.lat) * Math.PI / 180;
	const dLng = (b.lng - a.lng) * Math.PI / 180;
	const la1 = a.lat * Math.PI / 180;
	const la2 = b.lat * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
	return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
/** Nearest known place to a GPS coordinate within radiusKm, or null if none. */
function nearestPlace(latLng, radiusKm = 80) {
	let best = null;
	for (const [name, coords] of Object.entries(SA_PLACES)) {
		if (name.length <= 3) continue;
		const d = distanceKm(latLng, coords);
		if (!best || d < best.d) best = {
			name,
			d
		};
	}
	if (!best || best.d > radiusKm) return null;
	return best.name.replace(/\b\w/g, (c) => c.toUpperCase());
}
/** Suggestion list for place inputs. */
var PLACE_SUGGESTIONS = Object.keys(SA_PLACES).filter((k) => k.length > 3).map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase())).sort();
var KEY$1 = storageKey("db", "listings");
function readAll$1() {
	const custom = loadJson(KEY$1, []);
	const seen = new Set(custom.map((l) => l.id));
	return [...custom, ...SEED_LISTINGS.filter((l) => !seen.has(l.id))];
}
function writeAll(listings) {
	const custom = listings.filter((l) => !l.id.startsWith("seed-"));
	saveJson(KEY$1, custom);
}
/** Tokenises a free-text location query and checks it against a listing field. */
function locationMatch(query, target) {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	const t = target.toLowerCase();
	const qPlace = lookupPlace(q);
	if (qPlace) {
		const tPlace = lookupPlace(t);
		if (tPlace) return distanceKm(qPlace, tPlace) <= 60;
		return t.includes(q);
	}
	return t.includes(q);
}
/** Resolves short airport codes so JNB/CPT searches work against city names. */
function expandAlias(query) {
	return {
		jnb: [
			"johannesburg",
			"lanseria",
			"sandton",
			"rosebank",
			"midrand",
			"soweto"
		],
		cpt: [
			"cape town",
			"stellenbosch",
			"paarl",
			"century city"
		],
		dur: [
			"durban",
			"umhlanga",
			"king shaka",
			"pietermaritzburg"
		],
		plz: ["port elizabeth", "gqeberha"]
	}[query.trim().toLowerCase()]?.join(" ") ?? query;
}
function whenMatch(filter, listing) {
	if (!filter) return true;
	const lower = listing.when.toLowerCase() + " " + listing.title.toLowerCase();
	if (filter === "today") return lower.includes("today") || lower.includes("on-demand") || lower.includes("leaving");
	if (filter === "this-week") return true;
	return true;
}
function typeFilterMatch(filter, listing) {
	if (!filter) return true;
	const haystack = `${listing.tags.join(" ")} ${listing.meta.join(" ")} ${listing.when} ${listing.title}`.toLowerCase();
	if (filter === "any") return true;
	if (filter === "now") return true;
	if (filter === "tomorrow") return true;
	if (filter === "week") return true;
	return haystack.includes(filter.toLowerCase());
}
var MarketService = {
	async list(type) {
		await latency(280);
		return readAll$1().filter((l) => l.type === type && l.status === "live");
	},
	async mine(ownerId) {
		await latency(250);
		return readAll$1().filter((l) => l.ownerId === ownerId).sort((a, b) => b.createdAt - a.createdAt);
	},
	async get(id) {
		await latency(120);
		return readAll$1().find((l) => l.id === id) ?? null;
	},
	async search(query) {
		await latency(450);
		const q = query.from ? expandAlias(query.from) : "";
		const d = query.to ? expandAlias(query.to) : "";
		return readAll$1().filter((l) => l.type === query.type && l.status === "live").filter((l) => locationMatch(q, l.from) || locationMatch(q, l.title)).filter((l) => locationMatch(d, l.to) || locationMatch(d, l.title)).filter((l) => whenMatch(query.when ?? "", l)).filter((l) => typeFilterMatch(query.when ?? "", l)).sort((a, b) => b.rating - a.rating).slice(0, query.limit ?? 50);
	},
	async create(ownerId, input) {
		await latency(450);
		const all = readAll$1();
		const listing = {
			...input,
			id: `user-${uid()}`,
			ownerId,
			rating: 5,
			seats: input.capacity ? 1 : 0,
			meta: ["New listing", "Verified operator"],
			status: "live",
			createdAt: Date.now()
		};
		writeAll([listing, ...all]);
		return listing;
	},
	async toggle(ownerId, id) {
		await latency(200);
		const next = readAll$1().map((l) => l.id === id && l.ownerId === ownerId ? {
			...l,
			status: l.status === "live" ? "paused" : "live"
		} : l);
		writeAll(next);
		return next.find((l) => l.id === id);
	},
	async remove(ownerId, id) {
		await latency(200);
		writeAll(readAll$1().filter((l) => !(l.id === id && l.ownerId === ownerId)));
	},
	/** Consume capacity when a booking is created. */
	async consumeSeats(id, qty) {
		writeAll(readAll$1().map((l) => l.id === id ? {
			...l,
			seats: Math.max(0, l.seats - qty)
		} : l));
	},
	async releaseSeats(id, qty) {
		writeAll(readAll$1().map((l) => l.id === id ? {
			...l,
			seats: l.seats + qty
		} : l));
	}
};
var txnsKey = (userId) => storageKey("data", userId, "txns");
var walletKey = (userId) => storageKey("data", userId, "wallet");
function readWallet(userId) {
	return loadJson(walletKey(userId), {
		userId,
		balance: 250,
		currency: "ZAR"
	});
}
function readTxns(userId) {
	return loadJson(txnsKey(userId), []);
}
function writeTxns(userId, txns) {
	saveJson(txnsKey(userId), txns);
}
function pushTxn(userId, kind, label, amount, method, status, ref) {
	const txn = {
		id: uid(),
		userId,
		kind,
		label,
		amount,
		method,
		status,
		ref,
		createdAt: Date.now()
	};
	writeTxns(userId, [txn, ...readTxns(userId)]);
	return txn;
}
var WalletService = {
	async get(userId) {
		await latency(200);
		return readWallet(userId);
	},
	async topUp(userId, amount, method) {
		await latency(600);
		const txn = pushTxn(userId, "topup", `Wallet top-up via ${method}`, amount, method, "pending");
		setTimeout(() => {
			writeTxns(userId, readTxns(userId).map((t) => t.id === txn.id ? {
				...t,
				status: "completed"
			} : t));
			const wallet = readWallet(userId);
			saveJson(walletKey(userId), {
				...wallet,
				balance: wallet.balance + amount
			});
		}, 900);
		return txn;
	},
	/** Holds funds in escrow when a booking is created. */
	async hold(userId, amount, ref, fromWallet) {
		await latency(400);
		if (fromWallet) {
			const wallet = readWallet(userId);
			if (wallet.balance < amount) throw new Error("Wallet balance is too low for this booking. Top up first.");
			saveJson(walletKey(userId), {
				...wallet,
				balance: wallet.balance - amount
			});
			return pushTxn(userId, "escrow_hold", `Escrow hold · ${ref}`, -amount, "wallet", "completed", ref);
		}
		return pushTxn(userId, "escrow_hold", `Card hold · ${ref}`, -amount, "card", "pending", ref);
	},
	/** Releases escrow to the operator once a trip completes. */
	async release(userId, ref, amount) {
		await latency(250);
		writeTxns(userId, readTxns(userId).map((t) => t.ref === ref ? {
			...t,
			status: "completed"
		} : t));
		pushTxn(userId, "escrow_release", `Settled · ${ref}`, -amount, "wallet", "completed", ref);
	},
	async refund(userId, ref, amount) {
		await latency(400);
		const wallet = readWallet(userId);
		saveJson(walletKey(userId), {
			...wallet,
			balance: wallet.balance + amount
		});
		writeTxns(userId, readTxns(userId).map((t) => t.ref === ref ? {
			...t,
			status: "completed"
		} : t));
		pushTxn(userId, "refund", `Refund · ${ref}`, amount, "wallet", "completed", ref);
	},
	async creditPayout(userId, label, gross) {
		await latency(250);
		const net = Math.round(gross * .88);
		const wallet = readWallet(userId);
		saveJson(walletKey(userId), {
			...wallet,
			balance: wallet.balance + net
		});
		pushTxn(userId, "payout", `${label} · payout`, net, "wallet", "completed");
	},
	/** Direct wallet payment (e.g. commuter passes / subscriptions). */
	async pay(userId, amount, label) {
		await latency(400);
		const wallet = readWallet(userId);
		if (wallet.balance < amount) throw new Error("Insufficient wallet balance. Top up first.");
		saveJson(walletKey(userId), {
			...wallet,
			balance: wallet.balance - amount
		});
		return pushTxn(userId, "payment", label, -amount, "wallet", "completed");
	},
	async withdraw(userId, amount) {
		await latency(500);
		const wallet = readWallet(userId);
		if (amount <= 0) throw new Error("Enter an amount to withdraw.");
		if (wallet.balance < amount) throw new Error("Insufficient balance for that payout.");
		saveJson(walletKey(userId), {
			...wallet,
			balance: wallet.balance - amount
		});
		return pushTxn(userId, "payout", `Payout to bank · ${makeRef("PAY")}`, -amount, "wallet", "pending");
	},
	async txns(userId) {
		await latency(250);
		return readTxns(userId);
	}
};
var key$3 = (userId) => storageKey("data", userId, "bookings");
function readBookings(userId) {
	return loadJson(key$3(userId), []);
}
function writeBookings(userId, bookings) {
	saveJson(key$3(userId), bookings);
}
var podCode = () => String(Math.floor(1e5 + Math.random() * 899999));
/** Finalises a booking: release escrow to the operator and record the payout. */
async function complete(booking) {
	const released = {
		...booking,
		payment: "paid"
	};
	await WalletService.release(booking.userId, booking.ref, booking.price);
	await WalletService.creditPayout(booking.userId, `${booking.type} · ${booking.title}`, booking.price);
	return released;
}
var BookingService = {
	async mine(userId) {
		await latency(280);
		return readBookings(userId).sort((a, b) => b.createdAt - a.createdAt);
	},
	async create(userId, input) {
		await latency(600);
		const ref = makeRef();
		const hold = await WalletService.hold(userId, input.price, ref, input.paidFromWallet);
		const booking = {
			id: uid(),
			ref,
			userId,
			listingId: input.listingId,
			type: input.type,
			title: input.title,
			route: input.route,
			from: input.from,
			to: input.to,
			price: input.price,
			quantity: input.quantity,
			status: hold.status === "pending" ? "requested" : "confirmed",
			payment: "held",
			paidFromWallet: input.paidFromWallet,
			podCode: input.type === "parcel" ? podCode() : void 0,
			parcelDetails: input.parcelDetails,
			createdAt: Date.now()
		};
		writeBookings(userId, [booking, ...readBookings(userId)]);
		await MarketService.consumeSeats(input.listingId, input.quantity);
		return booking;
	},
	async advance(userId, id) {
		await latency(300);
		const all = readBookings(userId);
		const booking = all.find((b) => b.id === id);
		if (!booking) throw new Error("Booking not found.");
		const target = {
			requested: "confirmed",
			confirmed: "in_transit",
			in_transit: "completed",
			completed: null,
			cancelled: null
		}[booking.status];
		if (!target) throw new Error("Booking cannot be advanced from its current state.");
		if (booking.type === "parcel" && target === "completed") throw new Error("Parcels require OTP proof-of-delivery before completing.");
		let updated = {
			...booking,
			status: target
		};
		if (target === "completed") updated = await complete(updated);
		writeBookings(userId, all.map((b) => b.id === id ? updated : b));
		return updated;
	},
	/** BRS §14 — courier/sender confirms delivery with the OTP shown against the QR code. */
	async completeParcel(userId, id, code) {
		await latency(500);
		const all = readBookings(userId);
		const booking = all.find((b) => b.id === id);
		if (!booking) throw new Error("Booking not found.");
		if (booking.type !== "parcel") throw new Error("Proof-of-delivery only applies to parcels.");
		if (booking.status !== "in_transit") throw new Error("Parcel is not in transit.");
		if (String(booking.podCode ?? "").trim() !== code.trim()) throw new Error("That OTP is incorrect. Check the code shown against the QR.");
		const updated = await complete({
			...booking,
			status: "completed"
		});
		writeBookings(userId, all.map((b) => b.id === id ? updated : b));
		return updated;
	},
	/** BRS §22 — four-category review (safety, punctuality, cleanliness, communication). */
	async review(userId, id, review) {
		await latency(250);
		const all = readBookings(userId);
		const avg = Math.round((review.safety + review.punctuality + review.cleanliness + review.communication) / 4);
		const updated = all.map((b) => b.id === id ? {
			...b,
			review,
			rating: avg
		} : b);
		writeBookings(userId, updated);
		return updated.find((b) => b.id === id);
	},
	async cancel(userId, id) {
		await latency(400);
		const all = readBookings(userId);
		const booking = all.find((b) => b.id === id);
		if (!booking) throw new Error("Booking not found.");
		if (booking.status === "completed" || booking.status === "cancelled") throw new Error("Completed bookings cannot be cancelled.");
		const updated = {
			...booking,
			status: "cancelled",
			payment: booking.payment === "held" ? "refunded" : booking.payment
		};
		if (booking.payment === "held") await WalletService.refund(userId, booking.ref, booking.price);
		await MarketService.releaseSeats(booking.listingId, booking.quantity);
		writeBookings(userId, all.map((b) => b.id === id ? updated : b));
		return updated;
	},
	async rate(userId, id, rating) {
		await latency(200);
		const updated = readBookings(userId).map((b) => b.id === id ? {
			...b,
			rating
		} : b);
		writeBookings(userId, updated);
		return updated.find((b) => b.id === id);
	}
};
var key$2 = (userId) => storageKey("data", userId, "notifications");
var sosKey = (userId) => storageKey("data", userId, "sos");
function readNotes(userId) {
	return loadJson(key$2(userId), []);
}
var NotificationService = {
	async mine(userId) {
		await latency(250);
		return readNotes(userId).sort((a, b) => b.createdAt - a.createdAt);
	},
	async push(userId, n) {
		const note = {
			...n,
			id: uid(),
			userId,
			read: false,
			createdAt: Date.now()
		};
		saveJson(key$2(userId), [note, ...readNotes(userId)].slice(0, 60));
		return note;
	},
	async markAllRead(userId) {
		await latency(120);
		saveJson(key$2(userId), readNotes(userId).map((n) => ({
			...n,
			read: true
		})));
	},
	async clear(userId) {
		await latency(120);
		saveJson(key$2(userId), []);
	},
	async sos(userId, where) {
		await latency(150);
		const entry = {
			id: uid(),
			userId,
			at: Date.now(),
			where
		};
		const log = loadJson(sosKey(userId), []);
		saveJson(sosKey(userId), [entry, ...log]);
		return entry;
	},
	async sosLog(userId) {
		await latency(150);
		return loadJson(sosKey(userId), []);
	}
};
var KEY = storageKey("db", "support-tickets");
function readAll() {
	return loadJson(KEY, []);
}
var SupportService = {
	async submit(input) {
		await latency(600);
		const ticket = {
			id: uid(),
			userId: input.userId,
			topic: input.topic,
			subject: input.subject,
			message: input.message,
			status: "open",
			createdAt: Date.now()
		};
		saveJson(KEY, [ticket, ...readAll()]);
		return ticket;
	},
	async mine(userId) {
		await latency(250);
		return readAll().filter((t) => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
	},
	async all() {
		await latency(250);
		return readAll().sort((a, b) => b.createdAt - a.createdAt);
	},
	async resolve(id) {
		await latency(200);
		saveJson(KEY, readAll().map((t) => t.id === id ? {
			...t,
			status: "resolved"
		} : t));
	}
};
var key$1 = (userId) => storageKey("data", userId, "favourites");
var FavouriteService = {
	async list(userId) {
		await latency(220);
		return loadJson(key$1(userId), []).sort((a, b) => b.createdAt - a.createdAt);
	},
	async add(userId, input) {
		await latency(300);
		const all = loadJson(key$1(userId), []);
		if (all.some((f) => f.from.toLowerCase() === input.from.toLowerCase() && f.to.toLowerCase() === input.to.toLowerCase())) throw new Error("This route is already in your favourites.");
		const favourite = {
			id: uid(),
			userId,
			label: input.label,
			from: input.from,
			to: input.to,
			createdAt: Date.now()
		};
		saveJson(key$1(userId), [favourite, ...all]);
		return favourite;
	},
	async remove(userId, id) {
		await latency(200);
		saveJson(key$1(userId), loadJson(key$1(userId), []).filter((f) => f.id !== id));
	}
};
var key = (userId) => storageKey("data", userId, "commute-plans");
var COMMUTE_DAYS_LABEL = {
	weekdays: "Mon–Fri",
	"all-week": "Every day",
	weekends: "Sat–Sun",
	"mon-wed-fri": "Mon · Wed · Fri",
	"tue-thu": "Tue · Thu"
};
var CommuteService = {
	async mine(userId) {
		await latency(250);
		return loadJson(key(userId), []).sort((a, b) => b.createdAt - a.createdAt);
	},
	async create(userId, input) {
		await latency(500);
		const plan = {
			id: uid(),
			userId,
			...input,
			subscribed: false,
			createdAt: Date.now()
		};
		saveJson(key(userId), [plan, ...loadJson(key(userId), [])]);
		return plan;
	},
	async remove(userId, id) {
		await latency(200);
		saveJson(key(userId), loadJson(key(userId), []).filter((p) => p.id !== id));
	},
	/** BRS §19 — a monthly commute pass charged to the HITCH wallet. */
	async subscribe(userId, id) {
		await latency(600);
		const all = loadJson(key(userId), []);
		const plan = all.find((p) => p.id === id);
		if (!plan) throw new Error("Commute plan not found.");
		const monthly = Math.round(plan.weeklyCost * 4.3);
		await WalletService.pay(userId, monthly, `Commute pass · ${plan.from} → ${plan.to}`);
		const updated = {
			...plan,
			subscribed: true
		};
		saveJson(key(userId), all.map((p) => p.id === id ? updated : p));
		return updated;
	},
	async unsubscribe(userId, id) {
		await latency(250);
		const updated = loadJson(key(userId), []).map((p) => p.id === id ? {
			...p,
			subscribed: false
		} : p);
		saveJson(key(userId), updated);
		return updated.find((p) => p.id === id);
	}
};
var qk = {
	listings: (type) => ["listings", type],
	search: (q) => [
		"search",
		q.type,
		q.from ?? "",
		q.to ?? "",
		q.when ?? ""
	],
	mineListings: (userId) => [
		"listings",
		"mine",
		userId
	],
	bookings: (userId) => ["bookings", userId],
	wallet: (userId) => ["wallet", userId],
	txns: (userId) => ["txns", userId],
	notifications: (userId) => ["notifications", userId],
	sos: (userId) => ["sos", userId],
	tickets: (userId) => ["tickets", userId],
	adminTickets: () => ["tickets", "all"],
	adminUsers: () => ["users", "all"],
	favourites: (userId) => ["favourites", userId],
	commutePlans: (userId) => ["commute-plans", userId]
};
function useSearch(query, enabled = true) {
	return useQuery({
		queryKey: qk.search(query),
		queryFn: () => MarketService.search(query),
		enabled
	});
}
function useMyListings(userId) {
	return useQuery({
		queryKey: qk.mineListings(userId),
		queryFn: () => MarketService.mine(userId)
	});
}
function useBookings(userId) {
	return useQuery({
		queryKey: qk.bookings(userId),
		queryFn: () => BookingService.mine(userId)
	});
}
function useWallet(userId) {
	return useQuery({
		queryKey: qk.wallet(userId),
		queryFn: () => WalletService.get(userId)
	});
}
function useTxns(userId) {
	return useQuery({
		queryKey: qk.txns(userId),
		queryFn: () => WalletService.txns(userId)
	});
}
function useNotifications(userId) {
	return useQuery({
		queryKey: qk.notifications(userId),
		queryFn: () => NotificationService.mine(userId)
	});
}
function useAllTickets() {
	return useQuery({
		queryKey: qk.adminTickets(),
		queryFn: () => SupportService.all()
	});
}
function useAdminUsers() {
	return useQuery({
		queryKey: qk.adminUsers(),
		queryFn: () => AuthService.allUsers()
	});
}
function useResolveTicket() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => SupportService.resolve(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminTickets() })
	});
}
function useCreateBooking(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => BookingService.create(userId, input),
		onSuccess: (booking) => {
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			qc.invalidateQueries({ queryKey: qk.search({ type: booking.type }) });
			qc.invalidateQueries({ queryKey: qk.listings(booking.type) });
		}
	});
}
function useAdvanceBooking(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => BookingService.advance(userId, id),
		onSuccess: (booking) => {
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			NotificationService.push(userId, {
				title: `${booking.ref} ${booking.status === "in_transit" ? "in transit" : booking.status}`,
				body: booking.title,
				kind: "trip"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
		}
	});
}
function useCancelBooking(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => BookingService.cancel(userId, id),
		onSuccess: (booking) => {
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			NotificationService.push(userId, {
				title: `${booking.ref} cancelled`,
				body: `Refund of ${booking.price} will return to your balance.`,
				kind: "payment"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
		}
	});
}
function useTopUp(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => WalletService.topUp(userId, input.amount, input.method),
		onSuccess: (txn) => {
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			NotificationService.push(userId, {
				title: "Wallet top-up submitted",
				body: `${txn.amount} via ${txn.method} is being processed.`,
				kind: "payment"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
			setTimeout(() => {
				qc.invalidateQueries({ queryKey: qk.wallet(userId) });
				qc.invalidateQueries({ queryKey: qk.txns(userId) });
			}, 1200);
		}
	});
}
function useWithdraw(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (amount) => WalletService.withdraw(userId, amount),
		onSuccess: (txn) => {
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			NotificationService.push(userId, {
				title: "Payout requested",
				body: `${txn.amount} scheduled to reach your bank account.`,
				kind: "payment"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
		}
	});
}
function useMarkAllRead(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => NotificationService.markAllRead(userId),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) })
	});
}
function useNotify(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (n) => NotificationService.push(userId, n),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) })
	});
}
function useClearNotifications(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => NotificationService.clear(userId),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) })
	});
}
function useTriggerSos(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (where) => NotificationService.sos(userId, where),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: qk.sos(userId) });
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
			NotificationService.push(userId, {
				title: "SOS dispatched",
				body: "Your live location was shared with the HITCH SA safety desk and your emergency contact.",
				kind: "safety"
			});
		}
	});
}
function useCreateListing(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => MarketService.create(userId, input),
		onSuccess: (listing) => {
			qc.invalidateQueries({ queryKey: qk.mineListings(userId) });
			qc.invalidateQueries({ queryKey: qk.listings(listing.type) });
		}
	});
}
function useToggleListing(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => MarketService.toggle(userId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.mineListings(userId) })
	});
}
function useRemoveListing(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => MarketService.remove(userId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.mineListings(userId) })
	});
}
function useSubmitTicket() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => SupportService.submit(input),
		onSuccess: (ticket) => {
			if (ticket.userId) qc.invalidateQueries({ queryKey: qk.tickets(ticket.userId) });
			qc.invalidateQueries({ queryKey: qk.adminTickets() });
		}
	});
}
function useUpdateProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (updates) => AuthService.updateUser(updates),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminUsers() })
	});
}
function useReviewBooking(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, review }) => BookingService.review(userId, id, review),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings(userId) })
	});
}
function useCompleteParcel(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, code }) => BookingService.completeParcel(userId, id, code),
		onSuccess: (booking) => {
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			NotificationService.push(userId, {
				title: `${booking.ref} delivered`,
				body: `${booking.title} — proof-of-delivery verified.`,
				kind: "trip"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
		}
	});
}
function useFavourites(userId) {
	return useQuery({
		queryKey: qk.favourites(userId),
		queryFn: () => FavouriteService.list(userId),
		enabled: Boolean(userId)
	});
}
function useAddFavourite(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => FavouriteService.add(userId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.favourites(userId) })
	});
}
function useRemoveFavourite(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => FavouriteService.remove(userId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.favourites(userId) })
	});
}
function useCommutePlans(userId) {
	return useQuery({
		queryKey: qk.commutePlans(userId),
		queryFn: () => CommuteService.mine(userId),
		enabled: Boolean(userId)
	});
}
function useCreateCommutePlan(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => CommuteService.create(userId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) })
	});
}
function useRemoveCommutePlan(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => CommuteService.remove(userId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) })
	});
}
function useSubscribeCommute(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => CommuteService.subscribe(userId, id),
		onSuccess: (plan) => {
			qc.invalidateQueries({ queryKey: qk.commutePlans(userId) });
			qc.invalidateQueries({ queryKey: qk.wallet(userId) });
			qc.invalidateQueries({ queryKey: qk.txns(userId) });
			NotificationService.push(userId, {
				title: "Commute pass active",
				body: `${plan.from} → ${plan.to} · ${COMMUTE_MONTHLY(plan.weeklyCost)} billed to wallet.`,
				kind: "payment"
			});
			qc.invalidateQueries({ queryKey: qk.notifications(userId) });
		}
	});
}
function useUnsubscribeCommute(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => CommuteService.unsubscribe(userId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) })
	});
}
var COMMUTE_MONTHLY = (weekly) => `R ${Math.round(weekly * 4.3).toLocaleString("en-ZA")}`;
function useApproveDriver(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (decision) => AuthService.approveDoc(userId, "driver", decision),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: qk.adminUsers() });
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
		}
	});
}
function useApproveVehicle(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (decision) => AuthService.approveDoc(userId, "vehicle", decision),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: qk.adminUsers() });
			qc.invalidateQueries({ queryKey: qk.bookings(userId) });
		}
	});
}
function useSetUserStatus(userId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (status) => AuthService.setUserStatus(userId, status),
		onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminUsers() })
	});
}
//#endregion
export { useResolveTicket as A, useUnsubscribeCommute as B, useMarkAllRead as C, useRemoveCommutePlan as D, useNotify as E, useSubscribeCommute as F, useWallet as H, useToggleListing as I, useTopUp as L, useSearch as M, useSetUserStatus as N, useRemoveFavourite as O, useSubmitTicket as P, useTriggerSos as R, useFavourites as S, useNotifications as T, useWithdraw as U, useUpdateProfile as V, useCommutePlans as _, lookupPlace as a, useCreateCommutePlan as b, useAddFavourite as c, useAllTickets as d, useApproveDriver as f, useClearNotifications as g, useCancelBooking as h, distanceKm as i, useReviewBooking as j, useRemoveListing as k, useAdminUsers as l, useBookings as m, PLACE_SUGGESTIONS as n, nearestPlace as o, useApproveVehicle as p, SA_PLACES as r, parseRoute as s, COMMUTE_DAYS_LABEL as t, useAdvanceBooking as u, useCompleteParcel as v, useMyListings as w, useCreateListing as x, useCreateBooking as y, useTxns as z };
