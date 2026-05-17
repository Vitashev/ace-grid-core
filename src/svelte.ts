import type { Component } from "svelte";

import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridProps, GridRow } from "./types";
import type {
  AceGridSvelteComponentExports,
  AceGridSvelteComponentProps,
} from "./svelteShared";
import AceGridSvelteComponent from "./svelte-component.svelte";

export {
  ACE_GRID_SVELTE_COMMON_EVENTS,
  ACE_GRID_SVELTE_DEFAULT_TAG_NAME,
  ACE_GRID_SVELTE_EVENT_PREFIX,
} from "./svelteShared";
export type {
  AceGridSvelteCommonEventName,
  AceGridSvelteComponentEvents,
  AceGridSvelteComponentExports,
  AceGridSvelteComponentProps,
  AceGridSvelteIconTemplateRegistry,
  AceGridSvelteElementHost,
  AceGridSvelteReadyEvent,
} from "./svelteShared";

type GridComponentProps = Record<string, unknown>;

export type AceGridSvelteComponentType<
  TProps extends GridComponentProps = Partial<GridProps>,
  THookOptions = UseGridOptions,
  TRows = GridRow[],
  TActions = GridActions,
> = Component<
  AceGridSvelteComponentProps<TProps, THookOptions, TRows, TActions>,
  AceGridSvelteComponentExports<TProps, THookOptions, TRows, TActions>,
  keyof AceGridSvelteComponentProps<TProps, THookOptions, TRows, TActions> | ""
>;

export const AceGridComponent =
  AceGridSvelteComponent as unknown as AceGridSvelteComponentType;

export default AceGridComponent;
