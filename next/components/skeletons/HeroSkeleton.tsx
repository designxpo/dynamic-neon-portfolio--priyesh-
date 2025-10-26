"use client";
import React from 'react';

export default function HeroSkeleton() {
  return (
    <section className="min-h-[70vh] bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/10 relative overflow-hidden">
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          <div className="order-2 lg:order-1">
            <div className="h-4 w-40 bg-white/10 rounded mb-6 animate-pulse" />
            <div className="h-10 w-2/3 bg-white/10 rounded mb-6 animate-pulse" />
            <div className="space-y-3 mb-8">
              <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-11/12 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-10/12 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-11 w-36 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-11 w-36 border border-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-72 h-72 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
