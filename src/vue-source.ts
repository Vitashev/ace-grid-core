import { Grid, useGrid } from "./index";
import { registerAceGridVueDefaultElement } from "./vueTier";

registerAceGridVueDefaultElement(Grid, useGrid);

export { default } from "./vue";
export * from "./vue";
export * from "./index";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
