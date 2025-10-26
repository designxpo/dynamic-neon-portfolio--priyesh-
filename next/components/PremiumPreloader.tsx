"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumPreloaderProps {
  children: React.ReactNode;
  // Minimum preloader duration; if waitForEventName is provided, the preloader
  // will hide only after both: minDuration elapsed AND event has fired.
  durationMs?: number; // default ~3200ms
  enableSound?: boolean; // optional, off by default
  waitForEventName?: string; // e.g., 'portfolio:ready'
}

// Gentle ease for premium feel
const EASE: number[] = [0.16, 1, 0.3, 1];

export default function PremiumPreloader({ children, durationMs = 3200, enableSound = false, waitForEventName }: PremiumPreloaderProps) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [eventReady, setEventReady] = useState(!waitForEventName);

  useEffect(() => {
    setMounted(true);
    try {
      // Dev/debug bypass: add ?nopreload=1 to URL to skip the preloader
      const usp = new URLSearchParams(window.location.search);
      const noPreload = usp.get('nopreload') === '1' || sessionStorage.getItem('preloaderSkip') === '1';
      if (noPreload) {
        setDone(true);
        return; // Skip scheduling timers
      }
    } catch {}
    const t = setTimeout(() => {
      setMinElapsed(true);
    }, durationMs);
    // If we're on routes that don't dispatch the ready event (e.g., /admin),
    // don't wait for the event; allow preloader to finish on duration alone.
    try {
      const path = window.location?.pathname || '';
      if (waitForEventName && (path.startsWith('/admin') || path.startsWith('/login'))) {
        setEventReady(true);
      }
    } catch {}

    // Hard fallback: if the event never fires, auto-complete slightly after min duration
    const hard = setTimeout(() => {
      setEventReady(true);
    }, Math.max(durationMs + 1200, Math.floor(durationMs * 1.2)));

    return () => {
      clearTimeout(t);
      clearTimeout(hard);
    };
  }, [durationMs]);

  useEffect(() => {
    if (!waitForEventName) return;
    const handler = () => setEventReady(true);
    window.addEventListener(waitForEventName, handler as EventListener);
    return () => window.removeEventListener(waitForEventName, handler as EventListener);
  }, [waitForEventName]);

  useEffect(() => {
    if (minElapsed && eventReady) {
      setDone(true);
    }
  }, [minElapsed, eventReady]);

  // Persist a session flag so route-level loading fallback can skip full overlay
  useEffect(() => {
    if (done) {
      try {
        sessionStorage.setItem('preloaderDone', '1');
      } catch {}
    }
  }, [done]);

  useEffect(() => {
    if (!enableSound || !done) return;
    // Optional subtle whoosh using WebAudio; keep very soft and brief.
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0005, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
      // Auto close to free resources
      setTimeout(() => ctx.close().catch(() => {}), 400);
    } catch {}
  }, [done, enableSound]);

  return (
    <div className="relative min-h-screen">
      {/* Reveal animation for the main app */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: mounted ? 1 : 0, scale: done ? 1 : 0.985 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {children}
      </motion.div>

      {/* Cinematic preloader overlay */}
      <AnimatePresence>
        {!done && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            aria-label="Loading designer experience"
          >
            {/* Solid base to fully cover underlying page during load */}
            <div className="absolute inset-0 bg-dark-bg" />
            {/* Background tone for continuity (stacked over solid base) */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/15 to-transparent" />

            {/* Morphing gradient orb */}
            <motion.div
              className="absolute w-[420px] h-[420px] rounded-full blur-3xl opacity-70"
              style={{
                background: 'radial-gradient(closest-side, rgba(168,85,247,0.35), rgba(168,85,247,0.08), transparent)',
              }}
              initial={{ scale: 0.8, rotate: 0, x: -60, y: -40 }}
              animate={{
                scale: [0.8, 1.05, 0.95, 1],
                rotate: [0, 15, -10, 0],
                x: [-60, -30, 20, 0],
                y: [-40, -10, 10, 0],
              }}
              transition={{ duration: durationMs / 1000, ease: 'easeInOut' }}
            />

            {/* Content column */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
              {/* Tagline */}
              <motion.p
                className="text-white/90 text-base md:text-lg tracking-wide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              >
                <span className="inline-block">Design is loading…</span>
                <br className="hidden sm:block" />
                <span className="inline-block">Perfection takes a moment </span>
                <span className="inline-block align-baseline shimmer">✨</span>
              </motion.p>

              {/* Thin progress line */}
              <div className="w-[220px] md:w-[320px] h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(168,85,247,0.0) 0%, rgba(168,85,247,0.9) 45%, rgba(255,255,255,0.95) 75%, rgba(168,85,247,0.0) 100%)',
                    boxShadow: '0 0 18px rgba(168,85,247,0.6)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: durationMs / 1000, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Soft vignette edges */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

            <style jsx>{`
              .shimmer {
                display: inline-block;
                animation: twinkle 1.8s ease-in-out infinite;
                filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
              }
              @keyframes twinkle {
                0%, 100% { opacity: 0.65; transform: translateY(0px) scale(1); }
                50% { opacity: 1; transform: translateY(-1px) scale(1.04); }
              }
              @media (prefers-reduced-motion: reduce) {
                .shimmer { animation: none; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
