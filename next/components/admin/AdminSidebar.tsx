// @ts-nocheck
import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard, Target, Zap, Rocket, Briefcase, GraduationCap,
  Award, Star, FileText, Mail, Inbox, Settings, LogOut, Search,
  MessageCircle, FileCog, Tags, Calculator,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

interface NavItem {
  tab: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NavLink: React.FC<{
  tabName: string;
  label: string;
  icon: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ tabName, label, icon, activeTab, setActiveTab }) => {
  const isActive = activeTab === tabName;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(tabName)}
      aria-current={isActive ? 'page' : undefined}
      className={`admin-sidebar-link ${isActive ? 'is-active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const groups: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.75} /> },
      ],
    },
    {
      title: 'Content',
      items: [
        { tab: 'hero',       label: 'Hero Section', icon: <Target size={18} strokeWidth={1.75} /> },
        { tab: 'services',   label: 'Services',     icon: <Zap size={18} strokeWidth={1.75} /> },
        { tab: 'projects',   label: 'Projects',     icon: <Rocket size={18} strokeWidth={1.75} /> },
        { tab: 'categories', label: 'Categories',   icon: <Tags size={18} strokeWidth={1.75} /> },
        { tab: 'pricing',    label: 'Cost Estimator', icon: <Calculator size={18} strokeWidth={1.75} /> },
      ],
    },
    {
      title: 'About',
      items: [
        { tab: 'experience',   label: 'Experience',   icon: <Briefcase size={18} strokeWidth={1.75} /> },
        { tab: 'education',    label: 'Education',    icon: <GraduationCap size={18} strokeWidth={1.75} /> },
        { tab: 'skills',       label: 'Skills',       icon: <Award size={18} strokeWidth={1.75} /> },
        { tab: 'testimonials', label: 'Testimonials', icon: <Star size={18} strokeWidth={1.75} /> },
        { tab: 'blogs',        label: 'Blog Posts',   icon: <FileText size={18} strokeWidth={1.75} /> },
      ],
    },
    {
      title: 'Engagement',
      items: [
        { tab: 'contact',             label: 'Contact Info',        icon: <Mail size={18} strokeWidth={1.75} /> },
        { tab: 'contact-submissions', label: 'Submissions',         icon: <Inbox size={18} strokeWidth={1.75} /> },
      ],
    },
    {
      title: 'System',
      items: [
        { tab: 'seo',      label: 'SEO',      icon: <Search size={18} strokeWidth={1.75} /> },
        { tab: 'metadata', label: 'Metadata', icon: <FileCog size={18} strokeWidth={1.75} /> },
        { tab: 'chatbot',  label: 'Chatbot',  icon: <MessageCircle size={18} strokeWidth={1.75} /> },
        { tab: 'settings', label: 'Settings', icon: <Settings size={18} strokeWidth={1.75} /> },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Header — brand */}
      <div className="admin-sidebar-header" style={{ display: 'block' }}>
        <Image
          src="/images/pmlogo.svg"
          alt="Priyesh Mishra"
          width={716}
          height={200}
          priority
          className="h-9 w-auto"
        />
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-2"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Admin Panel
        </div>
      </div>

      {/* Nav — grouped */}
      <nav className="admin-sidebar-nav">
        {groups.map((group, gi) => (
          <div key={group.title}>
            <div className="admin-sidebar-group" aria-hidden="true">{group.title}</div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.tab}
                  tabName={item.tab}
                  label={item.label}
                  icon={item.icon}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — logout */}
      <div className="admin-sidebar-footer">
        <button
          type="button"
          onClick={onLogout}
          className="admin-sidebar-link is-danger"
        >
          <LogOut size={18} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
