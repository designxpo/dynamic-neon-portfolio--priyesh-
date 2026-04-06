// @ts-nocheck
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Skill } from '../types';
import Section from './Section';

interface SkillsProps {
  data: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ data }) => {
  const [shouldScroll, setShouldScroll] = React.useState(false);
  const skillsContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (skillsContainerRef.current) {
      const containerWidth = skillsContainerRef.current.offsetWidth;
      const skillsWidth = skillsContainerRef.current.scrollWidth;
      setShouldScroll(skillsWidth > containerWidth);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  const scrollSkills = shouldScroll ? Array(10).fill(data).flat() : data;

  const marqueeVariants = {
    animate: {
      x: [0, -2000], // Large continuous scroll distance
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: window.innerWidth < 768 ? 40 : 30, // Slower duration for gentle scroll
          ease: "linear",
        },
      },
    },
  };

  return (
    <Section title="My Skills" id="skills">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg text-gray-400 mb-16" style={{ fontFamily: 'Inter, sans-serif' }}>
          I&apos;m proficient in a variety of modern technologies for web and application development.
        </p>
        <div className="relative w-full overflow-hidden" ref={skillsContainerRef}>
          <motion.div
            className={`flex gap-12 ${!shouldScroll ? 'justify-center' : ''}`}
            variants={shouldScroll ? marqueeVariants : undefined}
            animate={shouldScroll ? "animate" : undefined}
          >
            {scrollSkills.map((skill, index) => (
              <div
                key={`${skill.id}-${index}`}
                className="flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 hover:bg-white/15 hover:border-brand-purple transition-colors duration-300 shadow-lg shadow-white/10"
                style={{ minWidth: window.innerWidth < 768 ? '80px' : '96px' }}
                title={skill.name}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                  {skill.image?.url ? (
                    <Image
                      src={skill.image.url}
                      alt={skill.name}
                      width={48}
                      height={48}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Image
                      src={typeof skill.icon === 'string' ? (skill.icon as string) : ''}
                      alt={skill.name}
                      width={48}
                      height={48}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // hide broken image if icon string isn't a valid URL
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none filter blur-sm" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-transparent via-transparent to-transparent pointer-events-none filter blur-sm" />
        </div>
      </div>
    </Section>
  );
};

export default Skills;
