import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  categories: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: string;
  url?: string;
  thumbnail?: { url: string; alternativeText?: string };
  excerpt?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  categories: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: String },
  url: { type: String },
  thumbnail: {
    url: { type: String },
    alternativeText: { type: String },
  },
  excerpt: { type: String },
  slug: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
}, { strict: false });

export default mongoose.models.Blog || mongoose.model<any>('Blog', BlogSchema);
