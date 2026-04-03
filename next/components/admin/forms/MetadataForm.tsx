// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { FileCog, Save } from 'lucide-react';
import { getSiteMeta, updateSiteMeta } from '@/lib/api';
import type { SiteMetadata } from '@/types';

export default function MetadataForm() {
  const [meta, setMeta] = useState<SiteMetadata | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { (async () => setMeta(await getSiteMeta()))(); }, []);

  const set = (patch: Partial<SiteMetadata>) => setMeta(prev => prev ? ({ ...prev, ...patch } as SiteMetadata) : prev);

  const save = async () => {
    if (!meta) return;
    setSaving(true); setMsg(null);
    try {
      await updateSiteMeta(meta);
      setMsg('Metadata saved');
    } finally { setSaving(false); }
  };

  if (!meta) return <div className="text-gray-400">Loading site metadata…</div>;

  // Helper to render input for any field
  const renderField = (key: string, value: any) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div key={key} className="mb-4">
          <label className="admin-label">{key}</label>
          <input
            className="admin-input"
            value={value}
            onChange={e => set({ [key]: e.target.value })}
            placeholder={key}
          />
        </div>
      );
    }
    // For arrays, show count and JSON
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-4">
          <label className="admin-label">{key} (array)</label>
          <textarea
            className="admin-textarea"
            value={JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                set({ [key]: JSON.parse(e.target.value) });
              } catch {}
            }}
            placeholder={key}
          />
        </div>
      );
    }
    // For objects, show JSON
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="mb-4">
          <label className="admin-label">{key} (object)</label>
          <textarea
            className="admin-textarea"
            value={JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                set({ [key]: JSON.parse(e.target.value) });
              } catch {}
            }}
            placeholder={key}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2"><FileCog size={20}/> Site Metadata</h3>
          <p className="text-gray-400 text-sm mt-1">Edit all metadata fields dynamically.</p>
        </div>
        <button disabled={saving} onClick={save} className="admin-button-primary flex items-center gap-2"><Save size={18} /> {saving ? 'Saving…' : 'Save'}</button>
      </div>
      <div className="admin-card">
        {Object.entries(meta).map(([key, value]) => renderField(key, value))}
      </div>
      {msg && <div className="text-emerald-400 text-sm">{msg}</div>}
    </div>
  );
}
