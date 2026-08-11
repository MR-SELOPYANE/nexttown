import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { Et as ArrowUpRight, St as Banknote, kt as ArrowDownLeft, r as Wallet } from "../_libs/lucide-react.mjs";
import { t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { a as TxnStatusPill } from "./status-N0G1dMzr.mjs";
import { H as useWallet, L as useTopUp, U as useWithdraw, z as useTxns } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-xs8iWMzm.mjs";
import { t as zar } from "./format-DeIlHfyG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-BOIZke2Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRESETS = [
	100,
	250,
	500,
	1e3
];
var METHODS = [
	{
		label: "Ozow",
		key: "ozow"
	},
	{
		label: "PayFast",
		key: "payfast"
	},
	{
		label: "Card",
		key: "card"
	}
];
function WalletPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletInner, {}) });
}
function WalletInner() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: wallet } = useWallet(userId);
	const { data: txns = [] } = useTxns(userId);
	const topUp = useTopUp(userId);
	const withdraw = useWithdraw(userId);
	const [amount, setAmount] = (0, import_react.useState)("250");
	const [method, setMethod] = (0, import_react.useState)("ozow");
	const methodLabel = METHODS.find((m) => m.key === method)?.label ?? "Ozow";
	const value = Math.max(0, Number(amount) || 0);
	const balance = wallet?.balance ?? 0;
	const inflow = txns.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
	const outflow = txns.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Payments",
		title: "Your HITCH SA wallet",
		subtitle: "One balance for rides, parcels, freight and flights — funded by instant EFT, card or operator earnings."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-6 py-14 max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-6 border border-white/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-brand-light" }), " Available balance"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-5xl font-semibold tracking-tight mt-3",
						children: zar(balance)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-white/10 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Total in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-semibold text-brand-light",
								children: zar(inflow)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-white/10 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Total out"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-semibold",
								children: zar(outflow)
							})]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-card rounded-2xl p-6 border border-white/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold mb-4",
						children: "Top up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2 mb-4",
						children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setAmount(String(p)),
							className: `px-3 py-1.5 rounded-full text-sm border transition-colors ${Number(amount) === p ? "border-brand/50 bg-brand/15 text-brand-light" : "border-white/10 text-muted-foreground hover:text-foreground"}`,
							children: ["R ", p]
						}, p))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: amount,
						inputMode: "numeric",
						onChange: (e) => setAmount(e.target.value.replace(/[^0-9]/g, "")),
						className: "mb-4",
						"aria-label": "Top up amount in rand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2 mb-5",
						children: METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMethod(m.key),
							className: `px-3 py-1.5 rounded-lg text-sm border transition-colors ${method === m.key ? "border-brand/50 bg-brand/15 text-brand-light" : "border-white/10 text-muted-foreground hover:text-foreground"}`,
							children: m.label
						}, m.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-brand hover:bg-brand-light text-white",
							disabled: value <= 0,
							onClick: () => topUp.mutate({
								amount: value,
								method
							}, {
								onSuccess: () => toast.success(`${zar(value)} added via ${methodLabel}`),
								onError: (e) => toast.error(e.message)
							}),
							children: ["Top up ", zar(value)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => withdraw.mutate(value, {
								onSuccess: () => toast.success(`Payout of ${zar(value)} queued`),
								onError: (e) => toast.error(e.message)
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "size-4" }), " Withdraw"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-4",
						children: "Demo mode — no real funds move. Live payments settle through PayFast and Ozow."
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-card rounded-2xl p-6 border border-white/10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold mb-4",
				children: "Transaction history"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "divide-y divide-white/5",
				children: [txns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground py-6",
					children: "No transactions yet."
				}), txns.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `size-9 rounded-lg flex items-center justify-center border ${t.amount > 0 ? "bg-brand/10 border-brand/20 text-brand-light" : "border-white/10 text-muted-foreground"}`,
							children: t.amount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: t.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										t.method.charAt(0).toUpperCase() + t.method.slice(1),
										" ·",
										" ",
										new Date(t.createdAt).toLocaleDateString("en-ZA")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnStatusPill, { status: t.status })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `text-sm font-semibold ${t.amount > 0 ? "text-brand-light" : ""}`,
							children: [
								t.amount > 0 ? "+" : "−",
								" ",
								zar(Math.abs(t.amount))
							]
						})
					]
				}, t.id))]
			})]
		})]
	})] });
}
//#endregion
export { WalletPage as component };
