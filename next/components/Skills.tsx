// @ts-nocheck
import React from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { Skill } from '../types';
import Section from './Section';

interface SkillsProps {
  data: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ data }) => {
  const prefersReducedMotion = useReducedMotion();

  if (!data || data.length === 0) return null;

  const card = (skill: Skill, key: React.Key, marquee: boolean) => (
    <div
      key={key}
      className={`flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 hover:bg-white/15 hover:border-brand-purple transition-colors duration-300 shadow-lg shadow-white/10 min-w-[80px] md:min-w-[96px] ${marquee ? 'mr-8 md:mr-12' : ''}`}
      title={skill.name}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
        {skill.image?.url ? (
          <Image src={skill.image.url} alt={skill.name} width={48} height={48} className="max-w-full max-h-full object-contain" />
        ) : (
          <Image
            src={typeof skill.icon === 'string' ? (skill.icon as string) : ''}
            alt={skill.name}
            width={48}
            height={48}
            className="max-w-full max-h-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Section title="Skills & Specialisations" id="skills">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg text-gray-400 mb-16" style={{ fontFamily: 'Inter, sans-serif' }}>
          I&apos;m proficient in a variety of modern technologies for web and application development.
        </p>

        {prefersReducedMotion ? (
          // Reduced motion — static, centered, no animation.
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {data.map((skill, i) => card(skill, `${skill.id}-${i}`, false))}
          </div>
        ) : (
          // Seamless infinite marquee. Repeat the set enough to exceed wide
          // viewports, then render TWO copies of that padded set and shift -50%.
          (() => {
            const repeats = Math.max(2, Math.ceil(20 / data.length));
            const set = Array(repeats).fill(data).flat();
            return (
              <div className="skills-marquee-viewport relative w-full overflow-hidden">
                <div className="animate-skills-marquee flex w-max">
                  {set.map((skill, i) => card(skill, `a-${skill.id}-${i}`, true))}
                  {set.map((skill, i) => card(skill, `b-${skill.id}-${i}`, true))}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </Section>
  );
};

export default Skills;
