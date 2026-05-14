import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const isWindows = process.platform === "win32";
const pnpmCommand = isWindows ? "powershell.exe" : "corepack";
const pnpmArgsPrefix = ["pnpm@10.33.0"];

loadDotEnv(path.join(root, ".env"));

const apiPort = process.env.PORT || "8080";
const webPort = process.env.WEB_PORT || "5174";
const apiTarget = process.env.API_TARGET || `http://127.0.0.1:${apiPort}`;

const sharedEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: apiPort,
  WEB_PORT: webPort,
  API_TARGET: apiTarget,
};

if (!sharedEnv.DATABASE_URL) {
  console.error(
    [
      "[dev] DATABASE_URL is not set.",
      "      Add your Supabase Postgres connection string to .env before running npm run dev.",
      "      Example:",
      "      DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.dbghdhebpsgwuntrfcnc.supabase.co:5432/postgres?sslmode=require",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("[dev] Building API server...");
const buildExitCode = await run("api-build", ["--filter", "@workspace/api-server", "run", "build"], sharedEnv);

if (buildExitCode !== 0) {
  process.exit(buildExitCode);
}

console.log(`[dev] API:      http://127.0.0.1:${apiPort}/api/healthz`);
console.log(`[dev] Frontend: http://localhost:${webPort}`);

const children = [
  start("api", ["--filter", "@workspace/api-server", "run", "start"], sharedEnv),
  start("web", ["--filter", "@workspace/quepon", "run", "dev"], {
    ...sharedEnv,
    PORT: webPort,
    API_TARGET: apiTarget,
  }),
];

let shuttingDown = false;

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\n[dev] Stopping servers...");
    for (const child of children) {
      if (!child.killed) child.kill(signal);
    }
  });
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[dev] A server exited (${signal || code}). Stopping the other process...`);
    for (const other of children) {
      if (other !== child && !other.killed) other.kill();
    }
    process.exit(code ?? 1);
  });
}

function run(label, args, env) {
  return new Promise((resolve) => {
    const child = start(label, args, env);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

function start(label, args, env) {
  const corepackArgs = [...pnpmArgsPrefix, ...args];
  const spawnArgs = isWindows
    ? [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      ["corepack", ...corepackArgs.map(quotePowerShell)].join(" "),
    ]
    : corepackArgs;

  const child = spawn(pnpmCommand, spawnArgs, {
    cwd: root,
    env,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
  });

  child.stdout.on("data", (chunk) => writePrefixed(label, chunk, process.stdout));
  child.stderr.on("data", (chunk) => writePrefixed(label, chunk, process.stderr));

  child.on("error", (error) => {
    console.error(`[${label}] Failed to start pnpm: ${error.message}`);
  });

  return child;
}

function quotePowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function writePrefixed(label, chunk, stream) {
  const lines = chunk.toString().split(/\r?\n/);
  for (const line of lines) {
    if (line.length > 0) stream.write(`[${label}] ${line}\n`);
  }
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;

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
