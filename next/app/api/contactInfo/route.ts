
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import ContactInfo from '@/models/ContactInfo';

// GET: Fetch all contact info
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const info = await ContactInfo.findById(id).lean();
      return NextResponse.json({ success: true, data: info });
    } else {
      const infos = await ContactInfo.find({}).lean();
      return NextResponse.json({ success: true, data: infos });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// POST: Create new contact info
export async function POST(req: Request) {
  await dbConnect();
  try {
    console.log('Mongoose DB name:', mongoose.connection.name);
    console.log('ContactInfo collection name:', ContactInfo.collection.name);
    const body = await req.json();
    console.log('📥 Data received from frontend:', body);
    const info = new ContactInfo(body);
    console.log('✅ Data prepared for DB:', info);
    await info.save();
    console.log('✅ Data successfully saved!');
    return NextResponse.json({ success: true, data: info });
  } catch (error) {
    console.error('❌ Error while saving:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PUT handler removed. Use /api/contactInfo/[id] for updates.

// DELETE: Delete contact info by ID
export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }
  await ContactInfo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
