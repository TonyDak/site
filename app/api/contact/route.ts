import { NextResponse } from "next/server";

type Payload = {
  name?: string;
  email?: string;
  detail?: string;
  website?: string;
};

type ContactSubmission = {
  name: string;
  email: string;
  detail: string;
};

type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateMap = new Map<string, RateEntry>();
const resendApiKey = process.env.RESEND_API_KEY;
const contactToEmail = process.env.CONTACT_TO_EMAIL;
const contactFromEmail = process.env.CONTACT_FROM_EMAIL;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseContactSubmission(body: Payload): ContactSubmission {
  const name = body.name?.trim();
  const email = body.email?.trim();
  const detail = body.detail?.trim();

  if (!name || !email || !detail) {
    throw new Error("Missing required fields");
  }

  return { name, email, detail };
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const entry = rateMap.get(clientKey);

  if (!entry || now > entry.resetAt) {
    rateMap.set(clientKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_MAX) {
    return true;
  }

  entry.count += 1;
  rateMap.set(clientKey, entry);
  return false;
}

async function sendWithResend(input: { name: string; email: string; detail: string }) {
  if (!resendApiKey || !contactToEmail || !contactFromEmail) {
    return { skipped: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: contactFromEmail,
      to: [contactToEmail],
      reply_to: input.email,
      subject: `New portfolio inquiry from ${input.name}`,
      text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.detail}`,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Resend API failed: ${payload}`);
  }

  return { skipped: false as const };
}

export async function POST(request: Request) {
  const clientKey = getClientIp(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let submission;

  try {
    submission = parseContactSubmission(body);
  } catch {
    return NextResponse.json({ error: "Please fill out all required fields." }, { status: 400 });
  }

  const { name, email, detail } = submission;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (detail.length < 20) {
    return NextResponse.json(
      { error: "Please add a bit more detail so I can help effectively." },
      { status: 400 }
    );
  }

  console.info("[contact] incoming lead", {
    name,
    email,
    preview: `${detail.slice(0, 120)}${detail.length > 120 ? "..." : ""}`,
  });

  try {
    const emailResult = await sendWithResend({ name, email, detail });

    if (emailResult.skipped) {
      console.info("[contact] email delivery skipped due to missing env config");
    }
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json(
      { error: "Message received but delivery failed. Please retry shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
