import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { connectDB } from '../../../lib/db/mongoose';
import SiteConfig from '../../../models/SiteConfig';
import ChatbotSettings from '../../../models/ChatbotSettings';
import { rateLimit } from '../../../lib/rateLimit';
import { mockContactData, mockEducationsData, mockExperiencesData, mockHeroData, mockProjectsData, mockServicesData, mockSkillsData, mockTestimonialsData } from '../../../data/mockData';

type LLMProvider = 'openai' | 'azure-openai' | 'gemini';
type ChatMsg = { role: 'user' | 'assistant'; content: string };

function buildContextFromConfig(cfg: any) {
  // cfg is a SiteConfig document object; keep only readable bits
  const parts: string[] = [];
  const hero = cfg?.hero || mockHeroData;
  const services = cfg?.services || mockServicesData;
  const projects = cfg?.projects || mockProjectsData;
  const experiences = cfg?.experiences || mockExperiencesData;
  const educations = cfg?.educations || mockEducationsData;
  const skills = cfg?.skills || mockSkillsData;
  const testimonials = cfg?.testimonials || mockTestimonialsData;
  const contact = cfg?.contact || mockContactData;

  parts.push(`Name: ${hero?.name || 'N/A'}`);
  if (hero?.title) parts.push(`Title: ${hero.title}`);
  if (hero?.shortBio) parts.push(`Bio: ${hero.shortBio}`);

  const skillNames = (skills || []).map((s: any) => s.skillName || s.skillIcon).filter(Boolean);
  if (skillNames.length) parts.push(`Skills: ${skillNames.slice(0, 20).join(', ')}`);

  const projLines = (projects || []).slice(0, 10).map((p: any) => `- ${p.title} (${p.category})${p.descriptionShort ? `: ${p.descriptionShort}` : ''}`);
  if (projLines.length) parts.push(`Projects:\n${projLines.join('\n')}`);

  const expLines = (experiences || []).slice(0, 10).map((e: any) => `- ${e.positionTitle} @ ${e.companyName} (${e.startYear}–${e.endYear})`);
  if (expLines.length) parts.push(`Experience:\n${expLines.join('\n')}`);

  const eduLines = (educations || []).slice(0, 10).map((e: any) => `- ${e.degree} — ${e.institution} (${e.startYear}–${e.endYear})`);
  if (eduLines.length) parts.push(`Education:\n${eduLines.join('\n')}`);

  const serviceLines = (services || []).slice(0, 10).map((s: any) => `- ${s.title}: ${s.description}`);
  if (serviceLines.length) parts.push(`Services:\n${serviceLines.join('\n')}`);

  const testiLines = (testimonials || []).slice(0, 5).map((t: any) => `- "${t.quote}" — ${t.clientName}, ${t.roleCompany}`);
  if (testiLines.length) parts.push(`Testimonials:\n${testiLines.join('\n')}`);

  const contactParts: string[] = [];
  if (contact?.email) contactParts.push(`Email: ${contact.email}`);
  if (contact?.phone) contactParts.push(`Phone: ${contact.phone}`);
  const socials = (contact?.socialLinks || []).slice(0, 10).map((s: any) => `${s.platform}: ${s.url}`);
  if (socials.length) contactParts.push(`Socials: ${socials.join(' | ')}`);
  if (contactParts.length) parts.push(`Contact: ${contactParts.join(' | ')}`);

  return parts.join('\n');
}

async function getProfileContext(): Promise<string> {
  try {
    if (!process.env.MONGODB_URI) throw new Error('No DB configured');
    await connectDB();
    const cfg = await SiteConfig.getSingleton();
    return buildContextFromConfig(cfg?.toObject?.() || cfg);
  } catch {
    // Fallback to mock data snapshot
    return buildContextFromConfig({});
  }
}

function toOpenAIMessages(systemPrompt: string, history: ChatMsg[] | null, userQuestion?: string) {
  const msgs: any[] = [{ role: 'system', content: systemPrompt }];
  if (Array.isArray(history)) {
    for (const m of history) {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      msgs.push({ role, content: (m.content || '').toString().slice(0, 2000) });
    }
  }
  if (userQuestion && (!history || history[history.length - 1]?.content !== userQuestion)) {
    msgs.push({ role: 'user', content: userQuestion });
  }
  return msgs;
}

