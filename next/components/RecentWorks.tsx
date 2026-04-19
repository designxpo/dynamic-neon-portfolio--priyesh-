import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '../types';
import Section from './Section';
import { ExternalLinkIcon, GitHubIcon } from './icons/Icons';

interface RecentWorksProps {
  data: Project[];
}

// Show link icons whenever a non-empty string is provided (including placeholders like '#').
// To hide the icons, leave the field blank in the Admin panel.
const hasAnyLink = (url?: string) => !!url && url.trim().length > 0;

const ProjectCard: React.FC<{ project: Project; onReadMore: (p: Project) => void }> = ({ project, onReadMore }) => (
  <div className="group relative block overflow-hidden rounded-xl shadow-xl bg-white/5 border border-white/20 backdrop-blur-sm hover:border-brand-purple/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-purple/20 w-full h-full">
    <div className="relative overflow-hidden aspect-video">
      <Image
        src={project.coverImage.url}
        alt={project.coverImage.alternativeText || project.title}
        width={400}
        height={300}
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
    </div>

  <div className="p-4 md:p-6">
  <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-1">
          {((project.categories && project.categories.length ? project.categories : (project.category ? [project.category] : []))).slice(0, 2).map((cat) => (
            <span key={cat} className="text-xs bg-brand-purple/20 text-brand-purple-light px-3 py-1 rounded-full border border-brand-purple/30 font-medium">
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

      <p className="text-gray-300 text-xs md:text-sm mb-2 leading-relaxed clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        {project.descriptionShort}
      </p>

      {project.outcome && (
        <div className="mb-3 inline-flex items-start gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1.5 text-[11px] md:text-xs">
          <span className="font-semibold">Result:</span>
          <span className="text-emerald-200">{project.outcome}</span>
        </div>
      )}

      {(project.clientName || project.timeline) && (
        <p className="text-[11px] md:text-xs text-gray-500 mb-3">
          {project.clientName && <span>{project.clientName}</span>}
          {project.clientName && project.timeline && <span className="mx-1.5">·</span>}
          {project.timeline && <span>{project.timeline}</span>}
        </p>
      )}

      {(project.descriptionLong || (project.descriptionShort && project.descriptionShort.length > 140)) && (
        <button
          type="button"
          onClick={() => onReadMore(project)}
          className="text-[11px] md:text-xs text-gray-400 hover:text-white/90 underline decoration-transparent hover:decoration-white/80 transition-colors mb-3"
          aria-label={`Read more about ${project.title}`}
        >
          Read more
        </button>
      )}

      {project.technologies && (
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
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
  const [selected, setSelected] = useState<Project | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);

  // Only show categories that have at least one project
  const derivedCats = Array.from(new Set(
    data.flatMap(p => (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : [])))
      .map(c => (c || '').trim())
      .filter(Boolean)
  ));
  // Filter out categories with no projects
  const categoriesWithProjects = derivedCats.filter(cat =>
    data.some(p => {
      const cats = (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : []));
      return cats.includes(cat);
    })
  );
  const categories = ['All', ...categoriesWithProjects];
  const filteredProjects = filter === 'All'
    ? data
    : data.filter(p => {
      const cats = (p.categories && p.categories.length ? p.categories : (p.category ? [p.category] : []));
      return cats.includes(filter);
    });

  // Reset visible count when filter changes
  useEffect(() => { setVisibleCount(4); }, [filter]);

  // Lock body scroll + ESC-to-close while modal is open
  useEffect(() => {
    if (!selected) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selected]);

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
        <div className="mb-12 md:mb-16 flex justify-center">
          <div className="relative max-w-full w-full md:w-auto">
            {/* Right-edge fade to indicate more content on mobile */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-dark-bg to-transparent md:hidden rounded-r-full" />
            <div className="flex flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-full p-1 sm:p-2 backdrop-blur-sm shadow-lg overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory md:justify-center md:flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`shrink-0 snap-start px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 text-xs sm:text-xs md:text-sm lg:text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${filter === category
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
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          {filteredProjects.slice(0, visibleCount).map((project, index) => (
            <motion.div
              key={project.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProjectCard project={project} onReadMore={(p)=>setSelected(p)} />
            </motion.div>
          ))}
        </div>

        {/* Load more button */}
        {filteredProjects.length > visibleCount && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setVisibleCount(v => v + 4)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple/70 text-white border border-white/10 shadow-lg hover:shadow-brand-purple/30 hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Load more
            </button>
          </div>
        )}

        {/* Premium accent elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/3 rounded-full blur-3xl translate-x-1/2"></div>
        </div>
      </div>

      {/* Read More Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0f0a24]/95 border border-white/10 backdrop-blur-xl text-white overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[88dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag pill (mobile bottom-sheet affordance) */}
            <div className="sm:hidden pt-2 pb-1 flex justify-center shrink-0">
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            {/* Close button — sticky, always reachable */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close project details"
              className="absolute top-3 right-3 z-10 w-9 h-9 inline-flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 border border-white/15 text-white backdrop-blur-md transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto overscroll-contain flex-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {selected.coverImage?.url && (
                <div className="relative w-full h-48 md:h-56 overflow-hidden shrink-0">
                  <Image src={selected.coverImage.url} alt={selected.coverImage.alternativeText || selected.title} width={672} height={224} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div
                className="p-6 pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:pb-6"
              >
                <h3 id="project-modal-title" className="text-lg md:text-xl font-semibold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.title}</h3>
                <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selected.descriptionLong || selected.descriptionShort}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {hasAnyLink(selected.liveUrl) && (
                    <a href={selected.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-purple text-white px-3 py-2 rounded-lg hover:bg-brand-purple-light transition-all text-xs">
                      Visit live
                      <ExternalLinkIcon />
                    </a>
                  )}
                  {hasAnyLink(selected.sourceUrl) && (
                    <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-xs">
                      View source
                      <GitHubIcon />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default RecentWorks;
