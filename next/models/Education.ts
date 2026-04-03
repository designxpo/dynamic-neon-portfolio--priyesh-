
import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  description?: string;
  order: number;
}

const EducationSchema: Schema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  startYear: { type: String, required: true },
  endYear: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default (mongoose.models.Education as mongoose.Model<IEducation>) || mongoose.model<IEducation>('Education', EducationSchema);
