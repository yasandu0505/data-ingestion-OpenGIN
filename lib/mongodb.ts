import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri: string = process.env.MONGODB_URI;
// Database name - can be set via env variable or extracted from URI
const dbName: string = process.env.MONGODB_DB_NAME || 'opengin';

// Mongoose connection helper with Next.js optimization
let mongooseConnection: typeof mongoose | null = null;

export async function connectMongoose(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // In development mode, use a global variable to preserve connection across HMR
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongoose = global as typeof globalThis & {
      _mongooseConnection?: typeof mongoose;
    };

    if (globalWithMongoose._mongooseConnection) {
      mongooseConnection = globalWithMongoose._mongooseConnection;
      return mongooseConnection;
    }
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(uri, {
      dbName: dbName,
    });
    mongooseConnection = mongoose;
    
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongoose = global as typeof globalThis & {
        _mongooseConnection?: typeof mongoose;
      };
      globalWithMongoose._mongooseConnection = mongoose;
    }
    
    const connectedDbName = mongoose.connection.db?.databaseName || dbName;
    console.log(`✅ Connection successful to MongoDB - Database: ${connectedDbName}`);
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Helper function to get the current database name
export function getDatabaseName(): string {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db.databaseName;
  }
  return dbName;
}

// Export the connection function as default
export default connectMongoose;
