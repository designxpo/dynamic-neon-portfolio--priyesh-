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
    adminPassword: 'admin',
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
