import { NextResponse } from 'next/server';

type LLMProvider = 'openai' | 'azure-openai' | 'gemini' | null;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function detectProvider(): LLMProvider {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return 'gemini';
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT) return 'azure-openai';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

export async function GET() {
  const provider = detectProvider();
  const configured = provider !== null;
  const details: Record<string, unknown> = {};

  if (provider === 'openai') {
    details.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'azure-openai') {
    details.endpoint = !!process.env.AZURE_OPENAI_ENDPOINT;
    details.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || null;
    details.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
  } else if (provider === 'gemini') {
    // Prefer stable model name without the "-latest" alias
    details.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  return NextResponse.json({ provider, configured, details });
}
