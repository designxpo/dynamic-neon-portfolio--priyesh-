// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Palette, Code2, Rocket } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: <Search className="text-2xl text-brand-purple" />,
    title: "Discover & Strategy",
    points: [
      "Understand your goals, audience, and market.",
      "Define scope, map user journeys, and set success metrics.",
      "Align on a clear roadmap and timeline before we build.",
    ],
  },
  {
    number: "2",
    icon: <Palette className="text-2xl text-brand-purple" />,
    title: "Design",
    points: [
      "Craft wireframes and user flows focused on usability.",
      "Design engaging, responsive, on-brand interfaces.",
      "Validate with prototypes before a line of code.",
    ],
  },
  {
    number: "3",
    icon: <Code2 className="text-2xl text-brand-purple" />,
    title: "Build & Develop",
    points: [
      "Engineer production-ready products in Next.js.",
      "Websites, apps, dashboards, APIs, and integrations.",
      "Clean, scalable, performance-first code.",
    ],
  },
  {
    number: "4",
    icon: <Rocket className="text-2xl text-brand-purple" />,
    title: "Test & Launch",
    points: [
      "Test, QA, and refine on real user feedback.",
      "Deploy, monitor, and ensure a seamless launch.",
      "Analyze post-launch data and iterate for growth.",
    ],
  },
];

export default function Roadmap() {
  const [activeStep, setActiveStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 800); // 0.8s cycle
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-20 bg-dark-bg text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            My <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">Process</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Clarity, creativity, and precision — the foundation of every project I deliver.
          </p>
        </div>

        <div className="relative">
          {/* Animated Connection Line: Desktop/Tablet (horizontal) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
            viewBox="0 0 1200 200"
            fill="none"
          >
            <defs>
              <linearGradient id="lineGradientH" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset={`${(activeStep + 1) * 25}%`} stopColor="#6C63FF" />
                <stop offset={`${(activeStep + 1) * 25}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <motion.path
              d="M50 100 Q300 50 600 100 Q900 150 1150 100" // Extended path from left to right
              stroke="url(#lineGradientH)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: (activeStep + 1) / steps.length }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </svg>

          {/* Animated Connection Line: Mobile (vertical) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none lg:hidden"
            viewBox="0 0 200 1200"
            fill="none"
          >
            <defs>
              <linearGradient id="lineGradientV" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset={`${(activeStep + 1) * 25}%`} stopColor="#6C63FF" />
                <stop offset={`${(activeStep + 1) * 25}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <motion.path
              d="M100 50 Q150 300 100 600 Q50 900 100 1150" // Vertical flow from top to bottom with slight curves
              stroke="url(#lineGradientV)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: (activeStep + 1) / steps.length }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </svg>

          {/* Steps — 4-up on desktop, 2×2 on tablet, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Background Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl font-bold text-brand-purple/10">{step.number}</span>
                </div>

                {/* Icon */}
                <motion.div
                  className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center mb-6 relative z-10"
                  animate={{
                    boxShadow: activeStep === index ? "0 0 30px rgba(108, 99, 255, 0.5)" : "0 0 0px rgba(108, 99, 255, 0)",
                    scale: activeStep === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.8 }}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.2, boxShadow: "0 0 40px rgba(108, 99, 255, 0.7)" }}
                >
                  {step.icon}
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="text-xl font-bold mb-4 text-white"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  animate={{
                    scale: activeStep === index ? 1.05 : 1,
                    color: activeStep === index ? "#6C63FF" : "#FFFFFF"
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {step.title}
                </motion.h3>

                {/* Points */}
                <ul className="space-y-2">
                  {step.points.map((point, i) => (
                    <li key={i} className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      • {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/3 rounded-full blur-3xl translate-x-1/2"></div>
      </div>
    </section>
  );
}
