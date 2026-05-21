import { useMemo, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from "react";

import type {
  GridColumn,
  GridLoadingCellRenderer,
  GridMasterDetailProps,
  GridPinProps,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionState,
  GridValidationCellState,
} from "../../types";
import type { GridThemeTokens } from "../../features/theming/types";
import type { SsrmSelectionLookupCache } from "../../features/selection/ssrmSelectionState";
import type {
  RowSelectionChangeMeta,
  RowSelectSelectionMetrics,
} from "../../features/selection/components/RowSelectCell";
import type { OpenContextMenuArgs } from "../../features/context-menu/hooks/useContextMenu";
import type { RowDragState } from "../../features/reorder/hooks/useRowDnD";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../../features/resize";
import type { GridValidationDisplayConfig } from "../../runtime/publicCoreSupport";
import type { FormulaHighlightRange } from "../RowGroupView";

type SharedMasterDetailView = {
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

type SharedRowModelView = {
  getRow: (index: number) => GridRow;
  version?: number;
  rowCount?: number;
};

type UseGridSharedRowViewPropsArgs = {
  resolvedClientGroupSelects: GridServerRowModelGroupSelects;
  ssrmSelectionEnabled: boolean;
  ssrmSelectionState: GridServerRowModelSelectionState;
  serverRowModelRowCount?: number;
  ssrmGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionLookupCache?: SsrmSelectionLookupCache | null;
  handleSsrmSelectionStateChange: (
    state: GridServerRowModelSelectionState,
  ) => void;
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  visualColumns: GridColumn[];
  visualColumnSizes: string[];
  visualColumnIndex: Map<string, number>;
  formulaColumnIndex: Map<string, number>;
  rowIndexLookup: Map<string | number, number>;
  rowIndexCol?: GridColumn | null;
  getRowKeyLabel: (row: GridRow, rowIndex: number) => ReactNode;
  rowHeightOf: (rowId: string | number) => number;
  colWidthOf: (columnKey: string, fallback?: number) => number;
  pinnedLeftWidth: number;
  pinnedRightWidth: number;
  pinnedLeftColumnSizes: string[];
  pinnedRightColumnSizes: string[];
  applyPinnedStyle: (
    base: CSSProperties,
    column: GridColumn,
    isLeft: boolean,
    isRight: boolean,
    mode?: "cell" | "strip",
  ) => CSSProperties;
  tokens: GridThemeTokens;
  rowDragState: RowDragState;
  effectiveRowReorder: boolean;
  handleRowDragStart: (e: DragEvent, rowId: string) => void;
  onRowDragOver: (e: DragEvent, rowId: string) => void;
  onRowDragLeave: (e: DragEvent) => void;
  onRowDrop: (e: DragEvent, rowId: string) => void;
  onRowDragEnd: (e: DragEvent) => void;
  effectiveRowHasSpans: (rowId: string | number) => boolean;
  cellPadding: string;
  selectionEdgeStyle: (
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    columnKey: string,
  ) => CSSProperties;
  handleCellMouseDown: (
    rowIndex: number,
    colIndex: number,
    event: MouseEvent,
  ) => void;
  handleCellMouseEnter: (
    rowIndex: number,
    colIndex: number,
    event: MouseEvent,
  ) => void;
  selectSingleCell: (
    rowIndex: number,
    colIndex: number,
    event?: MouseEvent,
    rowSpan?: number,
    colSpan?: number,
  ) => void;
  onCellDbl: (rowIndex: number, colIndex: number, element?: HTMLElement) => void;
  openCellContextMenu: (args: OpenContextMenuArgs) => void;
  renderFillHandle: (visible: boolean) => ReactNode;
  isFillHandleCell: (
    rowIndex: number,
    colIndex: number,
    rowSpan?: number,
    colSpan?: number,
    columnKey?: string,
  ) => boolean;
  enableColumnResize: boolean;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides,
  ) => ColumnResizeHandleProps;
  enableCellContentVirtualization: boolean;
  updateEditingValue: (value: any) => void;
  commitEdit: (rowIndex: number, colIndex: number, rawValue?: any) => void;
  cancelEdit: () => void;
  registerEditorValueListener: (listener: ((value: any) => void) | null) => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  getCellValidation: (
    rowId: string | number,
    columnKey: string,
  ) => GridValidationCellState | null;
  validationDisplay: GridValidationDisplayConfig;
  validationRevision: number;
  serverLoadingCellRenderer?: GridLoadingCellRenderer;
  effectivePinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  handlePinRow: (rowId: string | number, side: "top" | "bottom" | null) => void;
  renderRowPinCell?: GridPinProps["renderRowPinCell"];
  selectionRows: GridRow[];
  selectedRowIds: (string | number)[];
  selectedRowIdSet: Set<string | number>;
  rowSelectSelectionMetrics?: RowSelectSelectionMetrics;
  handleRowSelectionChange: (
    ids: (string | number)[],
    meta?: RowSelectionChangeMeta,
  ) => void;
  enableRowResize: boolean;
  hasRowResizeHandler: boolean;
  createRowResizeHandle: (
    rowId: string | number,
    hasSpan: boolean,
    offset: number,
    containerHeight?: number,
  ) => ReactNode;
  resolvedOnToggleGroupRow?: (
    path: string,
    expanded: boolean,
    meta?: {
      rowIndex?: number;
      childCount?: number;
      level?: number;
      visibleDescendantCount?: number;
    },
  ) => void;
  serverHierarchyEnabled: boolean;
  resolveServerGroupExpandedState: (path: string, fallback: boolean) => boolean;
  isServerGroupTogglePending: (path: string) => boolean;
  allowGroupHeaderDrag: boolean;
  masterDetailView?: SharedMasterDetailView;
  rowModelForView?: SharedRowModelView;
  formulaHighlightRanges?: FormulaHighlightRange[];
  headerRowCount: number;
  floatingFiltersEnabled: boolean;
  resolveSemanticBodyRowIndex: (rowIndex: number) => number;
  gridBodyCellIdBase?: string;
};

export const useGridSharedRowViewProps = ({
  resolvedClientGroupSelects,
  ssrmSelectionEnabled,
  ssrmSelectionState,
  serverRowModelRowCount,
  ssrmGroupSelects,
  ssrmSelectionLookupCache,
  handleSsrmSelectionStateChange,
  pinnedLeftColumns,
  pinnedRightColumns,
  centerColumns,
  visualColumns,
  visualColumnSizes,
  visualColumnIndex,
  formulaColumnIndex,
  rowIndexLookup,
  rowIndexCol,
  getRowKeyLabel,
  rowHeightOf,
  colWidthOf,
  pinnedLeftWidth,
  pinnedRightWidth,
  pinnedLeftColumnSizes,
  pinnedRightColumnSizes,
  applyPinnedStyle,
  tokens,
  rowDragState,
  effectiveRowReorder,
  handleRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  onRowDragEnd,
  effectiveRowHasSpans,
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
  serverLoadingCellRenderer,
  effectivePinnedRows,
  handlePinRow,
  renderRowPinCell,
  selectionRows,
  selectedRowIds,
  selectedRowIdSet,
  rowSelectSelectionMetrics,
  handleRowSelectionChange,
  enableRowResize,
  hasRowResizeHandler,
  createRowResizeHandle,
  resolvedOnToggleGroupRow,
  serverHierarchyEnabled,
  resolveServerGroupExpandedState,
  isServerGroupTogglePending,
  allowGroupHeaderDrag,
  masterDetailView,
  rowModelForView,
  formulaHighlightRanges,
  headerRowCount,
  floatingFiltersEnabled,
  resolveSemanticBodyRowIndex,
  gridBodyCellIdBase,
}: UseGridSharedRowViewPropsArgs) => {
  const sharedSsrmSelectionProps = useMemo(() => {
    const sharedHandler = ssrmSelectionEnabled
      ? handleSsrmSelectionStateChange
      : undefined;

    return {
      clientGroupSelects: resolvedClientGroupSelects,
      ssrmSelectionState: ssrmSelectionEnabled ? ssrmSelectionState : undefined,
      ssrmSelectableRowCount: ssrmSelectionEnabled
        ? serverRowModelRowCount
        : undefined,
      ssrmGroupSelects,
      ssrmSelectionCache: ssrmSelectionEnabled
        ? (ssrmSelectionLookupCache ?? undefined)
        : undefined,
      handleSsrmSelectionStateChange: sharedHandler,
      onSsrmSelectionStateChange: sharedHandler,
    };
  }, [
    resolvedClientGroupSelects,
    ssrmSelectionEnabled,
    ssrmSelectionState,
    serverRowModelRowCount,
    ssrmGroupSelects,
    ssrmSelectionLookupCache,
    handleSsrmSelectionStateChange,
  ]);

  const sharedRowViewProps = useMemo(
    () => ({
      pinnedLeftColumns,
      pinnedRightColumns,
      centerColumns,
      visualColumns,
      visualColumnSizes,
      visualColumnIndex,
      columnIndexLookup: formulaColumnIndex,
      rowIndexLookup,
      getRowKeyLabel: rowIndexCol ? getRowKeyLabel : undefined,
      rowHeightOf,
      colWidthOf,
      pinnedLeftWidth,
      pinnedRightWidth,
      pinnedLeftColumnSizes,
      pinnedRightColumnSizes,
      applyPinnedStyle,
      tokens,
      rowDragState,
      isRowReorder: effectiveRowReorder,
      handleRowDragStart,
      onRowDragOver,
      onRowDragLeave,
      onRowDrop,
      onRowDragEnd,
      rowHasSpans: effectiveRowHasSpans,
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
      loadingCellRenderer: serverLoadingCellRenderer,
      pinnedRows: effectivePinnedRows,
      handlePinRow,
      renderRowPinCell,
      rows: selectionRows,
      selectedRowIds,
      selectedRowIdSet,
      selectionMetrics: rowSelectSelectionMetrics,
      handleRowSelectionChange,
      clientGroupSelects: sharedSsrmSelectionProps.clientGroupSelects,
      ssrmSelectionState: sharedSsrmSelectionProps.ssrmSelectionState,
      ssrmSelectableRowCount: sharedSsrmSelectionProps.ssrmSelectableRowCount,
      ssrmGroupSelects: sharedSsrmSelectionProps.ssrmGroupSelects,
      ssrmSelectionCache: sharedSsrmSelectionProps.ssrmSelectionCache,
      handleSsrmSelectionStateChange:
        sharedSsrmSelectionProps.handleSsrmSelectionStateChange,
      enableRowResize,
      hasRowResizeHandler,
      createRowResizeHandle,
      onToggleGroupRow: resolvedOnToggleGroupRow,
      resolveGroupExpandedState: serverHierarchyEnabled
        ? resolveServerGroupExpandedState
        : undefined,
      isGroupToggleLoading: serverHierarchyEnabled
        ? isServerGroupTogglePending
        : undefined,
      allowGroupHeaderDrag,
      masterDetail: masterDetailView,
      rowModel: rowModelForView,
      formulaHighlightRanges,
      ariaRowIndexOffset: headerRowCount + (floatingFiltersEnabled ? 1 : 0),
      resolveBodyRowIndex: resolveSemanticBodyRowIndex,
      gridBodyCellIdBase,
    }),
    [
      pinnedLeftColumns,
      pinnedRightColumns,
      centerColumns,
      visualColumns,
      visualColumnSizes,
      visualColumnIndex,
      formulaColumnIndex,
      rowIndexLookup,
      rowIndexCol,
      getRowKeyLabel,
      rowHeightOf,
      colWidthOf,
      pinnedLeftWidth,
      pinnedRightWidth,
      pinnedLeftColumnSizes,
      pinnedRightColumnSizes,
      applyPinnedStyle,
      tokens,
      rowDragState,
      effectiveRowReorder,
      handleRowDragStart,
      onRowDragOver,
      onRowDragLeave,
      onRowDrop,
      onRowDragEnd,
      effectiveRowHasSpans,
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
      serverLoadingCellRenderer,
      effectivePinnedRows,
      handlePinRow,
      renderRowPinCell,
      selectionRows,
      selectedRowIds,
      selectedRowIdSet,
      rowSelectSelectionMetrics,
      handleRowSelectionChange,
      sharedSsrmSelectionProps,
      enableRowResize,
      hasRowResizeHandler,
      createRowResizeHandle,
      resolvedOnToggleGroupRow,
      serverHierarchyEnabled,
      resolveServerGroupExpandedState,
      isServerGroupTogglePending,
      allowGroupHeaderDrag,
      masterDetailView,
      rowModelForView,
      formulaHighlightRanges,
      headerRowCount,
      floatingFiltersEnabled,
      resolveSemanticBodyRowIndex,
      gridBodyCellIdBase,
    ],
  );

  return {
    sharedSsrmSelectionProps,
    sharedRowViewProps,
  };
};

export type GridSharedSsrmSelectionProps = ReturnType<
  typeof useGridSharedRowViewProps
>["sharedSsrmSelectionProps"];

export type GridSharedRowViewProps = ReturnType<
  typeof useGridSharedRowViewProps
>["sharedRowViewProps"];
