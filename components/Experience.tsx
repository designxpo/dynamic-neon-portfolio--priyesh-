
import React from 'react';
import { Experience as ExperienceType } from '../types';
import Section from './Section';

interface ExperienceProps {
  data: ExperienceType[];
}

const Experience: React.FC<ExperienceProps> = ({ data }) => {
  return (
    <Section title="My Experience" id="experience">
      <div className="max-w-3xl mx-auto">
        <div className="relative border-l-2 border-brand-purple/30">
          {data.map((exp, index) => (
            <div key={index} className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-brand-purple rounded-full -left-3 ring-8 ring-brand-purple/20 shadow-xl shadow-brand-purple/60">
                <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                </svg>
              </span>
              <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                    <h3 className="text-lg md:text-xl font-semibold text-white">{exp.positionTitle}</h3>
                    <span className="bg-brand-purple/20 text-brand-purple-light text-xs md:text-sm font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto">{exp.startYear} - {exp.endYear}</span>
                </div>
                <p className="text-sm md:text-base font-normal text-gray-400 mb-2">{exp.companyName}</p>
                <p className="text-xs md:text-sm text-gray-400">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Experience;