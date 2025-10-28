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
    // Configure connection with aggressive timeouts for fast fallback
    const options = {
      maxPoolSize: 3, // Reduced connection pool for faster failure
      serverSelectionTimeoutMS: 2000, // Fail fast - only 2 seconds to select server
      socketTimeoutMS: 3000, // Close connections after 3 seconds of inactivity
      connectTimeoutMS: 3000, // Only 3 seconds to establish initial connection
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: false, // Disable retries for faster failure
      bufferCommands: false, // Don't buffer commands if not connected
      w: 'majority' as const
    };

    global._mongooseConn = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });
      
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB initial connection failed:', error);
      global._mongooseConn = undefined; // Reset to allow retry
      throw error;
    });
  }
  
  return global._mongooseConn;
}