async function callOpenAI(systemPrompt: string, userQuestion: string, history: ChatMsg[] | null): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const messages = toOpenAIMessages(systemPrompt, history, userQuestion);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() || '';
}

async function callAzureOpenAI(systemPrompt: string, userQuestion: string, history: ChatMsg[] | null): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
  if (!endpoint || !apiKey || !deployment) throw new Error('Missing Azure OpenAI env');
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const messages = toOpenAIMessages(systemPrompt, history, userQuestion);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      temperature: 0.4,
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OpenAI error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() || '';
}

function toGeminiContents(systemPrompt: string, history: ChatMsg[] | null, userQuestion?: string) {
  const contents: any[] = [];
  // Inject the system prompt as an initial user content to guide the model,
  // since some API versions/models reject system_instruction.
  contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
  if (Array.isArray(history)) {
    for (const m of history) {
      const role = m.role === 'assistant' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: (m.content || '').toString().slice(0, 3000) }] });
    }
  }
  if (userQuestion && (!history || history[history.length - 1]?.content !== userQuestion)) {
    contents.push({ role: 'user', parts: [{ text: userQuestion }] });
  }
  return { contents } as any;
}

async function callGemini(systemPrompt: string, userQuestion: string, history: ChatMsg[] | null): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  // Use stable, supported model names for v1beta. Avoid deprecated aliases like `gemini-pro`.
  let preferred = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  // Normalize a couple of common aliases
  if (preferred === 'gemini-1.5-flash-latest') preferred = 'gemini-1.5-flash';
  if (preferred === 'gemini-1.5-pro-latest') preferred = 'gemini-1.5-pro';
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY/GOOGLE_API_KEY');

  const candidates = Array.from(new Set([
    preferred,
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
  ]));

  const payload = {
    ...toGeminiContents(systemPrompt, history, userQuestion),
    generationConfig: { temperature: 0.5, topP: 0.9 },
  } as any;

  let lastErr: any = null;
  const apiVersions = ['v1beta', 'v1'];
  for (const model of candidates) {
    for (const ver of apiVersions) {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetch(url + `?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json: any = await res.json();
        const parts = json?.candidates?.[0]?.content?.parts || [];
        const text = parts.map((p: any) => p?.text || '').join('').trim();
        if (text) return text;
        lastErr = new Error('Gemini returned empty response');
        break;
      }
      const t = await res.text();
      lastErr = new Error(`Gemini error ${res.status}: ${t}`);
      // try next API version or model on 404/400
      if (!(res.status === 404 || res.status === 400)) break;
    }
    if (lastErr && !(String(lastErr).includes('404') || String(lastErr).includes('400'))) break;
  }
  throw lastErr || new Error('Gemini call failed');
}

export async function POST(req: NextRequest) {
  // Rate limit: chat calls hit a paid LLM, so cap per-IP bursts.
  const limited = rateLimit(req, { key: 'chat', limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const { question, snapshot, messages, visitor } = await req.json();
    const q = (question || '').toString().slice(0, 2000);
    if (!q) return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    const history: ChatMsg[] | null = Array.isArray(messages) ? messages.slice(-20) : null;

    // Prefer client-provided snapshot (reflects latest admin edits in local mode);
    // otherwise, load from DB or fall back to mocks.
    const context = snapshot && typeof snapshot === 'object'
      ? buildContextFromConfig(snapshot)
      : await getProfileContext();
    const vName = (visitor && typeof visitor === 'object' && typeof visitor.name === 'string') ? visitor.name.trim() : '';
    const pagePath = (visitor && typeof visitor === 'object' && typeof visitor.path === 'string') ? visitor.path : '';
    const hasIntro = Array.isArray(history)
      ? history.some((m) => {
          if (m.role !== 'assistant') return false;
          const txt = (m.content || '').toString();
          return /(I['’`]?m\s+Priyesh\b|I\s+am\s+Priyesh\b|I['’`]?m\s+Prism\b|I\s+am\s+Prism\b)/i.test(txt);
        })
      : false;
    const sessionLine = `Session: hasIntroduced=${hasIntro ? 'true' : 'false'}${vName ? `, visitorName=${vName}` : ''}${pagePath ? `, currentPath=${pagePath}` : ''}.`;
    const greetRule = vName ? `If you haven't already, you may greet ${vName} by name once; don't repeat greetings.` : `Avoid repetitive greetings.`;
  const systemPrompt = `You are Prism — Priyesh Mishra’s virtual portfolio assistant. You operate behind the scenes, but when replying to users, always speak in first person as Priyesh ("I").

You are a friendly, professional chatbot that lives on Priyesh’s personal portfolio website.

Your role:
- Answer user questions naturally and intelligently, like a human UI/UX expert.
- Personalize all answers with Priyesh’s experience and tone.
- Keep replies concise, accurate, and visually engaging (well-structured paragraphs, no long essays).
- Never repeat Priyesh’s full bio in every message.
- Introduce Priyesh only once at the start of the conversation.
- When users ask personal questions (like “Who are you?” or “Tell me about yourself”), summarize Priyesh’s professional identity briefly.

Tone:
- Warm, confident, and creative — speaks like a designer.
- Avoid robotic or overly formal language.
- Blend clarity with storytelling where relevant.

Behavior Rules:
1. If the user asks about design (UI, UX, color theory, design systems, etc.), answer precisely and add small professional insights.
2. If the user asks about Priyesh, share a short personal intro, not a long paragraph.
3. If the user asks for help (e.g., “Can you review my UI?” or “How to improve UX?”), give clear, practical design advice.
4. Never repeat the same introduction more than once per session. If hasIntroduced=true, do not introduce Prism or Priyesh again.
5. End answers naturally; don’t add generic phrases like “How else can I help?” unless it fits contextually.

Speaking Style:
- Speak in first-person as Priyesh (“I”), not as Prism. Keep responses compact (2–5 sentences) unless the user explicitly asks for depth.
- ${greetRule}
- Gently steer back to the portfolio if a question is unrelated.

${sessionLine}

Use the following portfolio context as ground truth for answers:
${context}
`;

    // Server-side rule parity: if DB is configured, try to load chatbot rules and apply them before calling the LLM
    try {
      if (process.env.MONGODB_URI) {
        await connectDB();
        const cfg = await SiteConfig.getSingleton();
        // Rules/booking live in the ChatbotSettings collection — that's what the
        // admin editor and the live widget read/write. (SiteConfig.chatbot.rules is
        // never populated by the editor, so reading it here matched nothing.)
        // Map the customQA/matchMode shape onto the rule shape this matcher expects.
        const botDoc: any = await ChatbotSettings.findOne({}, {}, { sort: { updatedAt: -1 } }).lean();
        const bot: any = botDoc || {};
        const rules: any[] = Array.isArray(botDoc?.customQA)
          ? botDoc.customQA.map((q: any) => ({
              enabled: q?.enabled,
              reply: q?.reply,
              regex: q?.regex,
              caseSensitive: false,
              question: q?.question,
              keywords: q?.keywords,
              match: q?.matchMode || 'any',
            }))
          : [];
        if (Array.isArray(rules) && rules.length > 0) {
          const caseText = (s: string, caseSensitive?: boolean) => caseSensitive ? s : s.toLowerCase();
          const safeStr = (v: any) => (typeof v === 'string' ? v : '');
          const vNameSafe = safeStr(vName);
          const email = snapshot?.contact?.email || (cfg as any)?.contact?.email || '';
          const phone = snapshot?.contact?.phone || (cfg as any)?.contact?.phone || '';
          const bookingUrl = safeStr(bot?.bookingUrl);
          const contactLink = '#contact';
          const formatReply = (tpl: string) => {
            const base = (tpl || '')
              .replace(/\{\s*name\s*\}/gi, vNameSafe || 'there')
              .replace(/\{\s*date\s*\}/gi, new Date().toLocaleDateString())
              .replace(/\{\s*email\s*\}/gi, email)
              .replace(/\{\s*phone\s*\}/gi, phone)
              .replace(/\{\s*path\s*\}/gi, pagePath || '')
              .replace(/\{\s*bookingUrl\s*\}/gi, bookingUrl)
              .replace(/\{\s*contactLink\s*\}/gi, contactLink);
            const ph: Record<string,string> = Array.isArray(bot?.placeholders)
              ? Object.fromEntries((bot.placeholders as any[]).filter((p) => p?.key).map((p) => [p.key, safeStr(p?.value)]))
              : ((bot?.placeholders && typeof bot.placeholders === 'object') ? bot.placeholders : {});
            const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            let out = base;
            for (const k of Object.keys(ph)) {
              if (!k) continue;
              try {
                const re = new RegExp(`\\{\\s*${escapeRegExp(k)}\\s*\\}`, 'g');
                out = out.replace(re, safeStr(ph[k]));
              } catch {}
            }
            return out;
          };
          for (const r of rules) {
            if (!r || r.enabled === false || !safeStr(r.reply).trim()) continue;
            const caseSens = !!r.caseSensitive;
            const inQ = caseText(q, caseSens);
            let matched = false;
            if (r.regex && safeStr(r.regex).trim()) {
              try {
                const re = new RegExp(safeStr(r.regex), caseSens ? '' : 'i');
                matched = re.test(q);
              } catch {}
            }
            if (!matched && r.question && safeStr(r.question).trim()) {
              const needle = safeStr(r.question).trim();
              matched = caseSens ? q.includes(needle) : inQ.includes(needle.toLowerCase());
            }
            if (!matched && Array.isArray(r.keywords) && r.keywords.length > 0) {
              const kws = r.keywords.map((k: any) => safeStr(k).trim()).filter(Boolean);
              if ((r.match || 'any') === 'all') {
                matched = kws.length > 0 && kws.every((k: string) => (caseSens ? q.includes(k) : inQ.includes(k.toLowerCase())));
              } else {
                matched = kws.some((k: string) => (caseSens ? q.includes(k) : inQ.includes(k.toLowerCase())));
              }
            }
            if (matched) {
              const reply = formatReply(safeStr(r.reply).trim());
              return NextResponse.json({ answer: reply });
            }
          }
        }
      }
    } catch {}

    let answer = '';
    const provider: LLMProvider | null = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ? 'gemini'
      : (process.env.AZURE_OPENAI_ENDPOINT ? 'azure-openai' : (process.env.OPENAI_API_KEY ? 'openai' : null));
    if (!provider) {
      return NextResponse.json({ error: 'LLM not configured' }, { status: 503 });
    }

    try {
      if (provider === 'gemini') {
        answer = await callGemini(systemPrompt, q, history);
      } else if (provider === 'azure-openai') {
        answer = await callAzureOpenAI(systemPrompt, q, history);
      } else {
        answer = await callOpenAI(systemPrompt, q, history);
      }
    } catch (err) {
      // Fallback: try alternates if configured, otherwise degrade gracefully with a concise, non-blocking message.
      try {
        if (provider !== 'azure-openai' && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT) {
          answer = await callAzureOpenAI(systemPrompt, q, history);
        } else if (provider !== 'openai' && process.env.OPENAI_API_KEY) {
          answer = await callOpenAI(systemPrompt, q, history);
        } else if (provider !== 'gemini' && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
          answer = await callGemini(systemPrompt, q, history);
        } else {
          // Last-resort friendly response to avoid 500s on the site UI.
          answer = `I’m Priyesh. I couldn’t reach the AI service right now, but here’s a quick note: ${q ? `“${q}”` : ''}\n\n` +
            `About me: ${context.split('\n').slice(0, 3).join(' • ')}.`;
        }
      } catch (err2) {
        answer = `I’m Priyesh. I couldn’t reach the AI service right now. Please try again in a moment.`;
      }
    }

    return NextResponse.json({ answer });
  } catch (e: any) {
    console.error('Chat route error', e);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
