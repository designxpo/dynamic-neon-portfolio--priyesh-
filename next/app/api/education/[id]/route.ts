import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Education from '@/models/Education';

// GET one education by id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const doc = await Education.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

// UPDATE one education by id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const body = await req.json();
  const { id, _id, ...update } = body || {};
  const targetId = params.id || _id || id;
  if (!targetId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updated = await Education.findByIdAndUpdate(targetId, update, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE one education by id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const deleted = await Education.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
