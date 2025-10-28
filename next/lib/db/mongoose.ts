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
  
  // Check if connection exists and is ready
  if (global._mongooseConn) {
    try {
      const connection = await global._mongooseConn;
      if (connection.connection.readyState === 1) {
        return connection; // Already connected
      }
    } catch (error) {
      console.log('Existing connection failed, creating new one');
      global._mongooseConn = undefined;
    }
  }
  
  if (!global._mongooseConn) {
    // Configure connection optimized for MongoDB Atlas with reasonable timeouts
    const options = {
      maxPoolSize: 5, // Atlas connection pool
      serverSelectionTimeoutMS: 15000, // 15 seconds for Atlas server selection
      socketTimeoutMS: 30000, // 30 seconds for operations (admin needs more time)
      connectTimeoutMS: 10000, // 10 seconds for initial Atlas connection
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true, // Enable retries for Atlas reliability
      bufferCommands: false, // Don't buffer commands if not connected
      w: 'majority' as const,
      // Atlas specific optimizations
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
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

// Check if MongoDB connection is healthy and ready
export async function isDBHealthy(): Promise<boolean> {
  try {
    if (!MONGODB_URI) return false;
    const connection = await connectDB();
    return connection.connection.readyState === 1;
  } catch (error) {
    return false;
  }
}

// Force reconnection by clearing the cached connection
export function resetDBConnection() {
  global._mongooseConn = undefined;
}
