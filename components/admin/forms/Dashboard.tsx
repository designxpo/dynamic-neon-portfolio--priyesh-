import React, { useState, useEffect } from 'react';
import { getDb } from '../../../lib/db';

interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ title: string; value: number; onClick: () => void }> = ({ title, value, onClick }) => (
    <div 
        className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all"
        onClick={onClick}
    >
        <p className="text-4xl font-bold text-brand-purple">{value}</p>
        <h3 className="text-lg font-medium text-gray-600 mt-2">{title}</h3>
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
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard</h2>
            <p className="text-gray-600 mb-8">
                This is your central hub for managing all the content on your portfolio website. Click on a card below to jump to a section, or use the sidebar navigation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Services" value={stats.services} onClick={() => setActiveTab('services')} />
                <StatCard title="Projects" value={stats.projects} onClick={() => setActiveTab('projects')} />
                <StatCard title="Skills" value={stats.skills} onClick={() => setActiveTab('skills')} />
                <StatCard title="Testimonials" value={stats.testimonials} onClick={() => setActiveTab('testimonials')} />
                <StatCard title="Blog Posts" value={stats.blogs} onClick={() => setActiveTab('blogs')} />
            </div>
        </div>
    );
};

export default Dashboard;