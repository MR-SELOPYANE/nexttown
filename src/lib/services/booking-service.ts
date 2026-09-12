import type { Booking, BookingReview, BookingStatus, PaymentState } from "../domain/types";
import { latency, loadJson, makeRef, saveJson, storageKey, uid } from "./core";
import { MarketService } from "./market-service";
import { WalletService } from "./wallet-service";
import { authorizeBookingPriceFn } from "../pricing/pricing-server";
import { PricingRuleStore } from "../pricing/rule-store";
import type { FareQuote } from "../pricing/types";
import { SafetyService } from "../safety";

const key = (userId: string) => storageKey("data", userId, "bookings");

function readBookings(userId: string): Booking[] {
  return loadJson<Booking[]>(key(userId), []);
}

function writeBookings(userId: string, bookings: Booking[]): void {
  saveJson(key(userId), bookings);
}

export type BookingInput = {
  listingId: string;
  type: Booking["type"];
  title: string;
  route: string;
  from: string;
  to: string;
  price: number;
  quantity: number;
  paidFromWallet: boolean;
  parcelDetails?: string;
  /** Signed dynamic-pricing quote. When present the backend re-authorises it. */
  fareQuote?: FareQuote;
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
};

const podCode = (): string => String(Math.floor(100000 + Math.random() * 899999));

/**
 * Server-authoritative price resolution. The client's `price` and `fareQuote`
 * are NEVER trusted blindly: we ask the server to re-derive the fare and only
 * proceed when the quote is valid and unexpired. If the server is unavailable
 * we fall back to the local rule store (offline/demo), still verifying the
 * quote's signature and expiry.
 */
async function resolveAuthoritativePrice(
  input: BookingInput,
): Promise<{ price: number; fareQuote?: FareQuote; fareBreakdown?: FareQuote["breakdown"] }> {
  const quote = input.fareQuote;

  if (!quote) {
    // No dynamic quote supplied — keep the client price (marketplace listings,
    // operator-set fares) but record it as-is.
    return { price: input.price };
  }

  // Try the authoritative server first.
  const serverResult = await authorizeBookingPriceFn({ data: { quote: quote } });
  if (serverResult && serverResult.ok) {
    return {
      price: serverResult.price,
      fareQuote: serverResult.quote,
      fareBreakdown: serverResult.quote.breakdown,
    };
  }
  if (serverResult && !serverResult.ok && !serverResult.degraded) {
    // Server is authoritative and refused — surface the reason to the caller.
    const err = new Error(serverResult.message || "Price could not be authorised.");
    (err as Error & { code?: string }).code = serverResult.code;
    throw err;
  }

  // Degraded / no server: local fallback, still verifying signature + expiry.
  if (PricingRuleStore.verify(quote, Date.now())) {
    return { price: quote.breakdown.total, fareQuote: quote, fareBreakdown: quote.breakdown };
  }
  const fresh = PricingRuleStore.quote(quote.tripInput, Date.now());
  const err = new Error("This quote is no longer valid — refresh for the current price.");
  (err as Error & { code?: string }).code = "expired";
  throw err;
}

/** Finalises a booking: release escrow to the operator and record the payout. */
async function complete(booking: Booking): Promise<Booking> {
  const released = { ...booking, payment: "paid" as PaymentState };
  await WalletService.release(booking.userId, booking.ref, booking.price);
  const listing = await MarketService.get(booking.listingId);
  const tierId = booking.fareQuote?.tripInput.tierId;
  const feeRate = tierId
    ? PricingRuleStore.get().tiers.find((t) => t.id === tierId)?.serviceFeeRate
    : undefined;
  if (listing && listing.ownerId !== booking.userId) {
    await WalletService.creditPayout(
      listing.ownerId,
      `${booking.type} · ${booking.title}`,
      booking.price,
      feeRate,
    );
  }
  return released;
}

