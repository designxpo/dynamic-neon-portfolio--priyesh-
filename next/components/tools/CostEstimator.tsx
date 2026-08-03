'use client';

import React, { useEffect, useMemo, useState } from 'react';

/**
 * Project Cost Estimator — a self-contained, client-side link magnet.
 *
 * Why it earns links: it's a genuinely useful free tool, every estimate is a
 * shareable URL (state is mirrored into the query string), and it exposes a
 * copy-paste <iframe> embed — each embed on another site is a backlink.
 * All math is deterministic and runs in the browser (no backend/API).
 */

type ProjectType = 'website' | 'webapp' | 'mobileapp' | 'software' | 'design';
type SizeTier = 'small' | 'medium' | 'large' | 'enterprise';
type DesignLevel = 'template' | 'custom' | 'premium';
type Timeline = 'standard' | 'rush';

type Range = { min: number; max: number };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';
const PATH = '/tools/project-cost-estimator';

const TYPES: Record<
  ProjectType,
  { label: string; blurb: string; base: Range; weeks: Range; unit: string }
> = {
  website: {
    label: 'Website',
    blurb: 'Marketing / brand site',
    base: { min: 1500, max: 4000 },
    weeks: { min: 2, max: 4 },
    unit: 'pages',
  },
  webapp: {
    label: 'Web App',
    blurb: 'SaaS / dashboard product',
    base: { min: 6000, max: 15000 },
    weeks: { min: 6, max: 12 },
    unit: 'screens',
  },
  mobileapp: {
    label: 'Mobile App',
    blurb: 'iOS / Android / cross-platform',
    base: { min: 8000, max: 20000 },
    weeks: { min: 8, max: 14 },
    unit: 'screens',
  },
  software: {
    label: 'Custom Software',
    blurb: 'Internal tools / platforms',
    base: { min: 12000, max: 30000 },
    weeks: { min: 10, max: 20 },
    unit: 'modules',
  },
  design: {
    label: 'UI/UX Design',
    blurb: 'Design-only (no build)',
    base: { min: 1500, max: 5000 },
    weeks: { min: 2, max: 5 },
    unit: 'screens',
  },
};

const SIZES: Record<SizeTier, { label: string; hint: string; cost: number; weeks: number }> = {
  small: { label: 'Small', hint: '1–5', cost: 1.0, weeks: 1.0 },
  medium: { label: 'Medium', hint: '6–15', cost: 1.6, weeks: 1.4 },
  large: { label: 'Large', hint: '16–30', cost: 2.6, weeks: 2.0 },
  enterprise: { label: 'Enterprise', hint: '30+', cost: 4.0, weeks: 3.0 },
};

const FEATURES: { id: string; label: string; cost: Range; weeks: number }[] = [
  { id: 'auth', label: 'User accounts & auth', cost: { min: 600, max: 1500 }, weeks: 1 },
  { id: 'payments', label: 'Payments / subscriptions', cost: { min: 800, max: 2000 }, weeks: 1.5 },
  { id: 'cms', label: 'CMS / blog', cost: { min: 700, max: 1800 }, weeks: 1 },
  { id: 'dashboard', label: 'Admin dashboard', cost: { min: 1500, max: 4000 }, weeks: 2 },
  { id: 'integrations', label: 'Third-party integrations / API', cost: { min: 800, max: 2500 }, weeks: 1.5 },
  { id: 'motion', label: 'Advanced animation / 3D', cost: { min: 700, max: 2500 }, weeks: 1 },
  { id: 'i18n', label: 'Multi-language', cost: { min: 500, max: 1500 }, weeks: 1 },
  { id: 'ai', label: 'AI features (chatbot, gen-AI)', cost: { min: 1200, max: 3500 }, weeks: 2 },
];

const DESIGN: Record<DesignLevel, { label: string; hint: string; mult: number }> = {
  template: { label: 'Template-based', hint: 'Theme + polish', mult: 0.85 },
  custom: { label: 'Custom', hint: 'Bespoke UI', mult: 1.0 },
  premium: { label: 'Premium', hint: 'Full design system', mult: 1.35 },
};

const GROWTH: { id: string; label: string; hint: string; cost: Range; weeks: number }[] = [
  { id: 'seo', label: 'SEO foundation', hint: 'Technical + on-page', cost: { min: 800, max: 2000 }, weeks: 1 },
  { id: 'aeo', label: 'AEO / GEO (AI search)', hint: 'Answer & generative-engine optimization', cost: { min: 1000, max: 2500 }, weeks: 1.5 },
];

