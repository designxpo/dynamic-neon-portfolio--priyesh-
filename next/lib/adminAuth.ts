/**
 * Server-only admin authentication utilities.
 * Uses Node.js built-in `crypto` — no extra dependencies.
 *
 * Password storage: scrypt hash  (salt:hash, both hex-encoded)
 * Session:          HMAC-SHA256 signed token stored in HttpOnly cookie
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

// ─── Constants ───────────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS  = 24 * 60 * 60 * 1000; // 24 hours
const SCRYPT_KEYLEN        = 64;
const SCRYPT_PARAMS        = { N: 16384, r: 8, p: 1 };

/** Set ADMIN_SECRET in .env — must be a long random string in production. */
const ADMIN_SECRET = (() => {
  const s = process.env.ADMIN_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    console.warn(
      '[adminAuth] ADMIN_SECRET env var not set. Using insecure default — ' +
      'set a strong random value in production!'
    );
  }
  return s || 'portfolio-admin-fallback-secret-change-me';
})();

// ─── Password hashing ────────────────────────────────────────────────────────

/** Returns a storable "salt:hash" string. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Timing-safe comparison of a plain-text password against a stored hash.
 * Returns false (not throws) on any error so callers never crash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual   = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ─── Session tokens ──────────────────────────────────────────────────────────

/** Creates a signed session token: "{expires}.{hmac}" */
export function createSessionToken(): string {
  const expires = (Date.now() + SESSION_DURATION_MS).toString();
  const sig     = createHmac('sha256', ADMIN_SECRET).update(expires).digest('hex');
  return `${expires}.${sig}`;
}

/** Returns true if the token is valid and not expired. */
export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return false;
    const expires = token.slice(0, dot);
    const sig     = token.slice(dot + 1);
    if (Date.now() > parseInt(expires, 10)) return false;
    const expected = createHmac('sha256', ADMIN_SECRET).update(expires).digest('hex');
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// ─── Request helpers ─────────────────────────────────────────────────────────

/** Returns true when the incoming request carries a valid session cookie. */
export function isAuthenticated(req: NextRequest | Request): boolean {
  const cookie = (req as NextRequest).cookies?.get?.(SESSION_COOKIE)?.value
    ?? parseCookieHeader(req.headers.get('cookie') ?? '')[SESSION_COOKIE]
    ?? '';
  if (!cookie) return false;
  return verifySessionToken(decodeURIComponent(cookie));
}

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

// ─── Cookie builder ──────────────────────────────────────────────────────────

/** Returns the Set-Cookie header value for a new session. */
export function buildSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${maxAge}`,
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

/** Returns the Set-Cookie header value that clears the session. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
