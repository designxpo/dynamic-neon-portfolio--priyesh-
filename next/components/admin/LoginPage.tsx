// @ts-nocheck
"use client";
import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
  password: string;
}

export default function LoginPage({ onLoginSuccess, password }: LoginProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === password) {
      setError(null);
      onLoginSuccess();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <label className="block text-sm text-gray-300 mb-2">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter admin password"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full bg-brand-purple hover:bg-brand-purple-light transition-colors rounded-lg py-2 font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
}