const DEFAULTS = {
  type: 'website' as ProjectType,
  size: 'medium' as SizeTier,
  features: [] as string[],
  design: 'custom' as DesignLevel,
  growth: [] as string[],
  timeline: 'standard' as Timeline,
};

// Round to the nearest $100 so estimates read as ballparks, not false precision.
const fmtUSD = (n: number) => '$' + (Math.round(n / 100) * 100).toLocaleString('en-US');

function estimate(s: typeof DEFAULTS) {
  const t = TYPES[s.type];
  const size = SIZES[s.size];
  const design = DESIGN[s.design];
  const timelineCost = s.timeline === 'rush' ? 1.3 : 1.0;
  const timelineWeeks = s.timeline === 'rush' ? 0.65 : 1.0;

  // Base scaled by size + design, then flat add-ons, then timeline premium.
  let costMin = t.base.min * size.cost * design.mult;
  let costMax = t.base.max * size.cost * design.mult;
  let weeksMin = t.weeks.min * size.weeks;
  let weeksMax = t.weeks.max * size.weeks;

  for (const f of FEATURES) {
    if (s.features.includes(f.id)) {
      costMin += f.cost.min;
      costMax += f.cost.max;
      weeksMin += f.weeks * 0.6;
      weeksMax += f.weeks;
    }
  }
  for (const g of GROWTH) {
    if (s.growth.includes(g.id)) {
      costMin += g.cost.min;
      costMax += g.cost.max;
      weeksMin += g.weeks * 0.6;
      weeksMax += g.weeks;
    }
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

// ---- URL <-> state (shareable estimates) ----------------------------------
function encodeState(s: typeof DEFAULTS): string {
  const p = new URLSearchParams();
  p.set('type', s.type);
  p.set('size', s.size);
  p.set('design', s.design);
  p.set('timeline', s.timeline);
  if (s.features.length) p.set('features', s.features.join(','));
  if (s.growth.length) p.set('growth', s.growth.join(','));
  return p.toString();
}

function decodeState(search: string): typeof DEFAULTS {
  const p = new URLSearchParams(search);
  const pick = <T extends string>(key: string, allowed: T[], fallback: T): T => {
    const v = p.get(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  };
  const list = (key: string, allowed: string[]) =>
    (p.get(key) || '')
      .split(',')
      .map((x) => x.trim())
      .filter((x) => allowed.includes(x));

  return {
    type: pick('type', Object.keys(TYPES) as ProjectType[], DEFAULTS.type),
    size: pick('size', Object.keys(SIZES) as SizeTier[], DEFAULTS.size),
    design: pick('design', Object.keys(DESIGN) as DesignLevel[], DEFAULTS.design),
    timeline: pick('timeline', ['standard', 'rush'], DEFAULTS.timeline),
    features: list('features', FEATURES.map((f) => f.id)),
    growth: list('growth', GROWTH.map((g) => g.id)),
  };
}

// ---- UI primitives ---------------------------------------------------------
const cardBase =
  'rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple';
const selected = 'border-brand-purple bg-brand-purple/15 text-white';
const unselected = 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25';

const CostEstimator: React.FC = () => {
  const [state, setState] = useState(DEFAULTS);
  const [embed, setEmbed] = useState(false);
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);

  // Hydrate from URL on mount (keeps shareable links working).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setState(decodeState(window.location.search));
    setEmbed(new URLSearchParams(window.location.search).get('embed') === '1');
  }, []);

  // Mirror state into the URL so the current estimate is always shareable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = encodeState(state);
    const url = `${window.location.pathname}?${qs}${embed ? '&embed=1' : ''}`;
    window.history.replaceState(null, '', url);
  }, [state, embed]);

  const result = useMemo(() => estimate(state), [state]);

  const toggle = (key: 'features' | 'growth', id: string) =>
    setState((s) => ({
      ...s,
      [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id],
    }));

  const shareUrl = `${SITE_URL}${PATH}?${encodeState(state)}`;
  const embedCode = `<iframe src="${SITE_URL}${PATH}?${encodeState(
    state,
  )}&embed=1" width="100%" height="720" style="border:0;border-radius:16px" title="Project Cost Estimator by Priyesh Mishra" loading="lazy"></iframe>`;

  const copy = async (text: string, which: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const contactHref = `/#contact?type=${state.type}&est=${Math.round(
    result.costMin / 100,
  ) * 100}-${Math.round(result.costMax / 100) * 100}`;

  return (
    <div className={embed ? 'p-4 sm:p-6' : ''}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        {/* ---- Controls ---- */}
        <div className="space-y-8">
          {/* Project type */}
          <fieldset>
            <legend className="text-sm font-semibold text-white mb-3">1. What are you building?</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(TYPES) as ProjectType[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, type: k }))}
                  aria-pressed={state.type === k}
                  className={`${cardBase} p-3 ${state.type === k ? selected : unselected}`}
                >
                  <span className="block text-sm font-semibold">{TYPES[k].label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{TYPES[k].blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Size */}
          <fieldset>
            <legend className="text-sm font-semibold text-white mb-3">
              2. Rough size <span className="text-gray-500 font-normal">({TYPES[state.type].unit})</span>
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(SIZES) as SizeTier[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, size: k }))}
                  aria-pressed={state.size === k}
                  className={`${cardBase} p-3 ${state.size === k ? selected : unselected}`}
                >
                  <span className="block text-sm font-semibold">{SIZES[k].label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{SIZES[k].hint} {TYPES[state.type].unit}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Features */}
          <fieldset>
            <legend className="text-sm font-semibold text-white mb-3">3. Features <span className="text-gray-500 font-normal">(optional)</span></legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FEATURES.map((f) => {
                const on = state.features.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggle('features', f.id)}
                    aria-pressed={on}
                    className={`${cardBase} flex items-center gap-3 p-3 ${on ? selected : unselected}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid place-items-center h-5 w-5 shrink-0 rounded-md border text-xs ${
                        on ? 'bg-brand-purple border-brand-purple text-white' : 'border-white/25 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Design + Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">4. Design level</legend>
              <div className="space-y-2.5">
                {(Object.keys(DESIGN) as DesignLevel[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, design: k }))}
                    aria-pressed={state.design === k}
                    className={`${cardBase} w-full flex items-center justify-between p-3 ${state.design === k ? selected : unselected}`}
                  >
                    <span className="text-sm font-semibold">{DESIGN[k].label}</span>
                    <span className="text-xs text-gray-400">{DESIGN[k].hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">5. Timeline</legend>
              <div className="space-y-2.5">
                {(['standard', 'rush'] as Timeline[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, timeline: k }))}
                    aria-pressed={state.timeline === k}
                    className={`${cardBase} w-full flex items-center justify-between p-3 ${state.timeline === k ? selected : unselected}`}
                  >
                    <span className="text-sm font-semibold capitalize">{k}</span>
                    <span className="text-xs text-gray-400">{k === 'rush' ? 'Priority · faster' : 'Normal pace'}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <span className="text-sm font-semibold text-white">Growth add-ons</span>
                <div className="mt-2.5 space-y-2.5">
                  {GROWTH.map((g) => {
                    const on = state.growth.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggle('growth', g.id)}
                        aria-pressed={on}
                        className={`${cardBase} w-full flex items-start gap-3 p-3 ${on ? selected : unselected}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid place-items-center h-5 w-5 shrink-0 rounded-md border text-xs mt-0.5 ${
                            on ? 'bg-brand-purple border-brand-purple text-white' : 'border-white/25 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{g.label}</span>
                          <span className="block text-xs text-gray-400">{g.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* ---- Result (sticky) ---- */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-purple/20 to-white/[0.02] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-wider text-brand-purple-light">Estimated investment</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-white leading-tight">
              {fmtUSD(result.costMin)}
              <span className="text-gray-500 font-normal"> – </span>
              {fmtUSD(result.costMax)}
            </p>
            <p className="text-xs text-gray-400 mt-1">USD · ballpark for {TYPES[state.type].label.toLowerCase()}</p>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-gray-400">Timeline</span>
              <span className="ml-auto text-sm font-semibold text-white">
                {result.weeksMin}–{result.weeksMax} weeks
              </span>
            </div>

            <a
              href={contactHref}
              className="mt-5 block w-full text-center rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-brand-purple/90 active:scale-[0.98] transition-all"
            >
              Get a precise quote →
            </a>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copy(shareUrl, 'link')}
                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-gray-200 hover:border-white/35 transition-colors"
              >
                {copied === 'link' ? 'Copied ✓' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => copy(embedCode, 'embed')}
                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-gray-200 hover:border-white/35 transition-colors"
              >
                {copied === 'embed' ? 'Copied ✓' : 'Embed <iframe>'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setState(DEFAULTS)}
              className="mt-3 w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Reset
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              Indicative only. Final pricing depends on scope, integrations, and content readiness — share the link and I&apos;ll send a fixed quote.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CostEstimator;
