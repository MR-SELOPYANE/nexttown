import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Ct as Ban, G as LifeBuoy, J as IdCard, _ as ShieldCheck, ht as Car, i as Users, ot as CircleX, s as UserCheck, st as CircleCheck } from "../_libs/lucide-react.mjs";
import { i as ROLE_LABELS, s as cn, t as Button } from "./site-nav-B0JMzhV9.mjs";
import { i as PageShell, r as PageHeader } from "./page-shell-VfhkVXqe.mjs";
import { r as RequireRole } from "./require-auth-DX6ZGA79.mjs";
import { i as StatusPill, n as KycStatusPill, r as StatCard } from "./status-N0G1dMzr.mjs";
import { i as ListSkeleton, n as ErrorState, t as EmptyState } from "./states-Bg8HgEai.mjs";
import { A as useResolveTicket, N as useSetUserStatus, d as useAllTickets, f as useApproveDriver, l as useAdminUsers, p as useApproveVehicle } from "./queries-Cq7COrxw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DINqd-zt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireRole, {
		role: "admin",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminInner, {})
	});
}
function AdminInner() {
	const { data: users = [], isLoading: loadingUsers, isError: usersError, refetch: refetchUsers } = useAdminUsers();
	const { data: tickets = [], isLoading: loadingTickets, isError: ticketsError, refetch: refetchTickets } = useAllTickets();
	const resolve = useResolveTicket();
	const [tab, setTab] = (0, import_react.useState)("users");
	const verified = users.filter((u) => u.kyc.identityStatus === "verified" && u.kyc.faceStatus === "verified" && u.kyc.phoneStatus === "verified").length;
	const pendingDocs = users.filter((u) => u.kyc.driverStatus === "pending" || u.kyc.vehicleStatus === "pending").length;
	const suspended = users.filter((u) => u.status === "suspended").length;
	const open = tickets.filter((t) => t.status === "open").length;
	tickets.filter((t) => t.status === "resolved").length;
	const emailFor = (id) => users.find((u) => u.id === id)?.email ?? "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		showCompliance: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Platform",
			title: "Admin console",
			subtitle: "Members, driver & vehicle approvals and the support inbox — one view over the marketplace."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-7xl mx-auto px-6 py-10 space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Users,
							label: "Registered members",
							value: String(users.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: ShieldCheck,
							label: "Fully verified",
							value: String(verified),
							accent: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: IdCard,
							label: "Pending approvals",
							value: String(pendingDocs)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: LifeBuoy,
							label: "Open tickets",
							value: String(open)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						["users", "Members"],
						["verification", `Approvals${pendingDocs ? ` · ${pendingDocs}` : ""}`],
						["tickets", `Support inbox${open ? ` · ${open}` : ""}`]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTab(key),
						"aria-pressed": tab === key,
						className: cn("text-sm font-medium px-4 py-2 rounded-full border transition-colors", tab === key ? "bg-brand/15 border-brand/40 text-brand-light" : "border-white/10 text-muted-foreground hover:text-foreground"),
						children: label
					}, key))
				}),
				tab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: loadingUsers ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : usersError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetchUsers }) : users.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No members yet",
						description: "Accounts will appear here."
					}) : users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberRow, { user: u }, u.id))
				}),
				tab === "verification" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: loadingUsers ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : usersError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetchUsers }) : users.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No members yet",
						description: "Accounts will appear here."
					}) : users.filter((u) => u.role !== "traveler").map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApprovalRow, { user: u }, u.id))
				}),
				tab === "tickets" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: loadingTickets ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : ticketsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: refetchTickets }) : tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Support inbox is empty",
						description: "Tickets submitted from the help pages will land here."
					}) : tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketRow, {
						ticket: t,
						email: emailFor(t.userId),
						onResolve: resolve.mutate
					}, t.id))
				}),
				suspended > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						suspended,
						" suspended account",
						suspended > 1 ? "s" : "",
						" — reactivate from the Members tab."
					]
				})
			]
		})]
	});
}
function MemberRow({ user }) {
	const setStatus = useSetUserStatus(user.id);
	const suspended = user.status === "suspended";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20 flex flex-wrap items-center gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "size-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light font-semibold",
				children: [user.firstName.charAt(0), user.lastName.charAt(0)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-semibold",
							children: [
								user.firstName,
								" ",
								user.lastName
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full border border-white/10",
							children: ROLE_LABELS[user.role]
						}),
						suspended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							status: "suspended",
							tone: "danger"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: [
						user.email,
						" · ",
						user.phone
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycStatusPill, { status: user.kyc.identityStatus === "verified" && user.kyc.faceStatus === "verified" && user.kyc.phoneStatus === "verified" ? "verified" : "pending" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: suspended ? "outline" : "destructive",
				disabled: setStatus.isPending,
				onClick: () => {
					setStatus.mutate(suspended ? "active" : "suspended");
					toast.success(suspended ? `${user.firstName} reactivated` : `${user.firstName} suspended`);
				},
				children: [suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-4" }), suspended ? "Reactivate" : "Suspend"]
			})
		]
	});
}
function ApprovalRow({ user }) {
	const approveDriver = useApproveDriver(user.id);
	const approveVehicle = useApproveVehicle(user.id);
	const driverNeeds = user.kyc.driverStatus === "pending" || user.kyc.driverStatus === "unverified";
	const vehicleNeeds = user.kyc.vehicleStatus === "pending" || user.kyc.vehicleStatus === "unverified";
	if (!driverNeeds && !vehicleNeeds) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-semibold",
							children: [
								user.firstName,
								" ",
								user.lastName
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full border border-white/10",
							children: ROLE_LABELS[user.role]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: user.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-4 mt-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "size-3.5 text-brand-light" }),
								" Driver:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycStatusPill, { status: user.kyc.driverStatus })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "size-3.5 text-brand-light" }),
								" Vehicle:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycStatusPill, { status: user.kyc.vehicleStatus })
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [driverNeeds && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					disabled: approveDriver.isPending,
					onClick: () => {
						approveDriver.mutate("approved");
						toast.success(`Driver licence approved for ${user.firstName}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Approve licence"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: approveDriver.isPending,
					onClick: () => {
						approveDriver.mutate("rejected");
						toast.error(`Driver licence rejected for ${user.firstName}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), " Reject"]
				})] }), vehicleNeeds && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "bg-brand hover:bg-brand-light text-white",
					disabled: approveVehicle.isPending,
					onClick: () => {
						approveVehicle.mutate("approved");
						toast.success(`Vehicle approved for ${user.firstName}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Approve vehicle"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: approveVehicle.isPending,
					onClick: () => {
						approveVehicle.mutate("rejected");
						toast.error(`Vehicle rejected for ${user.firstName}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), " Reject"]
				})] })]
			})]
		})
	});
}
function TicketRow({ ticket, email, onResolve }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-card rounded-2xl p-5 ring-1 ring-black/20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold",
							children: ticket.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							status: ticket.status,
							tone: ticket.status === "open" ? "warning" : "success"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: [
							ticket.topic,
							" · ",
							email
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: new Date(ticket.createdAt).toLocaleString("en-ZA")
				}),
				ticket.status === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						onResolve(ticket.id);
						toast.success("Ticket marked as resolved");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Resolve"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-3",
			children: ticket.message
		})]
	});
}
//#endregion
export { AdminPage as component };
