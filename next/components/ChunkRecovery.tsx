"use client";
import { useEffect } from 'react';

// Development helper: auto-reload on transient Webpack/Next ChunkLoadError
export default function ChunkRecovery() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Some browsers wrap chunk errors in a DOMException or generic Error
      // Normalize to string for detection
      const reason: any = event.reason;
      const message = (reason?.message || reason?.toString?.() || '').toString();
      const name = (reason?.name || '').toString();
      if (
        /ChunkLoadError/i.test(name) ||
        /ChunkLoadError/i.test(message) ||
        /Loading chunk .* failed/i.test(message)
      ) {
        // Prevent noisy console and perform a single reload attempt
        event.preventDefault?.();
        // Add a small backoff to allow dev server to finish recompiling
        setTimeout(() => {
          try {
            // Cache-busting reload to avoid stale chunks
            const url = new URL(window.location.href);
            url.searchParams.set("_r", Date.now().toString());
            window.location.replace(url.toString());
          } catch {
            window.location.reload();
          }
        }, 250);
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = (event?.message || '').toString();
      if (/Loading chunk .* failed/i.test(message)) {
        setTimeout(() => {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("_r", Date.now().toString());
            window.location.replace(url.toString());
          } catch {
            window.location.reload();
          }
        }, 250);
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  return null;
}
