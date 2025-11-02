"use client";

import { useEffect, useState } from 'react';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  message: string;
  avatar?: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch('/api/admin/testimonials', { cache: 'no-store' });
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setTestimonials(result.data);
        } else {
          console.warn('No testimonials found or unexpected API format:', result);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  if (loading) return <div className='text-center py-10 text-gray-500'>Loading testimonials...</div>;

  if (!testimonials || testimonials.length === 0) {
    return <div className='text-center py-10 text-gray-500'>No testimonials found.</div>;
  }

  return (
    <section className='space-y-4'>
      {testimonials.map((t) => (
        <div key={t._id} className='border rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900'>
          {t.avatar && <img src={t.avatar} alt={t.name} className='w-16 h-16 rounded-full mb-3 object-cover' />}
          <p className='text-gray-700 dark:text-gray-300 italic'>“{t.message}”</p>
          <h4 className='font-semibold mt-2'>{t.name}</h4>
          <span className='text-sm text-gray-500'>{t.role}</span>
        </div>
      ))}
    </section>
  );
}
