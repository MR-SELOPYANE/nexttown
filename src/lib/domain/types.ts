import type { FareBreakdown, FareQuote } from "../pricing/types";

export type Role = "traveler" | "driver" | "trucker" | "airline" | "school" | "business" | "admin";
export type MarketType = "ride" | "parcel" | "freight" | "flight" | "school";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type DocKind = "id" | "address" | "selfie" | "licence" | "vehicle";

export type KycDoc = {
  id: string;
  name: string;
  kind: DocKind;
  uploaded: boolean;
};

export type Kyc = {
  identityStatus: VerificationStatus;
  faceStatus: VerificationStatus;
  phoneStatus: VerificationStatus;
  driverStatus: VerificationStatus;
  vehicleStatus: VerificationStatus;
  idType: "sa-id" | "passport";
  idNumber: string;
  licenceNumber: string;
  documents: KycDoc[];
};

export type Preferences = {
  push: boolean;
  sms: boolean;
  email: boolean;
  marketing: boolean;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  status: "active" | "suspended";
  passwordHash: string;
  twoFactorEnabled: boolean;
  kyc: Kyc;
  emergencyContact: string;
  emergencyNumber: string;
  preferences: Preferences;
  createdAt: number;
};

export type SessionUser = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "role"
  | "status"
  | "twoFactorEnabled"
  | "kyc"
  | "emergencyContact"
  | "emergencyNumber"
  | "preferences"
  | "createdAt"
>;

export type BookingStatus = "requested" | "confirmed" | "in_transit" | "completed" | "cancelled";

export type PaymentState = "none" | "processing" | "held" | "paid" | "refunded";

/** BRS §22 — four-category review with an optional written comment. */
export type BookingReview = {
  safety: number;
  punctuality: number;
  cleanliness: number;
  communication: number;
  comment?: string;
};

export type Booking = {
  id: string;
  ref: string;
  userId: string;
  listingId: string;
  type: MarketType;
  title: string;
  route: string;
  from: string;
  to: string;
  price: number;
  /** Signed, expiring quote the price was charged against (dynamic pricing). */
  fareQuote?: FareQuote;
  /** Human-readable breakdown captured at booking time. */
  fareBreakdown?: FareBreakdown;
  quantity: number;
  status: BookingStatus;
  payment: PaymentState;
  paidFromWallet: boolean;
  createdAt: number;
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  completedAt?: number;
  note?: string;
  rating?: number;
  review?: BookingReview;
  /** OTP code for parcel proof-of-delivery (BRS §14). */
  podCode?: string;
  /** Free-text parcel description/photos for couriers to verify (BRS §14). */
  parcelDetails?: string;
};

export type ListingStatus = "live" | "paused" | "archived";

export type Listing = {
  id: string;
  ownerId: string;
  type: MarketType;
  title: string;
  from: string;
  to: string;
  when: string;
  price: number;
  capacity: string;
  seats: number;
  meta: string[];
  rating: number;
  tags: string[];
  status: ListingStatus;
  createdAt: number;
};

export type TxnKind = "topup" | "payment" | "escrow_hold" | "escrow_release" | "refund" | "payout";

export type TxnStatus = "pending" | "completed" | "failed";

export type PaymentMethod = "wallet" | "card" | "payfast" | "ozow";

export type Txn = {
  id: string;
  userId: string;
  kind: TxnKind;
  label: string;
  amount: number;
  method: PaymentMethod;
  status: TxnStatus;
  ref?: string;
  createdAt: number;
};

export type NotificationKind = "trip" | "payment" | "safety" | "system";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: number;
};

export type SosLog = {
  id: string;
  userId: string;
  at: number;
  where: string;
};

export type SupportTicket = {
  id: string;
  userId?: string;
  topic: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: number;
};

export type Review = {
  id: string;
  bookingId: string;
  userId: string;
  targetLabel: string;
  safety: number;
  punctuality: number;
  cleanliness: number;
  communication: number;
  comment: string;
  createdAt: number;
};

export type Wallet = {
  userId: string;
  balance: number;
  currency: "ZAR";
};

export type PayoutAccount = {
  id: string;
  userId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  verified: boolean;
};

/** BRS §12 — saved favourite destination for one-tap quick search. */
export type FavouriteDestination = {
  id: string;
  userId: string;
  label: string;
  from: string;
  to: string;
  createdAt: number;
};

export type CommuteDays = "weekdays" | "all-week" | "weekends" | "mon-wed-fri" | "tue-thu";

/** BRS §17 — a recurring commuter plan with cost sharing and a subscription. */
export type CommutePlan = {
  id: string;
  userId: string;
  from: string;
  to: string;
  time: string;
  days: CommuteDays;
  weeklyCost: number;
  partners: number;
  subscribed: boolean;
  createdAt: number;
};
