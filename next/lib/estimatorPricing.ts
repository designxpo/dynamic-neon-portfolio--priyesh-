// Single source of truth for the Project Cost Estimator pricing.
// Used by: the public tool (components/tools/CostEstimator.tsx), the API seed
// (app/api/pricing/route.ts), and the admin editor (admin/forms/PricingForm.tsx).
// Keeping the shape + defaults here means the tool, the DB seed, and the form
// never drift apart.

export type Range = { min: number; max: number };

export type ProjectTypeCfg = {
  key: string;
  label: string;
  blurb: string;
  base: Range; // base cost in the configured currency
  weeks: Range; // base timeline in weeks
  unit: string; // "pages" | "screens" | "modules"
};

export type SizeCfg = {
  key: string;
  label: string;
  hint: string; // e.g. "6–15"
  cost: number; // multiplier on base cost
  weeks: number; // multiplier on base weeks
};

export type FeatureCfg = { id: string; label: string; cost: Range; weeks: number };

export type DesignCfg = { key: string; label: string; hint: string; mult: number };

// Industry / product domain — a single-select cost multiplier (e-commerce,
// SaaS, fintech, …) reflecting how much complexity that domain adds.
export type DomainCfg = { key: string; label: string; mult: number };

export type GrowthCfg = { id: string; label: string; hint: string; cost: Range; weeks: number };

// A pricing region: a currency + which countries resolve to it + how base
// (base-currency) costs are transformed for that market.
export type RegionCfg = {
  code: string; // unique id, e.g. "IN", "EU", "GB"
  label: string; // e.g. "India"
  currencySymbol: string; // e.g. "₹"
  currencyCode: string; // e.g. "INR"
  countries: string[]; // ISO-3166 alpha-2 codes mapped to this region, e.g. ["IN"]
  multiplier: number; // base cost × multiplier → this region's cost
  roundTo: number; // round displayed amounts to the nearest N (e.g. 1000 for INR)
};

export type PricingConfig = {
  currencySymbol: string; // BASE currency (fallback for undetected countries)
  currencyCode: string;
  regions: RegionCfg[];
  defaultRegion: string; // region code (or "base") used when detection fails
  types: ProjectTypeCfg[];
  sizes: SizeCfg[];
  features: FeatureCfg[];
  designLevels: DesignCfg[];
  domains: DomainCfg[];
  growth: GrowthCfg[];
  rushCostMult: number; // cost premium for rush timeline
  rushWeeksMult: number; // timeline compression for rush (< 1)
};

export type EstimatorSelection = {
  type: string; // ProjectTypeCfg.key
  size: string; // SizeCfg.key
  features: string[]; // FeatureCfg.id[]
  design: string; // DesignCfg.key
  domain: string; // DomainCfg.key
  growth: string[]; // GrowthCfg.id[]
  timeline: 'standard' | 'rush';
};

