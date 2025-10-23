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
        blogs: 'Blog Posts',
    seo: 'SEO',
        contact: 'Contact Information',
        'contact-submissions': 'Contact Submissions',
        settings: 'Settings',
    };

    const currentDate = new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
    });
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d1f] to-[#1a0a2e] font-sans relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            
            {/* Floating orbs for depth */}
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-deep-violet/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Top Header Bar */}
                <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb navigation */}
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">Home</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-electric-blue font-medium">{tabTitles[activeTab] || 'Dashboard'}</span>
                        </div>
                        
                        {/* Right side - Date and user info */}
                        <div className="flex items-center gap-6">
                            <div className="text-sm text-gray-400">
                                {currentDate}
                            </div>
                            
                            {/* User profile indicator */}
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-deep-violet flex items-center justify-center text-white font-bold text-sm shadow-glow-blue">
                                    PM
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Main Content - Properly constrained scrollable area */}
                <main className="flex-1 p-8 scrollbar-thin" style={{ 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    height: 'calc(100vh - 72px)', /* 72px = header height */
                    maxHeight: 'calc(100vh - 72px)'
                }}>
                    <div className="max-w-7xl mx-auto h-full">
                        {/* Content card with glassmorphism */}
                        <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-10 relative overflow-visible">
                            {/* Subtle top glow */}
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent"></div>
                            
                            {/* Content */}
                            <div className="relative z-10">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
