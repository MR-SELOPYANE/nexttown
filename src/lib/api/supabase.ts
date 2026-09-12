import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js";

/**
 * SUPABASE CLIENT (Phase 1 - Infrastructure)
 * ------------------------------------------------------------------
 * Provides a single, SSR-safe Supabase client for the existing frontend.
 *
 * PRESERVATION NOTES
 * - This file ADDS real infrastructure plumbing. It does NOT modify any
 *   existing component, route, service, or the demo store. The protected
 *   UI shell is untouched.
 * - The client is created only in the browser build (import.meta.env is
 *   injected by Vite). During SSR there is no env, so `getSupabase()`
 *   returns `null` and existing server-render paths behave exactly as
 *   before.
 * - The publishable key (`sb_publishable_...`) is safe to ship to the
 *   browser; it cannot bypass Row Level Security. Server-only secrets are
 *   never referenced here.
 *
 * AUTH SESSION
 * - Sessions are persisted + auto-refreshed so `auth.uid()` is available to
 *   RLS after a reload (required by the driver-location feature). This does
 *   not change how the app's demo login (AuthService) works — that layer is
 *   untouched; Supabase Auth is the *identity* behind driver-location rows.
 * - Never import server-only secrets here. A VITE_ prefix ships to the
 *   browser and must only ever be a publishable/anon key.
 */

function readEnv(name: string): string {
  const env = import.meta.env as Record<string, string | undefined> | undefined;
  return env?.[name] ?? "";
}

const SUPABASE_URL = readEnv("VITE_SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

let cachedClient: SupabaseClient | null | undefined;

/** True when a browser-bundled VITE env with a Supabase project is present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

/**
 * Returns a shared Supabase client, or `null` when not configured / during SSR.
 * All client operations are RLS-gated via the publishable/anon key.
 */
export function getSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  if (!isSupabaseConfigured()) {
    cachedClient = null;
    return cachedClient;
  }
  cachedClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      // RLS uses auth.uid(); sessions must survive reloads and be kept fresh.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cachedClient;
}

/** The authenticated Supabase user (`auth.uid()` for RLS), or null. */
export async function getSupabaseAuthUser(): Promise<User | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser();
    return error ? null : data.user;
  } catch {
    return null;
  }
}

/**
 * Current Supabase Auth session, if any. Resolves to `null` when Supabase is
 * not configured, during SSR, or when nobody is signed in. Never throws.
 */
export async function getSupabaseSession(): Promise<Session | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getSession();
    if (error) return null;
    return data.session;
  } catch {
    return null;
  }
}

export type SupabaseHealth = {
  ok: boolean;
  configured: boolean;
  error?: string;
};

/**
 * Health check used for Phase 1 infrastructure verification. Never throws.
 * Existing app code does not call this.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const client = getSupabase();
  if (!client) {
    return { ok: false, configured: false, error: "Supabase not configured (missing env)" };
  }
  try {
    const { error } = await client.from("_health_check").select("id").limit(1);
    if (error && error.code === "PGRST116") {
      // Table does not exist yet; the connection itself is fine.
      return { ok: true, configured: true };
    }
    if (error) {
      return { ok: false, configured: true, error: error.message };
    }
    return { ok: true, configured: true };
  } catch (e) {
    return {
      ok: false,
      configured: true,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
