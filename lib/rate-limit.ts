// Simple in-memory rate limiter (suitable for local/dev)
// For production on Vercel, consider Upstash Ratelimit.

type Key = string

const buckets = new Map<Key, { count: number; resetAt: number }>()

export function rateLimit(key: Key, limit = 60, windowMs = 60_000) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }
  if (b.count >= limit) return { success: false, remaining: 0 }
  b.count += 1
  return { success: true, remaining: limit - b.count }
}

