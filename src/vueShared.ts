import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridProps, GridRow } from "./types";
import type { GridIconSet } from "./features/theming";
import type {
  AceGridCustomElement,
  AceGridCustomEventDetail,
  AceGridHookElement,
  AceGridTemplateRegistry,
} from "./wc";

export const ACE_GRID_VUE_DEFAULT_TAG_NAME = "ace-grid";
export const ACE_GRID_VUE_EVENT_PREFIX = "ace-grid-";
export const ACE_GRID_VUE_COMMON_EVENTS = {
  cellChange: "ace-grid-cell-change",
  rowAdd: "ace-grid-row-add",
  rowDelete: "ace-grid-row-delete",
  selectionChange: "ace-grid-selection-change",
  selectionRangeChange: "ace-grid-selection-range-change",
  sortChange: "ace-grid-sort-change",
  sortModelChange: "ace-grid-sort-model-change",
  filterChange: "ace-grid-filter-change",
} as const;

type GridComponentProps = Record<string, unknown>;

type AceGridHookSurface<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> = Pick<
  AceGridHookElement<TProps, THookOptions, TRows, TActions>,
  | "actions"
  | "api"
  | "getActions"
  | "getApi"
  | "getHookOptions"
  | "getRows"
  | "hookOptions"
  | "rows"
  | "setHookOptions"
>;

export type AceGridVueCommonEventName =
  (typeof ACE_GRID_VUE_COMMON_EVENTS)[keyof typeof ACE_GRID_VUE_COMMON_EVENTS];

export type AceGridVueElementHost<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> = AceGridCustomElement<TProps> &
  Partial<AceGridHookSurface<TProps, THookOptions, TRows, TActions>>;

export interface AceGridVueReadyEvent<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> {
  element: AceGridVueElementHost<TProps, THookOptions, TRows, TActions>;
}

export type AceGridVueIconTemplateRegistry = Partial<{
  [K in keyof GridIconSet]: import("vue").Component<
    Parameters<NonNullable<GridIconSet[K]>>[0]
  >;
}>;

export interface AceGridVueComponentProps<
  TProps extends GridComponentProps = Partial<GridProps>,
  THookOptions = UseGridOptions,
  TRows = GridRow[],
  TActions = GridActions,
> {
  customTagName?: string;
  props?: TProps;
  hookOptions?: THookOptions | null;
  templates?: AceGridTemplateRegistry | null;
  iconTemplates?: AceGridVueIconTemplateRegistry | null;
  elementClassName?: string;
  _rowsTypeHint?: TRows | null;
  _actionsTypeHint?: TActions | null;
}

export interface AceGridVueComponentEvents<
  TProps extends GridComponentProps = Partial<GridProps>,
  THookOptions = UseGridOptions,
  TRows = GridRow[],
  TActions = GridActions,
> {
  ready: AceGridVueReadyEvent<TProps, THookOptions, TRows, TActions>;
  customEvent: CustomEvent<AceGridCustomEventDetail>;
  cellChange: AceGridCustomEventDetail;
  rowAdd: AceGridCustomEventDetail;
  rowDelete: AceGridCustomEventDetail;
  selectionChange: AceGridCustomEventDetail;
  selectionRangeChange: AceGridCustomEventDetail;
  sortChange: AceGridCustomEventDetail;
  sortModelChange: AceGridCustomEventDetail;
  filterChange: AceGridCustomEventDetail;
}

export interface AceGridVueComponentInstance<
  TProps extends GridComponentProps = Partial<GridProps>,
  THookOptions = UseGridOptions,
  TRows = GridRow[],
  TActions = GridActions,
> {
  getElement: () => AceGridVueElementHost<
    TProps,
    THookOptions,
    TRows,
    TActions
  > | null;
  rerender: () => void;
  setProps: (partial: Partial<TProps>) => void;
  getProps: () => TProps | null;
  setTemplates: (partial: Partial<AceGridTemplateRegistry>) => void;
  getTemplates: () => AceGridTemplateRegistry | null;
  setIconTemplates: (partial: Partial<AceGridVueIconTemplateRegistry>) => void;
  getIconTemplates: () => AceGridVueIconTemplateRegistry | null;
  setHookOptions: (partial: Partial<THookOptions>) => void;
  getHookOptions: () => THookOptions | null;
  getRows: () => TRows | null;
  getActions: () => TActions | null;
  getApi: () => TActions | null;
}

export type AceGridVueDefaultProps = Partial<GridProps>;
export type AceGridVueDefaultHookOptions = UseGridOptions;
export type AceGridVueDefaultRows = GridRow[];
export type AceGridVueDefaultActions = GridActions;
