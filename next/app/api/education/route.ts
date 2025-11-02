import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Education from '@/models/Education';

// GET all educations (sorted by order)
export async function GET() {
  await connectDB();
  const educations = await Education.find({}).sort({ order: 1 }).lean();
  return NextResponse.json(educations);
}

// CREATE new education
export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  const created = await Education.create(body);
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
  const updated = await Education.findByIdAndUpdate(_id, update, { new: true });
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
