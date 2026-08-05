import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import PricingConfig from '@/models/PricingConfig';
import { requireAdmin } from '@/lib/adminAuth';
import {
  DEFAULT_PRICING,
  regionForCountry,
  type PricingConfig as PricingConfigType,
} from '@/lib/estimatorPricing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};
const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;
const range = (v: any) => ({ min: num(v?.min), max: num(v?.max) });

const countryList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((c) => str(c).toUpperCase().trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  return [];
};

// Whitelist + coerce the incoming payload so only well-formed pricing is stored.
function sanitize(body: any): PricingConfigType {
  const b = body || {};
  return {
    currencySymbol: str(b.currencySymbol, '$') || '$',
    currencyCode: str(b.currencyCode, 'USD') || 'USD',
    defaultRegion: str(b.defaultRegion, 'base') || 'base',
    regions: Array.isArray(b.regions)
      ? b.regions.map((r: any) => ({
          code: str(r?.code).trim(),
          label: str(r?.label),
          currencySymbol: str(r?.currencySymbol, '$') || '$',
          currencyCode: str(r?.currencyCode).toUpperCase(),
          countries: countryList(r?.countries),
          multiplier: num(r?.multiplier, 1) || 1,
          roundTo: num(r?.roundTo, 100) || 1,
        })).filter((r: any) => r.code && r.currencyCode && r.code !== 'base')
      : [],
    types: Array.isArray(b.types)
      ? b.types.map((t: any) => ({
          key: str(t?.key),
          label: str(t?.label),
          blurb: str(t?.blurb),
          base: range(t?.base),
          weeks: range(t?.weeks),
          unit: str(t?.unit, 'items'),
        })).filter((t: any) => t.key && t.label)
      : [],
    sizes: Array.isArray(b.sizes)
      ? b.sizes.map((s: any) => ({
          key: str(s?.key),
          label: str(s?.label),
          hint: str(s?.hint),
          cost: num(s?.cost, 1),
          weeks: num(s?.weeks, 1),
        })).filter((s: any) => s.key && s.label)
      : [],
    features: Array.isArray(b.features)
      ? b.features.map((f: any) => ({
          id: str(f?.id),
          label: str(f?.label),
          cost: range(f?.cost),
          weeks: num(f?.weeks),
        })).filter((f: any) => f.id && f.label)
      : [],
    designLevels: Array.isArray(b.designLevels)
      ? b.designLevels.map((d: any) => ({
          key: str(d?.key),
          label: str(d?.label),
          hint: str(d?.hint),
          mult: num(d?.mult, 1),
        })).filter((d: any) => d.key && d.label)
      : [],
    growth: Array.isArray(b.growth)
      ? b.growth.map((g: any) => ({
          id: str(g?.id),
          label: str(g?.label),
          hint: str(g?.hint),
          cost: range(g?.cost),
          weeks: num(g?.weeks),
        })).filter((g: any) => g.id && g.label)
      : [],
    rushCostMult: num(b.rushCostMult, 1.3),
    rushWeeksMult: num(b.rushWeeksMult, 0.65),
  };
}

// Geo-detect the visitor's country from the CDN header (Vercel / Cloudflare),
// then resolve which pricing region applies. Attached to the GET response so the
// tool can pre-select the right currency without an extra request.
function detect(req: Request, cfg: any) {
  const country = (
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    ''
  ).toUpperCase();
  const region = regionForCountry(cfg, country);
  return { detectedCountry: country || null, detectedRegion: region.code };
}

// GET /api/pricing — public. Returns the singleton config, seeding defaults once.
export async function GET(req: Request) {
  try {
    await connectDB();
    let cfg: any = await PricingConfig.findOne({}, {}, { sort: { updatedAt: -1 } }).lean();
    if (!cfg) {
      const created = await PricingConfig.create(DEFAULT_PRICING);
      cfg = created.toObject();
    }
    return NextResponse.json({ ...cfg, ...detect(req, cfg) });
  } catch (err: any) {
    // Never break the public tool on a DB hiccup — it falls back to defaults.
    console.error('[Pricing GET] DB error:', err?.message || err);
    return NextResponse.json({ ...DEFAULT_PRICING, ...detect(req, DEFAULT_PRICING) });
  }
}

// PUT /api/pricing — admin only. Upserts the singleton config.
export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const patch = sanitize(body);
    if (!patch.types.length || !patch.sizes.length || !patch.designLevels.length) {
      return NextResponse.json(
        { error: 'Pricing must include at least one project type, size, and design level.' },
        { status: 400 },
      );
    }
    const latest = await PricingConfig.findOne({}, {}, { sort: { updatedAt: -1 } });
    const saved = latest
      ? await PricingConfig.findByIdAndUpdate(latest._id, patch, { new: true }).lean()
      : (await PricingConfig.create(patch)).toObject();
    return NextResponse.json(saved);
  } catch (err: any) {
    console.error('[Pricing PUT] DB error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to save pricing', details: err?.message || err }, { status: 500 });
  }
}
