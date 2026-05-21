import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packages = [
  "@ace-grid/core",
  "@ace-grid/wc",
  "@ace-grid/angular",
  "@ace-grid/vue",
  "@ace-grid/svelte"
];

for (const packageName of packages) {
  execFileSync("npm", ["run", "build", "--workspace", packageName], {
    cwd: rootDir,
    stdio: "inherit",
  });
}
