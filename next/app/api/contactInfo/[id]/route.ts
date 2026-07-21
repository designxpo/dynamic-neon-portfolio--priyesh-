import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ContactInfo from '@/models/ContactInfo';
import { requireAdmin } from '@/lib/adminAuth';

// PUT: Update contact info by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  await dbConnect();
  try {
    const body = await req.json();
  const info = await ContactInfo.findByIdAndUpdate(params.id, body, { new: true });
    if (!info) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: info });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete contact info by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  await dbConnect();
  try {
  const info = await ContactInfo.findByIdAndDelete(params.id);
    if (!info) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: info });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
