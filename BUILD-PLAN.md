# HITCH SA — Build Plan (based on the BRS)

Source of truth: `src/lib/store/HITCH HIKING SA.md` (Business Requirements Specification v1.0).

Goal: turn the current demo-grade web app into the production-ready mobility marketplace
described in the BRS and README: rides, parcels, truck return-loads, empty airline seats,
school transport, commuters, wallet/escrow payments, GPS tracking, emergency/SOS, ratings,
admin analytics — all running on a real backend.

---

## 1. Current state vs BRS (gap analysis)

### Already built (front-end simulation, localStorage-backed)
| Area | What exists |
| --- | --- |
| Landing & marketing pages | `/`, `/about`, `/features`, `/pricing`, `/careers`, `/support`, `/faq`, `/contact` |
| Auth | Register, login, logout, forgot/reset password, session (`auth-service.ts`) |
| KYC / verification | `/verify` — identity check, phone OTP, selfie liveness (simulated), driver/vehicle statuses |
| Marketplaces | `/rides`, `/ride`, `/parcels`, `/freight`, `/flights`, `/school` — search + create listings |
| Bookings | create/advance/cancel/rate with escrow hold → release → payout (`booking-service.ts`) |
| Wallet | top-up, escrow, refunds, payouts, withdrawals, txn history (`wallet-service.ts`) |
| Notifications & SOS | `/notifications`, `/track` SOS logging |
| Dashboards | `/dashboard`, `/admin`, `/drive`, `/profile`, `/wallet` |
| Support | `/support` ticket form |
| Legal / compliance | `/legal/*` (privacy, terms, cookies, POPIA, security) |
| Design system | shadcn/ui, Tailwind v4, dark mode, glassmorphism, Framer Motion, recharts |

### Missing / simulated only (the build backlog)
| BRS module | Status | Notes |
| --- | --- | --- |
| 1. User registration | 🟢 done | Real email/phone verification still simulated (OTP `482913`) |
| 2–3. Identity & face recognition | 🟡 partial | No real liveness / ID-document OCR / duplicate-account detection |
| 4–5. Driver & vehicle verification | 🟡 partial | No licence/registration validation, expiry checks, vehicle inspection |
| 6. Ride matching | 🟡 partial | Basic text/geo search; no smart algorithm (safety score, seat matching, ETA, pricing) |
| 7. Parcel delivery | 🟡 partial | No parcel photos, QR/OTP proof of delivery, insurance, live tracking |
| 8. Truck return loads | 🟡 partial | No load-capacity booking, cargo tracking, invoicing |
| 9. Airline seats | 🟡 partial | No dynamic pricing, boarding QR, check-in, refunds flow |
| 10. School transport | 🟡 partial | No student/parent records, attendance, pickup/drop verification, recurring trips |
| 11. Commuter transport | 🟡 partial | No recurring/subscription commute plans |
| 12. Payments | 🟡 partial | Escrow works; no real PayFast/Ozow/Stripe, cards, EFT, subscriptions, coupons, invoices, tax |
| 13. GPS tracking | 🟡 partial | Google Maps polylines + simulated vehicle; no real device GPS ingest, ETA, deviation alerts |
| 14. Emergency services | 🟡 partial | SOS button + log; no police/medical dispatch or 24/7 ops integration |
| 15. Ratings & reviews | 🟡 partial | Single star per booking; no 4-category scoring or driver/passenger reputation |
| 16. Customer support | 🟢 done | Tickets; no admin triage workflow |
| 17. Analytics dashboard | 🟡 partial | Some stats; no revenue/user/trip/safety reporting |
| Backend | 🔴 not built | All data is `localStorage` + simulated latency (`core.ts`). README requires Node/Express/PostgreSQL/Prisma/Redis/Socket.IO |
| Mobile apps | 🔴 not built | BRS §25: Passenger + Driver apps (Flutter) |

---

## 2. Recommended phases

