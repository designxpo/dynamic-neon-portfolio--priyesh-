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
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">{tabTitles[activeTab] || 'Dashboard'}</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-md min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
