"use client";
// @ts-nocheck
import { useEffect, useState } from 'react';
import LoginPage from '../../components/admin/LoginPage';
import AdminPanel from '../../components/admin/AdminPanel';
// Using direct fetch to avoid bundler ambiguity between lib/api.ts and api.tsx

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  // Default to 'admin' so login works even if DB is not configured or API fails
  const [password, setPassword] = useState<string>('admin');

  useEffect(() => {
    // client-only session state
    try {
      setIsAdmin(sessionStorage.getItem('isAdmin') === 'true');
    } catch {}
    // load current password from API (Mongo)
    (async () => {
      try {
        const res = await fetch('/api/admin/adminPassword', { cache: 'no-store' });
        // If API errors (e.g., DB down), keep default 'admin'
        if (!res.ok) {
          setPassword('admin');
        } else {
          const val = await res.json();
          const pwd = typeof val === 'string' ? val : (val?.adminPassword ?? 'admin');
          setPassword(pwd || 'admin');
        }
      } catch {
        setPassword('admin');
      }
      setReady(true);
    })();
  }, []);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
    } catch {}
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isAdmin');
      setIsAdmin(false);
    } catch {}
  };

  if (!ready) return null;

  if (!isAdmin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} password={password} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
