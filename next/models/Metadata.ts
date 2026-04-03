import mongoose, { Schema, InferSchemaType, models, model } from 'mongoose';

const MetadataSchema = new Schema({
  title: String,
  description: String,
  keywords: String,
  robots: { type: String, default: 'index, follow' },
  icons: {
    icon: String,
    shortcut: String,
    apple: String,
  },
  authors: [{ name: String, url: String }],
  openGraph: {
    title: String,
    description: String,
    url: String,
    siteName: String,
    type: { type: String, default: 'website' },
    images: [
      { url: String, width: Number, height: Number, alt: String }
    ],
  },
  twitter: {
    card: { type: String, default: 'summary_large_image' },
    title: String,
    description: String,
    images: [String],
  },
}, { timestamps: true });

export type MetadataDoc = InferSchemaType<typeof MetadataSchema> & { _id: mongoose.Types.ObjectId };

export default (models.Metadata as mongoose.Model<MetadataDoc>) || model<MetadataDoc>('Metadata', MetadataSchema);
