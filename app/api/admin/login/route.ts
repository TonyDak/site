import { NextResponse } from "next/server";
import { adminCookieName, createSessionToken, isAdminAuthConfigured, isValidAdminLogin } from "@/lib/admin/auth";
import { appendAuditLog, createAuditLog } from "@/lib/admin/audit";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };

  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (process.env.NODE_ENV === "production" && !isAdminAuthConfigured()) {
    await appendAuditLog(createAuditLog("auth.login", "Blocked login because admin auth is not configured"));
    return NextResponse.json(
      { error: "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SECRET." },
      { status: 503 }
    );
  }

  if (!isValidAdminLogin(username, password)) {
    await appendAuditLog(createAuditLog("auth.login", `Failed login attempt for ${username || "unknown"}`));
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createSessionToken(username);
  await appendAuditLog(createAuditLog("auth.login", `Successful login for ${username}`, username));
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
