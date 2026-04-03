import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();
    const start = Date.now();
    const testimonials = await Testimonial.find({}, {
      name: 1,
      role: 1,
      message: 1,
      avatar: 1,
      createdAt: 1,
      _id: 1
    }).sort({ createdAt: -1 }).lean();
    const mapped = testimonials.map((t) => ({
      id: t._id?.toString(),
      ...t,
      createdAt: t.createdAt?.toISOString() || '',
    }));
    const duration = Date.now() - start;
    console.log(`[API] /testimonials GET took ${duration}ms`);
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('[Testimonials API] GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch testimonials', details: error }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const testimonial = new Testimonial(data);
    await testimonial.save();
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('[Testimonials API] POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create testimonial', details: error }, { status: 500 });
  }
}
