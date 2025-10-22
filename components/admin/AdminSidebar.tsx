import React from 'react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const NavLink: React.FC<{
    tabName: string;
    label: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}> = ({ tabName, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 ${
            activeTab === tabName
                ? 'bg-brand-purple text-white shadow-lg neon-glow'
                : 'text-gray-300 hover:bg-brand-purple/20 hover:text-brand-purple hover:neon-glow-hover'
        }`}
    >
        {label}
    </button>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const navItems = [
        { tab: 'dashboard', label: 'Dashboard' },
        { tab: 'hero', label: 'Hero Section' },
        { tab: 'services', label: 'Services' },
        { tab: 'projects', label: 'Projects' },
        { tab: 'experience', label: 'Experience' },
        { tab: 'education', label: 'Education' },
        { tab: 'skills', label: 'Skills' },
        { tab: 'testimonials', label: 'Testimonials' },
        { tab: 'blogs', label: 'Blog Posts' },
        { tab: 'contact', label: 'Contact Info' },
        { tab: 'contact-submissions', label: 'Contact Submissions' },
        { tab: 'settings', label: 'Settings' },
    ];

    return (
        <div className="w-64 glass border-r border-white/10 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src="/images/pmlogo.png"
                        alt="Priyesh Mishra Logo"
                        className="h-8 w-auto"
                    />
                    <h2 className="text-xl font-bold gradient-text">Admin Panel</h2>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.tab}
                        tabName={item.tab}
                        label={item.label}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                ))}
            </nav>
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
