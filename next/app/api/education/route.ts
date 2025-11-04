import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Education from '@/models/Education';

// GET all educations (sorted by order)
export async function GET() {
  await connectDB();
  const educations = await Education.find({}).sort({ order: 1, updatedAt: -1 }).lean();
  console.log('[Education API] Found documents:', educations?.length);
  console.log('[Education API] Raw data sample:', JSON.stringify(educations?.[0], null, 2));
  
  // Normalize possible legacy fields (course/university) to degree/institution
  const normalized = (educations || []).map((e: any) => ({
    ...e,
    _id: e._id,
    id: e._id?.toString(),
    degree: e.degree || e.course || '',
    institution: e.institution || e.university || '',
    startYear: e.startYear || e.start || '',
    endYear: e.endYear || e.end || '',
    description: e.description || '',
    order: e.order ?? 0,
  }));
  
  console.log('[Education API] Normalized sample:', JSON.stringify(normalized?.[0], null, 2));
  return NextResponse.json(normalized);
}

// CREATE new education
export async function POST(request: Request) {
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
  await connectDB();
  const body = await request.json();
  const { _id, ...update } = body;
  if (!_id) {
    return NextResponse.json({ error: 'Missing _id in payload' }, { status: 400 });
  }
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
  await connectDB();
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get('_id');
  if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
  const deleted = await Education.findByIdAndDelete(_id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
