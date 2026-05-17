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
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
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
