import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
  page: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
}

const SEOSchema: Schema = new Schema({
  page: { type: String, required: true, unique: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  metaKeywords: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.SEO || mongoose.model<ISEO>('SEO', SEOSchema);
