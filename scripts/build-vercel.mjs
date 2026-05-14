import { rm, cp, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pnpmExecPath = process.env.npm_execpath;
const nodeExecPath = process.env.npm_node_execpath || process.execPath;

if (!pnpmExecPath) {
  throw new Error("npm_execpath is not set. Run this script through pnpm.");
}

await runCommand(nodeExecPath, [pnpmExecPath, "--filter", "@workspace/quepon", "run", "build"], root);

const sourceDir = path.resolve(root, "artifacts", "quepon", "dist", "public");
const outputDir = path.resolve(root, "public");

await access(sourceDir, fsConstants.R_OK);
await rm(outputDir, { recursive: true, force: true });
await cp(sourceDir, outputDir, { recursive: true });

console.log(`[build-vercel] Copied ${sourceDir} -> ${outputDir}`);

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}`));
      }
    });
  });
}
