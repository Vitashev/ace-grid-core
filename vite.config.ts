import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const angularPackageAliases = [
  {
    find: /^@ace-grid\/angular$/,
    replacement: resolve(__dirname, "packages/angular/dist/angular.js"),
  },
  {
    find: /^@ace-grid\/angular\/core$/,
    replacement: resolve(__dirname, "packages/angular/dist/angular-core.js"),
  },
];

const sveltePackageAliases = [
  {
    find: /^@ace-grid\/svelte$/,
    replacement: resolve(__dirname, "packages/svelte/dist/svelte.js"),
  },
  {
    find: /^@ace-grid\/svelte\/core$/,
    replacement: resolve(__dirname, "packages/svelte/dist/svelte-core.js"),
  },
];

const vuePackageAliases = [
  {
    find: /^@ace-grid\/vue$/,
    replacement: resolve(__dirname, "packages/vue/dist/vue.js"),
  },
  {
    find: /^@ace-grid\/vue\/core$/,
    replacement: resolve(__dirname, "packages/vue/dist/vue-core.js"),
  },
];

export default defineConfig({
  plugins: [vue(), svelte(), react()],
  resolve: {
    alias: [...angularPackageAliases, ...sveltePackageAliases, ...vuePackageAliases],
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "AceGrid",
      fileName: (format) => `ace-grid.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
