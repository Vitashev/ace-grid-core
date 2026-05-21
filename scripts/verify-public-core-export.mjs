import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve } from "node:path";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const bannedPathPatterns = [
  {
    "source": "(^|\\/)portal(\\/|$)",
    "flags": ""
  },
  {
    "source": "(^|\\/)cdk(\\/|$)",
    "flags": ""
  },
  {
    "source": "(^|\\/)infra(\\/|$)",
    "flags": ""
  },
  {
    "source": "(^|\\/)packages\\/pro(\\/|$)",
    "flags": ""
  },
  {
    "source": "(^|\\/)packages\\/enterprise(\\/|$)",
    "flags": ""
  },
  {
    "source": "(^|\\/)packages\\/schema-ai(\\/|$)",
    "flags": ""
  }
].map((pattern) => new RegExp(pattern.source, pattern.flags));
const bannedContentPatterns = [
  {
    "source": "__ACE_GRID_PAID_",
    "flags": ""
  },
  {
    "source": "@ace-grid\\/schema-ai",
    "flags": ""
  },
  {
    "source": "schema-ai",
    "flags": ""
  },
  {
    "source": "schema\\.ai",
    "flags": ""
  },
  {
    "source": "features\\/schema\\/",
    "flags": ""
  },
  {
    "source": "GOOGLE_CLIENT_SECRET",
    "flags": "i"
  },
  {
    "source": "STRIPE_SECRET",
    "flags": "i"
  },
  {
    "source": "COGNITO",
    "flags": "i"
  },
  {
    "source": "AwsCustomResource|aws-cdk-lib",
    "flags": ""
  }
].map((pattern) => new RegExp(pattern.source, pattern.flags));

function walkFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir).sort()) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

const violations = [];
for (const filePath of walkFiles(rootDir)) {
  const relativePath = relative(rootDir, filePath).replaceAll("\\", "/");
  if (relativePath === "scripts/verify-public-core-export.mjs") continue;
  if (bannedPathPatterns.some((pattern) => pattern.test(relativePath))) {
    violations.push(`banned path: ${relativePath}`);
    continue;
  }
  if (!/\.(ts|tsx|js|mjs|json|md|yml|yaml|svelte)$/.test(relativePath)) continue;
  const source = readFileSync(filePath, "utf8");
  for (const pattern of bannedContentPatterns) {
    if (pattern.test(source)) {
      violations.push(`banned content ${pattern} in ${relativePath}`);
    }
  }
}

for (const requiredPath of [
  "packages/core/package.json",
  "packages/wc/package.json",
  "packages/angular/package.json",
  "packages/vue/package.json",
  "packages/svelte/package.json",
  "src/core.ts",
  "src/runtime/tierModules/core.ts"
]) {
  if (!existsSync(join(rootDir, requiredPath))) {
    violations.push(`missing required path: ${requiredPath}`);
  }
}

if (violations.length > 0) {
  console.error(["Public Core export verification failed:", ...violations].join("\n"));
  process.exit(1);
}

console.log("Public Core export verification passed.");
