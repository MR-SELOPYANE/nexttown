import type { Booking, BookingReview, BookingStatus, PaymentState } from "../domain/types";
import { latency, loadJson, makeRef, saveJson, storageKey, uid } from "./core";
import { MarketService } from "./market-service";
import { WalletService } from "./wallet-service";

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
};

const podCode = (): string =>
  String(Math.floor(100000 + Math.random() * 899999));

/** Finalises a booking: release escrow to the operator and record the payout. */
async function complete(booking: Booking): Promise<Booking> {
  const released = { ...booking, payment: "paid" as PaymentState };
  await WalletService.release(booking.userId, booking.ref, booking.price);
  await WalletService.creditPayout(
    booking.userId,
    `${booking.type} · ${booking.title}`,
    booking.price,
  );
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
    const hold = await WalletService.hold(userId, input.price, ref, input.paidFromWallet);
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
      price: input.price,
      quantity: input.quantity,
      status: hold.status === "pending" ? "requested" : "confirmed",
      payment: "held",
      paidFromWallet: input.paidFromWallet,
      podCode: input.type === "parcel" ? podCode() : undefined,
      parcelDetails: input.parcelDetails,
      createdAt: Date.now(),
    };
    writeBookings(userId, [booking, ...readBookings(userId)]);
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

    if (target === "completed") {
      updated = await complete(updated);
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
    const updated = await complete({ ...booking, status: "completed" });
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
    const updated = all.map((b) =>
      b.id === id ? { ...b, review, rating: avg } : b,
    );
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
    if (booking.payment === "held") {
      await WalletService.refund(userId, booking.ref, booking.price);
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
