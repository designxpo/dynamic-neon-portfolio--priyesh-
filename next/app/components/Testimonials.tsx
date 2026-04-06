"use server";

import { connectDB } from '@/lib/db/mongoose';
import Testimonial from '@/models/Testimonial';
import Image from 'next/image';

export default async function Testimonials() {
  await connectDB();
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className='text-center py-10 text-gray-500'>
        No testimonials available yet.
      </section>
    );
  }

  return (
    <section className='space-y-4'>
      {testimonials.map((t: any) => (
        <div key={t._id.toString()} className='border rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900'>
          {t.avatar && (
            <Image
              src={t.avatar}
              alt={t.name}
              width={64}
              height={64}
              className='w-16 h-16 rounded-full mb-3 object-cover'
            />
          )}
          <p className='text-gray-700 dark:text-gray-300 italic'>“{t.message}”</p>
          <h4 className='font-semibold mt-2'>{t.name}</h4>
          <span className='text-sm text-gray-500'>{t.role}</span>
        </div>
      ))}
    </section>
  );
}
