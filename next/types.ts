import React from 'react';

export interface Image {
  url: string;
  alternativeText?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  // Using 'any' to avoid ReactNode type conflicts across environments during migration
  icon: any;
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
  // Optional secondary CTA button
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  stats: Stat[];
}

export interface RawHeroData {
  name: string;
  title: string;
  shortBio: string;
  profileImage: Image;
  ctaButtonText: string;
  ctaButtonLink: string;
  // Optional secondary CTA button
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  stats: Stat[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  // Using 'any' to avoid ReactNode type conflicts across environments during migration
  icon: any;
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
  category: string; // primary category (back-compat)
  categories?: string[]; // multiple categories supported
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
  category: string; // primary category (back-compat)
  categories?: string[]; // multiple categories supported
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
  // Email notifications (optional)
  notifyUserOnSubmit?: boolean; // send confirmation to the submitter
  notifyAdminOnSubmit?: boolean; // send notification to admin/owner
  notifyEmail?: string; // optional override for admin notification recipient; defaults to `email`
}

export interface RawContactData {
    heading: string;
    description: string;
    email: string;
    phone: string;
  socialLinks: RawSocialLink[];
  // Email notifications (optional)
  notifyUserOnSubmit?: boolean;
  notifyAdminOnSubmit?: boolean;
  notifyEmail?: string;
}

export interface BlogData {
  title: string;
  content: string;
  author: string;
  publishedAt: string; // ISO string date
  // Added for portfolio blog cards
  url?: string; // external link (e.g., Medium)
  thumbnail?: Image; // card image
  excerpt?: string; // short description shown on the card
}

export interface Blog extends BlogData {
  id: string;
}

// --- SEO ---
export type SectionKey =
  | 'home'
  | 'hero'
  | 'services'
  | 'projects'
  | 'experience'
  | 'education'
  | 'skills'
  | 'testimonials'
  | 'blogs'
  | 'contact';

export interface SeoMeta {
  metaTitle: string;
  metaKeywords: string; // comma-separated keywords for simplicity
  metaDescription: string;
}

export type SEOConfig = Record<SectionKey, SeoMeta>;

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
  seo?: SEOConfig; // optional for backward compatibility
  adminPassword?: string;
  // Optional chatbot settings for admin-managed assistant config
  chatbot?: ChatbotSettings;
  // Optional site metadata for admin-managed SEO/OG/Twitter
  siteMeta?: SiteMetadata;
  // Optional global category list for ordering and admin management
  categories?: string[];
}

// --- Chatbot / Assistant settings ---
export interface ChatbotSettings {
  enabled: boolean;
  name: string; // Display name in header
  greeting: string; // Initial assistant greeting to seed conversation
  bookingUrl?: string;
  bookingDescription?: string;
  showBookingQuickReply?: boolean;
  // Admin-defined placeholders available in rule replies, e.g. {company}, {cta}
  placeholders?: Record<string, string>;
  rules?: ChatbotRule[]; // Custom Q&A triggers
}

export interface ChatbotRule {
  id: string;
  question?: string; // optional phrase to match
  keywords?: string[]; // any keyword triggers a match
  reply: string; // assistant reply when matched
  enabled?: boolean; // default true
  match?: 'any' | 'all'; // keyword match mode (default: any)
  caseSensitive?: boolean; // default false
  regex?: string; // optional regex pattern
}

// --- Site Metadata (subset of Next Metadata) ---
export interface SiteMetadata {
  title?: string;
  description?: string;
  keywords?: string; // comma-separated
  authors?: { name: string; url?: string }[];
  robots?: string;
  icons?: {
    icon?: string;
    shortcut?: string;
    apple?: string;
  };
  openGraph?: {
    title?: string;
    description?: string;
    siteName?: string;
    type?: 'website' | 'article' | 'profile' | string;
    url?: string;
    images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | string;
    title?: string;
    description?: string;
    images?: string[];
  };
}
