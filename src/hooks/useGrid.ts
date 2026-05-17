import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  resolveGridCapabilities,
  type GridTierPreset,
} from "../capabilities";
import { getGridRuntimeModules } from "../runtime/modules";
import type {
  GridRow,
  GridColumn,
  GridColumnDef,
  GridColumnGroup,
  GridSelection,
  CellValue,
  CellFormat,
  CellValueType,
  GridMergedCell,
  GridSpanRowIdMergeMode,
  GridRowGroupingOptions,
  GridRowGroupingRowMoveEvent,
  GridRowGroupingGroupReorderEvent,
  GridChartAxisScale,
  GridChartBrushActionOptions,
  GridChartCategoryAggregation,
  GridChartMissingValueMode,
  GridChartModel,
  GridChartNormalizationMode,
  GridChartOptions,
  GridChartSamplingMode,
  GridChartSamplingOptions,
  GridChartScatterCategoryMode,
  GridChartSeriesBy,
  GridChartSettings,
  GridChartTimeBucket,
  GridChartUniqueCategoryMode,
  GridFilterConfig,
  GridCsvExportOptions,
  GridCsvImportOptions,
  GridCsvImportResult,
  GridCsvImportSource,
  GridFormulaReferenceMode,
  GridReorderMode,
  GridExcelExportOptions,
  GridExcelImportOptions,
  GridExcelImportResult,
  GridExcelImportSource,
  GridPinnedColumns,
  GridPinnedRows,
  GridServerRowGroupColumnRequest,
  GridServerRowModelPivotColumnRequest,
  GridServerRowModelPivotValueColumnRequest,
  GridSearchMode,
  GridSortConfig,
  GridValidationIndicator,
  GridValidationMode,
  GridValidationTrigger,
} from "../types";
import type { GridLicenseConfig } from "../license";
import type {
  GridContextMenuConfig,
  GridContextMenuItemDefinition,
} from "../features/context-menu";
import {
  buildColumnHierarchy,
  type ColumnHierarchy,
} from "../features/column-groups/nodes";
import {
  useGridFilteringStateController,
} from "../features/filtering/hooks/useGridFilteringStateController";
import { RowGrouping } from "../features/sorting/utils";
import { isSystemCol } from "../features/cell-selection";
import { formatCellValue } from "../features/cell-format";
import type {
  FormulaGridState,
  FormulaGridEvalOptions,
} from "../features/formula";
import {
  useGridPaginationPageClamp,
  useGridPaginationStateController,
} from "../features/pagination/hooks/useGridPaginationStateController";
import {
  useGridActionsBundle,
} from "./internal/useGridActionsBundle";
import {
  useGridChartBrushActions,
} from "./internal/useGridChartBrushActions";
import {
  useGridChartStateController,
} from "./internal/useGridChartStateController";
import {
  useGridChartAxisState,
  useGridChartBrushState,
  useGridChartOptions,
  useGridChartSamplingState,
  useGridChartStateFacade,
} from "./internal/useGridChartViewState";
import {
  useGridClipboardCommands,
} from "./internal/useGridClipboardCommands";
import {
  useGridDataCommands,
} from "./internal/useGridDataCommands";
import {
  useGridContextMenuConfig,
} from "./internal/useGridContextMenuConfig";
import {
  useGridColumnMutationCommands,
} from "./internal/useGridColumnMutationCommands";
import {
  useGridColumnOrderCommands,
} from "./internal/useGridColumnOrderCommands";
import {
  useGridFeatureFlagsStateController,
} from "./internal/useGridFeatureFlagsStateController";
import {
  useGridSortFilterCommands,
} from "./internal/useGridSortFilterCommands";
import {
  useGridPinningCommands,
} from "./internal/useGridPinningCommands";
import {
  useGridPinningStateController,
} from "./internal/useGridPinningStateController";
import {
  useGridRowMutationCommands,
} from "./internal/useGridRowMutationCommands";
import {
  useGridRowMovementCommands,
} from "./internal/useGridRowMovementCommands";
import {
  useGridPivotStateController,
} from "./internal/useGridPivotStateController";
import {
  useGridSelectionStateController,
} from "./internal/useGridSelectionStateController";
import {
  useGridSelectionInsertCommands,
} from "./internal/useGridSelectionInsertCommands";
import {
  useGridSpanningCommands,
} from "./internal/useGridSpanningCommands";
import {
  useGridSparklineStateController,
} from "./internal/useGridSparklineStateController";
import {
  useGridValidationStateController,
} from "./internal/useGridValidationStateController";
import {
  useGridViewStateCoordinator,
} from "./internal/useGridViewStateCoordinator";
import {
  useGridSearchStateController,
} from "../features/search/hooks/useGridSearchStateController";

const rowsHaveSameOrder = (a: GridRow[], b: GridRow[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]?.id !== b[i]?.id) return false;
  }
  return true;
};

const guardCapabilityValue = <T,>(
  enabled: boolean,
  value: T,
  fallback: T,
): T => (enabled ? value : fallback);

const resolveCellValueType = (type?: string): CellValueType => {
  switch (type) {
    case "number":
    case "date":
    case "datetime":
    case "time":
    case "boolean":
    case "json":
    case "formula":
    case "radio":
      return type as CellValueType;
    default:
      return "text";
  }
};

export interface GridAutoSizeColumnsOptions {
  includeHeaders?: boolean;
  includeCells?: boolean;
  rowScope?: "current" | "all";
  rows?: GridRow[];
  sampleSize?: number;
  fontSize?: number;
  fontFamily?: string;
  cellPaddingHorizontal?: number;
  headerMeasureRoot?: HTMLElement | null;
}

interface UseGridPaginationOptions {
  enabled?: boolean;
  mode?: "client" | "server" | "cursor";
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalRowCount?: number;
  keepPageOnSizeChange?: boolean;
  showPageSize?: boolean;
  showRange?: boolean;
  showPageInfo?: boolean;
  showControls?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
}

export interface UseGridPaginationState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  mode: "client" | "server" | "cursor";
  setMode: (mode: "client" | "server" | "cursor") => void;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions: number[];
  totalRowCount: number;
  baseRows: GridRow[];
  rows: GridRow[];
  keepPageOnSizeChange: boolean;
  setKeepPageOnSizeChange: (enabled: boolean) => void;
  showPageSize: boolean;
  setShowPageSize: (enabled: boolean) => void;
  showRange: boolean;
  setShowRange: (enabled: boolean) => void;
  showPageInfo: boolean;
  setShowPageInfo: (enabled: boolean) => void;
  showControls: boolean;
  setShowControls: (enabled: boolean) => void;
  showFirstLast: boolean;
  setShowFirstLast: (enabled: boolean) => void;
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
  set: (patch: Partial<UseGridPaginationViewState>) => void;
}

export interface UseGridFeatureFlagsStateValue {
  enableFormulaBar: boolean;
  enableFiltering: boolean;
  enableCellSpanning: boolean;
  enableRowGrouping: boolean;
  horizontalVirtualization: boolean;
  verticalVirtualization: boolean;
  cellContentVirtualization: boolean;
  isRowPinning: boolean;
  isColReorder: boolean;
  isRowReorder: boolean;
  isRowSelection: boolean;
  sortMode: "client" | "server";
}

export interface UseGridFeatureFlagsState
  extends UseGridFeatureFlagsStateValue {
  set: (patch: Partial<UseGridFeatureFlagsStateValue>) => void;
}

export interface UseGridFilteringStateValue {
  activeFilters: GridFilterConfig[];
  enableFloatingFilters: boolean;
  floatingFilterDebounceMs: number;
  enableAdvancedMultiFilter: boolean;
}

export interface UseGridFilteringState extends UseGridFilteringStateValue {
  set: (patch: Partial<UseGridFilteringStateValue>) => void;
  setActiveFilters: (filters: GridFilterConfig[]) => void;
  setFilter: (columnKey: string, filter: GridFilterConfig | null) => void;
  clearFilter: (columnKey: string) => void;
  clearAllFilters: () => void;
}

export interface UseGridSearchStateValue {
  query: string;
  mode: GridSearchMode;
  caseSensitive: boolean;
  wholeWord: boolean;
  highlight: boolean;
  matchCount: number;
  activeIndex: number;
}

export interface UseGridSearchState extends UseGridSearchStateValue {
  set: (patch: Partial<UseGridSearchStateValue>) => void;
  clear: () => void;
  setMatchCount: (count: number) => void;
  setActiveIndex: (index: number) => void;
  nextMatch: () => void;
  prevMatch: () => void;
}

export interface UseGridValidationStateValue {
  enabled: boolean;
  mode: GridValidationMode;
  validateOn: GridValidationTrigger;
  validateDebounceMs: number;
  validateOnVisibleChange: boolean;
  validateVisibleOnly: boolean;
  validateVisibleDebounceMs: number;
  validateAllToken?: number;
  indicator: GridValidationIndicator;
  tooltip: boolean;
  highlightErrors: boolean;
  highlightWarnings: boolean;
  highlightInfo: boolean;
}

export interface UseGridValidationState extends UseGridValidationStateValue {
  set: (patch: Partial<UseGridValidationStateValue>) => void;
  requestValidateAll: () => void;
}

interface UseGridChartAxisDefaults {
  xScale?: GridChartAxisScale;
  yScale?: GridChartAxisScale;
  showAllXTicks?: boolean;
  showAllYTicks?: boolean;
  pinXAxis?: boolean;
  pinYAxis?: boolean;
  autoFitTicks?: boolean;
}

interface UseGridChartDefaults {
  autoSortCategories?: boolean;
  uniqueCategories?: boolean;
  uniqueCategoryMode?: GridChartUniqueCategoryMode;
  categoryAggregation?: GridChartCategoryAggregation;
  scatterCategoryMode?: GridChartScatterCategoryMode;
  normalization?: GridChartNormalizationMode;
  missingValueMode?: GridChartMissingValueMode;
  timeBucket?: GridChartTimeBucket;
  initialBrushRowIds?: (string | number)[];
  sampling?: {
    mode?: GridChartSamplingMode;
    size?: number;
    seed?: number;
    columnKey?: string;
  };
  histogramBins?: number;
  boxShowOutliers?: boolean;
  violinShowMedian?: boolean;
  axis?: UseGridChartAxisDefaults;
  seriesByMode?: "both" | "columns" | "rows";
}

interface UseGridPivotDefaults {
  enabled?: boolean;
  groupColumns?: GridServerRowGroupColumnRequest[];
  pivotColumns?: GridServerRowModelPivotColumnRequest[];
  valueColumns?: GridServerRowModelPivotValueColumnRequest[];
  pivotMode?: boolean;
  resultFieldSeparator?: string;
}

interface UseGridChartAxisState {
  xScale: GridChartAxisScale;
  setXScale: (scale: GridChartAxisScale) => void;
  yScale: GridChartAxisScale;
  setYScale: (scale: GridChartAxisScale) => void;
  showAllXTicks: boolean;
  setShowAllXTicks: (value: boolean) => void;
  showAllYTicks: boolean;
  setShowAllYTicks: (value: boolean) => void;
  pinXAxis: boolean;
  setPinXAxis: (value: boolean) => void;
  pinYAxis: boolean;
  setPinYAxis: (value: boolean) => void;
  autoFitTicks: boolean;
  setAutoFitTicks: (value: boolean) => void;
}

interface UseGridChartSamplingState {
  mode: GridChartSamplingMode;
  setMode: (mode: GridChartSamplingMode) => void;
  size: number;
  setSize: (size: number) => void;
  seed: number;
  setSeed: (seed: number) => void;
  columnKey: string;
  setColumnKey: (key: string) => void;
  options: GridChartSamplingOptions | undefined;
  columnOptions: Array<{ value: string; label: string }>;
}

export interface UseGridChartControlState {
  showTypeSelector: boolean;
  setShowTypeSelector: (value: boolean) => void;
  showSeriesBy: boolean;
  setShowSeriesBy: (value: boolean) => void;
  showGroupBy: boolean;
  setShowGroupBy: (value: boolean) => void;
  showMappingSummary: boolean;
  setShowMappingSummary: (value: boolean) => void;
  enableBrushSelection: boolean;
  setEnableBrushSelection: (value: boolean) => void;
  brushSelectionModifier: "none" | "shift" | "alt" | "meta";
  setBrushSelectionModifier: (
    value: "none" | "shift" | "alt" | "meta"
  ) => void;
  useCustomIcons: boolean;
  setUseCustomIcons: (value: boolean) => void;
}

export interface UseGridChartState {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  createChartMenuEnabled: boolean;
  setCreateChartMenuEnabled: (value: boolean) => void;
  autoUpdateSelection: boolean;
  setAutoUpdateSelection: (value: boolean) => void;
  autoDetectChartType: boolean;
  setAutoDetectChartType: (value: boolean) => void;
  enableDownload: boolean;
  setEnableDownload: (value: boolean) => void;
  autoSortCategories: boolean;
  setAutoSortCategories: (value: boolean) => void;
  uniqueCategories: boolean;
  setUniqueCategories: (value: boolean) => void;
  uniqueCategoryMode: GridChartUniqueCategoryMode;
  setUniqueCategoryMode: (mode: GridChartUniqueCategoryMode) => void;
  categoryAggregation: GridChartCategoryAggregation;
  setCategoryAggregation: (value: GridChartCategoryAggregation) => void;
  scatterCategoryMode: GridChartScatterCategoryMode;
  setScatterCategoryMode: (value: GridChartScatterCategoryMode) => void;
  normalization: GridChartNormalizationMode;
  setNormalization: (value: GridChartNormalizationMode) => void;
  missingValueMode: GridChartMissingValueMode;
  setMissingValueMode: (value: GridChartMissingValueMode) => void;
  timeBucket: GridChartTimeBucket;
  setTimeBucket: (value: GridChartTimeBucket) => void;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
  boxShowOutliers: boolean;
  setBoxShowOutliers: (value: boolean) => void;
  violinShowMedian: boolean;
  setViolinShowMedian: (value: boolean) => void;
  seriesByMode: "both" | "columns" | "rows";
  setSeriesByMode: (mode: "both" | "columns" | "rows") => void;
  seriesByOptions: GridChartSeriesBy[];
  controls: UseGridChartControlState;
  sampling: UseGridChartSamplingState;
  axis: UseGridChartAxisState;
  handleSettingsChange: (next: GridChartSettings) => void;
  getOptions: (model: GridChartModel) => GridChartOptions;
  set: (patch: Partial<UseGridChartViewState>) => void;
}

interface UseGridChartBrushState {
  lastRowIds: (string | number)[];
  setLastRowIds: (ids: (string | number)[]) => void;
  rowIdFilterIds: string[];
  rowIdFilterActive: boolean;
  onBrushSelection: (rowIds: (string | number)[]) => void;
  getBrushActions: (enabled?: boolean) => GridChartBrushActionOptions[];
}

export interface UseGridSparklineStateValue {
  enabled: boolean;
  viewerEnabled: boolean;
  scaleMode: "stretch" | "fit" | "cover";
}

export interface UseGridSparklineState extends UseGridSparklineStateValue {
  set: (patch: Partial<UseGridSparklineStateValue>) => void;
}

export interface UseGridPivotStateValue {
  enabled: boolean;
  groupColumns: GridServerRowGroupColumnRequest[];
  pivotColumns: GridServerRowModelPivotColumnRequest[];
  valueColumns: GridServerRowModelPivotValueColumnRequest[];
  pivotMode: boolean;
  resultFieldSeparator: string;
  resultFields: string[];
}

export interface UseGridPivotState extends UseGridPivotStateValue {
  set: (patch: Partial<UseGridPivotStateValue>) => void;
  setResultFields: (fields: string[]) => void;
}

