import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { HeroData, TitlePair } from '../types';

interface HeroProps {
  data: HeroData;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(120);

  // Build the (prefix, word) cycle. New `titlePairs` field wins; otherwise
  // fall back to the legacy single-prefix + words array, then to defaults.
  const pairs: TitlePair[] = useMemo(() => {
    const cleanPairs = Array.isArray(data.titlePairs)
      ? data.titlePairs.filter((p) => p && typeof p.word === 'string' && p.word.trim().length > 0)
      : [];
    if (cleanPairs.length > 0) return cleanPairs;
    const fallbackPrefix = data.titlePrefix || (data.title ? data.title.split(' ')[0] : 'UI/UX');
    const fallbackWords = Array.isArray(data.titleWords) && data.titleWords.length > 0
      ? data.titleWords
      : ['Designer', 'Developer'];
    return fallbackWords.map((w) => ({ prefix: fallbackPrefix, word: w }));
  }, [data.titlePairs, data.titlePrefix, data.titleWords, data.title]);

  const currentPair = pairs[loopNum % pairs.length] || { prefix: '', word: '' };
  const prefix = currentPair.prefix;

  useEffect(() => {
    const handleType = () => {
      const fullText = currentPair.word;
      setTypedText(prev => {
        if (!isDeleting) {
          const updated = fullText.substring(0, prev.length + 1);
          if (updated === fullText) {
            setTimeout(() => setIsDeleting(true), 1000);
          }
          return updated;
        } else {
          const updated = fullText.substring(0, prev.length - 1);
          if (updated === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
          }
          return updated;
        }
      });
      setTypingSpeed(isDeleting ? 60 : 120);
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum, typingSpeed, currentPair.word]);

  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/5 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-purple-light/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 pt-16 md:pt-20 pb-12 md:pb-16 min-h-[70vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-12 lg:gap-20 pt-12 md:pt-16 lg:pt-20">

          <div className="text-center lg:text-left flex flex-col justify-center lg:pl-12 order-2 lg:order-1 reveal-left is-visible">
            <p
              className="text-sm md:text-base lg:text-lg text-gray-300 mb-4 md:mb-6 font-light reveal-fade is-visible"
              style={{ animationDelay: '0.2s' }}
            >
              Hi, I am <span className="text-white font-medium">{data.name}</span>
            </p>

            <h1
              className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 md:mb-10 leading-tight reveal-up is-visible"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="sr-only">{data.name} — </span>
              <span
                key={prefix}
                className="text-white inline-block animate-prefix-swap"
              >
                {prefix}
              </span>
              {prefix ? ' ' : ''}
              <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">
                {typedText}
                <span className="animate-blink">|</span>
              </span>
            </h1>

            <p
              className="text-xs md:text-sm lg:text-base text-gray-400 mb-6 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed reveal-fade is-visible"
              style={{ animationDelay: '0.6s' }}
            >
              {data.shortBio}
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start reveal-up is-visible"
              style={{ animationDelay: '0.8s' }}
            >
              {(() => {
                const primaryHref = (data.ctaButtonLink === '#projects') ? '#works' : (data.ctaButtonLink || '#contact');
                return (
                  <a href={primaryHref} className="bg-brand-purple text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-purple-light active:scale-[0.97] transition-all duration-300 shadow-lg shadow-brand-purple/30 text-sm md:text-base font-medium">
                    {data.ctaButtonText || 'Get In Touch'}
                  </a>
                );
              })()}
              {(() => {
                const secondaryLink = (data as any).secondaryCtaLink;
                const secondaryHref = secondaryLink === '#projects' ? '#works' : (secondaryLink || '#works');
                const secondaryText = (data as any).secondaryCtaText || 'View My Work';
                return (
                  <a href={secondaryHref} className="border border-brand-purple text-brand-purple px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-purple hover:text-white active:scale-[0.97] transition-all duration-300 text-sm md:text-base font-medium">
                    {secondaryText}
                  </a>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end order-1 lg:order-2 reveal-right is-visible" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={data.profileImage?.url || '/images/profile.webp'}
                alt={data.profileImage?.alternativeText || 'Priyesh Mishra — UI/UX Designer'}
                width={384}
                height={384}
                priority
                // Default image is a pre-optimized 16 KB WebP (768×960) — serve it
                // as-is so it matches the <head> preload and skips a redundant
                // optimizer round-trip. Custom uploads still go through next/image.
                unoptimized={!data.profileImage?.url}
                sizes="(min-width: 1280px) 384px, (min-width: 1024px) 320px, (min-width: 768px) 288px, 256px"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

        <div className="mt-8 md:mt-12 lg:mt-16 reveal-up is-visible" style={{ animationDelay: '1s' }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg py-8 md:py-12 px-4 md:px-6 shadow-2xl max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y md:divide-y-0 md:divide-x divide-white/10">
              {Array.isArray(data?.stats) && data.stats.map((stat) => (
                <div key={stat.label} className="text-center px-4 py-4">
                  <p
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2"
                    style={{
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm font-light uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
