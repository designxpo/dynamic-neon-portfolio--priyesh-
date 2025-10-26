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
    adminPassword: { type: String, default: 'admin' },
    baseline: { type: Schema.Types.Mixed, required: false },
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
  adminPassword?: string;
}

function buildDefaults() {
  return {
    hero: { ...mockHeroData, profileImage: { url: '/images/profile.png', alternativeText: 'Priyesh Mishra' } },
    services: mockServicesData,
    projects: mockProjectsData.map(p => ({ ...p })),
    experiences: mockExperiencesData,
    educations: mockEducationsData,
    skills: mockSkillsData,
    testimonials: mockTestimonialsData.map(t => ({ ...t, avatar: { url: `https://i.pravatar.cc/150?u=${t.clientName.replace(/\s/g, '')}`, alternativeText: t.clientName } })),
    contact: mockContactData,
    blogs: [
      {
        id: uuidv4(),
        title: 'Designing with Purpose: Practical UI/UX Guidelines',
        author: 'Priyesh Mishra',
        content: 'A quick field guide of heuristics and patterns I use to ship clean, accessible UIs that convert.',
        excerpt: 'Simple, proven UI/UX heuristics you can apply today to make products clearer and faster to use.',
        url: 'https://medium.com/',
        thumbnail: { url: 'https://picsum.photos/id/1015/800/450', alternativeText: 'Blog cover' },
        publishedAt: new Date().toISOString(),
      },
    ],
    chatbot: {
      enabled: true,
      name: 'Prism',
      greeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me about design, branding, or creative strategy — I’ll help and answer in Priyesh’s voice.',
      bookingUrl: 'https://calendar.app.google/bTfdiZGjeXZGqbeu9',
      bookingDescription: 'A collaborative 30-minute call to understand each other’s work and creative process. We’ll talk about your design goals, review your portfolio or brand, and identify how my expertise can help you craft experiences that truly connect.',
      showBookingQuickReply: true,
      placeholders: {},
      rules: [
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service','ui','ux','design','branding','strategy'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. You can browse a quick overview here: /#services' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can we book a call?', keywords: ['book','call','meeting','schedule','calendar','chat'], reply: 'Absolutely — you can book a 30‑min intro here: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How can I contact you?', keywords: ['contact','email','reach','connect','message'], reply: 'You can email me at {email} or use the contact form: {contactLink}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What are your rates?', keywords: ['price','pricing','rates','cost','budget','quote'], reply: 'I scope per‑project based on goals and complexity. Share a bit about your needs or book a quick call and I’ll tailor a quote: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What’s your experience?', keywords: ['experience','background','years','worked','clients','brands'], reply: 'I’ve designed for startups and brands across industries. You can skim highlights here: /#experience' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can I see your work?', keywords: ['portfolio','projects','case study','work','examples'], reply: 'Sure — recent projects and case studies are here: /#projects' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Do you have testimonials?', keywords: ['testimonials','reviews','feedback','clients say'], reply: 'Yes — client feedback is here: /#testimonials' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What tools do you use?', keywords: ['skills','tools','stack','figma','framer','react','next','tailwind','design system'], reply: 'I work with Figma, Framer, React/Next.js, Tailwind, and design systems. See more here: /#skills' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Where are you based?', keywords: ['location','based','timezone','country','time zone'], reply: 'I’m based in India (IST, UTC+5:30) and work async with global teams.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Are you available?', keywords: ['availability','available','taking projects','capacity','start date'], reply: 'I’m currently accepting new projects. Want to compare calendars? {bookingUrl}' },
      ],
    },
    adminPassword: 'admin',
    siteMeta: {
      title: 'Priyesh Mishra | UI/UX Designer',
      description: 'Portfolio of Priyesh Mishra, showcasing UI/UX design projects, case studies, and modern web interfaces.',
      keywords: 'Priyesh Mishra, Portfolio, UI/UX Designer, UI Design, UX Design, Web Design, Interaction Design, User Experience, User Interface',
      authors: [{ name: 'Priyesh Mishra' }],
      robots: 'index, follow',
      icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/images/favicon.png' },
      openGraph: {
        title: 'Priyesh Mishra | UI/UX Designer',
        description: 'Explore Priyesh Mishra’s portfolio showcasing UI/UX design projects, case studies, and modern web interfaces.',
        siteName: 'Priyesh Mishra',
        type: 'website',
        images: [{ url: '/images/profile.png', width: 800, height: 800, alt: 'Priyesh Mishra — UI/UX Designer' }]
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Priyesh Mishra | UI/UX Designer',
        description: 'Check out Priyesh Mishra’s UI/UX design portfolio with case studies and modern web interfaces.',
        images: ['/images/profile.png']
      }
    },
  };
}

siteConfigSchema.statics.getSingleton = async function (): Promise<SiteConfigDoc> {
  const Model = this as mongoose.Model<SiteConfigDoc> & { getSingleton: () => Promise<SiteConfigDoc> };
  let doc = await Model.findOne();
  if (!doc) {
    doc = await Model.create(buildDefaults());
  }
  return doc;
};

export interface SiteConfigModel extends mongoose.Model<SiteConfigDoc> {
  getSingleton(): Promise<SiteConfigDoc>;
}

export default (models.SiteConfig as SiteConfigModel) || model<SiteConfigDoc, SiteConfigModel>('SiteConfig', siteConfigSchema);
