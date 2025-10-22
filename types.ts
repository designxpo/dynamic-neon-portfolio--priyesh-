import React from 'react';

export interface Image {
  url: string;
  alternativeText?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface RawSocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string; // Icon name as string
}

export interface Stat {
  id: string;
  label: string;
  value: string;
}

export interface HeroData {
  name: string;
  title: string;
  shortBio: string;
  profileImage: Image;
  ctaButtonText: string;
  ctaButtonLink: string;
  stats: Stat[];
  socialLinks: SocialLink[];
}

export interface RawHeroData {
  name: string;
  title: string;
  shortBio: string;
  profileImage: Image;
  ctaButtonText: string;
  ctaButtonLink: string;
  stats: Stat[];
  socialLinks: RawSocialLink[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  order: number;
}

export interface RawService {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name as string
  order: number;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  descriptionShort: string;
  descriptionLong?: string;
  coverImage: Image;
  featured: boolean;
  technologies?: string[];
  liveUrl?: string;
  sourceUrl?: string;
}

export interface RawProject {
    id: string;
    title: string;
    category: string;
    descriptionShort: string;
    descriptionLong?: string;
    coverImage: Image;
    featured: boolean;
    technologies?: string[];
    liveUrl?: string;
    sourceUrl?: string;
}

export interface Experience {
  id: string;
  positionTitle: string;
  companyName: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface Education {
  id: string;
  courseTitle: string;
  instituteName: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface Skill {
  id: string;
  skillName: string;
  icon: string;
  image?: Image;
}

export interface RawSkill {
    id: string;
    skillName: string;
    skillIcon: string;
    image?: Image;
}


export interface Testimonial {
  id: string;
  clientName: string;
  roleCompany: string;
  quote: string;
  avatar: Image;
}

export interface RawTestimonial {
    id: string;
    clientName: string;
    roleCompany: string;
    quote: string;
    avatar: Image;
}

export interface ContactData {
    heading: string;
    description: string;
    email: string;
    phone: string;
    socialLinks: SocialLink[];
}

export interface RawContactData {
    heading: string;
    description: string;
    email: string;
    phone: string;
    socialLinks: RawSocialLink[];
}

export interface BlogData {
  title: string;
  content: string;
  author: string;
  publishedAt: string; // ISO string date
}

export interface Blog extends BlogData {
  id: string;
}

export interface PortfolioData {
  hero: HeroData | null;
  services: Service[];
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  testimonials: Testimonial[];
  contact: ContactData | null;
}

export interface Database {
  hero: RawHeroData;
  services: RawService[];
  projects: RawProject[];
  experiences: Experience[];
  educations: Education[];
  skills: RawSkill[];
  testimonials: RawTestimonial[];
  contact: RawContactData;
  blogs: Blog[];
  adminPassword?: string;
}