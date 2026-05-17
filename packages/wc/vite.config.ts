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
      entry: resolve(rootDir, "src/wc.ts"),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: [
        {
          format: "es",
          entryFileNames: "wc.js",
          chunkFileNames: "[name]-[hash].mjs",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
        {
          format: "cjs",
          entryFileNames: "wc.cjs",
          chunkFileNames: "[name]-[hash].cjs",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      ],
    },
  },
});
