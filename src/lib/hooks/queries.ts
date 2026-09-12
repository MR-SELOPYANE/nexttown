import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/auth-service";
import { BookingService, type BookingInput } from "../services/booking-service";
import { MarketService, type SearchQuery } from "../services/market-service";
import { NotificationService } from "../services/notification-service";
import { SupportService } from "../services/support-service";
import { WalletService } from "../services/wallet-service";
import { FavouriteService } from "../services/favourite-service";
import { CommuteService, type CommuteInput } from "../services/commute-service";
import {
  getPricingQuoteFn,
  getPricingRulesFn,
  resetPricingRulesFn,
  savePricingRulesFn,
} from "../pricing/pricing-server";
import { PricingRuleStore } from "../pricing/rule-store";
import type { PriceTripInput, PricingRules } from "../pricing/types";
import type { BookingReview, MarketType, NotificationKind, Role } from "../domain/types";
import type { SafetyIncidentKind } from "../safety";
import { SafetyService } from "../safety";

export const qk = {
  listings: (type: MarketType) => ["listings", type] as const,
  search: (q: SearchQuery) => ["search", q.type, q.from ?? "", q.to ?? "", q.when ?? ""] as const,
  mineListings: (userId: string) => ["listings", "mine", userId] as const,
  bookings: (userId: string) => ["bookings", userId] as const,
  wallet: (userId: string) => ["wallet", userId] as const,
  txns: (userId: string) => ["txns", userId] as const,
  notifications: (userId: string) => ["notifications", userId] as const,
  sos: (userId: string) => ["sos", userId] as const,
  tickets: (userId: string) => ["tickets", userId] as const,
  adminTickets: () => ["tickets", "all"] as const,
  adminUsers: () => ["users", "all"] as const,
  favourites: (userId: string) => ["favourites", userId] as const,
  commutePlans: (userId: string) => ["commute-plans", userId] as const,
  pricingQuote: () => ["pricing", "quote"] as const,
  pricingRules: () => ["pricing", "rules"] as const,
};

export function useListings(type: MarketType) {
  return useQuery({ queryKey: qk.listings(type), queryFn: () => MarketService.list(type) });
}

export function useSearch(query: SearchQuery, enabled = true) {
  return useQuery({
    queryKey: qk.search(query),
    queryFn: () => MarketService.search(query),
    enabled,
  });
}

export function useMyListings(userId: string) {
  return useQuery({ queryKey: qk.mineListings(userId), queryFn: () => MarketService.mine(userId) });
}

export function useBookings(userId: string) {
  return useQuery({ queryKey: qk.bookings(userId), queryFn: () => BookingService.mine(userId) });
}

export function useWallet(userId: string) {
  return useQuery({ queryKey: qk.wallet(userId), queryFn: () => WalletService.get(userId) });
}

export function useTxns(userId: string) {
  return useQuery({ queryKey: qk.txns(userId), queryFn: () => WalletService.txns(userId) });
}

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: qk.notifications(userId),
    queryFn: () => NotificationService.mine(userId),
  });
}

export function useSosLog(userId: string) {
  return useQuery({ queryKey: qk.sos(userId), queryFn: () => NotificationService.sosLog(userId) });
}

export function useMyTickets(userId: string) {
  return useQuery({ queryKey: qk.tickets(userId), queryFn: () => SupportService.mine(userId) });
}

export function useAllTickets() {
  return useQuery({ queryKey: qk.adminTickets(), queryFn: () => SupportService.all() });
}

export function useAdminUsers() {
  return useQuery({ queryKey: qk.adminUsers(), queryFn: () => AuthService.allUsers() });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SupportService.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminTickets() }),
  });
}

export function useCreateBooking(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingInput) => BookingService.create(userId, input),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      qc.invalidateQueries({ queryKey: qk.search({ type: booking.type }) });
      qc.invalidateQueries({ queryKey: qk.listings(booking.type) });
    },
  });
}

export function useAdvanceBooking(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BookingService.advance(userId, id),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      void NotificationService.push(userId, {
        title: `${booking.ref} ${booking.status === "in_transit" ? "in transit" : booking.status}`,
        body: booking.title,
        kind: "trip",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
    },
  });
}

export function useCancelBooking(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BookingService.cancel(userId, id),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      void NotificationService.push(userId, {
        title: `${booking.ref} cancelled`,
        body: `Refund of ${booking.price} will return to your balance.`,
        kind: "payment",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
    },
  });
}

