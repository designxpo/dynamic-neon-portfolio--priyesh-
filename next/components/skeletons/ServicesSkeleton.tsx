"use client";
import React from 'react';

export default function ServicesSkeleton() {
  return (
    <section className="py-12 md:py-16 xl:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-white/10 mb-4" />
              <div className="h-4 w-2/3 bg-white/10 rounded mb-3" />
              <div className="h-3 w-full bg-white/10 rounded mb-2" />
              <div className="h-3 w-5/6 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
