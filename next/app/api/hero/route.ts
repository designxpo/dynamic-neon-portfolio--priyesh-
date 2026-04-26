import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Hero from '@/models/Hero';

export async function GET() {
  await connectDB();
  let hero = await (Hero as any).findOne({}).sort({ createdAt: -1 }).exec();
  if (!hero) {
    // Return default object if no document exists
    hero = {
      name: '',
      title: '',
      titlePrefix: '',
      titleWords: [],
      titlePairs: [],
      subtitle: '',
      shortBio: '',
      profileImage: { url: '', alternativeText: '' },
      ctaButtonText: '',
      ctaButtonLink: '',
      secondaryCtaText: '',
      secondaryCtaLink: '',
      stats: [],
      socialLinks: [],
      description: '',
      createdAt: new Date(),
    };
  } else {
    // Ensure typing animation fields always exist
    if (typeof hero.titlePrefix === 'undefined') hero.titlePrefix = '';
    if (!Array.isArray(hero.titleWords)) hero.titleWords = [];
    if (!Array.isArray(hero.titlePairs)) hero.titlePairs = [];
  }
  return NextResponse.json(hero);
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const data = await req.json();
    const hero = new Hero(data);
    await hero.save();
    return NextResponse.json(hero, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.errors }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  await connectDB();
  try {
    const data = await req.json();
    const updated = await (Hero as any).findOneAndUpdate({}, data, { new: true, runValidators: true }).exec();
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.errors }, { status: 400 });
  }
}

export async function DELETE() {
  await connectDB();
  await (Hero as any).deleteMany({}).exec();
  return NextResponse.json({ success: true });
}
