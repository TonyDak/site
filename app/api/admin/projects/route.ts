import { NextResponse } from "next/server";
import { getProjects } from "@/lib/content/projects";
import { saveProjectsFromUnknown } from "@/lib/admin/content-service";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await saveProjectsFromUnknown(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save projects." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
