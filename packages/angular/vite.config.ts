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
        angular: resolve(rootDir, "src/angular.ts"),
        "angular-core": resolve(rootDir, "src/angular-core.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@angular/common",
        "@angular/core",
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
