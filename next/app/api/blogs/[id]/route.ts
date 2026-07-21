import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Blog from '@/models/Blog';
import { requireAdmin } from '@/lib/adminAuth';
import { badObjectId } from '@/lib/objectId';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const bad = badObjectId(params.id); if (bad) return bad;
  await connectDB();
  const data = await req.json();
  const updated = await Blog.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const bad = badObjectId(params.id); if (bad) return bad;
  await connectDB();
  const deleted = await Blog.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
