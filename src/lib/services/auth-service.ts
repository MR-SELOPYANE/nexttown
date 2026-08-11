import { DEMO_ACCOUNTS } from "../domain/seed";
import type { Kyc, Role, SessionUser, User } from "../domain/types";
import { latency, loadJson, removeKey, saveJson, storageKey, uid } from "./core";

const USERS_KEY = storageKey("db", "users");
const SESSION_KEY = storageKey("session");

async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = (hash * 33) ^ text.charCodeAt(i);
  return `fallback-${(hash >>> 0).toString(16)}`;
}

export function publicUser(u: User): SessionUser {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    twoFactorEnabled: u.twoFactorEnabled,
    kyc: u.kyc,
    emergencyContact: u.emergencyContact,
    emergencyNumber: u.emergencyNumber,
    preferences: u.preferences,
    createdAt: u.createdAt,
  };
}

function readUsers(): User[] {
  return loadJson<User[]>(USERS_KEY, []);
}

function writeUsers(users: User[]): void {
  saveJson(USERS_KEY, users);
}

function makeKyc(idType: "sa-id" | "passport"): Kyc {
  return {
    identityStatus: "unverified",
    faceStatus: "unverified",
    phoneStatus: "unverified",
    driverStatus: "unverified",
    vehicleStatus: "unverified",
    idType,
    idNumber: "",
    licenceNumber: "",
    documents: [
      { id: "doc-id", name: "SA ID / Passport", kind: "id", uploaded: false },
      { id: "doc-selfie", name: "Selfie liveness check", kind: "selfie", uploaded: false },
      { id: "doc-address", name: "Proof of address", kind: "address", uploaded: false },
      { id: "doc-licence", name: "Driver's licence", kind: "licence", uploaded: false },
      {
        id: "doc-vehicle",
        name: "Vehicle registration & photos",
        kind: "vehicle",
        uploaded: false,
      },
    ],
  };
}

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  idType: "sa-id" | "passport";
  idNumber: string;
};

