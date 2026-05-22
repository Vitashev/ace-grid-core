import { Grid, useGrid } from "@ace-grid/enterprise";
import { registerAceGridAngularDefaultElement } from "./angularTier";
import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridRow } from "./types";

registerAceGridAngularDefaultElement(
  Grid as unknown as import("react").ComponentType<Partial<import("./types").GridProps>>,
  useGrid as unknown as (options: UseGridOptions) => [GridRow[], GridActions],
);

export * from "./angular";
export * from "@ace-grid/enterprise";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