export function useRateBooking(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      BookingService.rate(userId, id, rating),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings(userId) }),
  });
}

export function useTopUp(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; method: "payfast" | "ozow" | "card" }) =>
      WalletService.topUp(userId, input.amount, input.method),
    onSuccess: (txn) => {
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      void NotificationService.push(userId, {
        title: "Wallet top-up submitted",
        body: `${txn.amount} via ${txn.method} is being processed.`,
        kind: "payment",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: qk.wallet(userId) });
        qc.invalidateQueries({ queryKey: qk.txns(userId) });
      }, 1200);
    },
  });
}

export function useWithdraw(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => WalletService.withdraw(userId, amount),
    onSuccess: (txn) => {
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      void NotificationService.push(userId, {
        title: "Payout requested",
        body: `${txn.amount} scheduled to reach your bank account.`,
        kind: "payment",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
    },
  });
}

export function useMarkAllRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.markAllRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) }),
  });
}

export function useNotify(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (n: { title: string; body: string; kind: NotificationKind }) =>
      NotificationService.push(userId, n),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) }),
  });
}

export function useClearNotifications(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.clear(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(userId) }),
  });
}

export function useTriggerSos(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (where: string) => NotificationService.sos(userId, where),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.sos(userId) });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
      void NotificationService.push(userId, {
        title: "SOS dispatched",
        body: "Your live location was shared with the Next Town safety desk and your emergency contact.",
        kind: "safety",
      });
    },
  });
}

export function useRideEvents(userId: string, bookingId: string | undefined) {
  return useQuery({
    queryKey: ["safety", "ride-events", userId, bookingId],
    queryFn: () => SafetyService.listRideEvents(userId, bookingId!),
    enabled: Boolean(userId && bookingId),
  });
}

export function useRecordRideEvent(userId: string, bookingId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      type: Parameters<typeof SafetyService.recordRideEvent>[2];
      metadata?: Record<string, string | number | boolean>;
    }) => {
      if (!bookingId) throw new Error("Booking is required.");
      return Promise.resolve(
        SafetyService.recordRideEvent(userId, bookingId, input.type, input.metadata),
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["safety", "ride-events", userId, bookingId] }),
  });
}

export function useCreateSafetyIncident(userId: string) {
  return useMutation({
    mutationFn: (input: {
      kind: SafetyIncidentKind;
      message: string;
      bookingId?: string;
      location?: { lat: number; lng: number };
    }) =>
      Promise.resolve(
        SafetyService.createIncident(userId, input.kind, input.message, {
          bookingId: input.bookingId,
          location: input.location,
        }),
      ),
  });
}

export function useCreateTripShare(userId: string) {
  return useMutation({
    mutationFn: (bookingId: string) =>
      Promise.resolve(SafetyService.createTripShare(userId, bookingId)),
  });
}

export function useCreateListing(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof MarketService.create>[1]) =>
      MarketService.create(userId, input),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: qk.mineListings(userId) });
      qc.invalidateQueries({ queryKey: qk.listings(listing.type) });
    },
  });
}

export function useToggleListing(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MarketService.toggle(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.mineListings(userId) }),
  });
}

export function useRemoveListing(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MarketService.remove(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.mineListings(userId) }),
  });
}

export function useSubmitTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof SupportService.submit>[0]) =>
      SupportService.submit(input),
    onSuccess: (ticket) => {
      if (ticket.userId) qc.invalidateQueries({ queryKey: qk.tickets(ticket.userId) });
      qc.invalidateQueries({ queryKey: qk.adminTickets() });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof AuthService.updateUser>[0]) =>
      AuthService.updateUser(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminUsers() }),
  });
}

export function useReviewBooking(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: BookingReview }) =>
      BookingService.review(userId, id, review),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings(userId) }),
  });
}

export function useCompleteParcel(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      BookingService.completeParcel(userId, id, code),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      void NotificationService.push(userId, {
        title: `${booking.ref} delivered`,
        body: `${booking.title} â€” proof-of-delivery verified.`,
        kind: "trip",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
    },
  });
}

export function useFavourites(userId: string) {
  return useQuery({
    queryKey: qk.favourites(userId),
    queryFn: () => FavouriteService.list(userId),
    enabled: Boolean(userId),
  });
}

export function useAddFavourite(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; from: string; to: string }) =>
      FavouriteService.add(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.favourites(userId) }),
  });
}

export function useRemoveFavourite(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FavouriteService.remove(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.favourites(userId) }),
  });
}

