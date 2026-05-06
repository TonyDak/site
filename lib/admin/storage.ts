import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const dataDir = join(process.cwd(), "data");

function readJson<T>(fileName: string, fallback: T): T {
  noStore();

  try {
    const raw = readFileSync(join(dataDir, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(fileName: string, value: T) {
  writeFileSync(join(dataDir, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export { readJson, writeJson };
