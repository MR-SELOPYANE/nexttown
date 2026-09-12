import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAdminPricingRules,
  useResetPricingRules,
  useSavePricingRules,
} from "@/lib/hooks/queries";
import { zar } from "@/lib/format";
import type { PricingRules, VehicleMultipliers } from "@/lib/pricing/types";

/**
 * Admin panel for the dynamic pricing engine. Loads the authoritative rules
 * from the server, lets an operator tune the demand curve, vehicle & zone
 * multipliers, time windows and tiers, shows a live sample fare, and persists
 * edits back through the server (which bumps the rules version to invalidate
 * outstanding quotes).
 */
export function PricingAdminPanel() {
  const { data, isLoading, isError, refetch } = useAdminPricingRules();
  const save = useSavePricingRules();
  const reset = useResetPricingRules();

  const rules = data?.rules;
  const [draft, setDraft] = useState<PricingRules | null>(null);

  useEffect(() => {
    if (rules && !draft) setDraft(JSON.parse(JSON.stringify(rules)));
  }, [rules]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading pricing rules…</div>;
  if (isError || !rules || !draft) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">Could not load pricing rules.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4" /> Retry
        </Button>
      </div>
    );
  }

  const sample = data?.sample;

  const patch = (fn: (d: PricingRules) => void) => {
    const next = JSON.parse(JSON.stringify(draft));
    fn(next);
    setDraft(next);
  };

  const patchVehicle = (key: keyof VehicleMultipliers, value: number) =>
    patch((d) => {
      d.vehicle[key] = value;
    });

  const handleSave = () => {
    if (!draft) return;
    save.mutate(draft, {
      onSuccess: (res) => {
        if (res && (res as { error?: string }).error) {
          toast.error((res as { error: string }).error);
          return;
        }
        setDraft(null);
        toast.success("Pricing rules saved — existing quotes are now invalid.");
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save rules"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Dynamic pricing</h2>
          <p className="text-xs text-muted-foreground">
            Rules v{draft.version} · every change expires outstanding quotes so passengers always
            pay the current authoritative fare.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={reset.isPending}
            onClick={() =>
              reset.mutate(undefined, {
                onSuccess: () => {
                  setDraft(null);
                  toast.success("Pricing rules reset to defaults.");
                },
              })
            }
          >
            <RefreshCw className="size-4" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={save.isPending}>
            <Save className="size-4" /> {save.isPending ? "Saving…" : "Save rules"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Demand & supply */}
        <Card title="Demand curve & supply">
          <Field label="Minimum multiplier">
            <Input
              type="number"
              step={0.05}
              min={1}
              value={draft.demandCurve.min}
              onChange={(e) => patch((d) => (d.demandCurve.min = Number(e.target.value)))}
            />
          </Field>
          <Field label="Maximum multiplier">
            <Input
              type="number"
              step={0.05}
              min={1}
              value={draft.demandCurve.max}
              onChange={(e) => patch((d) => (d.demandCurve.max = Number(e.target.value)))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.applySupply}
              onChange={(e) => patch((d) => (d.applySupply = e.target.checked))}
            />
            Factor in driver supply
          </label>
          {draft.applySupply && (
            <Field label="Supply factor (0–1)">
              <Input
                type="number"
                step={0.05}
                min={0}
                max={1}
                value={draft.supplyFactor}
                onChange={(e) => patch((d) => (d.supplyFactor = Number(e.target.value)))}
              />
            </Field>
          )}
          <Field label="Quote TTL (ms)">
            <Input
              type="number"
              min={1000}
              value={draft.quoteTtlMs}
              onChange={(e) => patch((d) => (d.quoteTtlMs = Number(e.target.value)))}
            />
          </Field>
        </Card>

        {/* Vehicle multipliers */}
        <Card title="Vehicle multipliers">
          {Object.entries(draft.vehicle).map(([key, value]) => (
            <Field label={label(key)} key={key}>
              <Input
                type="number"
                step={0.05}
                min={1}
                value={value}
                onChange={(e) =>
                  patchVehicle(key as keyof VehicleMultipliers, Number(e.target.value))
                }
              />
            </Field>
          ))}
        </Card>

        {/* Zones */}
        <Card title="Zone multipliers">
          {draft.zones.map((zone) => (
            <Field label={zone.label} key={zone.id}>
              <Input
                type="number"
                step={0.05}
                min={1}
                value={zone.multiplier}
                onChange={(e) =>
                  patch((d) => {
                    const z = d.zones.find((x) => x.id === zone.id);
                    if (z) z.multiplier = Number(e.target.value);
                  })
                }
              />
            </Field>
          ))}
        </Card>

        {/* Tiers */}
        <Card title="Service tiers">
          {draft.tiers.map((tier) => (
            <div key={tier.id} className="space-y-2 pb-3 border-b border-white/10 last:border-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tier.label}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Base">
                  <Input
                    type="number"
                    value={tier.baseFare}
                    onChange={(e) =>
                      patch((d) => {
                        const t = d.tiers.find((x) => x.id === tier.id);
                        if (t) t.baseFare = Number(e.target.value);
                      })
                    }
                  />
                </Field>
                <Field label="Per km">
                  <Input
                    type="number"
                    step={0.5}
                    value={tier.ratePerKm}
                    onChange={(e) =>
                      patch((d) => {
                        const t = d.tiers.find((x) => x.id === tier.id);
                        if (t) t.ratePerKm = Number(e.target.value);
                      })
                    }
                  />
                </Field>
                <Field label="Per min">
                  <Input
                    type="number"
                    step={0.5}
                    value={tier.ratePerMin}
                    onChange={(e) =>
                      patch((d) => {
                        const t = d.tiers.find((x) => x.id === tier.id);
                        if (t) t.ratePerMin = Number(e.target.value);
                      })
                    }
                  />
                </Field>
                <Field label="Service fee %">
                  <Input
                    type="number"
                    step={0.01}
                    value={tier.serviceFeeRate * 100}
                    onChange={(e) =>
                      patch((d) => {
                        const t = d.tiers.find((x) => x.id === tier.id);
                        if (t) t.serviceFeeRate = Number(e.target.value) / 100;
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Live sample */}
      {sample && (
        <Card title="Sample fare — 10 km / 20 min, NT Go">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              ["Base", sample.breakdown.baseFare],
              ["Distance", sample.breakdown.distanceFare],
              ["Time", sample.breakdown.timeFare],
              ["Demand", `×${sample.breakdown.demandMultiplier}`],
              ["Zone", `×${sample.breakdown.zoneMultiplier}`],
              ["Vehicle", `×${sample.breakdown.vehicleMultiplier}`],
            ].map(([labelText, value]) => (
              <div
                key={String(labelText)}
                className="flex justify-between border-b border-white/5 pb-1"
              >
                <span className="text-muted-foreground">{labelText}</span>
                <span className="tabular-nums">{value}</span>
              </div>
            ))}
            <div className="col-span-full pt-2 flex items-center justify-between text-base font-semibold">
              <span>Service fee</span>
              <span className="tabular-nums">{zar(sample.breakdown.serviceFee)}</span>
            </div>
            <div className="col-span-full flex items-center justify-between text-lg font-bold text-brand-light">
              <span>Total</span>
              <span className="tabular-nums">{zar(sample.breakdown.total)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label: text, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {text}
      </span>
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-foreground/[0.02] p-4 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function label(key: string): string {
  switch (key) {
    case "sedan":
      return "Sedan";
    case "suv":
      return "SUV";
    case "minivan":
      return "Minivan";
    case "minibus":
      return "Minibus";
    case "hatch":
      return "Hatchback";
    default:
      return key;
  }
}
