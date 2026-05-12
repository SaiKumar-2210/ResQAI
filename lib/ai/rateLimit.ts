type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function assertRateLimit(key: string, limit = 24, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    const error = new Error(`Rate limit exceeded. Retry after ${retryAfterSeconds}s.`);
    error.name = "RateLimitError";
    throw error;
  }

  current.count += 1;
}
