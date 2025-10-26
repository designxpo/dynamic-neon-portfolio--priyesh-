"use client";
import React from 'react';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export default function Loader({ label = 'Loading…', size = 'md' }: LoaderProps) {
  const s = sizeMap[size];
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${s}`}>
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-brand-purple to-brand-purple-light blur-md opacity-60 animate-pulse`}></div>
        {/* Spinner */}
        <div className={`absolute inset-0 rounded-full border-4 border-white/10`}></div>
        <div className={`absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-brand-purple border-l-brand-purple-light animate-spin`}></div>
      </div>
      {label && (
        <p className="text-sm text-gray-400 tracking-wide">{label}</p>
      )}
    </div>
  );
}
