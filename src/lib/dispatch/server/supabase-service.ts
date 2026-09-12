import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY SUPABASE CLIENT (service-role)
 * --------------------------------------------------------------------------
 * The dispatch layer is server-authoritative: only these functions may touch
 * `ride_dispatch` writes or reserve drivers. The service-role key bypasses
 * Row Level Security, so it is read from SERVER env vars only and must never
 * be VITE_-prefixed (which ships to the browser).
 *
 * Degrades to "unconfigured" when the key is absent — the app and its tests
 * keep working without a real project; server functions answer a structured
 * `{ ok: false, code: "unconfigured" }` result in that case.
 *
 * This module lives under a `server/` directory, so the vite
 * `importProtection` glob rule keeps it out of client bundles entirely.
 */

const readEnv = (name: string): string => process.env[name] ?? "";

const SUPABASE_URL = readEnv("SUPABASE_URL") || readEnv("VITE_SUPABASE_URL");
const SERVICE_ROLE_KEY = readEnv("SUPABASE_SERVICE_ROLE_KEY");

let cachedClient: SupabaseClient | null | undefined;

export function isServiceConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

export function getServiceClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  if (!isServiceConfigured()) {
    cachedClient = null;
    return cachedClient;
  }
  cachedClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      // The service client has no user session; RLS is bypassed by the key.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}
