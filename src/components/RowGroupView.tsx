import React, { useMemo, useCallback, useState } from "react";
import { GRID_SYSTEM_COLUMN_KEYS } from "../types";
import type { CSSProperties } from "react";
import type {
  GridColumn,
  GridLoadingCellRenderer,
  GridMasterDetailProps,
  GridPinProps,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionState,
  GridValidationCellState,
  GridRowGroup,
  GridRowGroupSpan,
} from "../types";
import type { GridThemeTokens } from "../features/theming/types";
import type { SpanCoverage } from "../features/span/hooks/useSpanCoverage";
import { spanCellKey } from "../features/span/hooks/useSpanCoverage";
import { GridCell } from "./GridCell";
import type { SsrmSelectionLookupCache } from "../features/selection/ssrmSelectionState";
import { VirtualizedGridCell } from "../features/virtual/components/VirtualizedGridCell";
import { SystemCell } from "../features/columns/components/SystemCell";
import type {
  RowSelectionChangeMeta,
  RowSelectSelectionMetrics,
} from "../features/selection/components/RowSelectCell";
import { OffsetCell } from "../features/virtual/components/OffsetCell";
import { formatCellValue } from "../features/cell-format";
import { buildGridBodyCellId } from "../features/interaction/utils";
import {
  getSearchHighlightMarkProps,
  isActiveSearchCell,
  splitSearchMatches,
  useGridSearch,
} from "../features/search";
import { getGridRuntimeModules } from "../runtime/modules";
import { cx } from "../utils/cx";
import type { GridValidationDisplayConfig } from "../features/validation/utils";
import {
  CELL_BORDER,
  EDIT_BORDER,
  SELECTION_COLOR,
  isSystemCol,
} from "../features/cell-selection";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";
import { CellEditor } from "../features/edit/components/CellEditor";
import type { OpenContextMenuArgs } from "../features/context-menu/hooks/useContextMenu";
import type { RowDragState } from "../features/reorder/hooks/useRowDnD";
import type { EditingCellState } from "../features/edit/types";
import { useGridStoreSelector } from "../features/grid-store";
import type { GridStoreState } from "../features/grid-store/store";
import { type FormulaReferenceRange } from "../features/formula";

type RowGroupViewProps = {
  group: GridRowGroup;
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  visualColumns: GridColumn[];
  visualColumnSizes: string[];
  visualColumnIndex: Map<string, number>;
  columnIndexLookup: Map<string, number>;
  pinnedLeftWidth: number;
  pinnedRightWidth: number;
  pinnedLeftColumnSizes: string[];
  pinnedRightColumnSizes: string[];
  centerColumnSizes: string[];
  virtualCenterCols: {
    before: number;
    after: number;
    start: number;
    end: number;
    visible: GridColumn[];
  };
  rowIndexLookup: Map<string | number, number>;
  getRowKeyLabel?: (row: GridRow, rowIndex: number) => React.ReactNode;
  rowHeightOf: (rowId: string | number) => number;
  colWidthOf: (columnKey: string, fallback?: number) => number;
  applyPinnedStyle: (
    base: CSSProperties,
    column: GridColumn,
    isLeft: boolean,
    isRight: boolean,
    mode?: "cell" | "strip"
  ) => CSSProperties;
  tokens: GridThemeTokens;
  rowDragState: RowDragState;
  isRowReorder: boolean;
  handleRowDragStart: (e: React.DragEvent, rowId: string) => void;
  onRowDragOver: (e: React.DragEvent, rowId: string) => void;
  onRowDragLeave: (e: React.DragEvent) => void;
  onRowDrop: (e: React.DragEvent, rowId: string) => void;
  onRowDragEnd: (e: React.DragEvent) => void;
  rowHasSpans: (rowId: string | number) => boolean;
  centerSpanCoverage: Map<string, SpanCoverage>;
  cellPadding: string;
  selectionEdgeStyle: (
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    columnKey: string
  ) => CSSProperties;
  handleCellMouseDown: (
    rowIndex: number,
    colIndex: number,
    event: React.MouseEvent
  ) => void;
  handleCellMouseEnter: (
    rowIndex: number,
    colIndex: number,
    event: React.MouseEvent
  ) => void;
  selectSingleCell: (
    rowIndex: number,
    colIndex: number,
    event?: React.MouseEvent,
    rowSpan?: number,
    colSpan?: number
  ) => void;
  onCellDbl: (rowIndex: number, colIndex: number, element?: HTMLElement) => void;
  openCellContextMenu: (args: OpenContextMenuArgs) => void;
  renderFillHandle: (visible: boolean) => React.ReactNode;
  isFillHandleCell: (
    rowIndex: number,
    colIndex: number,
    rowSpan?: number,
    colSpan?: number,
    columnKey?: string
  ) => boolean;
  enableColumnResize: boolean;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;
  enableCellContentVirtualization: boolean;
  updateEditingValue: (value: any) => void;
  commitEdit: (rowIndex: number, colIndex: number, rawValue?: any) => void;
  cancelEdit: () => void;
  registerEditorValueListener: (listener: ((value: any) => void) | null) => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  getCellValidation: (
    rowId: string | number,
    columnKey: string
  ) => GridValidationCellState | null;
  validationDisplay: GridValidationDisplayConfig;
  validationRevision: number;
  loadingCellRenderer?: GridLoadingCellRenderer;
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  handlePinRow: (rowId: string | number, side: "top" | "bottom" | null) => void;
  renderRowPinCell?: GridPinProps["renderRowPinCell"];
  rows: GridRow[];
  selectedRowIds: (string | number)[];
  selectedRowIdSet: Set<string | number>;
  selectionMetrics?: RowSelectSelectionMetrics;
  handleRowSelectionChange: (
    ids: (string | number)[],
    meta?: RowSelectionChangeMeta
  ) => void;
  clientGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionState?: GridServerRowModelSelectionState;
  ssrmSelectableRowCount?: number;
  ssrmGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionCache?: SsrmSelectionLookupCache;
  handleSsrmSelectionStateChange?: (
    state: GridServerRowModelSelectionState
  ) => void;
  enableRowResize: boolean;
  hasRowResizeHandler: boolean;
  createRowResizeHandle: (
    rowId: string | number,
    hasSpan: boolean,
    offset: number,
    containerHeight?: number
  ) => React.ReactNode;
  onToggleGroupRow?: (
    path: string,
    expanded: boolean,
    meta?: {
      rowIndex?: number;
      childCount?: number;
      level?: number;
      visibleDescendantCount?: number;
    }
  ) => void;
  resolveGroupExpandedState?: (path: string, fallback: boolean) => boolean;
  isGroupToggleLoading?: (path: string) => boolean;
  allowGroupHeaderDrag?: boolean;
  masterDetail?: {
    enabled: boolean;
    isRowMaster: (row: GridRow) => boolean;
    isExpanded: (rowId: string | number) => boolean;
    toggleRow: (rowId: string | number) => void;
    collapseRow: (rowId: string | number) => void;
    detailRowHeightOf: (row: GridRow) => number;
    renderDetail?: GridMasterDetailProps["renderDetail"];
    renderToggleIcon?: GridMasterDetailProps["renderToggleIcon"];
    renderToggleCell?: GridMasterDetailProps["renderToggleCell"];
  };
  rowModel?: {
    getRow: (index: number) => GridRow;
    version?: number;
    rowCount?: number;
  };
  background?: string;
  shadow?: string;
  formulaHighlightRanges?: FormulaHighlightRange[];
  ariaRowIndexOffset?: number;
  resolveBodyRowIndex?: (rowIndex: number) => number;
  gridBodyCellIdBase?: string;
};

const EMPTY_SPAN_LOOKUP = new Map<string, GridRowGroupSpan>();
const EMPTY_COVERED_CELLS = new Set<string>();
const EMPTY_SELECTION_STYLE: CSSProperties = {};
const EMPTY_ROW_DATA: GridRow["data"] = {};
const SPAN_EDGE_COLOR =
  "var(--ace-grid-cell-border-bottom-color, var(--ace-grid-cell-border-color))";

export const suppressAdjacentSpanDividers = (
  style: CSSProperties,
  spanStartLookup: Map<string, GridRowGroupSpan>,
  coveredCells: Set<string>,
  rowOffset: number,
  colIndex: number,
  isSelectionBorder: (value?: string) => boolean
): CSSProperties => {
  const touchesSpanOnRight =
    isSpanOccupied(spanStartLookup, coveredCells, rowOffset, colIndex + 1) &&
    !isSelectionBorder(style.borderRightColor as string | undefined);
  const touchesSpanOnLeft =
    colIndex > 0 &&
    isSpanOccupied(spanStartLookup, coveredCells, rowOffset, colIndex - 1) &&
    !isSelectionBorder(style.borderLeftColor as string | undefined);

  if (!touchesSpanOnRight && !touchesSpanOnLeft) {
    return style;
  }

  const next: CSSProperties = { ...style };

  if (touchesSpanOnRight) {
    next.borderRightWidth = 1;
    next.borderRightStyle = "solid";
    next.borderRightColor = SPAN_EDGE_COLOR;
  }

  if (touchesSpanOnLeft) {
    next.borderLeftWidth = 0;
    next.borderLeftStyle = "none";
    next.borderLeftColor = "transparent";
  }

  return next;
};

const isSpanOccupied = (
  spanStartLookup: Map<string, GridRowGroupSpan>,
  coveredCells: Set<string>,
  rowOffset: number,
  colIndex: number
) =>
  coveredCells.has(spanCellKey(rowOffset, colIndex)) ||
  spanStartLookup.has(`${rowOffset}:${colIndex}`);

export const resolveAdjacentSpanOverlayBorders = (
  style: CSSProperties,
  hasRenderedLeftNeighbor: boolean
): CSSProperties => {
  if (!hasRenderedLeftNeighbor) {
    return style;
  }

  const next = { ...style } as CSSProperties & Record<string, string>;
  next["--ace-grid-span-left-border-color"] = "transparent";

  return next;
};

export type FormulaHighlightRange = FormulaReferenceRange & {
  color: string;
};

const colBox = (w: number, h: number): CSSProperties => ({
  width: w,
  minWidth: w,
  maxWidth: w,
  height: h,
  flexShrink: 0,
  boxSizing: "border-box",
});

const editingCellComparer = (
  a: EditingCellState | null,
  b: EditingCellState | null
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.rowIndex === b.rowIndex &&
    a.colIndex === b.colIndex &&
    a.version === b.version &&
    a.columnKey === b.columnKey
  );
};

const editingValidationComparer = (
  a: GridValidationCellState | null,
  b: GridValidationCellState | null
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.severity === b.severity &&
    a.message === b.message &&
    a.pending === b.pending &&
    (a.results?.length ?? 0) === (b.results?.length ?? 0)
  );
};

const makeGroupEditingSelector =
  (start: number, end: number) => (state: GridStoreState) => {
    const cell = state.editing.cell;
    if (!cell) return null;
    return cell.rowIndex >= start && cell.rowIndex <= end ? cell : null;
  };

