import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Experience from '@/models/Experience';

// GET one experience by id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const doc = await Experience.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

// UPDATE one experience by id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const body = await req.json();
  const { id, _id, ...update } = body || {};
  const targetId = params.id || _id || id;
  if (!targetId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updated = await Experience.findByIdAndUpdate(targetId, update, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE one experience by id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const deleted = await Experience.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