export function useCommutePlans(userId: string) {
  return useQuery({
    queryKey: qk.commutePlans(userId),
    queryFn: () => CommuteService.mine(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateCommutePlan(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CommuteInput) => CommuteService.create(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) }),
  });
}

export function useRemoveCommutePlan(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CommuteService.remove(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) }),
  });
}

export function useSubscribeCommute(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CommuteService.subscribe(userId, id),
    onSuccess: (plan) => {
      qc.invalidateQueries({ queryKey: qk.commutePlans(userId) });
      qc.invalidateQueries({ queryKey: qk.wallet(userId) });
      qc.invalidateQueries({ queryKey: qk.txns(userId) });
      void NotificationService.push(userId, {
        title: "Commute pass active",
        body: `${plan.from} â†’ ${plan.to} Â· ${COMMUTE_MONTHLY(plan.weeklyCost)} billed to wallet.`,
        kind: "payment",
      });
      qc.invalidateQueries({ queryKey: qk.notifications(userId) });
    },
  });
}

export function useUnsubscribeCommute(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CommuteService.unsubscribe(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.commutePlans(userId) }),
  });
}

const COMMUTE_MONTHLY = (weekly: number) => `R ${Math.round(weekly * 4.3).toLocaleString("en-ZA")}`;

export function useApproveDriver(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: "approved" | "rejected") =>
      AuthService.approveDoc(userId, "driver", decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUsers() });
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
    },
  });
}

export function useApproveVehicle(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: "approved" | "rejected") =>
      AuthService.approveDoc(userId, "vehicle", decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUsers() });
      qc.invalidateQueries({ queryKey: qk.bookings(userId) });
    },
  });
}

export function useSetUserStatus(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: "active" | "suspended") => AuthService.setUserStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminUsers() }),
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
  });
}

export function useUsersByRole(roles: Role[]) {
  return useQuery({
    queryKey: ["users", "role", roles.join(",")] as const,
    queryFn: async () => {
      const all = await AuthService.allUsers();
      return all.filter((u) => roles.includes(u.role));
    },
  });
}

export type PricingQuoteResult = {
  quote: import("../pricing/types").FareQuote | null;
  local: boolean;
  error?: string;
};

export function usePricingQuote(input: PriceTripInput | null) {
  return useQuery({
    queryKey: [...qk.pricingQuote(), input] as const,
    queryFn: async (): Promise<PricingQuoteResult> => {
      if (!input) return { quote: null, local: false };
      try {
        const res = await getPricingQuoteFn({ data: { tripInput: input } });
        if (res && "token" in res)
          return { quote: res as import("../pricing/types").FareQuote, local: false };
        if (res && "error" in res) {
          return {
            quote: PricingRuleStore.quote(input),
            local: true,
            error: (res as { error: string }).error,
          };
        }
      } catch {
        /* server unreachable â€” local fallback below */
      }
      return { quote: PricingRuleStore.quote(input), local: true };
    },
    enabled: Boolean(input) && Number.isFinite(input?.distanceKm) && input!.distanceKm > 0,
  });
}

/** Quote several classes at once (ride-now selection screen). */
export function usePricingQuotes(inputs: PriceTripInput[]) {
  return useQueries({
    queries: inputs.map((input) => ({
      queryKey: [...qk.pricingQuote(), input] as const,
      queryFn: async (): Promise<PricingQuoteResult> => {
        if (!input) return { quote: null, local: false };
        try {
          const res = await getPricingQuoteFn({ data: { tripInput: input } });
          if (res && "token" in res)
            return { quote: res as import("../pricing/types").FareQuote, local: false };
        } catch {
          /* fall through to local */
        }
        return { quote: PricingRuleStore.quote(input), local: true };
      },
      enabled: Boolean(input.distanceKm) && input.distanceKm > 0,
    })),
  });
}

export function useAdminPricingRules() {
  return useQuery({
    queryKey: qk.pricingRules(),
    queryFn: async () => {
      const res = await getPricingRulesFn();
      if ("rules" in res && res.rules) return res;
      return { rules: PricingRuleStore.get(), sample: null };
    },
  });
}

export function useSavePricingRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rules: PricingRules) => {
      const res = await savePricingRulesFn({ data: { rules } });
      if (res && "error" in res && res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.pricingRules() }),
  });
}

export function useResetPricingRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => resetPricingRulesFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.pricingRules() }),
  });
}
