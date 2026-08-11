import type { PaymentMethod, Txn, TxnKind, TxnStatus, Wallet } from "../domain/types";
import { latency, loadJson, makeRef, saveJson, storageKey, uid } from "./core";

const txnsKey = (userId: string) => storageKey("data", userId, "txns");
const walletKey = (userId: string) => storageKey("data", userId, "wallet");

function readWallet(userId: string): Wallet {
  return loadJson<Wallet>(walletKey(userId), { userId, balance: 250, currency: "ZAR" });
}

function readTxns(userId: string): Txn[] {
  return loadJson<Txn[]>(txnsKey(userId), []);
}

function writeTxns(userId: string, txns: Txn[]): void {
  saveJson(txnsKey(userId), txns);
}

function pushTxn(
  userId: string,
  kind: TxnKind,
  label: string,
  amount: number,
  method: PaymentMethod,
  status: TxnStatus,
  ref?: string,
): Txn {
  const txn: Txn = {
    id: uid(),
    userId,
    kind,
    label,
    amount,
    method,
    status,
    ref,
    createdAt: Date.now(),
  };
  writeTxns(userId, [txn, ...readTxns(userId)]);
  return txn;
}

export const WalletService = {
  async get(userId: string): Promise<Wallet> {
    await latency(200);
    return readWallet(userId);
  },

  async topUp(userId: string, amount: number, method: "payfast" | "ozow" | "card"): Promise<Txn> {
    await latency(600);
    const txn = pushTxn(userId, "topup", `Wallet top-up via ${method}`, amount, method, "pending");
    setTimeout(() => {
      const all = readTxns(userId);
      const updated = all.map((t) =>
        t.id === txn.id ? { ...t, status: "completed" as TxnStatus } : t,
      );
      writeTxns(userId, updated);
      const wallet = readWallet(userId);
      saveJson(walletKey(userId), { ...wallet, balance: wallet.balance + amount });
    }, 900);
    return txn;
  },

  /** Holds funds in escrow when a booking is created. */
  async hold(userId: string, amount: number, ref: string, fromWallet: boolean): Promise<Txn> {
    await latency(400);
    if (fromWallet) {
      const wallet = readWallet(userId);
      if (wallet.balance < amount) {
        throw new Error("Wallet balance is too low for this booking. Top up first.");
      }
      saveJson(walletKey(userId), { ...wallet, balance: wallet.balance - amount });
      return pushTxn(
        userId,
        "escrow_hold",
        `Escrow hold · ${ref}`,
        -amount,
        "wallet",
        "completed",
        ref,
      );
    }
    return pushTxn(userId, "escrow_hold", `Card hold · ${ref}`, -amount, "card", "pending", ref);
  },

  /** Releases escrow to the operator once a trip completes. */
  async release(userId: string, ref: string, amount: number): Promise<void> {
    await latency(250);
    const all = readTxns(userId);
    writeTxns(
      userId,
      all.map((t) => (t.ref === ref ? { ...t, status: "completed" as TxnStatus } : t)),
    );
    pushTxn(userId, "escrow_release", `Settled · ${ref}`, -amount, "wallet", "completed", ref);
  },

  async refund(userId: string, ref: string, amount: number): Promise<void> {
    await latency(400);
    const wallet = readWallet(userId);
    saveJson(walletKey(userId), { ...wallet, balance: wallet.balance + amount });
    const all = readTxns(userId);
    writeTxns(
      userId,
      all.map((t) => (t.ref === ref ? { ...t, status: "completed" as TxnStatus } : t)),
    );
    pushTxn(userId, "refund", `Refund · ${ref}`, amount, "wallet", "completed", ref);
  },

  async creditPayout(userId: string, label: string, gross: number): Promise<void> {
    await latency(250);
    const net = Math.round(gross * 0.88);
    const wallet = readWallet(userId);
    saveJson(walletKey(userId), { ...wallet, balance: wallet.balance + net });
    pushTxn(userId, "payout", `${label} · payout`, net, "wallet", "completed");
  },

  /** Direct wallet payment (e.g. commuter passes / subscriptions). */
  async pay(userId: string, amount: number, label: string): Promise<Txn> {
    await latency(400);
    const wallet = readWallet(userId);
    if (wallet.balance < amount) {
      throw new Error("Insufficient wallet balance. Top up first.");
    }
    saveJson(walletKey(userId), { ...wallet, balance: wallet.balance - amount });
    return pushTxn(userId, "payment", label, -amount, "wallet", "completed");
  },

  async withdraw(userId: string, amount: number): Promise<Txn> {
    await latency(500);
    const wallet = readWallet(userId);
    if (amount <= 0) throw new Error("Enter an amount to withdraw.");
    if (wallet.balance < amount) {
      throw new Error("Insufficient balance for that payout.");
    }
    saveJson(walletKey(userId), { ...wallet, balance: wallet.balance - amount });
    return pushTxn(
      userId,
      "payout",
      `Payout to bank · ${makeRef("PAY")}`,
      -amount,
      "wallet",
      "pending",
    );
  },

  async txns(userId: string): Promise<Txn[]> {
    await latency(250);
    return readTxns(userId);
  },
};
