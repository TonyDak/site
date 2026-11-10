import "server-only";
import { createAuthService, isAllowedMutation, readAuthConfig } from "@/lib/auth/core";
import { createAuthHttp } from "@/lib/auth/http";
import { mongoAuthStore } from "@/lib/auth/store";

export function adminAuth() {
  // Read request-time environment, including Cloudflare runtime secrets.
  const config = readAuthConfig(process.env);
  return createAuthHttp({ service: createAuthService({ config, store: mongoAuthStore }), config,
    production: process.env.NODE_ENV === "production", allowedMutation: isAllowedMutation });
}
