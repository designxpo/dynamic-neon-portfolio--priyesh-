// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Section from '@/components/Section';
import { Mail, Phone, Calendar, MessageSquare, Inbox } from 'lucide-react';
import { getApiBase } from '@/lib/apiBase';

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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const API_BASE = getApiBase();
      const base = (API_BASE || '').replace(/\/+$/, '');
      const url = `${base}/api/contacts`;
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
      setSubmissions(Array.isArray(data) ? data : []);
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
              <p className="text-gray-400 text-sm">Total: {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
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
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>{formatDate(submission.submittedAt)}</span>
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
        )}
      </div>
    </Section>
  );
};

export default ContactSubmissions;