export const AuthService = {
  async register(input: RegisterInput): Promise<SessionUser> {
    await latency(500);
    const users = readUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
      throw new Error("An account with this email already exists. Try signing in.");
    }
    if (users.some((u) => u.phone === input.phone.trim())) {
      throw new Error("This mobile number is already registered.");
    }
    const passwordHash = await sha256(`hitch-sa::${input.email.toLowerCase()}::${input.password}`);
    const user: User = {
      id: uid(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      phone: input.phone.trim(),
      role: input.role,
      status: "active",
      passwordHash,
      twoFactorEnabled: false,
      kyc: {
        ...makeKyc(input.idType),
        idNumber: input.idNumber.trim(),
        identityStatus: "pending",
        phoneStatus: "pending",
      },
      emergencyContact: "",
      emergencyNumber: "",
      preferences: { push: true, sms: true, email: true, marketing: false },
      createdAt: Date.now(),
    };
    writeUsers([...users, user]);
    saveJson(SESSION_KEY, publicUser(user));
    return publicUser(user);
  },

  async login(email: string, password: string): Promise<SessionUser> {
    await latency(450);
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized);
    if (!user) throw new Error("No account found for that email address.");
    if (user.status === "suspended") {
      throw new Error("This account has been suspended. Contact support for assistance.");
    }
    const hash = await sha256(`hitch-sa::${normalized}::${password}`);
    if (hash !== user.passwordHash) {
      throw new Error("Incorrect password. Please try again.");
    }
    saveJson(SESSION_KEY, publicUser(user));
    return publicUser(user);
  },

  async currentSession(): Promise<SessionUser | null> {
    const raw = loadJson<SessionUser | null>(SESSION_KEY, null);
    if (!raw) return null;
    const users = readUsers();
    const live = users.find((u) => u.id === raw.id);
    return live ? publicUser(live) : null;
  },

  async refreshSession(): Promise<SessionUser | null> {
    await latency(80);
    return this.currentSession();
  },

  async logout(): Promise<void> {
    removeKey(SESSION_KEY);
  },

  async requestOtp(email: string): Promise<string> {
    await latency(400);
    const users = readUsers();
    if (!users.some((u) => u.email === email.trim().toLowerCase())) {
      throw new Error("No account found for that email address.");
    }
    return "482913";
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await latency(500);
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    const idx = users.findIndex((u) => u.email === normalized);
    if (idx === -1) throw new Error("No account found for that email address.");
    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      passwordHash: await sha256(`hitch-sa::${normalized}::${newPassword}`),
    };
    writeUsers(updated);
  },

  async updateUser(updates: Partial<User> & { id: string }): Promise<SessionUser> {
    await latency(250);
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === updates.id);
    if (idx === -1) throw new Error("Account not found.");
    const merged: User = { ...users[idx], ...updates, id: users[idx].id };
    const next = [...users];
    next[idx] = merged;
    writeUsers(next);
    saveJson(SESSION_KEY, publicUser(merged));
    return publicUser(merged);
  },

  async allUsers(): Promise<SessionUser[]> {
    await latency(300);
    return readUsers().map(publicUser);
  },

  /**
   * Simulated verification steps per the BRS: ID check, phone OTP, selfie
   * liveness. Marks the relevant KYC status verified on the live user.
   */
  async verifyStep(
    userId: string,
    step: "identity" | "phone" | "face",
    code?: string,
  ): Promise<SessionUser> {
    await latency(700);
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("Account not found.");

    if (step === "phone" && code !== "482913") {
      throw new Error("That OTP is incorrect. Use 482913 for this demo.");
    }

    const user = users[idx];
    const kyc = { ...user.kyc };
    if (step === "identity") kyc.identityStatus = "verified";
    if (step === "phone") kyc.phoneStatus = "verified";
    if (step === "face") kyc.faceStatus = "verified";

    const merged: User = { ...user, kyc };
    const next = [...users];
    next[idx] = merged;
    writeUsers(next);
    saveJson(SESSION_KEY, publicUser(merged));
    return publicUser(merged);
  },

  /** Seeded accounts so reviewers can sign in instantly. Runs on first boot. */  async ensureDemoAccounts(): Promise<void> {
    const users = readUsers();
    if (users.length > 0) return;
    const created: User[] = await Promise.all(
      DEMO_ACCOUNTS.map(async (d) => {
        const passwordHash = await sha256(`hitch-sa::${d.email}::${d.password}`);
        return {
          id: uid(),
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          phone: d.phone,
          role: d.role,
          status: "active" as const,
          passwordHash,
          twoFactorEnabled: false,
          kyc: {
            ...makeKyc("sa-id"),
            idNumber: "9202205084083",
            identityStatus: "verified" as const,
            faceStatus: "verified" as const,
            phoneStatus: "verified" as const,
            driverStatus: "verified" as const,
            vehicleStatus: "verified" as const,
          },
          emergencyContact: "",
          emergencyNumber: "",
          preferences: { push: true, sms: true, email: true, marketing: false },
          createdAt: Date.now(),
        };
      }),
    );
    writeUsers(created);
  },

  /** Admin approval of driver or vehicle verification (BRS §23). */
  async approveDoc(
    userId: string,
    kind: "driver" | "vehicle",
    decision: "approved" | "rejected",
  ): Promise<SessionUser> {
    await latency(400);
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("Account not found.");
    const user = users[idx];
    const kyc = { ...user.kyc };
    if (kind === "driver") kyc.driverStatus = decision === "approved" ? "verified" : "rejected";
    if (kind === "vehicle") kyc.vehicleStatus = decision === "approved" ? "verified" : "rejected";
    const merged: User = { ...user, kyc };
    const next = [...users];
    next[idx] = merged;
    writeUsers(next);
    saveJson(SESSION_KEY, publicUser(merged));
    return publicUser(merged);
  },

  /** Admin suspension or reactivation of a member (BRS §23). */
  async setUserStatus(
    userId: string,
    status: "active" | "suspended",
  ): Promise<SessionUser> {
    await latency(350);
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("Account not found.");
    const merged: User = { ...users[idx], status };
    const next = [...users];
    next[idx] = merged;
    writeUsers(next);
    return publicUser(merged);
  },
};
