import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  descriptionShort: string;
  descriptionLong?: string;
  category: string;
  categories?: string[];
  coverImage?: { url: string; alternativeText?: string };
  featured: boolean;
  technologies?: string[];
  liveUrl?: string;
  sourceUrl?: string;
  outcome?: string;       // e.g., "Increased sign-ups by 40%"
  clientName?: string;    // visible or anonymized ("Series-A SaaS startup")
  timeline?: string;      // e.g., "6 weeks" / "Q1 2025"
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  descriptionShort: { type: String, required: true },
  descriptionLong: { type: String },
  category: { type: String, required: true },
  categories: [{ type: String }],
  coverImage: {
    url: { type: String },
    alternativeText: { type: String },
  },
  featured: { type: Boolean, default: false },
  technologies: [{ type: String }],
  liveUrl: { type: String },
  sourceUrl: { type: String },
  outcome: { type: String, default: '' },
  clientName: { type: String, default: '' },
  timeline: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

export default mongoose.models.Project || mongoose.model<any>('Project', ProjectSchema);
