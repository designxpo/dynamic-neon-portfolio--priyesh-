"use client";
import React from 'react';

export default function ProjectsSkeleton() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-white/10" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-white/10 rounded mb-3" />
                <div className="h-3 w-full bg-white/10 rounded mb-2" />
                <div className="h-3 w-5/6 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