export const DEFAULT_PRICING: PricingConfig = {
  currencySymbol: '$',
  currencyCode: 'USD',
  // Base is the US/global anchor (USD, multiplier 1). Each region multiplier is
  // calibrated to that market: FX × local market factor (NOT just FX). India
  // prices well below FX parity; the Gulf and AU sit slightly above. Tune any of
  // these in the admin to match your exact positioning.
  defaultRegion: 'base',
  // Region multiplier = (cost relative to US, from research) × (USD→local FX).
  // Research US-relative factors: IN 0.35, EU 0.80, GB 0.85, AE 0.75, AU 0.95, CA 0.90.
  // See docs/estimator-pricing-research.md for sources.
  regions: [
    // 0.35 × ~84 INR. Indian rates ~35% of US (Clutch $25–49/hr; SO salary gap).
    { code: 'IN', label: 'India', currencySymbol: '₹', currencyCode: 'INR', countries: ['IN'], multiplier: 29, roundTo: 1000 },
    // 0.80 × ~0.92 EUR (Germany/W-EU freelance ~$70–85/hr).
    { code: 'EU', label: 'Europe', currencySymbol: '€', currencyCode: 'EUR', countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'AT', 'BE', 'FI', 'GR', 'LU'], multiplier: 0.74, roundTo: 100 },
    // 0.85 × ~0.79 GBP (UK freelance ~$75–95/hr).
    { code: 'GB', label: 'United Kingdom', currencySymbol: '£', currencyCode: 'GBP', countries: ['GB'], multiplier: 0.67, roundTo: 100 },
    // 0.75 × ~3.67 AED — LOW confidence: Gulf market is bimodal (~3× internal spread).
    { code: 'AE', label: 'UAE / Gulf', currencySymbol: 'AED ', currencyCode: 'AED', countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'], multiplier: 2.75, roundTo: 500 },
    // 0.95 × ~1.52 AUD (~$93/hr; Clutch $100–149/hr).
    { code: 'AU', label: 'Australia', currencySymbol: 'A$', currencyCode: 'AUD', countries: ['AU', 'NZ'], multiplier: 1.44, roundTo: 100 },
    // 0.90 × ~1.37 CAD (freelance ~$85–100/hr).
    { code: 'CA', label: 'Canada', currencySymbol: 'C$', currencyCode: 'CAD', countries: ['CA'], multiplier: 1.23, roundTo: 100 },
  ],
  types: [
    // Base = US-baseline range for a SMALL project (size ×1); size tiers scale it up.
    // Calibrated so small→enterprise spans the researched market ranges (see docs).
    { key: 'website', label: 'Website', blurb: 'Marketing / brand site', base: { min: 2000, max: 5000 }, weeks: { min: 2, max: 4 }, unit: 'pages' },
    { key: 'webapp', label: 'Web App', blurb: 'SaaS / dashboard product', base: { min: 9000, max: 22000 }, weeks: { min: 6, max: 12 }, unit: 'screens' },
    { key: 'mobileapp', label: 'Mobile App', blurb: 'iOS / Android / cross-platform', base: { min: 12000, max: 30000 }, weeks: { min: 8, max: 14 }, unit: 'screens' },
    { key: 'software', label: 'Custom Software', blurb: 'Internal tools / platforms', base: { min: 15000, max: 40000 }, weeks: { min: 10, max: 20 }, unit: 'modules' },
    { key: 'design', label: 'UI/UX Design', blurb: 'Design-only (no build)', base: { min: 3000, max: 9000 }, weeks: { min: 2, max: 5 }, unit: 'screens' },
  ],
  sizes: [
    { key: 'small', label: 'Small', hint: '1–5', cost: 1.0, weeks: 1.0 },
    { key: 'medium', label: 'Medium', hint: '6–15', cost: 1.6, weeks: 1.4 },
    { key: 'large', label: 'Large', hint: '16–30', cost: 2.6, weeks: 2.0 },
    { key: 'enterprise', label: 'Enterprise', hint: '30+', cost: 4.0, weeks: 3.0 },
  ],
  features: [
    { id: 'auth', label: 'User accounts & auth', cost: { min: 600, max: 1500 }, weeks: 1 },
    { id: 'payments', label: 'Payments / subscriptions', cost: { min: 800, max: 2000 }, weeks: 1.5 },
    { id: 'cms', label: 'CMS / blog', cost: { min: 700, max: 1800 }, weeks: 1 },
    { id: 'dashboard', label: 'Admin dashboard', cost: { min: 1500, max: 4000 }, weeks: 2 },
    { id: 'integrations', label: 'Third-party integrations / API', cost: { min: 800, max: 2500 }, weeks: 1.5 },
    { id: 'motion', label: 'Advanced animation / 3D', cost: { min: 700, max: 2500 }, weeks: 1 },
    { id: 'i18n', label: 'Multi-language', cost: { min: 500, max: 1500 }, weeks: 1 },
    { id: 'ai', label: 'AI features (chatbot, gen-AI)', cost: { min: 1200, max: 3500 }, weeks: 2 },
  ],
  // Research: template ~2–4× cheaper than custom; design system +30–80%.
  designLevels: [
    { key: 'template', label: 'Template-based', hint: 'Theme + polish', mult: 0.65 },
    { key: 'custom', label: 'Custom', hint: 'Bespoke UI', mult: 1.0 },
    { key: 'premium', label: 'Premium', hint: 'Full design system', mult: 1.45 },
  ],
  // Industry/domain multipliers — ordering is well-supported (compliance/talent
  // premiums); exact decimals are a calibrated modelling choice. See docs.
  domains: [
    { key: 'general', label: 'General / Business', mult: 1.0 },
    { key: 'ecommerce', label: 'E-commerce', mult: 1.4 },
    { key: 'saas', label: 'SaaS / Dashboard', mult: 1.5 },
    { key: 'marketplace', label: 'Marketplace', mult: 1.8 },
    { key: 'fintech', label: 'Fintech', mult: 1.65 },
    { key: 'healthcare', label: 'Healthcare', mult: 1.45 },
    { key: 'education', label: 'Education / E-learning', mult: 1.2 },
    { key: 'social', label: 'Social / Community', mult: 1.4 },
    { key: 'ai', label: 'AI / Data', mult: 1.7 },
  ],
  growth: [
    { id: 'seo', label: 'SEO foundation', hint: 'Technical + on-page', cost: { min: 800, max: 2000 }, weeks: 1 },
    { id: 'aeo', label: 'AEO / GEO (AI search)', hint: 'Answer & generative-engine optimization', cost: { min: 1000, max: 2500 }, weeks: 1.5 },
  ],
  // Research: freelance rush norm +25-100%; ~+50% for a sub-50%-time compression.
  rushCostMult: 1.5,
  rushWeeksMult: 0.65,
};

