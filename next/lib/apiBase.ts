// Centralized API base resolver
// Usage: getApiBase() returns a string like "" (dev proxy) or "https://api.example.com"

export function getApiBase(): string {
  // 1) Next.js client env support (NEXT_PUBLIC_API_BASE_URL)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextPublic = (typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_API_BASE_URL : '') || '';
    if (typeof nextPublic === 'string' && nextPublic.trim()) {
      return nextPublic.trim().replace(/\/$/, '');
    }
  } catch {
    // ignore
  }

  // 2) Vite env support (VITE_API_BASE_URL)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
    if (raw) return raw.replace(/\/$/, '');
    // In Vite dev, rely on the dev server proxy for relative "/api" calls
    if ((import.meta as any).env?.DEV) return '';
  } catch {
    // ignore
  }

  // 3) Default: same-origin relative base ('') works for Next and for production behind a reverse proxy
  return '';
}
