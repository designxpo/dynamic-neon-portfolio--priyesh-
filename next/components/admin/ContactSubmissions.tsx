// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Section from '@/components/Section';
import { Mail, Phone, Calendar, MessageSquare, Inbox, Trash2, Download, StickyNote } from 'lucide-react';
import { getApiBase } from '@/lib/apiBase';
import Modal from '@/components/admin/common/Modal';

type Status = 'new' | 'contacted' | 'in-progress' | 'won' | 'lost';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  submittedAt: string;
  status?: Status;
  notes?: string;
}

const STATUS_OPTIONS: { value: Status; label: string; pill: string }[] = [
  { value: 'new',         label: 'New',         pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
  { value: 'contacted',   label: 'Contacted',   pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  { value: 'in-progress', label: 'In Progress', pill: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' },
  { value: 'won',         label: 'Won',         pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' },
  { value: 'lost',        label: 'Lost',        pill: 'bg-rose-500/15 text-rose-300 border border-rose-500/30' },
];

const pillFor = (s: Status = 'new') =>
  STATUS_OPTIONS.find(o => o.value === s)?.pill || STATUS_OPTIONS[0].pill;

const ContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<ContactSubmission | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    fetchSubmissions(page, pageSize, statusFilter);
  }, [page, pageSize, statusFilter]);

  const apiBase = () => (getApiBase() || '').replace(/\/+$/, '');

  const fetchSubmissions = async (pageNum: number, size: number, status: Status | '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum), limit: String(size) });
      if (status) params.set('status', status);
      const response = await fetch(`${apiBase()}/api/contacts?${params.toString()}`);
      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const errPayload = ct.includes('application/json') ? await response.json().catch(() => null) : null;
        setError(errPayload?.error || `Failed to fetch submissions (HTTP ${response.status})`);
        return;
      }
      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setSubmissions(items);
      setTotal(data?.total ?? items.length);
      setError(null);
    } catch (err) {
      setError('Error fetching submissions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  const updateSubmission = async (id: string, patch: Partial<ContactSubmission>) => {
    setSavingId(id);
    try {
      const res = await fetch(`${apiBase()}/api/contacts?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmissions(prev => prev.map(s => (s._id === id ? { ...s, ...patch } : s)));
    } catch (e) {
      console.error('Update failed', e);
      alert('Failed to update submission.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!id) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${apiBase()}/api/contacts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        alert(`Failed to delete (HTTP ${res.status})`);
        return;
      }
      setSubmissions(prev => prev.filter(s => s._id !== id));
      setConfirmOpen(false);
      setTarget(null);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete submission.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    window.open(`${apiBase()}/api/contacts?format=csv`, '_blank');
  };

  const openNotes = (s: ContactSubmission) => {
    setTarget(s);
    setNotesDraft(s.notes || '');
    setNotesOpen(true);
  };

  const saveNotes = async () => {
    if (!target) return;
    await updateSubmission(target._id, { notes: notesDraft });
    setNotesOpen(false);
    setTarget(null);
  };

  if (loading && submissions.length === 0) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading submissions...</div></div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="flex items-center justify-center py-12"><div className="text-red-400">{error}</div></div>
      </Section>
    );
  }

  return (
    <Section title="Contact Submissions" id="admin-contacts">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header + toolbar */}
        <div className="admin-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
              <Inbox size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Contact Submissions</h3>
              <p className="text-gray-400 text-sm">Total: {total} submission{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value as Status | ''); }}
              title="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="admin-button flex items-center gap-2" onClick={exportCSV} title="Export all as CSV">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Submissions list */}
        {submissions.length === 0 ? (
          <div className="admin-card text-center py-12">
            <Inbox size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No contact submissions match this filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {submissions.map((s) => {
                const status = s.status || 'new';
                const isSaving = savingId === s._id;
                return (
                  <div key={s._id} className="admin-card hover:border-electric-blue/30 group">
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h4 className="font-semibold text-lg text-white truncate">{s.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${pillFor(status)}`}>
                            {STATUS_OPTIONS.find(o => o.value === status)?.label}
                          </span>
                          {s.notes && (
                            <span title="Has notes" className="text-xs text-gray-400 flex items-center gap-1">
                              <StickyNote size={12} /> notes
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-gray-300 text-sm hover:text-electric-blue truncate">
                            <Mail size={14} className="text-electric-blue flex-shrink-0" />
                            <span className="truncate">{s.email}</span>
                          </a>
                          <a href={`tel:${s.contactNumber}`} className="flex items-center gap-2 text-gray-300 text-sm hover:text-electric-blue">
                            <Phone size={14} className="text-electric-blue" />
                            <span>{s.contactNumber}</span>
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(s.submittedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="admin-input py-1 text-xs"
                            value={status}
                            disabled={isSaving}
                            onChange={(e) => updateSubmission(s._id, { status: e.target.value as Status })}
                            title="Change status"
                          >
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <button
                            className="admin-button flex items-center gap-1 text-xs"
                            onClick={() => openNotes(s)}
                            title="Add / edit notes"
                          >
                            <StickyNote size={14} /> Notes
                          </button>
                          <button
                            className="admin-button-danger flex items-center gap-1 text-xs"
                            onClick={() => { setTarget(s); setConfirmOpen(true); }}
                            disabled={deletingId === s._id}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 p-4">
                      <div className="flex items-center gap-2 text-sm text-electric-blue mb-2">
                        <MessageSquare size={14} />
                        <span className="font-medium">Message</span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{s.message}</p>
                    </div>
                    {s.notes && (
                      <div className="mt-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3">
                        <div className="flex items-center gap-2 text-xs text-yellow-300 mb-1">
                          <StickyNote size={12} /> Private notes
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap text-sm">{s.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="admin-card flex items-center justify-between gap-3">
              <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <button className="admin-button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                <button className="admin-button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
                <select
                  className="admin-input ml-2"
                  value={pageSize}
                  onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}
                >
                  {[10, 20, 50, 100].map(sz => <option key={sz} value={sz}>{sz} / page</option>)}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal isOpen={confirmOpen} onClose={() => { if (!deletingId) { setConfirmOpen(false); setTarget(null); } }} title="Delete Submission">
        <div className="space-y-4">
          <p className="text-gray-300">
            Delete submission from <span className="font-semibold text-white">{target?.name}</span>? This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button className="admin-button" onClick={() => { if (!deletingId) { setConfirmOpen(false); setTarget(null); } }} disabled={!!deletingId}>Cancel</button>
            <button className="admin-button-danger" onClick={() => target && deleteSubmission(target._id)} disabled={!target || deletingId === target?._id}>
              {deletingId === target?._id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notes editor */}
      <Modal isOpen={notesOpen} onClose={() => { setNotesOpen(false); setTarget(null); }} title={`Notes — ${target?.name || ''}`}>
        <div className="space-y-4">
          <textarea
            className="admin-textarea w-full min-h-[160px]"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Private notes — follow-up plan, budget, project scope, timeline…"
          />
          <div className="flex items-center justify-end gap-3">
            <button className="admin-button" onClick={() => { setNotesOpen(false); setTarget(null); }}>Cancel</button>
            <button className="admin-button-primary" onClick={saveNotes} disabled={savingId === target?._id}>
              {savingId === target?._id ? 'Saving…' : 'Save notes'}
            </button>
          </div>
        </div>
      </Modal>
    </Section>
  );
};

export default ContactSubmissions;
