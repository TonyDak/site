export const adminCookieName = "portfolio_admin_session";

const defaultUsername = process.env.ADMIN_USERNAME ?? "admin";
const defaultPassword = process.env.ADMIN_PASSWORD ?? "local-dev-only";
const sessionSecret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "local-dev-only-secret";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encodeBase64Url(value: string) {
  const bytes = textEncoder.encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return textDecoder.decode(bytes);
}

async function getKey() {
  if (!sessionSecret) {
    throw new Error("Admin auth is not configured.");
  }

  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(value: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  const bytes = new Uint8Array(signature);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function constantTimeEqual(a: string, b: string) {
  const left = textEncoder.encode(a);
  const right = textEncoder.encode(b);

  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
}

export async function createSessionToken(username: string) {
  const payload = JSON.stringify({ username, exp: Date.now() + 1000 * 60 * 60 * 12 });
  const encoded = encodeBase64Url(payload);
  return `${encoded}.${await sign(encoded)}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token || !sessionSecret) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = await sign(encoded);

  if (!(await constantTimeEqual(expected, signature))) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encoded)) as { username?: string; exp?: number };
    if (!payload.username || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isValidAdminLogin(username: string, password: string) {
  return username === defaultUsername && password === defaultPassword;
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

export function getAdminAuthWarning() {
  if (isAdminAuthConfigured()) {
    return null;
  }

  return "Admin auth is using local fallback credentials. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SECRET for production.";
}
