"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Section from './Section';

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
  const [selected, setSelected] = useState<Testimonial | null>(null);

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
    <Section title="What Clients Say" id="testimonials">
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {testimonials.map((t) => (
            <div key={t._id} className='border border-white/10 rounded-2xl p-6 shadow-sm bg-white/5 backdrop-blur-sm text-center'>
              {t.avatar && (
                <div className='flex justify-center mb-3'>
                  <Image src={t.avatar} alt={t.name} width={64} height={64} className='w-16 h-16 rounded-full object-cover border border-white/20' />
                </div>
              )}
              <p className='text-gray-300 italic clamp-3'>
                “{t.message}”
              </p>
              {t.message && t.message.length > 160 && (
                <button
                  type='button'
                  onClick={()=>setSelected(t)}
                  className='mt-2 text-xs text-gray-400 hover:text-white/90 underline decoration-transparent hover:decoration-white/80'
                  aria-label={`Read full testimonial from ${t.name}`}
                >
                  Read more
                </button>
              )}
              <h4 className='font-semibold mt-3 text-white'>{t.name}</h4>
              <span className='text-sm text-gray-500'>{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          role='dialog'
          aria-modal='true'
          onClick={()=>setSelected(null)}
        >
          <div
            className='relative w-full max-w-xl rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 text-white'
            onClick={(e)=>e.stopPropagation()}
          >
            <button
              aria-label='Close'
              className='absolute top-3 right-3 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 text-sm'
              onClick={()=>setSelected(null)}
            >
              ✕
            </button>

            <div className='flex items-center gap-3 mb-3'>
              {selected.avatar && <Image src={selected.avatar} alt={selected.name} width={40} height={40} className='w-10 h-10 rounded-full object-cover' />}
              <div>
                <h4 className='font-semibold'>{selected.name}</h4>
                <span className='text-xs text-gray-400'>{selected.role}</span>
              </div>
            </div>

            <p className='text-sm leading-relaxed text-gray-300'>
              “{selected.message}”
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}
