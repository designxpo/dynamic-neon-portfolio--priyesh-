
import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  positionTitle: string;
  companyName: string;
  startYear: string;
  endYear: string;
  description?: string;
  order: number;
}

const ExperienceSchema: Schema = new Schema({
  positionTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  startYear: { type: String, required: true },
  endYear: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default (mongoose.models.Experience as mongoose.Model<IExperience>) || mongoose.model<IExperience>('Experience', ExperienceSchema);
