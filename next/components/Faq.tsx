import React from 'react';
import { FAQS } from '../data/faqs';
import { slugify } from '../lib/slug';

// Visible FAQ section. Renders real question headings (<h3>) with answer
// paragraphs directly beneath — highly citable by search/LLMs and eligible for
// answer boxes / People-Also-Ask / voice answers. Mirrors the FAQPage JSON-LD.
const Faq: React.FC = () => {
  return (
    <section id="faq" className="w-full py-20 bg-dark-bg text-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Quick answers about what I do, how I work, and how to start a project.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((faq, i) => (
            <details key={i} className="group py-4" {...(i === 0 ? { open: true } : {})}>
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <h3
                  id={`faq-${slugify(faq.question)}`}
                  className="scroll-mt-24 text-base md:text-lg font-semibold text-white"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {faq.question}
                </h3>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-brand-purple-light transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-gray-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
