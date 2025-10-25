// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { Zap, Rocket, Award, Star, FileText } from 'lucide-react';

interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ title: string; value: number; onClick: () => void; icon: React.ReactNode }> = ({ title, value, onClick, icon }) => (
    <div 
        className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-105"
        onClick={onClick}
    >
        {/* Glassmorphism card */}
        <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl hover:bg-white/10 hover:border-electric-blue/50 transition-all duration-500">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-deep-violet/20 blur-xl"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300 text-electric-blue">
                    {icon}
                </div>
                
                {/* Value */}
                <div className="text-5xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors duration-300">
                    {value}
                </div>
                
                {/* Title */}
                <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                    {title}
                </div>
            </div>
            
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        services: 0,
        projects: 0,
        skills: 0,
        testimonials: 0,
        blogs: 0,
    });

    useEffect(() => {
        const db = getDb();
        setStats({
            services: db.services.length,
            projects: db.projects.length,
            skills: db.skills.length,
            testimonials: db.testimonials.length,
            blogs: (db.blogs || []).length,
        });
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative">
                <h2 className="text-5xl font-bold text-white mb-4">
                    Make Things <span className="gradient-text-electric">Simple!</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
                    Welcome to your central hub for managing all the content on your portfolio website. 
                    Click on a card below to jump to a section, or use the sidebar navigation.
                </p>
                
                {/* Decorative line */}
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-electric-blue/30 to-transparent"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                <StatCard 
                    title="Services" 
                    value={stats.services} 
                    onClick={() => setActiveTab('services')}
                    icon={<Zap size={40} strokeWidth={1.5} />}
                />
                <StatCard 
                    title="Projects" 
                    value={stats.projects} 
                    onClick={() => setActiveTab('projects')}
                    icon={<Rocket size={40} strokeWidth={1.5} />}
                />
                <StatCard 
                    title="Skills" 
                    value={stats.skills} 
                    onClick={() => setActiveTab('skills')}
                    icon={<Award size={40} strokeWidth={1.5} />}
                />
                <StatCard 
                    title="Testimonials" 
                    value={stats.testimonials} 
                    onClick={() => setActiveTab('testimonials')}
                    icon={<Star size={40} strokeWidth={1.5} />}
                />
                <StatCard 
                    title="Blog Posts" 
                    value={stats.blogs} 
                    onClick={() => setActiveTab('blogs')}
                    icon={<FileText size={40} strokeWidth={1.5} />}
                />
            </div>
        </div>
    );
};

export default Dashboard;
