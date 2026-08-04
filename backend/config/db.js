import mongoose from 'mongoose';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      console.log('[MongoDB Atlas]: Connecting exclusively to remote MongoDB Atlas cluster...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000 // 5-second timeout for quick fallback detection
      });
      console.log(`[MongoDB Atlas Connected ✅]: Successfully connected to Atlas Cluster Host: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.error(`[MongoDB Atlas Connection Failed ❌]: (${error.message})`);
    }
  } else {
    console.warn('[MongoDB Atlas Warning]: MONGO_URI is missing in backend/.env');
  }

  // Fallback to local In-Memory MongoDB Server
  try {
    console.log('[MongoDB Fallback]: Starting local in-memory MongoDB Server...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('[MongoDB Fallback Connected ✅]: Connected to local in-memory database successfully!');
    return true;
  } catch (fallbackError) {
    console.error(`[MongoDB Fallback Fatal Error ❌]: Failed to start in-memory database: ${fallbackError.message}`);
    return false;
  }
};
