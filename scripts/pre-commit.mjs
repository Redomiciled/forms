import { spawnSync } from "node:child_process";

const checks = [
  ["npx", ["lint-staged"]],
  ["npm", ["run", "secrets:check"]],
  ["npm", ["run", "lint"]],
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "test"]],
];

for (const [command, args] of checks) {
  const label = [command, ...args].join(" ");
  console.log(`\nprecommit: ${label}`);

  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    console.error(`precommit failed to run ${label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
