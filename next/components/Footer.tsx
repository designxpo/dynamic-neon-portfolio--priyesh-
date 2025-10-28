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
                        <footer className="bg-dark-bg/50 border-t border-gray-800 py-4 md:py-6">
                                <div className="container mx-auto px-4 md:px-8 text-center text-gray-400">
                                        <p className="text-sm md:text-base">&copy; {currentYear} {name}. All Rights Reserved.</p>
                                </div>
                        </footer>
    );
};

export default Footer;