const makeGroupEditingValidationSelector =
  (start: number, end: number) => (state: GridStoreState) => {
    const cell = state.editing.cell;
    if (!cell) return null;
    if (cell.rowIndex < start || cell.rowIndex > end) return null;
    return state.editing.validation ?? null;
  };

type PinnedStripProps = {
  side: "left" | "right";
  height: number;
  width: number;
  zIndex?: number;
  background?: string;
  shadow?: string;
  allowOverflow?: boolean;
  children: React.ReactNode;
};

const RowGroupPinnedStrip = React.memo(
  ({
    side,
    height,
    width,
    zIndex = 80,
    background,
    shadow,
    allowOverflow = false,
    children,
  }: PinnedStripProps) => {
    const normalizeCssVarRef = (value: string) => value.replace(/\s+/g, "");
    const isDirectSelfVarRef = (cssVarName: string, value: string) =>
      normalizeCssVarRef(value) === `var(${cssVarName})`;

    const stripStyle = {
      display: "flex",
      flex: "0 0 auto",
      alignItems: "stretch",
      position: "sticky",
      height,
      pointerEvents: "auto",
      width,
      minWidth: width,
      maxWidth: width,
      zIndex,
      left: side === "left" ? 0 : undefined,
      right: side === "right" ? 0 : undefined,
      background: background ?? undefined,
      boxShadow: shadow ?? undefined,
      overflow: allowOverflow ? "visible" : "hidden",
    } as React.CSSProperties & Record<string, string | number>;
    if (background) {
      const backgroundVarName =
        side === "left" ? "--ace-grid-pinned-left-bg" : "--ace-grid-pinned-right-bg";
      if (!isDirectSelfVarRef(backgroundVarName, background)) {
        stripStyle[backgroundVarName] = background;
      }
    }
    if (shadow) {
      if (side === "left") {
        if (!isDirectSelfVarRef("--ace-grid-pinned-shadow-left-edge", shadow)) {
          stripStyle["--ace-grid-pinned-shadow-left-edge"] = shadow;
        }
      } else {
        if (!isDirectSelfVarRef("--ace-grid-pinned-shadow-right-edge", shadow)) {
          stripStyle["--ace-grid-pinned-shadow-right-edge"] = shadow;
        }
      }
    }
    return (
      <div
        className={cx(
          "ace-grid__row-group-pinned",
          `ace-grid__row-group-pinned--${side}`,
          allowOverflow && "ace-grid__row-group-pinned--allow-overflow",
        )}
        style={stripStyle}
      >
        {children}
      </div>
    );
  }
);
RowGroupPinnedStrip.displayName = "RowGroupPinnedStrip";

