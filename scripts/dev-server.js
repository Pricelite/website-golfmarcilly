/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const projectRoot = process.cwd();
const lockFile = path.join(projectRoot, ".next", "dev", "lock");

function run(command, args) {
  return spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function getPidOnPort(port) {
  const result = run("netstat", ["-ano", "-p", "tcp"]);
  const lines = `${result.stdout}\n${result.stderr}`.split(/\r?\n/);
  const match = lines.find(
    (line) =>
      line.includes(`:${port}`) &&
      line.includes("LISTENING") &&
      /\s+\d+\s*$/.test(line),
  );

  if (!match) {
    return null;
  }

  return Number(match.trim().split(/\s+/).pop());
}

function getProcessName(pid) {
  const result = run("powershell", [
    "-NoProfile",
    "-Command",
    `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName`,
  ]);
  const value = result.stdout.trim().toLowerCase();
  if (!value) {
    return null;
  }

  return value.endsWith(".exe") ? value : `${value}.exe`;
}

function stopNodeOnPort(port) {
  const pid = getPidOnPort(port);
  if (!pid) {
    return;
  }

  const processName = getProcessName(pid);
  if (processName !== "node.exe") {
    console.error(
      `Port ${port} is used by PID ${pid} (${processName || "unknown"}). Stop it manually, then rerun pnpm.cmd dev.`,
    );
    process.exit(1);
  }

  const result = run("powershell", [
    "-NoProfile",
    "-Command",
    `Stop-Process -Id ${pid} -Force`,
  ]);

  if (result.status !== 0) {
    console.error(`Failed to stop existing Node process on port ${port}.`);
    process.exit(result.status || 1);
  }
}

function removeLockFile() {
  try {
    fs.rmSync(lockFile, { force: true });
  } catch (error) {
    console.error(`Failed to remove ${lockFile}: ${error.message}`);
    process.exit(1);
  }
}

stopNodeOnPort(3000);
stopNodeOnPort(3001);
removeLockFile();

const nextBin = path.join(projectRoot, "node_modules", ".bin", "next.cmd");
const child = spawn("cmd.exe", ["/c", nextBin, "dev", "--webpack"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
