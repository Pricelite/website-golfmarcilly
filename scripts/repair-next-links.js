/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const nodeModulesDir = path.join(projectRoot, "node_modules");
const pnpmDir = path.join(nodeModulesDir, ".pnpm");

if (!fs.existsSync(pnpmDir)) {
  process.exit(0);
}

const nextEntry = fs
  .readdirSync(pnpmDir, { withFileTypes: true })
  .find((entry) => entry.isDirectory() && entry.name.startsWith("next@16.1.6_"));

if (!nextEntry) {
  process.exit(0);
}

const nextNodeModulesDir = path.join(
  pnpmDir,
  nextEntry.name,
  "node_modules",
);

const links = {
  react: path.join(nodeModulesDir, "react"),
  "react-dom": path.join(nodeModulesDir, "react-dom"),
  "server-only": path.join(nodeModulesDir, "server-only"),
};

for (const [name, target] of Object.entries(links)) {
  const linkPath = path.join(nextNodeModulesDir, name);
  if (fs.existsSync(target) && !fs.existsSync(linkPath)) {
    fs.symlinkSync(target, linkPath, "junction");
  }
}

const devtoolsPatchTarget = [
  "let SegmentViewNode = ()=>null;",
  "let SegmentViewStateNode = ()=>null;",
  "if (process.env.NODE_ENV === 'development') {",
  "    const mod = require('../../next-devtools/userspace/app/segment-explorer-node');",
  "    SegmentViewNode = mod.SegmentViewNode;",
  "    SegmentViewStateNode = mod.SegmentViewStateNode;",
  "}",
].join("\n");

const devtoolsPatchReplacement = [
  "let SegmentViewNode = ()=>null;",
  "let SegmentViewStateNode = ()=>null;",
  "if (process.env.NODE_ENV === 'development' && process.env.NEXT_ENABLE_SEGMENT_EXPLORER === '1') {",
  "    const mod = require('../../next-devtools/userspace/app/segment-explorer-node');",
  "    SegmentViewNode = mod.SegmentViewNode;",
  "    SegmentViewStateNode = mod.SegmentViewStateNode;",
  "}",
].join("\n");

for (const entryBasePath of [
  path.join(nodeModulesDir, "next", "dist", "server", "app-render", "entry-base.js"),
  path.join(nextNodeModulesDir, "next", "dist", "server", "app-render", "entry-base.js"),
]) {
  if (!fs.existsSync(entryBasePath)) {
    continue;
  }

  const current = fs.readFileSync(entryBasePath, "utf8");
  if (current.includes(devtoolsPatchTarget)) {
    fs.writeFileSync(
      entryBasePath,
      current.replace(devtoolsPatchTarget, devtoolsPatchReplacement),
    );
  }
}
