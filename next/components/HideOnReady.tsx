'use client';
import { useEffect, useState } from 'react';

/**
 * Renders its (server-rendered) children in the initial HTML, then removes them
 * once the interactive portfolio has mounted (it dispatches `portfolio:ready`)
 * so the SSR SEO content doesn't visually duplicate the client app. A safety
 * timeout hides it even if the event is missed. Because the initial render
 * (visible) matches the server output, there is no hydration mismatch.
 */
export default function HideOnReady({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onReady = () => setHidden(true);
    window.addEventListener('portfolio:ready', onReady);
    const safety = setTimeout(() => setHidden(true), 5000);
    return () => {
      window.removeEventListener('portfolio:ready', onReady);
      clearTimeout(safety);
    };
  }, []);

  if (hidden) return null;
  return <div data-ssr-seo-fallback>{children}</div>;
}
