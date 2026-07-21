// Database migration and recovery utility
// Run this via API endpoint to migrate data or recover from localStorage

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { connectDB } from '../../../../lib/db/mongoose';
import SiteConfig from '../../../../models/SiteConfig';
import { isAuthenticated } from '../../../../lib/adminAuth';

interface MigrationRequest {
  action: 'backup' | 'restore' | 'clear' | 'status';
  password?: string;
  data?: any;
}

// No insecure default — a migration password MUST be configured explicitly,
// or the caller must present a valid admin session.
const MIGRATION_PASSWORD = process.env.MIGRATION_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { action, password, data }: MigrationRequest = await req.json();

    // Security check: allow a signed-in admin, otherwise require a configured
    // migration password that matches. This endpoint can wipe/restore all data,
    // so it must never be reachable with a hardcoded fallback secret.
    if (!isAuthenticated(req)) {
      if (!MIGRATION_PASSWORD) {
        return NextResponse.json(
          { error: 'Migration not configured. Set MIGRATION_PASSWORD or sign in as admin.' },
          { status: 503 }
        );
      }
      if (password !== MIGRATION_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    await connectDB();

    switch (action) {
      case 'status':
        const doc = await SiteConfig.findOne();
        return NextResponse.json({
          hasData: !!doc,
          documentCount: await SiteConfig.countDocuments(),
          environment: process.env.NODE_ENV
        });

      case 'backup':
        const backupDoc = await SiteConfig.findOne();
        if (!backupDoc) {
          return NextResponse.json({ error: 'No data to backup' }, { status: 404 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { adminPassword: _ap, adminPasswordHash: _aph, ...safeBackup } = backupDoc.toObject();
        return NextResponse.json({
          success: true,
          data: safeBackup,
          timestamp: new Date().toISOString()
        });

      case 'restore':
        if (!data) {
          return NextResponse.json({ error: 'No data provided for restore' }, { status: 400 });
        }
        
        // Clear existing and restore
        await SiteConfig.deleteMany({});
        const restored = await SiteConfig.create(data);
        
        return NextResponse.json({
          success: true,
          message: 'Data restored successfully',
          documentId: restored._id
        });

      case 'clear':
        const deletedCount = await SiteConfig.deleteMany({});
        return NextResponse.json({
          success: true,
          message: `Cleared ${deletedCount.deletedCount} documents`,
          deletedCount: deletedCount.deletedCount
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Migration API',
    actions: ['status', 'backup', 'restore', 'clear'],
    usage: 'POST with { action, password, data? }',
    note: 'Requires MIGRATION_PASSWORD for security'
  });
}