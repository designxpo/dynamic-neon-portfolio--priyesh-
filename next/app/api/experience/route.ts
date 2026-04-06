import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Experience from '@/models/Experience';

// GET all experiences (sorted by order)
export async function GET() {
  await connectDB();
  const experiences = await Experience.find({}).sort({ order: 1 }).lean();
  return NextResponse.json(experiences);
}

// CREATE new experience with basic validation
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const errors: Record<string, string> = {};
    const baseRequired: Array<keyof typeof body> = ['positionTitle', 'companyName', 'startYear'];
    for (const key of baseRequired) {
      const val = (body?.[key] ?? '').toString().trim();
      if (!val) errors[key as string] = 'Required';
    }
    const isCurrent = Boolean(body?.current);
    if (!isCurrent) {
      const endYearVal = (body?.endYear ?? '').toString().trim();
      if (!endYearVal) errors['endYear'] = 'Required';
    }
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 });
    }
    // Normalize payload, ignore client-side id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, order, description, current, ...rest } = body || {};
    const doc: any = {
      ...rest,
      description: (description ?? '').toString(),
    };
    if (typeof current === 'boolean') doc.current = current;
    if (doc.current && !doc.endYear) doc.endYear = 'Present';
    if (typeof order === 'number') doc.order = order; // else let default apply
    const created = await Experience.create(doc);
    return NextResponse.json(created);
  } catch (err: any) {
    console.error('[Experience POST] Error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to create experience', details: err?.message || err }, { status: 500 });
  }
}

// UPDATE experience by _id
export async function PUT(request: Request) {
  await connectDB();
  const body = await request.json();
  const { _id, ...update } = body;
  if (!_id) {
    return NextResponse.json({ error: 'Missing _id in payload' }, { status: 400 });
  }
  // If current is true and endYear isn't provided, enforce 'Present'
  if (update?.current === true && (!update.endYear || String(update.endYear).trim() === '')) {
    (update as any).endYear = 'Present';
  }
  const updated = await Experience.findByIdAndUpdate(_id, update, { new: true });
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE experience by _id
export async function DELETE(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get('_id');
  if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
  const deleted = await Experience.findByIdAndDelete(_id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
