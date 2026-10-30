import mongoose from "mongoose";
import dns from "dns";

// Ensure SRV DNS resolution succeeds on Windows environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is not allowed
}

const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_FALLBACK_URI = "mongodb://127.0.0.1:27017/qpet_lms";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const primaryOpts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2500,
    };

    cached.promise = (async () => {
      try {
        return await mongoose.connect(MONGODB_URI as string, primaryOpts);
      } catch (err: any) {
        console.warn(
          "⚠️ Primary MongoDB connection failed (likely Atlas IP whitelist or network issue):",
          err.message || err
        );
        console.log("🔄 Connecting to local MongoDB server fallback (mongodb://127.0.0.1:27017/qpet_lms)...");
        try {
          return await mongoose.connect(LOCAL_FALLBACK_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 3000,
          });
        } catch (localErr) {
          console.error("❌ Both Primary and Local MongoDB connections failed:", localErr);
          throw err;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
