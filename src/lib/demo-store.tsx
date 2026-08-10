import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MarketType = "ride" | "parcel" | "freight" | "flight" | "school";

export type Booking = {
  id: string;
  ref: string;
  type: MarketType;
  title: string;
  route: string;
  price: number;
  status: "confirmed" | "in-transit" | "completed" | "cancelled";
  createdAt: number;
  note?: string;
  rating?: number;
  paidWithWallet?: boolean;
};

export type Posting = {
  id: string;
  type: MarketType;
  title: string;
  route: string;
  price: number;
  capacity: string;
  status: "live" | "paused";
  createdAt: number;
};

export type DemoUser = {
  name: string;
  email: string;
  role: "traveler" | "driver" | "trucker" | "parcel" | "airline" | "school";
};

export type Txn = {
  id: string;
  label: string;
  amount: number; // positive = credit, negative = debit
  method: "PayFast" | "Ozow" | "Card" | "Wallet" | "Payout";
  createdAt: number;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  kind: "trip" | "payment" | "safety" | "system";
  read: boolean;
  createdAt: number;
};

export type Kyc = {
  status: "unverified" | "pending" | "verified";
  idNumber: string;
  phone: string;
  licence: string;
  documents: { name: string; uploaded: boolean }[];
};

type State = {
  user: DemoUser | null;
  bookings: Booking[];
  postings: Posting[];
  balance: number;
  txns: Txn[];
  notifications: Notification[];
  kyc: Kyc;
  emergencyContact: string;
  sosLog: { id: string; at: number; where: string }[];
};

const KEY = "hitch-demo-state";

const SEED_POSTINGS: Posting[] = [
  {
    id: "p-seed-1",
    type: "ride",
    title: "Sandton → OR Tambo",
    route: "Departs 06:15 · Mon–Fri",
    price: 189,
    capacity: "Sedan · 3 seats",
    status: "live",
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: "p-seed-2",
    type: "parcel",
    title: "Johannesburg → Pretoria",
    route: "Leaving 09:30 daily",
    price: 65,
    capacity: "Up to 5 kg",
    status: "live",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "p-seed-3",
    type: "freight",
    title: "Durban → Johannesburg",
    route: "Return-load · 21 Jul",
    price: 12400,
    capacity: "Tautliner · 34 t",
    status: "live",
    createdAt: Date.now() - 86400000 * 2,
  },
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: "b-seed-1",
    ref: "HS-4821",
    type: "ride",
    title: "Rosebank → Lanseria",
    route: "Yesterday 14:20",
    price: 260,
    status: "completed",
    createdAt: Date.now() - 86400000,
    rating: 5,
  },
  {
    id: "b-seed-2",
    ref: "HS-4907",
    type: "parcel",
    title: "Sandton → Rosebank",
    route: "Docs · < 2 kg",
    price: 45,
    status: "in-transit",
    createdAt: Date.now() - 3600000 * 5,
  },
];

const SEED_TXNS: Txn[] = [
  {
    id: "t-seed-1",
    label: "Wallet top-up",
    amount: 500,
    method: "Ozow",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "t-seed-2",
    label: "Rosebank → Lanseria",
    amount: -260,
    method: "Wallet",
    createdAt: Date.now() - 86400000,
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n-seed-1",
    title: "Parcel HS-4907 picked up",
    body: "Your courier is en route to Rosebank. Track live from your dashboard.",
    kind: "trip",
    read: false,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: "n-seed-2",
    title: "Wallet top-up successful",
    body: "R 500 added via Ozow instant EFT.",
    kind: "payment",
    read: true,
    createdAt: Date.now() - 86400000 * 3,
  },
];

const EMPTY: State = {
  user: null,
  bookings: SEED_BOOKINGS,
  postings: SEED_POSTINGS,
  balance: 240,
  txns: SEED_TXNS,
  notifications: SEED_NOTIFICATIONS,
  kyc: {
    status: "unverified",
    idNumber: "",
    phone: "",
    licence: "",
    documents: [
      { name: "SA ID / Passport", uploaded: false },
      { name: "Proof of address", uploaded: false },
      { name: "Selfie liveness check", uploaded: false },
    ],
  },
  emergencyContact: "",
  sosLog: [],
};

type Ctx = State & {
  signIn: (user: DemoUser) => void;
  signOut: () => void;
  addBooking: (b: Omit<Booking, "id" | "ref" | "createdAt" | "status">) => Booking;
  advanceBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, rating: number) => void;
  addPosting: (p: Omit<Posting, "id" | "createdAt" | "status">) => Posting;
  togglePosting: (id: string) => void;
  removePosting: (id: string) => void;
  topUp: (amount: number, method: Txn["method"]) => void;
  payFromWallet: (amount: number, label: string) => boolean;
  withdraw: (amount: number) => boolean;
  notify: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  submitKyc: (k: Partial<Kyc>) => void;
  uploadKycDoc: (name: string) => void;
  setEmergencyContact: (v: string) => void;
  triggerSos: (where: string) => void;
  reset: () => void;
};

const DemoContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 9);
const makeRef = () => `HS-${Math.floor(1000 + Math.random() * 8999)}`;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const pushNote = (s: State, n: Omit<Notification, "id" | "createdAt" | "read">): State => ({
    ...s,
    notifications: [
      { ...n, id: uid(), read: false, createdAt: Date.now() },
      ...s.notifications,
    ].slice(0, 40),
  });

  const signIn = useCallback((user: DemoUser) => setState((s) => ({ ...s, user })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const addBooking: Ctx["addBooking"] = useCallback((b) => {
    const booking: Booking = {
      ...b,
      id: uid(),
      ref: makeRef(),
      status: "confirmed",
      createdAt: Date.now(),
    };
    setState((s) =>
      pushNote({ ...s, bookings: [booking, ...s.bookings] }, {
        title: `Booking ${booking.ref} confirmed`,
        body: `${booking.title} · ${booking.route}`,
        kind: "trip",
      }),
    );
    return booking;
  }, []);

  const advanceBooking = useCallback((id: string) => {
    const next = { confirmed: "in-transit", "in-transit": "completed" } as const;
    setState((s) => {
      const target = s.bookings.find((b) => b.id === id);
      const updated = {
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === id && (b.status === "confirmed" || b.status === "in-transit")
            ? { ...b, status: next[b.status] }
            : b,
        ),
      };
      if (!target || (target.status !== "confirmed" && target.status !== "in-transit"))
        return updated;
      return pushNote(updated, {
        title: `${target.ref} ${next[target.status] === "in-transit" ? "in transit" : "completed"}`,
        body: target.title,
        kind: "trip",
      });
    });
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    }));
  }, []);

  const rateBooking = useCallback((id: string, rating: number) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, rating } : b)),
    }));
  }, []);

  const addPosting: Ctx["addPosting"] = useCallback((p) => {
    const posting: Posting = { ...p, id: uid(), status: "live", createdAt: Date.now() };
    setState((s) =>
      pushNote({ ...s, postings: [posting, ...s.postings] }, {
        title: "Listing published",
        body: `${posting.title} is live on the marketplace.`,
        kind: "system",
      }),
    );
    return posting;
  }, []);

  const togglePosting = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      postings: s.postings.map((p) =>
        p.id === id ? { ...p, status: p.status === "live" ? "paused" : "live" } : p,
      ),
    }));
  }, []);

  const removePosting = useCallback((id: string) => {
    setState((s) => ({ ...s, postings: s.postings.filter((p) => p.id !== id) }));
  }, []);

  const topUp = useCallback((amount: number, method: Txn["method"]) => {
    setState((s) =>
      pushNote(
        {
          ...s,
          balance: s.balance + amount,
          txns: [
            { id: uid(), label: "Wallet top-up", amount, method, createdAt: Date.now() },
            ...s.txns,
          ],
        },
        { title: "Wallet top-up successful", body: `R ${amount} added via ${method}.`, kind: "payment" },
      ),
    );
  }, []);

  const payFromWallet = useCallback((amount: number, label: string) => {
    let ok = false;
    setState((s) => {
      if (s.balance < amount) return s;
      ok = true;
      return {
        ...s,
        balance: s.balance - amount,
        txns: [
          { id: uid(), label, amount: -amount, method: "Wallet", createdAt: Date.now() },
          ...s.txns,
        ],
      };
    });
    return ok;
  }, []);

  const withdraw = useCallback((amount: number) => {
    let ok = false;
    setState((s) => {
      if (s.balance < amount) return s;
      ok = true;
      return {
        ...s,
        balance: s.balance - amount,
        txns: [
          {
            id: uid(),
            label: "Payout to bank account",
            amount: -amount,
            method: "Payout",
            createdAt: Date.now(),
          },
          ...s.txns,
        ],
      };
    });
    return ok;
  }, []);

  const notify: Ctx["notify"] = useCallback((n) => setState((s) => pushNote(s, n)), []);

  const markAllRead = useCallback(
    () =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),
    [],
  );

  const clearNotifications = useCallback(
    () => setState((s) => ({ ...s, notifications: [] })),
    [],
  );

  const submitKyc = useCallback((k: Partial<Kyc>) => {
    setState((s) =>
      pushNote(
        { ...s, kyc: { ...s.kyc, ...k, status: "pending" } },
        {
          title: "Verification submitted",
          body: "Our compliance team reviews most profiles within 4 hours.",
          kind: "system",
        },
      ),
    );
    setTimeout(() => {
      setState((s) => (s.kyc.status === "pending" ? { ...s, kyc: { ...s.kyc, status: "verified" } } : s));
    }, 4000);
  }, []);

  const uploadKycDoc = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      kyc: {
        ...s.kyc,
        documents: s.kyc.documents.map((d) => (d.name === name ? { ...d, uploaded: true } : d)),
      },
    }));
  }, []);

  const setEmergencyContact = useCallback(
    (v: string) => setState((s) => ({ ...s, emergencyContact: v })),
    [],
  );

  const triggerSos = useCallback((where: string) => {
    setState((s) =>
      pushNote(
        { ...s, sosLog: [{ id: uid(), at: Date.now(), where }, ...s.sosLog] },
        {
          title: "SOS dispatched",
          body: `Live location shared with the HITCH SA safety desk and your emergency contact.`,
          kind: "safety",
        },
      ),
    );
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      addBooking,
      advanceBooking,
      cancelBooking,
      rateBooking,
      addPosting,
      togglePosting,
      removePosting,
      topUp,
      payFromWallet,
      withdraw,
      notify,
      markAllRead,
      clearNotifications,
      submitKyc,
      uploadKycDoc,
      setEmergencyContact,
      triggerSos,
      reset,
    }),
    [
      state,
      signIn,
      signOut,
      addBooking,
      advanceBooking,
      cancelBooking,
      rateBooking,
      addPosting,
      togglePosting,
      removePosting,
      topUp,
      payFromWallet,
      withdraw,
      notify,
      markAllRead,
      clearNotifications,
      submitKyc,
      uploadKycDoc,
      setEmergencyContact,
      triggerSos,
      reset,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}

export const zar = (n: number) =>
  `R ${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
