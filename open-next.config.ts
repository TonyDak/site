import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Database-backed blog routes render per request; no incremental-cache bucket is required.
export default defineCloudflareConfig();
