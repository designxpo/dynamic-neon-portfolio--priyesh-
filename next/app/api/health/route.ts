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
      error: null as string | null
    }
  };

  // Check MongoDB connection
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      healthStatus.mongodb.connected = mongoose.connection.readyState === 1;
      healthStatus.mongodb.connectionState = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (error) {
      healthStatus.mongodb.error = error instanceof Error ? error.message : 'Unknown error';
      healthStatus.mongodb.connectionState = 'error';
      // Don't fail the entire health check if MongoDB is down
      console.error('MongoDB health check failed:', error);
    }
  }

  return NextResponse.json(healthStatus);
}
