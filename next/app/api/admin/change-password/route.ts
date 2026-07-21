import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';
import { hashPassword, verifyPassword, isAuthenticated } from '../../../../lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both currentPassword and newPassword are required' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }
  if (newPassword.length > 200) {
    return NextResponse.json({ error: 'Password too long' }, { status: 400 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    await connectDB();
    const cfg = await SiteConfig.getOrCreate();
    const stored = (cfg as any).adminPasswordHash as string | undefined;

    let valid = false;
    if (stored) {
      valid = verifyPassword(currentPassword, stored);
    } else {
      // Bootstrap: compare against env var. No production default — ADMIN_PASSWORD
      // must be set; in development we keep the convenient "admin" default.
      const initial = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin');
      valid = initial !== '' && currentPassword === initial;
    }

    if (!valid) {
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    (cfg as any).adminPasswordHash = hashPassword(newPassword);
    // Clear plaintext field if still present
    (cfg as any).adminPassword = undefined;
    await cfg.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[change-password] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
