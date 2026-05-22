import { Grid, useGrid } from "@ace-grid/enterprise";
import { registerAceGridVueDefaultElement } from "./vueTier";
import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridRow } from "./types";

registerAceGridVueDefaultElement(
  Grid as unknown as import("react").ComponentType<Partial<import("./types").GridProps>>,
  useGrid as unknown as (options: UseGridOptions) => [GridRow[], GridActions],
);

export { default } from "./vue";
export * from "./vue";
export * from "@ace-grid/enterprise";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
