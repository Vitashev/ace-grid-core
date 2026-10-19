import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep the default StackBlitz starter on the published package. Contributors
// opt into the checked-out source, sharing the example's React installation.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: mode === "local-core"
      ? [{ find: /^@ace-grid\/core$/, replacement: fileURLToPath(new URL("../../src/core.ts", import.meta.url)) }]
      : [],
    dedupe: ["react", "react-dom"],
  },
}));
