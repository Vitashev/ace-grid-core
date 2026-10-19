import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const versions = process.argv[2] ? [process.argv[2]] : ["18.2.0", "19.1.1"];
const dev = JSON.parse(readFileSync(join(root, "package.json"))).devDependencies;
for (const version of versions) {
  if (!["18.2.0", "19.1.1"].includes(version)) throw new Error("Expected React 18.2.0 or 19.1.1");
  const temp = mkdtempSync(join(tmpdir(), "ace-core-consumer-"));
  const npm = (args, cwd = temp) => execFileSync("npm", args, { cwd, stdio: "inherit" });
  try {
    const [packed] = JSON.parse(execFileSync("npm", ["pack", "--pack-destination", temp, "--json"], { cwd: root, encoding: "utf8" }));
    const react18 = version.startsWith("18");
    writeFileSync(join(temp, "package.json"), JSON.stringify({
      name: "core-contributor-consumer", private: true, type: "module",
      dependencies: { "@ace-grid/core": `file:./${packed.filename}`, react: version, "react-dom": version },
      devDependencies: { typescript: dev.typescript, jsdom: dev.jsdom, "@types/node": dev["@types/node"], "@types/react": react18 ? "18.3.26" : "19.1.0", "@types/react-dom": react18 ? "18.3.7" : "19.1.0" },
    }));
    writeFileSync(join(temp, "declarations.ts"), readFileSync(join(root, "tests/declarations.ts"), "utf8").replace('"../dist/core"', '"@ace-grid/core"'));
    writeFileSync(join(temp, "consumer.test.mjs"), readFileSync(join(root, "tests/contributor-build.test.mjs"), "utf8").replaceAll('"../dist/core.js"', '"@ace-grid/core"').replaceAll('"../dist/core.cjs"', '"@ace-grid/core"'));
    npm(["install", "--no-fund"]);
    npm(["exec", "--", "tsc", "--noEmit", "--strict", "--skipLibCheck", "false", "--target", "ES2020", "--module", "ESNext", "--moduleResolution", "bundler", "--jsx", "react-jsx", "declarations.ts"]);
    execFileSync(process.execPath, ["--test", "consumer.test.mjs"], { cwd: temp, stdio: "inherit" });
    console.log(`Packed consumer passed with React and typings ${version}`);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
