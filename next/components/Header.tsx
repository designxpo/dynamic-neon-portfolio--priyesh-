import React, { useState, useEffect } from 'react';
import { CodeIcon } from './icons/Icons';
import { HeroData } from '../types';

interface HeaderProps {
    heroData: HeroData | null;
}

const Header: React.FC<HeaderProps> = ({ heroData }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const getActiveSection = () => {
    const sections = ['works', 'process', 'services', 'experience', 'contact'];
    for (let section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          return section;
        }
      }
    }
    return '';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setActiveSection(getActiveSection());
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#works', label: 'Works' },
    { href: '#process', label: 'Process' },
    { href: '#services', label: 'Services' },
    { href: '#experience', label: 'Experience' },
    { href: '#contact', label: 'Contact' },
  ];
  
  const nameParts = (heroData?.name || 'Priyesh Mishra').split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
  <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-dark-bg/80 backdrop-blur-lg border-b border-gray-800' : 'py-3 md:py-4'}`}>
  <div className="container mx-auto px-4 md:px-8 flex items-center">
        {/* Left Section - Logo */}
        <div className="flex-1">
            <button
              onClick={handleScrollToTop}
              className="flex items-center gap-2 text-xl md:text-2xl font-bold"
              aria-label="Scroll to top"
            >
            <img
              src="/images/pmlogo.png"
              alt="Priyesh Mishra Logo"
              className="h-10 md:h-12 lg:h-16 xl:h-20 w-auto"
            />
          </button>
        </div>

        {/* Center Section - Desktop Nav */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-all duration-300 text-sm lg:text-base relative ${
                  activeSection === link.href.slice(1)
                    ? 'text-brand-purple border-b-2 border-brand-purple'
                    : 'text-gray-300 hover:text-brand-purple border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Section - Contact Button and Mobile Menu */}
        <div className="flex-1 flex justify-end">
          <a href="#contact" className="hidden md:inline-block bg-brand-purple text-white px-4 lg:px-5 py-2 rounded-lg hover:bg-brand-purple-light transition-all duration-300 shadow-lg shadow-brand-purple/30 text-sm lg:text-base">
              Contact Me
          </a>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                  </svg>
              </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
  <div className={`md:hidden absolute top-full left-0 w-full bg-dark-bg/95 backdrop-blur-lg transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96 border-t border-gray-800' : 'max-h-0'}`}>
        <nav className="flex flex-col items-center space-y-4 py-6">
            {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`transition-all duration-300 text-base md:text-lg relative ${
                    activeSection === link.href.slice(1)
                      ? 'text-brand-purple border-b-2 border-brand-purple'
                      : 'text-gray-300 hover:text-brand-purple border-b-2 border-transparent'
                  }`}
                >
                  {link.label}
                </a>
            ))}
             <a href="#contact" onClick={() => setIsMenuOpen(false)} className="bg-brand-purple text-white px-6 md:px-8 py-3 rounded-lg hover:bg-brand-purple-light transition-all duration-300 shadow-lg shadow-brand-purple/30 w-4/5 text-center mt-4 text-sm md:text-base">
                Contact Me
            </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
