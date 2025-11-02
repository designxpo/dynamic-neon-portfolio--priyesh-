import Service, { IService } from '../models/Service';
import mongoose from 'mongoose';

export async function getServices(): Promise<IService[]> {
  const services = await Service.find({}).sort({ order: 1 }).lean<IService[]>();
  console.log('[ServiceController] getServices returned:', services);
  return services;
}

export async function createService(data: Partial<IService>): Promise<IService> {
  const service = new Service(data);
  const saved = await service.save();
  if (!saved.id || saved.id !== String(saved._id)) {
    saved.id = String(saved._id);
    await saved.save();
  }
  return saved;
}


export async function updateService(id: string, data: Partial<IService>): Promise<IService | null> {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Service.findByIdAndUpdate(id, data, { new: true }).lean<IService | null>();
  }
  // Try to find by custom id field
  return await Service.findOneAndUpdate({ id }, data, { new: true }).lean<IService | null>();
}

export async function deleteService(id: string): Promise<IService | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid service ID');
  return await Service.findByIdAndDelete(id).lean<IService | null>();
}
