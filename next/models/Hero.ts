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

export default mongoose.models.Hero || mongoose.model<IHero>('Hero', HeroSchema);
