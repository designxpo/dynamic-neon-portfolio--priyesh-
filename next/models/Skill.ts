import mongoose, { Schema, Document } from 'mongoose';


export interface ISkill extends Document {
  name: string;
  level?: string;
  icon?: string;
  order?: number;
  createdAt: Date;
}

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  level: { type: String, required: false },
  icon: { type: String },
  order: { type: Number, default: 0, index: true },
  image: {
    url: { type: String, default: '' },
    alternativeText: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Skill || mongoose.model<any>('Skill', SkillSchema);
