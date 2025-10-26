// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Testimonial } from '../types';
import Section from './Section';

interface TestimonialsProps {
  data: Testimonial[];
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const avatarUrl = testimonial?.avatar?.url || `https://i.pravatar.cc/150?u=${encodeURIComponent((testimonial?.clientName || 'client').replace(/\s/g, ''))}`;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg p-8 text-center flex flex-col items-center flex-shrink-0 w-[340px] lg:w-[360px]">
      <img src={avatarUrl} alt={testimonial?.clientName || 'Client'} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-brand-purple" />
      <p className="text-gray-400 italic mb-6 flex-grow">"{testimonial?.quote || ''}"</p>
      <div className="mt-auto">
        <h4 className="font-semibold text-lg">{testimonial?.clientName || 'Client'}</h4>
        <p className="text-brand-purple-light text-sm">{testimonial?.roleCompany || ''}</p>
      </div>
    </div>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useManualControl, setUseManualControl] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const manualControlTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoverRef = useRef<boolean>(false);
  const [isHover, setIsHover] = useState(false);
  const [cardTotalWidth, setCardTotalWidth] = useState<number>(380); // approx card + gap
  const ITEMS_PER_PAGE = 3;

  if (!data || data.length === 0) return null;

  const shouldAnimate = data.length > ITEMS_PER_PAGE;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const resetToAutoScroll = () => {
    if (manualControlTimeoutRef.current) clearTimeout(manualControlTimeoutRef.current);
    manualControlTimeoutRef.current = setTimeout(() => {
      if (isHoverRef.current) { resetToAutoScroll(); return; }
      setUseManualControl(false);
      setIsPaused(false);
    }, 5000);
  };

  useEffect(() => {
    if (useManualControl && scrollRef.current && shouldAnimate) {
      const scrollAmount = currentIndex * ITEMS_PER_PAGE * cardTotalWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [currentIndex, useManualControl, shouldAnimate, cardTotalWidth]);

  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      if (!row) return;
      const children = row.children;
      if (children.length < 2) {
        const one = children[0] as HTMLElement;
        if (one) setCardTotalWidth(one.getBoundingClientRect().width + 20);
        return;
      }
      const first = children[0] as HTMLElement;
      const second = children[1] as HTMLElement;
      const rect1 = first.getBoundingClientRect();
      const rect2 = second.getBoundingClientRect();
      const total = Math.round(rect2.left - rect1.left);
      if (total > 0) setCardTotalWidth(total);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [data.length]);

  useEffect(() => () => { if (manualControlTimeoutRef.current) clearTimeout(manualControlTimeoutRef.current); }, []);

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

  const repeatedItems = [...data, ...data, ...data];

  return (
    <Section title="What Clients Say" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Desktop behavior: scroll if more than 3 */}
          <div className="hidden lg:block">
            {shouldAnimate ? (
              <>
                <div
                  className="overflow-hidden"
                  onMouseEnter={() => { setIsPaused(true); setIsHover(true); isHoverRef.current = true; }}
                  onMouseLeave={() => { setIsHover(false); isHoverRef.current = false; !useManualControl && setIsPaused(false); }}
                >
                  {!useManualControl ? (
                    <div className="flex gap-5">
                      <div
                        className={`flex gap-5 animate-scroll-smooth`}
                        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                      >
                        {repeatedItems.map((t, idx) => (
                          <TestimonialCard key={`${t.clientName}-${idx}`} testimonial={t} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div ref={scrollRef} className="overflow-x-hidden scroll-smooth">
                      <div ref={rowRef} className="flex gap-5">
                        {data.map((t, idx) => (
                          <TestimonialCard key={`${t.clientName}-${idx}`} testimonial={t} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="relative mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={(e) => { e.preventDefault(); handlePrevious(); }}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-brand-purple/50 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Previous"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.preventDefault(); handleDotClick(idx); }}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        aria-label={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); handleNext(); }}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-brand-purple/50 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Next"
                  >
                    <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.map((t, idx) => (
                  <TestimonialCard key={`${t.clientName}-${idx}`} testimonial={t} />
                ))}
              </div>
            )}
          </div>

          {/* Tablet/Mobile: simple grid */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.map((t, idx) => (
                <TestimonialCard key={`${t.clientName}-${idx}`} testimonial={t} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-smooth {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        .animate-scroll-smooth { animation: scroll-smooth 30s linear infinite; }
      `}</style>
    </Section>
  );
};

export default Testimonials;
