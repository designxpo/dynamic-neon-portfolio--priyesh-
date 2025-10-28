// @ts-nocheck
"use client";
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../components/Loader';

// Lazy load the main portfolio component
const PortfolioPage = dynamic(() => import('../components/PortfolioPage'), {
  loading: () => <Loader />,
  ssr: false
});

export default function HomePage() {
  return (
    <Suspense fallback={<Loader />}>
      <PortfolioPage />
    </Suspense>
  );
}
