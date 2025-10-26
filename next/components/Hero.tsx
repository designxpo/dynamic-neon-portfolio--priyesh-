// @ts-nocheck
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HeroData } from '../types';

interface HeroProps {
  data: HeroData;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/5 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-purple-light/5 rounded-full blur-3xl"></div>

      <div ref={ref} className="relative z-10 container mx-auto px-4 pt-16 md:pt-20 pb-12 md:pb-16 min-h-[70vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-12 lg:gap-20 pt-12 md:pt-16 lg:pt-20">

          {/* Left side content */}
          <motion.div
            className="text-center lg:text-left flex flex-col justify-center lg:pl-12 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-sm md:text-base lg:text-lg text-gray-400 mb-6 md:mb-8 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              I am {data.name}
            </motion.p>

            <motion.h1
              className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 md:mb-10 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-white">UI/UX </span>
              <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">Designer</span>
            </motion.h1>

            <motion.p
              className="text-xs md:text-sm lg:text-base text-gray-400 mb-6 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {data.shortBio}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {(() => {
                // Normalize legacy link values to correct anchors
                const primaryHref = (data.ctaButtonLink === '#projects') ? '#works' : (data.ctaButtonLink || '#contact');
                return (
                  <a href={primaryHref} className="bg-brand-purple text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-purple-light transition-all duration-300 shadow-lg shadow-brand-purple/30 text-sm md:text-base font-medium">
                    {data.ctaButtonText || 'Get In Touch'}
                  </a>
                );
              })()}
              {(() => {
                const secondaryLink = (data as any).secondaryCtaLink;
                const secondaryHref = secondaryLink === '#projects' ? '#works' : (secondaryLink || '#works');
                const secondaryText = (data as any).secondaryCtaText || 'View My Work';
                return (
                  <a href={secondaryHref} className="border border-brand-purple text-brand-purple px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-purple hover:text-white transition-all duration-300 text-sm md:text-base font-medium">
                    {secondaryText}
                  </a>
                );
              })()}
            </motion.div>
          </motion.div>

          {/* Right side profile image */}
          <motion.div
            className="flex justify-center lg:justify-end order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={data.profileImage.url}
                alt={data.profileImage.alternativeText || 'Profile Picture'}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

        </div>

        {/* Stats section */}
        <motion.div
          className="mt-8 md:mt-12 lg:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg py-8 md:py-12 px-4 md:px-6 shadow-2xl max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y md:divide-y-0 md:divide-x divide-white/10">
              {data.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center px-4 py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                >
                  <motion.p
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2"
                    style={{
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-gray-400 text-xs md:text-sm font-light uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
