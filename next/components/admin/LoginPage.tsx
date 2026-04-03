"use client";
import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginProps) {
  const [value, setValue]       = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });

      if (res.ok) {
        onLoginSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <label htmlFor="admin-password" className="block text-sm text-gray-300 mb-2">Password</label>
        <input
          id="admin-password"
          type="password"
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter admin password"
          autoComplete="current-password"
          disabled={loading}
        />
        {error && (
          <p className="text-red-400 text-sm mt-2" role="alert">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-brand-purple hover:bg-brand-purple-light disabled:opacity-50 transition-colors rounded-lg py-2 font-medium"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
