// Basic in-memory rate limiter for Next.js API Routes

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

/**
 * Applies a basic rate limit.
 * @param identifier The IP address or Email to limit.
 * @param limit Max requests allowed in the window.
 * @param windowMs Time window in milliseconds.
 * @returns boolean: true if allowed, false if rate limited.
 */
export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(identifier);

  // If no record or the window has passed, create a new record
  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // If within the window, check the count
  if (record.count >= limit) {
    return false; // Rate limited
  }

  // Otherwise, increment the count
  record.count++;
  store.set(identifier, record);
  return true;
}
