/* eslint-disable @typescript-eslint/no-require-imports */
const { readdirSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");

function collectTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTests(fullPath);
    return entry.isFile() && entry.name.endsWith(".test.ts") ? [fullPath] : [];
  });
}

const tests = collectTests(path.join(projectRoot, "src")).sort();
if (tests.length === 0) {
  console.error("No test files found in src.");
  process.exit(1);
}

const runner = path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
const result = spawnSync(process.execPath, [runner, "--test", ...tests], {
  cwd: projectRoot,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
