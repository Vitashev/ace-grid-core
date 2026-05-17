import { Grid, useGrid } from "./core";
import { registerAceGridVueDefaultElement } from "./vueTier";

registerAceGridVueDefaultElement(Grid, useGrid);

export { default } from "./vue";
export * from "./vue";
export * from "./core";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
