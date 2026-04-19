"use client";
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../components/Loader';

const PortfolioPage = dynamic(() => import('../components/PortfolioPage'), {
  loading: () => <Loader />,
  ssr: false,
});

export default function HomeClient() {
  return (
    <Suspense fallback={<Loader />}>
      <PortfolioPage />
    </Suspense>
  );
}
