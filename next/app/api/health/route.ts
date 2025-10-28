import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  const healthStatus = {
    status: 'OK',
    message: 'Next.js server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      configured: !!process.env.MONGODB_URI,
      connected: false,
      connectionState: 'disconnected',
      error: null as string | null,
      details: null as
        | null
        | {
            host?: string;
            dbName?: string;
            readyState?: number;
            pingMs?: number;
          }
    }
  };

  // Check MongoDB connection
  if (process.env.MONGODB_URI) {
    try {
      const t0 = Date.now();
      await connectDB();
      const isConnected = mongoose.connection.readyState === 1;
      healthStatus.mongodb.connected = isConnected;
      healthStatus.mongodb.connectionState = isConnected ? 'connected' : 'connecting';

      // Try a lightweight ping to measure latency and ensure commands work
      try {
        if (isConnected && mongoose.connection.db) {
          // driver admin ping
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const admin = (mongoose.connection.db as any).admin?.();
          if (admin && typeof admin.command === 'function') {
            await admin.command({ ping: 1 });
          }
          const pingMs = Date.now() - t0;
          healthStatus.mongodb.details = {
            host: (mongoose.connection as any).host,
            dbName: mongoose.connection.name,
            readyState: mongoose.connection.readyState,
            pingMs
          };
        } else {
          healthStatus.mongodb.details = {
            host: (mongoose.connection as any).host,
            dbName: mongoose.connection.name,
            readyState: mongoose.connection.readyState
          };
        }
      } catch (pingErr) {
        // Ping failed; still include structural details
        healthStatus.mongodb.details = {
          host: (mongoose.connection as any).host,
          dbName: mongoose.connection.name,
          readyState: mongoose.connection.readyState
        };
        // Don't bubble up ping error; already captured via error below if thrown
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      // Mask any potential credentials
      healthStatus.mongodb.error = msg.length > 300 ? msg.slice(0, 300) + '…' : msg;
      healthStatus.mongodb.connectionState = 'error';
      // Don't fail the entire health check if MongoDB is down
      console.error('MongoDB health check failed:', error);
    }
  }

  return NextResponse.json(healthStatus);
}
