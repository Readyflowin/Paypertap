import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let hasLoadedLocalEnv = false;

function parseEnvValue(value: string) {
  let trimmed = value.trim();
  const openingQuote = trimmed[0];

  while (trimmed.length >= 2) {
    const quote = trimmed[0];

    if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
      trimmed = trimmed.slice(1, -1).trim();
      continue;
    }

    break;
  }

  if (openingQuote === '"' || openingQuote === "'") {
    while (trimmed.endsWith(openingQuote)) {
      trimmed = trimmed.slice(0, -1).trim();
    }
  }

  return trimmed;
}

type LoadLocalEnvOptions = {
  override?: boolean;
};

export function loadLocalEnv({ override = false }: LoadLocalEnvOptions = {}) {
  if (hasLoadedLocalEnv) {
    return;
  }

  hasLoadedLocalEnv = true;
  const envPath = path.join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (override || !process.env[key]) {
      process.env[key] = parseEnvValue(rawValue);
    }
  }
}
