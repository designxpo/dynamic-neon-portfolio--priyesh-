import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Education from '@/models/Education';
import { requireAdmin } from '@/lib/adminAuth';
import { badObjectId } from '@/lib/objectId';

// GET all educations (sorted by order)
export async function GET() {
  try {
    await connectDB();
    const educations = await Education.find({}).sort({ order: 1, updatedAt: -1 }).lean();
    
    // Normalize possible legacy fields (course/university) to degree/institution
    const normalized = (educations || []).map((e: any) => {
      // Ensure all required fields are present
      const result = {
        _id: e._id,
        id: e._id?.toString() || e.id || '',
        degree: e.degree || e.course || '',
        institution: e.institution || e.university || '',
        startYear: e.startYear || e.start || '',
        endYear: e.endYear || e.end || '',
        description: e.description || '',
        order: typeof e.order === 'number' ? e.order : 0,
      };
      
      // Log in production to debug
      if (process.env.NODE_ENV === 'production') {
        console.log('[Education API Production] Returning:', result);
      }
      
      return result;
    });
    
    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[Education API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch education data' }, { status: 500 });
  }
}

// CREATE new education
export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  await connectDB();
  const body = await request.json();
  const payload = {
    ...body,
    degree: body.degree || body.course,
    institution: body.institution || body.university,
  };
  const created = await Education.create(payload);
  return NextResponse.json(created);
}

// UPDATE education by _id
export async function PUT(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  await connectDB();
  const body = await request.json();
  const { _id, ...update } = body;
  if (!_id) {
    return NextResponse.json({ error: 'Missing _id in payload' }, { status: 400 });
  }
  const bad = badObjectId(_id); if (bad) return bad;
  const payload = {
    ...update,
    degree: update.degree || (update as any).course,
    institution: update.institution || (update as any).university,
  };
  const updated = await Education.findByIdAndUpdate(_id, payload, { new: true });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE education by _id
export async function DELETE(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  await connectDB();
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get('_id');
  if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
  const bad = badObjectId(_id); if (bad) return bad;
  const deleted = await Education.findByIdAndDelete(_id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
