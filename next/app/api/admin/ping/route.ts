import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { connectDB } from '../../../../lib/db/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  const result: any = {
    ok: false,
    configured: !!process.env.MONGODB_URI,
    connected: false,
    readyState: mongoose.connection.readyState,
    pingMs: null as number | null,
    error: null as string | null,
  };

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ ...result, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const start = Date.now();
    await connectDB();
    result.connected = mongoose.connection.readyState === 1;
    result.readyState = mongoose.connection.readyState;

    if (result.connected && mongoose.connection.db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = (mongoose.connection.db as any).admin?.();
      if (admin && typeof admin.command === 'function') {
        await admin.command({ ping: 1 });
      }
      result.pingMs = Date.now() - start;
      result.ok = true;
    } else {
      result.error = 'Connected state not ready for ping';
    }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    result.error = msg.length > 300 ? msg.slice(0, 300) + '…' : msg;
    return NextResponse.json(result, { status: 500 });
  }
}
