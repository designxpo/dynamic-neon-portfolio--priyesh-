// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Info, RefreshCcw } from 'lucide-react';

type CatRow = {
  /** Mongo _id once persisted; null while the row is local-only. */
  id: string | null;
  /** Stable React key for this row across renders. */
  localKey: string;
  /** Editable name. */
  name: string;
  /** Last name fetched from the server — used to detect renames. */
  original: string;
};

function uid() { return Math.random().toString(36).slice(2, 10); }

const CategoriesForm: React.FC = () => {
  const [rows, setRows] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const apiBase = '/api/categories';

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase, { cache: 'no-store' });
      const data = await res.json();
      setRows(
        (Array.isArray(data) ? data : []).map((c: any) => ({
          id: c.id,
          localKey: uid(),
          name: c.name || '',
          original: c.name || '',
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const move = (i: number, dir: -1 | 1) => {
    setRows(prev => {
      const arr = [...prev];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      const [m] = arr.splice(i, 1);
      arr.splice(j, 0, m);
      return arr;
    });
  };

  const updateName = (localKey: string, name: string) => {
    setRows(prev => prev.map(x => (x.localKey === localKey ? { ...x, name } : x)));
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { id: null, localKey: uid(), name: '', original: '' },
    ]);
  };

  const handleDelete = async (row: CatRow) => {
    if (!window.confirm('Delete this category? It will also be removed from any projects that use it.')) return;
    if (!row.id) {
      // Local-only row — just drop it.
      setRows(prev => prev.filter(r => r.localKey !== row.localKey));
      return;
    }
    try {
      const res = await fetch(`${apiBase}/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCategories();
      setMsg({ type: 'success', text: 'Category deleted and removed from affected projects.' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete category.' });
    }
  };

  const handleBatchSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const cleaned = rows
        .map((r, i) => ({ ...r, name: r.name.trim(), order: i }))
        .filter(r => r.name.length > 0);

      if (cleaned.length === 0) {
        setMsg({ type: 'error', text: 'At least one category name is required.' });
        return;
      }

      // Detect duplicate names — would silently merge into one tab on the public site.
      const lower = cleaned.map(r => r.name.toLowerCase());
      const dupe = lower.find((n, i) => lower.indexOf(n) !== i);
      if (dupe) {
        setMsg({ type: 'error', text: `Duplicate category name: "${dupe}". Names must be unique.` });
        return;
      }

      // Sequential save so the server-side cascade for renames finishes
      // before the next request reads stale state. (Parallel was fine for
      // creates only, but breaks subtly when multiple renames stack.)
      for (const row of cleaned) {
        if (row.id) {
          const res = await fetch(`${apiBase}/${row.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: row.name, order: row.order }),
          });
          if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
        } else {
          const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: row.name, order: row.order }),
          });
          if (!res.ok) throw new Error(`POST failed: ${res.status}`);
        }
      }

      await fetchCategories();
      setMsg({ type: 'success', text: 'Categories saved. Renames have been applied to existing projects.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error saving categories. Check the server logs.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-400">Loading categories…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Categories</h3>
          <p className="text-gray-400 text-sm mt-1">Rename, delete, or reorder categories used in Recent Works.</p>
        </div>
        <button className="admin-button-primary flex items-center gap-2" onClick={handleBatchSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="admin-card text-gray-300">
        <div className="flex items-start gap-3">
          <div className="text-electric-blue"><Info size={18} /></div>
          <div className="text-sm">
            <p>Notes:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-400">
              <li>Reordering is saved when you click <strong>Save</strong>; tab order in Recent Works follows the order here.</li>
              <li>Renaming updates every project that referenced the old name.</li>
              <li>Deleting strips the category from projects; the legacy primary category falls back to the first remaining tag, or empty.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.localKey} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex gap-2">
              <button type="button" className="text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => move(i, -1)} disabled={i === 0} title="Move up"><ArrowUp size={16} /></button>
              <button type="button" className="text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down"><ArrowDown size={16} /></button>
            </div>
            <input
              className="admin-input flex-1"
              value={r.name}
              onChange={(e) => updateName(r.localKey, e.target.value)}
              placeholder="Category name"
            />
            {r.original && r.original !== r.name && (
              <span className="text-xs text-gray-500 inline-flex items-center gap-1" title={`Was "${r.original}"`}>
                <RefreshCcw size={12} /> renamed
              </span>
            )}
            {!r.id && (
              <span className="text-xs text-emerald-400 inline-flex items-center gap-1" title="Will be created on save">
                <Plus size={12} /> new
              </span>
            )}
            <button type="button" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(r)} title="Delete"><Trash2 size={16} /></button>
          </div>
        ))}
        <button
          type="button"
          className="admin-button-secondary flex items-center gap-2"
          onClick={addRow}
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {msg && (
        <div className={`text-sm ${msg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
};

export default CategoriesForm;
