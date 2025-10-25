"use client";

// Tiny client-side offline mode store to signal when API calls fall back to local mode
type Listener = (offline: boolean) => void;

let offline = false;
const listeners = new Set<Listener>();

export const setOfflineMode = (value: boolean) => {
  offline = value;
  // persist a hint so new tabs know the last state
  if (typeof window !== 'undefined') {
    try {
      if (value) localStorage.setItem('portfolio-offline', '1');
      else localStorage.removeItem('portfolio-offline');
    } catch { /* ignore */ }
  }
  listeners.forEach((fn) => fn(offline));
};

export const isOfflineMode = (): boolean => {
  if (typeof window === 'undefined') return offline;
  try {
    if (offline) return true;
    return localStorage.getItem('portfolio-offline') === '1';
  } catch {
    return offline;
  }
};

export const subscribeOffline = (fn: Listener): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
