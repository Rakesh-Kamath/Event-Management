import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[MongoDB Atlas Error]: MONGO_URI is missing in backend/.env');
    return false;
  }

  try {
    console.log('[MongoDB Atlas]: Connecting exclusively to remote MongoDB Atlas cluster...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB Atlas Connected ✅]: Successfully connected to Atlas Cluster Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Atlas Fatal Connection Error ❌]: Failed to connect to Atlas cluster (${error.message})`);
    return false;
  }
};
