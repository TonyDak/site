import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "portfolio";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let isConnected = false;

async function createClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment.");
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  try {
    if (!globalThis.__mongoClientPromise) {
      globalThis.__mongoClientPromise = createClient();
    }
    const client = await globalThis.__mongoClientPromise;
    isConnected = true;
    return client;
  } catch (err) {
    console.warn("[MongoDB] Connection warning, using fallback storage:", (err as Error)?.message);
    globalThis.__mongoClientPromise = undefined;
    isConnected = false;
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}

export function isDbConnected(): boolean {
  return isConnected;
}