export interface UseGridChartViewState {
  enabled: boolean;
  createChartMenuEnabled: boolean;
  autoUpdateSelection: boolean;
  autoDetectChartType: boolean;
  enableDownload: boolean;
  showTypeSelector: boolean;
  showSeriesBy: boolean;
  showGroupBy: boolean;
  showMappingSummary: boolean;
  enableBrushSelection: boolean;
  brushSelectionModifier: "none" | "shift" | "alt" | "meta";
  useCustomIcons: boolean;
}

export interface UseGridPaginationViewState {
  enabled: boolean;
  mode: "client" | "server" | "cursor";
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  keepPageOnSizeChange: boolean;
  showPageSize: boolean;
  showRange: boolean;
  showPageInfo: boolean;
  showControls: boolean;
  showFirstLast: boolean;
  disabled: boolean;
}

export interface UseGridViewState {
  featureFlags: UseGridFeatureFlagsStateValue;
  filtering: UseGridFilteringStateValue;
  search: UseGridSearchStateValue;
  validation: UseGridValidationStateValue;
  pagination: UseGridPaginationViewState;
  chart: UseGridChartViewState;
  sparkline: UseGridSparklineStateValue;
  pivot: UseGridPivotStateValue;
  pinnedColumns: GridPinnedColumns;
  pinnedRows: GridPinnedRows;
  sortModel: GridSortConfig[];
  selection: GridSelection | null;
  selectedRowIds: Array<string | number>;
  selectedColumnKeys: string[];
  rowGrouping: GridRowGroupingOptions | null;
}

interface UseGridColumnGroupingHelpers {
  resolveColumn: (
    key: string,
    overrides?: Partial<GridColumn>
  ) => GridColumn | null;
  createGroup: (
    groupId: string,
    title: string,
    entries: Array<string | { key: string; overrides?: Partial<GridColumn> }>,
    overrides?: Partial<GridColumnGroup>
  ) => GridColumnGroup | null;
  collectLeafKeys: (node: GridColumnDef, acc: Set<string>) => void;
  applyGroupedColumnDefs: (
    groupedDefs: GridColumnDef[],
    enabled: boolean
  ) => void;
  getColumnDefs: (
    groupedDefs: GridColumnDef[],
    enabled: boolean
  ) => GridColumnDef[];
}

interface UseGridContextMenuOptions {
  className?: string;
  includeMerge?: boolean;
  includeRows?: boolean;
  includeColumns?: boolean;
  includeClipboard?: boolean;
  includeCopy?: boolean;
  includeHighlight?: boolean;
  includeLog?: boolean;
  extraItems?: GridContextMenuItemDefinition[];
}

interface ClipboardSelectionContext {
  rowIds?: (string | number)[];
  columnKeys?: string[];
  rowIndices?: number[];
  columnIndices?: number[];
  rowIndex?: number;
  colIndex?: number;
}

/* ================================
   Public API (unchanged)
   ================================ */
export interface UseGridOptions {
  /** License configuration for paid Pro and Enterprise hook entry points. */
  license?: GridLicenseConfig;

  initialRows?: GridRow[];
  columns: GridColumn[];
  enableUndo?: boolean;
  maxUndoSteps?: number;
  initialMergedCells?: GridMergedCell[];
  initialRowGrouping?: GridRowGroupingOptions | null;
  rowIdMergeMode?: GridSpanRowIdMergeMode;

  // Grid config
  enableFormulaBar?: boolean;
  enableFiltering?: boolean;
  enableCellSpanning?: boolean;
  enableRowGrouping?: boolean;
  horizontalVirtualization?: boolean;
  verticalVirtualization?: boolean;
  cellContentVirtualization?: boolean;
  isRowPinning?: boolean;
  isColReorder?: boolean;
  isRowReorder?: boolean;
  formulaReferenceMode?: GridFormulaReferenceMode;
  columnReorderMode?: GridReorderMode;
  rowReorderMode?: GridReorderMode;
  isRowSelection?: boolean;
  sortMode?: "client" | "server";
  initialSortModel?: GridSortConfig[];
  pagination?: UseGridPaginationOptions;
  chartDefaults?: UseGridChartDefaults;
  pivotDefaults?: UseGridPivotDefaults;
}

export interface GridActions {
  // Cell ops
  updateCell: (
    rowId: string | number,
    columnKey: string,
    value: CellValue
  ) => void;

  // Row ops
  appendRow: (row?: Partial<GridRow>) => void;
  appendRows: (rows: Partial<GridRow>[]) => GridRow[];
  prependRows: (rows: Partial<GridRow>[]) => GridRow[];
  replaceRows: (rows: Partial<GridRow>[]) => GridRow[];
  deleteRows: (rowIds: (string | number)[]) => void;
  reorderRows: (fromIndex: number, toIndex: number) => void;
  reorderMultipleRows: (
    rowIds: (string | number)[],
    targetIndex: number,
    position: "before" | "after"
  ) => void;
  moveRowsToGroup: (event: GridRowGroupingRowMoveEvent) => void;
  updateRowsSelection: (selectedRowIds: (string | number)[]) => void;
  reorderRowGroups: (event: GridRowGroupingGroupReorderEvent) => void;

  // Column ops
  addColumn: (column: GridColumn, index?: number) => void;
  deleteColumn: (columnKey: string) => void;
  reorderColumns: (fromIndex: number, toIndex: number) => void;
  updateColumnOrder: (columnOrder: string[]) => void;
  reorderMultipleColumns: (
    columnKeys: string[],
    targetKey: string,
    position: "before" | "after"
  ) => void;
  autoSizeColumns: (options?: GridAutoSizeColumnsOptions) => void;
  updateColumnWidths: (columnWidths: Record<string, number>) => void;
  updateRowHeights: (rowHeights: Record<string | number, number>) => void;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  setRowHeight: (rowId: string | number, height: number) => void;
  columnDefs: GridColumnDef[];
  setColumnDefs: (defs: GridColumnDef[]) => void;
  columnHierarchy: ColumnHierarchy;

  // Sorting
  sortColumn: string | null;
  sortDirection: "asc" | "desc" | null;
  sortModel: GridSortConfig[];
  setSortModel: (model: GridSortConfig[]) => void;
  setSorting: (
    columnKey: string | null,
    direction: "asc" | "desc" | null
  ) => void;
  clearSorting: () => void;

  // Filtering
  activeFilters: GridFilterConfig[];
  setActiveFilters: (filters: GridFilterConfig[]) => void;
  setFilter: (columnKey: string, filter: GridFilterConfig | null) => void;
  clearFilter: (columnKey: string) => void;
  clearAllFilters: () => void;
  filtering: UseGridFilteringState;

  // Pinning
  pinnedColumns: GridPinnedColumns;
  pinnedRows: GridPinnedRows;
  setPinnedColumns: (pinnedColumns: GridPinnedColumns) => void;
  setPinnedRows: (pinnedRows: GridPinnedRows) => void;
  pinColumn: (columnKey: string, side: "left" | "right" | null) => void;
  pinColumnAtPosition: (
    columnKey: string,
    side: "left" | "right",
    index: number
  ) => void;
  pinRow: (rowId: string | number, side: "top" | "bottom" | null) => void;
  pinRowAtPosition: (
    rowId: string | number,
    side: "top" | "bottom",
    index: number
  ) => void;
  pinMultipleRowsAtPosition: (
    ops: Array<{ rowId: string | number; side: "top" | "bottom"; index: number }>
  ) => void;
  pinRowAndReorderToPosition: (
    rowId: string | number,
    targetRowId: string | number,
    side: "top" | "bottom",
    position: "before" | "after"
  ) => void;
  pinAndPositionRow: (
    rowId: string | number,
    targetRowId: string | number,
    side: "top" | "bottom",
    position: "before" | "after"
  ) => void;
  pinAndPositionColumn: (
    columnKey: string,
    targetKey: string,
    side: "left" | "right",
    position: "before" | "after"
  ) => void;
  reorderPinnedColumns: (
    columnKey: string,
    targetKey: string,
    side: "left" | "right",
    position: "before" | "after"
  ) => void;
  reorderPinnedRows: (
    rowId: string | number,
    targetRowId: string | number,
    side: "top" | "bottom",
    position: "before" | "after"
  ) => void;
  reorderMultiplePinnedRows: (
    rowIds: (string | number)[],
    targetRowId: string | number,
    side: "top" | "bottom",
    position: "before" | "after"
  ) => void;

  // Selection
  selection: GridSelection | null;
  setSelection: (selection: GridSelection | null) => void;
  clearSelection: () => void;
  copySelectionToClipboard: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext
  ) => Promise<string | null>;
  pasteFromClipboard: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext
  ) => Promise<boolean>;
  cutSelection: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext
  ) => Promise<string | null>;
  applyCellFormatToSelection: (
    formatPatch: Partial<CellFormat>,
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext
  ) => boolean;
  clearCellFormatFromSelection: (
    keys?: Array<keyof CellFormat>,
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext
  ) => boolean;

  // Spans
  mergedCells: GridMergedCell[];
  setMergedCells: (mergedCells: GridMergedCell[]) => void;
  updateMergedCellsAfterReorder: (fromIndex: number, toIndex: number) => void;
  updateMergedCellsAfterMultiReorder: (
    rowIds: (string | number)[],
    targetIndex: number,
    position: "before" | "after"
  ) => void;
  mergeCells: (
    selection: GridSelection,
    context?: {
      rowIndices?: number[];
      columnIndices?: number[];
      rowIds?: (string | number)[];
    }
  ) => GridMergedCell | null;
  unmergeCells: (
    selection: GridSelection,
    context?: {
      rowIndices?: number[];
      columnIndices?: number[];
      rowIds?: (string | number)[];
    }
  ) => string[];
  spanningProps: {
    initialMergedCells: GridMergedCell[];
    onMergedCellsChange: (mergedCells: GridMergedCell[]) => void;
    enableCellSpanning: boolean;
  };

  // Context menu helpers
  addRowsRelativeToSelection: (
    selection: GridSelection,
    position: "above" | "below",
    context?: { rowIndices?: number[] }
  ) => GridRow[];
  addColumnsRelativeToSelection: (
    selection: GridSelection,
    position: "left" | "right",
    context?: { columnIndices?: number[] }
  ) => GridColumn[];
  buildContextMenuConfig: (
    options?: UseGridContextMenuOptions
  ) => GridContextMenuConfig;

  // Data ops
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearData: () => void;
  importData: (data: any[][]) => void;
  exportData: () => any[][];
  exportCSV: (filenameOrOptions?: string | GridCsvExportOptions) => void;
  importCSV: (
    source: GridCsvImportSource,
    options?: GridCsvImportOptions
  ) => Promise<GridCsvImportResult>;
  importExcel: (
    source: GridExcelImportSource,
    options?: GridExcelImportOptions
  ) => Promise<GridExcelImportResult>;
  exportExcel: (options?: GridExcelExportOptions) => Promise<void>;

  // Reset
  resetGridState: () => void;

  // Config
  enableFormulaBar: boolean;
  enableFiltering: boolean;
  enableCellSpanning: boolean;
  enableRowGrouping: boolean;
  horizontalVirtualization: boolean;
  verticalVirtualization: boolean;
  cellContentVirtualization: boolean;
  isRowPinning: boolean;
  isColReorder: boolean;
  isRowReorder: boolean;
  isRowSelection: boolean;
  sortMode: "client" | "server";
  selectedRowIds: (string | number)[];
  selectedColumnKeys: string[];
  rowGrouping: GridRowGroupingOptions | null;

  // Config setters
  setEnableFormulaBar: (enabled: boolean) => void;
  setEnableFiltering: (enabled: boolean) => void;
  setEnableCellSpanning: (enabled: boolean) => void;
  setEnableRowGrouping: (enabled: boolean) => void;
  setRowGrouping: (options: GridRowGroupingOptions | null) => void;
  toggleGroupExpansion: (path: string, expanded?: boolean) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  setHorizontalVirtualization: (enabled: boolean) => void;
  setVerticalVirtualization: (enabled: boolean) => void;
  setCellContentVirtualization: (enabled: boolean) => void;
  setIsRowPinning: (enabled: boolean) => void;
  setIsColReorder: (enabled: boolean) => void;
  setIsRowReorder: (enabled: boolean) => void;
  setIsRowSelection: (enabled: boolean) => void;
  setSortMode: (mode: "client" | "server") => void;
  setSelectedRowIds: (rowIds: (string | number)[]) => void;
  setSelectedColumnKeys: (keys: string[]) => void;
  featureFlags: UseGridFeatureFlagsState;
  search: UseGridSearchState;
  validation: UseGridValidationState;

  // Derived
  reorderedColumns: GridColumn[];
  virtualizationStrategy: {
    horizontal: boolean;
    vertical: boolean;
    cellContent: boolean;
    hasSpanning: boolean;
  };
  allowRowReorder: boolean;
  pagination: UseGridPaginationState;
  chart: UseGridChartState;
  chartBrush: UseGridChartBrushState;
  sparkline: UseGridSparklineState;
  pivot: UseGridPivotState;
  columnGrouping: UseGridColumnGroupingHelpers;
  resolveInfiniteScrollEnabled: (enabled: boolean) => boolean;
  getViewState: () => UseGridViewState;
  applyViewState: (state: Partial<UseGridViewState>) => void;
}

const isColumnGroupDef = (def: GridColumnDef): def is GridColumnGroup =>
  typeof (def as GridColumnGroup).children !== "undefined";

const cloneColumnDefs = (defs: GridColumnDef[]): GridColumnDef[] =>
  defs.map((def) =>
    isColumnGroupDef(def)
      ? { ...def, children: cloneColumnDefs(def.children) }
      : { ...def }
  );

const insertColumnsIntoDefs = (
  defs: GridColumnDef[],
  anchorKey: string | null,
  position: "left" | "right",
  columns: GridColumn[]
): GridColumnDef[] => {
  if (!columns.length) return defs;
  const next = cloneColumnDefs(defs);
  const insertInto = (nodes: GridColumnDef[]): boolean => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (isColumnGroupDef(node)) {
        if (insertInto(node.children)) return true;
        continue;
      }
      if (anchorKey && node.key === anchorKey) {
        const insertIndex = position === "left" ? i : i + 1;
        nodes.splice(insertIndex, 0, ...columns);
        return true;
      }
    }
    return false;
  };

  const inserted = anchorKey ? insertInto(next) : false;
  if (!inserted) {
    const fallbackIndex = position === "left" ? 0 : next.length;
    next.splice(fallbackIndex, 0, ...columns);
  }
  return next;
};

const removeColumnFromDefs = (
  defs: GridColumnDef[],
  key: string
): GridColumnDef[] => {
  let changed = false;
  const next: GridColumnDef[] = [];
  defs.forEach((def) => {
    if (isColumnGroupDef(def)) {
      const cleaned = removeColumnFromDefs(def.children, key);
      if (cleaned.length) {
        if (cleaned !== def.children) changed = true;
        next.push({ ...def, children: cleaned });
      } else {
        changed = true;
      }
      return;
    }
    if (def.key === key) {
      changed = true;
      return;
    }
    next.push(def);
  });
  return changed ? next : defs;
};

const signatureForColumnDefs = (defs: GridColumnDef[]): string => {
  const parts: string[] = [];
  const walk = (nodes: GridColumnDef[], path: number[] = []) => {
    nodes.forEach((node, idx) => {
      if (isColumnGroupDef(node)) {
        const id = node.groupId ?? `group-${[...path, idx].join("-")}`;
        parts.push(`G:${[...path, idx].join("/")}#${id}`);
        walk(node.children, [...path, idx]);
      } else {
        parts.push(`L:${[...path, idx].join("/")}#${node.key}`);
      }
    });
  };
  walk(defs);
  return parts.join("|");
};

