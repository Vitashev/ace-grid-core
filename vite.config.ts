import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: "src/core.ts",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: [
        {
          format: "es",
          entryFileNames: "core.js",
          chunkFileNames: "[name]-[hash].mjs",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
        {
          format: "cjs",
          entryFileNames: "core.cjs",
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
