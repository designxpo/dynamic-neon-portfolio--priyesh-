"use client";
import { useEffect, useState } from 'react';
import LoginPage from '../../components/admin/LoginPage';
import AdminPanel from '../../components/admin/AdminPanel';

export default function AdminPage() {
  const [isAdmin, setIsAdmin]   = useState(false);
  const [ready, setReady]       = useState(false);

  // Verify session cookie with the server on every mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/login', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(!!data.authenticated);
        }
      } catch {
        // Network error — show login form
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const handleLoginSuccess = () => setIsAdmin(true);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setIsAdmin(false);
  };

  if (!ready) return null;

  if (!isAdmin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
