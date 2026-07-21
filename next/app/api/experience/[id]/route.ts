import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Experience from '@/models/Experience';
import { requireAdmin } from '@/lib/adminAuth';
import { badObjectId } from '@/lib/objectId';

// GET one experience by id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const bad = badObjectId(params.id); if (bad) return bad;
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
  const denied = requireAdmin(req); if (denied) return denied;
  await connectDB();
  const body = await req.json();
  const { id, _id, ...update } = body || {};
  const targetId = params.id || _id || id;
  const bad = badObjectId(targetId); if (bad) return bad;
  const updated = await Experience.findByIdAndUpdate(targetId, update, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE one experience by id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(req); if (denied) return denied;
  const bad = badObjectId(params.id); if (bad) return bad;
  await connectDB();
  const deleted = await Experience.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
