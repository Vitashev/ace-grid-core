import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";

import type { GridColumn, GridRow, GridSelection } from "../../types";

export const BUILT_IN_CONTEXT_MENU_ACTIONS = [
  "mergeCells",
  "unmergeCells",
  "addRowsAbove",
  "addRowsBelow",
  "addColumnsLeft",
  "addColumnsRight",
] as const;

export const GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS = {
  merge: "merge",
  unmerge: "unmerge",
  dividerDefault: "ctx-divider-default",
  rowsAbove: "rows-above",
  rowsBelow: "rows-below",
  rowsRemove: "rows-remove",
  colsLeft: "cols-left",
  colsRight: "cols-right",
  colsRemove: "cols-remove",
  dividerExtra: "ctx-divider-extra",
  copyRange: "copy-range",
  cutRange: "cut-range",
  pasteRange: "paste-range",
  cellFill: "cell-fill",
} as const;

export type GridContextMenuBuiltInAction =
  (typeof BUILT_IN_CONTEXT_MENU_ACTIONS)[number];

export type GridDefaultContextMenuItemId =
  (typeof GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS)[keyof typeof GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS];

export interface GridContextMenuTarget {
  rowIndex: number;
  colIndex: number;
  rowId: string | number | null;
  columnKey: string | null;
  row?: GridRow;
  column?: GridColumn;
  isPinnedRow: boolean;
  isPinnedColumn: boolean;
  isSystemColumn: boolean;
}

export interface GridContextMenuSelectionInfo {
  rowIds: (string | number)[];
  columnKeys: string[];
  rowIndices: number[];
  columnIndices: number[];
  selectionRange: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
  includesPinnedCell: boolean;
  isSingleCell: boolean;
  isMultiRow: boolean;
  isMultiColumn: boolean;
  activeMergeIds: string[];
  fullyContainedMergeIds: string[];
  hasPartialMergeOverlap: boolean;
}

export interface GridContextMenuContext {
  anchorX: number;
  anchorY: number;
  event: ReactMouseEvent | MouseEvent | null;
  selection: GridSelection | null;
  selectionInfo: GridContextMenuSelectionInfo;
  target: GridContextMenuTarget | null;
}

export type GridContextMenuPredicate = (
  ctx: GridContextMenuContext
) => boolean;

export interface GridContextMenuBaseItem {
  id?: string;
  disabled?: boolean | GridContextMenuPredicate;
  hidden?: boolean | GridContextMenuPredicate;
}

export interface GridContextMenuDividerDefinition
  extends GridContextMenuBaseItem {
  type: "divider";
}

export interface GridContextMenuCustomItemDefinition
  extends GridContextMenuBaseItem {
  type: "custom";
  render: (ctx: GridContextMenuRenderContext) => ReactNode;
}

export interface GridContextMenuActionDefinition
  extends GridContextMenuBaseItem {
  type?: "action";
  action?: GridContextMenuBuiltInAction | string;
  label?: ReactNode | ((ctx: GridContextMenuContext) => ReactNode);
  description?:
    | ReactNode
    | ((ctx: GridContextMenuContext) => ReactNode);
  shortcut?: string;
  icon?: ReactNode | ((ctx: GridContextMenuContext) => ReactNode);
  onSelect?: GridContextMenuActionHandler;
}

export type GridContextMenuLeafItemDefinition =
  | GridContextMenuDividerDefinition
  | GridContextMenuCustomItemDefinition
  | GridContextMenuActionDefinition
  | GridContextMenuBuiltInAction;

export interface GridContextMenuSubmenuDefinition
  extends GridContextMenuBaseItem {
  type: "submenu";
  label: ReactNode | ((ctx: GridContextMenuContext) => ReactNode);
  description?:
    | ReactNode
    | ((ctx: GridContextMenuContext) => ReactNode);
  shortcut?: string;
  icon?: ReactNode | ((ctx: GridContextMenuContext) => ReactNode);
  items: GridContextMenuLeafItemDefinition[];
}

