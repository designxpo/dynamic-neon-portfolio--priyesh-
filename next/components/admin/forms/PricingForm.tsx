// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Calculator, Save, Plus, Trash2, RotateCcw, ExternalLink, Info } from 'lucide-react';
import { DEFAULT_PRICING } from '@/lib/estimatorPricing';

const clone = (o) => JSON.parse(JSON.stringify(o));

// Older DB records (created before regions existed) can be missing array fields.
// Backfill them so the editor never renders `undefined.map(...)` and crashes.
const withDefaults = (c) => {
  const cfg = { ...clone(DEFAULT_PRICING), ...(c || {}) };
  // Absent arrays already inherit DEFAULT_PRICING via the spread above; this only
  // repairs null / non-array values (an intentionally-saved [] is preserved).
  for (const k of ['types', 'sizes', 'features', 'designLevels', 'domains', 'growth', 'regions']) {
    if (!Array.isArray(cfg[k])) cfg[k] = clone(DEFAULT_PRICING[k]);
  }
  if (!cfg.defaultRegion) cfg.defaultRegion = 'base';
  if (!cfg.currencySymbol) cfg.currencySymbol = '$';
  if (!cfg.currencyCode) cfg.currencyCode = 'USD';
  return cfg;
};

// --- tiny labeled input helpers ---------------------------------------------
const Txt = ({ label, value, onChange, placeholder, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-[11px] font-medium text-gray-400 mb-1">{label}</span>
    <input
      type="text"
      className="admin-input w-full"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

const Num = ({ label, value, onChange, step = '1', className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-[11px] font-medium text-gray-400 mb-1">{label}</span>
    <input
      type="number"
      step={step}
      className="admin-input w-full"
      value={value ?? 0}
      onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
    />
  </label>
);

// Countries input: edits a comma-separated list but stores an array. Local raw
// state so typing a comma isn't eaten; re-syncs if the array changes externally
// (e.g. Reset to defaults).
const CountriesField = ({ value, onChange, className = '' }) => {
  const [raw, setRaw] = React.useState((value || []).join(', '));
  const norm = (s) => s.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean).join(',');
  React.useEffect(() => {
    if (norm(raw) !== (value || []).join(',')) setRaw((value || []).join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-medium text-gray-400 mb-1">Countries (ISO, comma)</span>
      <input
        type="text"
        className="admin-input w-full"
        value={raw}
        placeholder="IN, US, GB"
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(e.target.value.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean));
        }}
      />
    </label>
  );
};

const Row = ({ children, onRemove }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-wrap gap-3 items-end">
    {children}
    <button
      type="button"
      onClick={onRemove}
      className="ml-auto text-red-400 hover:text-red-300 p-2"
      title="Remove"
      aria-label="Remove row"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const Section = ({ title, hint, onAdd, addLabel, children }) => (
  <div className="admin-card">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      {onAdd && (
        <button type="button" className="admin-button-secondary flex items-center gap-1.5 text-sm" onClick={onAdd}>
          <Plus size={15} /> {addLabel || 'Add'}
        </button>
      )}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const PricingForm: React.FC = () => {
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pricing', { cache: 'no-store' });
        const json = res.ok ? await res.json() : null;
        setCfg(withDefaults(json?.types?.length ? json : clone(DEFAULT_PRICING)));
      } catch {
        setCfg(clone(DEFAULT_PRICING));
      }
    })();
  }, []);

  // generic list helpers
  const update = (patch) => setCfg((p) => ({ ...p, ...patch }));
  const setItem = (list, idx, patch) =>
    setCfg((p) => ({ ...p, [list]: p[list].map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const addItem = (list, tmpl) => setCfg((p) => ({ ...p, [list]: [...p[list], tmpl] }));
  const removeItem = (list, idx) => setCfg((p) => ({ ...p, [list]: p[list].filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err?.error || 'Save failed' });
      } else {
        setMessage({ type: 'ok', text: 'Estimator pricing saved' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error while saving' });
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset all estimator pricing to defaults? This only changes the form — you still need to Save.')) return;
    setCfg(clone(DEFAULT_PRICING));
    setMessage({ type: 'ok', text: 'Reset to defaults — remember to Save.' });
  };

  if (!cfg) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading estimator pricing…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator size={20} /> Cost Estimator
          </h3>
          <p className="text-gray-400 text-sm mt-1">Pricing behind the public Project Cost Estimator tool.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/tools/project-cost-estimator"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-button-secondary flex items-center gap-1.5 text-sm"
          >
            <ExternalLink size={15} /> Preview
          </a>
          <button type="button" className="admin-button-secondary flex items-center gap-1.5 text-sm" onClick={resetDefaults}>
            <RotateCcw size={15} /> Reset
          </button>
          <button className="admin-button-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-card text-sm ${message.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
          {message.text}
        </div>
      )}

      <div className="admin-card text-gray-300">
        <div className="flex items-start gap-3">
          <div className="text-electric-blue"><Info size={18} /></div>
          <div className="text-sm text-gray-400">
            How the estimate is computed: <code className="text-gray-300">base × size × design</code>, plus each selected
            feature and growth add-on, then the rush multiplier. <strong className="text-gray-300">Cost</strong> values are in the
            base currency below and auto-convert per visitor region; <strong className="text-gray-300">size</strong> and <strong className="text-gray-300">design</strong> are multipliers.
          </div>
        </div>
      </div>

      {/* Base currency + rush */}
      <Section title="Base currency & timeline" hint="The base currency all costs below are entered in, plus the rush (priority) multipliers. Regional currencies convert from this.">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-wrap gap-3 items-end">
          <Txt label="Base symbol" value={cfg.currencySymbol} onChange={(v) => update({ currencySymbol: v })} className="w-24" />
          <Txt label="Base code" value={cfg.currencyCode} onChange={(v) => update({ currencyCode: v })} className="w-28" />
          <Num label="Rush cost ×" value={cfg.rushCostMult} step="0.05" onChange={(v) => update({ rushCostMult: v })} className="w-28" />
          <Num label="Rush weeks ×" value={cfg.rushWeeksMult} step="0.05" onChange={(v) => update({ rushWeeksMult: v })} className="w-28" />
        </div>
      </Section>

      {/* Regions & currencies */}
      <Section
        title="Regions & currencies"
        hint="Show local currency + price by visitor country (auto-detected on Vercel). Multiplier converts a base cost into this region; Round to snaps the shown amount (e.g. 1000 for ₹). Countries = ISO codes, comma-separated."
        addLabel="Add region"
        onAdd={() => addItem('regions', { code: '', label: '', currencySymbol: '$', currencyCode: '', countries: [], multiplier: 1, roundTo: 100 })}
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-wrap gap-3 items-end mb-1">
          <label className="block">
            <span className="block text-[11px] font-medium text-gray-400 mb-1">Default region (country unknown)</span>
            <select
              className="admin-input"
              value={cfg.defaultRegion || 'base'}
              onChange={(e) => update({ defaultRegion: e.target.value })}
            >
              <option value="base">Base ({cfg.currencyCode || 'USD'})</option>
              {cfg.regions.map((r, i) => (
                <option key={i} value={r.code}>{(r.code || '??') + (r.label ? ' · ' + r.label : '')}</option>
              ))}
            </select>
          </label>
          <p className="text-xs text-gray-500 max-w-md">
            Visitors from a country listed in a region see that currency automatically; everyone else sees the default.
          </p>
        </div>
        {cfg.regions.map((r, i) => (
          <Row key={i} onRemove={() => removeItem('regions', i)}>
            <Txt label="Code" value={r.code} onChange={(v) => setItem('regions', i, { code: v })} className="w-20" />
            <Txt label="Label" value={r.label} onChange={(v) => setItem('regions', i, { label: v })} className="w-32" />
            <Txt label="Symbol" value={r.currencySymbol} onChange={(v) => setItem('regions', i, { currencySymbol: v })} className="w-20" />
            <Txt label="Currency (ISO)" value={r.currencyCode} onChange={(v) => setItem('regions', i, { currencyCode: v })} className="w-24" />
            <CountriesField value={r.countries} onChange={(arr) => setItem('regions', i, { countries: arr })} className="w-48" />
            <Num label="Multiplier ×" value={r.multiplier} step="0.01" onChange={(v) => setItem('regions', i, { multiplier: v })} className="w-24" />
            <Num label="Round to" value={r.roundTo} step="1" onChange={(v) => setItem('regions', i, { roundTo: v })} className="w-24" />
          </Row>
        ))}
      </Section>

      {/* Project types */}
      <Section
        title="Project types"
        hint="Base cost range and timeline for each type of build."
        addLabel="Add type"
        onAdd={() => addItem('types', { key: 'new-type', label: 'New Type', blurb: '', base: { min: 1000, max: 3000 }, weeks: { min: 2, max: 4 }, unit: 'pages' })}
      >
        {cfg.types.map((t, i) => (
          <Row key={i} onRemove={() => removeItem('types', i)}>
            <Txt label="Key" value={t.key} onChange={(v) => setItem('types', i, { key: v })} className="w-28" />
            <Txt label="Label" value={t.label} onChange={(v) => setItem('types', i, { label: v })} className="w-36" />
            <Txt label="Blurb" value={t.blurb} onChange={(v) => setItem('types', i, { blurb: v })} className="w-48" />
            <Txt label="Unit" value={t.unit} onChange={(v) => setItem('types', i, { unit: v })} className="w-24" />
            <Num label="Base min" value={t.base?.min} step="100" onChange={(v) => setItem('types', i, { base: { ...t.base, min: v } })} className="w-24" />
            <Num label="Base max" value={t.base?.max} step="100" onChange={(v) => setItem('types', i, { base: { ...t.base, max: v } })} className="w-24" />
            <Num label="Weeks min" value={t.weeks?.min} onChange={(v) => setItem('types', i, { weeks: { ...t.weeks, min: v } })} className="w-20" />
            <Num label="Weeks max" value={t.weeks?.max} onChange={(v) => setItem('types', i, { weeks: { ...t.weeks, max: v } })} className="w-20" />
          </Row>
        ))}
      </Section>

      {/* Sizes */}
      <Section
        title="Size tiers"
        hint="Cost and timeline multipliers applied on top of the base."
        addLabel="Add size"
        onAdd={() => addItem('sizes', { key: 'new-size', label: 'New', hint: '', cost: 1, weeks: 1 })}
      >
        {cfg.sizes.map((s, i) => (
          <Row key={i} onRemove={() => removeItem('sizes', i)}>
            <Txt label="Key" value={s.key} onChange={(v) => setItem('sizes', i, { key: v })} className="w-28" />
            <Txt label="Label" value={s.label} onChange={(v) => setItem('sizes', i, { label: v })} className="w-32" />
            <Txt label="Hint (e.g. 6–15)" value={s.hint} onChange={(v) => setItem('sizes', i, { hint: v })} className="w-32" />
            <Num label="Cost ×" value={s.cost} step="0.1" onChange={(v) => setItem('sizes', i, { cost: v })} className="w-24" />
            <Num label="Weeks ×" value={s.weeks} step="0.1" onChange={(v) => setItem('sizes', i, { weeks: v })} className="w-24" />
          </Row>
        ))}
      </Section>

      {/* Features */}
      <Section
        title="Features (flat add-ons)"
        hint="Each adds a cost range and weeks when selected."
        addLabel="Add feature"
        onAdd={() => addItem('features', { id: 'new-feature', label: 'New Feature', cost: { min: 500, max: 1500 }, weeks: 1 })}
      >
        {cfg.features.map((f, i) => (
          <Row key={i} onRemove={() => removeItem('features', i)}>
            <Txt label="ID" value={f.id} onChange={(v) => setItem('features', i, { id: v })} className="w-32" />
            <Txt label="Label" value={f.label} onChange={(v) => setItem('features', i, { label: v })} className="w-56" />
            <Num label="Cost min" value={f.cost?.min} step="100" onChange={(v) => setItem('features', i, { cost: { ...f.cost, min: v } })} className="w-24" />
            <Num label="Cost max" value={f.cost?.max} step="100" onChange={(v) => setItem('features', i, { cost: { ...f.cost, max: v } })} className="w-24" />
            <Num label="Weeks" value={f.weeks} step="0.5" onChange={(v) => setItem('features', i, { weeks: v })} className="w-20" />
          </Row>
        ))}
      </Section>

      {/* Design levels */}
      <Section
        title="Design levels"
        hint="Multiplier applied to the base cost."
        addLabel="Add level"
        onAdd={() => addItem('designLevels', { key: 'new-level', label: 'New', hint: '', mult: 1 })}
      >
        {cfg.designLevels.map((d, i) => (
          <Row key={i} onRemove={() => removeItem('designLevels', i)}>
            <Txt label="Key" value={d.key} onChange={(v) => setItem('designLevels', i, { key: v })} className="w-28" />
            <Txt label="Label" value={d.label} onChange={(v) => setItem('designLevels', i, { label: v })} className="w-36" />
            <Txt label="Hint" value={d.hint} onChange={(v) => setItem('designLevels', i, { hint: v })} className="w-40" />
            <Num label="Cost ×" value={d.mult} step="0.05" onChange={(v) => setItem('designLevels', i, { mult: v })} className="w-24" />
          </Row>
        ))}
      </Section>

      {/* Industry / domain */}
      <Section
        title="Industry / domain multipliers"
        hint="Single-select cost multiplier by product domain (e-commerce, SaaS, fintech, …). Applied to the base like design level."
        addLabel="Add domain"
        onAdd={() => addItem('domains', { key: 'new-domain', label: 'New Domain', mult: 1 })}
      >
        {(cfg.domains || []).map((d, i) => (
          <Row key={i} onRemove={() => removeItem('domains', i)}>
            <Txt label="Key" value={d.key} onChange={(v) => setItem('domains', i, { key: v })} className="w-32" />
            <Txt label="Label" value={d.label} onChange={(v) => setItem('domains', i, { label: v })} className="w-48" />
            <Num label="Cost ×" value={d.mult} step="0.05" onChange={(v) => setItem('domains', i, { mult: v })} className="w-24" />
          </Row>
        ))}
      </Section>

      {/* Growth add-ons */}
      <Section
        title="Growth add-ons (SEO / AEO / GEO)"
        hint="Optional flat add-ons for discoverability services."
        addLabel="Add add-on"
        onAdd={() => addItem('growth', { id: 'new-addon', label: 'New Add-on', hint: '', cost: { min: 800, max: 2000 }, weeks: 1 })}
      >
        {cfg.growth.map((g, i) => (
          <Row key={i} onRemove={() => removeItem('growth', i)}>
            <Txt label="ID" value={g.id} onChange={(v) => setItem('growth', i, { id: v })} className="w-32" />
            <Txt label="Label" value={g.label} onChange={(v) => setItem('growth', i, { label: v })} className="w-44" />
            <Txt label="Hint" value={g.hint} onChange={(v) => setItem('growth', i, { hint: v })} className="w-56" />
            <Num label="Cost min" value={g.cost?.min} step="100" onChange={(v) => setItem('growth', i, { cost: { ...g.cost, min: v } })} className="w-24" />
            <Num label="Cost max" value={g.cost?.max} step="100" onChange={(v) => setItem('growth', i, { cost: { ...g.cost, max: v } })} className="w-24" />
            <Num label="Weeks" value={g.weeks} step="0.5" onChange={(v) => setItem('growth', i, { weeks: v })} className="w-20" />
          </Row>
        ))}
      </Section>

      <div className="flex justify-end">
        <button className="admin-button-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default PricingForm;
