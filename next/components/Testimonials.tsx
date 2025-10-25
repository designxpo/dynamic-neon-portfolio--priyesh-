// @ts-nocheck
import React from 'react';
import { Testimonial } from '../types';
import Section from './Section';

interface TestimonialsProps {
  data: Testimonial[];
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const avatarUrl = testimonial?.avatar?.url || `https://i.pravatar.cc/150?u=${encodeURIComponent((testimonial?.clientName || 'client').replace(/\s/g, ''))}`;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg p-8 text-center flex flex-col items-center">
      <img src={avatarUrl} alt={testimonial?.clientName || 'Client'} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-brand-purple" />
      <p className="text-gray-400 italic mb-6 flex-grow">"{testimonial?.quote || ''}"</p>
      <div className="mt-auto">
        <h4 className="font-semibold text-lg">{testimonial?.clientName || 'Client'}</h4>
        <p className="text-brand-purple-light text-sm">{testimonial?.roleCompany || ''}</p>
      </div>
    </div>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  return (
    <Section title="What Clients Say" id="testimonials">
      <div className="max-w-4xl xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {data.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;
