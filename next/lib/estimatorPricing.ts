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

export type GrowthCfg = { id: string; label: string; hint: string; cost: Range; weeks: number };

export type PricingConfig = {
  currencySymbol: string;
  currencyCode: string;
  types: ProjectTypeCfg[];
  sizes: SizeCfg[];
  features: FeatureCfg[];
  designLevels: DesignCfg[];
  growth: GrowthCfg[];
  rushCostMult: number; // cost premium for rush timeline
  rushWeeksMult: number; // timeline compression for rush (< 1)
};

export type EstimatorSelection = {
  type: string; // ProjectTypeCfg.key
  size: string; // SizeCfg.key
  features: string[]; // FeatureCfg.id[]
  design: string; // DesignCfg.key
  growth: string[]; // GrowthCfg.id[]
  timeline: 'standard' | 'rush';
};

export const DEFAULT_PRICING: PricingConfig = {
  currencySymbol: '$',
  currencyCode: 'USD',
  types: [
    { key: 'website', label: 'Website', blurb: 'Marketing / brand site', base: { min: 1500, max: 4000 }, weeks: { min: 2, max: 4 }, unit: 'pages' },
    { key: 'webapp', label: 'Web App', blurb: 'SaaS / dashboard product', base: { min: 6000, max: 15000 }, weeks: { min: 6, max: 12 }, unit: 'screens' },
    { key: 'mobileapp', label: 'Mobile App', blurb: 'iOS / Android / cross-platform', base: { min: 8000, max: 20000 }, weeks: { min: 8, max: 14 }, unit: 'screens' },
    { key: 'software', label: 'Custom Software', blurb: 'Internal tools / platforms', base: { min: 12000, max: 30000 }, weeks: { min: 10, max: 20 }, unit: 'modules' },
    { key: 'design', label: 'UI/UX Design', blurb: 'Design-only (no build)', base: { min: 1500, max: 5000 }, weeks: { min: 2, max: 5 }, unit: 'screens' },
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
  designLevels: [
    { key: 'template', label: 'Template-based', hint: 'Theme + polish', mult: 0.85 },
    { key: 'custom', label: 'Custom', hint: 'Bespoke UI', mult: 1.0 },
    { key: 'premium', label: 'Premium', hint: 'Full design system', mult: 1.35 },
  ],
  growth: [
    { id: 'seo', label: 'SEO foundation', hint: 'Technical + on-page', cost: { min: 800, max: 2000 }, weeks: 1 },
    { id: 'aeo', label: 'AEO / GEO (AI search)', hint: 'Answer & generative-engine optimization', cost: { min: 1000, max: 2500 }, weeks: 1.5 },
  ],
  rushCostMult: 1.3,
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
  return {
    type: validType,
    size: validSize,
    design: validDesign,
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

  let costMin = t.base.min * size.cost * design.mult;
  let costMax = t.base.max * size.cost * design.mult;
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

/** Round to the nearest 100 so estimates read as ballparks, not false precision. */
export function formatMoney(cfg: PricingConfig, n: number): string {
  return cfg.currencySymbol + (Math.round(n / 100) * 100).toLocaleString('en-US');
}

// ---- URL <-> selection (shareable estimates) -------------------------------
export function encodeSelection(s: EstimatorSelection): string {
  const p = new URLSearchParams();
  p.set('type', s.type);
  p.set('size', s.size);
  p.set('design', s.design);
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
    timeline: p.get('timeline') === 'rush' ? 'rush' : 'standard',
    features: list('features'),
    growth: list('growth'),
  };
}
