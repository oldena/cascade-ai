// In-memory sliding window rate limiter per userId.
// Allows maxRequests within windowMs. Resets automatically.
// Note: in-process only — resets on server restart. Sufficient for single-instance deployment.

const store = new Map<string, number[]>()

export function checkRateLimit(
  userId: string,
  windowMs = 120_000, // 2 minutes
  maxRequests = 20,   // 20 step calls per 2 minutes — enough for 2 full pipelines
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now()
  const cutoff = now - windowMs
  const prev = (store.get(userId) ?? []).filter((t) => t > cutoff)

  if (prev.length >= maxRequests) {
    const oldest = prev[0]
    return { allowed: false, remaining: 0, resetInMs: windowMs - (now - oldest) }
  }

  prev.push(now)
  store.set(userId, prev)
  return { allowed: true, remaining: maxRequests - prev.length, resetInMs: windowMs }
}
