import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { _ as Link, b as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { N as Package, O as Plus, U as LocateFixed, W as LoaderCircle, _ as ShieldCheck, b as Search, dt as Check, m as Star, n as X, nt as CreditCard, r as Wallet, y as Share2 } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { n as ErrorState, r as GridSkeleton, t as EmptyState } from "./states-Bg8HgEai.mjs";
import { H as useWallet, M as useSearch$1, c as useAddFavourite, x as useCreateListing, y as useCreateBooking } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
import { t as useMyLocation } from "./use-my-location-BCbOXKbn.mjs";
import { t as Field } from "./form-BV9rrkyX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/marketplace-view-CoqUhO69.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QUANTITY_LABELS = {
	ride: "Seats",
	parcel: "Parcels",
	freight: "Loads",
	flight: "Seats",
	school: "Children"
};
function BookingModal({ listing, onClose }) {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: wallet } = useWallet(userId);
	const createBooking = useCreateBooking(userId);
	const addFavourite = useAddFavourite(userId);
	const [method, setMethod] = (0, import_react.useState)("wallet");
	const [parcelDetails, setParcelDetails] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(null);
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape" && !createBooking.isPending && !done) onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		onClose,
		createBooking.isPending,
		done
	]);
	const identityVerified = user?.kyc.identityStatus === "verified";
	const insufficientWallet = method === "wallet" && (wallet?.balance ?? 0) < listing.price;
	async function confirm() {
		setError(null);
		try {
			const booking = await createBooking.mutateAsync({
				listingId: listing.id,
				type: listing.type,
				title: listing.title,
				route: listing.when,
				from: listing.from,
				to: listing.to,
				price: listing.price,
				quantity: 1,
				paidFromWallet: method === "wallet",
				parcelDetails: listing.type === "parcel" && parcelDetails.trim() ? parcelDetails.trim() : void 0
			});
			setDone(booking.ref);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
		}
	}
	async function saveFavourite() {
		try {
			await addFavourite.mutateAsync({
				label: listing.title,
				from: listing.from,
				to: listing.to
			});
			setSaved(true);
			toast.success("Route saved to favourites");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not save favourite.");
		}
	}
	async function shareTrip() {
		const text = `${listing.title} on HITCH SA · ${listing.when} · ${zar(listing.price)} — book on the marketplace`;
		try {
			await navigator.clipboard?.writeText(text);
			toast.success("Trip details copied to clipboard");
		} catch {
			toast.info(text);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 bg-black/60 backdrop-blur-sm",
		onClick: () => !createBooking.isPending && !done && onClose(),
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Book ${listing.title}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl p-6 ring-1 ring-black/30 max-h-[92vh] overflow-y-auto",
			children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 size-14 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold mb-1",
						children: "Booking confirmed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mb-1",
						children: ["Reference ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-foreground",
							children: done
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mb-6",
						children: [
							"Funds are held in escrow until your ",
							QUANTITY_LABELS[listing.type].toLowerCase(),
							" is completed."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "bg-brand hover:bg-brand-light text-white",
								onClick: onClose,
								children: "Done"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/track",
									children: "Track live"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [listing.type !== "freight" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "flex-1",
									disabled: saved || addFavourite.isPending,
									onClick: saveFavourite,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4" }),
										" ",
										saved ? "Saved" : "Save route"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "flex-1",
									onClick: shareTrip,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), " Share"]
								})]
							})
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold uppercase tracking-widest text-muted-foreground",
						children: "Complete booking"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						disabled: createBooking.isPending,
						"aria-label": "Close",
						className: "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: listing.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: listing.when
					})]
				}),
				!identityVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium mb-1",
							children: "Verification required"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-amber-400/80",
							children: "HITCH SA verifies every identity before a trip. Complete your SA ID verification in your profile to continue."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							className: "mt-2 inline-block text-xs font-semibold underline",
							children: "Complete verification →"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-card rounded-xl p-4 ring-1 ring-black/20 text-sm space-y-2 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground text-xs",
								children: "Operator rating"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "text-xs",
								children: [listing.rating.toFixed(1), " / 5"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground text-xs",
								children: "Capacity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-xs",
								children: listing.capacity
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-4 border-t border-white/10 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
								children: "Total (escrow)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-base font-semibold tabular-nums",
								children: zar(listing.price)
							})]
						})
					]
				}),
				listing.type === "parcel" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-muted-foreground mb-1.5",
							children: ["Parcel description ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground/60",
								children: "(so the courier can verify it)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: parcelDetails,
							onChange: (e) => setParcelDetails(e.target.value),
							placeholder: "e.g. Documents in a sealed A4 envelope · blue backpack · fragile electronics",
							rows: 2,
							className: "w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60 resize-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mt-2 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5" }), " Delivery is confirmed with a QR / OTP proof-of-delivery code."]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMethod("wallet"),
						className: cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors", method === "wallet" ? "border-brand/50 bg-brand/10" : "border-white/10 hover:bg-white/5"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5 text-brand-light" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "HITCH Wallet"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: ["Balance ", zar(wallet?.balance ?? 0)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("size-4 rounded-full border flex items-center justify-center", method === "wallet" ? "border-brand bg-brand" : "border-white/20"),
								children: method === "wallet" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-white" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMethod("card"),
						className: cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors", method === "card" ? "border-brand/50 bg-brand/10" : "border-white/10 hover:bg-white/5"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5 text-brand-light" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Card"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Visa / Mastercard · PCI-DSS"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("size-4 rounded-full border flex items-center justify-center", method === "card" ? "border-brand bg-brand" : "border-white/20"),
								children: method === "card" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-white" })
							})
						]
					})]
				}),
				insufficientWallet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-destructive mb-4",
					children: [
						"Wallet balance is too low.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/wallet",
							className: "underline font-medium",
							children: "Top up your wallet"
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-destructive mb-4",
					role: "alert",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full bg-brand hover:bg-brand-light text-white",
					disabled: !identityVerified || insufficientWallet || createBooking.isPending,
					onClick: confirm,
					children: createBooking.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Processing payment…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }),
						" Pay ",
						zar(listing.price),
						" & confirm"
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[11px] text-muted-foreground text-center",
					children: "Held in escrow until your trip completes · instant refund on cancellation"
				})
			] })
		})
	});
}
function MarketplaceView({ config }) {
	const { user } = useAuth();
	const urlQuery = useSearch({ strict: false });
	const [from, setFrom] = (0, import_react.useState)(urlQuery.from ?? "");
	const [to, setTo] = (0, import_react.useState)(urlQuery.to ?? "");
	const [when, setWhen] = (0, import_react.useState)("");
	const [submitted, setSubmitted] = (0, import_react.useState)(Boolean(urlQuery.from || urlQuery.to));
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [posting, setPosting] = (0, import_react.useState)(false);
	const search = useSearch$1({
		type: config.type,
		from,
		to,
		when,
		limit: 30
	}, submitted);
	const location = useMyLocation();
	(0, import_react.useEffect)(() => {
		if (!from && location.state.pickup && location.state.status === "ready") setFrom(location.state.pickup);
	}, [location.state, from]);
	(0, import_react.useEffect)(() => {
		if (location.state.status === "idle") location.locate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "max-w-7xl mx-auto px-6 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "glass-card rounded-2xl p-4 md:p-5 ring-1 ring-black/20 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end",
				onSubmit: (e) => {
					e.preventDefault();
					setSubmitted(true);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: config.fromLabel,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: from,
								onChange: (e) => setFrom(e.target.value),
								placeholder: config.fromPlaceholder,
								className: "h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60 pr-10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: location.locate,
								disabled: location.state.status === "locating",
								"aria-label": "Use my current location",
								title: "Use my current location",
								className: "absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-md flex items-center justify-center text-brand-light hover:bg-white/5 disabled:opacity-50",
								children: location.state.status === "locating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3.5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-3.5" })
							})]
						}), location.state.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-destructive mt-1",
							children: location.state.error
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: config.toLabel,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: to,
							onChange: (e) => setTo(e.target.value),
							placeholder: config.toPlaceholder,
							className: "h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: config.filterLabel,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: when,
							onChange: (e) => setWhen(e.target.value),
							className: "w-full h-10 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Any"
							}), config.filterOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: o.value,
								children: o.label
							}, o.value))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "bg-brand hover:bg-brand-light text-white h-10 rounded-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
							" ",
							config.searchLabel
						]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-7xl mx-auto px-6 pb-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: submitted ? search.isLoading ? "Searching…" : `${search.data?.length ?? 0} ${config.resultsNoun}` : `Browse ${config.resultsNoun}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [submitted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setFrom("");
							setTo("");
							setWhen("");
							setSubmitted(false);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Clear"]
					}), config.postCta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setPosting(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
							" ",
							config.postCta
						]
					})]
				})]
			}), search.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridSkeleton, {}) : search.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => search.refetch() }) : !search.data || search.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nothing on that route yet",
				description: "Try a broader search, or check back soon — new capacity is listed daily.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => {
						setSubmitted(false);
						setFrom("");
						setTo("");
					},
					children: "Clear search"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: search.data.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
					listing: l,
					cta: config.cta,
					onBook: () => setSelected(l)
				}, l.id))
			})]
		}),
		selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingModal, {
			listing: selected,
			onClose: () => setSelected(null)
		}),
		posting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostingModal, {
			config,
			onClose: () => setPosting(false)
		})
	] });
}
function ListingCard({ listing, cta, onBook }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20 hover:ring-brand/30 transition-all flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] font-bold uppercase tracking-widest text-brand-light mb-1",
							children: [
								listing.from,
								" → ",
								listing.to
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold text-foreground truncate",
							children: listing.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: listing.when
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold tabular-nums",
						children: zar(listing.price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-brand text-brand" }), listing.rating.toFixed(1)]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listing.capacity }), listing.meta.slice(0, 2).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m }, m))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 mb-4",
				children: listing.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand-light border border-brand/20",
					children: t
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 mt-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onBook,
					className: "flex-1 bg-brand hover:bg-brand-light text-white rounded-lg",
					children: cta
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					"aria-label": "Share this trip",
					title: "Share",
					onClick: async () => {
						const text = `${listing.title} on HITCH SA · ${listing.when} · ${zar(listing.price)} — book on the marketplace`;
						try {
							await navigator.clipboard?.writeText(text);
							toast.success("Trip details copied to clipboard");
						} catch {
							toast.info(text);
						}
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
				})]
			})
		]
	});
}
function PostingModal({ config, onClose }) {
	const { user } = useAuth();
	const createListing = useCreateListing(user?.id ?? "");
	const [error, setError] = (0, import_react.useState)(null);
	async function submit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		const from = String(f.get("from") || "");
		const to = String(f.get("to") || "");
		const when = String(f.get("when") || "");
		const capacity = String(f.get("capacity") || "");
		const price = Number(f.get("price") || 0);
		if (!from || !to) return setError("Origin and destination are required.");
		if (price <= 0) return setError("Enter a valid rate.");
		try {
			await createListing.mutateAsync({
				type: config.type,
				title: `${from} → ${to}`,
				from,
				to,
				when: when || "Flexible",
				price,
				capacity,
				tags: ["Verified operator"]
			});
			onClose();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not publish the listing.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 bg-black/60 backdrop-blur-sm",
		onClick: onClose,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": config.postCta,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl p-6 ring-1 ring-black/30 max-h-[92vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold uppercase tracking-widest text-muted-foreground",
					children: config.postCta
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					disabled: createListing.isPending,
					"aria-label": "Close",
					className: "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: config.postFromLabel,
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "from",
								required: true,
								placeholder: "Durban",
								className: "h-10 rounded-lg bg-white/[0.03] border-white/10"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: config.postToLabel,
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "to",
								required: true,
								placeholder: "Johannesburg",
								className: "h-10 rounded-lg bg-white/[0.03] border-white/10"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "When",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "when",
							placeholder: "Available 21 Jul",
							className: "h-10 rounded-lg bg-white/[0.03] border-white/10"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: config.postCapacityLabel,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "capacity",
								placeholder: "Sedan · 3 seats",
								className: "h-10 rounded-lg bg-white/[0.03] border-white/10"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: config.postPriceLabel,
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "price",
								type: "number",
								min: "0",
								required: true,
								placeholder: "189",
								className: "h-10 rounded-lg bg-white/[0.03] border-white/10"
							})
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-destructive",
						children: error
					}),
					!user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-brand-light underline",
								children: "Sign in"
							}),
							" ",
							"to publish a listing."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full bg-brand hover:bg-brand-light text-white",
						disabled: !user || createListing.isPending,
						children: createListing.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Publishing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Publish listing"] })
					})
				]
			})]
		})
	});
}
//#endregion
export { MarketplaceView as t };
