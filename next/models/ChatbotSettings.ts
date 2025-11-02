
export interface IPlaceholder {
  key: string;
  value: string;
}

export interface ICustomQARule {
  question: string;
  reply: string;
  keywords: string[];
  matchMode: 'any' | 'all';
  regex?: string;
  enabled: boolean;
}

export interface IChatbotSettings extends Document {
  enabled: boolean;
  name: string;
  initialGreeting: string;
  bookingUrl: string;
  bookingDescription: string;
  showBookingQuickReply: boolean;
  placeholders: IPlaceholder[];
  customQA: ICustomQARule[];
}

import mongoose, { Schema, Document } from 'mongoose';

  const PlaceholderSchema: Schema = new Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
  }, { _id: false });

  const CustomQARuleSchema: Schema = new Schema({
    question: { type: String, required: true },
    reply: { type: String, required: true },
    keywords: [{ type: String }],
    matchMode: { type: String, enum: ['any', 'all'], default: 'any' },
    regex: { type: String },
    enabled: { type: Boolean, default: true }
  }, { _id: false });

  const ChatbotSettingsSchema: Schema = new Schema({
    enabled: { type: Boolean, default: true },
    name: { type: String, required: true },
    initialGreeting: { type: String, required: true },
    bookingUrl: { type: String, default: '' },
    bookingDescription: { type: String, default: '' },
    showBookingQuickReply: { type: Boolean, default: true },
    placeholders: { type: [PlaceholderSchema], default: [] },
    customQA: { type: [CustomQARuleSchema], default: [] }
  }, { timestamps: true });

import { InferSchemaType, models, model } from 'mongoose';

export type ChatbotSettingsDoc = InferSchemaType<typeof ChatbotSettingsSchema> & { _id: mongoose.Types.ObjectId };

export default (models.ChatbotSettings as mongoose.Model<ChatbotSettingsDoc>) || model<ChatbotSettingsDoc>('ChatbotSettings', ChatbotSettingsSchema);
