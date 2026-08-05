// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { isOfflineMode, subscribeOffline } from '@/lib/offline';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const tabTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    hero: 'Hero Section',
    services: 'Services',
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    testimonials: 'Testimonials',
    blogs: 'Blog Posts',
    seo: 'SEO',
    contact: 'Contact Information',
    'contact-submissions': 'Contact Submissions',
    categories: 'Categories',
    metadata: 'Metadata',
    chatbot: 'Chatbot',
    settings: 'Settings',
  };

  const tabSubtitles: { [key: string]: string } = {
    dashboard: 'Overview of your portfolio content',
    hero: 'Edit the homepage hero section',
    services: 'Manage the services you offer',
    projects: 'Curate your portfolio projects',
    experience: 'Update your professional history',
    skills: 'Edit your skills and tools',
    testimonials: 'Manage client testimonials',
    blogs: 'Write and publish blog posts',
    seo: 'Per-section SEO metadata',
    contact: 'Contact details and notification settings',
    'contact-submissions': 'Inbound messages from your contact form',
    categories: 'Project category list and ordering',
    metadata: 'Site-wide metadata and Open Graph',
    chatbot: 'Configure the on-site assistant',
    settings: 'Account and admin preferences',
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const [offline, setOffline] = useState<boolean>(isOfflineMode());
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; provider: string | null; details?: any } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeOffline(setOffline);
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        setAiError(null);
        const res = await fetch('/api/chat/provider', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAiStatus({ configured: !!data?.configured, provider: data?.provider ?? null, details: data?.details });
      } catch (e: any) {
        if (!cancelled) setAiError('Unable to detect AI provider');
      }
    };
    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  const pageTitle = tabTitles[activeTab] || 'Dashboard';
  const pageSubtitle = tabSubtitles[activeTab] || '';

  return (
    <div className="admin-shell flex h-screen overflow-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="px-8 py-5 flex-shrink-0"
          style={{
            background: 'var(--admin-surface)',
            borderBottom: '1px solid var(--admin-border-soft)',
          }}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                <span>Admin</span>
                <span aria-hidden>/</span>
                <span style={{ color: 'var(--admin-accent)', fontWeight: 600 }}>{pageTitle}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
                {pageTitle === 'Dashboard' ? 'Portfolio Dashboard' : pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
                  {pageSubtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-sm hidden md:block" style={{ color: 'var(--admin-text-muted)' }}>
                {currentDate}
              </div>
              <div
                className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full"
                style={{ background: 'var(--admin-surface-soft)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                  style={{ background: 'var(--admin-accent)', color: '#0B1020' }}
                >
                  PM
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main scroll area */}
        <main
          className="flex-1 px-6 md:px-8 py-6 md:py-8"
          style={{ overflowY: 'auto', overflowX: 'hidden', background: 'var(--admin-bg)' }}
        >
          {(offline || (aiStatus && !aiStatus.configured) || aiError) && (
            <div className="max-w-7xl mx-auto mb-4 space-y-2">
              {aiError && (
                <div
                  className="admin-card flex items-center justify-between gap-4"
                  style={{
                    background: 'rgba(248, 113, 113, 0.08)',
                    boxShadow: 'none',
                    border: '1px solid rgba(248, 113, 113, 0.22)',
                  }}
                >
                  <span style={{ color: '#FCA5A5' }}>
                    Could not determine AI provider status. The chatbot will fall back to local answers.
                  </span>
                  <a href="/api/chat/provider" target="_blank" rel="noopener noreferrer" className="admin-button">View Status</a>
                </div>
              )}
              {aiStatus && !aiStatus.configured && (
                <div
                  className="admin-card flex items-center justify-between gap-4"
                  style={{
                    background: 'rgba(129, 140, 248, 0.08)',
                    boxShadow: 'none',
                    border: '1px solid rgba(129, 140, 248, 0.22)',
                  }}
                >
                  <span style={{ color: 'var(--admin-text-soft)' }}>
                    AI provider not configured — the chatbot will use local rule-based responses. Configure keys in <code>next/.env.local</code> (OpenAI, Azure OpenAI, or Gemini).
                  </span>
                  <a href="/api/chat/provider" target="_blank" rel="noopener noreferrer" className="admin-button">Setup Guide</a>
                </div>
              )}
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