export type GridContextMenuItemDefinition =
  | GridContextMenuLeafItemDefinition
  | GridContextMenuSubmenuDefinition;

export interface GridContextMenuResolvedDividerItem {
  id: string;
  type: "divider";
  disabled: boolean;
  hidden: boolean;
  definition: GridContextMenuDividerDefinition;
}

export interface GridContextMenuResolvedCustomItem {
  id: string;
  type: "custom";
  actionId?: GridContextMenuBuiltInAction | string;
  label?: ReactNode;
  description?: ReactNode;
  shortcut?: string;
  icon?: ReactNode;
  disabled: boolean;
  hidden: boolean;
  render?: (ctx: GridContextMenuRenderContext) => ReactNode;
  onSelect?: GridContextMenuActionHandler;
  definition: GridContextMenuCustomItemDefinition;
}

export interface GridContextMenuResolvedActionItem {
  id: string;
  type: "action";
  actionId?: GridContextMenuBuiltInAction | string;
  label?: ReactNode;
  description?: ReactNode;
  shortcut?: string;
  icon?: ReactNode;
  disabled: boolean;
  hidden: boolean;
  onSelect?: GridContextMenuActionHandler;
  definition: GridContextMenuActionDefinition | GridContextMenuBuiltInAction;
}

export interface GridContextMenuResolvedSubmenuItem {
  id: string;
  type: "submenu";
  label: ReactNode;
  description?: ReactNode;
  shortcut?: string;
  icon?: ReactNode;
  disabled: boolean;
  hidden: boolean;
  items: GridContextMenuResolvedLeafItem[];
  definition: GridContextMenuSubmenuDefinition;
}

export type GridContextMenuResolvedLeafItem =
  | GridContextMenuResolvedDividerItem
  | GridContextMenuResolvedCustomItem
  | GridContextMenuResolvedActionItem;

export type GridContextMenuResolvedItem =
  | GridContextMenuResolvedLeafItem
  | GridContextMenuResolvedSubmenuItem;

export interface GridContextMenuActionContext
  extends GridContextMenuContext {
  item: GridContextMenuResolvedItem;
}

export type GridContextMenuActionHandler = (
  ctx: GridContextMenuActionContext
) => void;

export interface GridContextMenuRenderContext
  extends GridContextMenuActionContext {
  close: () => void;
}

export interface GridContextMenuRenderProps {
  context: GridContextMenuContext;
  items: GridContextMenuResolvedItem[];
  close: () => void;
  getMenuProps: () => {
    className?: string;
    style?: CSSProperties;
  };
  renderDefault: () => ReactNode;
}

export interface GridContextMenuItemRenderProps {
  item: GridContextMenuResolvedItem;
  context: GridContextMenuContext;
  close: () => void;
  onSelect: () => void;
}

export interface GridContextMenuHandlers {
  mergeCells?: (ctx: GridContextMenuActionContext) => void;
  unmergeCells?: (ctx: GridContextMenuActionContext) => void;
  insertRows?: (
    ctx: GridContextMenuActionContext & {
      position: "above" | "below";
      count: number;
    }
  ) => void;
  insertColumns?: (
    ctx: GridContextMenuActionContext & {
      position: "left" | "right";
      count: number;
    }
  ) => void;
}

export interface GridContextMenuVisualOverrides {
  className?: string;
  style?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  portalContainer?: HTMLElement | null;
}

export interface GridContextMenuConfig
  extends GridContextMenuVisualOverrides {
  enabled?: boolean;
  maxHeight?: number;
  items?:
    | GridContextMenuItemDefinition[]
    | ((ctx: GridContextMenuContext) => GridContextMenuItemDefinition[]);
  closeOnSelect?: boolean;
  renderMenu?: (props: GridContextMenuRenderProps) => ReactNode;
  onOpen?: (ctx: GridContextMenuContext) => void;
  onClose?: () => void;
  onAction?: (id: string, ctx: GridContextMenuActionContext) => void;
  handlers?: GridContextMenuHandlers;
}

export type GridContextMenuProps = GridContextMenuConfig;