// ---- lookups ---------------------------------------------------------------
const byKey = <T extends { key: string }>(arr: T[], key: string) =>
  arr.find((x) => x.key === key);
const byId = <T extends { id: string }>(arr: T[], id: string) =>
  arr.find((x) => x.id === id);

/** A valid default selection for a given config (first of each list). */
export function defaultSelection(cfg: PricingConfig): EstimatorSelection {
  return {
    type: cfg.types[0]?.key ?? '',
    size: cfg.sizes[Math.min(1, cfg.sizes.length - 1)]?.key ?? cfg.sizes[0]?.key ?? '',
    features: [],
    design: (byKey(cfg.designLevels, 'custom') ?? cfg.designLevels[0])?.key ?? '',
    domain: cfg.domains?.[0]?.key ?? '',
    growth: [],
    timeline: 'standard',
  };
}

/** Clamp an arbitrary selection (e.g. from a URL) to what the config allows. */
export function normalizeSelection(sel: Partial<EstimatorSelection>, cfg: PricingConfig): EstimatorSelection {
  const base = defaultSelection(cfg);
  const validType = sel.type && byKey(cfg.types, sel.type) ? sel.type : base.type;
  const validSize = sel.size && byKey(cfg.sizes, sel.size) ? sel.size : base.size;
  const validDesign = sel.design && byKey(cfg.designLevels, sel.design) ? sel.design : base.design;
  const validDomain = sel.domain && byKey(cfg.domains || [], sel.domain) ? sel.domain : base.domain;
  return {
    type: validType,
    size: validSize,
    design: validDesign,
    domain: validDomain,
    timeline: sel.timeline === 'rush' ? 'rush' : 'standard',
    features: (sel.features ?? []).filter((id) => byId(cfg.features, id)),
    growth: (sel.growth ?? []).filter((id) => byId(cfg.growth, id)),
  };
}

export type EstimateResult = { costMin: number; costMax: number; weeksMin: number; weeksMax: number };