### Phase 1 — Foundation (real backend)
1. Stand up API service: Node.js + Express (or Nitro, already used for SSR), PostgreSQL + Prisma, Redis cache, Socket.IO for realtime.
2. Port domain models in `src/lib/domain/types.ts` into a Prisma schema (users, drivers, vehicles, listings, bookings, wallets, transactions, parcels, truck loads, flights, schools, students, parents, gps_logs, emergency_alerts, notifications, reviews, tickets, coupons, subscriptions, audit_logs).
3. Repository + service layer; replace `loadJson/saveJson` calls in `*service.ts` with real API clients (keep the same method signatures so the UI barely changes).
4. Auth upgrade: JWT + refresh tokens, OTP via SMS/email provider, 2FA (TOTP), account locking, device/session tracking, audit logs, POPIA-compliant consent.
5. Real KYC: SA ID number validation (Luhn + format), ID-verification API, selfie upload with liveness, duplicate-account prevention. Driver licence + vehicle registration validation with expiry checks.

### Phase 2 — Core marketplaces to spec
6. Ride matching engine: distance-based radius search, driver ratings, safety score, seat & gender preferences, ETA prediction, price optimisation, Socket.IO live driver discovery, cancellation prediction hooks.
7. Parcel module: create delivery, parcel photos, QR + OTP proof of delivery, insurance, live tracking, returns, damage reports.
8. Truck return-load module: publish empty capacity/routes, book loads, cargo GPS tracking, invoicing + payments.
9. Airline seat marketplace: flights, seat management, dynamic pricing, boarding QR, check-in, refunds.
10. School buddy transport: register children, form transport groups, vet drivers, attendance, pickup/drop verification, recurring trips, monthly billing, parent GPS tracking + emergency alerts.
11. Commuter module: recurring shared trips, cost splitting, subscriptions.

### Phase 3 — Payments, safety, analytics
12. Payments: wallet, escrow, split payments, driver payouts, refunds, cards, EFT, Ozow, PayFast, Stripe, subscriptions, coupons, invoices, tax, financial reports.
13. GPS & safety: real device location ingest, route recording, ETA, stop/deviations monitoring, speed alerts, SOS with emergency contacts + police/medical notification, trip history.
14. Ratings & reviews: 4-category scoring (safety, punctuality, cleanliness, communication), aggregated driver/passenger/truck/parcel reputation.
15. Admin portal: user/driver/trip/vehicle/parcel/load/flight/payment/dispute/support management, fraud detection, approvals, permissions, live monitoring, incident investigation.
16. Reporting & analytics: revenue, user, trip, safety, driver performance, parcel, load reports + dashboard KPIs (1M users, 100k drivers, 50k trips/day, 20k parcels, 5k loads, <0.1% incidents, 90% satisfaction).

### Phase 4 — Mobile, security, compliance, scale
17. Flutter passenger + driver apps (BRS §25) consuming the same REST APIs.
18. Enterprise security: encryption at rest/in transit, RBAC, rate limiting, SQL-injection/XSS/CSRF protection, secure uploads with malware scanning, fraud detection, device tracking, audit logs.
19. Compliance: POPIA, Road Traffic Act, Consumer Protection Act, Electronic Communications Act, financial + passenger transport regulations.
20. Production audit: architecture, performance, accessibility, SEO, CI/CD, Docker, monitoring, logging, caching, load-testing for scale.

---

## 3. Immediate next steps (suggested order)

1. `prisma/schema.prisma` — full normalized schema with indexes, FKs, views, stored procedures, triggers.
2. `server/api/*` — REST endpoints mirroring the existing service contracts (auth, market, booking, wallet, notification, support).
3. Swap service internals to fetch over HTTP; delete simulated latency/shortcuts.
4. Real auth (JWT + OTP + 2FA) end-to-end.
5. Ride matching engine (highest-visibility BRS differentiator).
6. Parcel proof-of-delivery (QR/OTP) — first vertical to go fully spec-compliant.
7. Admin approvals workflow (driver/vehicle).
8. Reporting + KPIs.

Each phase should end with: typecheck (`npx tsc --noEmit`), lint, build (`npm run build`), and manual review of the affected flows.

---

## 4. Notes / constraints

- Keep the current file-based TanStack router and shadcn UI; extend, don't rewrite.
- Remove the localStorage persistence only when the API is stable; keep service signatures stable to minimise UI churn.
- `src/routeTree.gen.ts` is auto-generated — never hand-edit; it regenerates on `npm run build`.
- Run `npm run build` after touching routes (it regenerates the route tree).
