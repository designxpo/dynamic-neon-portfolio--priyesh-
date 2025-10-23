// Centralized API base resolver
// Usage: getApiBase() returns a string like "" (dev proxy) or "https://api.example.com"

export function getApiBase(): string {
  // Prefer explicit env variable if provided
  const raw = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
  if (raw) return raw.replace(/\/$/, '');

  // In Vite dev, rely on the dev server proxy for relative "/api" calls
  // This keeps fetch URLs simple and avoids CORS during development.
  if ((import.meta as any).env?.DEV) return '';

  // In production with no VITE_API_BASE_URL, relative "/api" will hit the same origin.
  // This only works if your frontend and backend are served from the same domain.
  // We return empty string here to preserve that behavior.
  return '';
}
