
import React, { useState } from 'react';
import { Service } from '../types';
import Section from './Section';

interface ServicesProps {
  data: Service[];
}

const ServiceCard: React.FC<{ service: Service; index: number; isActive: boolean; onClick: () => void }> = ({ service, index, isActive, onClick }) => {
    return (
        <div
            className={`border border-white/20 rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-300 cursor-pointer ${
                isActive ? 'bg-brand-purple text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            onClick={onClick}
        >
            <div className="p-4 md:p-6 flex justify-between items-center">
                <div className="flex items-center gap-4 md:gap-6">
                    <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-white/80' : 'text-brand-purple'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                        <h3 className={`text-lg md:text-xl font-semibold mb-1 ${isActive ? 'text-white' : 'text-white'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {service.title}
                        </h3>
                        <p className={`text-xs md:text-sm leading-relaxed ${isActive ? 'text-white/80' : 'text-gray-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                            {service.description}
                        </p>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};


const Services: React.FC<ServicesProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Section title="My Quality Services" id="services">
      {/* Subtitle */}
      <div className="text-center mb-16">
        <p className="text-gray-400 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          We put your vision and brand at the forefront with services designed to inspire you and your customers.
        </p>
      </div>

      {/* Services Accordion */}
      <div className="space-y-4">
        {data.map((service, index) => (
          <ServiceCard
            key={index}
            service={service}
            index={index}
            isActive={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </Section>
  );
};

export default Services;