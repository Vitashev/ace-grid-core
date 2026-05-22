import { Grid, useGrid } from "@ace-grid/pro";
import { registerAceGridSvelteDefaultElement } from "./svelteTier";
import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridRow } from "./types";

registerAceGridSvelteDefaultElement(
  Grid as unknown as import("react").ComponentType<Partial<import("./types").GridProps>>,
  useGrid as unknown as (options: UseGridOptions) => [GridRow[], GridActions],
);

export { default } from "./svelte";
export * from "./svelte";
export * from "@ace-grid/pro";
export {
  defineAceGridElement,
  defineAceGridUseGridElement,
} from "./wc";
export type { AceGridUseGridElement } from "./wc";
