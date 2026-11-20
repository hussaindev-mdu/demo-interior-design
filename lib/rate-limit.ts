/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Good enough to blunt casual spam. On serverless platforms (Vercel) each
 * instance keeps its own memory, so the limit is per-instance; for a hard
 * global limit swap this for a shared store such as Upstash Redis.
 */
type Bucket = number[];

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

export function rateLimit(key: string, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();

  // Occasionally drop stale keys so memory can't grow without bound.
  if (now - lastSweep > windowMs) {
    for (const [k, hits] of buckets) {
      if (!hits.length || now - hits[hits.length - 1] > windowMs) buckets.delete(k);
    }
    lastSweep = now;
  }

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { ok: false as const, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true as const, remaining: limit - hits.length };
}
