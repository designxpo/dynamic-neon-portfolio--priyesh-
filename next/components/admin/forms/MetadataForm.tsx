// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { FileCog, Save, Plus, Trash2 } from 'lucide-react';
import { getSiteMeta, updateSiteMeta, convertFileToBase64 } from '@/lib/api';
import type { SiteMetadata } from '@/types';

const TextInput = (props: any) => <input {...props} className={`admin-input ${props.className || ''}`} />;
const TextArea = (props: any) => <textarea {...props} className={`admin-textarea ${props.className || ''}`} />;

export default function MetadataForm() {
  const [meta, setMeta] = useState<SiteMetadata | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { (async () => setMeta(await getSiteMeta()))(); }, []);

  const set = (patch: Partial<SiteMetadata>) => setMeta(prev => prev ? ({ ...prev, ...patch } as SiteMetadata) : prev);

  const setNested = (path: string[], value: any) => {
    setMeta(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      let cursor = next;
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        cursor[k] = { ...(cursor[k] || {}) };
        cursor = cursor[k];
      }
      cursor[path[path.length - 1]] = value;
      return next as SiteMetadata;
    });
  };

  const pushImage = (kind: 'openGraph' | 'twitter') => {
    if (!meta) return;
    if (kind === 'openGraph') {
      const imgs = [...(meta.openGraph?.images || [])];
      imgs.push({ url: '', width: undefined, height: undefined, alt: '' });
      setNested(['openGraph', 'images'], imgs);
    } else {
      const imgs = [...(meta.twitter?.images || [])];
      imgs.push('');
      setNested(['twitter', 'images'], imgs);
    }
  };

  const removeImage = (kind: 'openGraph' | 'twitter', idx: number) => {
    if (!meta) return;
    if (kind === 'openGraph') {
      const imgs = [...(meta.openGraph?.images || [])];
      imgs.splice(idx, 1);
      setNested(['openGraph', 'images'], imgs);
    } else {
      const imgs = [...(meta.twitter?.images || [])];
      imgs.splice(idx, 1);
      setNested(['twitter', 'images'], imgs);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'icon'|'shortcut'|'apple') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToBase64(file);
    setNested(['icons', field], dataUrl);
    e.target.value = '';
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToBase64(file);
    const imgs = [...(meta?.openGraph?.images || [])];
    const curr = imgs[idx] || { url: '', width: undefined, height: undefined, alt: '' };
    imgs[idx] = { ...curr, url: dataUrl };
    setNested(['openGraph','images'], imgs);
    e.target.value = '';
  };

  const handleTwitterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToBase64(file);
    const imgs = [...(meta?.twitter?.images || [])];
    imgs[idx] = dataUrl;
    setNested(['twitter','images'], imgs);
    e.target.value = '';
  };

  const addAuthor = () => {
    const arr = [...(meta?.authors || [])];
    arr.push({ name: '', url: '' });
    set({ authors: arr });
  };

  const removeAuthor = (idx: number) => {
    const arr = [...(meta?.authors || [])];
    arr.splice(idx, 1);
    set({ authors: arr });
  };

  const save = async () => {
    if (!meta) return;
    setSaving(true); setMsg(null);
    try {
      await updateSiteMeta(meta);
      setMsg('Metadata saved');
    } finally { setSaving(false); }
  };

  if (!meta) return <div className="text-gray-400">Loading site metadata…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2"><FileCog size={20}/> Site Metadata</h3>
          <p className="text-gray-400 text-sm mt-1">Edit site-wide SEO, OpenGraph, Twitter, and icons.</p>
        </div>
        <button disabled={saving} onClick={save} className="admin-button-primary flex items-center gap-2"><Save size={18} /> {saving ? 'Saving…' : 'Save'}</button>
      </div>

      {/* Basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card space-y-4">
          <h4 className="text-white font-semibold">Basics</h4>
          <div>
            <label className="admin-label">Title</label>
            <TextInput value={meta.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Site title" />
          </div>
          <div>
            <label className="admin-label">Description</label>
            <TextArea rows={3} value={meta.description || ''} onChange={e => set({ description: e.target.value })} placeholder="Site description" />
          </div>
          <div>
            <label className="admin-label">Keywords</label>
            <TextInput value={meta.keywords || ''} onChange={e => set({ keywords: e.target.value })} placeholder="comma, separated, keywords" />
          </div>
          <div>
            <label className="admin-label">Robots</label>
            <TextInput value={meta.robots || ''} onChange={e => set({ robots: e.target.value })} placeholder="index, follow" />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h4 className="text-white font-semibold">Icons</h4>
          <div>
            <label className="admin-label">Icon</label>
            <div className="flex gap-2 items-center">
              <TextInput value={meta.icons?.icon || ''} onChange={e => setNested(['icons','icon'], e.target.value)} placeholder="/icon.svg or data:image..." />
              <label className="admin-button-secondary cursor-pointer">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleIconUpload(e,'icon')} />
              </label>
            </div>
          </div>
          <div>
            <label className="admin-label">Shortcut</label>
            <div className="flex gap-2 items-center">
              <TextInput value={meta.icons?.shortcut || ''} onChange={e => setNested(['icons','shortcut'], e.target.value)} placeholder="/icon.svg or data:image..." />
              <label className="admin-button-secondary cursor-pointer">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleIconUpload(e,'shortcut')} />
              </label>
            </div>
          </div>
          <div>
            <label className="admin-label">Apple</label>
            <div className="flex gap-2 items-center">
              <TextInput value={meta.icons?.apple || ''} onChange={e => setNested(['icons','apple'], e.target.value)} placeholder="/apple-touch-icon.png or data:image..." />
              <label className="admin-button-secondary cursor-pointer">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleIconUpload(e,'apple')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Authors */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Authors</h4>
          <button type="button" className="admin-button-secondary flex items-center gap-2" onClick={addAuthor}><Plus size={16}/> Add Author</button>
        </div>
        <div className="space-y-3">
          {(meta.authors || []).length === 0 && <div className="text-gray-400 text-sm">No authors</div>}
          {(meta.authors || []).map((a, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="admin-label">Name</label>
                <TextInput value={a.name || ''} onChange={e => { const arr=[...(meta.authors||[])]; arr[i]={...a,name:e.target.value}; set({authors:arr}); }} />
              </div>
              <div>
                <label className="admin-label">URL</label>
                <TextInput value={a.url || ''} onChange={e => { const arr=[...(meta.authors||[])]; arr[i]={...a,url:e.target.value}; set({authors:arr}); }} />
              </div>
              <button className="text-red-400 hover:text-red-300 inline-flex items-center gap-1" onClick={()=>removeAuthor(i)}><Trash2 size={16}/> Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* OpenGraph */}
      <div className="admin-card space-y-4">
        <h4 className="text-white font-semibold">Open Graph</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Title</label>
            <TextInput value={meta.openGraph?.title || ''} onChange={e => setNested(['openGraph','title'], e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Site Name</label>
            <TextInput value={meta.openGraph?.siteName || ''} onChange={e => setNested(['openGraph','siteName'], e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Description</label>
            <TextArea rows={3} value={meta.openGraph?.description || ''} onChange={e => setNested(['openGraph','description'], e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Type</label>
            <TextInput value={meta.openGraph?.type || 'website'} onChange={e => setNested(['openGraph','type'], e.target.value)} />
          </div>
          <div>
            <label className="admin-label">URL</label>
            <TextInput value={meta.openGraph?.url || ''} onChange={e => setNested(['openGraph','url'], e.target.value)} placeholder="https://your-domain" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/90">Images</div>
            <button type="button" onClick={()=>pushImage('openGraph')} className="admin-button-secondary flex items-center gap-2"><Plus size={16}/> Add Image</button>
          </div>
          <div className="space-y-3">
            {(meta.openGraph?.images || []).length === 0 && <div className="text-gray-400 text-sm">No images</div>}
            {(meta.openGraph?.images || []).map((img, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="admin-label">URL</label>
                  <div className="flex gap-2 items-center">
                    <TextInput value={img.url || ''} onChange={e => { const imgs=[...(meta.openGraph?.images||[])]; imgs[i]={...img,url:e.target.value}; setNested(['openGraph','images'], imgs); }} placeholder="https://... or data:image..." />
                    <label className="admin-button-secondary cursor-pointer">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleOgImageUpload(e,i)} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="admin-label">Width</label>
                  <TextInput type="number" value={img.width || ''} onChange={e => { const imgs=[...(meta.openGraph?.images||[])]; imgs[i]={...img,width:e.target.value?Number(e.target.value):undefined}; setNested(['openGraph','images'], imgs); }} />
                </div>
                <div>
                  <label className="admin-label">Height</label>
                  <TextInput type="number" value={img.height || ''} onChange={e => { const imgs=[...(meta.openGraph?.images||[])]; imgs[i]={...img,height:e.target.value?Number(e.target.value):undefined}; setNested(['openGraph','images'], imgs); }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="admin-label">Alt</label>
                    <TextInput value={img.alt || ''} onChange={e => { const imgs=[...(meta.openGraph?.images||[])]; imgs[i]={...img,alt:e.target.value}; setNested(['openGraph','images'], imgs); }} />
                  </div>
                  <button className="text-red-400 hover:text-red-300 inline-flex items-center gap-1" onClick={()=>removeImage('openGraph', i)}><Trash2 size={16}/> Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Twitter */}
      <div className="admin-card space-y-4">
        <h4 className="text-white font-semibold">Twitter</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Card</label>
            <select className="admin-input" value={meta.twitter?.card || 'summary_large_image'} onChange={e => setNested(['twitter','card'], e.target.value)}>
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Title</label>
            <TextInput value={meta.twitter?.title || ''} onChange={e => setNested(['twitter','title'], e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Description</label>
            <TextArea rows={3} value={meta.twitter?.description || ''} onChange={e => setNested(['twitter','description'], e.target.value)} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/90">Images</div>
            <button type="button" onClick={()=>pushImage('twitter')} className="admin-button-secondary flex items-center gap-2"><Plus size={16}/> Add Image</button>
          </div>
          <div className="space-y-3">
            {(meta.twitter?.images || []).length === 0 && <div className="text-gray-400 text-sm">No images</div>}
            {(meta.twitter?.images || []).map((url, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="admin-label">URL</label>
                  <div className="flex gap-2 items-center">
                    <TextInput value={url || ''} onChange={e => { const imgs=[...(meta.twitter?.images||[])]; imgs[i]=e.target.value; setNested(['twitter','images'], imgs); }} placeholder="https://... or data:image..." />
                    <label className="admin-button-secondary cursor-pointer">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleTwitterImageUpload(e,i)} />
                    </label>
                  </div>
                </div>
                <button className="text-red-400 hover:text-red-300 inline-flex items-center gap-1" onClick={()=>removeImage('twitter', i)}><Trash2 size={16}/> Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {msg && <div className="text-emerald-400 text-sm">{msg}</div>}
    </div>
  );
}
