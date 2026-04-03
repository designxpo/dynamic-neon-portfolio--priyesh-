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
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model<any>('Project', ProjectSchema);
