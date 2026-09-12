const PREFIX = "next-town:";

export function storageKey(...parts: string[]): string {
  return [PREFIX, ...parts].join(":");
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable */
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export const makeRef = (prefix = "HS"): string => {
  const n = Math.floor(1000 + Math.random() * 8999);
  return `${prefix}-${n}`;
};

/** Simulated network latency so loading states behave like a real API. */
export function latency(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
