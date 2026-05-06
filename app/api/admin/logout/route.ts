import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin/auth";
import { appendAuditLog, createAuditLog } from "@/lib/admin/audit";

export async function POST() {
  await appendAuditLog(createAuditLog("auth.logout", "Admin session closed"));
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
