'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PRICING,
  defaultSelection,
  normalizeSelection,
  estimate,
  formatMoney,
  encodeSelection,
  decodeSelection,
  allRegions,
  getRegion,
  regionForCountry,
  type PricingConfig,
  type EstimatorSelection,
} from '@/lib/estimatorPricing';

/**
 * Project Cost Estimator — a self-contained, client-side link magnet.
 *
 * Why it earns links: it's a genuinely useful free tool, every estimate is a
 * shareable URL (state mirrored into the query string), and it exposes a
 * copy-paste <iframe> embed — each embed on another site is a backlink.
 *
 * Pricing is fetched from /api/pricing (admin-editable) with DEFAULT_PRICING as
 * a robust fallback, so the tool never breaks even when embedded off-site.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';
const PATH = '/tools/project-cost-estimator';

const cardBase =
  'rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple';
const selectedCls = 'border-brand-purple bg-brand-purple/15 text-white';
const unselectedCls = 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25';

const CostEstimator: React.FC = () => {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [sel, setSel] = useState<EstimatorSelection>(() => defaultSelection(DEFAULT_PRICING));
  const [regionCode, setRegionCode] = useState<string>('base');
  const [embed, setEmbed] = useState(false);
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);

  // Load admin pricing + hydrate selection from the URL (keeps shared links working).
  useEffect(() => {
    let alive = true;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    setEmbed(new URLSearchParams(search).get('embed') === '1');

    (async () => {
      let cfg = DEFAULT_PRICING;
      let detectedRegion: string | undefined;
      try {
        const res = await fetch('/api/pricing', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as PricingConfig & { detectedRegion?: string };
          // Guard against an empty/partial doc — fall back if core lists are missing.
          if (json?.types?.length && json?.sizes?.length && json?.designLevels?.length) cfg = json;
          detectedRegion = json?.detectedRegion;
        }
      } catch {
        /* offline / embedded off-site — DEFAULT_PRICING is fine */
      }
      if (!alive) return;
      setConfig(cfg);
      setSel(normalizeSelection(decodeSelection(search), cfg));
      // Region priority: explicit URL → server geo-detection → browser locale → default.
      const urlRegion = new URLSearchParams(search).get('region');
      // Browser-locale fallback (helps when the server had no CDN geo header).
      const localeCountry = (() => {
        try {
          const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
          for (const l of langs) {
            const parts = String(l).split('-');
            const reg = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
            if (/^[A-Z]{2}$/.test(reg)) return reg;
          }
        } catch {
          /* no navigator */
        }
        return '';
      })();
      const localeRegion = localeCountry ? regionForCountry(cfg, localeCountry).code : undefined;
      const nonBase = (c?: string) => (c && c !== 'base' ? c : undefined);
      const codes = allRegions(cfg).map((r) => r.code);
      const pick = [urlRegion, nonBase(detectedRegion), nonBase(localeRegion), cfg.defaultRegion, 'base'].find(
        (c) => c && codes.includes(c),
      );
      setRegionCode(pick || 'base');
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Mirror selection + region into the URL so the current estimate is shareable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = encodeSelection(sel);
    const regionQs = regionCode && regionCode !== 'base' ? `&region=${regionCode}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}${regionQs}${embed ? '&embed=1' : ''}`);
  }, [sel, regionCode, embed]);

  const result = useMemo(() => estimate(config, sel), [config, sel]);
  const region = useMemo(() => getRegion(config, regionCode), [config, regionCode]);
  const currentType = config.types.find((t) => t.key === sel.type) ?? config.types[0];

  const toggle = (key: 'features' | 'growth', id: string) =>
    setSel((s) => ({
      ...s,
      [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id],
    }));

  const regionQs = regionCode && regionCode !== 'base' ? `&region=${regionCode}` : '';
  const shareUrl = `${SITE_URL}${PATH}?${encodeSelection(sel)}${regionQs}`;
  const embedCode = `<iframe src="${SITE_URL}${PATH}?${encodeSelection(
    sel,
  )}${regionQs}&embed=1" width="100%" height="720" style="border:0;border-radius:16px" title="Project Cost Estimator by Priyesh Mishra" loading="lazy"></iframe>`;

  const copy = async (text: string, which: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const estLow = Math.round(result.costMin / 100) * 100;
  const estHigh = Math.round(result.costMax / 100) * 100;
  const contactHref = `/#contact?type=${sel.type}&est=${estLow}-${estHigh}`;

  return (
    <div className={embed ? 'p-4 sm:p-6' : ''}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        {/* ---- Controls ---- */}
        <div className="space-y-8">
          {/* Project type */}
          <fieldset>
            <legend className="text-sm font-semibold text-white mb-3">1. What are you building?</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {config.types.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSel((s) => ({ ...s, type: t.key }))}
                  aria-pressed={sel.type === t.key}
                  className={`${cardBase} p-3 ${sel.type === t.key ? selectedCls : unselectedCls}`}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{t.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Industry / domain */}
          {(config.domains || []).length > 0 && (
            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">2. Industry / domain</legend>
              <div className="flex flex-wrap gap-2.5">
                {(config.domains || []).map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSel((s) => ({ ...s, domain: d.key }))}
                    aria-pressed={sel.domain === d.key}
                    className={`${cardBase} px-3.5 py-2 text-sm font-medium ${sel.domain === d.key ? selectedCls : unselectedCls}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Size */}
          <fieldset>
            <legend className="text-sm font-semibold text-white mb-3">
              3. Rough size <span className="text-gray-500 font-normal">({currentType?.unit})</span>
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {config.sizes.map((sz) => (
                <button
                  key={sz.key}
                  type="button"
                  onClick={() => setSel((s) => ({ ...s, size: sz.key }))}
                  aria-pressed={sel.size === sz.key}
                  className={`${cardBase} p-3 ${sel.size === sz.key ? selectedCls : unselectedCls}`}
                >
                  <span className="block text-sm font-semibold">{sz.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {sz.hint} {currentType?.unit}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Features */}
          {config.features.length > 0 && (
            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">
                4. Features <span className="text-gray-500 font-normal">(optional)</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.features.map((f) => {
                  const on = sel.features.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggle('features', f.id)}
                      aria-pressed={on}
                      className={`${cardBase} flex items-center gap-3 p-3 ${on ? selectedCls : unselectedCls}`}
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
          )}

          {/* Design + Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">5. Design level</legend>
              <div className="space-y-2.5">
                {config.designLevels.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSel((s) => ({ ...s, design: d.key }))}
                    aria-pressed={sel.design === d.key}
                    className={`${cardBase} w-full flex items-center justify-between p-3 ${sel.design === d.key ? selectedCls : unselectedCls}`}
                  >
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="text-xs text-gray-400">{d.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-white mb-3">6. Timeline</legend>
              <div className="space-y-2.5">
                {(['standard', 'rush'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSel((s) => ({ ...s, timeline: k }))}
                    aria-pressed={sel.timeline === k}
                    className={`${cardBase} w-full flex items-center justify-between p-3 ${sel.timeline === k ? selectedCls : unselectedCls}`}
                  >
                    <span className="text-sm font-semibold capitalize">{k}</span>
                    <span className="text-xs text-gray-400">{k === 'rush' ? 'Priority · faster' : 'Normal pace'}</span>
                  </button>
                ))}
              </div>
              {config.growth.length > 0 && (
                <div className="mt-4">
                  <span className="text-sm font-semibold text-white">Growth add-ons</span>
                  <div className="mt-2.5 space-y-2.5">
                    {config.growth.map((g) => {
                      const on = sel.growth.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggle('growth', g.id)}
                          aria-pressed={on}
                          className={`${cardBase} w-full flex items-start gap-3 p-3 ${on ? selectedCls : unselectedCls}`}
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
              )}
            </fieldset>
          </div>
        </div>

        {/* ---- Result (sticky) ---- */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-purple/20 to-white/[0.02] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-wider text-brand-purple-light">Estimated investment</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-white leading-tight">
              {formatMoney(region, result.costMin)}
              <span className="text-gray-500 font-normal"> – </span>
              {formatMoney(region, result.costMax)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {region.currencyCode} · ballpark for {currentType?.label.toLowerCase()}
            </p>

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
              onClick={() => setSel(defaultSelection(config))}
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
