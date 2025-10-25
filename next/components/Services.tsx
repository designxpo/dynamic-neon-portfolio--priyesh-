// @ts-nocheck
import React from 'react';
import { Service } from '../types';
import Section from './Section';

interface ServicesProps {
  data: Service[];
}

const ServiceCard: React.FC<{ service: Service; index: number }> = ({ service, index }) => {
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
          <p className={`text-sm leading-relaxed text-gray-400 group-hover:text-white/80 transition-colors`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {service.description}
          </p>
        </div>

        {/* CTA / affordance line */}
        <a
          href="#contact"
          className="mt-auto pt-2 inline-flex items-center gap-1 text-xs md:text-sm text-brand-purple group-hover:text-white/90 transition-colors underline decoration-transparent group-hover:decoration-white/80"
          aria-label={`Contact us about ${service.title}`}
        >
          Learn more →
        </a>
      </div>
    </div>
  );
};


const Services: React.FC<ServicesProps> = ({ data }) => {
  return (
    <Section title="My Quality Services" id="services">
      {/* Subtitle */}
      <div className="text-center mb-16">
        <p className="text-gray-400 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          We put your vision and brand at the forefront with services designed to inspire you and your customers.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {data.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} />
        ))}
      </div>
    </Section>
  );
};

export default Services;
