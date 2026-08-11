import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as useAuth } from "./router-CEW5b3GI.mjs";
import { f as Trash2, ft as CheckCheck, l as Truck, nt as CreditCard, v as ShieldAlert, xt as Bell } from "../_libs/lucide-react.mjs";
import { s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { i as ListSkeleton, n as ErrorState, t as EmptyState } from "./states-Bg8HgEai.mjs";
import { C as useMarkAllRead, T as useNotifications, g as useClearNotifications } from "./queries-Cq7COrxw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-ACVTJg6Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	trip: Truck,
	payment: CreditCard,
	safety: ShieldAlert,
	system: Bell
};
var FILTERS = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "trip",
		label: "Trips"
	},
	{
		key: "payment",
		label: "Payments"
	},
	{
		key: "safety",
		label: "Safety"
	},
	{
		key: "system",
		label: "System"
	}
];
function dayLabel(ts) {
	const d = new Date(ts);
	const today = /* @__PURE__ */ new Date();
	const yesterday = /* @__PURE__ */ new Date(Date.now() - 864e5);
	const key = (x) => x.toDateString();
	if (key(d) === key(today)) return "Today";
	if (key(d) === key(yesterday)) return "Yesterday";
	return d.toLocaleDateString("en-ZA", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function NotificationsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsInner, {}) });
}
function NotificationsInner() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const { data: notes, isLoading, isError, refetch } = useNotifications(userId);
	const markAllRead = useMarkAllRead(userId);
	const clearNotifications = useClearNotifications(userId);
	const [kind, setKind] = (0, import_react.useState)("all");
	const notifications = notes ?? [];
	const filtered = kind === "all" ? notifications : notifications.filter((n) => n.kind === kind);
	const unread = notifications.filter((n) => !n.read).length;
	const groups = filtered.reduce((acc, n) => {
		const label = dayLabel(n.createdAt);
		const last = acc[acc.length - 1];
		if (last && last.label === label) last.items.push(n);
		else acc.push({
			label,
			items: [n]
		});
		return acc;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Activity",
		title: "Notifications",
		subtitle: "Trip milestones, payments and safety escalations as they happen."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-6 py-14 max-w-3xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted-foreground",
					children: [
						unread,
						" unread of ",
						notifications.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => markAllRead.mutate(),
						disabled: unread === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" }), " Mark all read"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => clearNotifications.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Clear"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 mb-6",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setKind(f.key),
					"aria-pressed": kind === f.key,
					className: cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", kind === f.key ? "bg-brand/15 border-brand/40 text-brand-light" : "border-white/10 text-muted-foreground hover:text-foreground"),
					children: f.label
				}, f.key))
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetch }) : groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "You are all caught up",
				description: kind === "all" ? "Trip milestones, receipts and safety alerts will appear here." : "No notifications in this category yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2",
					children: g.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: g.items.map((n) => {
						const Icon = ICONS[n.kind];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `glass-card rounded-xl p-4 border flex gap-4 ${n.read ? "border-white/10" : "border-brand/40"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: n.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm text-muted-foreground",
											children: n.body
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground mt-1",
											children: new Date(n.createdAt).toLocaleString("en-ZA")
										})
									]
								}),
								!n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-brand mt-2" })
							]
						}, n.id);
					})
				})] }, g.label))
			})
		]
	})] });
}
//#endregion
export { NotificationsPage as component };
