// @ts-nocheck
"use client";
import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  id?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, id }) => {
  const ref = useRef(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isInView = useInView(ref, {
    once: true,
    amount: isMobile ? 0.1 : 0.2 // Less strict on mobile for better UX
  });

  const sectionVariants = useMemo(() => ({
    hidden: { opacity: 0, y: isMobile ? 30 : 50 }, // Smaller animation on mobile
    visible: { opacity: 1, y: 0 },
  }), [isMobile]);

  return (
    <motion.div
      id={id}
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration: isMobile ? 0.4 : 0.6, // Faster on mobile
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
