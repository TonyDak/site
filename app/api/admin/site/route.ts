import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site";
import { saveSiteConfigFromUnknown } from "@/lib/admin/content-service";

export async function GET() {
  const siteConfig = await getSiteConfig();
  return NextResponse.json({ siteConfig }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await saveSiteConfigFromUnknown(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save site config." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
