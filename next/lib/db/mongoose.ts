import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not set. API routes that require DB will fail until set.');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI not configured');
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(MONGODB_URI);
  }
  return global._mongooseConn;
}
