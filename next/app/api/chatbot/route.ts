import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import ChatbotSettings from '@/models/ChatbotSettings';
import { requireAdmin } from '@/lib/adminAuth';

// POST /api/chatbot
export async function POST(req: Request) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    console.log('Chatbot POST received:', body);
    try {
      // Treat POST as upsert to avoid creating duplicates accidentally
      const latest = await ChatbotSettings.findOne({}, {}, { sort: { updatedAt: -1 } });
      // Normalize payload: accept `greeting` or `initialGreeting`
      const patch: any = { ...body };
      if (!patch.initialGreeting && patch.greeting) patch.initialGreeting = patch.greeting;
      if (Array.isArray(patch.customQA)) {
        patch.customQA = patch.customQA
          // Keep rules that have a reply and at least one trigger: question, keywords, or regex
          .filter((q: any) => {
            if (!q || typeof q !== 'object') return false;
            const hasReply = !!(q.reply && String(q.reply).trim());
            const hasQuestion = !!(q.question && String(q.question).trim());
            const hasKeywords = Array.isArray(q.keywords) ? q.keywords.filter((k: any) => !!String(k || '').trim()).length > 0 : false;
            const hasRegex = !!(q.regex && String(q.regex).trim());
            return hasReply && (hasQuestion || hasKeywords || hasRegex);
          })
          .map((q: any) => ({
            ...q,
            keywords: Array.isArray(q.keywords)
              ? q.keywords
              : (typeof q.keywords === 'string' ? q.keywords.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          }));
      }
      let settings;
      if (latest) {
        settings = await ChatbotSettings.findByIdAndUpdate(latest._id, patch, { new: true });
      } else {
        settings = await ChatbotSettings.create(patch);
      }
      console.log('ChatbotSettings upserted via POST:', settings?._id);
      return NextResponse.json(settings);
    } catch (createErr) {
      console.error('Error upserting ChatbotSettings via POST:', createErr);
      return NextResponse.json({ error: 'Failed to save settings', details: createErr }, { status: 500 });
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
    // Always return the most recently updated settings document
    let settings = await ChatbotSettings.findOne({}, {}, { sort: { updatedAt: -1 } }).lean();
    if (!settings) {
      const created = await ChatbotSettings.create({
        enabled: true,
        name: 'Chatbot',
        initialGreeting: 'Hello! How can I help you today?',
        bookingUrl: '',
        bookingDescription: '',
        showBookingQuickReply: true,
        placeholders: [],
        customQA: []
      });
      // align with .lean() return shape
      settings = created.toObject();
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error('[ChatbotSettings GET] DB error:', err?.message || err);
    return NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 });
  }
}

// PUT /api/chatbot
export async function PUT(req: Request) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    console.log('[ChatbotSettings PUT] Received body:', JSON.stringify(body, null, 2));
    const patch: any = { ...body };
    if (!patch.initialGreeting && patch.greeting) patch.initialGreeting = patch.greeting;
    // Clean customQA: remove only truly invalid entries, convert keywords to array
    patch.customQA = Array.isArray(patch.customQA)
      ? patch.customQA
          // Keep rules that have a reply and at least one trigger: question, keywords, or regex
          .filter((q: any) => {
            if (!q || typeof q !== 'object') return false;
            const hasReply = !!(q.reply && String(q.reply).trim());
            const hasQuestion = !!(q.question && String(q.question).trim());
            const hasKeywords = Array.isArray(q.keywords) ? q.keywords.filter((k: any) => !!String(k || '').trim()).length > 0 : false;
            const hasRegex = !!(q.regex && String(q.regex).trim());
            return hasReply && (hasQuestion || hasKeywords || hasRegex);
          })
          .map((q: any) => ({
            ...q,
            keywords: Array.isArray(q.keywords)
              ? q.keywords
              : (typeof q.keywords === 'string' ? q.keywords.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          }))
      : [];
    // Update the most recent doc if it exists; otherwise insert
    const latest = await ChatbotSettings.findOne({}, {}, { sort: { updatedAt: -1 } });
    let settings;
    if (latest) {
      settings = await ChatbotSettings.findByIdAndUpdate(latest._id, patch, { new: true });
    } else {
      settings = await ChatbotSettings.create(patch);
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error('[ChatbotSettings PUT] DB error:', err?.message || err);
    return NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 });
  }
}
