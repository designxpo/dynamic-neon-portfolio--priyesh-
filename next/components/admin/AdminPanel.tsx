// @ts-nocheck
"use client";
import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import Dashboard from './forms/Dashboard';
import HeroForm from './forms/HeroForm';
import ServicesForm from './forms/ServicesForm';
import ProjectsForm from './forms/ProjectsForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import TestimonialsForm from './forms/TestimonialsForm';
import ContactForm from './forms/ContactForm';
import BlogsForm from './forms/BlogsForm';
import SettingsForm from './forms/SettingsForm';
import ContactSubmissions from './ContactSubmissions';
import SEOForm from './forms/SEOForm';
import ChatbotForm from './forms/ChatbotForm';
import MetadataForm from './forms/MetadataForm';
import CategoriesForm from './forms/CategoriesForm';

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'hero':
        return <HeroForm />;
      case 'services':
        return <ServicesForm />;
      case 'projects':
        return <ProjectsForm />;
      case 'categories':
        return <CategoriesForm />;
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <EducationForm />;
      case 'skills':
        return <SkillsForm />;
      case 'testimonials':
        return <TestimonialsForm />;
      case 'blogs':
        return <BlogsForm />;
      case 'seo':
        return <SEOForm />;
      case 'metadata':
        return <MetadataForm />;
      case 'chatbot':
        return <ChatbotForm />;
      case 'contact':
        return <ContactForm />;
      case 'contact-submissions':
        return <ContactSubmissions />;
      case 'settings':
        return <SettingsForm />;
      default:
        return <div>Select a section to edit</div>;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {renderContent()}
      </div>
    </AdminLayout>
  );
}
