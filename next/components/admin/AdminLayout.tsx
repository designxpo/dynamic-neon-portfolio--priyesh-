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
    education: 'Education',
    skills: 'Skills',
    testimonials: 'Testimonials',
    blogs: 'Blog Posts',
    seo: 'SEO',
    contact: 'Contact Information',
    'contact-submissions': 'Contact Submissions',
    settings: 'Settings',
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d1f] to-[#1a0a2e] font-sans relative overflow-hidden text-white">
      {/* Background accents */}
      <div
        className="absolute inset-0 opacity-30 bg-no-repeat"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')"
        }}
      />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-deep-violet/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Home</span>
              <span className="text-gray-600">/</span>
              <span className="text-electric-blue font-medium">{tabTitles[activeTab] || 'Dashboard'}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-400">{currentDate}</div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-deep-violet flex items-center justify-center text-white font-bold text-sm">PM</div>
                <span className="text-sm text-gray-300">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8" style={{ overflowY: 'auto', overflowX: 'hidden', height: 'calc(100vh - 72px)', maxHeight: 'calc(100vh - 72px)' }}>
          {(offline || (aiStatus && !aiStatus.configured) || aiError) && (
            <div className="max-w-7xl mx-auto mb-4">
              {offline && (
                <div className="admin-card bg-amber-500/10 border-amber-500/30 text-amber-300 mb-2">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Database unavailable — working in local mode. Your changes are saved to this browser and will sync when the server is available.
                    </span>
                  </div>
                </div>
              )}
              {aiError && (
                <div className="admin-card bg-rose-500/10 border-rose-500/30 text-rose-300 mb-2">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Could not determine AI provider status. The chatbot will fall back to local answers.
                    </span>
                    <a href="/api/chat/provider" target="_blank" rel="noopener noreferrer" className="admin-button">View Status</a>
                  </div>
                </div>
              )}
              {aiStatus && !aiStatus.configured && (
                <div className="admin-card bg-purple-500/10 border-purple-500/30 text-purple-200">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      AI provider not configured — the chatbot will use local rule-based responses. Configure keys in <code>next/.env.local</code> (OpenAI, Azure OpenAI, or Gemini).
                    </span>
                    <a href="/api/chat/provider" target="_blank" rel="noopener noreferrer" className="admin-button">Setup Guide</a>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="max-w-7xl mx-auto h-full">
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-10 relative overflow-visible">
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent"></div>
              <div className="relative z-10">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
