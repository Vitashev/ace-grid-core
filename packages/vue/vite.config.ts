import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const packageDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const rootDir = resolve(packageDir, "../..");

export default defineConfig({
  root: rootDir,
  build: {
    outDir: resolve(packageDir, "dist"),
    emptyOutDir: true,
    lib: {
      entry: {
        vue: resolve(rootDir, "src/vue.ts"),
        "vue-core": resolve(rootDir, "src/vue-core.ts"),
        "vue-pro": resolve(rootDir, "src/vue-pro.ts"),
        "vue-enterprise": resolve(rootDir, "src/vue-enterprise.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@ace-grid/core",
        "@ace-grid/pro",
        "@ace-grid/enterprise",
        "vue",
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