/** Deterministic estimate. Base × size × design, plus flat add-ons, then timeline. */
export function estimate(cfg: PricingConfig, s: EstimatorSelection): EstimateResult {
  const t = byKey(cfg.types, s.type) ?? cfg.types[0];
  const size = byKey(cfg.sizes, s.size) ?? cfg.sizes[0];
  const design = byKey(cfg.designLevels, s.design) ?? cfg.designLevels[0];
  if (!t || !size || !design) return { costMin: 0, costMax: 0, weeksMin: 1, weeksMax: 2 };

  const timelineCost = s.timeline === 'rush' ? cfg.rushCostMult : 1.0;
  const timelineWeeks = s.timeline === 'rush' ? cfg.rushWeeksMult : 1.0;
  const domainMult = (byKey(cfg.domains || [], s.domain) ?? cfg.domains?.[0])?.mult ?? 1.0;

  let costMin = t.base.min * size.cost * design.mult * domainMult;
  let costMax = t.base.max * size.cost * design.mult * domainMult;
  let weeksMin = t.weeks.min * size.weeks;
  let weeksMax = t.weeks.max * size.weeks;

  for (const id of s.features) {
    const f = byId(cfg.features, id);
    if (!f) continue;
    costMin += f.cost.min;
    costMax += f.cost.max;
    weeksMin += f.weeks * 0.6;
    weeksMax += f.weeks;
  }
  for (const id of s.growth) {
    const g = byId(cfg.growth, id);
    if (!g) continue;
    costMin += g.cost.min;
    costMax += g.cost.max;
    weeksMin += g.weeks * 0.6;
    weeksMax += g.weeks;
  }

  costMin *= timelineCost;
  costMax *= timelineCost;
  weeksMin *= timelineWeeks;
  weeksMax *= timelineWeeks;

  return {
    costMin,
    costMax,
    weeksMin: Math.max(1, Math.round(weeksMin)),
    weeksMax: Math.max(2, Math.round(weeksMax)),
  };
}

// ---- regions ---------------------------------------------------------------
/** The base-currency pseudo-region (multiplier 1), used as the fallback. */
export function baseRegion(cfg: PricingConfig): RegionCfg {
  return {
    code: 'base',
    label: cfg.currencyCode || 'USD',
    currencySymbol: cfg.currencySymbol || '$',
    currencyCode: cfg.currencyCode || 'USD',
    countries: [],
    multiplier: 1,
    roundTo: 100,
  };
}

/** All selectable regions: the base region first, then admin-defined ones. */
export function allRegions(cfg: PricingConfig): RegionCfg[] {
  return [baseRegion(cfg), ...(cfg.regions || [])];
}

/** Look up a region by its code (falls back to the configured default, then base). */
export function getRegion(cfg: PricingConfig, code?: string | null): RegionCfg {
  const regions = allRegions(cfg);
  return (
    regions.find((r) => r.code === code) ||
    regions.find((r) => r.code === cfg.defaultRegion) ||
    regions[0]
  );
}

/** Resolve a region from an ISO country code (falls back to the default region). */
export function regionForCountry(cfg: PricingConfig, country?: string | null): RegionCfg {
  const cc = (country || '').toUpperCase();
  if (cc) {
    const match = (cfg.regions || []).find((r) => r.countries.map((c) => c.toUpperCase()).includes(cc));
    if (match) return match;
  }
  return getRegion(cfg, cfg.defaultRegion);
}

/** Convert a base-currency amount into a region's currency (multiplier + rounding). */
export function applyRegion(region: RegionCfg, baseAmount: number): number {
  const step = region.roundTo > 0 ? region.roundTo : 1;
  return Math.round((baseAmount * region.multiplier) / step) * step;
}

/** Format a base-currency amount as a rounded string in the region's currency. */
export function formatMoney(region: RegionCfg, baseAmount: number): string {
  return region.currencySymbol + applyRegion(region, baseAmount).toLocaleString('en-US');
}

// ---- URL <-> selection (shareable estimates) -------------------------------
export function encodeSelection(s: EstimatorSelection): string {
  const p = new URLSearchParams();
  p.set('type', s.type);
  p.set('size', s.size);
  p.set('design', s.design);
  if (s.domain) p.set('domain', s.domain);
  p.set('timeline', s.timeline);
  if (s.features.length) p.set('features', s.features.join(','));
  if (s.growth.length) p.set('growth', s.growth.join(','));
  return p.toString();
}

export function decodeSelection(search: string): Partial<EstimatorSelection> {
  const p = new URLSearchParams(search);
  const list = (key: string) =>
    (p.get(key) || '').split(',').map((x) => x.trim()).filter(Boolean);
  return {
    type: p.get('type') || undefined,
    size: p.get('size') || undefined,
    design: p.get('design') || undefined,
    domain: p.get('domain') || undefined,
    timeline: p.get('timeline') === 'rush' ? 'rush' : 'standard',
    features: list('features'),
    growth: list('growth'),
  };
}
