// @ts-nocheck
import React from 'react';
import { HeroData } from '../types';

interface FooterProps {
    heroData: HeroData | null;
}

const Footer: React.FC<FooterProps> = ({ heroData }) => {
    const currentYear = new Date().getFullYear();
    const name = heroData?.name || 'Alex Doe';

    return (
                <footer className="bg-dark-bg/50 border-t border-gray-800 py-4 md:py-6">
                        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-gray-400 gap-2">
                                <p className="text-sm md:text-base">&copy; {currentYear} {name}. All Rights Reserved.</p>
                                <a
                                    href="/images/Priyesh%20Mishra%20UIUX.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-purple hover:text-brand-purple-light text-sm md:text-base"
                                >
                                    Download Resume
                                </a>
                        </div>
                </footer>
    );
};

export default Footer;
