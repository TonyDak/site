import { NextResponse } from "next/server";
import { withDb } from "@/lib/db/mongo";

export async function GET() {
  try {
    const connected = await withDb(async (db) => { await db.command({ ping: 1 }); return true; });
    return NextResponse.json({ db: connected === true }, { status: 200 });
  } catch {
    return NextResponse.json({ db: false }, { status: 200 });
  }
}
