import "server-only";
import { withDb } from "@/lib/db/mongo";
import type { AdminSession, AuthStore } from "@/lib/auth/core";

type SessionDocument = Omit<AdminSession, "id"> & { _id: string };
type AttemptDocument = { _id: string; count: number; expiresAt: Date };
type Collections = {
  sessions: import("mongodb").Collection<SessionDocument>;
  attempts: import("mongodb").Collection<AttemptDocument>;
};
async function withCollections<T>(operation: (collections: Collections) => Promise<T>): Promise<T> {
  const result = await withDb(async (db) => {
    const sessions = db.collection<SessionDocument>("admin_sessions");
    const attempts = db.collection<AttemptDocument>("admin_login_attempts");
    // Index creation is idempotent. Do not share an in-flight I/O promise between Worker requests.
    await Promise.all([
      sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    return { value: await operation({ sessions, attempts }) };
  });
  if (result === null) throw new Error("Admin storage unavailable.");
  return result.value;
}

export const mongoAuthStore: AuthStore = {
  async consumeAttempt(window, expiresAt) {
    return withCollections(async ({ attempts }) => {
      // One global single-admin bucket: spoofing usernames or proxy IP headers cannot evade it.
      const result = await attempts.findOneAndUpdate(
        { _id: `admin:${window}` },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: "after" },
      );
      if (!result) throw new Error("Attempt reservation failed.");
      return result.count;
    });
  },
  async createSession({ id, ...session }) {
    await withCollections(async ({ sessions }) => { await sessions.insertOne({ _id: id, ...session }); });
  },
  async getSession(id) {
    return withCollections(async ({ sessions }) => {
      const document = await sessions.findOne({ _id: id });
      return document ? { id: document._id, credentialVersion: document.credentialVersion, expiresAt: document.expiresAt } : null;
    });
  },
  async deleteSession(id) {
    await withCollections(async ({ sessions }) => { await sessions.deleteOne({ _id: id }); });
  },
};
