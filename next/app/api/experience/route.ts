import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Experience from '@/models/Experience';

// GET all experiences (sorted by order)
export async function GET() {
  await connectDB();
  const experiences = await Experience.find({}).sort({ order: 1 }).lean();
  return NextResponse.json(experiences);
}

// CREATE new experience
export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  const created = await Experience.create(body);
  return NextResponse.json(created);
}

// UPDATE experience by _id
export async function PUT(request: Request) {
  await connectDB();
  const body = await request.json();
  const { _id, ...update } = body;
  if (!_id) {
    return NextResponse.json({ error: 'Missing _id in payload' }, { status: 400 });
  }
  const updated = await Experience.findByIdAndUpdate(_id, update, { new: true });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE experience by _id
export async function DELETE(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get('_id');
  if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
  const deleted = await Experience.findByIdAndDelete(_id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
