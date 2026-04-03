import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getServices, createService, updateService, deleteService } from '@/lib/serviceController';
import { dbConnect } from '@/lib/db';
import { isAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  try {
    await dbConnect();
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error('[Service API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();
    let data: unknown;
    try { data = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const service = await createService(data as any);
    return NextResponse.json(service);
  } catch (error) {
    console.error('[Service API] POST error:', error);
    return NextResponse.json({ error: 'Failed to save service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();
    let data: unknown;
    try { data = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (Array.isArray(data)) {
      // Validate required fields
      const required = ['title', 'description', 'icon', 'order'] as const;
      for (const item of data as any[]) {
        for (const field of required) {
          if (!item[field] && item[field] !== 0) {
            return NextResponse.json({ error: `Missing required field '${field}'` }, { status: 400 });
          }
        }
      }
      const Service = (await import('@/models/Service')).default;
      await Service.deleteMany({});
      const inserted = await Service.insertMany(data as any[]);
      // Sync string id field to match _id
      await Promise.all(inserted.map(async (s) => {
        if (!s.id || s.id !== String(s._id)) {
          await Service.findByIdAndUpdate(s._id, { id: String(s._id) });
        }
      }));
      const allServices = await Service.find({}).sort({ order: 1 }).lean();
      return NextResponse.json(allServices.map(s => ({
        id: (s as any).id || String(s._id),
        title: (s as any).title,
        description: (s as any).description,
        icon: (s as any).icon,
        order: (s as any).order,
      })));
    } else {
      const { id, _id, ...update } = data as any;
      const serviceId = id || _id;
      if (!serviceId) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
      const service = await updateService(serviceId, update);
      return NextResponse.json(service);
    }
  } catch (error) {
    console.error('[Service API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Service API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
