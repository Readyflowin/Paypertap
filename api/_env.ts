import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let hasLoadedLocalEnv = false;

function parseEnvValue(value: string) {
  let trimmed = value.trim();

  while (trimmed.length >= 2) {
    const quote = trimmed[0];

    if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
      trimmed = trimmed.slice(1, -1).trim();
      continue;
    }

    break;
  }

  return trimmed;
}

function readEnvAssignments(contents: string) {
  const lines = contents.split(/\r?\n/);
  const assignments: Array<{ key: string; rawValue: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, firstRawValue] = match;
    let rawValue = firstRawValue;
    const openingQuote = rawValue.trimStart()[0];

    if (openingQuote === '"' || openingQuote === "'") {
      let quoteCount = countUnescapedQuotes(rawValue, openingQuote);

      while (quoteCount % 2 !== 0 && index + 1 < lines.length) {
        index += 1;
        rawValue += `\n${lines[index]}`;
        quoteCount += countUnescapedQuotes(lines[index], openingQuote);
      }
    }

    assignments.push({ key, rawValue });
  }

  return assignments;
}

function countUnescapedQuotes(value: string, quote: string) {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== quote) {
      continue;
    }

    let backslashCount = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
      backslashCount += 1;
    }

    if (backslashCount % 2 === 0) {
      count += 1;
    }
  }

  return count;
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

  const assignments = readEnvAssignments(readFileSync(envPath, "utf8"));

  for (const { key, rawValue } of assignments) {
    if (override || !process.env[key]) {
      process.env[key] = parseEnvValue(rawValue);
    }
  }
}
