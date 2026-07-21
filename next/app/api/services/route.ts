import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    await dbConnect();
    const Service = (await import('../../../models/Service')).default;
    const start = Date.now();
    const services = await Service.find({}, {
      title: 1,
      description: 1,
      icon: 1,
      order: 1,
      _id: 1
    }).sort({ order: 1 }).lean();
    const duration = Date.now() - start;
    console.log(`[API] /services GET took ${duration}ms`);
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch services', details: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Service = (await import('../../../models/Service')).default;
    const data = await request.json();
    console.log("📥 Data received from frontend:", data);
    const service = await Service.create(data);
    console.log("✅ Data successfully saved!", service);
    return NextResponse.json(service);
  } catch (error) {
    console.error("❌ Error while saving:", error);
    return NextResponse.json({ error: error?.message || 'Failed to create service', details: error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Service = (await import('../../../models/Service')).default;
    const data = await request.json();
    const { id, ...update } = data;
    if (!id) throw new Error('Missing service id');
    const service = await Service.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to update service', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Service = (await import('../../../models/Service')).default;
    const { id } = await request.json();
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to delete service', details: error }, { status: 500 });
  }
}
