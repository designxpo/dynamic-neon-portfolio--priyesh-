import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  id?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: window.innerWidth < 768 ? 0.1 : 0.2 // Less strict on mobile for better UX
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: window.innerWidth < 768 ? 30 : 50 }, // Smaller animation on mobile
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      id={id}
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration: window.innerWidth < 768 ? 0.4 : 0.6, // Faster on mobile
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;