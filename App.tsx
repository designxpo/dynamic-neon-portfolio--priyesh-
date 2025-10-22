import React, { useState, useEffect } from 'react';
import PortfolioPage from './PortfolioPage';
import LoginPage from './components/admin/LoginPage';
import AdminPanel from './components/admin/AdminPanel';
import ProjectDetailPage from './components/ProjectDetailPage';
import { getAdminPassword, resetDbToDefaults } from './lib/db';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // In development, reset the DB to defaults so local changes don't block updates
      if ((import.meta as any).env?.MODE !== 'production') {
        try { resetDbToDefaults(); } catch (e) { /* ignore */ }
      }
      // Client-side only effects
      setIsAdmin(sessionStorage.getItem('isAdmin') === 'true');
      setLocation(window.location.hash);

      const onHashChange = () => {
        setLocation(window.location.hash);
      };
      window.addEventListener('hashchange', onHashChange);
      return () => window.removeEventListener('hashchange', onHashChange);
    }
  }, []);
  
  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdmin');
      setIsAdmin(false);
      window.location.hash = ''; // Redirect to homepage
    }
  };
  
  const password = getAdminPassword();

  if (location.startsWith('#/admin')) {
    if (isAdmin) {
      return <AdminPanel onLogout={handleLogout} />;
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} password={password} />;
  }

  const projectMatch = location.match(/^#\/project\/(.*)$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    return <ProjectDetailPage projectId={projectId} />;
  }


  return <PortfolioPage />;
};

export default App;
