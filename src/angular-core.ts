import { Grid, useGrid } from "./core";
import { registerAceGridAngularDefaultElement } from "./angularTier";

registerAceGridAngularDefaultElement(Grid, useGrid);

export * from "./angular";
export * from "./core";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
