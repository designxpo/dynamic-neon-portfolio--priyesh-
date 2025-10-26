// @ts-nocheck
import React from 'react';
import { LayoutDashboard, Target, Zap, Rocket, Briefcase, GraduationCap, Award, Star, FileText, Mail, Inbox, Settings, LogOut, Search, MessageCircle, FileCog } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
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
      onClick={() => setActiveTab(tabName)}
      className={`group relative w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
      }`}
    >
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-electric-blue rounded-r-full shadow-glow-blue"></div>
      )}
            
      <div className="flex items-center gap-3 relative z-10">
        <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </div>
            
      {/* Hover glow effect */}
      {!isActive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 to-transparent rounded-xl"></div>
        </div>
      )}
    </button>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { tab: 'hero', label: 'Hero Section', icon: <Target size={18} /> },
    { tab: 'services', label: 'Services', icon: <Zap size={18} /> },
    { tab: 'projects', label: 'Projects', icon: <Rocket size={18} /> },
    { tab: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
    { tab: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
    { tab: 'skills', label: 'Skills', icon: <Award size={18} /> },
    { tab: 'testimonials', label: 'Testimonials', icon: <Star size={18} /> },
    { tab: 'blogs', label: 'Blog Posts', icon: <FileText size={18} /> },
    { tab: 'contact', label: 'Contact Info', icon: <Mail size={18} /> },
    { tab: 'contact-submissions', label: 'Contact Submissions', icon: <Inbox size={18} /> },
  ];

  const bottomNavItems = [
    { tab: 'seo', label: 'SEO', icon: <Search size={18} /> },
    { tab: 'metadata', label: 'Metadata', icon: <FileCog size={18} /> },
    { tab: 'chatbot', label: 'Chatbot', icon: <MessageCircle size={18} /> },
    { tab: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-72 backdrop-blur-2xl bg-gradient-to-b from-black/40 via-black/30 to-black/40 border-r border-white/10 flex flex-col h-full shadow-2xl relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent"></div>
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-electric-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-deep-violet/10 rounded-full blur-3xl"></div>
            
      {/* Logo and Title */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex flex-col items-start gap-2">
          <div className="relative">
            <img
              src="/images/pmlogo.png"
              alt="Logo"
              className="h-16 w-auto"
            />
          </div>
          <div className="text-left flex items-baseline gap-2">
            <h2 className="text-xs text-gray-500 tracking-wider uppercase">Dashboard</h2>
            <p className="text-sm font-semibold text-white tracking-tight">Admin Panel</p>
          </div>
        </div>
      </div>
            
      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
        {navItems.map(item => (
          <NavLink
            key={item.tab}
            tabName={item.tab}
            label={item.label}
            icon={item.icon}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </nav>
            
      {/* Bottom Navigation */}
      <div className="relative z-10 p-4 border-t border-white/10 space-y-1.5">
        {bottomNavItems.map(item => (
          <NavLink
            key={item.tab}
            tabName={item.tab}
            label={item.label}
            icon={item.icon}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
                
        <button
          onClick={onLogout}
          className="group relative w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 relative z-10">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <LogOut size={18} />
            </span>
            <span className="font-medium text-sm tracking-wide">Logout</span>
          </div>
                    
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
