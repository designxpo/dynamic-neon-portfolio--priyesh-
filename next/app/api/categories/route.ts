import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Category from '@/models/Category';

export async function GET() {
  await connectDB();
  const categories = await Category.find({}).sort({ order: 1, createdAt: 1 }).exec();
  const mapped = categories.map((c: any) => ({
    id: c._id?.toString(),
    name: c.name,
    description: c.description || '',
    order: typeof c.order === 'number' ? c.order : 0,
    createdAt: c.createdAt?.toISOString() || '',
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const category = new Category({
    name: typeof data?.name === 'string' ? data.name.trim() : '',
    description: data?.description ?? '',
    order: typeof data?.order === 'number' ? data.order : 0,
  });
  await category.save();
  return NextResponse.json(category, { status: 201 });
}
