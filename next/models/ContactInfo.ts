import mongoose, { Schema, Document } from 'mongoose';

export interface IContactInfo extends Document {
  heading: string;
  description: string;
  email: string;
  phone: string;
  socialLinks: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  notifyUserOnSubmit?: boolean;
  notifyAdminOnSubmit?: boolean;
  notifyEmail?: string;
}

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
});

const ContactInfoSchema = new Schema<IContactInfo>({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  socialLinks: { type: [SocialLinkSchema], default: [] },
  notifyUserOnSubmit: { type: Boolean, default: false },
  notifyAdminOnSubmit: { type: Boolean, default: false },
  notifyEmail: { type: String, default: '' },
});

export default (mongoose.models.ContactInfo as mongoose.Model<IContactInfo>) || mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);
