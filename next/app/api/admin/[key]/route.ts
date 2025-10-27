import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';
import { v4 as uuidv4 } from 'uuid';

const allowedKeys = new Set([
  'hero',
  'services',
  'projects',
  'experiences',
  'educations',
  'skills',
  'testimonials',
  'contact',
  'blogs',
  'seo',
  'chatbot',
  'siteMeta',
  'categories',
  'adminPassword'
]);

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  // If DB is not configured, avoid attempting a connection to prevent noisy errors
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  await connectDB();
  const cfg = await SiteConfig.getSingleton();
  // @ts-ignore
  let value = (cfg as any)[key as keyof typeof cfg];
  // One-time migration: prefill chatbot rules if missing/empty
  if (key === 'chatbot') {
    const bot = (value || {}) as any;
    const rules = Array.isArray(bot.rules) ? bot.rules : [];
    if (!rules || rules.length === 0) {
      const prefilled = [
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service','ui','ux','design','branding','strategy'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. You can browse a quick overview here: /#services' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can we book a call?', keywords: ['book','call','meeting','schedule','calendar','chat'], reply: 'Absolutely — you can book a 30‑min intro here: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How can I contact you?', keywords: ['contact','email','reach','connect','message'], reply: 'You can email me at {email} or use the contact form: {contactLink}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What are your rates?', keywords: ['price','pricing','rates','cost','budget','quote'], reply: 'I scope per‑project based on goals and complexity. Share a bit about your needs or book a quick call and I’ll tailor a quote: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What’s your experience?', keywords: ['experience','background','years','worked','clients','brands'], reply: 'I’ve designed for startups and brands across industries. You can skim highlights here: /#experience' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can I see your work?', keywords: ['portfolio','projects','case study','work','examples'], reply: 'Sure — recent projects and case studies are here: /#projects' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Do you have testimonials?', keywords: ['testimonials','reviews','feedback','clients say'], reply: 'Yes — client feedback is here: /#testimonials' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What tools do you use?', keywords: ['skills','tools','stack','figma','framer','react','next','tailwind','design system'], reply: 'I work with Figma, Framer, React/Next.js, Tailwind, and design systems. See more here: /#skills' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Where are you based?', keywords: ['location','based','timezone','country','time zone'], reply: 'I’m based in India (IST, UTC+5:30) and work async with global teams.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Are you available?', keywords: ['availability','available','taking projects','capacity','start date'], reply: 'I’m currently accepting new projects. Want to compare calendars? {bookingUrl}' },
      ];
      (cfg as any).chatbot = { ...bot, rules: prefilled };
      await cfg.save();
      value = (cfg as any).chatbot;
    }
  }
  return NextResponse.json(value ?? null);
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key;
  if (!allowedKeys.has(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  await connectDB();
  const payload = await req.json();
  const cfg = await SiteConfig.getSingleton();
  // @ts-ignore
  (cfg as any)[key] = payload;
  await cfg.save();
  return NextResponse.json({ ok: true });
}
