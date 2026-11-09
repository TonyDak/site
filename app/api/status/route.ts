import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ db: false }, { status: 200 });
    }
    // Ping with a short timeout
    await db.command({ ping: 1 });
    return NextResponse.json({ db: true }, { status: 200 });
  } catch {
    return NextResponse.json({ db: false }, { status: 200 });
  }
}
