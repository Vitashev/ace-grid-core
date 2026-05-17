import { Grid, useGrid } from "./core";
import { registerAceGridSvelteDefaultElement } from "./svelteTier";

registerAceGridSvelteDefaultElement(Grid, useGrid);

export { default } from "./svelte";
export * from "./svelte";
export * from "./core";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
