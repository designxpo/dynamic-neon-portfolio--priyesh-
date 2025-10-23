import React, { useState, useRef, useEffect } from 'react';
import Section from './Section';
import { Blog } from '../types';

interface BlogsProps {
  data: Blog[];
}

const Blogs: React.FC<BlogsProps> = ({ data }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useManualControl, setUseManualControl] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const manualControlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!data || data.length === 0) return null;

  const shouldAnimate = data.length > 3;
  const totalPages = Math.ceil(data.length / 3);

  // Function to reset back to auto-scroll after inactivity
  const resetToAutoScroll = () => {
    // Clear any existing timeout
    if (manualControlTimeoutRef.current) {
      clearTimeout(manualControlTimeoutRef.current);
    }

    // Set a timeout to return to auto-scroll after 5 seconds of inactivity
    manualControlTimeoutRef.current = setTimeout(() => {
      setUseManualControl(false);
      setIsPaused(false);
      setCurrentIndex(0);
    }, 5000);
  };

  useEffect(() => {
    if (useManualControl && scrollRef.current && shouldAnimate) {
      const cardWidth = 360; // Card width + gap
      const scrollAmount = currentIndex * (cardWidth + 20);
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, useManualControl, shouldAnimate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (manualControlTimeoutRef.current) {
        clearTimeout(manualControlTimeoutRef.current);
      }
    };
  }, []);

  const handlePrevious = () => {
    setUseManualControl(true);
    setIsPaused(true);
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    resetToAutoScroll();
  };

  const handleNext = () => {
    setUseManualControl(true);
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    resetToAutoScroll();
  };

  const handleDotClick = (index: number) => {
    setUseManualControl(true);
    setIsPaused(true);
    setCurrentIndex(index);
    resetToAutoScroll();
  };

  // Duplicate items multiple times for seamless infinite scroll
  const repeatedItems = [...data, ...data, ...data];

  return (
    <Section title="Recent Blog Posts" id="blog">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* For desktop: show continuous scroll if more than 3 items */}
          <div className="hidden lg:block">
            {shouldAnimate ? (
              <>
                <div
                  className="overflow-hidden"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => !useManualControl && setIsPaused(false)}
                >
                  {!useManualControl ? (
                    // Auto-scroll mode
                    <div className="flex gap-5">
                      <div
                        className={`flex gap-5 ${isPaused ? '' : 'animate-scroll-smooth'}`}
                        style={{
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                      >
                        {repeatedItems.map((post, idx) => (
                          <BlogCard key={`${post.id}-${idx}`} post={post} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Manual control mode
                    <div
                      ref={scrollRef}
                      className="overflow-x-hidden scroll-smooth"
                    >
                      <div className="flex gap-5">
                        {data.map((post) => (
                          <BlogCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Controls - Outside the scroll container */}
                <div className="relative mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevious}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-brand-purple/50 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Previous"
                  >
                    <svg
                      className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Pagination Dots */}
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? 'w-8 bg-brand-purple'
                            : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-brand-purple/50 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Next"
                  >
                    <svg
                      className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* For tablet and mobile: show static grid */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-smooth {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-scroll-smooth {
          animation: scroll-smooth 30s linear infinite;
        }
      `}</style>
    </Section>
  );
};

const BlogCard: React.FC<{ post: Blog }> = ({ post }) => {
  return (
    <article className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-brand-purple/50 hover:shadow-lg hover:shadow-brand-purple/10 transition-all duration-300 hover:scale-[1.02] flex flex-col flex-shrink-0 w-[340px] lg:w-[360px]">
      {post.thumbnail?.url && (
        <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-purple-900/20 to-black/40">
          <img
            src={post.thumbnail.url}
            alt={post.thumbnail.alternativeText || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold mb-2 line-clamp-2 text-white group-hover:text-brand-purple-light transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
          <span>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {post.author && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{post.author}</span>
            </>
          )}
        </div>
        {post.url && (
          <div className="mt-auto">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-purple-light hover:text-brand-purple group/link transition-colors"
            >
              Read More
              <svg
                className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </article>
  );
};

export default Blogs;
