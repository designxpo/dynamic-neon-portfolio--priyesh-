// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import Section from './Section';

interface ServicesProps {
  data: Service[];
}

const ServiceCard: React.FC<{ service: Service; index: number; onReadMore: () => void }> = ({ service, index, onReadMore }) => {
  return (
    <div
      className={`relative group h-full border border-white/15 rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 cursor-pointer transform bg-white/5 text-gray-300 hover:bg-white/10 hover:border-brand-purple/40 hover:shadow-[0_0_30px] hover:shadow-brand-purple/20 hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-brand-purple/40`}
    >
      {/* Glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-purple/20 via-brand-purple-light/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300 group-hover:scale-105"
      />

      {/* Content */}
  <div className="relative z-10 p-6 md:p-7 flex flex-col items-start gap-4">
        {/* Top row: icon + index badge */}
        <div className="w-full flex items-start justify-between">
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/10 border border-white/10 ring-1 ring-transparent group-hover:ring-brand-purple/40 transition-colors">
            <div className={`text-brand-purple group-hover:text-white transition-colors`}>{service.icon}</div>
          </div>
          <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full border border-brand-purple/40 text-brand-purple group-hover:border-white/30 group-hover:text-white/80 transition-colors`}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Title & description */}
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-2 text-white`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            {service.title}
          </h3>
          <p className={`text-sm leading-relaxed text-gray-400 group-hover:text-white/80 transition-colors clamp-3`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {service.description}
          </p>
        </div>

        {/* CTA / affordance line */}
        <div className="mt-auto pt-2 flex items-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-1 text-xs md:text-sm text-brand-purple group-hover:text-white/90 transition-colors underline decoration-transparent group-hover:decoration-white/80"
            aria-label={`Contact us about ${service.title}`}
          >
            Contact →
          </a>
          {service?.description && service.description.length > 140 && (
            <button
              type="button"
              onClick={onReadMore}
              className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-400 hover:text-white/90 transition-colors underline decoration-transparent hover:decoration-white/80"
              aria-label={`Read more about ${service.title}`}
            >
              Read more
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const Services: React.FC<ServicesProps> = ({ data }) => {
  const [selected, setSelected] = useState<Service | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Section title="Services & Expertise" id="services">
      {/* Subtitle */}
      <div className="text-center mb-16">
        <p className="text-gray-400 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          We put your vision and brand at the forefront with services designed to inspire you and your customers.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {data.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} onReadMore={() => setSelected(service)} />
        ))}
      </div>

      {/* Read More Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              className="absolute top-3 right-3 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 text-sm"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
                {selected.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.title}</h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
              {selected.description}
            </p>

            <div className="mt-6 flex justify-end">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-light transition-all duration-300 shadow-lg shadow-brand-purple/30 text-sm"
                onClick={() => setSelected(null)}
              >
                Discuss this service →
              </a>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default Services;
