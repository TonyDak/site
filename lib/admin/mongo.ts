import { MongoClient, type Db } from "mongodb";
import { COLLECTION_NAMES } from "@/lib/admin/content-models";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "portfolio";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
  var __mongoIndexesPromise: Promise<void> | undefined;
}

async function createClient() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export async function getMongoClient() {
  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = createClient();
  }

  return globalThis.__mongoClientPromise;
}

async function ensureIndexes(db: Db) {
  const projectsCollection = db.collection(COLLECTION_NAMES.projects);
  const postsCollection = db.collection(COLLECTION_NAMES.posts);
  const auditCollection = db.collection(COLLECTION_NAMES.auditLogs);

  await Promise.all([
    projectsCollection.createIndex({ slug: 1 }, { unique: true }),
    postsCollection.createIndex({ slug: 1 }, { unique: true }),
    postsCollection.createIndex({ publishedAt: -1 }),
    auditCollection.createIndex({ createdAt: -1 }),
    auditCollection.createIndex({ kind: 1, createdAt: -1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const db = client.db(dbName);

  if (process.env.MONGODB_URI && !globalThis.__mongoIndexesPromise) {
    globalThis.__mongoIndexesPromise = ensureIndexes(db).catch((error) => {
      globalThis.__mongoIndexesPromise = undefined;
      throw error;
    });
  }

  if (globalThis.__mongoIndexesPromise) {
    await globalThis.__mongoIndexesPromise;
  }

  return db;
}
