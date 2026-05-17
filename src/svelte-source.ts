import { Grid, useGrid } from "./index";
import { registerAceGridSvelteDefaultElement } from "./svelteTier";

registerAceGridSvelteDefaultElement(Grid, useGrid);

export { default } from "./svelte";
export * from "./svelte";
export * from "./index";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