/* ================================
   Small utilities (new & optimized)
   ================================ */
const toIndexMap = (arr: string[]) => {
  const map = new Map<string, number>();
  for (let i = 0; i < arr.length; i++) map.set(arr[i], i);
  return map;
};

const mapSpanByAnchors = (
  merged: GridMergedCell[],
  prevOrder: string[],
  nextOrder: string[],
  anchorLookup: (cell: GridMergedCell, order: string[]) => string[]
) => {
  if (!merged?.length) return merged;
  const nextIdx = toIndexMap(nextOrder);
  return merged.map((cell) => {
    const anchors = anchorLookup(cell, prevOrder);
    const mapped = anchors
      .map((k) => nextIdx.get(k) ?? -1)
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (!mapped.length) return cell;
    return { ...cell, startCol: mapped[0], endCol: mapped[mapped.length - 1] };
  });
};

const remapFormulasByOrder = (
  rows: GridRow[],
  prevOrder: string[],
  nextOrder: string[],
  remapColumns: (
    formula: string,
    remapColumnIndex: (colIndex: number) => number | null | undefined,
  ) => string,
): GridRow[] | null => {
  if (!rows.length) return null;
  if (
    prevOrder.length === nextOrder.length &&
    prevOrder.every((key, index) => key === nextOrder[index])
  ) {
    return null;
  }

  const nextIndex = toIndexMap(nextOrder);
  const remapIndex = (colIndex: number) => {
    const key = prevOrder[colIndex - 1];
    if (!key) return colIndex;
    const next = nextIndex.get(key);
    if (next == null) return colIndex;
    return next + 1;
  };

  let changed = false;
  const nextRows = rows.map((row) => {
    let rowChanged = false;
    const nextData: Record<string, CellValue> = { ...row.data };

    Object.entries(row.data).forEach(([key, cell]) => {
      if (!cell) return;
      let nextCell = cell as CellValue;
      let cellChanged = false;

      if (typeof (cell as any).formula === "string") {
        const rawFormula = (cell as any).formula as string;
        const nextFormula = remapColumns(rawFormula, remapIndex);
        if (nextFormula !== rawFormula) {
          nextCell = { ...(cell as any), formula: nextFormula };
          cellChanged = true;
        }
      } else if (
        typeof (cell as any).value === "string" &&
        (cell as any).value.trim().startsWith("=")
      ) {
        const rawFormula = (cell as any).value as string;
        const nextFormula = remapColumns(rawFormula, remapIndex);
        if (nextFormula !== rawFormula) {
          nextCell = { ...(cell as any), value: nextFormula };
          cellChanged = true;
        }
      }

      if (cellChanged) {
        nextData[key] = nextCell;
        rowChanged = true;
      }
    });

    if (!rowChanged) return row;
    changed = true;
    return { ...row, data: nextData };
  });

  return changed ? nextRows : null;
};

const remapFormulasByRowOrder = (
  rows: GridRow[],
  prevOrder: string[],
  nextOrder: string[],
  remapRows: (
    formula: string,
    remapRowIndex: (rowIndex: number) => number | null | undefined,
  ) => string,
): GridRow[] | null => {
  if (!rows.length) return null;
  if (
    prevOrder.length === nextOrder.length &&
    prevOrder.every((key, index) => key === nextOrder[index])
  ) {
    return null;
  }

  const nextIndex = toIndexMap(nextOrder);
  const remapIndex = (rowIndex: number) => {
    const key = prevOrder[rowIndex - 1];
    if (!key) return rowIndex;
    const next = nextIndex.get(key);
    if (next == null) return rowIndex;
    return next + 1;
  };

  let changed = false;
  const nextRows = rows.map((row) => {
    let rowChanged = false;
    const nextData: Record<string, CellValue> = { ...row.data };

    Object.entries(row.data).forEach(([key, cell]) => {
      if (!cell) return;
      let nextCell = cell as CellValue;
      let cellChanged = false;

      if (typeof (cell as any).formula === "string") {
        const rawFormula = (cell as any).formula as string;
        const nextFormula = remapRows(rawFormula, remapIndex);
        if (nextFormula !== rawFormula) {
          nextCell = { ...(cell as any), formula: nextFormula };
          cellChanged = true;
        }
      } else if (
        typeof (cell as any).value === "string" &&
        (cell as any).value.trim().startsWith("=")
      ) {
        const rawFormula = (cell as any).value as string;
        const nextFormula = remapRows(rawFormula, remapIndex);
        if (nextFormula !== rawFormula) {
          nextCell = { ...(cell as any), value: nextFormula };
          cellChanged = true;
        }
      }

      if (cellChanged) {
        nextData[key] = nextCell;
        rowChanged = true;
      }
    });

    if (!rowChanged) return row;
    changed = true;
    return { ...row, data: nextData };
  });

  return changed ? nextRows : null;
};

