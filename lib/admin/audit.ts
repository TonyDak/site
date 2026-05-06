import { getDb } from "@/lib/admin/mongo";
import { COLLECTION_NAMES, type AuditLogEntry, type MongoDocument } from "@/lib/admin/content-models";

export async function appendAuditLog(entry: AuditLogEntry) {
  const db = await getDb();
  const collection = db.collection<MongoDocument<AuditLogEntry>>(COLLECTION_NAMES.auditLogs);
  await collection.insertOne({ _id: `${entry.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, ...entry });
}

export function createAuditLog(kind: AuditLogEntry["kind"], detail: string, actor?: string): AuditLogEntry {
  return {
    kind,
    detail,
    actor,
    createdAt: new Date().toISOString(),
  };
}