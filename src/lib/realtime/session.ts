import { getSupabase, getSupabaseSession, isSupabaseConfigured } from "@/lib/api/supabase";

/**
 * DEMO SUPABASE AUTH SESSION
 * ------------------------------------------------------------------
 * The driver-location RLS policies authorise writes with `auth.uid()`, so the
 * driver console needs a real Supabase Auth session. The app's UI login
 * (AuthService) is localStorage-based and untouched; this module bridges that
 * gap for development/demo by provisioning a dedicated demo driver account.
 *
 * SECURITY
 * - Uses the publishable/anon key only. Never the service-role key.
 * - The demo account has an org-known password and is scoped exactly like any
 *   other driver by RLS — it cannot read or write anyone else's location.
 * - Disable auto-provisioning with `VITE_SUPABASE_DEMO_AUTH=false`; production
 *   replaces this file with the real Supabase Auth sign-in flow.
 */

const DEMO_DRIVER_EMAIL = "driver-demo@hitchsa.local";
const DEMO_DRIVER_PASSWORD = "HitchSA-Demo-2026!";

export const DEMO_DRIVER = {
  name: "Sipho M.",
  car: "VW Polo · Silver",
  plate: "JH 42 KL GP",
  phone: "+27100000008",
  rating: 4.97,
  trips: 2821,
};

function demoAuthEnabled(): boolean {
  if (typeof import.meta === "undefined") return false;
  const env = import.meta.env as Record<string, string | undefined> | undefined;
  return env?.["VITE_SUPABASE_DEMO_AUTH"] !== "false";
}

export type DriverSessionState = {
  /** True when a Supabase Auth session exists for the demo driver. */
  ok: boolean;
  /** The Supabase user id (`auth.uid()`) — the RLS identity. */
  userId: string | null;
  reason: "ok" | "unconfigured" | "demo_disabled" | "error" | "loading";
  message?: string;
};

/**
 * Ensures the driver console is signed in to Supabase Auth (demo account).
 * Safe to call repeatedly; resolves immediately when a session exists.
 */
export async function ensureDriverSession(): Promise<DriverSessionState> {
  const client = getSupabase();
  if (!client || !isSupabaseConfigured()) {
    return { ok: false, userId: null, reason: "unconfigured" };
  }
  if (!demoAuthEnabled()) {
    return { ok: false, userId: null, reason: "demo_disabled" };
  }

  const existing = await getSupabaseSession();
  if (existing?.user) {
    return { ok: true, userId: existing.user.id, reason: "ok" };
  }

  // Try to sign in to the demo account; if it has not been provisioned yet,
  // create it, then sign in. (Clear-labelled demo only — see module header.)
  const signIn = await client.auth.signInWithPassword({
    email: DEMO_DRIVER_EMAIL,
    password: DEMO_DRIVER_PASSWORD,
  });
  if (signIn.data.session) {
    return { ok: true, userId: signIn.data.session.user.id, reason: "ok" };
  }

  const provision = await client.auth.signUp({
    email: DEMO_DRIVER_EMAIL,
    password: DEMO_DRIVER_PASSWORD,
  });
  if (provision.error) {
    return {
      ok: false,
      userId: null,
      reason: "error",
      message: provision.error.message,
    };
  }

  const signInRetry = await client.auth.signInWithPassword({
    email: DEMO_DRIVER_EMAIL,
    password: DEMO_DRIVER_PASSWORD,
  });
  if (signInRetry.data.session) {
    return { ok: true, userId: signInRetry.data.session.user.id, reason: "ok" };
  }
  return {
    ok: false,
    userId: null,
    reason: "error",
    message: signInRetry.error?.message ?? "Could not start demo driver session.",
  };
}
