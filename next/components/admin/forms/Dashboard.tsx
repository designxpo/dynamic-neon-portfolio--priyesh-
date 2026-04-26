// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { Zap, Rocket, Award, Star, FileText, ChevronRight } from 'lucide-react';

interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{
    title: string;
    value: number;
    onClick: () => void;
    icon: React.ReactNode;
}> = ({ title, value, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className="admin-card text-left w-full group cursor-pointer"
        style={{ border: '1px solid transparent' }}
    >
        <div className="flex items-start justify-between mb-5">
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--admin-accent-soft)', color: 'var(--admin-accent)' }}
            >
                {icon}
            </div>
            <ChevronRight
                size={18}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: 'var(--admin-text-muted)' }}
            />
        </div>

        <div className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
            {value}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
            {title}
        </div>
    </button>
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
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="admin-card flex items-center justify-between gap-6 flex-wrap">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
                        Welcome back, Priyesh
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                        Manage every section of your portfolio from one place. Click a card to jump to that section.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className="admin-button"
                >
                    Edit Projects
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                <StatCard
                    title="Services"
                    value={stats.services}
                    onClick={() => setActiveTab('services')}
                    icon={<Zap size={22} strokeWidth={1.75} />}
                />
                <StatCard
                    title="Projects"
                    value={stats.projects}
                    onClick={() => setActiveTab('projects')}
                    icon={<Rocket size={22} strokeWidth={1.75} />}
                />
                <StatCard
                    title="Skills"
                    value={stats.skills}
                    onClick={() => setActiveTab('skills')}
                    icon={<Award size={22} strokeWidth={1.75} />}
                />
                <StatCard
                    title="Testimonials"
                    value={stats.testimonials}
                    onClick={() => setActiveTab('testimonials')}
                    icon={<Star size={22} strokeWidth={1.75} />}
                />
                <StatCard
                    title="Blog Posts"
                    value={stats.blogs}
                    onClick={() => setActiveTab('blogs')}
                    icon={<FileText size={22} strokeWidth={1.75} />}
                />
            </div>
        </div>
    );
};

export default Dashboard;
