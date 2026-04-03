import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { connectDB, isDBHealthy } from '../../../../lib/db/mongoose';
import Testimonial from '@/models/Testimonial';
import { isAuthenticated } from '../../../../lib/adminAuth';

// Admin Testimonials API
// GET: list testimonials
// POST: create a testimonial
// Note: Per-item updates/deletes are handled in ./[id]/route.ts

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  try {
    if (!(await isDBHealthy())) {
      console.warn('[Admin Testimonials] DB not healthy, attempting reconnection');
    }
    await connectDB();
    const items = await Testimonial.find({}, {
      name: 1,
      role: 1,
      message: 1,
      avatar: 1,
      createdAt: 1,
      _id: 1,
    }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[Admin Testimonials] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  try {
    if (!(await isDBHealthy())) {
      console.warn('[Admin Testimonials] DB not healthy, attempting reconnection');
    }
    await connectDB();
    const payload = await req.json();
    const created = await Testimonial.create(payload);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('[Admin Testimonials] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create testimonial' }, { status: 500 });
  }
}
 
