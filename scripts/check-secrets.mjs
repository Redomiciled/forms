import { spawnSync } from "node:child_process";

const args = [
  "git",
  "--pre-commit",
  "--staged",
  "--redact",
  "--config",
  ".gitleaks.toml",
  "--no-banner",
];

const result = spawnSync("gitleaks", args, { stdio: "inherit" });

if (result.error?.code === "ENOENT") {
  console.error(
    "secrets:check failed: gitleaks is not installed or not on PATH."
  );
  console.error("Install it with: brew install gitleaks");
  console.error("Then rerun: npm run secrets:check");
  process.exit(127);
}

if (result.error) {
  console.error(`secrets:check failed: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
