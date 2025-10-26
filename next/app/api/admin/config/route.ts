import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';

function pickContentSnapshot(obj: any) {
  const omit = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'baseline']);
  const out: any = {};
  Object.keys(obj || {}).forEach(k => {
    if (!omit.has(k)) out[k] = obj[k];
  });
  return out;
}

export async function GET() {
  await connectDB();
  const cfg = await SiteConfig.getSingleton();
  const snapshot = pickContentSnapshot(cfg.toObject());
  return NextResponse.json(snapshot);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'replace';
  const payload = await req.json().catch(() => ({}));

  const cfg = await SiteConfig.getSingleton();
  const current = pickContentSnapshot(cfg.toObject());

  // helper to assign content keys
  const assignContent = (src: any) => {
    Object.keys(current).forEach(k => {
      // @ts-ignore
      (cfg as any)[k] = src[k];
    });
  };

  if (mode === 'merge') {
    const merged = { ...current, ...(payload || {}) };
    assignContent(merged);
    await cfg.save();
    return NextResponse.json({ ok: true, mode });
  }

  if (mode === 'replace') {
    assignContent(payload || {});
    await cfg.save();
    return NextResponse.json({ ok: true, mode });
  }

  if (mode === 'setBaseline') {
    // @ts-ignore
    (cfg as any).baseline = current;
    await cfg.save();
    return NextResponse.json({ ok: true, mode });
  }

  if (mode === 'reset') {
    // Prefer restoring from baseline; fallback to defaults via new doc
    // @ts-ignore
    const baseline = (cfg as any).baseline;
    if (baseline && typeof baseline === 'object') {
      assignContent(baseline);
      await cfg.save();
      return NextResponse.json({ ok: true, mode, source: 'baseline' });
    }
    // Fallback: rebuild defaults by creating a temp doc from model defaults
    // We call getSingleton only once; to get defaults, construct a new model instance
    const DefaultModel = (cfg.constructor as any);
    const temp = new DefaultModel();
    const defaults = pickContentSnapshot(temp.toObject());
    assignContent(defaults);
    await cfg.save();
    return NextResponse.json({ ok: true, mode, source: 'defaults' });
  }

  return NextResponse.json({ error: 'Unsupported mode' }, { status: 400 });
}
