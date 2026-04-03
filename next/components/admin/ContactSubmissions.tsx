// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Section from '@/components/Section';
import { Mail, Phone, Calendar, MessageSquare, Inbox, Trash2 } from 'lucide-react';
import { getApiBase } from '@/lib/apiBase';
import Modal from '@/components/admin/common/Modal';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  submittedAt: string;
}

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    fetchSubmissions(page, pageSize);
  }, [page, pageSize]);

  const fetchSubmissions = async (pageNum: number, size: number) => {
    try {
      const API_BASE = getApiBase();
      const base = (API_BASE || '').replace(/\/+$/, '');
      const url = `${base}/api/contacts?page=${pageNum}&limit=${size}`;
      const response = await fetch(url);
      if (!response.ok) {
        // Try to read server-provided JSON error, otherwise fallback to text
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const maybeJson = await response.json().catch(() => null);
          setError(maybeJson?.error || `Failed to fetch submissions (HTTP ${response.status})`);
        } else {
          const text = await response.text().catch(() => '');
          setError(text || `Failed to fetch submissions (HTTP ${response.status})`);
        }
        return;
      }
      // Only parse JSON when content-type indicates JSON to avoid pattern errors from HTML payloads
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await response.text().catch(() => '');
        setError(text || 'Server returned a non-JSON response');
        return;
      }
      const data = await response.json();
      if (data && Array.isArray(data.items)) {
        setSubmissions(data.items);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        // Backward compatibility with older API shape
        setSubmissions(data);
        setTotal(data.length);
      } else {
        setSubmissions([]);
        setTotal(0);
      }
    } catch (err) {
      setError('Error fetching submissions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const deleteSubmission = async (id: string) => {
    if (!id) return;
    try {
      setDeletingId(id);
      const API_BASE = getApiBase();
      const base = (API_BASE || '').replace(/\/+$/, '');
      const url = `${base}/api/contacts?id=${encodeURIComponent(id)}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => '');
        const msg = (typeof payload === 'string' ? payload : payload?.error) || `Failed to delete (HTTP ${res.status})`;
        alert(msg);
        return;
      }
      // Optimistic remove
      setSubmissions(prev => prev.filter(s => s._id !== id));
      // Close modal on success
      setConfirmOpen(false);
      setTarget(null);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete submission.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading submissions...</div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">{error}</div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Contact Submissions" id="admin-contacts">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
              <Inbox size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Contact Submissions</h3>
              <p className="text-gray-400 text-sm">Total: {total} submission{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="admin-card text-center py-12">
            <Inbox size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No contact submissions yet.</p>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="admin-card hover:border-electric-blue/30 group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-white mb-2">{submission.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Mail size={14} className="text-electric-blue" />
                        <span>{submission.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Phone size={14} className="text-electric-blue" />
                        <span>{submission.contactNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(submission.submittedAt)}</span>
                    </div>
                    <button
                      className="admin-button-danger flex items-center gap-2"
                      title="Delete submission"
                      onClick={() => { setTarget(submission); setConfirmOpen(true); }}
                      disabled={deletingId === submission._id}
                    >
                      <Trash2 size={14} />
                      {deletingId === submission._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-electric-blue mb-2">
                    <MessageSquare size={14} />
                    <span className="font-medium">Message</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{submission.message}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="admin-card flex items-center justify-between gap-3">
            <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button
                className="admin-button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="admin-button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
              <select
                className="admin-input ml-2"
                value={pageSize}
                onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}
              >
                {[10, 20, 50, 100].map(sz => (
                  <option key={sz} value={sz}>{sz} / page</option>
                ))}
              </select>
            </div>
          </div>
          </>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => { if (!deletingId) { setConfirmOpen(false); setTarget(null); } }} title="Delete Submission">
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this submission
            {target ? (
              <>
                {' '}from <span className="font-semibold text-white">{target.name}</span>
                {target.email ? (<span className="text-gray-400"> &lt;{target.email}&gt;</span>) : null}?
              </>
            ) : '?'}
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              className="admin-button"
              onClick={() => { if (!deletingId) { setConfirmOpen(false); setTarget(null); } }}
              disabled={!!deletingId}
            >
              Cancel
            </button>
            <button
              className="admin-button-danger"
              onClick={() => target && deleteSubmission(target._id)}
              disabled={!target || deletingId === target._id}
            >
              {deletingId && target && deletingId === target._id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </Section>
  );
};

export default ContactSubmissions;
