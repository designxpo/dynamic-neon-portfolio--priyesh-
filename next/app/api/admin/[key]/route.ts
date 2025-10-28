import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { connectDB, isDBHealthy } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';
import { v4 as uuidv4 } from 'uuid';

const allowedKeys = new Set([
  'hero', 'services', 'projects', 'experiences', 'educations', 'skills',
  'testimonials', 'contact', 'blogs', 'seo', 'chatbot', 'siteMeta',
  'categories', 'adminPassword'
]);

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  try {
    // First check if connection is healthy
    if (!(await isDBHealthy())) {
      console.log(`${key}: DB not healthy, attempting reconnection`);
    }
    
    await connectDB();
    const cfg = await SiteConfig.getOrCreate();
    let value = (cfg as any)[key as keyof typeof cfg];
    
    if (key === 'chatbot') {
      const bot = (value || {}) as any;
      const rules = Array.isArray(bot.rules) ? bot.rules : [];
      if (!rules || rules.length === 0) {
        const prefilled = [
          { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service'], reply: 'I offer UI/UX design and product strategy.' },
          { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can we book a call?', keywords: ['book','call'], reply: 'Yes, you can book a call.' }
        ];
        (cfg as any).chatbot = { ...bot, rules: prefilled };
        await cfg.save();
        value = (cfg as any).chatbot;
      }
    }
    
    return NextResponse.json(value ?? null);
  } catch (error) {
    console.error(`GET ${key} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  try {
    // First check if connection is healthy
    if (!(await isDBHealthy())) {
      console.log(`${key}: DB not healthy, attempting reconnection`);
    }
    
    await connectDB();
    const payload = await req.json();
    const cfg = await SiteConfig.getOrCreate();
    (cfg as any)[key] = payload;
    cfg.lastUpdated = new Date();
    cfg.dataVersion = (cfg.dataVersion || 1) + 1;
    await cfg.save();
    return NextResponse.json({ ok: true, lastUpdated: cfg.lastUpdated });
  } catch (error) {
    console.error(`PUT ${key} error:`, error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}