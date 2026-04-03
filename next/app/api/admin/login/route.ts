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
        const initial = process.env.ADMIN_PASSWORD || 'admin';
        valid = password === initial;
        if (valid) {
          // Persist the hash so future logins use it
          (cfg as any).adminPasswordHash = hashPassword(password);
          await cfg.save();
        }
      }
    } catch (err) {
      console.error('[login] DB error:', err);
      // Fallback: allow login with ADMIN_PASSWORD env var so admin isn't locked out
      const fallback = process.env.ADMIN_PASSWORD || 'admin';
      valid = password === fallback;
    }
  } else {
    // No DB — use env var only
    const fallback = process.env.ADMIN_PASSWORD || 'admin';
    valid = password === fallback;
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
