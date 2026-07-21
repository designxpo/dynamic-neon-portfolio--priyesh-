import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  buildSessionCookie,
  isAuthenticated,
  ADMIN_SECRET_CONFIGURED,
} from '../../../../lib/adminAuth';

/** GET /api/admin/login — check if the request carries a valid session. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAuthenticated(req) });
}

/** POST /api/admin/login — verify password, issue session cookie. */
export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { password } = body;
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // Prevent absurdly long passwords (DoS via expensive scrypt)
  if (password.length > 200) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === 'production';

  // Refuse to issue sessions in production without a real signing secret,
  // otherwise session tokens are forgeable with the public fallback secret.
  if (isProd && !ADMIN_SECRET_CONFIGURED) {
    console.error('[login] ADMIN_SECRET is not set in production; refusing to authenticate.');
    return NextResponse.json({ error: 'Server authentication is not configured' }, { status: 503 });
  }

  // Bootstrap password: in production there is NO default — ADMIN_PASSWORD must be set.
  // In development we keep the convenient "admin" default.
  const bootstrapPassword = process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin');
  const matchesBootstrap = (candidate: string) => bootstrapPassword !== '' && candidate === bootstrapPassword;

  let valid = false;

  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const cfg = await SiteConfig.getOrCreate();
      const stored = (cfg as any).adminPasswordHash as string | undefined;

      if (stored) {
        // Normal path: verify against stored hash
        valid = verifyPassword(password, stored);
      } else {
        // Bootstrap path: no hash in DB yet — compare against ADMIN_PASSWORD env var
        valid = matchesBootstrap(password);
        if (valid) {
          // Persist the hash so future logins use it
          (cfg as any).adminPasswordHash = hashPassword(password);
          await cfg.save();
        }
      }
    } catch (err) {
      console.error('[login] DB error:', err);
      // Fallback: allow login with ADMIN_PASSWORD env var so admin isn't locked out
      valid = matchesBootstrap(password);
    }
  } else {
    // No DB — use env var only
    valid = matchesBootstrap(password);
  }

  if (!valid) {
    // Use a small constant delay to blunt timing attacks
    await new Promise(r => setTimeout(r, 300));
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token  = createSessionToken();
  const cookie = buildSessionCookie(token);
  return NextResponse.json(
    { ok: true },
    { headers: { 'Set-Cookie': cookie } }
  );
}
