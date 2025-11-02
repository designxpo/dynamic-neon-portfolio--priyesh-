import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import ChatbotSettings from '@/models/ChatbotSettings';

// POST /api/chatbot
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('Chatbot POST received:', body);
    try {
      const settings = await ChatbotSettings.create(body);
      console.log('ChatbotSettings created via POST:', settings);
      return NextResponse.json(settings);
    } catch (createErr) {
      console.error('Error creating ChatbotSettings via POST:', createErr);
      return NextResponse.json({ error: 'Failed to create settings', details: createErr }, { status: 500 });
    }
  } catch (err) {
    console.error('General error in POST /api/chatbot:', err);
    return NextResponse.json({ error: 'Database connection failed', details: err }, { status: 500 });
  }
}

// GET /api/chatbot
export async function GET() {
  try {
    await connectDB();
    let settings = await ChatbotSettings.findOne({}).lean();
    if (!settings) {
      settings = await ChatbotSettings.create({
        enabled: true,
        name: 'Chatbot',
        initialGreeting: 'Hello! How can I help you today?',
        bookingUrl: '',
        bookingDescription: '',
        showBookingQuickReply: true,
        placeholders: [],
        customQA: []
      });
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error('[ChatbotSettings GET] DB error:', err?.message || err);
    return NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 });
  }
}

// PUT /api/chatbot
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('[ChatbotSettings PUT] Received body:', JSON.stringify(body, null, 2));
    // Clean customQA: remove only truly invalid entries, convert keywords to array
    let customQA = Array.isArray(body.customQA)
      ? body.customQA
          .filter(q => q && typeof q === 'object' && q.question && q.reply)
          .map(q => ({
            ...q,
            keywords: Array.isArray(q.keywords)
              ? q.keywords
              : (typeof q.keywords === 'string' ? q.keywords.split(',').map(s => s.trim()).filter(Boolean) : []),
          }))
      : [];
    body.customQA = customQA;
    // Upsert settings
    const settings = await ChatbotSettings.findOneAndUpdate({}, body, { upsert: true, new: true, setDefaultsOnInsert: true });
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error('[ChatbotSettings PUT] DB error:', err?.message || err);
    return NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 });
  }
}
