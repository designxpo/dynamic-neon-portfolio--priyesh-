// @ts-nocheck
import React from 'react';
import { HeroData } from '../types';

interface FooterProps {
    heroData: HeroData | null;
}

const Footer: React.FC<FooterProps> = ({ heroData }) => {
    const currentYear = new Date().getFullYear();
    const name = heroData?.name || 'Priyesh Mishra';

    return (
                        <footer className="bg-dark-bg/50 border-t border-gray-800 py-6 md:py-8">
                                <div className="container mx-auto px-4 md:px-8 text-center text-gray-400">
                                        <nav aria-label="Footer" className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                                                <a href="/#works" className="hover:text-white transition-colors">Works</a>
                                                <a href="/projects" className="hover:text-white transition-colors">Projects</a>
                                                <a href="/blog" className="hover:text-white transition-colors">Blog</a>
                                                <a href="/tools/project-cost-estimator" className="hover:text-white transition-colors">Cost Estimator</a>
                                                <a href="/#services" className="hover:text-white transition-colors">Services</a>
                                                <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
                                                <a href="/#contact" className="hover:text-white transition-colors">Contact</a>
                                        </nav>
                                        <p className="text-sm md:text-base">&copy; {currentYear} {name}. All Rights Reserved.</p>
                                </div>
                        </footer>
    );
};

export default Footer;
