import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
  page: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[] | string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const SEOSchema: Schema = new Schema({
  page: { type: String, required: true, unique: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  metaKeywords: { type: Schema.Types.Mixed },
  canonicalUrl: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
}, { timestamps: true, strict: false });

export default mongoose.models.SEO || mongoose.model<ISEO>('SEO', SEOSchema);
