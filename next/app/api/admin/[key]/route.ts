import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';

const allowedKeys = new Set([
  'hero',
  'services',
  'projects',
  'experiences',
  'educations',
  'skills',
  'testimonials',
  'contact',
  'blogs',
  'seo',
  'adminPassword'
]);

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  // If DB is not configured, avoid attempting a connection to prevent noisy errors
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  await connectDB();
  const cfg = await SiteConfig.getSingleton();
  // @ts-ignore
  const value = cfg[key as keyof typeof cfg];
  return NextResponse.json(value ?? null);
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  await connectDB();
  const payload = await req.json();
  const cfg = await SiteConfig.getSingleton();
  // @ts-ignore
  (cfg as any)[key] = payload;
  await cfg.save();
  return NextResponse.json({ ok: true });
}
