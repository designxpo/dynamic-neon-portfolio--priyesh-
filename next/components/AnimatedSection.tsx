"use client";
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  id?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, id }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div id={id} ref={ref} className={`reveal-up ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
};

export default AnimatedSection;
