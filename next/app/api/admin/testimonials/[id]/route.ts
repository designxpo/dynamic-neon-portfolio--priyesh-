import { connectDB } from '@/lib/db/mongoose';
import Testimonial from '@/models/Testimonial';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const updated = await Testimonial.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Testimonial.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
