import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

loadDotEnv();

const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

function loadDotEnv() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = getEnvCandidates(currentDir);

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;

    const text = readFileSync(filePath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim().replace(/^\uFEFF/, "");
      if (!line || line.startsWith("#") || !line.includes("=")) continue;

      const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
      const equalsIndex = normalized.indexOf("=");
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
    return;
  }
}

function getEnvCandidates(currentDir: string) {
  const candidates = new Set<string>();

  if (process.env.DOTENV_CONFIG_PATH) {
    candidates.add(path.resolve(process.env.DOTENV_CONFIG_PATH));
  }

  for (const root of [process.cwd(), currentDir]) {
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
