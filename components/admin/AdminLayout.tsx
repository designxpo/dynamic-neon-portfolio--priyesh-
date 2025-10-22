import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const tabTitles: { [key: string]: string } = {
        dashboard: 'Dashboard',
        hero: 'Hero Section',
        services: 'Services',
        projects: 'Projects',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        testimonials: 'Testimonials',
        blogs: 'Blogs',
        contact: 'Contact Information',
        'contact-submissions': 'Contact Submissions',
        settings: 'Settings',
    };
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-purple-900/20 font-sans relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/5 to-transparent"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>

            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="glass shadow-lg p-4 border-b border-white/10">
                    <h1 className="text-2xl font-bold gradient-text">{tabTitles[activeTab] || 'Dashboard'}</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="glass p-8 rounded-lg shadow-2xl min-h-full border border-white/10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
