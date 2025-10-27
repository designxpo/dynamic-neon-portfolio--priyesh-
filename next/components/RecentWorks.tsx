// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import Section from './Section';
import { ExternalLinkIcon, GitHubIcon } from './icons/Icons';
import { getCategories } from '@/lib/api';

interface RecentWorksProps {
  data: Project[];
}

// Show link icons whenever a non-empty string is provided (including placeholders like '#').
// To hide the icons, leave the field blank in the Admin panel.
const hasAnyLink = (url?: string) => !!url && url.trim().length > 0;

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="group relative block overflow-hidden rounded-xl shadow-xl bg-white/5 border border-white/20 backdrop-blur-sm hover:border-brand-purple/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-purple/20 w-full h-full">
    <div className="relative overflow-hidden aspect-video">
      <img
        src={project.coverImage.url}
        alt={project.coverImage.alternativeText || project.title}
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
    </div>

    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-1">
          {((project.categories && project.categories.length ? project.categories : (project.category ? [project.category] : []))).slice(0, 2).map((cat, idx) => (
            <span key={idx} className="text-xs bg-brand-purple/20 text-brand-purple-light px-3 py-1 rounded-full border border-brand-purple/30 font-medium">
              {cat}
            </span>
          ))}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {hasAnyLink(project.sourceUrl) && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-brand-purple border border-white/20 hover:border-brand-purple transition-all duration-300 hover:scale-110"
            >
              <GitHubIcon />
            </a>
          )}
          {hasAnyLink(project.liveUrl) && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-brand-purple border border-white/20 hover:border-brand-purple transition-all duration-300 hover:scale-110"
            >
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold mb-2 text-white group-hover:text-brand-purple-light transition-colors duration-300 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {project.title}
      </h3>

      <p className="text-gray-300 text-xs md:text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        {project.descriptionShort}
      </p>

      {project.technologies && (
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="text-xs bg-white/10 text-gray-200 px-3 py-1 rounded-md border border-white/20 font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);


const RecentWorks: React.FC<RecentWorksProps> = ({ data }) => {
  const [filter, setFilter] = useState('All');
  const [orderedCats, setOrderedCats] = useState<string[] | null>(null);

  // Load saved categories order from Admin; if unavailable, fall back to derived
  useEffect(() => {
    (async () => {
      try { const cats = await getCategories(); setOrderedCats(cats || []); } catch { setOrderedCats([]); }
    })();
  }, []);

  const derivedCats = Array.from(new Set(
    data.flatMap(p => (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : [])))
      .map(c => (c || '').trim())
      .filter(Boolean)
  ));
  const categoriesSet = new Set(orderedCats && orderedCats.length ? orderedCats : derivedCats);
  // Append any categories present in data but not in saved order
  const fullCats = (orderedCats && orderedCats.length ? [...orderedCats] : [...derivedCats]);
  for (const c of derivedCats) if (!categoriesSet.has(c)) fullCats.push(c);
  const categories = ['All', ...Array.from(new Set(fullCats))];
  const filteredProjects = filter === 'All'
    ? data
    : data.filter(p => {
        const cats = (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : []));
        return cats.includes(filter);
      });

  return (
    <Section title="My Recent Works" id="works">
      <div className="container mx-auto px-4 md:px-8">
        {/* Subtitle */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Explore my latest projects showcasing innovative design solutions and creative development
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-full p-1 sm:p-2 backdrop-blur-sm shadow-lg max-w-full overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-2 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 text-xs sm:text-xs md:text-sm lg:text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                  filter === category
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

        {/* Premium accent elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/3 rounded-full blur-3xl translate-x-1/2"></div>
        </div>
      </div>
    </Section>
  );
};

export default RecentWorks;
