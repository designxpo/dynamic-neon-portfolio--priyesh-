import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Education from '@/models/Education';
import { requireAdmin } from '@/lib/adminAuth';
import { badObjectId } from '@/lib/objectId';

// GET one education by id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const bad = badObjectId(params.id); if (bad) return bad;
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
  const denied = requireAdmin(req); if (denied) return denied;
  await connectDB();
  const body = await req.json();
  const { id, _id, ...update } = body || {};
  const targetId = params.id || _id || id;
  const bad = badObjectId(targetId); if (bad) return bad;
  const updated = await Education.findByIdAndUpdate(targetId, update, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE one education by id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(req); if (denied) return denied;
  const bad = badObjectId(params.id); if (bad) return bad;
  await connectDB();
  const deleted = await Education.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
