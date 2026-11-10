import "server-only";
import { getDb } from "@/lib/db/mongo";
import type { AdminSession, AuthStore } from "@/lib/auth/core";

type SessionDocument = Omit<AdminSession, "id"> & { _id: string };
type AttemptDocument = { _id: string; count: number; expiresAt: Date };
let indexesReady: Promise<unknown> | undefined;

async function collections() {
  const db = await getDb();
  if (!db) throw new Error("Admin storage unavailable.");
  const sessions = db.collection<SessionDocument>("admin_sessions");
  const attempts = db.collection<AttemptDocument>("admin_login_attempts");
  indexesReady ??= Promise.all([
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]).catch(error => { indexesReady = undefined; throw error; });
  await indexesReady;
  return { sessions, attempts };
}

export const mongoAuthStore: AuthStore = {
  async consumeAttempt(window, expiresAt) {
    const { attempts } = await collections();
    // One global single-admin bucket: spoofing usernames or proxy IP headers cannot evade it.
    const result = await attempts.findOneAndUpdate(
      { _id: `admin:${window}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after" },
    );
    if (!result) throw new Error("Attempt reservation failed.");
    return result.count;
  },
  async createSession({ id, ...session }) {
    const { sessions } = await collections();
    await sessions.insertOne({ _id: id, ...session });
  },
  async getSession(id) {
    const { sessions } = await collections();
    const document = await sessions.findOne({ _id: id });
    return document ? { id: document._id, credentialVersion: document.credentialVersion, expiresAt: document.expiresAt } : null;
  },
  async deleteSession(id) {
    const { sessions } = await collections();
    await sessions.deleteOne({ _id: id });
  },
};
