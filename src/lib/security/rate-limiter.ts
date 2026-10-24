/**
 * Sliding Window In-Memory Rate Limiter with Automatic Eviction
 * Designed for Auth Endpoints (OWASP A07:2021 Anti-Abuse & Brute-Force Protection)
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired keys every 5 minutes to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      // Retain only timestamps from the last 1 hour
      const valid = record.timestamps.filter((ts) => now - ts < 3600 * 1000);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        record.timestamps = valid;
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks whether the given key is within the allowed request limit for a time window.
 *
 * @param key Unique identifier (e.g. `login:192.168.1.1` or `login:user@example.com`)
 * @param maxAttempts Maximum requests allowed in the window (e.g. 5)
 * @param windowSeconds Window length in seconds (e.g. 900 for 15 minutes)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = store.get(key) || { timestamps: [] };

  // Filter out timestamps older than window
  const recent = record.timestamps.filter((ts) => now - ts < windowMs);

  if (recent.length >= maxAttempts) {
    const oldest = recent[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  // Record this attempt
  recent.push(now);
  store.set(key, { timestamps: recent });

  return {
    allowed: true,
    remaining: maxAttempts - recent.length,
    resetSeconds: windowSeconds,
  };
}

/**
 * Resets rate limit for a key upon successful action (e.g. successful login)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
