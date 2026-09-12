/**
 * API CLIENT (Phase 1 - Infrastructure)
 * ------------------------------------------------------------------
 * Thin, SSR-safe HTTP client intended to be the single transport used by the
 * existing data services (src/lib/services/*) when they are migrated to the
 * real backend in later phases.
 *
 * PRESERVATION NOTES
 * - No existing component, route or service calls this yet. It is additive
 *   scaffolding. The protected UI shell is untouched.
 * - `toString`-safe / `window`-safe: guards every browser-only access so
 *   server-render paths behave exactly as before.
 * - Cookie-friendly: fetch uses `credentials: "include"` so an HttpOnly
 *   auth cookie (added in Phase 3) is sent automatically.
 */

export type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
};

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const DEFAULT_BASE = "/api/v1";

function readBaseUrl(): string {
  if (typeof import.meta === "undefined") return DEFAULT_BASE;
  const anyImport = import.meta as unknown as { env?: Record<string, string | undefined> };
  return anyImport.env?.VITE_API_BASE_URL ?? DEFAULT_BASE;
}

export const API_BASE_URL = readBaseUrl();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof fetch === "function";
}

export function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, signal } = options;

  if (!isBrowser()) {
    // During SSR no real network call should reach the API; services still
    // serve their existing fallback data. This mirrors core.ts behaviour.
    return Promise.reject(
      new ApiHttpError(503, "api.client", "API unavailable during server render"),
    );
  }

  const url = `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const init: RequestInit = {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    credentials: "include",
    signal,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return fetch(url, init).then(async (res) => {
    if (!res.ok) {
      let payload: ApiError | null = null;
      try {
        payload = (await res.json()) as ApiError;
      } catch {
        /* ignore body parse */
      }
      throw new ApiHttpError(
        res.status,
        payload?.code ?? "api.error",
        payload?.message ?? `Request failed (${res.status})`,
        payload?.details,
      );
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  });
}

export class ApiHttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Convenience helpers with the same signatures the services will adopt. */
export const http = {
  get: <T = unknown>(path: string, opts?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  del: <T = unknown>(path: string, opts?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
