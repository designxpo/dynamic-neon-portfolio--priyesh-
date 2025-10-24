import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Contact from '@/models/Contact';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, contactNumber, message } = body || {};

    if (!name || !email || !contactNumber || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const saved = await Contact.create({ name, email, contactNumber, message });
    return NextResponse.json({ message: 'Contact form submitted successfully', contact: saved }, { status: 201 });
  } catch (err) {
    console.error('Error saving contact:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    return NextResponse.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
