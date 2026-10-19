import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const exampleDir = fileURLToPath(new URL(".", import.meta.url));
const corePath = fileURLToPath(new URL("../../src/core.ts", import.meta.url));
await build({
  root: exampleDir,
  mode: "local-core",
  plugins: [{
    name: "verify-local-core",
    generateBundle() {
      const ids = [...this.getModuleIds()];
      assert.ok(ids.includes(corePath), "The example must bundle this checkout's Core entry");
      assert.ok(!ids.some((id) => id.includes("/node_modules/@ace-grid/core/")), "Published Core must not enter the local bundle");
      const reactModules = ids.filter((id) => id.startsWith("/") && /\/node_modules\/(react|react-dom)\//.test(id));
      assert.ok(reactModules.length > 0);
      assert.ok(reactModules.every((id) => id.startsWith(exampleDir)), "Source and example must share the example's React installation");
    },
  }],
});
