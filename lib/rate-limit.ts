/**
 * Tiny in-memory fixed-window rate limiter. Good enough for a single-instance
 * deployment; swap for Upstash Redis when running across regions.
 */
type Entry = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __rateLimit?: Map<string, Entry> };
const store = globalStore.__rateLimit ?? new Map<string, Entry>();
globalStore.__rateLimit = store;

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  // Opportunistic cleanup to keep the map bounded.
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
  }

  return { success: true, remaining: limit - entry.count, retryAfter: 0 };
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Clear a bucket after a successful login so valid users never lock themselves out. */
export function clearRateLimit(key: string) {
  store.delete(key);
}
