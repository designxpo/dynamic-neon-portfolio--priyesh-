import { NextResponse } from 'next/server';
import { getServices, createService, updateService, deleteService } from '@/lib/serviceController';
import { dbConnect } from '@/lib/db';
async function getHandler() {
  try {
    console.log('[Service API] GET handler start');
    console.time('dbConnect');
    await dbConnect();
    console.timeEnd('dbConnect');
    console.log('[Service API] DB connected');
    console.time('getServices');
    const services = await getServices();
    console.timeEnd('getServices');
    console.log(`[Service API] Fetched ${services.length} services`);
    return NextResponse.json(services);
  } catch (error) {
    console.error('[Service API] GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch services', details: error }, { status: 500 });
  }
}

async function postHandler(request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log('[Service API] POST received:', data);
    const service = await createService(data);
    console.log('[Service API] POST saved:', service);
    return NextResponse.json(service);
  } catch (error) {
    console.error('[Service API] POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save service', details: error }, { status: 500 });
  }
}

async function putHandler(request) {
  try {
    await dbConnect();
    const data = await request.json();
    if (Array.isArray(data)) {
      console.log('[Service API] PUT batch update start');
      // Validate required fields
      const requiredFields = ['title', 'description', 'icon', 'order'];
      for (const item of data) {
        for (const field of requiredFields) {
          if (!item[field]) {
            throw new Error(`Missing required field '${field}' in service batch update`);
          }
        }
      }
      // Remove all existing services, then insert new ones
      const Service = (await import('@/models/Service')).default;
      console.time('deleteMany');
      await Service.deleteMany({});
      console.timeEnd('deleteMany');
      console.time('insertMany');
      const inserted = await Service.insertMany(data);
      console.timeEnd('insertMany');
      console.log(`[Service API] Inserted ${inserted.length} services`);
      // Update each inserted service to set 'id' to '_id' in the database
      await Promise.all(inserted.map(async (s) => {
        if (!s.id || s.id !== String(s._id)) {
          await Service.findByIdAndUpdate(s._id, { id: String(s._id) });
        }
      }));
      // Re-query all services from the database to ensure latest persisted data
      const allServices = await Service.find({}).sort({ order: 1 }).lean();
      const mapped = allServices.map(s => ({
        id: s.id || String(s._id),
        title: s.title,
        description: s.description,
        icon: s.icon,
        order: s.order
      }));
      return NextResponse.json(mapped);
    } else {
      // Single update
      // Accept both 'id' and '_id' for compatibility
      const { id, _id, ...update } = data;
      const serviceId = id || _id;
      if (!serviceId) throw new Error('Missing service id');
      const service = await updateService(serviceId, update);
      return NextResponse.json(service);
    }
  } catch (error) {
    console.error('Service PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update service', details: error }, { status: 500 });
  }
}

async function deleteHandler(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete service', details: error }, { status: 500 });
  }
}

export { getHandler as GET, postHandler as POST, putHandler as PUT, deleteHandler as DELETE };
