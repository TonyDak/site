import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const SESSION_SECONDS = 8 * 60 * 60;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const HASH_PATTERN = /^scrypt:32768:8:1:[a-f0-9]{32}:[a-f0-9]{128}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type AuthConfig = { username: string; passwordHash: string; origin: string };
export type AdminSession = { id: string; credentialVersion: string; expiresAt: Date };
export interface AuthStore {
  consumeAttempt(window: number, expiresAt: Date): Promise<number>;
  createSession(session: AdminSession): Promise<void>;
  getSession(id: string): Promise<AdminSession | null>;
  deleteSession(id: string): Promise<void>;
}

export function readAuthConfig(env: Record<string, string | undefined>): AuthConfig | null {
  const username = env.ADMIN_USERNAME;
  const passwordHash = env.ADMIN_PASSWORD_HASH;
  const origin = env.ADMIN_ORIGIN;
  if (!username || !/^[\w.@-]{3,64}$/.test(username) || !passwordHash || !HASH_PATTERN.test(passwordHash) || !origin) return null;
  try {
    const url = new URL(origin);
    if (url.origin !== origin) return null;
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(env.NODE_ENV !== "production" && local && url.protocol === "http:")) return null;
    return { username, passwordHash, origin };
  } catch { return null; }
}

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) throw new Error("Use a password between 12 and 256 characters.");
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt:32768:8:1:${salt.toString("hex")}:${key.toString("hex")}`;
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function isAllowedMutation(request: Request, config: AuthConfig | null, contentType = "application/json"): boolean {
  return !!config && request.headers.get("origin") === config.origin
    && request.headers.get("sec-fetch-site") !== "cross-site"
    && request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === contentType;
}

export function createAuthService({ config, store, now = Date.now }: { config: AuthConfig | null; store: AuthStore; now?: () => number }) {
  const credentialVersion = config ? digest(`${config.username}\0${config.passwordHash}`) : "";
  return {
    async login(username: unknown, password: unknown): Promise<{ status: number; token?: string }> {
      if (!config) return { status: 503 };
      if (typeof username !== "string" || typeof password !== "string" || username.length > 64 || password.length > 256) return { status: 400 };
      try {
        const time = now();
        const window = Math.floor(time / LOGIN_WINDOW_MS);
        const count = await store.consumeAttempt(window, new Date((window + 1) * LOGIN_WINDOW_MS));
        if (count > 10) return { status: 429 };
        const parts = config.passwordHash.split(":");
        // Always derive the password, including when the username is incorrect.
        const candidate = await derive(password, Buffer.from(parts[4], "hex"));
        const correctPassword = timingSafeEqual(candidate, Buffer.from(parts[5], "hex"));
        if (!correctPassword || username !== config.username) return { status: 401 };
        const token = randomBytes(32).toString("base64url");
        await store.createSession({ id: digest(token), credentialVersion, expiresAt: new Date(time + SESSION_SECONDS * 1000) });
        return { status: 200, token };
      } catch { return { status: 503 }; }
    },
    async authorize(token: string | null): Promise<boolean> {
      if (!config || !token || !TOKEN_PATTERN.test(token)) return false;
      const session = await store.getSession(digest(token));
      return !!session && session.credentialVersion === credentialVersion && session.expiresAt.getTime() > now();
    },
    async logout(token: string | null): Promise<void> {
      if (token && TOKEN_PATTERN.test(token)) await store.deleteSession(digest(token));
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