export const BookingService = {
  async mine(userId: string): Promise<Booking[]> {
    await latency(280);
    return readBookings(userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async create(userId: string, input: BookingInput): Promise<Booking> {
    await latency(600);
    const ref = makeRef();
    const resolved = await resolveAuthoritativePrice(input);
    const hold = await WalletService.hold(userId, resolved.price, ref, input.paidFromWallet);
    const booking: Booking = {
      id: uid(),
      ref,
      userId,
      listingId: input.listingId,
      type: input.type,
      title: input.title,
      route: input.route,
      from: input.from,
      to: input.to,
      price: resolved.price,
      fareQuote: resolved.fareQuote,
      fareBreakdown: resolved.fareBreakdown,
      quantity: input.quantity,
      status: hold.status === "pending" ? "requested" : "confirmed",
      payment: "held",
      paidFromWallet: input.paidFromWallet,
      pickupLocation: input.pickupLocation,
      dropoffLocation: input.dropoffLocation,
      podCode: input.type === "parcel" ? podCode() : undefined,
      parcelDetails: input.parcelDetails,
      createdAt: Date.now(),
    };
    writeBookings(userId, [booking, ...readBookings(userId)]);
    SafetyService.recordRideEvent(userId, booking.id, "RIDE_REQUESTED", {
      rideType: booking.type,
    });
    await MarketService.consumeSeats(input.listingId, input.quantity);
    return booking;
  },

  async advance(userId: string, id: string): Promise<Booking> {
    await latency(300);
    const all = readBookings(userId);
    const booking = all.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found.");
    const next: Record<BookingStatus, BookingStatus | null> = {
      requested: "confirmed",
      confirmed: "in_transit",
      in_transit: "completed",
      completed: null,
      cancelled: null,
    };
    const target = next[booking.status];
    if (!target) throw new Error("Booking cannot be advanced from its current state.");
    if (booking.type === "parcel" && target === "completed") {
      throw new Error("Parcels require OTP proof-of-delivery before completing.");
    }

    let updated: Booking = { ...booking, status: target };

    const eventByStatus: Partial<
      Record<BookingStatus, Parameters<typeof SafetyService.recordRideEvent>[2]>
    > = {
      confirmed: "DRIVER_ASSIGNED",
      in_transit: "TRIP_STARTED",
      completed: "TRIP_COMPLETED",
    };
    const eventType = eventByStatus[target];
    if (eventType) SafetyService.recordRideEvent(userId, booking.id, eventType);
    if (target === "in_transit") {
      SafetyService.recordRideEvent(userId, booking.id, "PICKUP_CONFIRMED");
    }

    if (target === "completed") {
      updated = await complete({ ...updated, completedAt: Date.now() });
    }

    writeBookings(
      userId,
      all.map((b) => (b.id === id ? updated : b)),
    );
    return updated;
  },

  /** BRS §14 — courier/sender confirms delivery with the OTP shown against the QR code. */
  async completeParcel(userId: string, id: string, code: string): Promise<Booking> {
    await latency(500);
    const all = readBookings(userId);
    const booking = all.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found.");
    if (booking.type !== "parcel") throw new Error("Proof-of-delivery only applies to parcels.");
    if (booking.status !== "in_transit") throw new Error("Parcel is not in transit.");
    if (String(booking.podCode ?? "").trim() !== code.trim()) {
      throw new Error("That OTP is incorrect. Check the code shown against the QR.");
    }
    SafetyService.recordRideEvent(userId, booking.id, "TRIP_COMPLETED");
    const updated = await complete({ ...booking, status: "completed", completedAt: Date.now() });
    writeBookings(
      userId,
      all.map((b) => (b.id === id ? updated : b)),
    );
    return updated;
  },

  /** BRS §22 — four-category review (safety, punctuality, cleanliness, communication). */
  async review(userId: string, id: string, review: BookingReview): Promise<Booking> {
    await latency(250);
    const all = readBookings(userId);
    const avg = Math.round(
      (review.safety + review.punctuality + review.cleanliness + review.communication) / 4,
    );
    const updated = all.map((b) => (b.id === id ? { ...b, review, rating: avg } : b));
    writeBookings(userId, updated);
    return updated.find((b) => b.id === id) as Booking;
  },

  async cancel(userId: string, id: string): Promise<Booking> {
    await latency(400);
    const all = readBookings(userId);
    const booking = all.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found.");
    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new Error("Completed bookings cannot be cancelled.");
    }
    const updated: Booking = {
      ...booking,
      status: "cancelled",
      payment: booking.payment === "held" ? "refunded" : booking.payment,
    };
    SafetyService.recordRideEvent(userId, booking.id, "RIDE_CANCELLED");
    if (booking.payment === "held") {
      if (booking.paidFromWallet) {
        await WalletService.refund(userId, booking.ref, booking.price);
      } else {
        await WalletService.cancelHold(userId, booking.ref);
      }
    }
    await MarketService.releaseSeats(booking.listingId, booking.quantity);
    writeBookings(
      userId,
      all.map((b) => (b.id === id ? updated : b)),
    );
    return updated;
  },

  async rate(userId: string, id: string, rating: number): Promise<Booking> {
    await latency(200);
    const all = readBookings(userId);
    const updated = all.map((b) => (b.id === id ? { ...b, rating } : b));
    writeBookings(userId, updated);
    return updated.find((b) => b.id === id) as Booking;
  },
};
