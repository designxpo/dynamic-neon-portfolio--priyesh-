import mongoose, { Schema, Model, Document } from 'mongoose';
export interface IService extends Document {
  id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const ServiceSchema = new Schema<IService>({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
});

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
export default Service;
