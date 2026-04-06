// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { MessageCircle, Save, Info, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { getChatbotSettings, updateChatbotSettings } from '@/lib/api';
import type { ChatbotSettings } from '@/types';

const ChatbotForm: React.FC = () => {
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getChatbotSettings();
      setSettings(s);
    })();
  }, []);

  const handleChange = (patch: Partial<ChatbotSettings>) => {
    setSettings(prev => prev ? { ...prev, ...patch } as ChatbotSettings : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    // Ensure required fields and correct structure
    // Convert placeholders object to array of {key, value}
    let placeholdersArr: { key: string; value: string }[] = [];
    if (settings.placeholders && typeof settings.placeholders === 'object' && !Array.isArray(settings.placeholders)) {
      placeholdersArr = Object.entries(settings.placeholders).map(([key, value]) => ({ key, value }));
    } else if (Array.isArray(settings.placeholders)) {
      placeholdersArr = settings.placeholders;
    }
    // Use customQA directly
    const customQA = Array.isArray(settings.customQA)
      ? settings.customQA.filter(q => q && typeof q === 'object' && q.question && q.reply)
      : [];
    const payload = {
      enabled: settings.enabled ?? true,
      name: settings.name ?? '',
      initialGreeting: settings.initialGreeting ?? '',
      bookingUrl: settings.bookingUrl ?? '',
      bookingDescription: settings.bookingDescription ?? '',
      showBookingQuickReply: settings.showBookingQuickReply ?? true,
      placeholders: placeholdersArr,
  customQA,
    };
    console.log('[ChatbotForm] Saving payload:', payload);
    try {
      await updateChatbotSettings(payload);
      const updated = await getChatbotSettings();
      setSettings(updated);
      setMessage('Chatbot settings saved');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading chatbot settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2"><MessageCircle size={20} /> Chatbot</h3>
          <p className="text-gray-400 text-sm mt-1">Control the assistant name, greeting, and booking quick action.</p>
        </div>
        <button className="admin-button-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="admin-card text-gray-300">
        <div className="flex items-start gap-3">
          <div className="text-electric-blue"><Info size={18} /></div>
          <div className="text-sm">
            <p>Notes:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-400">
              <li>API keys and provider configuration remain in environment variables for security.</li>
              <li>Use the booking fields to update the quick reply and fallback booking response.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Assistant</h4>
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="accent-electric-blue" checked={settings.enabled} onChange={(e) => handleChange({ enabled: e.target.checked })} />
              Enabled
            </label>
          </div>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Name</label>
              <input type="text" className="admin-input" value={settings.name} onChange={(e) => handleChange({ name: e.target.value })} placeholder="e.g., Prism" />
            </div>
            <div>
              <label className="admin-label">Initial Greeting</label>
              <textarea rows={3} className="admin-textarea" value={settings.initialGreeting} onChange={(e) => handleChange({ initialGreeting: e.target.value })} placeholder="Welcome message shown when chat opens..." />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h4 className="text-lg font-semibold text-white mb-4">Booking Quick Action</h4>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Booking URL</label>
              <input type="url" className="admin-input" value={settings.bookingUrl || ''} onChange={(e) => handleChange({ bookingUrl: e.target.value })} placeholder="https://calendar.app.google/..." />
            </div>
            <div>
              <label className="admin-label">Booking Description</label>
              <textarea rows={4} className="admin-textarea" value={settings.bookingDescription || ''} onChange={(e) => handleChange({ bookingDescription: e.target.value })} placeholder="Short description used in booking responses..." />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="accent-electric-blue" checked={!!settings.showBookingQuickReply} onChange={(e) => handleChange({ showBookingQuickReply: e.target.checked })} />
              Show quick reply button in chat
            </label>
          </div>
        </div>
      </div>

      {/* Custom Placeholders */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-white">Custom Placeholders</h4>
          <button
            type="button"
            className="admin-button-secondary flex items-center gap-2"
            onClick={() => {
              const next = { ...(settings.placeholders || {}) } as Record<string, string>;
              const base = 'placeholder';
              let k = base;
              let i = 1;
              while (next[k] !== undefined) { k = `${base}_${i++}`; }
              next[k] = '';
              handleChange({ placeholders: next });
            }}
          >
            <Plus size={16} /> Add Placeholder
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-3">Define reusable variables to use inside replies like {'{company}'} or {'{cta}'}. Avoid spaces in keys.</p>
        <div className="space-y-3">
          {Object.entries(settings.placeholders || {}).length === 0 && (
            <div className="text-gray-400 text-sm">No placeholders yet. Click “Add Placeholder”.</div>
          )}
          {Object.entries(settings.placeholders || {}).map(([key, val]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-[220px,1fr,auto] gap-3 items-end">
              <div>
                <label className="admin-label">Key</label>
                <input
                  type="text"
                  className="admin-input"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value.replace(/\s+/g, '_');
                    if (!newKey) return;
                    const map = { ...(settings.placeholders || {}) } as Record<string, string>;
                    const existingVal = map[key];
                    delete map[key];
                    // if key collision, append index
                    let finalKey = newKey;
                    let idx = 1;
                    while (map[finalKey] !== undefined) { finalKey = `${newKey}_${idx++}`; }
                    map[finalKey] = existingVal;
                    handleChange({ placeholders: map });
                  }}
                  placeholder="company"
                />
              </div>
              <div>
                <label className="admin-label">Value</label>
                <input
                  type="text"
                  className="admin-input"
                  value={val}
                  onChange={(e) => {
                    const map = { ...(settings.placeholders || {}) } as Record<string, string>;
                    map[key] = e.target.value;
                    handleChange({ placeholders: map });
                  }}
                  placeholder="Priyesh Studio"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-red-400 hover:text-red-300"
                  title="Delete placeholder"
                  onClick={() => {
                    const map = { ...(settings.placeholders || {}) } as Record<string, string>;
                    delete map[key];
                    handleChange({ placeholders: map });
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Built‑ins you can always use: {'{name}'}, {'{date}'}, {'{email}'}, {'{phone}'}, {'{path}'}, {'{bookingUrl}'}, {'{contactLink}'}.
        </div>
      </div>

      {/* Custom Q&A Rules */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Custom Q&A Rules</h4>
          <button
            type="button"
            onClick={() => {
              const newRule = { question: '', keywords: [], reply: '', enabled: true, matchMode: 'any' };
              handleChange({ customQA: [...(settings.customQA || []), newRule] });
            }}
            className="admin-button-secondary flex items-center gap-2"
          >
            <Plus size={16} /> Add Rule
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-3">Each rule triggers when the user message contains the question text or any of the keywords. First match wins.</p>

        <div className="space-y-4">
          {(settings.customQA || []).length === 0 && (
            <div className="text-gray-400 text-sm">No rules yet. Click “Add Rule” to create one.</div>
          )}

          {(settings.customQA || []).map((rule, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 p-4 bg-white/5"
              draggable
              onDragStart={(e) => { setDragIndex(idx); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex === null || dragIndex === idx) return;
                const customQA = [...(settings.customQA || [])];
                const [moved] = customQA.splice(dragIndex, 1);
                customQA.splice(idx, 0, moved);
                setDragIndex(null);
                handleChange({ customQA });
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Rule {idx + 1}</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx === 0) return;
                      const customQA = [...(settings.customQA || [])];
                      const [moved] = customQA.splice(idx, 1);
                      customQA.splice(idx - 1, 0, moved);
                      handleChange({ customQA });
                    }}
                    className="text-gray-300 hover:text-white"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const customQA = [...(settings.customQA || [])];
                      if (idx >= customQA.length - 1) return;
                      const [moved] = customQA.splice(idx, 1);
                      customQA.splice(idx + 1, 0, moved);
                      handleChange({ customQA });
                    }}
                    className="text-gray-300 hover:text-white"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" className="accent-electric-blue" checked={rule.enabled !== false}
                      onChange={(e) => {
                        const customQA = [...(settings.customQA || [])];
                        customQA[idx] = { ...rule, enabled: e.target.checked };
                        handleChange({ customQA });
                      }} /> Enabled
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const customQA = [...(settings.customQA || [])];
                      customQA.splice(idx, 1);
                      handleChange({ customQA });
                    }}
                    className="text-red-400 hover:text-red-300"
                    title="Delete rule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Question contains</label>
                  <input type="text" className="admin-input" value={rule.question || ''}
                    onChange={(e) => {
                      const customQA = [...(settings.customQA || [])];
                      customQA[idx] = { ...rule, question: e.target.value };
                      handleChange({ customQA });
                    }}
                    placeholder="e.g., pricing, availability, location" />
                </div>
                <div>
                  <label className="admin-label">Keywords (comma-separated)</label>
                  <input type="text" className="admin-input" value={(rule.keywords || []).join(', ')}
                    onChange={(e) => {
                      const arr = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                      const customQA = [...(settings.customQA || [])];
                      customQA[idx] = { ...rule, keywords: arr };
                      handleChange({ customQA });
                    }}
                    placeholder="design, ui, ux" />
                </div>
                <div>
                  <label className="admin-label">Regex (optional)</label>
                  <input type="text" className="admin-input" value={rule.regex || ''}
                    onChange={(e) => {
                      const customQA = [...(settings.customQA || [])];
                      customQA[idx] = { ...rule, regex: e.target.value };
                      handleChange({ customQA });
                    }}
                    placeholder="e.g., ^(price|pricing)$" />
                </div>
                <div>
                  <label className="admin-label">Match mode</label>
                  <select className="admin-input" value={rule.matchMode || 'any'} onChange={(e) => {
                    const customQA = [...(settings.customQA || [])];
                    customQA[idx] = { ...rule, matchMode: (e.target.value as 'any' | 'all') } as any;
                    handleChange({ customQA });
                  }}>
                    <option value="any">Any keyword</option>
                    <option value="all">All keywords</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" className="accent-electric-blue" checked={!!rule.caseSensitive}
                      onChange={(e) => {
                        const customQA = [...(settings.customQA || [])];
                        customQA[idx] = { ...rule, caseSensitive: e.target.checked };
                        handleChange({ customQA });
                      }} /> Case-sensitive
                  </label>
                </div>
              </div>
              <div className="mt-3">
                <label className="admin-label">Reply</label>
                <textarea rows={3} className="admin-textarea" value={rule.reply}
                  onChange={(e) => {
                    const customQA = [...(settings.customQA || [])];
                    customQA[idx] = { ...rule, reply: e.target.value };
                    handleChange({ customQA });
                  }}
                  placeholder="The message the assistant should send when this rule matches" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className="text-sm text-emerald-400">{message}</div>
      )}
    </div>
  );
};

export default ChatbotForm;
