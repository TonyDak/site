import { NextResponse } from "next/server";
import { saveAboutFromUnknown } from "@/lib/admin/content-service";
import { getAboutContent } from "@/lib/content/about";

export async function GET() {
  const about = await getAboutContent();
  return NextResponse.json({ about }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await saveAboutFromUnknown(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save about content." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
