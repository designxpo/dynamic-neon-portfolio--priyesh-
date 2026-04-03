'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for observability without exposing to the user
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="bg-brand-purple hover:bg-brand-purple-light text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
      >
        Try again
      </button>
    </div>
  );
}
