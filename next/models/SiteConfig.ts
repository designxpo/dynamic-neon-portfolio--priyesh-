import mongoose, { Schema, models, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  mockHeroData,
  mockServicesData,
  mockProjectsData,
  mockExperiencesData,
  mockEducationsData,
  mockSkillsData,
  mockTestimonialsData,
  mockContactData,
} from '@/data/mockData';

const siteConfigSchema = new Schema(
  {
    hero: Schema.Types.Mixed,
    services: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
    experiences: [Schema.Types.Mixed],
    educations: [Schema.Types.Mixed],
    skills: [Schema.Types.Mixed],
    testimonials: [Schema.Types.Mixed],
    contact: Schema.Types.Mixed,
    blogs: [Schema.Types.Mixed],
    seo: Schema.Types.Mixed,
    chatbot: Schema.Types.Mixed,
    siteMeta: Schema.Types.Mixed,
    categories: [String],
    /** Scrypt hash of the admin password ("salt:hash"). Never stored in plaintext. */
    adminPasswordHash: { type: String, default: '' },
    /** @deprecated plaintext password — kept only for backwards-compat migration, cleared on first login */
    adminPassword: { type: String, default: '' },
    baseline: { type: Schema.Types.Mixed, required: false },
    lastUpdated: { type: Date, default: Date.now },
    dataVersion: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export interface SiteConfigDoc extends mongoose.Document {
  hero: any;
  services: any[];
  projects: any[];
  experiences: any[];
  educations: any[];
  skills: any[];
  testimonials: any[];
  contact: any;
  blogs: any[];
  seo?: any;
  chatbot?: any;
  siteMeta?: any;
  categories?: string[];
  adminPasswordHash?: string;
  adminPassword?: string; // @deprecated
  lastUpdated?: Date;
  dataVersion?: number;
}

function buildDefaults() {
  return {
    hero: { ...mockHeroData, profileImage: { url: '/images/profile.png', alternativeText: 'Priyesh Mishra' } },
    services: mockServicesData,
    projects: mockProjectsData.map(p => ({ ...p })),
    experiences: mockExperiencesData,
    educations: mockEducationsData,
    skills: mockSkillsData,
    testimonials: mockTestimonialsData.map(t => ({
      ...t,
      // Prefer a curated local avatar when available; otherwise fall back to pravatar
      avatar: (t.clientName && t.clientName.toLowerCase().includes('pranab'))
        ? { url: '/images/pranab.jpeg', alternativeText: t.clientName }
        : { url: `https://i.pravatar.cc/150?u=${t.clientName.replace(/\s/g, '')}`, alternativeText: t.clientName }
    })),
    contact: mockContactData,
    blogs: [
      {
        id: uuidv4(),
        title: 'YouTube Studio App Redesign — UI Case Study',
        author: 'Priyesh Mishra',
        content: 'A creator-centric UI case study where I redesigned the YouTube Studio mobile app to make analytics and channel management more intuitive and visually appealing.',
        excerpt: 'Redesigning YouTube Studio for clearer analytics and faster on-the-go tasks.',
        url: 'https://priyeshmishra1602.medium.com/youtube-studio-app-redesign-ui-case-study-by-priyesh-mishra-d4a7158563eb',
        thumbnail: { url: '/images/Youtube_Studio_App_redesign_UI%20Case_Study.webp', alternativeText: 'YouTube Studio App redesign UI case study' },
        publishedAt: new Date('2025-10-28').toISOString(),
      },
      {
        id: uuidv4(),
        title: 'The Graphic Advantage: How Visual Storytelling Boosts ROI in Today’s Market',
        author: 'Priyesh Mishra',
        content: 'In today’s hyper-competitive landscape, businesses need more than just a good product or service to succeed. They need a strong visual identity that resonates with their target audience and drives significant return on investment (ROI). This is where graphic design becomes an essential weapon in the arsenal of any modern business, be it a fledgling startup or an established corporation.',
        excerpt: 'Why visual storytelling is a growth lever — and how design compounds ROI.',
        url: 'https://priyeshmishra1602.medium.com/the-graphic-advantage-how-visual-storytelling-boosts-roi-in-todays-market-8b3b1dfaedfb',
        thumbnail: { url: '/images/Graphic_Advantage.webp', alternativeText: 'The Graphic Advantage' },
        publishedAt: new Date('2023-12-09').toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Case Study: Growing an Instagram Following from 0 to 100,000 in 6 Months',
        author: 'Priyesh Mishra',
        content: 'To gain 100,000 followers on Instagram in 6 months by consistently posting videos and engaging with the audience.',
        excerpt: 'The system behind scaling an Instagram audience to 100k in half a year.',
        url: 'https://priyeshmishra1602.medium.com/case-study-growing-an-instagram-following-from-0-to-100-000-in-6-months-f18763ea8ef8',
        thumbnail: { url: '/images/Spiritualtalksofficial.png', alternativeText: 'Instagram growth case study' },
        publishedAt: new Date('2023-12-03').toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Case Study: Forensic Library App UI Design by DesignXpo',
        author: 'Priyesh Mishra',
        content: 'To design a user interface for a forensic library app that is easy to use and navigate, and that provides users with quick and easy access to the forensic materials and ebooks they need.',
        excerpt: 'Designing a dense library UI that stays simple, scannable, and fast.',
        url: 'https://priyeshmishra1602.medium.com/case-study-forensic-library-app-ui-design-by-designxpo-719fe96acb11',
        thumbnail: { url: '/images/Forensic_Library_App.webp', alternativeText: 'Forensic Library App UI' },
        publishedAt: new Date('2023-10-30').toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Application Where Skill Got Admired: Digital Video Sharing Platform',
        author: 'Priyesh Mishra',
        content: 'In this modern era, where almost everything is digitalized our project gives a platform to many people who wants to compete/ grow in their fields. It’s a people based entertainment service in which competitions will be held and one who got highest vote in a given interval wins the battle and will be greeted by a cash prize.',
        excerpt: 'Building a video platform where creators compete and audiences decide.',
        url: 'https://priyeshmishra1602.medium.com/application-where-skill-got-admired-digital-video-sharing-platform-395f469edd7f',
        thumbnail: { url: '/images/Digital_App.webp', alternativeText: 'Digital video sharing platform' },
        publishedAt: new Date('2021-12-30').toISOString(),
      }
    ],
  categories: ['Apps', 'Branding', 'UI/UX', 'Web'],
    chatbot: {
      enabled: true,
      name: 'Prism',
      greeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me about design, branding, or creative strategy — I’ll help and answer in Priyesh’s voice.',
      bookingUrl: 'https://calendar.app.google/bTfdiZGjeXZGqbeu9',
      bookingDescription: 'A collaborative 30-minute call to understand each other’s work and creative process. We’ll talk about your design goals, review your portfolio or brand, and identify how my expertise can help you craft experiences that truly connect.',
      showBookingQuickReply: true,
      placeholders: {},
      rules: [
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service','ui','ux','design','branding','strategy','website','app'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. I also help teams align business goals with user needs through user-centric digital design. You can browse my full list here: /#services' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: "What’s your design process?", keywords: ['process','workflow','approach','steps','how you work','method','design journey'], reply: 'My design process typically includes:\n1️⃣ Discovery & Research – Understanding user needs and business goals.\n2️⃣ Wireframing – Structuring the core experience.\n3️⃣ Visual Design – Building brand-aligned interfaces.\n4️⃣ Prototyping & Testing – Validating usability and flow.\n5️⃣ Delivery – Preparing developer-ready assets.\nYou can explore my detailed process here: /#process' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can I see your work?', keywords: ['work','portfolio','examples','projects','case studies','showcase'], reply: 'Absolutely! You can view my recent projects showcasing UI/UX design, web design, and branding here: /#work. Each case study highlights my approach, tools used, and design outcomes.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What are your rates?', keywords: ['pricing','rates','cost','charge','budget','packages','how much'], reply: 'My pricing depends on the project scope, complexity, and timeline. For smaller UI/UX design projects, I offer fixed packages. For ongoing work, I work on a retainer or hourly basis. Let\'s discuss your needs here: /#pricing' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How can we work together?', keywords: ['collaborate','start','hire','contact','get started','work with you','onboarding'], reply: 'I\'d love to collaborate! The best way to start is by sharing a few details about your project. You can schedule a quick intro call or fill out my inquiry form here: /#contact' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What tools do you use?', keywords: ['tools','stack','software','design tools','programs','apps'], reply: 'I mainly work with Figma, Adobe XD, Photoshop, and Illustrator for design — plus Notion, FigJam, and Miro for strategy and collaboration.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: "What\'s your experience?", keywords: ['experience','background','skills','career','years','education'], reply: 'I\'m a UI/UX designer with 8+ years of experience working across startups and enterprise products. My background combines design systems, user research, and brand storytelling to deliver seamless digital experiences.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How long will it take?', keywords: ['time','duration','timeline','delivery','how long','deadline'], reply: 'Most projects take between 2–6 weeks, depending on scope and complexity. I usually start with a discovery phase to define the exact timeline and milestones.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Do you allow revisions?', keywords: ['revision','edit','feedback','changes','update'], reply: 'Yes, of course! Every project includes 2–3 rounds of revisions to make sure the final result aligns perfectly with your vision and feedback.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Are you available for new projects?', keywords: ['available','open','accepting','new projects','booking','schedule'], reply: 'I\'m currently accepting new projects this month! You can check my availability or book a quick discovery call here: /#contact' },
      ],
    },
    adminPasswordHash: '', // set on first login via ADMIN_PASSWORD env var
    siteMeta: {
      title: 'Priyesh Mishra — UI/UX Designer & Developer Portfolio',
      description: 'Portfolio website of Priyesh Mishra, UI/UX designer and developer specializing in digital product design, usability, and creative strategy.',
      keywords: 'Priyesh Mishra, UI UX designer, product designer, web designer, frontend developer, design systems, portfolio',
      authors: [{ name: 'Priyesh Mishra' }],
      robots: 'index, follow',
      icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/images/favicon.png' },
      openGraph: {
        title: 'Priyesh Mishra — UI/UX Designer & Developer Portfolio',
        description: 'Portfolio website of Priyesh Mishra, UI/UX designer and developer specializing in digital product design, usability, and creative strategy.',
        siteName: 'Priyesh Mishra',
        type: 'website',
        images: [{ url: '/images/profile.png', width: 800, height: 800, alt: 'Priyesh Mishra — UI/UX Designer' }]
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Priyesh Mishra — UI/UX Designer & Developer Portfolio',
        description: 'Portfolio website of Priyesh Mishra, UI/UX designer and developer specializing in digital product design, usability, and creative strategy.',
        images: ['/images/profile.png']
      }
    },
  };
}

siteConfigSchema.statics.getSingleton = async function (): Promise<SiteConfigDoc> {
  const Model = this as mongoose.Model<SiteConfigDoc> & { getSingleton: () => Promise<SiteConfigDoc> };
  let doc = await Model.findOne();
  
  if (!doc) {
    const isProduction = process.env.NODE_ENV === 'production';
    const forceSeeding = process.env.FORCE_DB_SEEDING === 'true';
    
    if (isProduction && !forceSeeding) {
      // In production, never auto-seed unless explicitly forced
      console.log('Production mode: Skipping automatic data seeding. Use FORCE_DB_SEEDING=true if needed.');
      throw new Error('No site configuration found. Please initialize data manually in production.');
    }
    
    // Development mode or explicitly forced seeding
    console.log('Creating initial SiteConfig document...');
    doc = await Model.create(buildDefaults());
    console.log('SiteConfig initialized successfully');
  }
  
  return doc;
};

// Safe method to get or create config without auto-seeding
siteConfigSchema.statics.getOrCreate = async function (): Promise<SiteConfigDoc> {
  const Model = this as mongoose.Model<SiteConfigDoc> & { getOrCreate: () => Promise<SiteConfigDoc> };
  let doc = await Model.findOne();
  
  if (!doc) {
    // Create minimal document in production without defaults
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      doc = await Model.create({
        hero: { name: 'Portfolio Owner', role: 'Professional' },
        services: [],
        projects: [],
        experiences: [],
        educations: [],
        skills: [],
        testimonials: [],
        contact: { email: 'contact@example.com' },
        blogs: [],
        categories: ['General'],
        adminPasswordHash: '',
        lastUpdated: new Date()
      });
      console.log('Created minimal production SiteConfig');
    } else {
      doc = await Model.create(buildDefaults());
      console.log('Created development SiteConfig with defaults');
    }
  }
  
  return doc;
};

export interface SiteConfigModel extends mongoose.Model<SiteConfigDoc> {
  getSingleton(): Promise<SiteConfigDoc>;
  getOrCreate(): Promise<SiteConfigDoc>;
}

export default (models.SiteConfig as SiteConfigModel) || model<SiteConfigDoc, SiteConfigModel>('SiteConfig', siteConfigSchema);
