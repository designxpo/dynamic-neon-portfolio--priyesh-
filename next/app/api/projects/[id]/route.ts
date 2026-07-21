import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/adminAuth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  await connectDB();
  const data = await req.json();
  const updated = await Project.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  await connectDB();
  const deleted = await Project.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
