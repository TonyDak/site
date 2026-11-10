import { MongoClient, type Db } from "mongodb";

/** A Mongo connection belongs to one operation; it must never escape into another Worker request. */
export async function withDb<T>(operation: (db: Db) => Promise<T>): Promise<T | null> {
  const uri = process.env.MONGODB_URI;
  const database = process.env.MONGODB_DB;
  if (!uri || !database?.trim()) return null;
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    maxPoolSize: 1,
    minPoolSize: 0,
  });
  try {
    await client.connect();
    return await operation(client.db(database));
  } finally {
    await client.close();
  }
}
