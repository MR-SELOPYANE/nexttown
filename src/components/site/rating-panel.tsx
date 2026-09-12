import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import type { BookingReview } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "safety", label: "Safety" },
  { key: "punctuality", label: "Punctuality" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "communication", label: "Communication" },
] as const;

export const REVIEW_CATEGORIES = CATEGORIES;

/** BRS §22 — rate a trip across four categories with an optional comment. */
export function RatingPanel({
  onSubmit,
  busy = false,
  compact = false,
}: {
  onSubmit: (review: BookingReview) => void;
  busy?: boolean;
  compact?: boolean;
}) {
  const [values, setValues] = useState<BookingReview>({
    safety: 5,
    punctuality: 5,
    cleanliness: 5,
    communication: 5,
  });
  const [comment, setComment] = useState("");

  const avg = Math.round(
    (values.safety + values.punctuality + values.cleanliness + values.communication) / 4,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Rate this trip</div>
        <div className="flex items-center gap-1 text-sm text-brand-light">
          <Star className="size-4 fill-current" /> {avg}/5
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            className="flex items-center justify-between gap-3 py-1 border-b border-white/5 last:border-0"
          >
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${c.label}: ${n} of 5`}
                  onClick={() => setValues((v) => ({ ...v, [c.key]: n }))}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-4 transition-colors",
                      (values[c.key] ?? 0) >= n
                        ? "fill-brand text-brand-light"
                        : "text-muted-foreground/60 hover:text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was the trip like? (optional)"
          rows={2}
          className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/60 mb-3 resize-none"
        />
      )}
      <Button
        size="sm"
        className="w-full bg-brand hover:bg-brand-light text-white"
        disabled={busy}
        onClick={() => onSubmit({ ...values, comment: comment.trim() || undefined })}
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>
            <Star className="size-4" /> Submit review
          </>
        )}
      </Button>
    </div>
  );
}

/** Read-only summary of an existing four-category review. */
export function ReviewSummary({ review }: { review: BookingReview }) {
  return (
    <div className="space-y-2">
      {CATEGORIES.map((c) => (
        <div key={c.key} className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{c.label}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "size-3.5",
                  (review[c.key] ?? 0) >= n
                    ? "fill-brand text-brand-light"
                    : "text-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      ))}
      {review.comment && (
        <p className="text-xs text-muted-foreground italic pt-1 border-t border-white/10">
          “{review.comment}”
        </p>
      )}
    </div>
  );
}
