import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type LoadEnvResult = {
  loaded: boolean;
  path?: string;
};

export function loadRootEnv(): LoadEnvResult {
  const candidates = getEnvCandidates();

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;

    loadEnvFile(filePath);
    return { loaded: true, path: filePath };
  }

  return { loaded: false };
}

function getEnvCandidates() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const roots = [
    process.cwd(),
    moduleDir,
    path.resolve(moduleDir, "..", "..", ".."),
  ];

  if (process.env.DOTENV_CONFIG_PATH) {
    roots.unshift(path.dirname(path.resolve(process.env.DOTENV_CONFIG_PATH)));
  }

  const candidates = new Set<string>();

  if (process.env.DOTENV_CONFIG_PATH) {
    candidates.add(path.resolve(process.env.DOTENV_CONFIG_PATH));
  }

  for (const root of roots) {
    for (const dir of walkUp(root)) {
      candidates.add(path.join(dir, ".env"));

      if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
        break;
      }
    }
  }

  return [...candidates];
}

function* walkUp(start: string) {
  let current = path.resolve(start);

  while (true) {
    yield current;

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

function loadEnvFile(filePath: string) {
  const text = readFileSync(filePath, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^\uFEFF/, "");
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const equalsIndex = normalized.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = normalized.slice(0, equalsIndex).trim();
    let value = normalized.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
