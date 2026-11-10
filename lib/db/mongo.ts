import { MongoClient, type Db } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let isConnected = false;

async function createClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  try {
    if (!globalThis.__mongoClientPromise) {
      globalThis.__mongoClientPromise = createClient(uri);
    }
    const client = await globalThis.__mongoClientPromise;
    isConnected = true;
    return client;
  } catch {
    console.warn("[MongoDB] Content storage unavailable.");
    globalThis.__mongoClientPromise = undefined;
    isConnected = false;
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(process.env.MONGODB_DB ?? "portfolio");
}

export function isDbConnected(): boolean {
  return isConnected;
}