const createRowId = () =>
  `row-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const normalizeSelection = (selection: GridSelection) => {
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);
  return { startRow, endRow, startCol, endCol };
};

const clampSelectionToGrid = (
  selection: GridSelection,
  rowCount: number,
  colCount: number
) => {
  if (rowCount <= 0 || colCount <= 0) return null;
  const normalized = normalizeSelection(selection);
  const startRow = Math.max(0, Math.min(normalized.startRow, rowCount - 1));
  const endRow = Math.max(0, Math.min(normalized.endRow, rowCount - 1));
  const startCol = Math.max(0, Math.min(normalized.startCol, colCount - 1));
  const endCol = Math.max(0, Math.min(normalized.endCol, colCount - 1));
  if (startRow > endRow || startCol > endCol) return null;
  return { startRow, endRow, startCol, endCol };
};

const uniquePreserveOrder = (values?: number[]) => {
  if (!values?.length) return null;
  const seen = new Set<number>();
  const list: number[] = [];
  for (const raw of values) {
    const v = Math.trunc(raw);
    if (Number.isNaN(v) || seen.has(v)) continue;
    seen.add(v);
    list.push(v);
  }
  return list.length ? list : null;
};

const uniqueRowIdsPreserveOrder = (values?: (string | number)[]) => {
  if (!values?.length) return null;
  const seen = new Set<string>();
  const list: (string | number)[] = [];
  for (const raw of values) {
    const key = String(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(raw);
  }
  return list.length ? list : null;
};


/* ================================
   Main hook (rewritten layout)
   ================================ */
export const useGridInternal = ({
  initialRows = [],
  columns,
  enableUndo = true,
  maxUndoSteps = 50,
  initialMergedCells = [],
  initialRowGrouping = null,
  initialSortModel,
  rowIdMergeMode = "compact",
  // defaults
  enableFormulaBar = true,
  enableFiltering = true,
  enableCellSpanning = true,
  enableRowGrouping = false,
  horizontalVirtualization = true,
  verticalVirtualization = true,
  cellContentVirtualization = false,
  isRowPinning = true,
  isColReorder = true,
  isRowReorder = true,
  formulaReferenceMode = "keyed",
  columnReorderMode = "view",
  rowReorderMode = "view",
  isRowSelection = true,
  sortMode = "client",
  pagination = {},
  chartDefaults = {},
  pivotDefaults = {},
}: UseGridOptions, runtimeTier: GridTierPreset = "enterprise"): [GridRow[], GridActions] => {
  const advancedFilteringModule = getGridRuntimeModules().advancedFiltering;
  const contextMenuBaseModule = getGridRuntimeModules().contextMenuBase;
  const contextMenuCustomizationModule =
    getGridRuntimeModules().contextMenuCustomization;
  const excelIoModule = getGridRuntimeModules().excelIo;
  const floatingFilterModule = getGridRuntimeModules().floatingFilter;
  const formulaModule = getGridRuntimeModules().formula;
  const groupingModule = getGridRuntimeModules().grouping;
  const multiSortModule = getGridRuntimeModules().multiSort;
  const pivotModule = getGridRuntimeModules().pivot;
  const columnReorderModule = getGridRuntimeModules().columnReorderBasic;
  const rowReorderModule = getGridRuntimeModules().rowReorderBasic;
  const resolvedCapabilities = useMemo(
    () => resolveGridCapabilities({ tier: runtimeTier }),
    [runtimeTier],
  );
  const selectionCapabilityEnabled = resolvedCapabilities.has("selection");
  const sortingCapabilityEnabled = resolvedCapabilities.has("sort.basic");
  const formulaCapabilityEnabled =
    formulaModule.available && resolvedCapabilities.has("formula");
  const filteringCapabilityEnabled = resolvedCapabilities.has("filter.basic");
  const floatingFilterCapabilityEnabled =
    floatingFilterModule.available && resolvedCapabilities.has("filter.floating");
  const advancedFilterCapabilityEnabled =
    advancedFilteringModule.available &&
    resolvedCapabilities.has("filter.advanced");
  const spanningCapabilityEnabled = resolvedCapabilities.has("spanning");
  const groupingCapabilityEnabled =
    groupingModule.available && resolvedCapabilities.has("grouping");
  const pinningCapabilityEnabled = resolvedCapabilities.has("pinning");
  const reorderCapabilityEnabled = resolvedCapabilities.has("reorder");
  const columnReorderCapabilityEnabled =
    columnReorderModule.available && resolvedCapabilities.has("reorder.column");
  const rowReorderCapabilityEnabled =
    rowReorderModule.available && resolvedCapabilities.has("reorder.row");
  const validationCapabilityEnabled = resolvedCapabilities.has("validation");
  const paginationCapabilityEnabled = resolvedCapabilities.has("pagination");
  const chartsCapabilityEnabled = resolvedCapabilities.has("charts");
  const sparklineCapabilityEnabled = resolvedCapabilities.has("sparkline");
  const contextMenuBaseCapabilityEnabled =
    contextMenuBaseModule.available &&
    resolvedCapabilities.has("contextMenu.base");
  const contextMenuCustomizationCapabilityEnabled =
    contextMenuBaseCapabilityEnabled &&
    contextMenuCustomizationModule.available &&
    resolvedCapabilities.has("contextMenu.customization");
  const multiSortCapabilityEnabled =
    multiSortModule.available && resolvedCapabilities.has("sort.multi");
  const pivotCapabilityEnabled =
    pivotModule.available && resolvedCapabilities.has("pivot");
  const virtualizationCapabilityEnabled =
    resolvedCapabilities.has("virtualization");
  const excelIoCapabilityEnabled =
    excelIoModule.available && resolvedCapabilities.has("io.excel");

  const initialFormulaBarEnabled = formulaCapabilityEnabled && enableFormulaBar;
  const initialFilteringEnabled =
    filteringCapabilityEnabled && enableFiltering;
  const initialCellSpanningEnabled =
    spanningCapabilityEnabled && enableCellSpanning;
  const initialRowGroupingEnabled =
    groupingCapabilityEnabled && enableRowGrouping;
  const initialHorizontalVirtualizationEnabled =
    virtualizationCapabilityEnabled && horizontalVirtualization;
  const initialVerticalVirtualizationEnabled =
    virtualizationCapabilityEnabled && verticalVirtualization;
  const initialCellContentVirtualizationEnabled =
    virtualizationCapabilityEnabled && cellContentVirtualization;
  const initialRowPinningEnabled = pinningCapabilityEnabled && isRowPinning;
  const initialColReorderEnabled =
    columnReorderCapabilityEnabled && isColReorder;
  const initialRowReorderEnabled = rowReorderCapabilityEnabled && isRowReorder;
  const initialRowSelectionEnabled =
    selectionCapabilityEnabled && isRowSelection;

  /* -------- core state -------- */
  const [rows, setRows] = useState<GridRow[]>(initialRows);
  const rowCount = rows.length;
  const [undoStack, setUndoStack] = useState<GridRow[][]>([]);
  const [redoStack, setRedoStack] = useState<GridRow[][]>([]);

  // sorting
  const initialSortModelNormalized = useMemo(
    () =>
      sortingCapabilityEnabled
        ? multiSortModule.normalizeSortModel(initialSortModel, {
            allowMultiSort: multiSortCapabilityEnabled,
          })
        : [],
    [
      initialSortModel,
      multiSortCapabilityEnabled,
      multiSortModule,
      sortingCapabilityEnabled,
    ]
  );
  const [sortModel, setSortModelState] = useState<GridSortConfig[]>(
    initialSortModelNormalized
  );
  const [sortColumn, setSortColumn] = useState<string | null>(
    initialSortModelNormalized[0]?.columnKey ?? null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    initialSortModelNormalized[0]?.direction ?? null
  );

  // filters
  const { value: filteringValue, state: filteringController } =
    useGridFilteringStateController({
      initialActiveFilters: [],
      initialEnableFloatingFilters: false,
      initialFloatingFilterDebounceMs: 150,
      initialEnableAdvancedMultiFilter: false,
    });
  const {
    activeFilters,
    enableFloatingFilters: enableFloatingFiltersState,
    floatingFilterDebounceMs,
    enableAdvancedMultiFilter,
  } = filteringValue;
  const sanitizedActiveFilters = useMemo(
    () =>
      advancedFilteringModule.sanitizeFilters(activeFilters, {
        allowAdvanced: advancedFilterCapabilityEnabled,
      }),
    [activeFilters, advancedFilterCapabilityEnabled, advancedFilteringModule],
  );
  const {
    set: setFilteringStateValue,
    setActiveFilters: setActiveFiltersState,
    setFilter: setFilterState,
    clearFilter: clearFilterState,
    clearAllFilters: clearAllFiltersState,
    setEnableFloatingFilters: setEnableFloatingFiltersState,
    setEnableAdvancedMultiFilter,
  } = filteringController;

  // pinning
  const { value: pinningValue, state: pinningController } =
    useGridPinningStateController({
      initialPinnedColumns: { left: [], right: [] },
      initialPinnedRows: { top: [], bottom: [] },
    });
  const { pinnedColumns, pinnedRows } = pinningValue;
  const {
    setPinnedColumns: setPinnedColumnsValue,
    setPinnedRows: setPinnedRowsValue,
    setPinnedColumnsState,
    setPinnedRowsState,
  } = pinningController;

  // selection
  const { value: selectionValue, state: selectionController } =
    useGridSelectionStateController({
      initialSelection: null,
    });
  const { selection } = selectionValue;
  const {
    setSelection: setSelectionState,
    clearSelection: clearSelectionState,
  } = selectionController;
  const { value: searchValue, state: searchState } =
    useGridSearchStateController();
  const { value: validationValue, state: validationController } =
    useGridValidationStateController({
      initialEnabled: validationCapabilityEnabled,
      initialMode: "block",
      initialValidateOn: "change",
      initialValidateDebounceMs: 100,
      initialValidateOnVisibleChange: false,
      initialValidateVisibleOnly: true,
      initialValidateVisibleDebounceMs: 80,
      initialValidateAllToken: undefined,
      initialIndicator: "corner",
      initialTooltip: true,
      initialHighlightErrors: true,
      initialHighlightWarnings: true,
      initialHighlightInfo: false,
    });
  const {
    enabled: validationEnabled,
    mode: validationMode,
    validateOn: validationTrigger,
    validateDebounceMs: validationDebounceMs,
    validateOnVisibleChange: validationOnVisibleChange,
    validateVisibleOnly: validationVisibleOnly,
    validateVisibleDebounceMs: validationVisibleDebounceMs,
    validateAllToken: validationAllToken,
    indicator: validationIndicator,
    tooltip: validationTooltip,
    highlightErrors: validationHighlightErrors,
    highlightWarnings: validationHighlightWarnings,
    highlightInfo: validationHighlightInfo,
  } = validationValue;
  const {
    setEnabled: setValidationEnabled,
    setValidateAllToken: setValidationAllToken,
    set: setValidationStateValue,
    requestValidateAll,
  } = validationController;

  // columns meta
  const [dynamicColumns, setDynamicColumns] = useState<GridColumn[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [columnDefsState, setColumnDefsState] = useState<GridColumnDef[]>([]);
  const defsForTree = useMemo<GridColumnDef[]>(
    () => (columnDefsState.length ? columnDefsState : (columns as GridColumnDef[])),
    [columnDefsState, columns]
  );
  const columnHierarchy = useMemo(() => buildColumnHierarchy(defsForTree), [defsForTree]);

  // merged cells
  const [mergedCells, setMergedCells] =
    useState<GridMergedCell[]>(initialMergedCells);

  // config flags (individually controllable)
  const { value: featureFlagsValue, state: featureFlagsController } =
    useGridFeatureFlagsStateController({
      initialEnableFormulaBar: initialFormulaBarEnabled,
      initialEnableFiltering: initialFilteringEnabled,
      initialEnableCellSpanning: initialCellSpanningEnabled,
      initialEnableRowGrouping: initialRowGroupingEnabled,
      initialHorizontalVirtualization: initialHorizontalVirtualizationEnabled,
      initialVerticalVirtualization: initialVerticalVirtualizationEnabled,
      initialCellContentVirtualization:
        initialCellContentVirtualizationEnabled,
      initialIsRowPinning: initialRowPinningEnabled,
      initialIsColReorder: initialColReorderEnabled,
      initialIsRowReorder: initialRowReorderEnabled,
      initialIsRowSelection: initialRowSelectionEnabled,
      initialSortMode: sortingCapabilityEnabled ? sortMode : "client",
    });
  const {
    enableFormulaBar: cfgFormulaBar,
    enableFiltering: cfgFiltering,
    enableCellSpanning: cfgSpanning,
    enableRowGrouping: cfgRowGrouping,
    horizontalVirtualization: cfgHVirtual,
    verticalVirtualization: cfgVVirtual,
    cellContentVirtualization: cfgCellContentVirt,
    isRowPinning: cfgRowPin,
    isColReorder: cfgColReorder,
    isRowReorder: cfgRowReorder,
    isRowSelection: cfgRowSel,
    sortMode: cfgSortMode,
  } = featureFlagsValue;
  const {
    setEnableFormulaBar: setCfgFormulaBar,
    setEnableFiltering: setCfgFiltering,
    setEnableCellSpanning: setCfgSpanning,
    setEnableRowGrouping: setCfgRowGrouping,
    setHorizontalVirtualization: setCfgHVirtual,
    setVerticalVirtualization: setCfgVVirtual,
    setCellContentVirtualization: setCfgCellContentVirt,
    setIsRowPinning: setCfgRowPin,
    setIsColReorder: setCfgColReorder,
    setIsRowReorder: setCfgRowReorder,
    setIsRowSelection: setCfgRowSel,
    setSortMode: setCfgSortMode,
  } = featureFlagsController;
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  const shouldRemapColumnFormulas =
    formulaReferenceMode === "keyed" && columnReorderMode === "view";
  const shouldRemapRowFormulas =
    formulaReferenceMode === "keyed" && rowReorderMode === "view";
  const paginationPageSizes = useMemo(
    () => pagination.pageSizeOptions ?? [10, 20, 50, 100],
    [pagination.pageSizeOptions]
  );
  const { value: paginationValue, state: paginationController } =
    useGridPaginationStateController({
      initialEnabled: paginationCapabilityEnabled && (pagination.enabled ?? false),
      initialMode: pagination.mode ?? "client",
      initialPageIndex: pagination.pageIndex ?? 0,
      initialPageSize: pagination.pageSize ?? 20,
      pageSizeOptions: paginationPageSizes,
      initialKeepPageOnSizeChange: pagination.keepPageOnSizeChange ?? false,
      initialShowPageSize: pagination.showPageSize ?? true,
      initialShowRange: pagination.showRange ?? true,
      initialShowPageInfo: pagination.showPageInfo ?? true,
      initialShowControls: pagination.showControls ?? true,
      initialShowFirstLast: pagination.showFirstLast ?? true,
      initialDisabled: pagination.disabled ?? false,
    });
  const {
    enabled: paginationEnabled,
    mode: paginationMode,
    pageIndex,
    pageSize,
    keepPageOnSizeChange: paginationKeepPageOnSizeChange,
    showPageSize: paginationShowPageSize,
    showRange: paginationShowRange,
    showPageInfo: paginationShowPageInfo,
    showControls: paginationShowControls,
    showFirstLast: paginationShowFirstLast,
    disabled: paginationDisabled,
  } = paginationValue;
  const {
    setEnabled: setPaginationEnabled,
    setMode: setPaginationMode,
    setPageIndex,
    setPageSize,
    setKeepPageOnSizeChange: setPaginationKeepPageOnSizeChange,
    setShowPageSize: setPaginationShowPageSize,
    setShowRange: setPaginationShowRange,
    setShowPageInfo: setPaginationShowPageInfo,
    setShowControls: setPaginationShowControls,
    setShowFirstLast: setPaginationShowFirstLast,
    setDisabled: setPaginationDisabled,
    set: setPaginationState,
  } = paginationController;
  const [rowGroupingOptions, setRowGroupingOptions] =
    useState<GridRowGroupingOptions | null>(
      initialRowGroupingEnabled ? initialRowGrouping ?? null : null
    );
  const [groupExpansionState, setGroupExpansionState] = useState<
    Map<string, boolean>
  >(() => new Map());
  const lastGroupPathsRef = useRef<string[]>([]);
  const setEnableFormulaBarFlag = useCallback(
    (enabled: boolean) =>
      setCfgFormulaBar(guardCapabilityValue(formulaCapabilityEnabled, enabled, false)),
    [formulaCapabilityEnabled],
  );
  const setEnableFilteringFlag = useCallback(
    (enabled: boolean) =>
      setCfgFiltering(
        guardCapabilityValue(filteringCapabilityEnabled, enabled, false),
      ),
    [filteringCapabilityEnabled],
  );
  const setEnableCellSpanningFlag = useCallback(
    (enabled: boolean) =>
      setCfgSpanning(
        guardCapabilityValue(spanningCapabilityEnabled, enabled, false),
      ),
    [spanningCapabilityEnabled],
  );
  const setEnableRowGroupingFlag = useCallback(
    (enabled: boolean) => {
      const next = guardCapabilityValue(
        groupingCapabilityEnabled,
        enabled,
        false,
      );
      setCfgRowGrouping(next);
      if (next) return;
      setRowGroupingOptions(null);
      setGroupExpansionState(new Map());
    },
    [groupingCapabilityEnabled],
  );
  const setHorizontalVirtualizationFlag = useCallback(
    (enabled: boolean) =>
      setCfgHVirtual(
        guardCapabilityValue(
          virtualizationCapabilityEnabled,
          enabled,
          false,
        ),
      ),
    [virtualizationCapabilityEnabled],
  );
  const setVerticalVirtualizationFlag = useCallback(
    (enabled: boolean) =>
      setCfgVVirtual(
        guardCapabilityValue(
          virtualizationCapabilityEnabled,
          enabled,
          false,
        ),
      ),
    [virtualizationCapabilityEnabled],
  );
  const setCellContentVirtualizationFlag = useCallback(
    (enabled: boolean) =>
      setCfgCellContentVirt(
        guardCapabilityValue(
          virtualizationCapabilityEnabled,
          enabled,
          false,
        ),
      ),
    [virtualizationCapabilityEnabled],
  );
  const setIsRowPinningFlag = useCallback(
    (enabled: boolean) =>
      setCfgRowPin(guardCapabilityValue(pinningCapabilityEnabled, enabled, false)),
    [pinningCapabilityEnabled],
  );
  const setIsColReorderFlag = useCallback(
    (enabled: boolean) =>
      setCfgColReorder(
        guardCapabilityValue(columnReorderCapabilityEnabled, enabled, false),
      ),
    [columnReorderCapabilityEnabled],
  );
  const setIsRowReorderFlag = useCallback(
    (enabled: boolean) =>
      setCfgRowReorder(
        guardCapabilityValue(rowReorderCapabilityEnabled, enabled, false),
      ),
    [rowReorderCapabilityEnabled],
  );
  const setIsRowSelectionFlag = useCallback(
    (enabled: boolean) =>
      setCfgRowSel(
        guardCapabilityValue(selectionCapabilityEnabled, enabled, false),
      ),
    [selectionCapabilityEnabled],
  );
  const setSortModeFlag = useCallback(
    (mode: "client" | "server") => {
      if (!sortingCapabilityEnabled) {
        setCfgSortMode("client");
        setSortModelState([]);
        setSortColumn(null);
        setSortDirection(null);
        return;
      }
      setCfgSortMode(mode);
    },
    [sortingCapabilityEnabled],
  );
  const setEnableFloatingFiltersFlag = useCallback(
    (enabled: boolean) =>
      setEnableFloatingFiltersState(
        guardCapabilityValue(
          floatingFilterCapabilityEnabled,
          enabled,
          false,
        ),
      ),
    [floatingFilterCapabilityEnabled],
  );
  const setEnableAdvancedMultiFilterFlag = useCallback(
    (enabled: boolean) =>
      setEnableAdvancedMultiFilter(
        guardCapabilityValue(
          advancedFilterCapabilityEnabled,
          enabled,
          false,
        ),
      ),
    [advancedFilterCapabilityEnabled],
  );
  const { value: chartValue, state: chartController } =
    useGridChartStateController({
      autoSortCategories: chartDefaults.autoSortCategories ?? true,
      enabled: chartsCapabilityEnabled,
      createChartMenuEnabled: chartsCapabilityEnabled,
      autoUpdateSelection: false,
      autoDetectType: true,
      enableDownload: false,
      showTypeSelector: true,
      showSeriesBy: true,
      showGroupBy: true,
      showMappingSummary: true,
      enableBrushSelection: false,
      brushSelectionModifier: "shift",
      useCustomIcons: false,
      uniqueCategories: chartDefaults.uniqueCategories ?? true,
      uniqueCategoryMode: chartDefaults.uniqueCategoryMode ?? "aggregate",
      categoryAggregation: chartDefaults.categoryAggregation ?? "sum",
      scatterCategoryMode: chartDefaults.scatterCategoryMode ?? "raw",
      histogramBins: chartDefaults.histogramBins ?? 8,
      boxShowOutliers: chartDefaults.boxShowOutliers ?? true,
      violinShowMedian: chartDefaults.violinShowMedian ?? true,
      normalization: chartDefaults.normalization ?? "none",
      samplingMode: chartDefaults.sampling?.mode ?? "none",
      samplingSize: chartDefaults.sampling?.size ?? 120,
      samplingSeed: chartDefaults.sampling?.seed ?? 7,
      samplingColumnKey: chartDefaults.sampling?.columnKey ?? "",
      missingValueMode: chartDefaults.missingValueMode ?? "keep",
      timeBucket: chartDefaults.timeBucket ?? "none",
      xAxisScale: chartDefaults.axis?.xScale ?? "linear",
      yAxisScale: chartDefaults.axis?.yScale ?? "linear",
      showAllXTicks: chartDefaults.axis?.showAllXTicks ?? true,
      showAllYTicks: chartDefaults.axis?.showAllYTicks ?? true,
      pinXAxis: chartDefaults.axis?.pinXAxis ?? false,
      pinYAxis: chartDefaults.axis?.pinYAxis ?? false,
      autoFitTicks: chartDefaults.axis?.autoFitTicks ?? false,
      seriesByMode: chartDefaults.seriesByMode ?? "both",
    });
  const {
    autoSortCategories: chartAutoSortCategories,
    enabled: chartEnabled,
    createChartMenuEnabled: chartCreateMenuEnabled,
    autoUpdateSelection: chartAutoUpdateSelection,
    autoDetectType: chartAutoDetectType,
    enableDownload: chartEnableDownload,
    showTypeSelector: chartShowTypeSelector,
    showSeriesBy: chartShowSeriesBy,
    showGroupBy: chartShowGroupBy,
    showMappingSummary: chartShowMappingSummary,
    enableBrushSelection: chartEnableBrushSelection,
    brushSelectionModifier: chartBrushSelectionModifier,
    useCustomIcons: chartUseCustomIcons,
    uniqueCategories: chartUniqueCategories,
    uniqueCategoryMode: chartUniqueCategoryMode,
    categoryAggregation: chartCategoryAggregation,
    scatterCategoryMode: chartScatterCategoryMode,
    histogramBins: chartHistogramBins,
    boxShowOutliers: chartBoxShowOutliers,
    violinShowMedian: chartViolinShowMedian,
    normalization: chartNormalization,
    samplingMode: chartSamplingMode,
    samplingSize: chartSamplingSize,
    samplingSeed: chartSamplingSeed,
    samplingColumnKey: chartSamplingColumnKey,
    missingValueMode: chartMissingValueMode,
    timeBucket: chartTimeBucket,
    xAxisScale: chartXAxisScale,
    yAxisScale: chartYAxisScale,
    showAllXTicks: showAllChartXTicks,
    showAllYTicks: showAllChartYTicks,
    pinXAxis: pinChartXAxis,
    pinYAxis: pinChartYAxis,
    autoFitTicks: autoFitChartTicks,
    seriesByMode: chartSeriesByMode,
  } = chartValue;
  const {
    set: setChartStateValue,
    setEnabled: setChartEnabled,
    setCreateChartMenuEnabled: setChartCreateMenuEnabled,
    setAutoUpdateSelection: setChartAutoUpdateSelection,
    setAutoDetectType: setChartAutoDetectType,
    setEnableDownload: setChartEnableDownload,
    setAutoSortCategories: setChartAutoSortCategories,
    setUniqueCategories: setChartUniqueCategories,
    setUniqueCategoryMode: setChartUniqueCategoryMode,
    setCategoryAggregation: setChartCategoryAggregation,
    setScatterCategoryMode: setChartScatterCategoryMode,
    setHistogramBins: setChartHistogramBins,
    setBoxShowOutliers: setChartBoxShowOutliers,
    setViolinShowMedian: setChartViolinShowMedian,
    setNormalization: setChartNormalization,
    setSamplingMode: setChartSamplingMode,
    setSamplingSize: setChartSamplingSize,
    setSamplingSeed: setChartSamplingSeed,
    setSamplingColumnKey: setChartSamplingColumnKey,
    setMissingValueMode: setChartMissingValueMode,
    setTimeBucket: setChartTimeBucket,
    setXAxisScale: setChartXAxisScale,
    setYAxisScale: setChartYAxisScale,
    setShowAllXTicks: setShowAllChartXTicks,
    setShowAllYTicks: setShowAllChartYTicks,
    setPinXAxis: setPinChartXAxis,
    setPinYAxis: setPinChartYAxis,
    setAutoFitTicks: setAutoFitChartTicks,
    setSeriesByMode: setChartSeriesByMode,
    setShowTypeSelector: setChartShowTypeSelector,
    setShowSeriesBy: setChartShowSeriesBy,
    setShowGroupBy: setChartShowGroupBy,
    setShowMappingSummary: setChartShowMappingSummary,
    setEnableBrushSelection: setChartEnableBrushSelection,
    setBrushSelectionModifier: setChartBrushSelectionModifier,
    setUseCustomIcons: setChartUseCustomIcons,
  } = chartController;
  const { value: pivotValue, state: pivotController } =
    useGridPivotStateController({
      initialEnabled: pivotCapabilityEnabled && (pivotDefaults.enabled ?? false),
      initialGroupColumns: pivotCapabilityEnabled
        ? pivotDefaults.groupColumns ?? []
        : [],
      initialPivotColumns: pivotCapabilityEnabled
        ? pivotDefaults.pivotColumns ?? []
        : [],
      initialValueColumns: pivotCapabilityEnabled
        ? pivotDefaults.valueColumns ?? []
        : [],
      initialPivotMode: pivotDefaults.pivotMode ?? true,
      initialResultFieldSeparator: pivotDefaults.resultFieldSeparator ?? "_",
      initialResultFields: [],
    });
  const {
    enabled: pivotEnabled,
    groupColumns: pivotGroupColumns,
    pivotColumns,
    valueColumns: pivotValueColumns,
    pivotMode,
    resultFieldSeparator: pivotResultFieldSeparator,
    resultFields: pivotResultFields,
  } = pivotValue;
  const {
    setResultFields: setPivotResultFields,
    set: setPivotStateValue,
  } = pivotController;

  const { value: sparklineValue, state: sparklineController } =
    useGridSparklineStateController({
      initialEnabled: sparklineCapabilityEnabled,
      initialViewerEnabled: sparklineCapabilityEnabled,
      initialScaleMode: "stretch",
    });
  const {
    enabled: sparklineEnabled,
    viewerEnabled: sparklineViewerEnabled,
    scaleMode: sparklineScaleMode,
  } = sparklineValue;
  const {
    set: setSparklineStateValue,
  } = sparklineController;
  const [chartBrushRowIds, setChartBrushRowIds] = useState<
    (string | number)[]
  >(() => chartDefaults.initialBrushRowIds ?? []);

  const chartSeriesByOptions = useMemo<GridChartSeriesBy[]>(() => {
    if (chartSeriesByMode === "columns") return ["columns"];
    if (chartSeriesByMode === "rows") return ["rows"];
    return ["columns", "rows"];
  }, [chartSeriesByMode]);
  const chartSampling = useMemo<GridChartSamplingOptions | undefined>(() => {
    if (chartSamplingMode === "none") return undefined;
    const size =
      Number.isFinite(chartSamplingSize) && chartSamplingSize > 0
        ? Math.floor(chartSamplingSize)
        : undefined;
    const seed = Number.isFinite(chartSamplingSeed)
      ? Math.floor(chartSamplingSeed)
      : undefined;
    const columnKey =
      chartSamplingMode === "stratified" && chartSamplingColumnKey
        ? chartSamplingColumnKey
        : undefined;
    return {
      mode: chartSamplingMode,
      size,
      seed,
      columnKey,
    };
  }, [
    chartSamplingMode,
    chartSamplingSize,
    chartSamplingSeed,
    chartSamplingColumnKey,
  ]);

  // spans anchor store
  const spanKeyAnchorsRef = useRef(new Map<string, string[]>());
  const columnKeyCounterRef = useRef(0);
  const columnDefsSignatureRef = useRef<string>("");
  const autoSizeMeasureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const formulaGridStateRef = useRef<FormulaGridState | null>(null);
  const formulaRecalcRequestRef = useRef<FormulaGridEvalOptions | null>(null);
  const [formulaRecalcToken, setFormulaRecalcToken] = useState(0);

  const requestFormulaRecalc = useCallback((request: FormulaGridEvalOptions) => {
    if (!request) return;
    const current = formulaRecalcRequestRef.current;
    if (!current) {
      formulaRecalcRequestRef.current = {
        fullRebuild: request.fullRebuild,
        changedCells: request.changedCells ? request.changedCells.slice() : undefined,
      };
    } else {
      if (request.fullRebuild) current.fullRebuild = true;
      if (request.changedCells?.length) {
        current.changedCells = (current.changedCells ?? []).concat(
          request.changedCells
        );
      }
    }
    setFormulaRecalcToken((prev) => prev + 1);
  }, []);

  const requestFullFormulaRecalc = useCallback(
    () => requestFormulaRecalc({ fullRebuild: true }),
    [requestFormulaRecalc]
  );

  const columnsFromDefs = useMemo(() => {
    if (!columnHierarchy.leafOrder.length) return null;
    const flattened: GridColumn[] = [];
    const seen = new Set<string>();
    columnHierarchy.leafOrder.forEach((leafKey) => {
      if (seen.has(leafKey)) return;
      const node = columnHierarchy.nodes.get(leafKey);
      if (node && node.kind === "leaf") {
        flattened.push(node.column);
        seen.add(leafKey);
      }
    });
    return flattened.length ? flattened : null;
  }, [columnHierarchy]);

  const allColumns = useMemo(() => {
    const base =
      columnsFromDefs && columnsFromDefs.length ? columnsFromDefs : columns;
    if (!dynamicColumns.length) return base;
    const seen = new Map<string, GridColumn>();
    base.forEach((col) => {
      if (!seen.has(col.key)) seen.set(col.key, col);
    });
    dynamicColumns.forEach((col) => {
      seen.set(col.key, col);
    });
    return Array.from(seen.values());
  }, [columnsFromDefs, columns, dynamicColumns]);

  const formulaColumns = useMemo(() => {
    if (columnOrder.length) {
      const orderSet = new Set(columnOrder);
      const ordered = columnOrder
        .map((key) => allColumns.find((col) => col.key === key))
        .filter(Boolean) as GridColumn[];
      const remainder = allColumns.filter((col) => !orderSet.has(col.key));
      return ordered.concat(remainder);
    }
    if (columnHierarchy.leafOrder.length) {
      const ordered: GridColumn[] = [];
      const seen = new Set<string>();
      columnHierarchy.leafOrder.forEach((key) => {
        const col = allColumns.find((c) => c.key === key);
        if (col && !seen.has(col.key)) {
          ordered.push(col);
          seen.add(col.key);
        }
      });
      const remainder = allColumns.filter((col) => !seen.has(col.key));
      return ordered.concat(remainder);
    }
    return allColumns;
  }, [columnHierarchy.leafOrder, columnOrder, allColumns]);

  const recalcFormulas = useCallback(
    (nextRows: GridRow[], options?: FormulaGridEvalOptions) => {
      const result = formulaModule.evaluateGrid(
        nextRows,
        formulaColumns,
        mergedCells,
        formulaGridStateRef.current,
        options
      );
      formulaGridStateRef.current = result.state;
      return result;
    },
    [formulaColumns, formulaModule, mergedCells]
  );

  const chartSamplingColumnOptions = useMemo(
    () =>
      allColumns.map((column) => ({
        value: column.key,
        label: column.title ?? column.key,
      })),
    [allColumns]
  );

  React.useEffect(() => {
    if (!chartSamplingColumnOptions.length) {
      if (chartSamplingColumnKey) setChartSamplingColumnKey("");
      return;
    }
    if (
      chartSamplingColumnKey &&
      chartSamplingColumnOptions.some(
        (option) => option.value === chartSamplingColumnKey
      )
    ) {
      return;
    }
    setChartSamplingColumnKey(chartSamplingColumnOptions[0].value);
  }, [chartSamplingColumnKey, chartSamplingColumnOptions]);

  const allColumnKeys = useMemo(
    () => allColumns.map((col) => col.key),
    [allColumns]
  );
  const columnKeyCount = allColumnKeys.length;
  const groupingEnabled =
    cfgRowGrouping &&
    rowGroupingOptions != null &&
    rowGroupingOptions.columns.length > 0;

  const groupingModel = useMemo(
    () =>
      groupingEnabled
        ? groupingModule.buildRowGroupingModel({
            rows,
            columns: allColumns,
            options: rowGroupingOptions!,
            expansion: groupExpansionState,
          })
        : null,
    [
      groupingEnabled,
      groupingModule,
      rows,
      allColumns,
      rowGroupingOptions,
      groupExpansionState,
    ]
  );

  React.useEffect(() => {
    if (groupingModel) {
      lastGroupPathsRef.current = groupingModel.groupPaths;
    } else {
      lastGroupPathsRef.current = [];
    }
  }, [groupingModel]);

  React.useEffect(() => {
    if (!cfgRowGrouping) {
      setGroupExpansionState(new Map());
    }
  }, [cfgRowGrouping]);

  const displayRows = groupingModel ? groupingModel.rows : rows;
  const rowIdFilter = useMemo(
    () =>
      sanitizedActiveFilters.find(
        (filter) => filter.columnKey === "__rowId" && Array.isArray(filter.value)
      ),
    [sanitizedActiveFilters]
  );
  const rowIdFilterIds = useMemo(() => {
    if (!rowIdFilter || !Array.isArray(rowIdFilter.value)) return [];
    return rowIdFilter.value.map((value: string | number) => String(value));
  }, [rowIdFilter]);
  const rowIdFilterActive = rowIdFilterIds.length > 0;
  const rowsForGridBase = useMemo(() => {
    if (!rowIdFilterIds.length) return displayRows;
    const idSet = new Set(rowIdFilterIds);
    return displayRows.filter((row) => idSet.has(String(row.id)));
  }, [rowIdFilterIds, displayRows]);
  const totalRowCount = useMemo(() => {
    if (paginationMode === "server" || paginationMode === "cursor") {
      const raw = pagination.totalRowCount;
      if (typeof raw === "number" && Number.isFinite(raw)) {
        return Math.max(0, Math.trunc(raw));
      }
    }
    return rowsForGridBase.length;
  }, [pagination.totalRowCount, paginationMode, rowsForGridBase.length]);
  useGridPaginationPageClamp({
    enabled: paginationEnabled,
    pageIndex,
    pageSize,
    totalRowCount,
    setPageIndex,
  });
  const rowsForGrid = useMemo(() => {
    if (!paginationEnabled || paginationMode === "client") return rowsForGridBase;
    const start = pageIndex * pageSize;
    return rowsForGridBase.slice(start, start + pageSize);
  }, [paginationEnabled, paginationMode, pageIndex, pageSize, rowsForGridBase]);

  React.useEffect(() => {
    if (!paginationEnabled || paginationMode === "client") return;
    setSelectionState(null);
    setSelectedRowIds([]);
  }, [paginationEnabled, paginationMode, pageIndex]);

  const handleChartSettingsChange = useCallback((next: GridChartSettings) => {
    setChartStateValue({
      autoSortCategories: next.autoSortCategories ?? true,
      uniqueCategories: next.uniqueCategories ?? false,
      uniqueCategoryMode: next.uniqueCategoryMode ?? "aggregate",
      categoryAggregation: next.categoryAggregation ?? "sum",
      scatterCategoryMode: next.scatterCategoryMode ?? "raw",
      normalization: next.normalization ?? "none",
      missingValueMode: next.missingValueMode ?? "keep",
      timeBucket: next.timeBucket ?? "none",
      samplingMode: next.sampling?.mode ?? "none",
      samplingSize: next.sampling?.size ?? 120,
      samplingSeed: next.sampling?.seed ?? 7,
      samplingColumnKey: next.sampling?.columnKey ?? "",
    });
  }, [setChartStateValue]);

  const getChartOptions = useGridChartOptions({
    showAllXTicks: showAllChartXTicks,
    showAllYTicks: showAllChartYTicks,
    autoFitTicks: autoFitChartTicks,
    pinXAxis: pinChartXAxis,
    pinYAxis: pinChartYAxis,
    xAxisScale: chartXAxisScale,
    yAxisScale: chartYAxisScale,
    histogramBins: chartHistogramBins,
    boxShowOutliers: chartBoxShowOutliers,
    violinShowMedian: chartViolinShowMedian,
  });
  const sortClientRows = useCallback(
    (
      currentRows: GridRow[],
      model: GridSortConfig[]
    ): { rows: GridRow[]; merges: GridMergedCell[] } | null => {
      if (!currentRows.length || !model.length) return null;
      const grouping = new RowGrouping(mergedCells, allColumns, 32);
      const baseGroups = grouping.createRowGroups(currentRows);
      const separated = grouping.pinRowGroups(
        baseGroups,
        pinnedRows.top,
        pinnedRows.bottom
      );
      const sortedCenter = grouping.sortRowGroups(separated.centerGroups, model);
      const orderedGroups = [
        ...separated.pinnedTopGroups,
        ...sortedCenter,
        ...separated.pinnedBottomGroups,
      ];
      const orderedRows = grouping.flattenGroups(orderedGroups);
      if (rowsHaveSameOrder(currentRows, orderedRows)) return null;
      const recalculatedMerges = grouping.updateMergedCellsForGroups(
        orderedGroups
      );
      return { rows: orderedRows, merges: recalculatedMerges };
    },
    [mergedCells, allColumns, pinnedRows.top, pinnedRows.bottom]
  );

  const initialSortAppliedRef = useRef(false);
  useEffect(() => {
    if (initialSortAppliedRef.current) return;
    initialSortAppliedRef.current = true;
    if (cfgSortMode !== "client") return;
    if (!initialSortModelNormalized.length) return;

    const result = sortClientRows(rows, initialSortModelNormalized);
    if (!result) return;

    const { rows: sortedRows, merges: recalculatedMerges } = result;
    setRows(sortedRows);
    setMergedCells(recalculatedMerges);
    requestFullFormulaRecalc();
    spanKeyAnchorsRef.current.clear();
    recalculatedMerges.forEach((cell) => {
      const startCol = Math.min(cell.startCol, cell.endCol);
      const endCol = Math.max(cell.startCol, cell.endCol);
      const safeStart = Math.max(0, startCol);
      const safeEnd = Math.max(
        safeStart,
        Math.min(allColumnKeys.length - 1, endCol)
      );
      spanKeyAnchorsRef.current.set(
        cell.id,
        allColumnKeys.slice(safeStart, safeEnd + 1)
      );
    });
  }, [
    cfgSortMode,
    initialSortModelNormalized,
    sortClientRows,
    rows,
    requestFullFormulaRecalc,
    allColumnKeys,
  ]);

  const setRowGrouping = useCallback(
    (options: GridRowGroupingOptions | null) => {
      if (!groupingCapabilityEnabled) {
        setRowGroupingOptions(null);
        setGroupExpansionState(new Map());
        return;
      }
      if (!options || !options.columns?.length) {
        setRowGroupingOptions(null);
        setGroupExpansionState(new Map());
        return;
      }
      setRowGroupingOptions({
        ...options,
        columns: options.columns.slice(),
        aggregations: options.aggregations
          ? { ...options.aggregations }
          : undefined,
      });
      setGroupExpansionState(new Map());
    },
    [groupingCapabilityEnabled]
  );

  const toggleGroupExpansion = useCallback(
    (path: string, expanded?: boolean) => {
      if (!path) return;
      setGroupExpansionState((prev) => {
        const next = new Map(prev);
        const defaultExpanded =
          rowGroupingOptions?.defaultExpanded !== false;
        const current = next.has(path)
          ? (next.get(path) as boolean)
          : defaultExpanded;
        const nextState = expanded ?? !current;
        if (nextState === defaultExpanded) next.delete(path);
        else next.set(path, nextState);
        return next;
      });
    },
    [rowGroupingOptions]
  );

  const expandAllGroups = useCallback(() => {
    setGroupExpansionState((prev) => {
      const next = new Map(prev);
      lastGroupPathsRef.current.forEach((path) => next.set(path, true));
      return next;
    });
  }, []);

  const collapseAllGroups = useCallback(() => {
    setGroupExpansionState((prev) => {
      const next = new Map(prev);
      lastGroupPathsRef.current.forEach((path) => next.set(path, false));
      return next;
    });
  }, []);

  const applyColumnDefs = useCallback(
    (defs: GridColumnDef[]) => {
      const hierarchy = buildColumnHierarchy(defs);
      const leafOrder = hierarchy.leafOrder;
      if (leafOrder.length) {
        setColumnOrder((prev) => {
          const uniqueSet = new Set(leafOrder);
          const remainder = prev.filter((key) => !uniqueSet.has(key));
          const combined: string[] = [...leafOrder, ...remainder];
          const combinedSet = new Set(combined);
          allColumnKeys.forEach((key) => {
            if (!combinedSet.has(key)) {
              combined.push(key);
              combinedSet.add(key);
            }
          });
          if (
            combined.length !== prev.length ||
            combined.some((key, index) => key !== prev[index])
          ) {
            if (shouldRemapColumnFormulas) {
              setRows((current) => {
                const remapped = remapFormulasByOrder(
                  current,
                  prev,
                  combined,
                  formulaModule.remapFormulaColumns,
                );
                return remapped ?? current;
              });
            }
            return combined;
          }
          return prev;
        });
      }

      const nextSignature = signatureForColumnDefs(defs);
      if (columnDefsSignatureRef.current === nextSignature) return hierarchy;
      columnDefsSignatureRef.current = nextSignature;
      setColumnDefsState(cloneColumnDefs(defs));
      return hierarchy;
    },
    [allColumnKeys, setColumnOrder, setRows, shouldRemapColumnFormulas]
  );

  const setColumnDefs = useCallback(
    (defs: GridColumnDef[]) => {
      if (!Array.isArray(defs)) return;
      applyColumnDefs(defs);
    },
    [applyColumnDefs]
  );

  // initialize order on first columns load
  React.useEffect(() => {
    if (allColumns.length && !columnOrder.length) {
      setColumnOrder(allColumns.map((c) => c.key));
    }
  }, [allColumns, columnOrder.length]);

  /* -------- helpers -------- */
  const anchorKeysForSpan = useCallback((
    cell: GridMergedCell,
    order: string[]
  ) => {
    const existing = spanKeyAnchorsRef.current.get(cell.id);
    if (existing?.length) return existing;
    const lo = Math.min(cell.startCol, cell.endCol);
    const hi = Math.max(cell.startCol, cell.endCol);
    const keys = order.slice(lo, hi + 1);
    spanKeyAnchorsRef.current.set(cell.id, keys);
    return keys;
  }, []);

  const makeRow = useCallback(
    (partial?: Partial<GridRow>): GridRow => {
      const id = partial?.id ?? createRowId();
      const data: Record<string, CellValue> = {
        ...(partial?.data ?? {}),
      };
      allColumns.forEach((col) => {
        if (!data[col.key]) {
          data[col.key] = { value: "", type: "text" as const };
        }
      });
      return {
        id,
        data,
        height: partial?.height,
        selected: partial?.selected,
        locked: partial?.locked,
      };
    },
    [allColumns]
  );

  const generateColumnKey = useCallback(() => {
    columnKeyCounterRef.current += 1;
    return `col-${Date.now().toString(36)}-${columnKeyCounterRef.current.toString(
      36
    )}`;
  }, []);

  const pushUndo = useCallback(
    (snapshot: GridRow[]) => {
      if (!enableUndo) return;
      setUndoStack((prev) => {
        const next = prev.length >= maxUndoSteps ? prev.slice(1) : prev.slice();
        next.push(snapshot);
        return next;
      });
      setRedoStack([]); // invalidate redo on new mutating op
    },
    [enableUndo, maxUndoSteps]
  );

  const deleteColumnDefs = useCallback(
    (key: string) => {
      setColumnDefsState((prev) => {
        const baseDefs = prev.length
          ? prev
          : (allColumns.map((col) => ({ ...col })) as GridColumnDef[]);
        const nextDefs = removeColumnFromDefs(baseDefs, key);
        if (nextDefs === baseDefs) return prev;
        columnDefsSignatureRef.current = signatureForColumnDefs(nextDefs);
        return cloneColumnDefs(nextDefs);
      });
    },
    [allColumns],
  );

  const clearSpanKeyAnchors = useCallback(() => {
    spanKeyAnchorsRef.current.clear();
  }, []);

  const {
    insertColumnsAt,
    addColumn,
    deleteColumn,
  } = useGridColumnMutationCommands({
    allColumnKeys,
    columns,
    columnKeyCount,
    pushUndo,
    setRows,
    setDynamicColumns,
    setColumnOrder,
    setColumnWidths,
    setMergedCells,
    setPinnedColumnsState,
    setSelectedColumnKeys,
    clearSpanKeyAnchors,
    deleteColumnDefs,
  });

  const {
    addRowsRelativeToSelection,
    addColumnsRelativeToSelection,
  } = useGridSelectionInsertCommands({
    rowCount,
    columnKeyCount,
    allColumns,
    columnDefsState,
    normalizeSelection,
    clampSelectionToGrid,
    uniquePreserveOrder,
    makeRow,
    generateColumnKey,
    insertColumnsAt,
    insertColumnsIntoDefs,
    applyColumnDefs,
    pushUndo,
    requestFullFormulaRecalc,
    setRows,
    setMergedCells,
  });

  /* -------- cell ops -------- */
  const updateCell = useCallback(
    (rowId: string | number, columnKey: string, value: CellValue) => {
      setRows((prev) => {
        pushUndo(prev);
        let changed = false;
        const next = prev.map((r) => {
          if (r.id !== rowId) return r;
          changed = true;
          return { ...r, data: { ...r.data, [columnKey]: value } };
        });
        if (!changed) return prev;
        const recalculated = recalcFormulas(next, {
          changedCells: [{ rowId, columnKey }],
        });
        return recalculated.changed ? recalculated.rows : next;
      });
    },
    [pushUndo, recalcFormulas]
  );

  /* -------- row ops -------- */
  const {
    appendRow,
    appendRows,
    prependRows,
    replaceRows,
    deleteRows,
  } = useGridRowMutationCommands({
    makeRow,
    pushUndo,
    requestFullFormulaRecalc,
    setRows,
    setMergedCells,
    setRowHeights,
  });

  const remapRowsByOrder = useCallback(
    (nextRows: GridRow[], prevOrder: string[], nextOrder: string[]) => {
      if (!shouldRemapRowFormulas) return null;
      return remapFormulasByRowOrder(
        nextRows,
        prevOrder,
        nextOrder,
        formulaModule.remapFormulaRows,
      );
    },
    [formulaModule, shouldRemapRowFormulas],
  );

  const remapColumnsByOrder = useCallback(
    (nextRows: GridRow[], prevOrder: string[], nextOrder: string[]) => {
      if (!shouldRemapColumnFormulas) return null;
      return remapFormulasByOrder(
        nextRows,
        prevOrder,
        nextOrder,
        formulaModule.remapFormulaColumns,
      );
    },
    [formulaModule, shouldRemapColumnFormulas],
  );

  const remapMergedCellsByColumnOrder = useCallback(
    (
      prevMerged: GridMergedCell[],
      prevOrder: string[],
      nextOrder: string[],
    ) => mapSpanByAnchors(prevMerged, prevOrder, nextOrder, anchorKeysForSpan),
    [anchorKeysForSpan],
  );

  const {
    reorderRows,
    reorderMultipleRows,
    moveRowsToGroup,
    reorderRowGroups,
  } = useGridRowMovementCommands({
    groupingModel,
    pushUndo,
    requestFullFormulaRecalc,
    setRows,
    remapRowsByOrder,
  });

  const updateRowsSelection = useCallback(
    (ids: (string | number)[]) => {
      const want = new Set(ids);
      setRows((prev) => {
        // no undo for selection-only? original pushed; keep that
        pushUndo(prev);
        let changed = false;
        const next = prev.map((r) => {
          const sel = want.has(r.id);
          if (sel !== !!r.selected) {
            changed = true;
            return { ...r, selected: sel };
          }
          return r;
        });
        return changed ? next : prev;
      });
    },
    [pushUndo]
  );

  /* -------- column ops -------- */
  const {
    reorderColumns,
    updateColumnOrder,
    reorderMultipleColumns,
  } = useGridColumnOrderCommands({
    setColumnOrder,
    setRows,
    setMergedCells,
    remapColumnsByOrder,
    remapMergedCellsByColumnOrder,
  });

  const updateColumnWidths = useCallback((patch: Record<string, number>) => {
    setColumnWidths((prev) =>
      Object.keys(patch).length ? { ...prev, ...patch } : prev
    );
  }, []);

  const autoSizeColumns = useCallback(
    (options?: GridAutoSizeColumnsOptions) => {
      const includeHeaders = options?.includeHeaders !== false;
      const includeCells = options?.includeCells !== false;
      if (!includeHeaders && !includeCells) return;

      if (typeof document === "undefined") return;
      let ctx: CanvasRenderingContext2D | null = null;
      if (includeHeaders || includeCells) {
        if (!autoSizeMeasureCanvasRef.current) {
          autoSizeMeasureCanvasRef.current = document.createElement("canvas");
        }
        ctx = autoSizeMeasureCanvasRef.current.getContext("2d");
      }
      if (!ctx) return;

      const fontSize = options?.fontSize ?? 14;
      const fontFamily = options?.fontFamily ?? "sans-serif";
      const paddingX = options?.cellPaddingHorizontal ?? 12;
      const headerFont = `600 ${fontSize}px ${fontFamily}`;
      const cellFont = `400 ${fontSize}px ${fontFamily}`;
      const iconBase = Math.max(12, Math.round(fontSize * 0.85));

      const measureText = (text: string, font: string) => {
        const prevFont = ctx.font;
        ctx.font = font;
        const width = ctx.measureText(text).width;
        ctx.font = prevFont;
        return width;
      };

      const maxLineTextWidth = (text: string, font: string) =>
        text
          .split(/\r?\n/)
          .reduce(
            (max, segment) =>
              Math.max(max, measureText(segment || " ", font)),
            0
          );

      const parsePx = (value: string | null | undefined) => {
        const parsed = Number.parseFloat(value ?? "");
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const escapeSelector = (value: string) => {
        if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
          return CSS.escape(value);
        }
        return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      };

      const headerMeasureRoot =
        options?.headerMeasureRoot && options.headerMeasureRoot.isConnected
          ? options.headerMeasureRoot
          : null;

      const measureHeaderWidthFromDom = (
        columnKey: string,
        fallbackLabel: string
      ): number | null => {
        if (!headerMeasureRoot || typeof window === "undefined") return null;
        const headerEl = headerMeasureRoot.querySelector<HTMLElement>(
          `.ace-grid__header-cell[data-column-key="${escapeSelector(columnKey)}"]`
        );
        if (!headerEl) return null;

        const headerStyles = window.getComputedStyle(headerEl);
        const contentEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-content"
        );
        const dragEl =
          headerEl.querySelector<HTMLElement>(".ace-grid__drag-handle");
        const labelInnerEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-label-inner"
        );
        const renderedLabelEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-rendered-label"
        );
        const titleEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-title"
        );
        const selectEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-select"
        );
        const actionsEl = headerEl.querySelector<HTMLElement>(
          ".ace-grid__header-cell-actions"
        );

        let titleText = fallbackLabel;
        let titleFont = headerFont;
        if (titleEl) {
          titleText = titleEl.textContent?.trim() || fallbackLabel;
          const titleStyles = window.getComputedStyle(titleEl);
          titleFont = [
            titleStyles.fontStyle,
            titleStyles.fontVariant,
            titleStyles.fontWeight,
            titleStyles.fontSize,
            titleStyles.fontFamily,
          ]
            .filter(Boolean)
            .join(" ");
        }

        let labelWidth = Math.ceil(maxLineTextWidth(titleText, titleFont));
        if (renderedLabelEl && !titleEl) {
          labelWidth = Math.max(labelWidth, Math.ceil(renderedLabelEl.scrollWidth));
        }

        if (selectEl) {
          const selectRect = selectEl.getBoundingClientRect();
          const selectStyles = window.getComputedStyle(selectEl);
          labelWidth +=
            Math.ceil(selectRect.width) +
            parsePx(selectStyles.marginLeft) +
            parsePx(selectStyles.marginRight);
        }

        if (selectEl && labelInnerEl) {
          const labelInnerStyles = window.getComputedStyle(labelInnerEl);
          labelWidth += Math.ceil(
            parsePx(labelInnerStyles.columnGap || labelInnerStyles.gap)
          );
        }

        let leadingWidth = 0;
        if (dragEl) {
          const dragRect = dragEl.getBoundingClientRect();
          const dragStyles = window.getComputedStyle(dragEl);
          leadingWidth +=
            Math.ceil(dragRect.width) +
            parsePx(dragStyles.marginLeft) +
            parsePx(dragStyles.marginRight);
        }

        if (dragEl && labelWidth > 0 && contentEl) {
          const contentStyles = window.getComputedStyle(contentEl);
          leadingWidth += Math.ceil(
            parsePx(contentStyles.columnGap || contentStyles.gap)
          );
        }

        const actionsWidth = actionsEl
          ? Math.ceil(actionsEl.getBoundingClientRect().width)
          : 0;
        const rootGap =
          labelWidth > 0 && actionsWidth > 0
            ? Math.ceil(parsePx(headerStyles.columnGap || headerStyles.gap))
            : 0;
        const horizontalPadding =
          parsePx(headerStyles.paddingLeft) + parsePx(headerStyles.paddingRight);

        return Math.ceil(
          horizontalPadding +
            leadingWidth +
            labelWidth +
            rootGap +
            actionsWidth +
            12
        );
      };

      const sourceRows =
        options?.rows ??
        (options?.rowScope === "all" ? rowsForGridBase : rowsForGrid);
      const sampleSize = Math.max(
        1,
        Math.min(
          sourceRows.length || 1,
          Math.floor(options?.sampleSize ?? 200) || 200
        )
      );
      const sampledRows =
        sourceRows.length <= sampleSize
          ? sourceRows
          : Array.from({ length: sampleSize }, (_, index) => {
              const sourceIndex = Math.floor(
                (index * (sourceRows.length - 1)) / Math.max(1, sampleSize - 1)
              );
              return sourceRows[sourceIndex];
            });

      const nextWidths: Record<string, number> = {};

      for (const col of formulaColumns) {
        if (!col || isSystemCol(col.key)) continue;

        const rawLabel = col.headerName ?? col.title ?? "";
        const label =
          typeof rawLabel === "string" || typeof rawLabel === "number"
            ? String(rawLabel)
            : (col.title ?? col.key);

        let headerWidth = 0;
        if (includeHeaders) {
          const domHeaderWidth = measureHeaderWidthFromDom(col.key, label);
          if (domHeaderWidth != null) {
            headerWidth = domHeaderWidth;
          } else {
            const textWidth = maxLineTextWidth(label, headerFont);
            const dragHandleExtra = cfgColReorder ? iconBase + 8 : 0;
            const actionCount =
              (col.sortable ? 1 : 0) +
              (col.filterable ? 1 : 0) +
              2; // assume pin left/right actions for safe fit
            const actionIconWidth = iconBase + 8;
            const actionGap = 4;
            const actionsWidth =
              actionCount > 0
                ? actionCount * actionIconWidth +
                  (actionCount - 1) * actionGap
                : 0;
            const contentGap = actionCount > 0 ? 8 : 0;
            headerWidth = Math.ceil(
              textWidth +
                paddingX * 2 +
                dragHandleExtra +
                actionsWidth +
                contentGap +
                10
            );
          }
        }

        let contentWidth = 0;
        if (includeCells && col.type !== "custom" && !col.sparkline) {
          for (const row of sampledRows) {
            const cell = row?.data?.[col.key];
            if (!cell) continue;
            const text = formatCellValue(col, cell.value, cell.format);
            if (!text) continue;
            const measured = Math.ceil(
              maxLineTextWidth(text, cellFont) + paddingX * 2 + 8
            );
            if (measured > contentWidth) contentWidth = measured;
          }
        }

        const preferredWidth = Math.max(headerWidth, contentWidth);
        if (!preferredWidth) continue;
        const minWidth = col.minWidth ?? 60;
        const maxWidth = col.maxWidth ?? Number.POSITIVE_INFINITY;
        nextWidths[col.key] = Math.max(
          minWidth,
          Math.min(maxWidth, preferredWidth)
        );
      }

      updateColumnWidths(nextWidths);
    },
    [
      cfgColReorder,
      formulaColumns,
      rowsForGridBase,
      rowsForGrid,
      updateColumnWidths,
    ]
  );

  const updateRowHeights = useCallback(
    (patch: Record<string | number, number>) => {
      if (!Object.keys(patch).length) return;
      setRowHeights((prev) => {
        const next = { ...prev };
        for (const [id, height] of Object.entries(patch)) {
          next[String(id)] = height;
        }
        return next;
      });
    },
    []
  );

  const setRowHeight = useCallback((rowId: string | number, height: number) => {
    const key = String(rowId);
    setRowHeights((prev) => {
      if (prev[key] === height) return prev;
      return { ...prev, [key]: height };
    });
  }, []);

  /* -------- sorting/filtering -------- */
  const {
    setSortModel,
    setSorting,
    clearSorting,
    setActiveFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
  } = useGridSortFilterCommands({
    cfgSortMode,
    sortingCapabilityEnabled,
    filteringCapabilityEnabled,
    allowAdvancedFiltering: advancedFilterCapabilityEnabled,
    allowMultiSort: multiSortCapabilityEnabled,
    normalizeSortModel: multiSortModule.normalizeSortModel,
    sanitizeFilter: advancedFilteringModule.sanitizeFilter,
    sanitizeFilters: advancedFilteringModule.sanitizeFilters,
    rows,
    allColumnKeys,
    spanKeyAnchorsRef,
    sortClientRows,
    pushUndo,
    requestFullFormulaRecalc,
    setRows,
    setMergedCells,
    setSortModelState,
    setSortColumn,
    setSortDirection,
    setActiveFiltersState,
    setFilterState,
    clearFilterState,
    clearAllFiltersState,
  });

  const {
    onBrushSelection: handleChartBrushSelection,
    getBrushActions: getChartBrushActions,
  } = useGridChartBrushActions({
    chartBrushRowIds,
    rowIdFilterActive,
    setChartBrushRowIds,
    setSelectedRowIds,
    setFilteringEnabled: setCfgFiltering,
    setFilter,
    clearFilter,
  });

  /* -------- pinning -------- */
  const {
    setPinnedColumns,
    setPinnedRows,
    pinColumn,
    pinColumnAtPosition,
    pinRow,
    pinRowAtPosition,
    pinMultipleRowsAtPosition,
    pinRowAndReorderToPosition,
    reorderPinnedColumns,
    pinAndPositionColumn,
    reorderMultiplePinnedRows,
    reorderPinnedRows,
    pinAndPositionRow,
  } = useGridPinningCommands({
    setPinnedColumnsValue,
    setPinnedRowsValue,
    setPinnedColumnsState,
    setPinnedRowsState,
  });

  /* -------- selection -------- */
  const setSelection = useCallback(
    (s: GridSelection | null) => setSelectionState(s),
    [setSelectionState]
  );
  const clearSelection = useCallback(
    () => clearSelectionState(),
    [clearSelectionState],
  );

  const {
    undo,
    redo,
    clearData,
    importData,
    exportData,
    exportCSV,
    importCSV,
    exportExcel,
    importExcel,
    resetGridState,
  } = useGridDataCommands({
    allColumns,
    rows,
    mergedCells,
    columnWidths,
    rowHeights,
    csvCapabilityEnabled: resolvedCapabilities.has("io.csv"),
    excelIoCapabilityEnabled,
    excelIoModule,
    resolveCellValueType,
    pushUndo,
    requestFullFormulaRecalc,
    applyColumnDefs,
    setRows,
    setUndoStack,
    setRedoStack,
    setRowHeights,
    setMergedCells,
    setColumnWidths,
    setSelectionState,
    setSortColumn,
    setSortDirection,
    setSortModelState,
    setActiveFilters,
    setPinnedColumns,
    setPinnedRows,
    clearSearch: searchState.clear,
    setValidationAllToken,
    columnDefsSignatureRef,
    setColumnDefsState,
  });

  const {
    updateMergedCellsAfterReorder,
    updateMergedCellsAfterMultiReorder,
    mergeCells,
    unmergeCells,
  } = useGridSpanningCommands({
    rows,
    allColumns,
    allColumnKeys,
    rowIdMergeMode,
    spanKeyAnchorsRef,
    clampSelectionToGrid,
    uniquePreserveOrder,
    uniqueRowIdsPreserveOrder,
    rowsHaveSameOrder,
    pushUndo,
    setRows,
    setMergedCells,
  });

  /* -------- derived -------- */
  const reorderedColumns = useMemo(() => {
    if (!columnOrder.length) return allColumns;
    const inOrder: GridColumn[] = [];
    const seen = new Set<string>();
    // 1) official order
    columnOrder.forEach((k) => {
      const col = allColumns.find((c) => c.key === k);
      if (col) {
        inOrder.push(col);
        seen.add(k);
      }
    });
    // 2) any stragglers (should be rare)
    allColumns.forEach((c) => {
      if (!seen.has(c.key)) inOrder.push(c);
    });
    return inOrder;
  }, [allColumns, columnOrder]);

  React.useEffect(() => {
    const request = formulaRecalcRequestRef.current;
    if (!request) return;
    formulaRecalcRequestRef.current = null;
    setRows((prev) => {
      const recalculated = recalcFormulas(prev, request);
      return recalculated.changed ? recalculated.rows : prev;
    });
  }, [formulaRecalcToken, recalcFormulas]);

  const formulaColumnsSignature = useMemo(
    () => formulaColumns.map((column) => column.key).join("|"),
    [formulaColumns]
  );

  const mergedCellsSignature = useMemo(
    () =>
      mergedCells
        .map(
          (cell) =>
            `${cell.id}:${cell.startRow},${cell.endRow},${cell.startCol},${cell.endCol}`
        )
        .join("|"),
    [mergedCells]
  );

  React.useEffect(() => {
    requestFormulaRecalc({ fullRebuild: true });
  }, [formulaColumnsSignature, mergedCellsSignature, requestFormulaRecalc]);

  const virtualizationStrategy = useMemo(() => {
    const hasSpanning = cfgSpanning && mergedCells.length > 0;
    return {
      horizontal: cfgHVirtual,
      vertical: cfgVVirtual,
      cellContent: cfgCellContentVirt,
      hasSpanning,
    };
  }, [
    cfgSpanning,
    mergedCells.length,
    cfgHVirtual,
    cfgVVirtual,
    cfgCellContentVirt,
  ]);

  const allowRowReorder =
    cfgRowReorder && !(paginationEnabled && paginationMode !== "client");

  const resolveInfiniteScrollEnabled = useCallback(
    (enabled: boolean) => enabled && !paginationEnabled,
    [paginationEnabled]
  );

  const spanningProps = useMemo(
    () => ({
      initialMergedCells: cfgSpanning ? mergedCells : [],
      onMergedCellsChange: setMergedCells,
      enableCellSpanning: cfgSpanning,
    }),
    [cfgSpanning, mergedCells, setMergedCells]
  );

  const paginationState = useMemo<UseGridPaginationState>(
    () => ({
      enabled: paginationCapabilityEnabled && paginationEnabled,
      setEnabled: (value) => {
        if (!paginationCapabilityEnabled) {
          setPaginationEnabled(false);
          return;
        }
        setPaginationEnabled(value);
      },
      mode: paginationMode,
      setMode: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationMode(value);
      },
      pageIndex,
      setPageIndex: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPageIndex(value);
      },
      pageSize,
      setPageSize: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPageSize(value);
      },
      pageSizeOptions: paginationPageSizes,
      totalRowCount,
      baseRows: rowsForGridBase,
      rows: rowsForGrid,
      keepPageOnSizeChange: paginationKeepPageOnSizeChange,
      setKeepPageOnSizeChange: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationKeepPageOnSizeChange(value);
      },
      showPageSize: paginationShowPageSize,
      setShowPageSize: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationShowPageSize(value);
      },
      showRange: paginationShowRange,
      setShowRange: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationShowRange(value);
      },
      showPageInfo: paginationShowPageInfo,
      setShowPageInfo: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationShowPageInfo(value);
      },
      showControls: paginationShowControls,
      setShowControls: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationShowControls(value);
      },
      showFirstLast: paginationShowFirstLast,
      setShowFirstLast: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationShowFirstLast(value);
      },
      disabled: paginationDisabled,
      setDisabled: (value) => {
        if (!paginationCapabilityEnabled) return;
        setPaginationDisabled(value);
      },
      set: (patch) => {
        if (!paginationCapabilityEnabled) {
          setPaginationEnabled(false);
          return;
        }
        setPaginationState(patch);
      },
    }),
    [
      paginationEnabled,
      paginationMode,
      pageIndex,
      pageSize,
      paginationPageSizes,
      totalRowCount,
      rowsForGridBase,
      rowsForGrid,
      paginationKeepPageOnSizeChange,
      paginationShowPageSize,
      paginationShowRange,
      paginationShowPageInfo,
      paginationShowControls,
      paginationShowFirstLast,
      paginationDisabled,
      paginationCapabilityEnabled,
      setPaginationEnabled,
      setPaginationMode,
      setPageIndex,
      setPageSize,
      setPaginationKeepPageOnSizeChange,
      setPaginationShowPageSize,
      setPaginationShowRange,
      setPaginationShowPageInfo,
      setPaginationShowControls,
      setPaginationShowFirstLast,
      setPaginationDisabled,
      setPaginationState,
    ]
  );

  const chartAxisState = useGridChartAxisState({
    xScale: chartXAxisScale,
    setXScale: setChartXAxisScale,
    yScale: chartYAxisScale,
    setYScale: setChartYAxisScale,
    showAllXTicks: showAllChartXTicks,
    setShowAllXTicks: setShowAllChartXTicks,
    showAllYTicks: showAllChartYTicks,
    setShowAllYTicks: setShowAllChartYTicks,
    pinXAxis: pinChartXAxis,
    setPinXAxis: setPinChartXAxis,
    pinYAxis: pinChartYAxis,
    setPinYAxis: setPinChartYAxis,
    autoFitTicks: autoFitChartTicks,
    setAutoFitTicks: setAutoFitChartTicks,
  });

  const chartSamplingState = useGridChartSamplingState({
    mode: chartSamplingMode,
    setMode: setChartSamplingMode,
    size: chartSamplingSize,
    setSize: setChartSamplingSize,
    seed: chartSamplingSeed,
    setSeed: setChartSamplingSeed,
    columnKey: chartSamplingColumnKey,
    setColumnKey: setChartSamplingColumnKey,
    options: chartSampling,
    columnOptions: chartSamplingColumnOptions,
  });

  const chartState = useGridChartStateFacade({
    chartsCapabilityEnabled,
    chartEnabled,
    setChartEnabled,
    chartCreateMenuEnabled,
    setChartCreateMenuEnabled,
    chartAutoUpdateSelection,
    setChartAutoUpdateSelection,
    chartAutoDetectType,
    setChartAutoDetectType,
    chartEnableDownload,
    setChartEnableDownload,
    chartAutoSortCategories,
    setChartAutoSortCategories,
    chartUniqueCategories,
    setChartUniqueCategories,
    chartUniqueCategoryMode,
    setChartUniqueCategoryMode,
    chartCategoryAggregation,
    setChartCategoryAggregation,
    chartScatterCategoryMode,
    setChartScatterCategoryMode,
    chartNormalization,
    setChartNormalization,
    chartMissingValueMode,
    setChartMissingValueMode,
    chartTimeBucket,
    setChartTimeBucket,
    chartHistogramBins,
    setChartHistogramBins,
    chartBoxShowOutliers,
    setChartBoxShowOutliers,
    chartViolinShowMedian,
    setChartViolinShowMedian,
    chartSeriesByMode,
    setChartSeriesByMode,
    chartSeriesByOptions,
    chartShowTypeSelector,
    setChartShowTypeSelector,
    chartShowSeriesBy,
    setChartShowSeriesBy,
    chartShowGroupBy,
    setChartShowGroupBy,
    chartShowMappingSummary,
    setChartShowMappingSummary,
    chartEnableBrushSelection,
    setChartEnableBrushSelection,
    chartBrushSelectionModifier,
    setChartBrushSelectionModifier,
    chartUseCustomIcons,
    setChartUseCustomIcons,
    chartSamplingState,
    chartAxisState,
    handleChartSettingsChange,
    getChartOptions,
    setChartStateValue,
  });

  const chartBrushState = useGridChartBrushState({
    lastRowIds: chartBrushRowIds,
    setLastRowIds: setChartBrushRowIds,
    rowIdFilterIds,
    rowIdFilterActive,
    onBrushSelection: handleChartBrushSelection,
    getBrushActions: getChartBrushActions,
  });

  const chartViewState = useMemo<UseGridChartViewState>(
    () => ({
      enabled: chartEnabled,
      createChartMenuEnabled: chartCreateMenuEnabled,
      autoUpdateSelection: chartAutoUpdateSelection,
      autoDetectChartType: chartAutoDetectType,
      enableDownload: chartEnableDownload,
      showTypeSelector: chartShowTypeSelector,
      showSeriesBy: chartShowSeriesBy,
      showGroupBy: chartShowGroupBy,
      showMappingSummary: chartShowMappingSummary,
      enableBrushSelection: chartEnableBrushSelection,
      brushSelectionModifier: chartBrushSelectionModifier,
      useCustomIcons: chartUseCustomIcons,
    }),
    [
      chartEnabled,
      chartCreateMenuEnabled,
      chartAutoUpdateSelection,
      chartAutoDetectType,
      chartEnableDownload,
      chartShowTypeSelector,
      chartShowSeriesBy,
      chartShowGroupBy,
      chartShowMappingSummary,
      chartEnableBrushSelection,
      chartBrushSelectionModifier,
      chartUseCustomIcons,
    ],
  );

  const sparklineState = useMemo<UseGridSparklineState>(
    () => ({
      enabled: sparklineCapabilityEnabled && sparklineEnabled,
      viewerEnabled: sparklineCapabilityEnabled && sparklineViewerEnabled,
      scaleMode: sparklineScaleMode,
      set: (patch) => {
        if (!sparklineCapabilityEnabled) return;
        setSparklineStateValue(patch);
      },
    }),
    [
      sparklineEnabled,
      sparklineViewerEnabled,
      sparklineScaleMode,
      sparklineCapabilityEnabled,
      setSparklineStateValue,
    ]
  );

  const pivotState = useMemo<UseGridPivotState>(
    () => ({
      enabled: pivotCapabilityEnabled && pivotEnabled,
      groupColumns: pivotCapabilityEnabled ? pivotGroupColumns : [],
      pivotColumns: pivotCapabilityEnabled ? pivotColumns : [],
      valueColumns: pivotCapabilityEnabled ? pivotValueColumns : [],
      pivotMode: pivotCapabilityEnabled && pivotMode,
      resultFieldSeparator: pivotResultFieldSeparator,
      resultFields: pivotCapabilityEnabled ? pivotResultFields : [],
      set: (patch) => {
        if (!pivotCapabilityEnabled) return;
        setPivotStateValue(patch);
      },
      setResultFields: (fields) => {
        if (!pivotCapabilityEnabled) return;
        setPivotResultFields(fields);
      },
    }),
    [
      pivotEnabled,
      pivotGroupColumns,
      pivotColumns,
      pivotValueColumns,
      pivotMode,
      pivotResultFieldSeparator,
      pivotResultFields,
      pivotCapabilityEnabled,
      setPivotResultFields,
      setPivotStateValue,
    ]
  );

  const featureFlags = useMemo<UseGridFeatureFlagsState>(
    () => ({
      enableFormulaBar: cfgFormulaBar,
      enableFiltering: cfgFiltering,
      enableCellSpanning: cfgSpanning,
      enableRowGrouping: cfgRowGrouping,
      horizontalVirtualization: cfgHVirtual,
      verticalVirtualization: cfgVVirtual,
      cellContentVirtualization: cfgCellContentVirt,
      isRowPinning: cfgRowPin,
      isColReorder: cfgColReorder,
      isRowReorder: cfgRowReorder,
      isRowSelection: cfgRowSel,
      sortMode: cfgSortMode,
      set: (patch) => {
        if (patch.enableFormulaBar != null) {
          setEnableFormulaBarFlag(patch.enableFormulaBar);
        }
        if (patch.enableFiltering != null) {
          setEnableFilteringFlag(patch.enableFiltering);
        }
        if (patch.enableCellSpanning != null) {
          setEnableCellSpanningFlag(patch.enableCellSpanning);
        }
        if (patch.enableRowGrouping != null) {
          setEnableRowGroupingFlag(patch.enableRowGrouping);
        }
        if (patch.horizontalVirtualization != null) {
          setHorizontalVirtualizationFlag(patch.horizontalVirtualization);
        }
        if (patch.verticalVirtualization != null) {
          setVerticalVirtualizationFlag(patch.verticalVirtualization);
        }
        if (patch.cellContentVirtualization != null) {
          setCellContentVirtualizationFlag(patch.cellContentVirtualization);
        }
        if (patch.isRowPinning != null) {
          setIsRowPinningFlag(patch.isRowPinning);
        }
        if (patch.isColReorder != null) {
          setIsColReorderFlag(patch.isColReorder);
        }
        if (patch.isRowReorder != null) {
          setIsRowReorderFlag(patch.isRowReorder);
        }
        if (patch.isRowSelection != null) {
          setIsRowSelectionFlag(patch.isRowSelection);
        }
        if (patch.sortMode != null) setSortModeFlag(patch.sortMode);
      },
    }),
    [
      cfgFormulaBar,
      cfgFiltering,
      cfgSpanning,
      cfgRowGrouping,
      cfgHVirtual,
      cfgVVirtual,
      cfgCellContentVirt,
      cfgRowPin,
      cfgColReorder,
      cfgRowReorder,
      cfgRowSel,
      cfgSortMode,
      setEnableFormulaBarFlag,
      setEnableFilteringFlag,
      setEnableCellSpanningFlag,
      setEnableRowGroupingFlag,
      setHorizontalVirtualizationFlag,
      setVerticalVirtualizationFlag,
      setCellContentVirtualizationFlag,
      setIsRowPinningFlag,
      setIsColReorderFlag,
      setIsRowReorderFlag,
      setIsRowSelectionFlag,
      setSortModeFlag,
    ]
  );

  const filteringState = useMemo<UseGridFilteringState>(
    () => ({
      activeFilters: filteringCapabilityEnabled ? sanitizedActiveFilters : [],
      enableFloatingFilters:
        floatingFilterCapabilityEnabled && enableFloatingFiltersState,
      floatingFilterDebounceMs,
      enableAdvancedMultiFilter:
        advancedFilterCapabilityEnabled && enableAdvancedMultiFilter,
      set: (patch) => {
        if (!filteringCapabilityEnabled) {
          clearAllFiltersState();
          setEnableFloatingFiltersState(false);
          setEnableAdvancedMultiFilter(false);
          return;
        }
        setFilteringStateValue({
          ...patch,
          activeFilters:
            patch.activeFilters != null
              ? advancedFilteringModule.sanitizeFilters(patch.activeFilters, {
                  allowAdvanced: advancedFilterCapabilityEnabled,
                })
              : patch.activeFilters,
        });
        if (patch.enableFloatingFilters != null) {
          setEnableFloatingFiltersFlag(patch.enableFloatingFilters);
        }
        if (patch.enableAdvancedMultiFilter != null) {
          setEnableAdvancedMultiFilterFlag(patch.enableAdvancedMultiFilter);
        }
      },
      setActiveFilters,
      setFilter,
      clearFilter,
      clearAllFilters,
    }),
    [
      sanitizedActiveFilters,
      enableFloatingFiltersState,
      floatingFilterDebounceMs,
      enableAdvancedMultiFilter,
      filteringCapabilityEnabled,
      floatingFilterCapabilityEnabled,
      advancedFilterCapabilityEnabled,
      clearAllFiltersState,
      advancedFilteringModule,
      setFilteringStateValue,
      setEnableFloatingFiltersFlag,
      setEnableAdvancedMultiFilterFlag,
      setActiveFilters,
      setFilter,
      clearFilter,
      clearAllFilters,
    ]
  );

  const validationState = useMemo<UseGridValidationState>(
    () => ({
      enabled: validationCapabilityEnabled && validationEnabled,
      mode: validationMode,
      validateOn: validationTrigger,
      validateDebounceMs: validationDebounceMs,
      validateOnVisibleChange: validationOnVisibleChange,
      validateVisibleOnly: validationVisibleOnly,
      validateVisibleDebounceMs: validationVisibleDebounceMs,
      validateAllToken: validationAllToken,
      indicator: validationIndicator,
      tooltip: validationTooltip,
      highlightErrors: validationHighlightErrors,
      highlightWarnings: validationHighlightWarnings,
      highlightInfo: validationHighlightInfo,
      set: (patch) => {
        if (!validationCapabilityEnabled) {
          setValidationEnabled(false);
          return;
        }
        setValidationStateValue(patch);
      },
      requestValidateAll,
    }),
    [
      validationEnabled,
      validationMode,
      validationTrigger,
      validationDebounceMs,
      validationOnVisibleChange,
      validationVisibleOnly,
      validationVisibleDebounceMs,
      validationAllToken,
      validationIndicator,
      validationTooltip,
      validationHighlightErrors,
      validationHighlightWarnings,
      validationHighlightInfo,
      validationCapabilityEnabled,
      setValidationEnabled,
      setValidationStateValue,
      requestValidateAll,
    ]
  );

  const { getViewState, applyViewState } = useGridViewStateCoordinator({
    currentFeatureFlags: featureFlagsValue,
    currentFiltering: filteringValue,
    currentSearch: searchValue,
    currentValidation: validationValue,
    currentPagination: paginationValue,
    currentChart: chartViewState,
    currentSparkline: sparklineValue,
    currentPivot: pivotValue,
    currentPinnedColumns: pinnedColumns,
    currentPinnedRows: pinnedRows,
    currentSortModel: sortModel,
    currentSelection: selection,
    currentSelectedRowIds: selectedRowIds,
    currentSelectedColumnKeys: selectedColumnKeys,
    currentRowGrouping: rowGroupingOptions,
    featureFlagsState: featureFlags,
    filteringState,
    searchState,
    validationState,
    paginationState,
    chartState,
    sparklineState,
    pivotState,
    setPinnedColumns,
    setPinnedRows,
    setSortModel,
    setSelection,
    setSelectedRowIds,
    setSelectedColumnKeys,
    setRowGrouping,
  });

  const resolveColumn = useCallback(
    (key: string, overrides?: Partial<GridColumn>) => {
      const base = reorderedColumns.find((col) => col.key === key);
      if (!base) return null;
      return overrides ? { ...base, ...overrides } : base;
    },
    [reorderedColumns]
  );

  const collectLeafKeys = useCallback(
    (node: GridColumnDef, acc: Set<string>) => {
      if ("children" in node) {
        node.children.forEach((child) => collectLeafKeys(child, acc));
      } else {
        acc.add(node.key);
      }
    },
    []
  );

  const createGroup = useCallback(
    (
      groupId: string,
      title: string,
      entries: Array<string | { key: string; overrides?: Partial<GridColumn> }>,
      overrides?: Partial<GridColumnGroup>
    ): GridColumnGroup | null => {
      const children: GridColumn[] = [];
      entries.forEach((entry) => {
        const key = typeof entry === "string" ? entry : entry.key;
        const columnOverrides =
          typeof entry === "string" ? undefined : entry.overrides;
        const column = resolveColumn(key, columnOverrides);
        if (column) children.push(column);
      });
      if (!children.length) return null;
      return {
        groupId,
        title,
        openByDefault: true,
        marryChildren: true,
        children,
        ...overrides,
      };
    },
    [resolveColumn]
  );

  const applyGroupedColumnDefs = useCallback(
    (groupedDefs: GridColumnDef[], enabled: boolean) => {
      if (!enabled) return;
      if (!groupedDefs.length) return;
      if (columnDefsState.length) return;
      setColumnDefs(groupedDefs);
    },
    [columnDefsState.length, setColumnDefs]
  );

  const getGroupedColumnDefs = useCallback(
    (groupedDefs: GridColumnDef[], enabled: boolean) => {
      if (!enabled) return reorderedColumns as GridColumnDef[];
      return (columnDefsState.length ? columnDefsState : groupedDefs) as GridColumnDef[];
    },
    [columnDefsState, reorderedColumns]
  );

  const columnGroupingHelpers = useMemo<UseGridColumnGroupingHelpers>(
    () => ({
      resolveColumn,
      createGroup,
      collectLeafKeys,
      applyGroupedColumnDefs,
      getColumnDefs: getGroupedColumnDefs,
    }),
    [
      resolveColumn,
      createGroup,
      collectLeafKeys,
      applyGroupedColumnDefs,
      getGroupedColumnDefs,
    ]
  );

  const {
    copySelectionToClipboard,
    pasteFromClipboard,
    cutSelection,
    applyCellFormatToSelection,
    clearCellFormatFromSelection,
  } = useGridClipboardCommands({
    selection,
    rowsForGrid,
    reorderedColumns,
    clampSelectionToGrid,
    uniquePreserveOrder,
    uniqueRowIdsPreserveOrder,
    resolveCellValueType,
    pushUndo,
    recalcFormulas,
    setRows,
    setMergedCells,
  });

  const { buildContextMenuConfig: buildContextMenuConfigBase } =
    useGridContextMenuConfig({
    rowsForGridBase,
    allColumns,
    mergeCells,
    unmergeCells,
    addRowsRelativeToSelection,
    deleteRows,
    addColumnsRelativeToSelection,
    deleteColumn,
    copySelectionToClipboard,
    cutSelection,
    pasteFromClipboard,
    applyCellFormatToSelection,
  });
  const buildContextMenuConfig = useCallback(
    (options?: UseGridContextMenuOptions) => {
      if (!contextMenuBaseCapabilityEnabled) {
        return { enabled: false };
      }
      const sanitizedOptions =
        contextMenuCustomizationModule.sanitizeBuilderOptions(options, {
          allowCustomization: contextMenuCustomizationCapabilityEnabled,
        });
      const config = buildContextMenuConfigBase(sanitizedOptions);
      return contextMenuCustomizationModule.sanitizeConfig(config, {
        allowCustomization: contextMenuCustomizationCapabilityEnabled,
      });
    },
    [
      buildContextMenuConfigBase,
      contextMenuBaseCapabilityEnabled,
      contextMenuCustomizationCapabilityEnabled,
      contextMenuCustomizationModule,
    ],
  );

  /* -------- bundle actions -------- */
  const actions: GridActions = useGridActionsBundle({
    updateCell,
    appendRow,
    appendRows,
    prependRows,
    replaceRows,
    deleteRows,
    reorderRows: rowReorderCapabilityEnabled ? reorderRows : () => undefined,
    reorderMultipleRows: reorderCapabilityEnabled
      ? reorderMultipleRows
      : () => undefined,
    moveRowsToGroup: groupingCapabilityEnabled ? moveRowsToGroup : () => undefined,
    updateRowsSelection,
    reorderRowGroups: groupingCapabilityEnabled && reorderCapabilityEnabled
      ? reorderRowGroups
      : () => undefined,
    addColumn,
    deleteColumn,
    reorderColumns: columnReorderCapabilityEnabled
      ? reorderColumns
      : () => undefined,
    updateColumnOrder: columnReorderCapabilityEnabled
      ? updateColumnOrder
      : () => undefined,
    reorderMultipleColumns: reorderCapabilityEnabled
      ? reorderMultipleColumns
      : () => undefined,
    autoSizeColumns,
    updateColumnWidths,
    updateRowHeights,
    columnOrder,
    columnWidths,
    rowHeights,
    setRowHeight,
    columnDefs: columnDefsState,
    setColumnDefs,
    columnHierarchy,
    sortColumn,
    sortDirection,
    sortModel,
    setSortModel,
    setSorting,
    clearSorting,
    activeFilters: sanitizedActiveFilters,
    setActiveFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filtering: filteringState,
    pinnedColumns,
    pinnedRows,
    setPinnedColumns,
    setPinnedRows,
    pinColumn,
    pinColumnAtPosition,
    pinRow,
    pinRowAtPosition,
    pinMultipleRowsAtPosition,
    pinRowAndReorderToPosition,
    pinAndPositionRow,
    pinAndPositionColumn,
    reorderPinnedColumns,
    reorderPinnedRows,
    reorderMultiplePinnedRows,
    selection,
    setSelection,
    clearSelection,
    copySelectionToClipboard,
    pasteFromClipboard,
    cutSelection,
    applyCellFormatToSelection,
    clearCellFormatFromSelection,
    mergedCells,
    setMergedCells,
    updateMergedCellsAfterReorder,
    updateMergedCellsAfterMultiReorder,
    mergeCells,
    unmergeCells,
    spanningProps,
    addRowsRelativeToSelection,
    addColumnsRelativeToSelection,
    buildContextMenuConfig,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    clearData,
    importData,
    exportData,
    exportCSV,
    importCSV,
    importExcel,
    exportExcel,
    resetGridState,
    enableFormulaBar: cfgFormulaBar,
    enableFiltering: cfgFiltering,
    enableCellSpanning: cfgSpanning,
    enableRowGrouping: cfgRowGrouping,
    rowGrouping: rowGroupingOptions,
    horizontalVirtualization: cfgHVirtual,
    verticalVirtualization: cfgVVirtual,
    cellContentVirtualization: cfgCellContentVirt,
    isRowPinning: cfgRowPin,
    isColReorder: cfgColReorder,
    isRowReorder: cfgRowReorder,
    isRowSelection: cfgRowSel,
    sortMode: cfgSortMode,
    selectedRowIds,
    selectedColumnKeys,
    setEnableFormulaBar: setEnableFormulaBarFlag,
    setEnableFiltering: setEnableFilteringFlag,
    setEnableCellSpanning: setEnableCellSpanningFlag,
    setEnableRowGrouping: setEnableRowGroupingFlag,
    setRowGrouping,
    toggleGroupExpansion,
    expandAllGroups,
    collapseAllGroups,
    setHorizontalVirtualization: setHorizontalVirtualizationFlag,
    setVerticalVirtualization: setVerticalVirtualizationFlag,
    setCellContentVirtualization: setCellContentVirtualizationFlag,
    setIsRowPinning: setIsRowPinningFlag,
    setIsColReorder: setIsColReorderFlag,
    setIsRowReorder: setIsRowReorderFlag,
    setIsRowSelection: setIsRowSelectionFlag,
    setSortMode: setSortModeFlag,
    setSelectedRowIds,
    setSelectedColumnKeys,
    featureFlags,
    search: searchState,
    validation: validationState,
    reorderedColumns,
    virtualizationStrategy,
    allowRowReorder,
    pagination: paginationState,
    chart: chartState,
    chartBrush: chartBrushState,
    sparkline: sparklineState,
    pivot: pivotState,
    columnGrouping: columnGroupingHelpers,
    resolveInfiniteScrollEnabled,
    getViewState,
    applyViewState,
    pinningCapabilityEnabled,
    spanningCapabilityEnabled,
  });

  return [displayRows, actions];
};

export const useGrid = (options: UseGridOptions): [GridRow[], GridActions] =>
  useGridInternal(options, "enterprise");
