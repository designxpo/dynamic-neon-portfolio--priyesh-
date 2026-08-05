import mongoose, { Schema, InferSchemaType, models, model } from 'mongoose';

export const CONTACT_STATUSES = ['new', 'contacted', 'in-progress', 'won', 'lost'] as const;
export type ContactStatus = typeof CONTACT_STATUSES[number];

const contactSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  contactNumber: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  // Self-reported location (optional field on the form).
  location: { type: String, default: '', trim: true },
  // Auto-detected from the visitor's IP (CDN geo headers) at submit time.
  detectedLocation: {
    country: { type: String, default: '' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
  },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: CONTACT_STATUSES, default: 'new' },
  notes: { type: String, default: '' },
}, { strict: false });

export type ContactDoc = InferSchemaType<typeof contactSchema> & { _id: mongoose.Types.ObjectId };

export default (models.Contact as mongoose.Model<ContactDoc>) || model<ContactDoc>('Contact', contactSchema);
