
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  id: string;
}

const Section: React.FC<SectionProps> = ({ title, children, id }) => {
  return (
    <section id={id} className="py-12 md:py-16 xl:py-24 bg-gradient-to-b from-transparent via-brand-purple/5 to-transparent">
      <div className="max-w-4xl xl:max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-center mb-12 md:mb-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {title.split(' ').map((word, index) => {
            if (word.toLowerCase() === 'quality' || word.toLowerCase() === 'recent' || word.toLowerCase() === 'skills' || word.toLowerCase() === 'experience' || word.toLowerCase() === 'education' || word.toLowerCase() === 'clients' || word.toLowerCase() === 'touch') {
              return (
                <span key={index} className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">
                  {word}{' '}
                </span>
              );
            }
            return <span key={index} className="text-white">{word} </span>;
          })}
        </h2>
        {children}
      </div>
    </section>
  );
};

export default Section;
