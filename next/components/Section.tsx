import React from 'react';

interface SectionProps {
  title: string;
  children: any;
  id: string;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for',
  'with', 'me', 'my', 'i', 'is', 'are', 'by', 'at', 'as',
]);

// Pick the "hero" word to gradient.
// Rules: single word → highlight it.
//        has "&" or "and" → highlight the word after it.
//        otherwise → last non-stopword, else first word.
function pickHighlightIndex(words: string[]): number {
  if (words.length === 1) return 0;

  const ampIdx = words.findIndex(
    (w) => w === '&' || w.toLowerCase() === 'and'
  );
  if (ampIdx !== -1 && ampIdx + 1 < words.length) return ampIdx + 1;

  for (let i = words.length - 1; i >= 0; i--) {
    const clean = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (!STOP_WORDS.has(clean) && clean.length > 0) return i;
  }
  return 0;
}

const Section: React.FC<SectionProps> = ({ title, children, id }) => {
  const words = title.split(' ').filter(Boolean);
  const highlightIndex = pickHighlightIndex(words);

  return (
    <section
      id={id}
      className="py-12 md:py-16 xl:py-24 bg-gradient-to-b from-transparent via-brand-purple/5 to-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl xl:text-5xl font-bold text-center mb-12 md:mb-16"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {words.map((word, index) => {
            const isHighlight = index === highlightIndex;
            return (
              <span
                key={index}
                className={
                  isHighlight
                    ? 'bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent'
                    : 'text-white'
                }
              >
                {word}
                {index < words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </h2>
        {children}
      </div>
    </section>
  );
};

export default Section;
