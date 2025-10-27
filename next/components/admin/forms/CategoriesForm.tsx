// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { getCategories, updateCategories, getProjectsData, updateProjects } from '@/lib/api';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Info, RefreshCcw } from 'lucide-react';

type CatRow = { id: string; name: string; original: string };

function uid() { return Math.random().toString(36).slice(2, 10); }

const CategoriesForm: React.FC = () => {
  const [rows, setRows] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setRows((cats || []).map((c) => ({ id: uid(), name: c, original: c })));
      } finally { setLoading(false); }
    })();
  }, []);

  const renameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const from = (r.original || '').trim();
      const to = (r.name || '').trim();
      if (from && to && from !== to) map.set(from, to);
    }
    return map;
  }, [rows]);

  const currentList = useMemo(() => Array.from(new Set(rows.map(r => r.name.trim()).filter(Boolean))), [rows]);

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

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      // 1) Save ordered categories
      await updateCategories(currentList);

      // 2) Update projects to reflect renames and deletions
      const projects = await getProjectsData();
      const allowed = new Set(currentList);
      const next = projects.map(p => {
        const cats = (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : [])).map(c => renameMap.get(c) || c).filter(c => allowed.has(c));
        const primary = cats[0] || (allowed.has(p.category) ? p.category : (currentList[0] || ''));
        return { ...p, categories: cats, category: primary } as any;
      });
      await updateProjects(next as any);

      setRows(currentList.map(c => ({ id: uid(), name: c, original: c })));
      setMsg('Categories updated and projects synced');
    } catch (e) {
      console.error(e);
      setMsg('Failed to save categories');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading categories…</div></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Categories</h3>
          <p className="text-gray-400 text-sm mt-1">Rename, delete, or reorder categories used in Recent Works.</p>
        </div>
        <button className="admin-button-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="admin-card text-gray-300">
        <div className="flex items-start gap-3">
          <div className="text-electric-blue"><Info size={18} /></div>
          <div className="text-sm">
            <p>Notes:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-400">
              <li>Reordering affects the tab order in Recent Works.</li>
              <li>Renaming will update all projects to the new category name.</li>
              <li>Deleting removes the category from projects; primary category falls back to the first remaining value.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex gap-2">
              <button type="button" className="text-gray-300 hover:text-white" onClick={() => move(i, -1)} title="Move up"><ArrowUp size={16} /></button>
              <button type="button" className="text-gray-300 hover:text-white" onClick={() => move(i, 1)} title="Move down"><ArrowDown size={16} /></button>
            </div>
            <input
              className="admin-input flex-1"
              value={r.name}
              onChange={(e) => {
                const val = e.target.value;
                setRows(prev => prev.map(x => x.id === r.id ? { ...x, name: val } : x));
              }}
              placeholder="Category name"
            />
            {r.original && r.original !== r.name && (
              <span className="text-xs text-gray-500 inline-flex items-center gap-1"><RefreshCcw size={12} /> was “{r.original}”</span>
            )}
            <button type="button" className="text-red-400 hover:text-red-300" onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))} title="Delete"><Trash2 size={16} /></button>
          </div>
        ))}
        <button
          type="button"
          className="admin-button-secondary flex items-center gap-2"
          onClick={() => setRows(prev => [...prev, { id: uid(), name: '', original: '' }])}
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {msg && <div className="text-sm text-emerald-400">{msg}</div>}
    </div>
  );
};

export default CategoriesForm;
