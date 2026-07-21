// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { SEOConfig, SectionKey, SeoMeta } from '@/types';
import { getSEO } from '@/lib/api';
import { FileText, Save, Info } from 'lucide-react';

const sectionLabels: Record<SectionKey, string> = {
  home: 'Home',
  hero: 'Hero',
  about: 'About',
  services: 'Services',
  projects: 'Projects',
  experience: 'Experience',
  process: 'Process',
  education: 'Education',
  skills: 'Skills',
  testimonials: 'Testimonials',
  blogs: 'Blog',
  contact: 'Contact',
};

const SEOForm: React.FC = () => {
  const [seo, setSeo] = useState<SEOConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getSEO();
      setSeo(data);
    })();
  }, []);

  const handleChange = (section: SectionKey, field: keyof SeoMeta, value: string) => {
    setSeo(prev => prev ? { ...prev, [section]: { ...prev[section], [field]: value } } as SEOConfig : prev);
  };


  const handleSave = async () => {
    if (!seo) return;
    setSaving(true);
    setMessage(null);
    try {
      // Save each section's SEO individually
      await Promise.all(
        Object.entries(seo).map(async ([section, meta]) => {
          const res = await fetch(`/api/seo?page=${section}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meta),
          });
          if (!res.ok) throw new Error(`Failed to save SEO for ${section}`);
        })
      );
      setMessage('SEO settings saved');
    } catch (err) {
      setMessage('Error saving SEO: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!seo) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading SEO settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2"><FileText size={20} /> Section SEO</h3>
          <p className="text-gray-400 text-sm mt-1">Meta title, keywords, and description for each section.</p>
        </div>
        <button className="admin-button-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="admin-card text-gray-300">
        <div className="flex items-start gap-3">
          <div className="text-electric-blue"><Info size={18} /></div>
          <div className="text-sm">
            <p>Tips:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-400">
              <li>Meta title: 50–60 characters.</li>
              <li>Meta description: 150–160 characters.</li>
              <li>Meta keywords: comma-separated (optional in modern SEO).</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(sectionLabels) as SectionKey[]).map((key) => {
          const s = (seo[key] || {}) as any;
          return (
          <div className="admin-card" key={key}>
            <h4 className="text-lg font-semibold text-white mb-4">{sectionLabels[key]}</h4>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Meta Title</label>
                <input type="text" className="admin-input" value={s.metaTitle || ''} onChange={(e) => handleChange(key, 'metaTitle', e.target.value)} placeholder="e.g., Projects — Case Studies" />
              </div>
              <div>
                <label className="admin-label">Meta Description</label>
                <textarea rows={3} className="admin-textarea" value={s.metaDescription || ''} onChange={(e) => handleChange(key, 'metaDescription', e.target.value)} placeholder="A concise summary for search engines..." />
              </div>
              <div>
                <label className="admin-label">Meta Keywords</label>
                <input type="text" className="admin-input" value={s.metaKeywords || ''} onChange={(e) => handleChange(key, 'metaKeywords', e.target.value)} placeholder="design, ui, ux, product" />
              </div>

              <div className="pt-3 mt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-3">Social & canonical (optional — defaults to meta values)</p>
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Canonical URL</label>
                    <input type="url" className="admin-input" value={s.canonicalUrl || ''} onChange={(e) => handleChange(key, 'canonicalUrl', e.target.value)} placeholder="https://www.priyeshmishra.com" />
                  </div>
                  <div>
                    <label className="admin-label">OG Title</label>
                    <input type="text" className="admin-input" value={s.ogTitle || ''} onChange={(e) => handleChange(key, 'ogTitle', e.target.value)} placeholder="Leave blank to reuse Meta Title" />
                  </div>
                  <div>
                    <label className="admin-label">OG Description</label>
                    <textarea rows={2} className="admin-textarea" value={s.ogDescription || ''} onChange={(e) => handleChange(key, 'ogDescription', e.target.value)} placeholder="Leave blank to reuse Meta Description" />
                  </div>
                  <div>
                    <label className="admin-label">OG Image URL</label>
                    <input type="text" className="admin-input" value={s.ogImage || ''} onChange={(e) => handleChange(key, 'ogImage', e.target.value)} placeholder="/images/profile.png or https://... (1200x630 recommended)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {message && (
        <div className="text-sm text-emerald-400">{message}</div>
      )}
    </div>
  );
};

export default SEOForm;
