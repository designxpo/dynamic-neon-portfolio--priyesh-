import { NextResponse } from 'next/server';
import Metadata from '@/models/Metadata';
import { dbConnect } from '@/lib/db';

// Helper to set secure headers
function withSecureHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline';");
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

// Basic authentication for admin routes
function isAuthenticated(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;
  const base64 = auth.split(' ')[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
  // Use env variable for password
  return user === 'admin' && pass === process.env.MIGRATION_PASSWORD;
}

// GET /api/admin/siteMeta
export async function GET(req: Request) {
  if (!isAuthenticated(req)) {
    return withSecureHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }
  try {
    await dbConnect();
    const doc = await Metadata.findOne({});
    return withSecureHeaders(NextResponse.json(doc || {}));
  } catch (err: any) {
    console.error('[siteMeta GET] DB error:', err?.message || err);
    return withSecureHeaders(NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 }));
  }
}

// PUT /api/admin/siteMeta
export async function PUT(req: Request) {
  if (!isAuthenticated(req)) {
    return withSecureHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }
  try {
    await dbConnect();
    const body = await req.json();
    // Basic validation: require title and description
    if (!body.title || !body.description) {
      return withSecureHeaders(NextResponse.json({ error: 'Missing required fields: title or description' }, { status: 400 }));
    }
    // Save/update metadata (single global doc)
    const updated = await Metadata.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return withSecureHeaders(NextResponse.json(updated));
  } catch (err: any) {
    console.error('[siteMeta PUT] DB error:', err?.message || err);
    return withSecureHeaders(NextResponse.json({ error: 'Database connection failed', details: err?.message || err }, { status: 500 }));
  }
}