const RowGroupViewInner: React.FC<RowGroupViewProps> = ({
  group,
  pinnedLeftColumns,
  pinnedRightColumns,
  centerColumns,
  visualColumns,
  visualColumnSizes,
  visualColumnIndex,
  columnIndexLookup,
  pinnedLeftWidth,
  pinnedRightWidth,
  pinnedLeftColumnSizes,
  pinnedRightColumnSizes,
  centerColumnSizes,
  virtualCenterCols,
  rowIndexLookup,
  getRowKeyLabel,
  rowHeightOf,
  colWidthOf,
  applyPinnedStyle,
  tokens,
  rowDragState,
  isRowReorder,
  handleRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  onRowDragEnd,
  rowHasSpans,
  centerSpanCoverage,
  cellPadding,
  selectionEdgeStyle,
  handleCellMouseDown,
  handleCellMouseEnter,
  selectSingleCell,
  onCellDbl,
  openCellContextMenu,
  renderFillHandle,
  isFillHandleCell,
  enableColumnResize,
  getColumnResizeHandleProps,
  enableCellContentVirtualization,
  updateEditingValue,
  commitEdit,
  cancelEdit,
  registerEditorValueListener,
  isCellSelected,
  getCellValidation,
  validationDisplay,
  validationRevision,
  loadingCellRenderer,
  pinnedRows,
  handlePinRow,
  renderRowPinCell,
  rows,
  selectedRowIds,
  selectedRowIdSet,
  selectionMetrics,
  handleRowSelectionChange,
  clientGroupSelects,
  ssrmSelectionState,
  ssrmSelectableRowCount,
  ssrmGroupSelects,
  ssrmSelectionCache,
  handleSsrmSelectionStateChange,
  enableRowResize,
  hasRowResizeHandler,
  createRowResizeHandle,
  onToggleGroupRow,
  resolveGroupExpandedState,
  allowGroupHeaderDrag = false,
  masterDetail,
  rowModel,
  background,
  shadow,
  formulaHighlightRanges = [],
  ariaRowIndexOffset = 0,
  resolveBodyRowIndex,
  gridBodyCellIdBase,
}) => {
  const groupEditingSelector = useMemo(
    () => makeGroupEditingSelector(group.startRowIndex, group.endRowIndex),
    [group.startRowIndex, group.endRowIndex]
  );
  const groupEditingValidationSelector = useMemo(
    () =>
      makeGroupEditingValidationSelector(
        group.startRowIndex,
        group.endRowIndex
      ),
    [group.startRowIndex, group.endRowIndex]
  );
  const editingCell = useGridStoreSelector(
    groupEditingSelector,
    editingCellComparer
  );
  const editingValidation = useGridStoreSelector(
    groupEditingValidationSelector,
    editingValidationComparer
  );
  const validationModule = getGridRuntimeModules().validation;
  const search = useGridSearch();

  const resolveFormulaHighlight = useCallback(
    (rowStart: number, rowEnd: number, colStart: number, colEnd: number) => {
      if (!formulaHighlightRanges.length) return null;
      for (let i = 0; i < formulaHighlightRanges.length; i += 1) {
        const range = formulaHighlightRanges[i];
        if (
          rowEnd < range.startRow ||
          rowStart > range.endRow ||
          colEnd < range.startCol ||
          colStart > range.endCol
        ) {
          continue;
        }
        return range;
      }
      return null;
    },
    [formulaHighlightRanges]
  );

  const resolveFormulaFillColor = useCallback((color: string) => {
    if (!color) return null;
    const trimmed = color.trim();
    if (trimmed.startsWith("#")) {
      const hex = trimmed.length === 4
        ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
        : trimmed;
      if (hex.length === 7) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
      }
    }
    const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(",").map((part) => part.trim());
      const r = Number(parts[0]);
      const g = Number(parts[1]);
      const b = Number(parts[2]);
      if ([r, g, b].every((v) => Number.isFinite(v))) {
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
      }
    }
    return `color-mix(in srgb, ${trimmed} 18%, transparent)`;
  }, []);

  const isSelectionBorder = useCallback((value?: string) => {
    if (!value) return false;
    return value === SELECTION_COLOR || value.includes("--ace-grid-selection-border");
  }, []);

  const isSelectionBackground = useCallback((value?: string) => {
    if (!value) return false;
    return (
      value.includes("--ace-grid-cell-bg-selected") ||
      value.includes("--ace-grid-selection-fill")
    );
  }, []);

  const applyFormulaHighlight = useCallback(
    (
      style: CSSProperties,
      range: FormulaHighlightRange | null,
      rowStart: number,
      rowEnd: number,
      colStart: number,
      colEnd: number
    ) => {
      if (!range) return style;
      const overlaps =
        range.endRow >= rowStart &&
        range.startRow <= rowEnd &&
        range.endCol >= colStart &&
        range.startCol <= colEnd;
      if (!overlaps) return style;

      const next: CSSProperties = { ...style };

      const topEdge =
        range.startRow === rowStart &&
        !isSelectionBorder(next.borderTopColor as string | undefined);
      const bottomEdge =
        range.endRow === rowEnd &&
        !isSelectionBorder(next.borderBottomColor as string | undefined);
      const leftEdge =
        range.startCol === colStart &&
        !isSelectionBorder(next.borderLeftColor as string | undefined);
      const rightEdge =
        range.endCol === colEnd &&
        !isSelectionBorder(next.borderRightColor as string | undefined);

      const antsSize = 8;
      const antsThickness = 2;
      const antsDash = 4;
      const antsPattern = `repeating-linear-gradient(90deg, ${range.color} 0 ${antsDash}px, transparent ${antsDash}px ${antsSize}px)`;
      const antsPatternVertical = `repeating-linear-gradient(0deg, ${range.color} 0 ${antsDash}px, transparent ${antsDash}px ${antsSize}px)`;

      const backgroundImages: string[] = [];
      const backgroundSizes: string[] = [];
      const backgroundPositions: string[] = [];
      const backgroundRepeats: string[] = [];

      const fill =
        !isSelectionBackground(next.backgroundColor as string | undefined)
          ? resolveFormulaFillColor(range.color)
          : null;
      backgroundImages.push(
        fill ? `linear-gradient(${fill}, ${fill})` : "none"
      );
      backgroundSizes.push("100% 100%");
      backgroundPositions.push("0 0");
      backgroundRepeats.push("no-repeat");

      backgroundImages.push(topEdge ? antsPattern : "none");
      backgroundSizes.push(
        topEdge ? `${antsSize}px ${antsThickness}px` : "0 0"
      );
      backgroundPositions.push("0 0");
      backgroundRepeats.push("repeat-x");

      backgroundImages.push(rightEdge ? antsPatternVertical : "none");
      backgroundSizes.push(
        rightEdge ? `${antsThickness}px ${antsSize}px` : "0 0"
      );
      backgroundPositions.push("100% 0");
      backgroundRepeats.push("repeat-y");

      backgroundImages.push(bottomEdge ? antsPattern : "none");
      backgroundSizes.push(
        bottomEdge ? `${antsSize}px ${antsThickness}px` : "0 0"
      );
      backgroundPositions.push("0 100%");
      backgroundRepeats.push("repeat-x");

      backgroundImages.push(leftEdge ? antsPatternVertical : "none");
      backgroundSizes.push(
        leftEdge ? `${antsThickness}px ${antsSize}px` : "0 0"
      );
      backgroundPositions.push("0 0");
      backgroundRepeats.push("repeat-y");

      next.backgroundImage = backgroundImages.join(", ");
      next.backgroundSize = backgroundSizes.join(", ");
      next.backgroundPosition = backgroundPositions.join(", ");
      next.backgroundRepeat = backgroundRepeats.join(", ");

      const antsAnimation = "ace-grid-formula-ants 1.1s linear infinite";
      next.animation = next.animation
        ? `${next.animation}, ${antsAnimation}`
        : antsAnimation;

      return next;
    },
    [isSelectionBackground, isSelectionBorder, resolveFormulaFillColor]
  );

  const resolveFormulaHighlightStyle = useCallback(
    (
      style: CSSProperties,
      rowStart: number,
      rowEnd: number,
      columnKey: string,
      colSpan: number = 1
    ) => {
      if (!formulaHighlightRanges.length) return style;
      const baseColIndex = columnIndexLookup.get(columnKey);
      if (baseColIndex == null) return style;
      const span = Math.max(1, colSpan);
      const range = resolveFormulaHighlight(
        rowStart,
        rowEnd,
        baseColIndex,
        baseColIndex + span - 1
      );
      return applyFormulaHighlight(
        style,
        range,
        rowStart,
        rowEnd,
        baseColIndex,
        baseColIndex + span - 1
      );
    },
    [
      columnIndexLookup,
      formulaHighlightRanges.length,
      applyFormulaHighlight,
      resolveFormulaHighlight,
    ]
  );

  const rowsForRender = useMemo(() => {
    if (!rowModel) return group.rows;
    const count = Math.max(0, group.endRowIndex - group.startRowIndex + 1);
    const next: GridRow[] = new Array(count);
    for (let i = 0; i < count; i += 1) {
      next[i] = rowModel.getRow(group.startRowIndex + i);
    }
    return next;
  }, [rowModel, group.startRowIndex, group.endRowIndex, group.rows]);

  const id = String(rowsForRender[0]?.id ?? group.id);
  const isGroupHeader = Boolean(rowsForRender[0]?.meta?.group);
  const hasMultiRowGroup = rowsForRender.length > 1;
  const groupContainsAnySpan = group.spans.size > 0;
  const rowSpanBlocked =
    groupContainsAnySpan ||
    rowHasSpans(id) ||
    (isGroupHeader && !allowGroupHeaderDrag);
  const hasSpans =
    rowSpanBlocked || isGroupHeader || hasMultiRowGroup;
  const isDragged =
    rowDragState.draggedRowId === id ||
    rowDragState.draggedRowIds.includes(id);
  const isOver = rowDragState.dragOverRowId === id;
  const canDrag = isRowReorder && !rowSpanBlocked;
  const groupHeight = group.height;
  const rowHeightHint = useMemo(() => {
    const rowCount = Math.max(1, rowsForRender.length);
    return Math.max(20, Math.round(groupHeight / rowCount) || 32);
  }, [groupHeight, rowsForRender.length]);
  const hiddenBeforeColumns = useMemo(
    () => centerColumns.slice(0, Math.max(0, virtualCenterCols.start)),
    [centerColumns, virtualCenterCols.start]
  );
  const hiddenAfterColumns = useMemo(
    () =>
      centerColumns.slice(
        Math.min(centerColumns.length, virtualCenterCols.end + 1)
      ),
    [centerColumns, virtualCenterCols.end]
  );
  const resolveOffsetTone = useCallback(
    (columns: GridColumn[]): "default" | "system" => {
      if (!columns.length) return "default";
      let systemCount = 0;
      for (let i = 0; i < columns.length; i += 1) {
        if (isSystemCol(columns[i].key)) systemCount += 1;
      }
      return systemCount / columns.length >= 0.5 ? "system" : "default";
    },
    []
  );
  const beforeOffsetTone = useMemo(
    () => resolveOffsetTone(hiddenBeforeColumns),
    [hiddenBeforeColumns, resolveOffsetTone]
  );
  const afterOffsetTone = useMemo(
    () => resolveOffsetTone(hiddenAfterColumns),
    [hiddenAfterColumns, resolveOffsetTone]
  );
  const beforeColumnWidthHint = useMemo(() => {
    const referenceColumn =
      hiddenBeforeColumns[hiddenBeforeColumns.length - 1] ??
      centerColumns[Math.max(0, virtualCenterCols.start)] ??
      virtualCenterCols.visible[0] ??
      centerColumns[0];
    if (!referenceColumn) return 140;
    return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
  }, [
    centerColumns,
    colWidthOf,
    hiddenBeforeColumns,
    virtualCenterCols.start,
    virtualCenterCols.visible,
  ]);
  const afterColumnWidthHint = useMemo(() => {
    const referenceColumn =
      hiddenAfterColumns[0] ??
      centerColumns[Math.max(0, virtualCenterCols.end)] ??
      virtualCenterCols.visible[virtualCenterCols.visible.length - 1] ??
      centerColumns[centerColumns.length - 1];
    if (!referenceColumn) return 140;
    return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
  }, [
    centerColumns,
    colWidthOf,
    hiddenAfterColumns,
    virtualCenterCols.end,
    virtualCenterCols.visible,
  ]);
  const beforeOffsetEdgeShadow =
    pinnedLeftColumns.length > 0
      ? "var(--ace-grid-pinned-shadow-left-edge)"
      : undefined;
  const afterOffsetEdgeShadow =
    pinnedRightColumns.length > 0
      ? "var(--ace-grid-pinned-shadow-right-edge)"
      : undefined;
  const pinnedLeftStripBackground = background ?? "var(--ace-grid-pinned-left-bg)";
  const pinnedRightStripBackground =
    background ?? "var(--ace-grid-pinned-right-bg)";
  const pinnedLeftStripShadow = shadow ?? "var(--ace-grid-pinned-shadow-left-edge)";
  const pinnedRightStripShadow =
    shadow ?? "var(--ace-grid-pinned-shadow-right-edge)";
  const absGroupStart = rowModel
    ? group.startRowIndex
    : (rowIndexLookup.get(rowsForRender[0]?.id ?? "") ?? group.startRowIndex);
  const ariaRowIndexFor = useCallback(
    (rowIndex: number) =>
      ariaRowIndexOffset +
      (resolveBodyRowIndex ? resolveBodyRowIndex(rowIndex) : rowIndex) +
      1,
    [ariaRowIndexOffset, resolveBodyRowIndex]
  );
  const ariaColIndexFor = useCallback(
    (columnKey: string) => (visualColumnIndex.get(columnKey) ?? 0) + 1,
    [visualColumnIndex]
  );

  const masterRow = rowsForRender[0];
  const masterDetailEnabled = Boolean(masterDetail?.enabled);
  const masterRowIsMaster = Boolean(
    masterDetailEnabled && masterRow && masterDetail?.isRowMaster(masterRow)
  );
  const detailExpanded = Boolean(
    masterRowIsMaster && masterDetail?.isExpanded(masterRow.id)
  );
  const baseRowHeight = useMemo(() => {
    if (!masterRow) return groupHeight;
    return rowHeightOf(masterRow.id);
  }, [groupHeight, masterRow, rowHeightOf]);
  const detailHeight = useMemo(() => {
    if (!detailExpanded || !masterRow) return 0;
    return Math.max(0, groupHeight - baseRowHeight);
  }, [baseRowHeight, detailExpanded, groupHeight, masterRow]);

  const rowResizeHandles = useMemo(() => {
    if (!enableRowResize || !hasRowResizeHandler) return [];
    let runningHeight = 0;
    const handles: React.ReactNode[] = [];
    rowsForRender.forEach((row) => {
      runningHeight += rowHeightOf(row.id);
      const handleEl = createRowResizeHandle(
        row.id,
        hasSpans,
        runningHeight,
        groupHeight
      );
      if (handleEl) handles.push(handleEl);
    });
    return handles;
  }, [
    enableRowResize,
    hasRowResizeHandler,
    rowsForRender,
    rowHeightOf,
    createRowResizeHandle,
    hasSpans,
    groupHeight,
  ]);

  const rowHoverBands = useMemo(() => {
    let top = 0;
    return rowsForRender.map((row) => {
      const height = Math.max(0, rowHeightOf(row.id));
      const band = { top, height };
      top += height;
      return band;
    });
  }, [rowHeightOf, rowsForRender]);
  const rowHoverTrackHeight = useMemo(
    () =>
      rowHoverBands.length > 0
        ? rowHoverBands[rowHoverBands.length - 1].top +
          rowHoverBands[rowHoverBands.length - 1].height
        : 0,
    [rowHoverBands]
  );
  const [hoveredRowBandIndex, setHoveredRowBandIndex] = useState<number | null>(
    null
  );
  const updateHoveredRowBand = useCallback(
    (clientY: number, currentTarget: HTMLDivElement) => {
      if (!rowHoverBands.length) {
        setHoveredRowBandIndex((prev) => (prev == null ? prev : null));
        return;
      }

      const rect = currentTarget.getBoundingClientRect();
      const y = clientY - rect.top;
      let nextIndex: number | null = null;

      if (y >= 0 && y < rowHoverTrackHeight) {
        for (let i = 0; i < rowHoverBands.length; i += 1) {
          const band = rowHoverBands[i];
          if (y >= band.top && y < band.top + band.height) {
            nextIndex = i;
            break;
          }
        }
      }

      setHoveredRowBandIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    },
    [rowHoverBands, rowHoverTrackHeight]
  );
  const handleRowGroupMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      updateHoveredRowBand(event.clientY, event.currentTarget);
    },
    [updateHoveredRowBand]
  );
  const handleRowGroupMouseLeave = useCallback(() => {
    setHoveredRowBandIndex((prev) => (prev == null ? prev : null));
  }, []);
  const hoveredRowBand =
    hoveredRowBandIndex != null &&
    hoveredRowBandIndex >= 0 &&
    hoveredRowBandIndex < rowHoverBands.length
      ? rowHoverBands[hoveredRowBandIndex]
      : null;
  const rowHoverOverlayStyle = hoveredRowBand
    ? {
        top: hoveredRowBand.top,
        height: hoveredRowBand.height,
      }
    : undefined;
  const rowHoverOverlay = hoveredRowBand ? (
    <div
      role="presentation"
      aria-hidden="true"
      className="ace-grid__row-hover-overlay"
      style={rowHoverOverlayStyle}
    />
  ) : null;

  const spanCoverage = centerSpanCoverage.get(id);
  const spanStartLookup = spanCoverage?.spanStartLookup ?? EMPTY_SPAN_LOOKUP;
  const coveredCells = spanCoverage?.coveredCells ?? EMPTY_COVERED_CELLS;
  const shouldRenderSemanticSpanOwners =
    hasSpans && rowsForRender.length > 1 && Boolean(gridBodyCellIdBase);
  const buildSemanticCellId = useCallback(
    (absRowIndex: number, columnKey: string) =>
      buildGridBodyCellId(
        gridBodyCellIdBase,
        ariaRowIndexFor(absRowIndex),
        ariaColIndexFor(columnKey)
      ),
    [gridBodyCellIdBase, ariaRowIndexFor, ariaColIndexFor]
  );

  const spansCrossPinnedBoundaries = useMemo(() => {
    if (!hasSpans || group.spans.size === 0 || visualColumns.length === 0) {
      return false;
    }

    const leftCount = pinnedLeftColumns.length;
    const centerVisibleCount = virtualCenterCols.visible.length;
    const rightStart = leftCount + centerVisibleCount;

    for (const [colKey, spans] of group.spans) {
      const startIdx = visualColumnIndex.get(colKey);
      if (startIdx == null || !spans?.length) continue;
      for (const span of spans) {
        const spanWidth = Math.max(1, span.colSpan ?? 1);
        const endIdx = startIdx + spanWidth - 1;
        if (
          (startIdx < leftCount && endIdx >= leftCount) ||
          (startIdx < rightStart && endIdx >= rightStart)
        ) {
          return true;
        }
      }
    }

    return false;
  }, [
    hasSpans,
    group.spans,
    visualColumns.length,
    visualColumnIndex,
    pinnedLeftColumns.length,
    virtualCenterCols.visible.length,
  ]);

  const pinnedStyleMode: "cell" | "strip" = hasSpans
    ? spansCrossPinnedBoundaries
      ? "cell"
      : "strip"
    : "strip";
  const allowPinnedValidationTooltipOverflow =
    validationDisplay.enabled && validationDisplay.showTooltip !== false;
  const releasePinnedValidationClipPath = useCallback(
    (style: CSSProperties): CSSProperties => {
      if (!allowPinnedValidationTooltipOverflow || !style.clipPath) return style;
      const nextStyle = { ...style };
      delete nextStyle.clipPath;
      return nextStyle;
    },
    [allowPinnedValidationTooltipOverflow],
  );
  const systemBoundaryColumnKey = useMemo(() => {
    for (let i = pinnedLeftColumns.length - 1; i >= 0; i -= 1) {
      const key = pinnedLeftColumns[i]?.key;
      if (key && isSystemCol(key)) return key;
    }
    return null;
  }, [pinnedLeftColumns]);
  const hasRenderedVisualColumn = useCallback(
    (visualIndex: number) => {
      if (visualIndex < 0) return false;
      if (visualIndex < pinnedLeftColumns.length) return true;
      const centerStart = pinnedLeftColumns.length;
      const centerEnd = centerStart + virtualCenterCols.visible.length;
      if (visualIndex < centerEnd) return true;
      const rightStart = centerEnd;
      const rightEnd = rightStart + pinnedRightColumns.length;
      return visualIndex < rightEnd;
    },
    [
      pinnedLeftColumns.length,
      pinnedRightColumns.length,
      virtualCenterCols.visible.length,
    ]
  );

  const renderColumnNodesWithSpans = useCallback(
    (
      column: GridColumn,
      colIdx: number,
      selectionColIdx: number,
      isPinned: boolean,
      isLeft: boolean,
      isRight: boolean,
      spanColumns?: GridColumn[],
      gridColumnIndex?: number,
      isSystemBoundaryColumn = false,
      recordOwnedCellId?: (
        absRowIndex: number,
        columnKey: string
      ) => string | undefined
    ): React.ReactNode[] => {
      const columnNodes: React.ReactNode[] = [];
      let localRow = 0;

      while (localRow < rowsForRender.length) {
        const row = rowsForRender[localRow];
        const rowData = row.data ?? EMPTY_ROW_DATA;
        const rowLoading = Boolean(row.meta?.loading);
        const groupMeta = row.meta?.group;

        if (groupMeta && !isSystemCol(column.key)) {
          const displayColumnKey = groupMeta.displayColumnKey || groupMeta.columnKey;
          const groupIsExpanded = resolveGroupExpandedState
            ? resolveGroupExpandedState(groupMeta.path, groupMeta.isExpanded)
            : groupMeta.isExpanded;

          const placementIndex = gridColumnIndex ?? colIdx;
          let style: CSSProperties = {
            gridColumn: `${placementIndex + 1}`,
            gridRow: `${localRow + 1}`,
            ...CELL_BORDER,
            backgroundColor: tokens.cellBackground,
            margin: 0,
            paddingTop: tokens.cellPaddingVertical,
            paddingBottom: tokens.cellPaddingVertical,
            paddingLeft:
              column.key === displayColumnKey
                ? tokens.cellPaddingHorizontal + groupMeta.level * 18
                : tokens.cellPaddingHorizontal,
            paddingRight: tokens.cellPaddingHorizontal,
            display: "flex",
            alignItems: "center",
            gap: 8,
          };

          if (isPinned) {
            style = applyPinnedStyle(
              style,
              column,
              isLeft,
              isRight,
              pinnedStyleMode
            );
            style = releasePinnedValidationClipPath(style);
            (style as any).zIndex = 40;
          }

          const toggle = (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const nextExpanded = !groupIsExpanded;
            const clickedRowIndex =
              rowIndexLookup.get(row.id) ?? absGroupStart + localRow;
            let visibleDescendantCount = 0;
            if (!nextExpanded && rowModel) {
              const totalRows = Math.max(
                0,
                Math.trunc(rowModel.rowCount ?? clickedRowIndex + 1)
              );
              for (
                let scanIndex = clickedRowIndex + 1;
                scanIndex < totalRows;
                scanIndex += 1
              ) {
                const scanRow = rowModel.getRow(scanIndex);
                const levels =
                  scanRow.meta?.group?.valueChain ??
                  scanRow.meta?.groupingPath?.levels ??
                  null;
                if (!Array.isArray(levels) || levels.length === 0) {
                  break;
                }
                const isDescendant = levels.some(
                  (entry) =>
                    typeof entry?.path === "string" &&
                    entry.path === groupMeta.path
                );
                if (!isDescendant) break;
                visibleDescendantCount += 1;
              }
            }
            onToggleGroupRow?.(groupMeta.path, !groupIsExpanded, {
              rowIndex: clickedRowIndex,
              childCount: groupMeta.childCount,
              level: groupMeta.level,
              visibleDescendantCount,
            });
          };

          if (column.key === displayColumnKey) {
            const absGroupRow =
              rowIndexLookup.get(row.id) ?? group.startRowIndex + localRow;
            const semanticCellId =
              recordOwnedCellId?.(absGroupRow, column.key) ??
              buildSemanticCellId(absGroupRow, column.key);
            const groupCountStyle: CSSProperties = {
              fontSize: Math.max(10, tokens.fontSize - 2),
            };
            columnNodes.push(
              <div
                key={`${id}-${column.key}-group-${localRow}`}
                className="ace-grid__row-group-group-cell"
                id={semanticCellId}
                role="gridcell"
                aria-rowindex={ariaRowIndexFor(absGroupRow)}
                aria-colindex={ariaColIndexFor(column.key)}
                style={style}
                data-group-path={groupMeta.path}
                onMouseDown={(ev) => ev.preventDefault()}
                onDoubleClick={toggle}
                onContextMenu={(ev) => ev.preventDefault()}
              >
                <button
                  type="button"
                  aria-label={groupIsExpanded ? "Collapse group" : "Expand group"}
                  onClick={toggle}
                  className="ace-grid__row-group-toggle-button"
                >
                  {groupIsExpanded ? "▾" : "▸"}
                </button>
                <span className="ace-grid__row-group-label">
                  {groupMeta.label ?? (groupMeta.value ?? "—")}
                </span>
                <span
                  className="ace-grid__row-group-count"
                  style={groupCountStyle}
                >
                  ({groupMeta.childCount})
                </span>
              </div>
            );
          } else {
            const cell = rowData[column.key];
            const absGroupRow =
              rowIndexLookup.get(row.id) ?? group.startRowIndex + localRow;
            const formattedGroupValue = cell
              ? formatCellValue(column, cell.value, cell.format)
              : "";
            const groupDefaultContent = formattedGroupValue;
            const groupRenderMode = column.renderCellMode ?? "enhance";
            const groupCustomValue =
              !rowLoading && typeof column.renderCell === "function"
                ? column.renderCell({
                    value: cell?.value ?? "",
                    formattedValue: formattedGroupValue,
                    defaultContent: groupDefaultContent,
                    row,
                    column,
                    rowIndex: absGroupRow,
                    colIndex: colIdx,
                    cell,
                    isLoading: rowLoading,
                    isSelected: isCellSelected(absGroupRow, selectionColIdx),
                    mode: groupRenderMode,
                  })
                : null;
            const renderedGroupValue =
              !rowLoading && typeof column.renderCell === "function"
                ? groupRenderMode === "replace"
                  ? groupCustomValue ?? groupDefaultContent
                  : (
                    <>
                      {groupDefaultContent}
                      {groupCustomValue}
                    </>
                  )
                : groupDefaultContent;
            const semanticCellId =
              recordOwnedCellId?.(absGroupRow, column.key) ??
              buildSemanticCellId(absGroupRow, column.key);
            columnNodes.push(
              <div
                key={`${id}-${column.key}-group-agg-${localRow}`}
                className="ace-grid__row-group-group-agg"
                id={semanticCellId}
                role="gridcell"
                aria-rowindex={ariaRowIndexFor(absGroupRow)}
                aria-colindex={ariaColIndexFor(column.key)}
                style={style}
                onMouseDown={(ev) => ev.preventDefault()}
                onContextMenu={(ev) => ev.preventDefault()}
              >
                {renderedGroupValue}
              </div>
            );
          }
          localRow += 1;
          continue;
        }

        const startKey = `${localRow}:${colIdx}`;
        const span = spanStartLookup.get(startKey);

      if (span) {
        const rowSpan = Math.max(1, span.rowSpan ?? 1);
        const colSpan = Math.max(1, span.colSpan ?? 1);
        const spanRow = rowsForRender[Math.min(localRow, rowsForRender.length - 1)];
        const absSpanStart =
          spanRow && rowIndexLookup.has(spanRow.id)
            ? (rowIndexLookup.get(spanRow.id) as number)
            : group.startRowIndex + localRow;

        const selEdge = !isPinned
          ? selectionEdgeStyle(
              absSpanStart,
              selectionColIdx,
              rowSpan,
              colSpan,
              column.key
            )
          : EMPTY_SELECTION_STYLE;
        const spanSelected = !isPinned
          ? isCellSelected(absSpanStart, selectionColIdx)
          : false;

        const editing =
          !rowLoading &&
          editingCell?.rowIndex === absSpanStart &&
          editingCell?.columnKey === column.key;

        const placementIndex = gridColumnIndex ?? colIdx;
        let style: CSSProperties = {
          gridColumn: `${placementIndex + 1} / span ${colSpan}`,
          gridRow: `${localRow + 1} / span ${rowSpan}`,
          ...CELL_BORDER,
          display: "flex",
          alignItems: "center",
          justifyContent:
            span.format?.textAlign === "center"
              ? "center"
              : span.format?.textAlign === "right"
              ? "flex-end"
              : "flex-start",
          padding: cellPadding,
          fontSize: tokens.fontSize,
          fontWeight: span.format?.fontWeight || "normal",
          cursor: "cell",
          userSelect: "none",
          whiteSpace: "pre-wrap",
        };

        if (isPinned) {
          style = applyPinnedStyle(
            style,
            column,
            isLeft,
            isRight,
            pinnedStyleMode
          );
          style = releasePinnedValidationClipPath(style);
          (style as any).zIndex = 40;
        }

        if (span.format?.backgroundColor) {
          (style as React.CSSProperties & Record<string, string>)[
            "--ace-grid-cell-bg"
          ] = span.format.backgroundColor;
        }

        style = resolveFormulaHighlightStyle(
          style,
          absSpanStart,
          absSpanStart + rowSpan - 1,
          column.key,
          colSpan
        );

        const spanValue =
          span.value &&
          typeof span.value === "object" &&
          "value" in span.value
            ? (span.value as any).value
            : span.value;
        const spanText = formatCellValue(column, spanValue, span.format);
        const spanValidation =
          validationDisplay.enabled && spanRow?.id != null
            ? getCellValidation(spanRow.id, column.key)
            : null;
        const resolvedSpanValidation = editing
          ? editingValidation ?? spanValidation
          : spanValidation;
        const spanValidationMessage =
          validationDisplay.showTooltip !== false
            ? resolvedSpanValidation?.message
            : undefined;
        const spanValidationClasses = validationModule.getValidationClassNames(
          resolvedSpanValidation,
          validationDisplay
        );
        let spanDefaultContent: React.ReactNode = spanText;
        if (search.highlight && search.matcher && spanText) {
          const segments = splitSearchMatches(spanText, search.matcher);
          if (segments) {
            const markProps = getSearchHighlightMarkProps(search, {
              active: isActiveSearchCell(search, spanRow?.id, column.key),
            });
            spanDefaultContent = (
              <span className="ace-grid__cell-text">
                {segments.map((segment, index) =>
                  segment.match ? (
                    <mark
                      key={index}
                      className={markProps.className}
                      style={markProps.style}
                    >
                      {segment.text}
                    </mark>
                  ) : (
                    <React.Fragment key={index}>
                      {segment.text}
                    </React.Fragment>
                  )
                )}
              </span>
            );
          }
        }
        const spanRowData = spanRow?.data ?? EMPTY_ROW_DATA;
        const spanCell = spanRowData[column.key];
        const spanRenderMode = column.renderCellMode ?? "enhance";
        const hasCustomSpanRenderer =
          !rowLoading && typeof column.renderCell === "function";
        const spanCustomContent = hasCustomSpanRenderer
          ? column.renderCell?.({
              value: spanValue,
              formattedValue: spanText,
              defaultContent: spanDefaultContent,
              row: spanRow,
              column,
              rowIndex: absSpanStart,
              colIndex: colIdx,
              cell: spanCell,
              isLoading: rowLoading,
              isSelected: spanSelected,
              mode: spanRenderMode,
            })
          : null;
        const spanContent: React.ReactNode = hasCustomSpanRenderer
          ? spanRenderMode === "replace"
            ? spanCustomContent ?? spanDefaultContent
            : (
              <>
                {spanDefaultContent}
                {spanCustomContent}
              </>
            )
          : spanDefaultContent;

        if (editing) {
          const spanEditorStyle: CSSProperties = {
            ...style,
            ...CELL_BORDER,
            ...selEdge,
            ...EDIT_BORDER,
            zIndex: Math.max(Number((style as any).zIndex) || 0, 30),
            margin: 0,
            padding: 0,
          };
          columnNodes.push(
            <div
              key={`${id}-${column.key}-span-ed-${localRow}`}
              className="ace-grid__display-contents"
              role="presentation"
              data-row-index={absSpanStart}
              data-row-id={spanRow?.id}
              data-col-index={selectionColIdx}
            >
              <CellEditor
                column={column}
                row={spanRow ?? rowsForRender[0]}
                value={editingCell.initialValue}
                version={editingCell.version}
                onChange={updateEditingValue}
                onSubmit={(val) => {
                  updateEditingValue(val);
                  commitEdit(absSpanStart, colIdx, val);
                }}
                onCancel={cancelEdit}
                registerValueListener={registerEditorValueListener}
                validationMessage={spanValidationMessage}
                validationSeverity={resolvedSpanValidation?.severity}
                validationClassName={spanValidationClasses.join(" ")}
                style={spanEditorStyle}
              />
            </div>
          );
        } else {
          let spanCellStyle: CSSProperties = {
            ...style,
            ...CELL_BORDER,
            ...selEdge,
            position: "relative",
            zIndex: Math.max(Number((style as any).zIndex) || 0, 30),
          };
          spanCellStyle = resolveAdjacentSpanOverlayBorders(
            spanCellStyle,
            hasRenderedVisualColumn(colIdx - 1)
          );
          const semanticCellId =
            recordOwnedCellId?.(absSpanStart, column.key) ??
            buildSemanticCellId(absSpanStart, column.key);
          columnNodes.push(
            <div
              key={`${id}-${column.key}-span-${localRow}`}
              className={cx(
                "ace-grid__cell",
                "ace-grid__cell--spanned",
                span.format?.className,
                spanSelected && "ace-grid__cell--selected",
                ...spanValidationClasses
              )}
              id={semanticCellId}
              role="gridcell"
              aria-rowindex={ariaRowIndexFor(absSpanStart)}
              aria-colindex={ariaColIndexFor(column.key)}
              aria-selected={spanSelected || undefined}
              aria-rowspan={rowSpan > 1 ? rowSpan : undefined}
              aria-colspan={colSpan > 1 ? colSpan : undefined}
              style={spanCellStyle}
              data-row-index={absSpanStart}
              data-row-id={spanRow?.id}
              data-col-index={selectionColIdx}
              data-validation-message={spanValidationMessage}
              data-validation-severity={spanValidation?.severity ?? undefined}
              onMouseDown={(ev) =>
                handleCellMouseDown(absSpanStart, selectionColIdx, ev)
              }
              onMouseEnter={(ev) =>
                handleCellMouseEnter(absSpanStart, selectionColIdx, ev)
              }
              onClick={(ev) =>
                selectSingleCell(absSpanStart, selectionColIdx, ev, rowSpan, colSpan)
              }
              onDoubleClick={() => onCellDbl(absSpanStart, colIdx)}
              onContextMenu={(ev) =>
                openCellContextMenu({
                  rowIndex: absSpanStart,
                  visualColumnIndex: selectionColIdx,
                  columnKey: column.key ?? null,
                  event: ev,
                })
              }
            >
              {spanContent}
              {renderFillHandle(
                isFillHandleCell(
                  absSpanStart,
                  selectionColIdx,
                  rowSpan,
                  colSpan,
                  column.key
                )
              )}
              {enableColumnResize && (() => {
                const lookupColumns = spanColumns ?? visualColumns;
                const lookupIndex =
                  spanColumns && gridColumnIndex != null
                    ? gridColumnIndex
                    : colIdx;
                const lastColInSpan =
                  lookupColumns[lookupIndex + colSpan - 1];
                  if (!lastColInSpan || lastColInSpan.resizable === false) {
                    return null;
                  }
                  return (
                    <div
                      {...getColumnResizeHandleProps(lastColInSpan.key, {
                        style: {
                          position: "absolute",
                          right: -2,
                          top: 0,
                          bottom: 6,
                          width: 4,
                          cursor: "col-resize",
                        },
                        onMouseDown: (event) => {
                          event.stopPropagation();
                        },
                      })}
                    />
                  );
                })()}
              </div>
            );
          }

        localRow += rowSpan;
        continue;
      }

      if (coveredCells.has(spanCellKey(localRow, colIdx))) {
        localRow += 1;
        continue;
      }
      const cell = rowData[column.key];
      const absRow =
        rowIndexLookup.get(row.id) ?? group.startRowIndex + localRow;

      const editing =
        !rowLoading &&
        editingCell?.rowIndex === absRow &&
        editingCell?.columnKey === column.key;
      const cellValidation = !rowLoading && validationDisplay.enabled
        ? getCellValidation(row.id, column.key)
        : null;
      const resolvedCellValidation = editing
        ? editingValidation ?? cellValidation
        : cellValidation;
      const cellValidationMessage =
        validationDisplay.showTooltip !== false
          ? resolvedCellValidation?.message
          : undefined;
      const cellValidationClassName = validationModule.getValidationClassNames(
        resolvedCellValidation,
        validationDisplay
      ).join(" ");

      const placementIndex = gridColumnIndex ?? colIdx;
      let style: CSSProperties = {
        gridColumn: `${placementIndex + 1}`,
        gridRow: `${localRow + 1}`,
        ...CELL_BORDER,
        margin: 0,
        padding: cellPadding,
        display: "flex",
        alignItems: "center",
      };
      if (isPinned) {
        style = applyPinnedStyle(
          style,
          column,
          isLeft,
          isRight,
          pinnedStyleMode
        );
        style = releasePinnedValidationClipPath(style);
        (style as any).zIndex = 40;
      }

      const selEdge = !isPinned
        ? selectionEdgeStyle(absRow, selectionColIdx, 1, 1, column.key)
        : EMPTY_SELECTION_STYLE;
      style = { ...style, ...selEdge };
      style = resolveFormulaHighlightStyle(style, absRow, absRow, column.key, 1);
      style = suppressAdjacentSpanDividers(
        style,
        spanStartLookup,
        coveredCells,
        localRow,
        colIdx,
        isSelectionBorder
      );

      if (isSystemCol(column.key)) {
        const detailCell =
          column.key === GRID_SYSTEM_COLUMN_KEYS.rowDetail &&
          masterDetailEnabled &&
          masterRow
            ? {
                visible: masterRowIsMaster,
                disabled: !masterRowIsMaster,
                expanded: detailExpanded,
                onToggle: () => masterDetail?.toggleRow(masterRow.id),
                renderToggleIcon: masterDetail?.renderToggleIcon,
                renderToggleCell: masterDetail?.renderToggleCell,
              }
            : undefined;
        const rowIndexLabel =
          column.key === GRID_SYSTEM_COLUMN_KEYS.rowIndex && getRowKeyLabel
            ? getRowKeyLabel(row, absRow)
            : undefined;
        recordOwnedCellId?.(absRow, column.key);

        columnNodes.push(
          <div
            key={`${id}-${column.key}-${localRow}-sys`}
            className="ace-grid__display-contents"
            role="presentation"
            data-row-index={absRow}
            data-row-id={row.id}
            data-col-index={selectionColIdx}
          >
            <SystemCell
              typeKey={column.key as any}
              row={row}
              absRowIndex={absRow}
              isBoundary={isSystemBoundaryColumn}
              colIndex={selectionColIdx}
              ariaColIndex={ariaColIndexFor(column.key)}
              ariaRowIndex={ariaRowIndexFor(absRow)}
              gridBodyCellIdBase={gridBodyCellIdBase}
              style={style}
              loadingRenderer={loadingCellRenderer}
              rowIndexLabel={rowIndexLabel}
              pinnedRows={pinnedRows}
              onPinRow={handlePinRow}
              renderPinCell={renderRowPinCell}
              rowHasSpans={rowHasSpans}
              isRowReorder={isRowReorder}
              rows={rows}
              selectedRowIds={selectedRowIds}
              selectedRowIdSet={selectedRowIdSet}
              selectionMetrics={selectionMetrics}
              onRowSelectionChange={handleRowSelectionChange}
              clientGroupSelects={clientGroupSelects}
              ssrmSelectionState={ssrmSelectionState}
              ssrmSelectableRowCount={ssrmSelectableRowCount}
              ssrmGroupSelects={ssrmGroupSelects}
              ssrmSelectionCache={ssrmSelectionCache}
              onSsrmSelectionStateChange={handleSsrmSelectionStateChange}
              detailCell={detailCell}
            />
          </div>
        );
        localRow += 1;
        continue;
      }

      if (editing) {
        const rowEditorStyle: CSSProperties = {
          ...style,
          ...EDIT_BORDER,
          margin: 0,
          padding: 0,
        };
        columnNodes.push(
          <div
            key={`${id}-${column.key}-${localRow}-ed`}
            className="ace-grid__display-contents"
            role="presentation"
            data-row-index={absRow}
            data-row-id={row.id}
            data-col-index={selectionColIdx}
          >
            <CellEditor
              column={column}
              row={row}
              value={editingCell.initialValue}
              version={editingCell.version}
              onChange={updateEditingValue}
              onSubmit={(val) => {
                updateEditingValue(val);
                commitEdit(absRow, colIdx, val);
              }}
              onCancel={cancelEdit}
              registerValueListener={registerEditorValueListener}
              validationMessage={cellValidationMessage}
              validationSeverity={resolvedCellValidation?.severity}
              validationClassName={cellValidationClassName}
              style={rowEditorStyle}
            />
          </div>
        );
      } else {
        recordOwnedCellId?.(absRow, column.key);
        columnNodes.push(
          <div
            key={`${id}-${column.key}-${localRow}`}
            className="ace-grid__display-contents"
            role="presentation"
            data-row-index={absRow}
            data-row-id={row.id}
            data-col-index={selectionColIdx}
          >
            <GridCell
              value={cell?.value ?? ""}
              format={cell?.format}
              cell={cell}
              row={row}
              loading={rowLoading}
              loadingRenderer={loadingCellRenderer}
              column={column}
              rowIndex={absRow}
              colIndex={colIdx}
              ariaRowIndex={ariaRowIndexFor(absRow)}
              ariaColIndex={ariaColIndexFor(column.key)}
              gridBodyCellIdBase={gridBodyCellIdBase}
              isSelected={isCellSelected(absRow, selectionColIdx)}
              validation={cellValidation}
              validationDisplay={validationDisplay}
              enableColumnResize={enableColumnResize}
              getColumnResizeHandleProps={getColumnResizeHandleProps}
              style={style}
              onMouseDown={(ev) =>
                handleCellMouseDown(absRow, selectionColIdx, ev)
              }
              onMouseEnter={(ev) =>
                handleCellMouseEnter(absRow, selectionColIdx, ev)
              }
              onClick={(ev) => selectSingleCell(absRow, selectionColIdx, ev)}
              onDoubleClick={(element) =>
                onCellDbl(absRow, colIdx, element as HTMLElement)
              }
              onContextMenu={(ev) =>
                openCellContextMenu({
                  rowIndex: absRow,
                  visualColumnIndex: selectionColIdx,
                  columnKey: column.key ?? null,
                  event: ev,
                })
              }
            >
              {!rowLoading
                ? renderFillHandle(
                    isFillHandleCell(absRow, selectionColIdx, 1, 1, column.key)
                  )
                : null}
            </GridCell>
          </div>
        );
      }

      localRow += 1;
      }

      return columnNodes;
    },
    [rowsForRender, spanStartLookup, coveredCells, rowIndexLookup, group.startRowIndex, editingCell?.rowIndex, editingCell?.columnKey, editingCell?.initialValue, editingCell?.version, validationDisplay, getCellValidation, editingValidation, cellPadding, selectionEdgeStyle, resolveFormulaHighlightStyle, resolveGroupExpandedState, tokens.cellBackground, tokens.cellPaddingVertical, tokens.cellPaddingHorizontal, tokens.fontSize, applyPinnedStyle, releasePinnedValidationClipPath, pinnedStyleMode, absGroupStart, rowModel, onToggleGroupRow, id, isCellSelected, search.highlight, search.matcher, search.highlightClassName, search.highlightStyle, updateEditingValue, cancelEdit, registerEditorValueListener, commitEdit, renderFillHandle, isFillHandleCell, enableColumnResize, handleCellMouseDown, handleCellMouseEnter, selectSingleCell, onCellDbl, openCellContextMenu, visualColumns, getColumnResizeHandleProps, masterDetailEnabled, masterRow, masterRowIsMaster, detailExpanded, masterDetail, getRowKeyLabel, loadingCellRenderer, pinnedRows, handlePinRow, renderRowPinCell, rowHasSpans, isRowReorder, rows, selectedRowIds, selectedRowIdSet, selectionMetrics, handleRowSelectionChange, clientGroupSelects, ssrmSelectionState, ssrmSelectableRowCount, ssrmGroupSelects, ssrmSelectionCache, handleSsrmSelectionStateChange, ariaRowIndexFor, ariaColIndexFor, gridBodyCellIdBase, buildSemanticCellId, hasRenderedVisualColumn]
  );

  const renderColumnNodesWithoutSpans = useCallback(
    (
      column: GridColumn,
      colIdx: number,
      selectionColIdx: number,
      isPinned: boolean,
      isLeft: boolean,
      isRight: boolean,
      gridColumnIndex?: number,
      isSystemBoundaryColumn = false,
      recordOwnedCellId?: (
        absRowIndex: number,
        columnKey: string
      ) => string | undefined
    ): React.ReactNode[] => {
      const row =
        rowsForRender[0] ?? ({ id: group.id, data: EMPTY_ROW_DATA } as GridRow);
      const rowData = row.data ?? EMPTY_ROW_DATA;
      const rowLoading = Boolean(row.meta?.loading);
      const cell = rowData[column.key];
      const editing =
        !rowLoading &&
        editingCell?.rowIndex === absGroupStart &&
        editingCell?.columnKey === column.key;
      const cellValidation = !rowLoading && validationDisplay.enabled
        ? getCellValidation(row.id, column.key)
        : null;
      const resolvedCellValidation = editing
        ? editingValidation ?? cellValidation
        : cellValidation;
      const cellValidationMessage =
        validationDisplay.showTooltip !== false
          ? resolvedCellValidation?.message
          : undefined;
      const cellValidationClassName = validationModule.getValidationClassNames(
        resolvedCellValidation,
        validationDisplay
      ).join(" ");

      let style = colBox(colWidthOf(column.key), baseRowHeight);
      if (isPinned) {
        style = applyPinnedStyle(
          style,
          column,
          isLeft,
          isRight,
          pinnedStyleMode
        );
        style = releasePinnedValidationClipPath(style);
        (style as any).zIndex = 40;
      }

      const placementIndex =
        gridColumnIndex != null ? gridColumnIndex : hasSpans ? colIdx : null;
      if (placementIndex != null) {
        (style as any).gridColumn = `${placementIndex + 1}`;
        (style as any).gridRow = "1";
      }

    const selEdge = !isPinned
      ? selectionEdgeStyle(absGroupStart, selectionColIdx, 1, 1, column.key)
      : EMPTY_SELECTION_STYLE;
    style = { ...style, ...selEdge };
    style = resolveFormulaHighlightStyle(
      style,
      absGroupStart,
      absGroupStart,
      column.key,
      1
    );

      if (isSystemCol(column.key)) {
      const groupedSystemCellStyle: CSSProperties = {
        ...style,
        ...CELL_BORDER,
        ...selEdge,
      };
      const detailCell =
        column.key === GRID_SYSTEM_COLUMN_KEYS.rowDetail &&
        masterDetailEnabled &&
        row
          ? {
              visible: masterRowIsMaster,
              disabled: !masterRowIsMaster,
              expanded: detailExpanded,
              onToggle: () => masterDetail?.toggleRow(row.id),
              renderToggleIcon: masterDetail?.renderToggleIcon,
              renderToggleCell: masterDetail?.renderToggleCell,
            }
          : undefined;
      const rowIndexLabel =
        column.key === GRID_SYSTEM_COLUMN_KEYS.rowIndex && getRowKeyLabel
          ? getRowKeyLabel(row, absGroupStart)
          : undefined;
      recordOwnedCellId?.(absGroupStart, column.key);

      return [
        <div
          key={`${id}-${column.key}-sys`}
          className="ace-grid__display-contents"
          role="presentation"
          data-row-index={absGroupStart}
          data-row-id={row.id}
          data-col-index={selectionColIdx}
        >
          <SystemCell
            typeKey={column.key as any}
            row={row}
            absRowIndex={absGroupStart}
            isBoundary={isSystemBoundaryColumn}
            colIndex={selectionColIdx}
            ariaColIndex={ariaColIndexFor(column.key)}
            ariaRowIndex={ariaRowIndexFor(absGroupStart)}
            gridBodyCellIdBase={gridBodyCellIdBase}
            style={groupedSystemCellStyle}
            loadingRenderer={loadingCellRenderer}
            rowIndexLabel={rowIndexLabel}
            pinnedRows={pinnedRows}
            onPinRow={handlePinRow}
            renderPinCell={renderRowPinCell}
            rowHasSpans={rowHasSpans}
            isRowReorder={isRowReorder}
            rows={rows}
            selectedRowIds={selectedRowIds}
            selectedRowIdSet={selectedRowIdSet}
            selectionMetrics={selectionMetrics}
            onRowSelectionChange={handleRowSelectionChange}
            clientGroupSelects={clientGroupSelects}
            ssrmSelectionState={ssrmSelectionState}
            ssrmSelectableRowCount={ssrmSelectableRowCount}
            ssrmGroupSelects={ssrmGroupSelects}
            ssrmSelectionCache={ssrmSelectionCache}
            onSsrmSelectionStateChange={handleSsrmSelectionStateChange}
            detailCell={detailCell}
          />
        </div>,
      ];
    }

    if (editing) {
      const groupedEditorStyle: CSSProperties = {
        ...style,
        ...CELL_BORDER,
        ...selEdge,
        ...EDIT_BORDER,
        margin: 0,
        padding: 0,
      };
      return [
        <div
          key={`${id}-${column.key}-ed`}
          className="ace-grid__display-contents"
          role="presentation"
          data-row-index={absGroupStart}
          data-row-id={row.id}
          data-col-index={selectionColIdx}
        >
          <CellEditor
            column={column}
            row={row}
            value={editingCell.initialValue}
            version={editingCell.version}
            onChange={updateEditingValue}
            onSubmit={(val) => {
              updateEditingValue(val);
              commitEdit(absGroupStart, colIdx, val);
            }}
            onCancel={cancelEdit}
            registerValueListener={registerEditorValueListener}
            validationMessage={cellValidationMessage}
            validationSeverity={resolvedCellValidation?.severity}
            validationClassName={cellValidationClassName}
            style={groupedEditorStyle}
          />
        </div>,
      ];
    }

    const shouldVirtualizeContent =
      enableCellContentVirtualization && !isPinned;
    const groupedVirtualizedCellStyle: CSSProperties = {
      ...style,
      ...CELL_BORDER,
      ...selEdge,
      margin: 0,
      padding: cellPadding,
      display: "flex",
      alignItems: "center",
    };
    recordOwnedCellId?.(absGroupStart, column.key);

    return [
      <div
        key={`${id}-${column.key}-cell`}
        className="ace-grid__display-contents"
        role="presentation"
        data-row-index={absGroupStart}
        data-row-id={row.id}
        data-col-index={selectionColIdx}
      >
        <VirtualizedGridCell
          value={cell?.value ?? ""}
          format={cell?.format}
          cell={cell}
          row={row}
          loading={rowLoading}
          loadingRenderer={loadingCellRenderer}
          column={column}
          rowIndex={absGroupStart}
          colIndex={colIdx}
          ariaRowIndex={ariaRowIndexFor(absGroupStart)}
          ariaColIndex={ariaColIndexFor(column.key)}
          gridBodyCellIdBase={gridBodyCellIdBase}
          isSelected={isCellSelected(absGroupStart, selectionColIdx)}
          validation={cellValidation}
          validationDisplay={validationDisplay}
          enableColumnResize={enableColumnResize}
          getColumnResizeHandleProps={getColumnResizeHandleProps}
          style={groupedVirtualizedCellStyle}
          enableContentVirtualization={shouldVirtualizeContent}
          cellId={`${row.id}-${column.key}`}
          onMouseDown={(ev) =>
            handleCellMouseDown(absGroupStart, selectionColIdx, ev)
          }
          onMouseEnter={(ev) =>
            handleCellMouseEnter(absGroupStart, selectionColIdx, ev)
          }
          onClick={(ev) => selectSingleCell(absGroupStart, selectionColIdx, ev)}
          onDoubleClick={(element) =>
            onCellDbl(absGroupStart, colIdx, element as HTMLElement)
          }
          onContextMenu={(ev) =>
            openCellContextMenu({
              rowIndex: absGroupStart,
              visualColumnIndex: selectionColIdx,
              columnKey: column.key ?? null,
              event: ev,
            })
          }
        >
          {!rowLoading
            ? renderFillHandle(
                isFillHandleCell(absGroupStart, selectionColIdx, 1, 1, column.key)
              )
            : null}
        </VirtualizedGridCell>
      </div>,
    ];
    },
    [rowsForRender, editingCell?.rowIndex, editingCell?.columnKey, editingCell?.initialValue, editingCell?.version, absGroupStart, validationDisplay, getCellValidation, editingValidation, colWidthOf, baseRowHeight, hasSpans, selectionEdgeStyle, resolveFormulaHighlightStyle, enableCellContentVirtualization, cellPadding, id, loadingCellRenderer, isCellSelected, enableColumnResize, getColumnResizeHandleProps, renderFillHandle, isFillHandleCell, applyPinnedStyle, releasePinnedValidationClipPath, pinnedStyleMode, masterDetailEnabled, masterRowIsMaster, detailExpanded, masterDetail, getRowKeyLabel, pinnedRows, handlePinRow, renderRowPinCell, rowHasSpans, isRowReorder, rows, selectedRowIds, selectedRowIdSet, selectionMetrics, handleRowSelectionChange, clientGroupSelects, ssrmSelectionState, ssrmSelectableRowCount, ssrmGroupSelects, ssrmSelectionCache, handleSsrmSelectionStateChange, updateEditingValue, cancelEdit, registerEditorValueListener, commitEdit, handleCellMouseDown, handleCellMouseEnter, selectSingleCell, onCellDbl, openCellContextMenu, ariaRowIndexFor, ariaColIndexFor, gridBodyCellIdBase]
  );

  const pinnedLeftEntries = useMemo(
    () =>
      pinnedLeftColumns.map((column, idx) => ({
        column,
        visualIndex: idx,
        selectionIndex: idx,
        gridIndex: idx,
        isLeft: true,
        isRight: false,
        isSystemBoundary: column.key === systemBoundaryColumnKey,
      })),
    [pinnedLeftColumns, systemBoundaryColumnKey]
  );

  const centerEntries = useMemo(
    () =>
      virtualCenterCols.visible.map((column, idx) => ({
        column,
        visualIndex: pinnedLeftColumns.length + idx,
        selectionIndex: pinnedLeftColumns.length + virtualCenterCols.start + idx,
        gridIndex: idx,
      })),
    [virtualCenterCols.visible, pinnedLeftColumns.length, virtualCenterCols.start]
  );

  const pinnedRightEntries = useMemo(
    () =>
      pinnedRightColumns.map((column, idx) => ({
        column,
        visualIndex:
          pinnedLeftColumns.length + virtualCenterCols.visible.length + idx,
        selectionIndex: pinnedLeftColumns.length + centerColumns.length + idx,
        gridIndex: idx,
        isLeft: false,
        isRight: true,
      })),
    [
      pinnedRightColumns,
      pinnedLeftColumns.length,
      centerColumns.length,
      virtualCenterCols.visible.length,
    ]
  );

  const {
    pinnedLeftContent,
    centerContent,
    pinnedRightContent,
    semanticSpanRowOwners,
  } = useMemo(() => {
    const ownedCellIdsByRowIndex = shouldRenderSemanticSpanOwners
      ? new Map<number, Set<string>>()
      : null;
    const recordOwnedCellId = ownedCellIdsByRowIndex
      ? (absRowIndex: number, columnKey: string) => {
          const ariaRowIndex = ariaRowIndexFor(absRowIndex);
          const cellId = buildSemanticCellId(absRowIndex, columnKey);
          if (!cellId) return undefined;
          const existing = ownedCellIdsByRowIndex.get(ariaRowIndex);
          if (existing) {
            existing.add(cellId);
          } else {
            ownedCellIdsByRowIndex.set(ariaRowIndex, new Set([cellId]));
          }
          return cellId;
        }
      : undefined;

    const pinnedLeftContent = pinnedLeftEntries.map(
      ({
        column,
        visualIndex,
        selectionIndex,
        gridIndex,
        isLeft,
        isRight,
        isSystemBoundary,
      }) => (
        <React.Fragment key={`${id}-${column.key}-left`}>
          {hasSpans
            ? renderColumnNodesWithSpans(
                column,
                visualIndex,
                selectionIndex,
                true,
                isLeft,
                isRight,
                pinnedLeftColumns,
                gridIndex,
                isSystemBoundary,
                recordOwnedCellId
              )
            : renderColumnNodesWithoutSpans(
                column,
                visualIndex,
                selectionIndex,
                true,
                isLeft,
                isRight,
                gridIndex,
                isSystemBoundary,
                recordOwnedCellId
              )}
        </React.Fragment>
      )
    );

    const centerContent = centerEntries.map(
      ({ column, visualIndex, selectionIndex, gridIndex }) => (
        <React.Fragment key={`${id}-${column.key}-center`}>
          {hasSpans
            ? renderColumnNodesWithSpans(
                column,
                visualIndex,
                selectionIndex,
                false,
                false,
                false,
                undefined,
                gridIndex,
                false,
                recordOwnedCellId
              )
            : renderColumnNodesWithoutSpans(
                column,
                visualIndex,
                selectionIndex,
                false,
                false,
                false,
                gridIndex,
                false,
                recordOwnedCellId
              )}
        </React.Fragment>
      )
    );

    const pinnedRightContent = pinnedRightEntries.map(
      ({ column, visualIndex, selectionIndex, gridIndex, isLeft, isRight }) => (
        <React.Fragment key={`${id}-${column.key}-right`}>
          {hasSpans
            ? renderColumnNodesWithSpans(
                column,
                visualIndex,
                selectionIndex,
                true,
                isLeft,
                isRight,
                pinnedRightColumns,
                gridIndex,
                false,
                recordOwnedCellId
              )
            : renderColumnNodesWithoutSpans(
                column,
                visualIndex,
                selectionIndex,
                true,
                isLeft,
                isRight,
                gridIndex,
                false,
                recordOwnedCellId
              )}
        </React.Fragment>
      )
    );

    const semanticSpanRowOwners = ownedCellIdsByRowIndex
      ? rowsForRender
          .map((row, localRow) => {
            const absRow =
              rowIndexLookup.get(row.id) ?? group.startRowIndex + localRow;
            const ariaRowIndex = ariaRowIndexFor(absRow);
            const ownedIds = ownedCellIdsByRowIndex.get(ariaRowIndex);
            if (!ownedIds || ownedIds.size === 0) return null;
            return {
              key: `${id}-semantic-row-${localRow}`,
              ariaRowIndex,
              ownedIds: Array.from(ownedIds).join(" "),
              top: rowHoverBands[localRow]?.top ?? 0,
            };
          })
          .filter(
            (
              owner
            ): owner is {
              key: string;
              ariaRowIndex: number;
              ownedIds: string;
              top: number;
            } => Boolean(owner)
          )
      : [];

    return {
      pinnedLeftContent,
      centerContent,
      pinnedRightContent,
      semanticSpanRowOwners,
    };
  }, [
    shouldRenderSemanticSpanOwners,
    ariaRowIndexFor,
    buildSemanticCellId,
    pinnedLeftEntries,
    hasSpans,
    renderColumnNodesWithSpans,
    pinnedLeftColumns,
    renderColumnNodesWithoutSpans,
    centerEntries,
    pinnedRightEntries,
    pinnedRightColumns,
    rowsForRender,
    rowIndexLookup,
    group.startRowIndex,
    id,
    rowHoverBands,
  ]);

  let className = "ace-grid__row-group";
  if (isDragged) className += " ace-grid__row-group--dragging";
  if (isOver && rowDragState.dragOverPosition === "top")
    className += " ace-grid__row-group--drag-over-top";
  if (isOver && rowDragState.dragOverPosition === "bottom")
    className += " ace-grid__row-group--drag-over-bottom";
  if (hasSpans) className += " ace-grid__row-group--has-spans";
  if (detailExpanded) className += " ace-grid__row-group--detail-expanded";
  const rowGroupCursor: React.CSSProperties["cursor"] = hasSpans
    ? "cell"
    : canDrag
      ? "grab"
      : "default";
  const rowGroupOpacity = isDragged ? 0.5 : 1;
  const rowShellStyle: CSSProperties = {
    height: group.height,
    cursor: rowGroupCursor,
    opacity: rowGroupOpacity,
  };

  if (hasSpans) {
    const singleSemanticRow = rowsForRender.length === 1;
    const spanShellRole = singleSemanticRow ? "row" : undefined;
    const spanShellAriaRowIndex = singleSemanticRow
      ? ariaRowIndexFor(absGroupStart)
      : undefined;
    const rowTemplate = rowsForRender
      .map((row) => `${rowHeightOf(row.id)}px`)
      .join(" ");
    const remainingAfter = Math.max(
      0,
      centerColumns.length - virtualCenterCols.end - 1
    );

    if (spansCrossPinnedBoundaries) {
      const leftOffsetCol =
        virtualCenterCols.before > 0 ? `${virtualCenterCols.before}px` : "";
      const rightOffsetCol =
        virtualCenterCols.after > 0 ? `${virtualCenterCols.after}px` : "";
      const columnSizes = visualColumnSizes.slice();
      if (leftOffsetCol)
        columnSizes.splice(pinnedLeftColumns.length, 0, leftOffsetCol);
      if (rightOffsetCol) columnSizes.push(rightOffsetCol);
      const crossPinnedShellStyle: CSSProperties = {
        ...rowShellStyle,
        gridTemplateColumns: columnSizes.join(" "),
        gridTemplateRows: rowTemplate,
      };
      const crossPinnedBeforeOffsetStyle: CSSProperties = {
        gridColumn: `${pinnedLeftColumns.length + 1}`,
        gridRow: "1 / -1",
      };

      return (
        <div
          className={cx(className, "ace-grid__row-group-shell", "ace-grid__row-group-shell--grid")}
          role={spanShellRole}
          aria-rowindex={spanShellAriaRowIndex}
          data-drag-count={
            isDragged && rowDragState.draggedRowIds.length > 1
              ? rowDragState.draggedRowIds.length
              : undefined
          }
          draggable={canDrag}
          onDragStart={(e) => handleRowDragStart(e, id)}
          onDragOver={(e) => onRowDragOver(e, id)}
          onDragLeave={onRowDragLeave}
          onDrop={(e) => onRowDrop(e, id)}
          onDragEnd={onRowDragEnd}
          onMouseMove={handleRowGroupMouseMove}
          onMouseLeave={handleRowGroupMouseLeave}
          style={crossPinnedShellStyle}
          data-group-id={id}
        >
          {semanticSpanRowOwners.map((owner) => (
            <div
              key={owner.key}
              className="ace-grid__semantic-row-owner"
              role="row"
              aria-rowindex={owner.ariaRowIndex}
              aria-owns={owner.ownedIds}
              style={{ top: owner.top }}
            />
          ))}
          {rowHoverOverlay}
          {pinnedLeftContent}
          {virtualCenterCols.before > 0 ? (
            <OffsetCell
              width={virtualCenterCols.before}
              height={groupHeight}
              rowHeightHint={rowHeightHint}
              columnWidthHint={beforeColumnWidthHint}
              position="before"
              tone={beforeOffsetTone}
              edgeShadow={beforeOffsetEdgeShadow}
              style={crossPinnedBeforeOffsetStyle}
            />
          ) : null}
          {centerContent}
          <OffsetCell
            width={virtualCenterCols.after}
            height={groupHeight}
            rowHeightHint={rowHeightHint}
            columnWidthHint={afterColumnWidthHint}
            position="after"
            tone={afterOffsetTone}
            edgeShadow={afterOffsetEdgeShadow}
            label={`${remainingAfter} →`}
          />
          {pinnedRightContent}
          {rowResizeHandles}
        </div>
      );
    }

    const leftColumnSizes = pinnedLeftColumnSizes;
    const resolvedCenterColumnSizes =
      centerColumnSizes.length === virtualCenterCols.visible.length
        ? centerColumnSizes
        : virtualCenterCols.visible.map((col) => `${colWidthOf(col.key)}px`);
    const rightColumnSizes = pinnedRightColumnSizes;
    const spanRowShellStyle = rowShellStyle;
    const leftPinnedGridStyle: CSSProperties = {
      gridTemplateColumns: leftColumnSizes.join(" "),
      gridTemplateRows: rowTemplate,
      height: groupHeight,
    };
    const centerStripStyle: CSSProperties = { height: groupHeight };
    const centerGridStyle: CSSProperties = {
      gridTemplateColumns: resolvedCenterColumnSizes.join(" "),
      gridTemplateRows: rowTemplate,
      height: groupHeight,
    };
    const rightPinnedGridStyle: CSSProperties = {
      gridTemplateColumns: rightColumnSizes.join(" "),
      gridTemplateRows: rowTemplate,
      height: groupHeight,
    };

    return (
      <div
        className={cx(className, "ace-grid__row-group-shell")}
        role={spanShellRole}
        aria-rowindex={spanShellAriaRowIndex}
        data-drag-count={
          isDragged && rowDragState.draggedRowIds.length > 1
            ? rowDragState.draggedRowIds.length
            : undefined
        }
        draggable={canDrag}
        onDragStart={(e) => handleRowDragStart(e, id)}
        onDragOver={(e) => onRowDragOver(e, id)}
        onDragLeave={onRowDragLeave}
        onDrop={(e) => onRowDrop(e, id)}
        onDragEnd={onRowDragEnd}
        onMouseMove={handleRowGroupMouseMove}
        onMouseLeave={handleRowGroupMouseLeave}
        style={spanRowShellStyle}
        data-group-id={id}
      >
        {semanticSpanRowOwners.map((owner) => (
          <div
            key={owner.key}
            className="ace-grid__semantic-row-owner"
            role="row"
            aria-rowindex={owner.ariaRowIndex}
            aria-owns={owner.ownedIds}
            style={{ top: owner.top }}
          />
        ))}
        {rowHoverOverlay}
        {leftColumnSizes.length > 0 ? (
          <RowGroupPinnedStrip
            side="left"
            height={groupHeight}
            width={pinnedLeftWidth}
            background={pinnedLeftStripBackground}
            shadow={pinnedLeftStripShadow}
            allowOverflow={allowPinnedValidationTooltipOverflow}
          >
            <div
              className="ace-grid__row-group-pinned-grid ace-grid__row-group-pinned-grid--left"
              style={leftPinnedGridStyle}
            >
              {pinnedLeftContent}
            </div>
          </RowGroupPinnedStrip>
        ) : null}

        <div
          className="ace-grid__row-group-center"
          style={centerStripStyle}
        >
          {virtualCenterCols.before > 0 ? (
            <OffsetCell
              width={virtualCenterCols.before}
              height={groupHeight}
              rowHeightHint={rowHeightHint}
              columnWidthHint={beforeColumnWidthHint}
              position="before"
              tone={beforeOffsetTone}
              edgeShadow={beforeOffsetEdgeShadow}
              label={`← ${virtualCenterCols.start} cols`}
            />
          ) : null}

          {resolvedCenterColumnSizes.length > 0 ? (
            <div
              className="ace-grid__row-group-center-grid"
              style={centerGridStyle}
            >
              {centerContent}
            </div>
          ) : null}

          <OffsetCell
            width={virtualCenterCols.after}
            height={groupHeight}
            rowHeightHint={rowHeightHint}
            columnWidthHint={afterColumnWidthHint}
            position="after"
            tone={afterOffsetTone}
            edgeShadow={afterOffsetEdgeShadow}
            label={`${remainingAfter} →`}
          />
        </div>

        {rightColumnSizes.length > 0 ? (
          <RowGroupPinnedStrip
            side="right"
            height={groupHeight}
            width={pinnedRightWidth}
            background={pinnedRightStripBackground}
            shadow={pinnedRightStripShadow}
            allowOverflow={allowPinnedValidationTooltipOverflow}
          >
            <div
              className="ace-grid__row-group-pinned-grid ace-grid__row-group-pinned-grid--right"
              style={rightPinnedGridStyle}
            >
              {pinnedRightContent}
            </div>
          </RowGroupPinnedStrip>
        ) : null}

        {rowResizeHandles}
      </div>
    );
  }

  const plainCenterStyle: CSSProperties = { height: groupHeight };
  const plainCenterColumnsStyle: CSSProperties = { height: groupHeight };
  const detailPanelStyle: CSSProperties = {
    top: baseRowHeight,
    height: detailHeight,
  };

  return (
    <div
      className={cx(className, "ace-grid__row-group-shell")}
      role="row"
      aria-rowindex={ariaRowIndexFor(absGroupStart)}
      data-drag-count={
        isDragged && rowDragState.draggedRowIds.length > 1
          ? rowDragState.draggedRowIds.length
          : undefined
      }
      draggable={canDrag}
      onDragStart={(e) => handleRowDragStart(e, id)}
      onDragOver={(e) => onRowDragOver(e, id)}
      onDragLeave={onRowDragLeave}
      onDrop={(e) => onRowDrop(e, id)}
      onDragEnd={onRowDragEnd}
      onMouseMove={handleRowGroupMouseMove}
      onMouseLeave={handleRowGroupMouseLeave}
      style={rowShellStyle}
      data-group-id={id}
      data-validation-revision={validationRevision}
    >
      {rowHoverOverlay}
      {pinnedLeftContent.length > 0 ? (
        <RowGroupPinnedStrip
          side="left"
          height={groupHeight}
          width={pinnedLeftWidth}
          background={pinnedLeftStripBackground}
          shadow={pinnedLeftStripShadow}
          allowOverflow={allowPinnedValidationTooltipOverflow}
        >
          {pinnedLeftContent}
        </RowGroupPinnedStrip>
      ) : null}

      <div
        className="ace-grid__row-group-center"
        style={plainCenterStyle}
      >
        {virtualCenterCols.before > 0 ? (
          <OffsetCell
            width={virtualCenterCols.before}
            height={groupHeight}
            rowHeightHint={rowHeightHint}
            columnWidthHint={beforeColumnWidthHint}
            position="before"
            tone={beforeOffsetTone}
            edgeShadow={beforeOffsetEdgeShadow}
            label={`← ${virtualCenterCols.start} cols`}
          />
        ) : null}

        <div
          className="ace-grid__row-group-center-columns"
          style={plainCenterColumnsStyle}
        >
          {centerContent ?? null}
        </div>

        <OffsetCell
          width={virtualCenterCols.after}
          height={groupHeight}
          rowHeightHint={rowHeightHint}
          columnWidthHint={afterColumnWidthHint}
          position="after"
          tone={afterOffsetTone}
          edgeShadow={afterOffsetEdgeShadow}
          label={`${Math.max(
            0,
            centerColumns.length - virtualCenterCols.end - 1
          )} cols →`}
        />
      </div>

      {pinnedRightContent.length > 0 ? (
        <RowGroupPinnedStrip
          side="right"
          height={groupHeight}
          width={pinnedRightWidth}
          background={pinnedRightStripBackground}
          shadow={pinnedRightStripShadow}
          allowOverflow={allowPinnedValidationTooltipOverflow}
        >
          {pinnedRightContent}
        </RowGroupPinnedStrip>
      ) : null}
      {rowResizeHandles}
      {detailExpanded && detailHeight > 0 && masterDetail?.renderDetail ? (
        <div
          className="ace-grid__row-group-detail"
          role="presentation"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          draggable={false}
          style={detailPanelStyle}
        >
          <div className="ace-grid__row-group-detail-inner">
            {masterDetail.renderDetail({
              row: masterRow,
              rowIndex: absGroupStart,
              columns: visualColumns,
              collapse: () => masterDetail.collapseRow(masterRow.id),
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const RowGroupView = React.memo(RowGroupViewInner);
