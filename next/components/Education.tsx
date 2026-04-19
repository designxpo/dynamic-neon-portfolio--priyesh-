import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Education as EducationType } from '../types';
import Section from './Section';

interface EducationProps {
  data: EducationType[];
}

const Education: React.FC<EducationProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Section title="My Education" id="education">
      <div className="max-w-3xl mx-auto">
        <ol className="relative">
          {/* Vertical timeline line */}
          <span
            aria-hidden
            className="absolute left-5 md:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/10 via-indigo-500/40 to-indigo-500/10"
          />

          {data.map((edu, index) => (
            <li
              key={index}
              className="relative pl-16 md:pl-20 pb-8 md:pb-10 last:pb-0"
            >
              {/* Icon node (outer ring + inner circle) */}
              <span
                aria-hidden
                className="absolute left-0 top-0 w-12 h-12 rounded-full bg-indigo-500/15 ring-1 ring-indigo-500/20 flex items-center justify-center"
              >
                <span className="w-8 h-8 rounded-full bg-indigo-500 shadow-[0_6px_20px_-4px_rgba(99,102,241,0.65)] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" strokeWidth={2} />
                </span>
              </span>

              {/* Content card */}
              <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg p-4 md:p-6">
                <h3
                  className="text-base md:text-lg font-semibold text-white leading-snug"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {edu.degree}
                </h3>

                <div className="mt-2 inline-flex items-center rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] md:text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/25">
                  {edu.startYear} - {edu.endYear}
                </div>

                {edu.institution && (
                  <p className="mt-3 text-sm md:text-base text-gray-300">
                    {edu.institution}
                  </p>
                )}

                {edu.description && (
                  <p className="mt-2 text-xs md:text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {edu.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export default Education;
