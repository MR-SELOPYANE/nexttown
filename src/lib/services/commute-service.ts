import type { CommuteDays, CommutePlan } from "../domain/types";
import { latency, loadJson, saveJson, storageKey, uid } from "./core";
import { WalletService } from "./wallet-service";

const key = (userId: string) => storageKey("data", userId, "commute-plans");

export type CommuteInput = {
  from: string;
  to: string;
  time: string;
  days: CommuteDays;
  weeklyCost: number;
  partners: number;
};

export const COMMUTE_DAYS_LABEL: Record<CommuteDays, string> = {
  weekdays: "Mon–Fri",
  "all-week": "Every day",
  weekends: "Sat–Sun",
  "mon-wed-fri": "Mon · Wed · Fri",
  "tue-thu": "Tue · Thu",
};

export const CommuteService = {
  async mine(userId: string): Promise<CommutePlan[]> {
    await latency(250);
    return loadJson<CommutePlan[]>(key(userId), []).sort((a, b) => b.createdAt - a.createdAt);
  },

  async create(userId: string, input: CommuteInput): Promise<CommutePlan> {
    await latency(500);
    const plan: CommutePlan = {
      id: uid(),
      userId,
      ...input,
      subscribed: false,
      createdAt: Date.now(),
    };
    saveJson(key(userId), [plan, ...loadJson<CommutePlan[]>(key(userId), [])]);
    return plan;
  },

  async remove(userId: string, id: string): Promise<void> {
    await latency(200);
    saveJson(
      key(userId),
      loadJson<CommutePlan[]>(key(userId), []).filter((p) => p.id !== id),
    );
  },

  /** BRS §19 — a monthly commute pass charged to the HITCH wallet. */
  async subscribe(userId: string, id: string): Promise<CommutePlan> {
    await latency(600);
    const all = loadJson<CommutePlan[]>(key(userId), []);
    const plan = all.find((p) => p.id === id);
    if (!plan) throw new Error("Commute plan not found.");
    const monthly = Math.round(plan.weeklyCost * 4.3);
    await WalletService.pay(userId, monthly, `Commute pass · ${plan.from} → ${plan.to}`);
    const updated = { ...plan, subscribed: true };
    saveJson(
      key(userId),
      all.map((p) => (p.id === id ? updated : p)),
    );
    return updated;
  },

  async unsubscribe(userId: string, id: string): Promise<CommutePlan> {
    await latency(250);
    const all = loadJson<CommutePlan[]>(key(userId), []);
    const updated = all.map((p) => (p.id === id ? { ...p, subscribed: false } : p));
    saveJson(key(userId), updated);
    return updated.find((p) => p.id === id) as CommutePlan;
  },
};
