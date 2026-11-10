import { adminAuth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) { return adminAuth().session(request); }
export async function POST(request: Request) { return adminAuth().login(request); }
export async function DELETE(request: Request) { return adminAuth().logout(request); }
