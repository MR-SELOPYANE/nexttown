import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Banknote, Wallet as WalletIcon } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { useDemo, zar } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "HITCH SA Wallet — Top up, pay and get paid" },
      {
        name: "description",
        content:
          "Manage your HITCH SA wallet: instant EFT top-ups with Ozow and PayFast, trip payments, operator payouts and a full transaction history.",
      },
      { property: "og:title", content: "HITCH SA Wallet" },
      {
        property: "og:description",
        content: "Top up, pay for trips and withdraw operator earnings in one South African mobility wallet.",
      },
    ],
  }),
  component: WalletPage,
});

const PRESETS = [100, 250, 500, 1000];
const METHODS = ["Ozow", "PayFast", "Card"] as const;

function WalletPage() {
  const { balance, txns, topUp, withdraw } = useDemo();
  const [amount, setAmount] = useState("250");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("Ozow");

  const value = Math.max(0, Number(amount) || 0);
  const inflow = txns.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const outflow = txns.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Payments"
        title="Your HITCH SA wallet"
        subtitle="One balance for rides, parcels, freight and flights — funded by instant EFT, card or operator earnings."
      />
      <section className="px-6 py-14 max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <WalletIcon className="size-4 text-brand-light" /> Available balance
            </div>
            <div className="text-5xl font-semibold tracking-tight mt-3">{zar(balance)}</div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-xs text-muted-foreground">Total in</div>
                <div className="text-lg font-semibold text-brand-light">{zar(inflow)}</div>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-xs text-muted-foreground">Total out</div>
                <div className="text-lg font-semibold">{zar(outflow)}</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">Top up</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    Number(amount) === p
                      ? "border-brand/50 bg-brand/15 text-brand-light"
                      : "border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  R {p}
                </button>
              ))}
            </div>
            <Input
              value={amount}
              inputMode="numeric"
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className="mb-4"
              aria-label="Top up amount in rand"
            />
            <div className="flex flex-wrap gap-2 mb-5">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    method === m
                      ? "border-brand/50 bg-brand/15 text-brand-light"
                      : "border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-brand hover:bg-brand-light text-white"
                disabled={value <= 0}
                onClick={() => {
                  topUp(value, method);
                  toast.success(`${zar(value)} added via ${method}`);
                }}
              >
                Top up {zar(value)}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (withdraw(value)) toast.success(`Payout of ${zar(value)} queued`);
                  else toast.error("Insufficient balance for that payout");
                }}
              >
                <Banknote className="size-4" /> Withdraw
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Demo mode — no real funds move. Live payments settle through PayFast and Ozow.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h2 className="font-semibold mb-4">Transaction history</h2>
          <div className="divide-y divide-white/5">
            {txns.length === 0 && (
              <p className="text-sm text-muted-foreground py-6">No transactions yet.</p>
            )}
            {txns.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center border ${
                    t.amount > 0
                      ? "bg-brand/10 border-brand/20 text-brand-light"
                      : "border-white/10 text-muted-foreground"
                  }`}
                >
                  {t.amount > 0 ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.method} · {new Date(t.createdAt).toLocaleDateString("en-ZA")}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${t.amount > 0 ? "text-brand-light" : ""}`}
                >
                  {t.amount > 0 ? "+" : "−"} {zar(Math.abs(t.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
