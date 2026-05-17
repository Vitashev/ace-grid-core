import { Grid, useGrid } from "./index";
import { registerAceGridAngularDefaultElement } from "./angularTier";

registerAceGridAngularDefaultElement(Grid, useGrid);

export * from "./angular";
export * from "./index";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
