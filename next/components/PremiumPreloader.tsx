"use client";
import React, { useEffect, useState } from 'react';

interface PremiumPreloaderProps {
  children: React.ReactNode;
  durationMs?: number;
  waitForEventName?: string;
}

export default function PremiumPreloader({ children, durationMs = 400, waitForEventName }: PremiumPreloaderProps) {
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [eventReady, setEventReady] = useState(!waitForEventName);

  useEffect(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const conn = (navigator as any).connection;
      const saveData = !!conn?.saveData;
      const slowNet = conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType);
      const alreadySeen = sessionStorage.getItem('preloaderDone') === '1';
      const noPreload = usp.get('nopreload') === '1'
        || sessionStorage.getItem('preloaderSkip') === '1'
        || alreadySeen
        || reducedMotion
        || saveData
        || slowNet;
      if (noPreload) {
        setDone(true);
        setRemoved(true);
        return;
      }
    } catch {}

    const t = setTimeout(() => setMinElapsed(true), durationMs);

    try {
      const path = window.location?.pathname || '';
      if (waitForEventName && (path.startsWith('/admin') || path.startsWith('/login'))) {
        setEventReady(true);
      }
    } catch {}

    const hard = setTimeout(() => setEventReady(true), durationMs + 400);
    // Absolute safety net — preloader can never stay on screen longer than 3s.
    const safety = setTimeout(() => {
      setMinElapsed(true);
      setEventReady(true);
      setDone(true);
      setRemoved(true);
    }, 3000);

    return () => {
      clearTimeout(t);
      clearTimeout(hard);
      clearTimeout(safety);
    };
  }, [durationMs, waitForEventName]);

  useEffect(() => {
    if (!waitForEventName) return;
    const handler = () => setEventReady(true);
    window.addEventListener(waitForEventName, handler as EventListener);
    return () => window.removeEventListener(waitForEventName, handler as EventListener);
  }, [waitForEventName]);

  useEffect(() => {
    if (minElapsed && eventReady) setDone(true);
  }, [minElapsed, eventReady]);

  useEffect(() => {
    if (!done) return;
    try { sessionStorage.setItem('preloaderDone', '1'); } catch {}
    const t = setTimeout(() => setRemoved(true), 500);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <>
      {children}
      {!removed && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          aria-label="Loading designer experience"
          role="status"
          aria-live="polite"
          style={{
            opacity: done ? 0 : 1,
            visibility: done ? 'hidden' : 'visible',
            transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.45s',
            pointerEvents: done ? 'none' : 'auto',
          }}
        >
          <div className="absolute inset-0 bg-dark-bg" />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/40" />

          <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
            <p className="text-white/90 text-base md:text-lg tracking-wide">
              <span>Design is loading…</span>
              <br className="hidden sm:block" />
              <span>Perfection takes a moment </span>
              <span className="shimmer-dot">✨</span>
            </p>
            <div
              className="w-[220px] md:w-[320px] h-[2px] bg-white/10 rounded-full overflow-hidden"
              style={{ ['--preload-duration' as any]: `${durationMs}ms` }}
            >
              <div
                className="preloader-bar h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(168,85,247,0.0) 0%, rgba(168,85,247,0.9) 45%, rgba(255,255,255,0.95) 75%, rgba(168,85,247,0.0) 100%)',
                  boxShadow: '0 0 18px rgba(168,85,247,0.6)',
                }}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

          <style jsx>{`
            .shimmer-dot {
              display: inline-block;
              animation: twinkle 1.8s ease-in-out infinite;
              filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.65; transform: translateY(0px) scale(1); }
              50% { opacity: 1; transform: translateY(-1px) scale(1.04); }
            }
            @media (prefers-reduced-motion: reduce) {
              .shimmer-dot { animation: none; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
