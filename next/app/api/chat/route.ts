import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db/mongoose';
import SiteConfig from '../../../models/SiteConfig';
import { mockContactData, mockEducationsData, mockExperiencesData, mockHeroData, mockProjectsData, mockServicesData, mockSkillsData, mockTestimonialsData } from '../../../data/mockData';

type LLMProvider = 'openai' | 'azure-openai' | 'gemini';

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

  const eduLines = (educations || []).slice(0, 10).map((e: any) => `- ${e.courseTitle} — ${e.instituteName} (${e.startYear}–${e.endYear})`);
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

async function callOpenAI(systemPrompt: string, userQuestion: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuestion },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() || '';
}

async function callAzureOpenAI(systemPrompt: string, userQuestion: string): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
  if (!endpoint || !apiKey || !deployment) throw new Error('Missing Azure OpenAI env');
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuestion },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OpenAI error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() || '';
}

async function callGemini(systemPrompt: string, userQuestion: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let preferred = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
  if (preferred === 'gemini-1.5-flash') preferred = 'gemini-1.5-flash-latest';
  if (preferred === 'gemini-1.5-pro') preferred = 'gemini-1.5-pro-latest';
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY/GOOGLE_API_KEY');

  const candidates = Array.from(new Set([
    preferred,
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro',
  ]));

  const payload = {
    systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userQuestion }] }],
    generationConfig: { temperature: 0.4 },
  } as any;

  let lastErr: any = null;
  for (const model of candidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
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
    // try next model on 404/400
    if (!(res.status === 404 || res.status === 400)) break;
  }
  throw lastErr || new Error('Gemini call failed');
}

export async function POST(req: NextRequest) {
  try {
    const { question, snapshot } = await req.json();
    const q = (question || '').toString().slice(0, 2000);
    if (!q) return NextResponse.json({ error: 'Missing question' }, { status: 400 });

    // Prefer client-provided snapshot (reflects latest admin edits in local mode);
    // otherwise, load from DB or fall back to mocks.
    const context = snapshot && typeof snapshot === 'object'
      ? buildContextFromConfig(snapshot)
      : await getProfileContext();
    const systemPrompt = `You are a friendly, concise assistant for a personal portfolio website. Answer only about the person using the provided context. If the question is unrelated, politely steer back to the portfolio. Keep answers short, helpful, and warm.\n\nContext:\n${context}`;

    let answer = '';
    const provider: LLMProvider | null = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ? 'gemini'
      : (process.env.AZURE_OPENAI_ENDPOINT ? 'azure-openai' : (process.env.OPENAI_API_KEY ? 'openai' : null));
    if (!provider) {
      return NextResponse.json({ error: 'LLM not configured' }, { status: 503 });
    }

    if (provider === 'gemini') {
      answer = await callGemini(systemPrompt, q);
    } else if (provider === 'azure-openai') {
      answer = await callAzureOpenAI(systemPrompt, q);
    } else {
      answer = await callOpenAI(systemPrompt, q);
    }

    return NextResponse.json({ answer });
  } catch (e: any) {
    console.error('Chat route error', e);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
