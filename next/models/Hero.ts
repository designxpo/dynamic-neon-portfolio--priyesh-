import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
  title: string;
  subtitle: string;
  profileImage: { url: string; alternativeText?: string };
  description?: string;
  socialLinks?: Array<{ name: string; url: string; icon?: string }>;
  createdAt: Date;
}

const HeroSchema: Schema = new Schema({
  titlePrefix: { type: String },
  titleWords: [{ type: String }],
  titlePairs: [
    {
      prefix: { type: String },
      word: { type: String },
    },
  ],
  name: { type: String },
  title: { type: String },
  subtitle: { type: String },
  shortBio: { type: String },
  profileImage: {
    url: { type: String },
    alternativeText: { type: String },
  },
  ctaButtonText: { type: String },
  ctaButtonLink: { type: String },
  secondaryCtaText: { type: String },
  secondaryCtaLink: { type: String },
  description: { type: String },
  socialLinks: [
    {
      name: { type: String },
      url: { type: String },
      icon: { type: String },
    },
  ],
  stats: [
    {
      id: { type: String },
      label: { type: String },
      value: { type: String },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

// Mongoose caches compiled models on the global `mongoose.models` object,
// which survives Next.js HMR. If the cached model is missing a path we just
// added (e.g. `titlePairs`), strict-mode writes will silently drop the new
// field. Detect schema drift and re-register so dev picks up new fields
// automatically; in production this runs once and is then cached.
const cached = (mongoose.models as any).Hero as mongoose.Model<IHero> | undefined;
const expectedPaths = Object.keys((HeroSchema as any).paths || {});
const cachedPaths = cached ? Object.keys((cached.schema as any).paths || {}) : [];
const isStale = cached && expectedPaths.some((p) => !cachedPaths.includes(p));
if (isStale) {
  mongoose.deleteModel('Hero');
}
export default (mongoose.models as any).Hero || mongoose.model<IHero>('Hero', HeroSchema);
