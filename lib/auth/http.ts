import type { AuthConfig, AuthService } from "./core";

export function privateJson(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extraHeaders } });
}

export function readSessionToken(request: Request, production: boolean): string | null {
  const name = production ? "__Host-portfolio_admin" : "portfolio_admin";
  const matches = (request.headers.get("cookie") ?? "").split(";").map(v => v.trim()).filter(v => v.startsWith(`${name}=`));
  // Reject ambiguous duplicated cookies rather than picking an attacker-controlled copy.
  return matches.length === 1 ? matches[0].slice(name.length + 1) : null;
}

export async function readJson(request: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const result: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return result && typeof result === "object" && !Array.isArray(result) ? result as Record<string, unknown> : null;
  } catch { return null; } finally { reader.releaseLock(); }
}

export function createAuthHttp({ service, config, production, allowedMutation }: {
  service: AuthService;
  config: AuthConfig | null;
  production: boolean;
  allowedMutation: (request: Request, config: AuthConfig | null, contentType?: string) => boolean;
}) {
  function mutationError(request: Request, contentType = "application/json") {
    if (!config) return privateJson({ error: "Admin authentication is not configured." }, 503);
    if (!allowedMutation(request, config, contentType)) return privateJson({ error: "Request origin or content type is not allowed." }, 403);
    return null;
  }
  function cookie(token: string, maxAge: number) {
    const name = production ? "__Host-portfolio_admin" : "portfolio_admin";
    return `${name}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production ? "; Secure" : ""}`;
  }
  async function authorize(request: Request): Promise<Response | null> {
    if (!config) return privateJson({ error: "Admin authentication is not configured." }, 503);
    try {
      return await service.authorize(readSessionToken(request, production)) ? null : privateJson({ error: "Please sign in to continue." }, 401);
    } catch { return privateJson({ error: "Admin service is temporarily unavailable." }, 503); }
  }
  return {
    authorize, mutationError,
    async login(request: Request) {
      const error = mutationError(request);
      if (error) return error;
      const body = await readJson(request, 4096);
      if (!body) return privateJson({ error: "Invalid login request." }, 400);
      const result = await service.login(body.username, body.password);
      if (result.status !== 200 || !result.token) {
        const message = result.status === 429 ? "Too many attempts. Try again in 15 minutes." : result.status === 503 ? "Admin service is temporarily unavailable." : "Invalid username or password.";
        return privateJson({ error: message }, result.status, result.status === 429 ? { "Retry-After": "900" } : {});
      }
      // Revoke the previous browser session on successful sign-in (session fixation/rotation).
      try { await service.logout(readSessionToken(request, production)); }
      catch { return privateJson({ error: "Admin service is temporarily unavailable." }, 503); }
      return privateJson({ authenticated: true }, 200, { "Set-Cookie": cookie(result.token, 28800) });
    },
    async session(request: Request) {
      const error = await authorize(request);
      return error ?? privateJson({ authenticated: true });
    },
    async logout(request: Request) {
      const error = mutationError(request);
      if (error) return error;
      try { await service.logout(readSessionToken(request, production)); }
      catch { return privateJson({ error: "Could not revoke session. Try again." }, 503); }
      return privateJson({ authenticated: false }, 200, { "Set-Cookie": cookie("", 0) });
    },
  };
}
