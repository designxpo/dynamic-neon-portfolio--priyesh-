"use client";
import { useState } from 'react';
import Image from 'next/image';

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
    <div className="admin-shell min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm admin-card"
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/images/pmlogo.svg"
            alt="Priyesh Mishra"
            width={716}
            height={200}
            priority
            className="h-12 w-auto"
          />
        </div>

        <h1
          className="text-xl font-semibold text-center tracking-tight mb-1"
          style={{ color: 'var(--admin-text)' }}
        >
          Admin Login
        </h1>
        <p
          className="text-sm text-center mb-6"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Enter your password to continue
        </p>

        <label htmlFor="admin-password" className="admin-label">Password</label>
        <input
          id="admin-password"
          type="password"
          className="admin-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter admin password"
          autoComplete="current-password"
          disabled={loading}
        />

        {error && (
          <p
            className="text-sm mt-3"
            role="alert"
            style={{ color: 'var(--admin-danger)' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-button w-full justify-center mt-5"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
