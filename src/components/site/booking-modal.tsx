import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  CreditCard,
  Loader2,
  Package,
  Share2,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAddFavourite, useCreateBooking } from "@/lib/hooks/queries";
import { useWallet } from "@/lib/hooks/queries";
import { useAuth } from "@/lib/store/auth-context";
import { zar } from "@/lib/format";
import type { Listing, MarketType, PaymentMethod } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export const QUANTITY_LABELS: Record<MarketType, string> = {
  ride: "Seats",
  parcel: "Parcels",
  freight: "Loads",
  flight: "Seats",
  school: "Children",
};

export function BookingModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: wallet } = useWallet(userId);
  const createBooking = useCreateBooking(userId);
  const addFavourite = useAddFavourite(userId);

  const [method, setMethod] = useState<PaymentMethod>("wallet");
  const [parcelDetails, setParcelDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createBooking.isPending && !done) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, createBooking.isPending, done]);

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
        parcelDetails:
          listing.type === "parcel" && parcelDetails.trim() ? parcelDetails.trim() : undefined,
      });
      setDone(booking.ref);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
    }
  }

  async function saveFavourite() {
    try {
      await addFavourite.mutateAsync({ label: listing.title, from: listing.from, to: listing.to });
      setSaved(true);
      toast.success("Route saved to favourites");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save favourite.");
    }
  }

  async function shareTrip() {
    const text = `${listing.title} on Next Town · ${listing.when} · ${zar(listing.price)} — book on the marketplace`;
    try {
      await navigator.clipboard?.writeText(text);
      toast.success("Trip details copied to clipboard");
    } catch {
      toast.info(text);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 bg-black/60 backdrop-blur-sm"
      onClick={() => !createBooking.isPending && !done && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${listing.title}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl p-6 ring-1 ring-black/30 max-h-[92vh] overflow-y-auto"
      >
        {done ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 size-14 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-light">
              <Check className="size-7" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Booking confirmed</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Reference <span className="font-mono text-foreground">{done}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Funds are held in escrow until your {QUANTITY_LABELS[listing.type].toLowerCase()} is
              completed.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="bg-brand hover:bg-brand-light text-white" onClick={onClose}>
                Done
              </Button>
              <Button variant="outline" asChild>
                <Link to="/track">Track live</Link>
              </Button>
              <div className="flex gap-2">
                {listing.type !== "freight" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={saved || addFavourite.isPending}
                    onClick={saveFavourite}
                  >
                    <Star className="size-4" /> {saved ? "Saved" : "Save route"}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1" onClick={shareTrip}>
                  <Share2 className="size-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Complete booking
              </h3>
              <button
                onClick={onClose}
                disabled={createBooking.isPending}
                aria-label="Close"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-1 mb-5">
              <div className="text-sm font-semibold">{listing.title}</div>
              <div className="text-xs text-muted-foreground">{listing.when}</div>
            </div>

            {!identityVerified && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 mb-5">
                <p className="font-medium mb-1">Verification required</p>
                <p className="text-xs text-amber-400/80">
                  Next Town verifies every identity before a trip. Complete your SA ID verification
                  in your profile to continue.
                </p>
                <Link to="/profile" className="mt-2 inline-block text-xs font-semibold underline">
                  Complete verification →
                </Link>
              </div>
            )}

            <div className="glass-card rounded-xl p-4 ring-1 ring-black/20 text-sm space-y-2 mb-5">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground text-xs">Operator rating</dt>
                <dd className="text-xs">{listing.rating.toFixed(1)} / 5</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground text-xs">Capacity</dt>
                <dd className="text-xs">{listing.capacity}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Total (escrow)
                </dt>
                <dd className="text-base font-semibold tabular-nums">{zar(listing.price)}</dd>
              </div>
            </div>

            {listing.type === "parcel" && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Parcel description{" "}
                  <span className="text-muted-foreground/60">(so the courier can verify it)</span>
                </label>
                <textarea
                  value={parcelDetails}
                  onChange={(e) => setParcelDetails(e.target.value)}
                  placeholder="e.g. Documents in a sealed A4 envelope · blue backpack · fragile electronics"
                  rows={2}
                  className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60 resize-none"
                />
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <Package className="size-3.5" /> Delivery is confirmed with a QR / OTP
                  proof-of-delivery code.
                </div>
              </div>
            )}

            <div className="space-y-2 mb-5">
              <button
                onClick={() => setMethod("wallet")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  method === "wallet"
                    ? "border-brand/50 bg-brand/10"
                    : "border-white/10 hover:bg-white/5",
                )}
              >
                <Wallet className="size-5 text-brand-light" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Next Town Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    Balance {zar(wallet?.balance ?? 0)}
                  </div>
                </div>
                <span
                  className={cn(
                    "size-4 rounded-full border flex items-center justify-center",
                    method === "wallet" ? "border-brand bg-brand" : "border-white/20",
                  )}
                >
                  {method === "wallet" && <Check className="size-3 text-white" />}
                </span>
              </button>
              <button
                onClick={() => setMethod("card")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  method === "card"
                    ? "border-brand/50 bg-brand/10"
                    : "border-white/10 hover:bg-white/5",
                )}
              >
                <CreditCard className="size-5 text-brand-light" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Card</div>
                  <div className="text-xs text-muted-foreground">Visa / Mastercard · PCI-DSS</div>
                </div>
                <span
                  className={cn(
                    "size-4 rounded-full border flex items-center justify-center",
                    method === "card" ? "border-brand bg-brand" : "border-white/20",
                  )}
                >
                  {method === "card" && <Check className="size-3 text-white" />}
                </span>
              </button>
            </div>

            {insufficientWallet && (
              <p className="text-xs text-destructive mb-4">
                Wallet balance is too low.{" "}
                <Link to="/wallet" className="underline font-medium">
                  Top up your wallet
                </Link>
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive mb-4" role="alert">
                {error}
              </p>
            )}

            <Button
              className="w-full bg-brand hover:bg-brand-light text-white"
              disabled={!identityVerified || insufficientWallet || createBooking.isPending}
              onClick={confirm}
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing payment…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> Pay {zar(listing.price)} &amp; confirm
                </>
              )}
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Held in escrow until your trip completes · instant refund on cancellation
            </p>
          </>
        )}
      </div>
    </div>
  );
}
