import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  order?: number;
  createdAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Re-register if the cached model is missing a path we just added (e.g.
// `order`). Without this, Next.js HMR keeps the old compiled schema and
// strict-mode silently drops new fields on save.
const cached = (mongoose.models as any).Category as mongoose.Model<any> | undefined;
const expectedPaths = Object.keys((CategorySchema as any).paths || {});
const cachedPaths = cached ? Object.keys((cached.schema as any).paths || {}) : [];
const isStale = cached && expectedPaths.some((p) => !cachedPaths.includes(p));
if (isStale) {
  mongoose.deleteModel('Category');
}
export default (mongoose.models as any).Category || mongoose.model<any>('Category', CategorySchema);
