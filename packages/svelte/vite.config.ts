import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const packageDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const rootDir = resolve(packageDir, "../..");

export default defineConfig({
  root: rootDir,
  plugins: [svelte()],
  build: {
    outDir: resolve(packageDir, "dist"),
    emptyOutDir: true,
    lib: {
      entry: {
        svelte: resolve(rootDir, "src/svelte.ts"),
        "svelte-core": resolve(rootDir, "src/svelte-core.ts"),
        "svelte-pro": resolve(rootDir, "src/svelte-pro.ts"),
        "svelte-enterprise": resolve(rootDir, "src/svelte-enterprise.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@ace-grid/core",
        "@ace-grid/pro",
        "@ace-grid/enterprise",
        "svelte",
        /^svelte(\/.*)?$/,
        "react",
        "react-dom",
        "react-dom/client",
      ],
      output: {
        exports: "named",
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].mjs",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
