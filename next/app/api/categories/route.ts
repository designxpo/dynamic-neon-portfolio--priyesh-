import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Category from '@/models/Category';

export async function GET() {
  await connectDB();
  const categories = await Category.find({}).sort({ createdAt: -1 }).exec();
  const mapped = categories.map((c) => ({
    id: c._id?.toString(),
    name: c.name,
    description: c.description || '',
    createdAt: c.createdAt?.toISOString() || '',
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  console.log('Category data to be saved:', data);
  const category = new Category(data);
  await category.save();
  return NextResponse.json(category, { status: 201 });
}
