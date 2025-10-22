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
        className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-brand-purple text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
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
        <div className="w-64 bg-white border-r flex flex-col h-full shadow-lg">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
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
            <div className="p-4 border-t">
                <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
