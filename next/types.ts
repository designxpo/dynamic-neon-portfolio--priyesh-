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

export interface TitlePair {
  prefix: string;
  word: string;
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
  // Typing animation fields
  titlePrefix?: string;
  titleWords?: string[];
  // New: paired (prefix, word) entries that cycle together. If present and
  // non-empty, takes precedence over titlePrefix/titleWords.
  titlePairs?: TitlePair[];
}

export interface RawHeroData {
  subtitle: string;
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
  // Typing animation fields
  titlePrefix?: string;
  titleWords?: string[];
  titlePairs?: TitlePair[];
}

export interface Service {
  id: string;
    _id?: string;
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
    _id?: string;
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
  outcome?: string;
  clientName?: string;
  timeline?: string;
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
    outcome?: string;
    clientName?: string;
    timeline?: string;
}

export interface Experience {
  id: string;
    _id?: string;
  positionTitle: string;
  companyName: string;
  startYear: string;
  endYear: string;
  current?: boolean;
  description: string;
}

export interface Education {
  id: string;
  _id?: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  description: string;
}


export interface Skill {
  id: string;
  _id?: string;
  name: string;
  icon: string;
  image?: Image;
}

export interface RawSkill {
    id: string;
    name: string;
    icon: string;
    image?: Image;
}


export interface Testimonial {
  id: string;
    _id?: string;
  clientName: string;
  roleCompany: string;
  quote: string;
  avatar: Image;
}

export interface RawTestimonial {
    id: string;
      _id?: string;
    clientName: string;
    roleCompany: string;
    quote: string;
    avatar: Image;
}

export interface ContactData {
    heading: string;
      _id?: string;
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
  // MongoDB document id (for updates)
  id?: string;
  _id?: string;
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
  // Lifecycle + SEO
  published?: boolean; // draft if false, live if true
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Blog extends BlogData {
  id: string;
}

// --- SEO ---
export type SectionKey =
  | 'home'
  | 'hero'
  | 'about'
  | 'services'
  | 'projects'
  | 'experience'
  | 'process'
  | 'education'
  | 'skills'
  | 'testimonials'
  | 'blogs'
  | 'contact';

export interface SeoMeta {
  metaTitle: string;
  metaKeywords: string; // comma-separated keywords for simplicity
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
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
  /** @deprecated Password is stored server-side as a hash; never expose on client */
  adminPassword?: never;
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
  name: string;
  initialGreeting: string;
  bookingUrl: string;
  bookingDescription: string;
  showBookingQuickReply: boolean;
  placeholders: any[]; // now array, not object
  customQA: CustomQARule[];
}

export interface CustomQARule {
  enabled: boolean;
  matchMode: string;
  question: string;
  keywords: string[];
  reply: string;
}

export interface ChatbotRule {
  id: string;
  question: string;
  keywords: string[];
  reply: string;
  regex?: string;
  match: 'any' | 'all';
  caseSensitive?: boolean;
  enabled: boolean;
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
