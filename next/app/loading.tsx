"use client";
import React from 'react';
import Loader from '@/components/Loader';

export default function Loading() {
  // If the premium preloader has already completed this session,
  // skip the route-level full-screen overlay to avoid flicker.
  const skip = typeof window !== 'undefined' && sessionStorage.getItem('preloaderDone') === '1';
  if (skip) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-dark-bg backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader size="lg" label="Preparing awesomeness…" />
        <span className="text-xs text-gray-500">This will just take a moment</span>
      </div>
    </div>
  );
}
