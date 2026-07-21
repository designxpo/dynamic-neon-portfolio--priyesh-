import { NextResponse } from 'next/server';

/**
 * Best-effort in-memory fixed-window rate limiter.
 *
 * IMPORTANT: state lives in this process only. On serverless (Vercel) each
 * instance has its own map, so this is NOT a hard global limit — it's
 * defense-in-depth against casual spam/abuse and accidental floods. For a
 * strict distributed limit, back this with Upstash/Redis.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  // Occasionally drop expired buckets so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns a 429 NextResponse when the caller has exceeded `limit` requests
 * within `windowMs`, otherwise null. `key` namespaces the limit per endpoint.
 */
export function rateLimit(
  req: Request,
  opts: { key: string; limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now();
  sweep(now);
  const id = `${opts.key}:${clientIp(req)}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (bucket.count >= opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  bucket.count++;
  return null;
}
