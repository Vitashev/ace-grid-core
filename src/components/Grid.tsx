import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
} from "react";

import {
  resolveGridCapabilities,
  type GridTierPreset,
} from "../capabilities";
import { useAceGridLicense } from "../license";
import { getGridRuntimeModules } from "../runtime/modules";
import { GRID_SYSTEM_COLUMN_KEYS } from "../types";
import type {
  CellValue,
  GridColumn,
  GridColumnDef,
  GridChartsProps,
  GridHeaderCellSelectionMode,
  GridInfiniteScrollMode,
  GridInfiniteScrollStrategy,
  GridSearchMatch,
  GridServerRowModelProps,
  GridSpanRowIdMergeMode,
  GridSystemColumnId,
  GridProps,
  GridPivotProps,
  GridRow,
  GridTreeDataProps,
  GridMergedCell,
  GridRowGroup as RowGroupType,
} from "../types";
import { cx } from "../utils/cx";

// import { GridCell } from "./GridCell";
// import { CellEditor } from "../features/edit/components/CellEditor";
import {
  useColumnLookups,
  useColumnWidthResolver,
  useSystemColumns,
  useColumnPartitions,
} from "../features/columns";
import {
  useColumnGroups,
  type ColumnGroupDropPlacement,
} from "../features/column-groups";
import {
} from "../features/edit";
import { useSorting } from "../features/sorting";
import { useLatestRef } from "../features/refs";
import { useResize, useRowResize, useResizeStyles } from "../features/resize";
import {
  useColumnSelection,
  useSsrmSelectionController,
} from "../features/selection";
import { getSsrmLeafRoute } from "../features/selection/ssrmSelectionState";
import { useInjectStyles } from "../features/styling";
import { GridThemeProvider, resolveTheme } from "../features/theming";
import { useGridInteractionController } from "../features/interaction/hooks/useGridInteractionController";
import {
  GridSearchProvider,
  hasSearchMatch,
  resolveGridSearch,
  type SearchActiveMatch,
} from "../features/search";
import { formatCellValue } from "../features/cell-format";
import { primeCompiledCellFormat } from "../features/cell-format/compiledCellFormat";
import { useGridLayoutMetrics } from "../features/layout/hooks/useGridLayoutMetrics";
import { useInfiniteScroll } from "../features/scroll";
import { usePagination, useGridPaginationSlice } from "../features/pagination";
import {
  // CELL_BORDER,
  // EDIT_BORDER,
  isSystemCol,
} from "../features/cell-selection";
import {
  type RowSelectSelectionMetrics,
} from "../features/selection/components/RowSelectCell";
// import { GridHeaderSection } from "./GridHeaderSection";
// import { OffsetCell } from "../features/virtual/components/OffsetCell";
// import { SystemCell } from "../features/columns/components/SystemCell";
import {
  type GridContextMenuConfig,
} from "../features/context-menu";
import { useGridSelectionHandlers } from "../hooks/useGridSelectionHandlers";
import {
  GridStoreProvider,
  useGridStoreApi,
  useGridEditingCell,
  useGridFormulaBarValue,
  useGridScrollState,
} from "../features/grid-store";
import { CenterBody } from "./CenterBody";
import { GRID_BASE_CSS } from "./gridBaseCss";
import { useGridFormulaBarSyncEffect } from "./internal/useGridFormulaBarSyncEffect";
import { useGridDnDBridge } from "./internal/useGridDnDBridge";
import { useGridEditingBridge } from "./internal/useGridEditingBridge";
import { GridHeaderLayer } from "./internal/GridHeaderLayer";
import { GridPinnedRowGroupsLayer } from "./internal/GridPinnedRowGroupsLayer";
import { useGridInfiniteScrollLoaderNodes } from "./internal/useGridInfiniteScrollLoaderNodes";
import { useGridPinnedStyle } from "./internal/useGridPinnedStyle";
import { useGridRootPresentationState } from "./internal/useGridRootPresentationState";
import { useGridSelectionPresentationState } from "./internal/useGridSelectionPresentationState";
import { useGridSharedRowViewProps } from "./internal/useGridSharedRowViewProps";
import { GridSupplementaryOverlays } from "./internal/GridSupplementaryOverlays";
import { GridViewportShell } from "./internal/GridViewportShell";
import { useGridVisualColumnsState } from "./internal/useGridVisualColumnsState";
import { useGridSearchNavigationEffect } from "./internal/useGridSearchNavigationEffect";
import { useGridSearchResultsCountEffect } from "./internal/useGridSearchResultsCountEffect";
import { useGridSelectionMirrorHandlers } from "./internal/useGridSelectionMirrorHandlers";
import { useGridSortPinActions } from "./internal/useGridSortPinActions";
import { useGridVisualRowsState } from "./internal/useGridVisualRowsState";
import { useGridViewportOffsetsState } from "./internal/useGridViewportOffsetsState";
import { useGridViewportScrollActions } from "./internal/useGridViewportScrollActions";
import { GridFormulaBar, GridPaginationArea } from "./GridOverlays";
import {
  EMPTY_COLUMNS,
  EMPTY_FILTERS,
  EMPTY_MERGED_CELLS,
  EMPTY_PINNED_ROWS,
  EMPTY_ROWS,
  EMPTY_STRING_ARRAY,
  flattenLeafColumns,
  normalizeMergedCells,
  normalizePaginationIcons,
  stringArraysEqual,
} from "./gridUtils";
/* =======================================================
   components/Grid (main UI)
   ======================================================= */

type FormulaHighlightRange = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  color: string;
};

type IndexedSearchCell = {
  columnKey: string;
  columnIndex: number;
  text: string;
};

type IndexedSearchRow = {
  absRowIndex: number;
  row: GridRow;
  rowId: string | number;
  cells: IndexedSearchCell[];
};

type SearchIncrementalState = {
  rowsRef: GridRow[];
  columnsRef: GridColumn[];
  mode: "filter" | "highlight";
  query: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  matchedAbsRows: number[];
};

const EMPTY_INDEXED_SEARCH_ROWS: IndexedSearchRow[] = [];
const EMPTY_SEARCH_MATCHES: GridSearchMatch[] = [];
const EMPTY_ROW_GROUPS: RowGroupType[] = [];
type SystemColumnCssWidths = Partial<Record<GridSystemColumnId, number>>;

const SYSTEM_COLUMN_IDS: GridSystemColumnId[] = [
  "rowIndex",
  "rowDetail",
  "rowPinning",
  "rowOrdering",
  "rowSelection",
];

const SYSTEM_COLUMN_WIDTH_CSS_VARS: Record<GridSystemColumnId, string> = {
  rowIndex: "--ace-grid-system-col-width-row-index",
  rowDetail: "--ace-grid-system-col-width-row-detail",
  rowPinning: "--ace-grid-system-col-width-row-pinning",
  rowOrdering: "--ace-grid-system-col-width-row-ordering",
  rowSelection: "--ace-grid-system-col-width-row-selection",
};

const parseCssWidth = (value: string): number | null => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const readSystemColumnCssWidths = (
  element: HTMLElement | null,
): SystemColumnCssWidths => {
  if (!element || typeof window === "undefined") return {};
  const styles = window.getComputedStyle(element);
  const widths: SystemColumnCssWidths = {};
  SYSTEM_COLUMN_IDS.forEach((id) => {
    const parsed = parseCssWidth(
      styles.getPropertyValue(SYSTEM_COLUMN_WIDTH_CSS_VARS[id]),
    );
    if (parsed != null) widths[id] = parsed;
  });
  return widths;
};

const areSystemColumnCssWidthsEqual = (
  a: SystemColumnCssWidths,
  b: SystemColumnCssWidths,
) => SYSTEM_COLUMN_IDS.every((id) => a[id] === b[id]);

type InternalGridProps = GridProps & {
  __runtimeTier?: GridTierPreset;
};

const GridImpl: React.FC<InternalGridProps> = ({
  __runtimeTier = "enterprise",
  data: { rows: rawRows, columns: columnDefs },
  layout: {
    width,
    height,
    rowHeight = 32,
    headerHeight = 40,
    stickyHeader = true,
    className,
    style,
  },
  theming: themeBag,
  columns: {
    columnWidths,
    fillWidth: fillColumnWidth = false,
    systemColumns: systemColumnsConfig,
  },
  columnGrouping: columnGroupingProps = {},
  keyedHeaders: keyedHeadersPropRaw = {},
  rowsConfig: { rowHeights = {} } = {},
  virtual: {
    enableVirtualization = true,
    enableHorizontalVirtualization = true,
    enableCellContentVirtualization = false,
    rowBufferPx,
    columnBufferPx,
  } = {},
  formula: { enableFormulaBar: enableFormulaBarProp = true } = {},
  selection: {
    selection,
    enableCellSelection = true,
    isRowSelection = true,
    isColSelection = true,
    groupSelects: clientGroupSelects,
    selectEntireRowOnSelection = true,
    selectEntireColumnOnSelection = true,
    rowCellSelectionMode = "range",
    columnCellSelectionMode = "range",
    rowCellSelectionIncludeSpans = true,
    columnCellSelectionIncludeSpans = true,
    fillHandle: fillHandleConfig,
    onSelectionRangeChange,
    onRowSelectionChange,
    onColumnSelectionChange,
    onCellClick,
    onCellDoubleClick,
  } = {},
  clipboard: {
    enabled: clipboardEnabled = true,
    enableKeyboardShortcuts = true,
    onCopy: onClipboardCopy,
    onCut: onClipboardCut,
    onPaste: onClipboardPaste,
  } = {},
  edit: { isCellEditing = true, onCellChange, applySelectionFillRequest } = {},
  validation: validationPropsRaw = {},
  filter: {
    filterMode: filterModeProp = "client",
    activeFilters: activeFiltersProp = [],
    onFilter: onFilterProp,
    enableFloatingFilters: enableFloatingFiltersProp = false,
    floatingFilterHeight,
    floatingFilterDebounceMs = 150,
    enableAdvancedMultiFilter: enableAdvancedMultiFilterProp = false,
    renderColumnFilterPanel,
    renderFloatingFilterCell,
  } = {},
  sorting: {
    sortMode: sortModeProp = "client",
    sortColumn: sortColumnProp = null,
    sortDirection: sortDirectionProp = null,
    sortModel: sortModelProp,
    enableMultiSort: enableMultiSortProp = true,
    onSort,
    onSortModelChange,
    multiSortKey = "shift",
  } = {},
  search: searchPropsRaw = {},
  pinning: {
    isRowPinning: isRowPinningProp = true,
    isColPinning: isColPinningProp = true,
    pinnedColumns: pinnedColumnsProp = { left: [], right: [] },
    pinnedRows: pinnedRowsProp = { top: [], bottom: [] },
    onPinColumn,
    onPinColumnAtPosition,
    onPinAndPositionColumn,
    onPinnedColumnReorder,
    onPinRow,
    onPinRowAtPosition,
    onPinAndPositionRow,
    onPinMultipleRowsAtPosition,
    onPinnedRowReorder,
    onReorderMultiplePinnedRows,
    renderRowPinCell,
  } = {},
  reorder: {
    isColReorder: isColReorderProp = true,
    isRowReorder: isRowReorderProp = true,
    onColumnReorder,
    onRowReorder,
    onMultiRowReorder,
    onMultiColumnReorder,
    onUpdateColumnOrder,
    onColumnGroupsChange,
    rowDragSourceId,
    onRowExternalDrop,
  } = {},
  resize: {
    enableColumnResize = true,
    enableRowResize = true,
    onColumnResize,
    onRowResize,
    mode: resizeModeOverride,
    quantize: resizeQuantize,
    heightStep: resizeHeightStep,
    columnResizeThrottle,
    rowResizeThrottle,
    performanceMode,
  } = {},
  spanning: {
    initialMergedCells: mergedCellsProp,
    onMergedCellsChange,
    enableCellSpanning: enableCellSpanningPropInput = true,
    rowIdMergeMode: rowIdMergeModeProp = "compact",
  } = {},
  sparkline: sparklinePropsRaw = {},
  charts: chartsConfigProp = {} as GridChartsProps,
  masterDetail: masterDetailPropsRaw = {},
  rowGrouping: rowGroupingPropsRaw = {},
  pivot: pivotPropsRaw = {} as GridPivotProps,
  treeData: treeDataPropsRaw = {} as GridTreeDataProps,
  contextMenu: contextMenuConfig = {} as GridContextMenuConfig,
  scroll: {
    enableInfiniteScroll = false,
    infiniteScrollBatchSize = 50,
    infiniteScrollThreshold = 240,
    infiniteScrollMode = "bottom",
    infiniteScrollStrategy = "offset",
    infiniteScrollStartIndex = 0,
    infiniteScrollInitialCursor,
    infiniteScrollPaging = false,
    renderInfiniteScrollLoader,
    infiniteScrollTopLoader,
    infiniteScrollBottomLoader,
    infiniteScrollLoader,
    loadMoreRows,
  } = {},
  serverRowModel: serverRowModelPropsRaw = {} as GridServerRowModelProps,
  pagination: {
    enabled: paginationEnabledProp = false,
    mode: paginationMode = "client",
    pageIndex: paginationPageIndex,
    pageSize: paginationPageSize,
    defaultPageIndex: paginationDefaultPageIndex,
    defaultPageSize: paginationDefaultPageSize,
    pageSizeOptions: paginationPageSizeOptions,
    totalRowCount: paginationTotalRowCount,
    cursor: paginationCursor,
    keepPageOnSizeChange: paginationKeepPageOnSizeChange = false,
    showPageSize: paginationShowPageSize = true,
    showRange: paginationShowRange = true,
    showPageInfo: paginationShowPageInfo = true,
    showControls: paginationShowControls = true,
    showFirstLast: paginationShowFirstLast = true,
    position: paginationPosition = "bottom",
    className: paginationClassName,
    style: paginationStyle,
    labels: paginationLabels,
    icons: paginationIconOverrides,
    disabled: paginationDisabled = false,
    renderPagination,
    onPageChange,
    onPageSizeChange,
    onPageRequest,
    onCursorRequest,
  } = {},
  accessibility: {
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
  } = {},
}) => {
  const advancedFilteringModule = getGridRuntimeModules().advancedFiltering;
  const chartsModule = getGridRuntimeModules().charts;
  const columnReorderModule = getGridRuntimeModules().columnReorderBasic;
  const contextMenuBaseModule = getGridRuntimeModules().contextMenuBase;
  const contextMenuCustomizationModule =
    getGridRuntimeModules().contextMenuCustomization;
  const floatingFilterModule = getGridRuntimeModules().floatingFilter;
  const formulaModule = getGridRuntimeModules().formula;
  const masterDetailModule = getGridRuntimeModules().masterDetail;
  const multiSortModule = getGridRuntimeModules().multiSort;
  const pinningModule = getGridRuntimeModules().pinning;
  const reorderModule = getGridRuntimeModules().reorder;
  const rowReorderModule = getGridRuntimeModules().rowReorderBasic;
  const groupingModule = getGridRuntimeModules().grouping;
  const keyedHeadersModule = getGridRuntimeModules().keyedHeaders;
  const pivotModule = getGridRuntimeModules().pivot;
  const sparklineModule = getGridRuntimeModules().sparkline;
  const spanningModule = getGridRuntimeModules().spanning;
  const serverRowModelModule = getGridRuntimeModules().serverRowModel;
  const treeDataModule = getGridRuntimeModules().treeData;
  const validationModule = getGridRuntimeModules().validation;
  const resolvedCapabilities = useMemo(
    () => resolveGridCapabilities({ tier: __runtimeTier }),
    [__runtimeTier],
  );
  const sortingCapabilityEnabled = resolvedCapabilities.has("sort.basic");
  const multiSortCapabilityEnabled =
    multiSortModule.available && resolvedCapabilities.has("sort.multi");
  const filteringCapabilityEnabled = resolvedCapabilities.has("filter.basic");
  const floatingFilterCapabilityEnabled =
    floatingFilterModule.available && resolvedCapabilities.has("filter.floating");
  const advancedFilterCapabilityEnabled =
    advancedFilteringModule.available &&
    resolvedCapabilities.has("filter.advanced");
  const formulaCapabilityEnabled =
    formulaModule.available && resolvedCapabilities.has("formula");
  const pinningCapabilityEnabled =
    pinningModule.available && resolvedCapabilities.has("pinning");
  const reorderCapabilityEnabled =
    reorderModule.available && resolvedCapabilities.has("reorder");
  const columnReorderCapabilityEnabled =
    columnReorderModule.available && resolvedCapabilities.has("reorder.column");
  const rowReorderCapabilityEnabled =
    rowReorderModule.available && resolvedCapabilities.has("reorder.row");
  const spanningCapabilityEnabled =
    spanningModule.available && resolvedCapabilities.has("spanning");
  const validationCapabilityEnabled = resolvedCapabilities.has("validation");
  const keyedHeadersCapabilityEnabled =
    keyedHeadersModule.available &&
    resolvedCapabilities.has("keyedHeaders");
  const contextMenuBaseCapabilityEnabled =
    contextMenuBaseModule.available &&
    resolvedCapabilities.has("contextMenu.base");
  const contextMenuCustomizationCapabilityEnabled =
    contextMenuBaseCapabilityEnabled &&
    contextMenuCustomizationModule.available &&
    resolvedCapabilities.has("contextMenu.customization");
  const searchCapabilityEnabled = resolvedCapabilities.has("search");
  const paginationCapabilityEnabled = resolvedCapabilities.has("pagination");
  const treeDataCapabilityEnabled =
    treeDataModule.available && resolvedCapabilities.has("treeData");
  const groupingCapabilityEnabled =
    groupingModule.available && resolvedCapabilities.has("grouping");
  const sparklineCapabilityEnabled =
    sparklineModule.available && resolvedCapabilities.has("sparkline");
  const chartsCapabilityEnabled =
    chartsModule.available && resolvedCapabilities.has("charts");
  const pivotCapabilityEnabled =
    pivotModule.available && resolvedCapabilities.has("pivot");
  const serverRowModelCapabilityEnabled =
    serverRowModelModule.available &&
    resolvedCapabilities.has("serverRowModel");
  const masterDetailCapabilityEnabled =
    masterDetailModule.available && resolvedCapabilities.has("masterDetail");

  const enableFormulaBar =
    formulaCapabilityEnabled && enableFormulaBarProp;
  const validationProps = validationCapabilityEnabled
    ? validationPropsRaw
    : { ...validationPropsRaw, enabled: false };
  const keyedHeadersProp = keyedHeadersCapabilityEnabled
    ? keyedHeadersPropRaw
    : { ...keyedHeadersPropRaw, enabled: false };
  const filterMode = filteringCapabilityEnabled ? filterModeProp : "client";
  const activeFilters = filteringCapabilityEnabled
    ? advancedFilteringModule.sanitizeFilters(activeFiltersProp, {
        allowAdvanced: advancedFilterCapabilityEnabled,
      })
    : [];
  const onFilter = filteringCapabilityEnabled ? onFilterProp : undefined;
  const enableFloatingFilters =
    floatingFilterCapabilityEnabled && enableFloatingFiltersProp;
  const enableAdvancedMultiFilter =
    advancedFilterCapabilityEnabled && enableAdvancedMultiFilterProp;
  const sortMode = sortingCapabilityEnabled ? sortModeProp : "client";
  const sortColumn = sortingCapabilityEnabled ? sortColumnProp : null;
  const sortDirection = sortingCapabilityEnabled ? sortDirectionProp : null;
  const enableMultiSort =
    multiSortCapabilityEnabled && enableMultiSortProp;
  const searchProps = searchCapabilityEnabled
    ? searchPropsRaw
    : { ...searchPropsRaw, enabled: false, query: "" };
  const resolvedContextMenuConfig = useMemo(
    () =>
      contextMenuBaseCapabilityEnabled
        ? contextMenuCustomizationModule.sanitizeConfig(contextMenuConfig, {
            allowCustomization: contextMenuCustomizationCapabilityEnabled,
          })
        : { enabled: false },
    [
      contextMenuConfig,
      contextMenuBaseCapabilityEnabled,
      contextMenuCustomizationCapabilityEnabled,
      contextMenuCustomizationModule,
    ],
  );
  const isRowPinning = pinningCapabilityEnabled && isRowPinningProp;
  const isColPinning = pinningCapabilityEnabled && isColPinningProp;
  const pinnedColumns = pinningCapabilityEnabled
    ? pinnedColumnsProp
    : { left: [], right: [] };
  const pinnedRows = pinningCapabilityEnabled
    ? pinnedRowsProp
    : { top: [], bottom: [] };
  const isColReorder = columnReorderCapabilityEnabled && isColReorderProp;
  const isRowReorder = rowReorderCapabilityEnabled && isRowReorderProp;
  const enableCellSpanningProp =
    spanningCapabilityEnabled && enableCellSpanningPropInput;
  const sparklineProps = sparklineCapabilityEnabled
    ? sparklinePropsRaw
    : { ...sparklinePropsRaw, enabled: false };
  const chartsConfig = chartsCapabilityEnabled
    ? chartsConfigProp
    : { ...chartsConfigProp, enabled: false };
  const masterDetailProps = masterDetailCapabilityEnabled
    ? masterDetailPropsRaw
    : { ...masterDetailPropsRaw, enabled: false };
  const rowGroupingProps = (groupingCapabilityEnabled
    ? rowGroupingPropsRaw
    : {}) as typeof rowGroupingPropsRaw;
  const pivotProps = pivotCapabilityEnabled
    ? pivotPropsRaw
    : { ...pivotPropsRaw, enabled: false };
  const treeDataProps = treeDataCapabilityEnabled
    ? treeDataPropsRaw
    : { ...treeDataPropsRaw, enabled: false };
  const serverRowModelProps = serverRowModelCapabilityEnabled
    ? serverRowModelPropsRaw
    : ({ ...serverRowModelPropsRaw, enabled: false } as GridServerRowModelProps);
  const paginationEnabled =
    paginationCapabilityEnabled && paginationEnabledProp;

  const gridStore = useGridStoreApi();
  const { scrollTop, scrollLeft } = useGridScrollState();
  const editingCell = useGridEditingCell();
  const formulaBarValue = useGridFormulaBarValue();
  const formulaBarValueRef = useLatestRef(formulaBarValue);
  const gridBodyCellIdBase = useId();
  const gridHeaderCellIdBase = useId();
  const { onColumnGroupToggled } = columnGroupingProps;
  const resolvedRowCellSelectionMode: GridHeaderCellSelectionMode =
    rowCellSelectionMode === "single" || rowCellSelectionMode === "bands"
      ? rowCellSelectionMode
      : "range";
  const resolvedColumnCellSelectionMode: GridHeaderCellSelectionMode =
    columnCellSelectionMode === "single" || columnCellSelectionMode === "bands"
      ? columnCellSelectionMode
      : "range";
  // Resolve theme from grouped theme bag
  const { theme, icons: iconOverrides, inlineStyleOverrides } = themeBag ?? {};
  const resolvedTheme = useMemo(
    () => resolveTheme(theme, iconOverrides, inlineStyleOverrides),
    [theme, iconOverrides, inlineStyleOverrides],
  );
  const { tokens } = resolvedTheme;
  const SparklineProvider = sparklineModule.GridSparklineProvider;
  const formulaHighlightRanges = useMemo<FormulaHighlightRange[]>(() => {
    const raw =
      typeof formulaBarValue === "string" ? formulaBarValue.trim() : "";
    if (!raw.startsWith("=")) return [];
    const ranges = formulaModule.extractFormulaRanges(raw);
    if (!ranges.length) return [];
    const palette = [
      tokens.selectionBorder,
      tokens.successBorder,
      tokens.warningBorder,
      tokens.dangerBorder,
      tokens.infoBorder,
    ];
    return ranges.map((range, index) => ({
      startRow: range.startRow - 1,
      endRow: range.endRow - 1,
      startCol: range.startCol - 1,
      endCol: range.endCol - 1,
      color: palette[index % palette.length],
    }));
  }, [
    formulaModule,
    formulaBarValue,
    tokens.dangerBorder,
    tokens.infoBorder,
    tokens.selectionBorder,
    tokens.successBorder,
    tokens.warningBorder,
  ]);

  useResizeStyles();

  const normalizedRowHeights = useMemo(() => {
    const map: Record<string, number> = {};
    if (rowHeights) {
      Object.entries(rowHeights).forEach(([key, value]) => {
        map[String(key)] = value;
      });
    }
    return map;
  }, [rowHeights]);
  const hasCustomRowHeights = Object.keys(normalizedRowHeights).length > 0;

  const rowHeightOf = useCallback(
    (id: string | number) => {
      const key = typeof id === "string" ? id : String(id);
      const override = normalizedRowHeights[key];
      return override != null ? override : rowHeight;
    },
    [normalizedRowHeights, rowHeight],
  );

  const rawMasterDetailEnabled = Boolean(masterDetailProps?.enabled);
  const masterDetailServerRowModelEnabled = Boolean(
    masterDetailProps?.enableServerRowModel,
  );
  const chartsEnabled = chartsConfig.enabled ?? false;
  const keyedHeadersEnabled = keyedHeadersProp.enabled ?? false;
  const keyedHeaderColumns = keyedHeadersProp.columns;
  const keyedHeaderRows = keyedHeadersProp.rows;
  const keyedColumnsEnabled =
    keyedHeadersEnabled && (keyedHeaderColumns?.enabled ?? true);
  const keyedRowsEnabled =
    keyedHeadersEnabled && (keyedHeaderRows?.enabled ?? true);
  const floatingFiltersEnabled =
    Boolean(floatingFilterModule.FloatingFilterRow) &&
    enableFloatingFilters &&
    Boolean(onFilter);
  const interactiveFilters = onFilter ? activeFilters : EMPTY_FILTERS;
  const resolvedAriaLabel = ariaLabel ?? "Ace Grid";

  // Inject CSS
  useInjectStyles("flexbox-grid-base", GRID_BASE_CSS);
  useInjectStyles(resolvedTheme.styleElementId, resolvedTheme.cssText);
  useInjectStyles(
    "flexbox-grid-chart",
    chartsEnabled ? chartsModule.chartCss : "",
  );

  const sourceLeafColumns = useMemo(
    () => flattenLeafColumns(columnDefs),
    [columnDefs],
  );
  const sourceColumnKeys = useMemo(
    () =>
      sourceLeafColumns
        .map((column) => (typeof column.key === "string" ? column.key : ""))
        .filter((key) => key.length > 0),
    [sourceLeafColumns],
  );
  const sourceColumnKeySet = useMemo(
    () => new Set(sourceColumnKeys),
    [sourceColumnKeys],
  );
  const serverColumnModelKey = useMemo(
    () => sourceColumnKeys.map((key, index) => `${index}:${key}`).join("|"),
    [sourceColumnKeys],
  );

  const resolvedMultiSortKey: "shift" | "meta" | "ctrl" | "alt" | "none" =
    (enableMultiSort ? multiSortKey : "none") as
      | "shift"
      | "meta"
      | "ctrl"
      | "alt"
      | "none";

  const effectiveSortModel = useMemo(() => {
    if (!sortingCapabilityEnabled) return [];
    const base = Array.isArray(sortModelProp) ? sortModelProp : [];
    if (base.length) {
      return multiSortModule.normalizeSortModel(base, {
        allowMultiSort: multiSortCapabilityEnabled,
      });
    }
    if (sortColumn && sortDirection) {
      return [{ columnKey: sortColumn, direction: sortDirection }];
    }
    return [];
  }, [
    sortModelProp,
    sortColumn,
    sortDirection,
    multiSortCapabilityEnabled,
    multiSortModule,
    sortingCapabilityEnabled,
  ]);
  const serverSortModel = useMemo(
    () =>
      effectiveSortModel.filter((entry) =>
        sourceColumnKeySet.has(entry.columnKey),
      ),
    [effectiveSortModel, sourceColumnKeySet],
  );
  const serverFilterModel = useMemo(
    () =>
      activeFilters.filter(
        (filter) =>
          filter &&
          typeof filter.columnKey === "string" &&
          sourceColumnKeySet.has(filter.columnKey),
      ),
    [activeFilters, sourceColumnKeySet],
  );

  const normalizedServerRowModel = useMemo(
    () => serverRowModelModule.normalizeGridServerRowModelConfig(serverRowModelProps),
    [serverRowModelModule, serverRowModelProps],
  );
  const normalizedServerGrouping = normalizedServerRowModel.grouping;
  const normalizedServerTreeData = normalizedServerRowModel.treeData;
  const normalizedServerPivot = normalizedServerRowModel.pivot;
  const serverRowModelEnabled = normalizedServerRowModel.enabled;
  const serverTreeDataEnabled = Boolean(
    serverRowModelEnabled && normalizedServerTreeData.enabled,
  );
  const ssrmPaginationCompatibilityEnabled = Boolean(
    serverRowModelEnabled && normalizedServerRowModel.pagination?.enabled,
  );
  const ssrmPaginationActive =
    ssrmPaginationCompatibilityEnabled && paginationEnabled;
  const serverLoadingCellRenderer = serverRowModelProps?.loadingCellRenderer;
  const clientPivotGroupColumns = useMemo(
    () => serverRowModelModule.normalizeGridServerRequestColumns(pivotProps?.groupColumns),
    [serverRowModelModule, pivotProps?.groupColumns],
  );
  const clientPivotColumns = useMemo(
    () => serverRowModelModule.normalizeGridServerRequestColumns(pivotProps?.pivotColumns),
    [serverRowModelModule, pivotProps?.pivotColumns],
  );
  const clientPivotValueColumns = useMemo(
    () => serverRowModelModule.normalizeGridServerPivotValueColumns(pivotProps?.valueColumns),
    [serverRowModelModule, pivotProps?.valueColumns],
  );
  const clientPivotEnabled = Boolean(
    !serverRowModelEnabled &&
    (pivotProps?.enabled ?? false) &&
    (pivotProps?.pivotMode ?? true) &&
    clientPivotColumns.length > 0 &&
    clientPivotValueColumns.length > 0,
  );
  const clientPivotDataset = useMemo(() => {
    if (!clientPivotEnabled) return null;
    return pivotModule.buildClientPivotDataset({
      rows: rawRows,
      columns: sourceLeafColumns,
      groupColumns: clientPivotGroupColumns,
      pivotColumns: clientPivotColumns,
      valueColumns: clientPivotValueColumns,
      resultFieldSeparator: pivotProps?.resultFieldSeparator,
    });
  }, [
    clientPivotColumns,
    clientPivotEnabled,
    clientPivotGroupColumns,
    clientPivotValueColumns,
    pivotModule,
    pivotProps?.resultFieldSeparator,
    rawRows,
    sourceLeafColumns,
  ]);
  const clientPivotResultFields =
    clientPivotDataset?.pivotResultFields ?? EMPTY_STRING_ARRAY;
  const clientTreePathResolver = useMemo(() => {
    return treeDataModule.resolveGridTreeDataPathResolver(treeDataProps);
  }, [
    treeDataModule,
    treeDataProps?.getDataPath,
    treeDataProps?.pathField,
    treeDataProps?.pathSeparator,
  ]);
  const clientTreePathColumnKeys = useMemo(() => {
    const resolved = treeDataModule.resolveGridTreeDataPathColumnKeys(
      sourceColumnKeySet,
      treeDataProps
    );
    return resolved.length ? resolved : EMPTY_STRING_ARRAY;
  }, [
    treeDataModule,
    sourceColumnKeySet,
    treeDataProps?.pathColumnKeys,
    treeDataProps?.pathField,
  ]);
  const clientTreePathColumnKey = useMemo(
    () => clientTreePathColumnKeys.join("|"),
    [clientTreePathColumnKeys],
  );
  const clientRowsContainGroupMeta = useMemo(
    () => rawRows.some((row) => Boolean(row.meta?.group)),
    [rawRows],
  );
  const clientTreeDataEnabled = Boolean(
    !serverRowModelEnabled &&
    (treeDataProps?.enabled ?? false) &&
    !clientPivotEnabled &&
    clientTreePathResolver &&
    !clientRowsContainGroupMeta,
  );
  const [clientTreeExpansion, setClientTreeExpansion] = useState<
    Map<string, boolean>
  >(() => new Map());
  useEffect(() => {
    setClientTreeExpansion((prev) => (prev.size > 0 ? new Map() : prev));
  }, [
    clientTreeDataEnabled,
    clientTreePathColumnKey,
    treeDataProps?.pathField,
    treeDataProps?.pathSeparator,
    treeDataProps?.groupColumnKey,
    treeDataProps?.defaultExpanded,
  ]);
  const clientTreeModel = useMemo(() => {
    if (!clientTreeDataEnabled || !clientTreePathResolver) return null;
    return treeDataModule.buildTreeDataModel({
      rows: rawRows,
      columns: sourceLeafColumns,
      getDataPath: clientTreePathResolver,
      pathColumnKeys: clientTreePathColumnKeys,
      expansion: clientTreeExpansion,
      defaultExpanded: treeDataProps?.defaultExpanded,
      groupColumnKey: treeDataProps?.groupColumnKey,
    });
  }, [
    clientTreeDataEnabled,
    clientTreeExpansion,
    clientTreePathColumnKeys,
    clientTreePathResolver,
    rawRows,
    sourceLeafColumns,
    treeDataModule,
    treeDataProps?.defaultExpanded,
    treeDataProps?.groupColumnKey,
  ]);
  const clientTreeRows = clientTreeModel?.rows ?? rawRows;
  const [serverGroupExpansion, setServerGroupExpansion] = useState<
    Record<string, boolean>
  >({});
  const [showGlobalLoadingIndicator, setShowGlobalLoadingIndicator] =
    useState(false);

  const serverGroupingColumns = normalizedServerGrouping.columns;
  const serverGroupingEnabled = Boolean(
    serverRowModelEnabled &&
    !serverTreeDataEnabled &&
    normalizedServerGrouping.enabled &&
    serverGroupingColumns.length > 0,
  );
  const serverPivotGroupColumns = normalizedServerPivot.groupColumns;
  const serverPivotColumns = normalizedServerPivot.pivotColumns;
  const serverPivotValueColumns = normalizedServerPivot.valueColumns;
  const serverPivotEnabled = Boolean(
    serverRowModelEnabled &&
    normalizedServerPivot.enabled &&
    normalizedServerPivot.pivotMode &&
    serverPivotColumns.length > 0 &&
    serverPivotValueColumns.length > 0,
  );
  const serverGroupingRequest = useMemo(() => {
    return serverRowModelModule.buildServerGroupingRequest({
      enabled: serverGroupingEnabled,
      columns: serverGroupingColumns,
      groupColumnKey: normalizedServerGrouping.groupColumnKey,
      defaultExpanded: normalizedServerGrouping.defaultExpanded,
      expansion: serverGroupExpansion,
    });
  }, [
    serverGroupingEnabled,
    serverGroupingColumns,
    normalizedServerGrouping.groupColumnKey,
    normalizedServerGrouping.defaultExpanded,
    serverRowModelModule,
    serverGroupExpansion,
  ]);
  const serverGroupingRequestKey = useMemo(
    () => JSON.stringify(serverGroupingRequest ?? null),
    [serverGroupingRequest],
  );
  const serverTreeDataRequest = useMemo(() => {
    return serverRowModelModule.buildServerTreeDataRequest({
      enabled: serverTreeDataEnabled,
      groupColumnKey: normalizedServerTreeData.groupColumnKey,
      defaultExpanded: normalizedServerTreeData.defaultExpanded,
      expansion: serverGroupExpansion,
    });
  }, [
    serverTreeDataEnabled,
    normalizedServerTreeData.groupColumnKey,
    normalizedServerTreeData.defaultExpanded,
    serverRowModelModule,
    serverGroupExpansion,
  ]);
  const serverTreeDataRequestKey = useMemo(
    () => JSON.stringify(serverTreeDataRequest ?? null),
    [serverTreeDataRequest],
  );
  const serverPivotRequest = useMemo(() => {
    return serverRowModelModule.buildServerPivotRequest({
      enabled: serverPivotEnabled,
      groupColumns: serverPivotGroupColumns,
      pivotColumns: serverPivotColumns,
      valueColumns: serverPivotValueColumns,
      pivotMode: normalizedServerPivot.pivotMode,
      resultFieldSeparator: normalizedServerPivot.resultFieldSeparator,
    });
  }, [
    serverPivotGroupColumns,
    serverPivotColumns,
    serverPivotEnabled,
    serverPivotValueColumns,
    normalizedServerPivot.pivotMode,
    normalizedServerPivot.resultFieldSeparator,
    serverRowModelModule,
  ]);
  const serverPivotRequestKey = useMemo(
    () => JSON.stringify(serverPivotRequest ?? null),
    [serverPivotRequest],
  );
  const serverHierarchyConfigKey = useMemo(
    () =>
      serverRowModelModule.buildServerHierarchyConfigKey({
        groupingEnabled: serverGroupingEnabled,
        groupingColumns: serverGroupingColumns,
        groupingGroupColumnKey: normalizedServerGrouping.groupColumnKey,
        groupingDefaultExpanded: normalizedServerGrouping.defaultExpanded,
        treeDataEnabled: serverTreeDataEnabled,
        treeDataGroupColumnKey: normalizedServerTreeData.groupColumnKey,
        treeDataDefaultExpanded: normalizedServerTreeData.defaultExpanded,
      }),
    [
      serverGroupingColumns,
      serverGroupingEnabled,
      serverRowModelModule,
      normalizedServerGrouping.groupColumnKey,
      normalizedServerGrouping.defaultExpanded,
      serverTreeDataEnabled,
      normalizedServerTreeData.groupColumnKey,
      normalizedServerTreeData.defaultExpanded,
    ],
  );

  const serverHierarchyEnabled = serverGroupingEnabled || serverTreeDataEnabled;

  const serverRowModelState = serverRowModelModule.useServerRowModel({
    enabled: serverRowModelEnabled,
    rowCount: normalizedServerRowModel.rowCount,
    blockSize: normalizedServerRowModel.blockSize,
    maxBlocksInCache: normalizedServerRowModel.maxBlocksInCache,
    prefetchBlocks: ssrmPaginationActive
      ? 0
      : normalizedServerRowModel.prefetchBlocks,
    debounceMs: normalizedServerRowModel.debounceMs,
    getRows: serverRowModelProps?.getRows ?? (async () => ({ rows: [] })),
    getRowId: serverRowModelProps?.getRowId,
    onError: serverRowModelProps?.onError,
    onPivotResultFieldsChange: serverRowModelProps?.onPivotResultFieldsChange,
    sortModel: serverSortModel,
    filterModel: serverFilterModel,
    groupingRequest: serverGroupingRequest,
    treeDataRequest: serverTreeDataRequest,
    pivotRequest: serverPivotRequest,
    columnModelKey: serverColumnModelKey,
  });
  const { suppressNextGlobalLoadingIndicator } = serverRowModelModule.useSsrmLoadingUiState({
    serverRowModelEnabled,
    ssrmIsLoading: serverRowModelState.isLoading,
    showGlobalLoadingIndicator,
    setShowGlobalLoadingIndicator,
  });
  const {
    handleServerGroupToggle,
    resolveServerGroupExpandedState,
    isServerGroupTogglePending,
    hasPendingServerGroupCollapse,
    ssrmPendingPlaceholderOverlay,
    ssrmCollapsedPlaceholderMaskRowCacheRef,
    getSsrmPendingPlaceholderRow,
    ssrmViewRowCount,
  } = serverRowModelModule.useSsrmGroupToggleOverlay({
    serverHierarchyEnabled,
    serverRowModelEnabled,
    serverGroupExpansion,
    setServerGroupExpansion,
    ssrmPaginationActive,
    hierarchicalStoresActive: serverRowModelState.hierarchicalStoresActive,
    ssrmRowCount: serverRowModelState.rowCount,
    ssrmIsLoading: serverRowModelState.isLoading,
    ssrmVersion: serverRowModelState.version,
    getSsrmRow: serverRowModelState.getRow,
    serverHierarchyConfigKey,
    onSuppressNextGlobalLoading: suppressNextGlobalLoadingIndicator,
  });

  const resolvedOnToggleGroupRow = useCallback(
    (
      path: string,
      expanded: boolean,
      meta?: {
        rowIndex?: number;
        childCount?: number;
        level?: number;
        visibleDescendantCount?: number;
      },
    ) => {
      if (serverHierarchyEnabled) {
        handleServerGroupToggle(path, expanded, meta);
        return;
      }
      if (clientTreeDataEnabled) {
        setClientTreeExpansion((prev) => {
          const next = new Map(prev);
          const defaultExpanded = treeDataProps?.defaultExpanded !== false;
          if (expanded === defaultExpanded) {
            next.delete(path);
          } else {
            next.set(path, expanded);
          }
          return next;
        });
      }
      rowGroupingProps.onToggleGroup?.(path, expanded);
    },
    [clientTreeDataEnabled, handleServerGroupToggle, rowGroupingProps, serverHierarchyEnabled, treeDataProps?.defaultExpanded],
  );

  const resolveSsrmDisplayRowIndex = useCallback(
    (displayIndex: number) =>
      serverRowModelModule.resolveSsrmDisplayRowIndex(
        displayIndex,
        ssrmPendingPlaceholderOverlay,
        serverRowModelState.rowCount,
      ),
    [serverRowModelModule, serverRowModelState.rowCount, ssrmPendingPlaceholderOverlay],
  );

  const mapSsrmBaseRowIndexToDisplay = useCallback(
    (baseRowIndex: number) =>
      serverRowModelModule.mapSsrmBaseRowIndexToDisplay(
        baseRowIndex,
        ssrmPendingPlaceholderOverlay,
      ),
    [serverRowModelModule, ssrmPendingPlaceholderOverlay],
  );

  const serverPivotResultFields = useMemo(() => {
    if (!serverRowModelEnabled || !serverPivotEnabled)
      return EMPTY_STRING_ARRAY;
    const fields = serverRowModelState.pivotResultFields;
    return fields.length > 0 ? fields : EMPTY_STRING_ARRAY;
  }, [
    serverPivotEnabled,
    serverRowModelEnabled,
    serverRowModelState.pivotResultFields,
  ]);

  const serverPivotColumnDefs = useMemo(() => {
    if (!serverRowModelEnabled || !serverPivotEnabled) return null;
    if (serverPivotResultFields.length === 0) return null;
    return pivotModule.buildPivotColumnsFromFields({
      sourceColumns: sourceLeafColumns,
      groupColumns: serverPivotGroupColumns,
      pivotResultFields: serverPivotResultFields,
    });
  }, [
    pivotModule,
    serverPivotEnabled,
    serverPivotGroupColumns,
    serverPivotResultFields,
    serverRowModelEnabled,
    sourceLeafColumns,
  ]);

  const effectiveColumnDefs = useMemo<GridColumnDef[]>(() => {
    if (clientPivotEnabled && clientPivotDataset) {
      return clientPivotDataset.columns;
    }
    if (serverPivotColumnDefs) {
      return serverPivotColumnDefs;
    }
    return columnDefs;
  }, [
    clientPivotDataset,
    clientPivotEnabled,
    columnDefs,
    serverPivotColumnDefs,
  ]);

  const columnGroupingState = useColumnGroups(effectiveColumnDefs);

  const columns = columnGroupingState.visibleLeafColumns;
  const baseRows = serverRowModelEnabled
    ? EMPTY_ROWS
    : (clientPivotDataset?.rows ?? clientTreeRows);

  const resolvedSearch = useMemo(
    () => resolveGridSearch(searchProps),
    [searchProps],
  );

  const searchColumns = useMemo(() => {
    if (!resolvedSearch.columns || resolvedSearch.columns.length === 0) {
      return columns;
    }
    const lookup = new Set(resolvedSearch.columns);
    return columns.filter((col) => lookup.has(col.key));
  }, [columns, resolvedSearch.columns]);
  const columnIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
      map.set(columns[columnIndex].key, columnIndex);
    }
    return map;
  }, [columns]);

  const searchNavigationEnabled = Boolean(
    searchProps?.activeMatchIndex != null ||
    searchProps?.onResultsCountChange ||
    searchProps?.onActiveMatchChange,
  );
  const searchIndexRequired = Boolean(
    !serverRowModelEnabled &&
    resolvedSearch.matcher &&
    (resolvedSearch.mode === "filter" || searchNavigationEnabled),
  );
  const indexedSearchRows = useMemo(() => {
    if (!searchIndexRequired || !baseRows.length || !searchColumns.length) {
      return EMPTY_INDEXED_SEARCH_ROWS;
    }
    return baseRows.map((row, absRowIndex) => {
      const cells: IndexedSearchCell[] = [];
      for (
        let columnIndex = 0;
        columnIndex < searchColumns.length;
        columnIndex += 1
      ) {
        const column = searchColumns[columnIndex];
        const cell = row.data[column.key];
        if (!cell) continue;
        cells.push({
          columnKey: column.key,
          columnIndex: columnIndexByKey.get(column.key) ?? columnIndex,
          text: formatCellValue(column, cell.value, cell.format),
        });
      }
      return {
        absRowIndex,
        row,
        rowId: row.id,
        cells,
      };
    });
  }, [baseRows, columnIndexByKey, searchColumns, searchIndexRequired]);
  const searchIncrementalStateRef = useRef<SearchIncrementalState | null>(null);

  const lastClientPivotResultFieldsRef = useRef<string[]>(EMPTY_STRING_ARRAY);

  useEffect(() => {
    if (serverRowModelEnabled) return;
    const onPivotResultFieldsChange = pivotProps?.onPivotResultFieldsChange;
    if (!onPivotResultFieldsChange) return;
    if (
      stringArraysEqual(
        lastClientPivotResultFieldsRef.current,
        clientPivotResultFields,
      )
    ) {
      return;
    }
    lastClientPivotResultFieldsRef.current = clientPivotResultFields.slice();
    onPivotResultFieldsChange(clientPivotResultFields);
  }, [
    clientPivotResultFields,
    pivotProps?.onPivotResultFieldsChange,
    serverRowModelEnabled,
  ]);

  const masterDetailEnabled =
    rawMasterDetailEnabled &&
    (!serverRowModelEnabled || masterDetailServerRowModelEnabled);
  const effectiveRowPinning = serverRowModelEnabled ? false : isRowPinning;
  const effectiveRowReorder = serverRowModelEnabled ? false : isRowReorder;
  const effectiveVirtualization = serverRowModelEnabled
    ? true
    : enableVirtualization;
  const effectivePinnedRows = useMemo(
    () => (serverRowModelEnabled ? EMPTY_PINNED_ROWS : pinnedRows),
    [pinnedRows, serverRowModelEnabled],
  );
  const effectivePaginationMode: "client" | "server" | "cursor" =
    ssrmPaginationCompatibilityEnabled
      ? "server"
      : (paginationMode as "client" | "server" | "cursor");
  const effectivePaginationEnabled = ssrmPaginationCompatibilityEnabled
    ? paginationEnabled
    : serverRowModelEnabled
      ? false
      : paginationEnabled;

  const rowModelForView = useMemo(() => {
    if (!serverRowModelEnabled) return undefined;
    if (serverRowModelState.hierarchicalStoresActive) {
      return {
        getRow: (index: number) => {
          const row = serverRowModelState.getRow(index);
          if (!hasPendingServerGroupCollapse || !row.meta?.loading) {
            return row;
          }
          const cacheKey = String(row.id);
          const cached =
            ssrmCollapsedPlaceholderMaskRowCacheRef.current.get(cacheKey);
          if (cached) return cached;
          const masked: GridRow = {
            ...row,
            meta: {
              ...(row.meta ?? {}),
              loading: false,
            },
          };
          ssrmCollapsedPlaceholderMaskRowCacheRef.current.set(cacheKey, masked);
          return masked;
        },
        version: serverRowModelState.version,
        rowCount: ssrmViewRowCount,
      };
    }
    if (!ssrmPendingPlaceholderOverlay) {
      return {
        getRow: serverRowModelState.getRow,
        version: serverRowModelState.version,
        rowCount: ssrmViewRowCount,
      };
    }
    return {
      getRow: (index: number) => {
        const resolved = resolveSsrmDisplayRowIndex(index);
        if (resolved.kind === "base") {
          return serverRowModelState.getRow(resolved.baseIndex);
        }
        return getSsrmPendingPlaceholderRow(resolved.event, resolved.offset);
      },
      version: serverRowModelState.version,
      rowCount: ssrmViewRowCount,
    };
  }, [serverRowModelEnabled, serverRowModelState, ssrmPendingPlaceholderOverlay, ssrmViewRowCount, hasPendingServerGroupCollapse, ssrmCollapsedPlaceholderMaskRowCacheRef, resolveSsrmDisplayRowIndex, getSsrmPendingPlaceholderRow]);

  const { rows, searchMatches } = useMemo(() => {
    const matcher = resolvedSearch.matcher;
    const shouldFilterRows =
      Boolean(matcher) &&
      resolvedSearch.enabled &&
      resolvedSearch.mode === "filter" &&
      !serverRowModelEnabled;
    const shouldCollectMatches = Boolean(matcher) && searchNavigationEnabled;

    if (!matcher || (!shouldFilterRows && !shouldCollectMatches)) {
      searchIncrementalStateRef.current = null;
      return {
        rows: baseRows,
        searchMatches: EMPTY_SEARCH_MATCHES,
      };
    }

    if (!indexedSearchRows.length) {
      searchIncrementalStateRef.current = null;
      return {
        rows: shouldFilterRows ? EMPTY_ROWS : baseRows,
        searchMatches: EMPTY_SEARCH_MATCHES,
      };
    }

    const prev = searchIncrementalStateRef.current;
    const canIncrementalScan = Boolean(
      prev &&
      prev.rowsRef === baseRows &&
      prev.columnsRef === searchColumns &&
      prev.mode === resolvedSearch.mode &&
      prev.caseSensitive === resolvedSearch.caseSensitive &&
      prev.wholeWord === resolvedSearch.wholeWord &&
      matcher.query.startsWith(prev.query) &&
      prev.query.length > 0,
    );
    const candidateAbsRows =
      canIncrementalScan && prev ? prev.matchedAbsRows : null;

    const matchedAbsRows: number[] = [];
    const filteredRows: GridRow[] = [];
    const matches: GridSearchMatch[] = [];

    const candidateCount = candidateAbsRows
      ? candidateAbsRows.length
      : indexedSearchRows.length;

    for (
      let candidateIndex = 0;
      candidateIndex < candidateCount;
      candidateIndex += 1
    ) {
      const absRowIndex = candidateAbsRows
        ? candidateAbsRows[candidateIndex]
        : candidateIndex;
      const indexedRow = indexedSearchRows[absRowIndex];
      if (!indexedRow) continue;

      let rowHasMatch = false;
      const rowMatchStart = matches.length;

      for (
        let cellIndex = 0;
        cellIndex < indexedRow.cells.length;
        cellIndex += 1
      ) {
        const cell = indexedRow.cells[cellIndex];
        if (!hasSearchMatch(cell.text, matcher)) continue;
        rowHasMatch = true;
        if (shouldCollectMatches) {
          matches.push({
            rowId: indexedRow.rowId,
            rowIndex: shouldFilterRows ? -1 : indexedRow.absRowIndex,
            columnKey: cell.columnKey,
            columnIndex: cell.columnIndex,
            text: cell.text,
          });
        }
      }

      if (!rowHasMatch) continue;
      matchedAbsRows.push(indexedRow.absRowIndex);

      if (shouldFilterRows) {
        const filteredIndex = filteredRows.length;
        filteredRows.push(indexedRow.row);
        if (shouldCollectMatches) {
          for (
            let matchIdx = rowMatchStart;
            matchIdx < matches.length;
            matchIdx += 1
          ) {
            matches[matchIdx].rowIndex = filteredIndex;
          }
        }
      }
    }

    searchIncrementalStateRef.current = {
      rowsRef: baseRows,
      columnsRef: searchColumns,
      mode: resolvedSearch.mode,
      query: matcher.query,
      caseSensitive: resolvedSearch.caseSensitive,
      wholeWord: resolvedSearch.wholeWord,
      matchedAbsRows,
    };

    return {
      rows: shouldFilterRows ? filteredRows : baseRows,
      searchMatches: shouldCollectMatches ? matches : EMPTY_SEARCH_MATCHES,
    };
  }, [
    baseRows,
    indexedSearchRows,
    resolvedSearch.caseSensitive,
    resolvedSearch.enabled,
    resolvedSearch.matcher,
    resolvedSearch.mode,
    resolvedSearch.wholeWord,
    searchColumns,
    searchNavigationEnabled,
    serverRowModelEnabled,
  ]);

  useGridSearchResultsCountEffect({
    onResultsCountChange: searchProps?.onResultsCountChange,
    searchMatchesCount: searchMatches.length,
    searchNavigationEnabled,
  });

  const activeSearchMatch = useMemo<SearchActiveMatch | null>(() => {
    if (
      !searchNavigationEnabled ||
      searchProps?.activeMatchIndex == null ||
      searchMatches.length === 0
    ) {
      return null;
    }

    const clampedIndex = Math.max(
      0,
      Math.min(searchProps.activeMatchIndex, searchMatches.length - 1)
    );
    const match = searchMatches[clampedIndex];
    if (!match) {
      return null;
    }

    return {
      rowId: match.rowId,
      columnKey: match.columnKey,
    };
  }, [searchMatches, searchNavigationEnabled, searchProps?.activeMatchIndex]);

  const emitColumnGroupsChange = useCallback(() => {
    if (!onColumnGroupsChange) return;
    onColumnGroupsChange(columnGroupingState.exportColumnDefs());
  }, [onColumnGroupsChange, columnGroupingState]);

  const moveColumnsWithinGroups = useCallback(
    (keys: string[], targetKey: string, position: "before" | "after") => {
      const changed = columnGroupingState.moveColumns(
        keys,
        targetKey,
        position,
      );
      if (changed) emitColumnGroupsChange();
      return changed;
    },
    [columnGroupingState, emitColumnGroupsChange],
  );

  const moveGroupWithinGroups = useCallback(
    (
      groupId: string,
      targetGroupId: string,
      placement: ColumnGroupDropPlacement,
      insideIndex?: number | null,
    ) => {
      const changed = columnGroupingState.moveGroup(
        groupId,
        targetGroupId,
        placement,
        insideIndex,
      );
      if (changed) emitColumnGroupsChange();
      return changed;
    },
    [columnGroupingState, emitColumnGroupsChange],
  );

  const headerRowCount =
    Math.max(columnGroupingState.normalized.maxDepth, 0) + 1;
  const headerBaseHeight = headerRowCount * headerHeight;
  const resolvedFloatingFilterHeight = floatingFiltersEnabled
    ? Math.max(24, floatingFilterHeight ?? Math.round(headerHeight * 0.7))
    : 0;
  const headerTotalHeight =
    headerBaseHeight +
    (floatingFiltersEnabled ? resolvedFloatingFilterHeight : 0);

  const handleColumnGroupToggle = useCallback(
    (groupId: string, open?: boolean) => {
      const current = columnGroupingState.isGroupOpen(groupId);
      const nextState = typeof open === "boolean" ? open : !current;
      columnGroupingState.setGroupOpen(groupId, nextState);
      onColumnGroupToggled?.({ groupId, open: nextState });
    },
    [columnGroupingState, onColumnGroupToggled],
  );

  const isGroupBoundaryBlocked = useCallback(
    (leftKey: string | null, rightKey: string | null) => {
      if (!leftKey || !rightKey) return false;
      return columnGroupingState.marriedBoundaries.has(
        `${leftKey}|${rightKey}`,
      );
    },
    [columnGroupingState.marriedBoundaries],
  );

  // Refs / Scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [cssSystemColumnWidths, setCssSystemColumnWidths] =
    useState<SystemColumnCssWidths>({});
  const cssSystemColumnWidthsRafRef = useRef<number | null>(null);
  const didRunCssSystemColumnThemeRefreshRef = useRef(false);
  const totalHeightRef = useRef(0);
  const [measuredHeaderTotalHeight, setMeasuredHeaderTotalHeight] =
    useState(headerTotalHeight);
  const [measuredViewportHeight, setMeasuredViewportHeight] = useState(height);
  const effectiveHeaderTotalHeight = Math.max(
    headerTotalHeight,
    measuredHeaderTotalHeight,
  );
  const effectiveViewportHeight =
    measuredViewportHeight > 0 ? measuredViewportHeight : height;

  useEffect(() => {
    setMeasuredHeaderTotalHeight(headerTotalHeight);
  }, [headerTotalHeight]);

  useEffect(() => {
    setMeasuredViewportHeight(height);
  }, [height]);

  const applyCssSystemColumnWidths = useCallback(() => {
    const next = readSystemColumnCssWidths(containerRef.current);
    setCssSystemColumnWidths((prev) =>
      areSystemColumnCssWidthsEqual(prev, next) ? prev : next,
    );
  }, []);

  const refreshCssSystemColumnWidths = useCallback(
    (immediate = false) => {
      if (typeof window === "undefined") {
        applyCssSystemColumnWidths();
        return;
      }
      if (immediate) {
        if (cssSystemColumnWidthsRafRef.current != null) {
          window.cancelAnimationFrame(cssSystemColumnWidthsRafRef.current);
          cssSystemColumnWidthsRafRef.current = null;
        }
        applyCssSystemColumnWidths();
        return;
      }
      if (cssSystemColumnWidthsRafRef.current != null) return;
      cssSystemColumnWidthsRafRef.current = window.requestAnimationFrame(() => {
        cssSystemColumnWidthsRafRef.current = null;
        applyCssSystemColumnWidths();
      });
    },
    [applyCssSystemColumnWidths],
  );

  useLayoutEffect(() => {
    refreshCssSystemColumnWidths(true);
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      refreshCssSystemColumnWidths();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (
        cssSystemColumnWidthsRafRef.current != null &&
        typeof window !== "undefined"
      ) {
        window.cancelAnimationFrame(cssSystemColumnWidthsRafRef.current);
        cssSystemColumnWidthsRafRef.current = null;
      }
    };
  }, [refreshCssSystemColumnWidths]);

  useEffect(() => {
    if (!didRunCssSystemColumnThemeRefreshRef.current) {
      didRunCssSystemColumnThemeRefreshRef.current = true;
      return;
    }
    refreshCssSystemColumnWidths(true);
  }, [className, resolvedTheme.slug, refreshCssSystemColumnWidths]);

  const columnResizeGuideRef = useRef<HTMLDivElement>(null);
  const dragLeaveTimeoutRef = useRef<number | null>(null);
  const skipInfiniteScrollCheckRef = useRef(false);
  const rowsRef = useLatestRef(rows);
  const lastApplySelectionFillTokenRef = useRef<number | null>(null);
  const serverRowModelApiRef = serverRowModelProps?.apiRef;
  const {
    resolvedClientGroupSelects,
    ssrmSelectionEnabled,
    ssrmGroupSelects,
    ssrmSelectionState,
    ssrmSelectionLookupCache,
    selectionRows,
    selectedRowIds,
    selectedRowIdSet,
    setRowSelectionIds,
    handleSsrmSelectionStateChange,
  } = useSsrmSelectionController({
    rows,
    isRowSelection,
    clientGroupSelects,
    onRowSelectionChange,
    serverRowModelEnabled,
    ssrmSelectionConfig: serverRowModelProps?.selection,
    serverRowModelGetRow: serverRowModelState.getRow,
    serverRowModelRowIndexById: serverRowModelState.rowIndexById,
  });
  const rowSelectSelectionMetrics = useMemo<RowSelectSelectionMetrics>(() => {
    const fallbackSelectableRows = selectionRows.filter(
      (row) => !row.meta?.group && !row.meta?.loading,
    );
    const selectableRows =
      ssrmSelectionEnabled && ssrmSelectionLookupCache
        ? ssrmSelectionLookupCache.selectableRows
        : fallbackSelectableRows;
    const selectableRowIds =
      ssrmSelectionEnabled && ssrmSelectionLookupCache
        ? ssrmSelectionLookupCache.selectableRowIds
        : selectableRows.map((row) => row.id);
    const selectableRowIdSet =
      ssrmSelectionEnabled && ssrmSelectionLookupCache
        ? ssrmSelectionLookupCache.selectableRowIdSet
        : new Set<string | number>(selectableRowIds);
    let selectedSelectableCount = 0;
    selectableRowIds.forEach((rowId) => {
      if (selectedRowIdSet.has(rowId)) {
        selectedSelectableCount += 1;
      }
    });
    const descendantLeafRowsByGroupPath =
      ssrmSelectionLookupCache?.descendantLeafRowsByGroupPath ??
      (ssrmSelectionEnabled
        ? (() => {
            const map = new Map<string, GridRow[]>();
            selectableRows.forEach((row) => {
              const route = getSsrmLeafRoute(row);
              route.forEach((path) => {
                if (!path) return;
                const bucket = map.get(path);
                if (bucket) {
                  bucket.push(row);
                  return;
                }
                map.set(path, [row]);
              });
            });
            return map;
          })()
        : undefined);
    return {
      selectableRows,
      selectableRowIds,
      selectableRowIdSet,
      selectedSelectableCount,
      descendantLeafRowsByGroupPath,
    };
  }, [
    selectedRowIdSet,
    selectionRows,
    ssrmSelectionEnabled,
    ssrmSelectionLookupCache,
  ]);
  serverRowModelModule.useServerRowModelApiRef({
    enabled: serverRowModelEnabled,
    apiRef: serverRowModelApiRef,
    refresh: serverRowModelState.refresh,
    retryFailedLoads: serverRowModelState.retryFailedLoads,
    getRowNode: serverRowModelState.getRowNode,
    applyTransaction: serverRowModelState.applyTransaction,
    applyTransactionAsync: serverRowModelState.applyTransactionAsync,
    flushAsyncTransactions: serverRowModelState.flushAsyncTransactions,
  });

  const effectiveInfiniteScroll =
    enableInfiniteScroll &&
    !effectivePaginationEnabled &&
    !serverRowModelEnabled;
  const resolvedInfiniteScrollMode: GridInfiniteScrollMode =
    infiniteScrollMode === "top" || infiniteScrollMode === "both"
      ? infiniteScrollMode
      : "bottom";
  const resolvedInfiniteScrollStrategy: GridInfiniteScrollStrategy =
    infiniteScrollStrategy === "page" || infiniteScrollStrategy === "cursor"
      ? infiniteScrollStrategy
      : "offset";
  const resolvedRowIdMergeMode: GridSpanRowIdMergeMode =
    rowIdMergeModeProp === "expand" || rowIdMergeModeProp === "split"
      ? rowIdMergeModeProp
      : "compact";

  const infiniteScrollState = useInfiniteScroll({
    enabled: effectiveInfiniteScroll,
    rowCount: rows.length,
    rowStartIndex: infiniteScrollStartIndex,
    batchSize: infiniteScrollBatchSize,
    thresholdPx: infiniteScrollThreshold,
    mode: resolvedInfiniteScrollMode,
    strategy: resolvedInfiniteScrollStrategy,
    initialCursor: infiniteScrollInitialCursor,
    loadMoreRows,
  });
  const checkInfiniteScroll = infiniteScrollState.check;
  const ssrmScrollIdleTimerRef = useRef<number | null>(null);
  const ssrmIsScrollingRef = useRef(false);
  const ssrmPendingRangeRef = useRef<{
    startRow: number;
    endRow: number;
    key: string;
  } | null>(null);
  const ssrmLastRangeKeyRef = useRef<string | null>(null);
  const { startSsrmScrollCycle } = serverRowModelModule.useSsrmViewportScrollCycle({
    enabled: serverRowModelEnabled,
    paginationActive: ssrmPaginationActive,
    scrollTop,
    height: effectiveViewportHeight,
    rowHeight,
    headerTotalHeight: effectiveHeaderTotalHeight,
    stickyHeader,
    rowCount: serverRowModelState.rowCount,
    blockSize: serverRowModelState.blockSize,
    groupingRequestKey: serverGroupingRequestKey,
    treeDataRequestKey: serverTreeDataRequestKey,
    pivotRequestKey: serverPivotRequestKey,
    containerRef,
    isRowLoaded: serverRowModelState.isRowLoaded,
    ensureRange: serverRowModelState.ensureRange,
    cancelOutstandingLoads: serverRowModelState.cancelOutstandingLoads,
    ssrmScrollIdleTimerRef,
    ssrmIsScrollingRef,
    ssrmPendingRangeRef,
    ssrmLastRangeKeyRef,
  });

  const commitScrollFromElement = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const nextTop = el.scrollTop;
      const nextLeft = el.scrollLeft;
      gridStore.setState((prev) => {
        if (prev.scrollTop === nextTop && prev.scrollLeft === nextLeft) {
          return prev;
        }
        return {
          ...prev,
          scrollTop: nextTop,
          scrollLeft: nextLeft,
        };
      });
    },
    [gridStore],
  );
  const scrollWorkRafRef = useRef<number | null>(null);
  const pendingScrollElementRef = useRef<HTMLDivElement | null>(null);

  const flushScrollWork = useCallback(() => {
    scrollWorkRafRef.current = null;
    const el = pendingScrollElementRef.current;
    if (!el) return;

    commitScrollFromElement(el);

    if (serverRowModelEnabled && !ssrmPaginationActive) {
      startSsrmScrollCycle();
    }

    if (skipInfiniteScrollCheckRef.current) {
      skipInfiniteScrollCheckRef.current = false;
      return;
    }
    checkInfiniteScroll(el);
  }, [
    checkInfiniteScroll,
    commitScrollFromElement,
    serverRowModelEnabled,
    ssrmPaginationActive,
    startSsrmScrollCycle,
  ]);

  const scheduleScrollWork = useCallback(() => {
    if (scrollWorkRafRef.current != null) return;
    scrollWorkRafRef.current = window.requestAnimationFrame(flushScrollWork);
  }, [flushScrollWork]);

  useEffect(() => {
    return () => {
      if (scrollWorkRafRef.current != null) {
        window.cancelAnimationFrame(scrollWorkRafRef.current);
        scrollWorkRafRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const measure = () => {
      rafId = null;

      const nextViewportHeight = Math.max(0, container.clientHeight);
      if (nextViewportHeight > 0) {
        setMeasuredViewportHeight((prev) =>
          prev === nextViewportHeight ? prev : nextViewportHeight,
        );
      }

      const headerNode = headerRef.current;
      if (headerNode) {
        const headerRect = headerNode.getBoundingClientRect();
        const rectHeight = Math.max(0, Math.round(headerRect.height));
        const scrollHeight = Math.max(0, Math.round(headerNode.scrollHeight));
        let visualHeight = rectHeight;

        // Header content can visually overflow fixed row boxes (e.g. wrapped
        // labels or browser text metrics). Capture true visual extent so
        // total canvas height stays in sync with DOM scroll height.
        if (headerNode.children.length > 0) {
          let deepestBottom = headerRect.top;
          const descendants = headerNode.querySelectorAll<HTMLElement>("*");
          descendants.forEach((node) => {
            const rect = node.getBoundingClientRect();
            if (rect.bottom > deepestBottom) {
              deepestBottom = rect.bottom;
            }
          });
          visualHeight = Math.max(
            rectHeight,
            Math.round(Math.max(0, deepestBottom - headerRect.top)),
          );
        }

        const nextHeaderHeight = Math.max(
          rectHeight,
          scrollHeight,
          visualHeight,
        );
        if (nextHeaderHeight > 0) {
          setMeasuredHeaderTotalHeight((prev) =>
            prev === nextHeaderHeight ? prev : nextHeaderHeight,
          );
        }
      }

      commitScrollFromElement(container);
    };

    const scheduleMeasure = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();

    if (typeof ResizeObserver === "undefined") {
      return () => {
        if (rafId != null) {
          window.cancelAnimationFrame(rafId);
        }
      };
    }

    const observer = new ResizeObserver(() => {
      scheduleMeasure();
    });

    observer.observe(container);
    const headerNode = headerRef.current;
    if (headerNode) {
      observer.observe(headerNode);
    }

    return () => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
      observer.disconnect();
    };
  }, [
    commitScrollFromElement,
    headerHeight,
    headerRowCount,
    resolvedFloatingFilterHeight,
  ]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      pendingScrollElementRef.current = e.currentTarget;
      scheduleScrollWork();
    },
    [scheduleScrollWork],
  );

  useEffect(() => {
    if (!effectiveInfiniteScroll) return;
    if (infiniteScrollPaging) return;
    checkInfiniteScroll(containerRef.current);
  }, [
    effectiveInfiniteScroll,
    checkInfiniteScroll,
    infiniteScrollMode,
    infiniteScrollPaging,
    infiniteScrollStartIndex,
    rows.length,
  ]);

  useEffect(() => {
    if (!effectiveInfiniteScroll || !infiniteScrollPaging) return;
    if (!infiniteScrollState.loadCycle) return;
    const dir = infiniteScrollState.lastDirection;
    if (!dir) return;
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    let nextScrollTop = el.scrollTop;
    if (dir === "bottom") {
      nextScrollTop = Math.max(0, maxScroll - infiniteScrollThreshold - 1);
    } else {
      nextScrollTop = Math.min(
        maxScroll,
        Math.max(infiniteScrollThreshold + 1, 0),
      );
    }
    if (nextScrollTop !== el.scrollTop) {
      skipInfiniteScrollCheckRef.current = true;
      el.scrollTop = nextScrollTop;
      commitScrollFromElement(el);
    }
  }, [
    commitScrollFromElement,
    effectiveInfiniteScroll,
    infiniteScrollPaging,
    infiniteScrollState.lastDirection,
    infiniteScrollState.loadCycle,
    infiniteScrollThreshold,
  ]);

  // Lookups & sets
  const { colIndex, colByKey } = useColumnLookups(columns);
  const formulaColumnIndex = useMemo(() => {
    const map = new Map<string, number>();
    columnGroupingState.normalized.leafNodes.forEach((leaf, index) => {
      map.set(leaf.column.key, index);
    });
    return map;
  }, [columnGroupingState.normalized.leafNodes]);
  const { leftPinnedSet, rightPinnedSet, pinnedSet } =
    pinningModule.usePinnedSets(pinnedColumns);
  const pinnedRowSet = useMemo(() => {
    const top = pinnedRows?.top ?? [];
    const bottom = pinnedRows?.bottom ?? [];
    const set = new Set<string>();
    top.forEach((id: string | number) => set.add(String(id)));
    bottom.forEach((id: string | number) => set.add(String(id)));
    return set;
  }, [pinnedRows?.top, pinnedRows?.bottom]);

  const normalizedMergedCellsProp = useMemo(
    () => normalizeMergedCells(mergedCellsProp ?? []),
    [mergedCellsProp],
  );

  const [uncontrolledMergedCells, setUncontrolledMergedCells] = useState(
    normalizedMergedCellsProp,
  );

  useEffect(() => {
    if (onMergedCellsChange) return;
    setUncontrolledMergedCells((prev) =>
      prev === normalizedMergedCellsProp ? prev : normalizedMergedCellsProp,
    );
  }, [normalizedMergedCellsProp, onMergedCellsChange]);

  const mergedCells = onMergedCellsChange
    ? normalizedMergedCellsProp
    : uncontrolledMergedCells;
  const effectiveMergedCells = enableCellSpanningProp
    ? mergedCells
    : EMPTY_MERGED_CELLS;

  const emitMergedCellsChange = useCallback(
    (next: GridMergedCell[]) => {
      const normalized = normalizeMergedCells(next);
      if (onMergedCellsChange) onMergedCellsChange(normalized);
      else setUncontrolledMergedCells(normalized);
    },
    [onMergedCellsChange],
  );

  // System columns + partitions
  const { rowIndexCol, rowDetailCol, rowPinCol, rowOrderCol, rowSelectCol } =
    useSystemColumns(
      effectiveRowPinning,
      effectiveRowReorder,
      isRowSelection,
      {
        enabled: masterDetailEnabled,
        title: masterDetailProps?.column?.title,
        width: masterDetailProps?.column?.width,
      },
      keyedRowsEnabled
        ? keyedHeadersModule.getRowKeySystemColumnOptions(keyedHeaderRows)
        : undefined,
      systemColumnsConfig,
      cssSystemColumnWidths,
      {
        rowPinningHeader: resolvedTheme.icons.rowPinningHeader,
        rowOrderingHeader: resolvedTheme.icons.rowOrderingHeader,
      }
    );
  const colByKeyWithSystem = useMemo(() => {
    const next = new Map(colByKey);
    if (rowIndexCol) next.set(rowIndexCol.key, rowIndexCol);
    if (rowDetailCol) next.set(rowDetailCol.key, rowDetailCol);
    if (rowOrderCol) next.set(rowOrderCol.key, rowOrderCol);
    if (rowSelectCol) next.set(rowSelectCol.key, rowSelectCol);
    if (rowPinCol) next.set(rowPinCol.key, rowPinCol);
    return next;
  }, [
    colByKey,
    rowIndexCol,
    rowDetailCol,
    rowOrderCol,
    rowSelectCol,
    rowPinCol,
  ]);
  const columnsForWidthResolution = useMemo(
    () =>
      [
        rowIndexCol,
        rowDetailCol,
        rowOrderCol,
        rowSelectCol,
        rowPinCol,
        ...columns,
      ].filter((column): column is GridColumn => Boolean(column)),
    [
      columns,
      rowDetailCol,
      rowIndexCol,
      rowOrderCol,
      rowPinCol,
      rowSelectCol,
    ],
  );
  const colWidthOf = useColumnWidthResolver(columnWidths, colByKeyWithSystem, {
    columns: columnsForWidthResolution,
    containerWidth: width,
    fillWidth: fillColumnWidth,
  });
  const { pinnedLeftColumns, pinnedRightColumns, centerColumns } =
    useColumnPartitions(
      columns,
      pinnedColumns,
      pinnedSet,
      systemColumnsConfig,
      rowIndexCol,
      rowDetailCol,
      rowOrderCol,
      rowSelectCol,
      rowPinCol,
      colByKey,
    );

  const clientFilters =
    serverRowModelEnabled || filterMode === "server"
      ? EMPTY_FILTERS
      : activeFilters;
  const clientSortModel =
    serverRowModelEnabled || sortMode === "server" ? [] : effectiveSortModel;
  const sortingRows = serverRowModelEnabled ? EMPTY_ROWS : rows;
  const sortingColumns = serverRowModelEnabled ? EMPTY_COLUMNS : columns;
  const sortingMergedCells = serverRowModelEnabled
    ? EMPTY_MERGED_CELLS
    : effectiveMergedCells;
  const sortingPinnedRows = serverRowModelEnabled
    ? EMPTY_PINNED_ROWS
    : effectivePinnedRows;

  // Grouping / sorting / pinning
  const {
    pinnedTopGroups,
    centerGroups,
    pinnedBottomGroups,
    rowGroups,
    groupByRowId,
  } = useSorting(
    sortingMergedCells,
    sortingColumns,
    rowHeight,
    sortingRows,
    clientFilters,
    sortingPinnedRows,
    clientSortModel,
    rowHeightOf,
    resolvedRowIdMergeMode,
  );

  const serverRowRenderChunkSize = useMemo(() => {
    if (!serverRowModelEnabled) return 1;
    // Master/detail renders per row-group; SSRM must chunk by single rows for parity.
    if (masterDetailEnabled) return 1;
    const base = Math.max(1, Math.trunc(serverRowModelState.blockSize));
    return Math.min(base, 20);
  }, [
    masterDetailEnabled,
    serverRowModelEnabled,
    serverRowModelState.blockSize,
  ]);

  const serverRowGroups = useMemo(() => {
    if (!serverRowModelEnabled) return [];
    const total = Math.max(0, ssrmViewRowCount);
    if (total === 0) return [];
    const blockCount = Math.ceil(total / serverRowRenderChunkSize);
    const groups: RowGroupType[] = [];
    for (let i = 0; i < blockCount; i += 1) {
      const startRow = i * serverRowRenderChunkSize;
      const endRow = Math.min(
        total - 1,
        startRow + serverRowRenderChunkSize - 1,
      );
      const count = Math.max(0, endRow - startRow + 1);
      groups.push({
        id: `sr-chunk-${i}`,
        rows: [],
        startRowIndex: startRow,
        endRowIndex: endRow,
        height: count * rowHeight,
        spans: new Map(),
        isParent: false,
      });
    }
    return groups;
  }, [
    serverRowModelEnabled,
    ssrmViewRowCount,
    serverRowRenderChunkSize,
    rowHeight,
  ]);

  const effectivePinnedTopGroups = useMemo(
    () => (serverRowModelEnabled ? EMPTY_ROW_GROUPS : pinnedTopGroups),
    [pinnedTopGroups, serverRowModelEnabled],
  );
  const effectiveCenterGroups = serverRowModelEnabled
    ? serverRowGroups
    : centerGroups;
  const effectivePinnedBottomGroups = useMemo(
    () => (serverRowModelEnabled ? EMPTY_ROW_GROUPS : pinnedBottomGroups),
    [pinnedBottomGroups, serverRowModelEnabled],
  );
  const effectiveRowGroups = serverRowModelEnabled
    ? serverRowGroups
    : rowGroups;
  const effectiveGroupByRowId = serverRowModelEnabled
    ? new Map()
    : groupByRowId;

  // Local state for filter popover target
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(
    null,
  );

  // Span helpers (only used by DnD constraints and rowHasSpans checks)
  const { columnsWithAnySpan, isMergeBoundaryBlocked, rowHasSpans } =
    spanningModule.useSpan(
    effectiveRowGroups,
    columns,
    colIndex,
  );
  const effectiveRowHasSpans = useCallback(
    (rowId: string | number) =>
      enableCellSpanningProp ? rowHasSpans(rowId) : false,
    [enableCellSpanningProp, rowHasSpans],
  );

  const masterDetail = masterDetailModule.useMasterDetail({
    enabled: masterDetailEnabled,
    masterDetail: masterDetailProps,
    rowHasSpans: effectiveRowHasSpans,
  });

  const pinnedTopGroupsWithDetail = useMemo(
    () => masterDetail.applyDetailHeights(effectivePinnedTopGroups),
    [masterDetail, effectivePinnedTopGroups],
  );
  const centerGroupsWithDetail = useMemo(() => {
    if (!masterDetailEnabled) return effectiveCenterGroups;
    if (!serverRowModelEnabled) {
      return masterDetail.applyDetailHeights(effectiveCenterGroups);
    }
    if (masterDetail.expandedRowIdSet.size === 0) return effectiveCenterGroups;

    const detailExtraByRowIndex = new Map<number, number>();
    masterDetail.expandedRowIdSet.forEach((rowId) => {
      const rowIndex = serverRowModelState.rowIndexById.get(rowId);
      if (rowIndex == null) return;
      const row = serverRowModelState.getRow(rowIndex);
      if (!masterDetail.isRowMaster(row)) return;
      const extra = Math.max(0, masterDetail.detailRowHeightOf(row));
      if (extra > 0) {
        const displayRowIndex = mapSsrmBaseRowIndexToDisplay(rowIndex);
        if (displayRowIndex != null) {
          detailExtraByRowIndex.set(displayRowIndex, extra);
        }
      }
    });

    if (detailExtraByRowIndex.size === 0) return effectiveCenterGroups;

    let changed = false;
    const withDetail = effectiveCenterGroups.map((group) => {
      const extra = detailExtraByRowIndex.get(group.startRowIndex);
      if (!extra) return group;
      changed = true;
      return {
        ...group,
        height: group.height + extra,
      };
    });
    return changed ? withDetail : effectiveCenterGroups;
  }, [
    mapSsrmBaseRowIndexToDisplay,
    masterDetail,
    masterDetailEnabled,
    effectiveCenterGroups,
    serverRowModelEnabled,
    serverRowModelState,
  ]);
  const pinnedBottomGroupsWithDetail = useMemo(
    () => masterDetail.applyDetailHeights(effectivePinnedBottomGroups),
    [masterDetail, effectivePinnedBottomGroups],
  );

  const pinnedLayoutVersion = useMemo(
    () =>
      [
        effectivePinnedRows.top.map(String).join(","),
        effectivePinnedRows.bottom.map(String).join(","),
        pinnedTopGroupsWithDetail.length,
        centerGroupsWithDetail.length,
        pinnedBottomGroupsWithDetail.length,
      ].join("|"),
    [
      centerGroupsWithDetail.length,
      effectivePinnedRows.bottom,
      effectivePinnedRows.top,
      pinnedBottomGroupsWithDetail.length,
      pinnedTopGroupsWithDetail.length,
    ],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rafId = window.requestAnimationFrame(() => {
      commitScrollFromElement(el);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [commitScrollFromElement, pinnedLayoutVersion]);

  const masterDetailView = masterDetail.view;

  const totalCenterRowCount = useMemo(() => {
    if (serverRowModelEnabled) return ssrmViewRowCount;
    return centerGroupsWithDetail.reduce(
      (sum, group) => sum + group.rows.length,
      0,
    );
  }, [centerGroupsWithDetail, serverRowModelEnabled, ssrmViewRowCount]);

  const paginationTotalRows = ssrmPaginationActive
    ? totalCenterRowCount
    : effectivePaginationMode === "server" ||
        effectivePaginationMode === "cursor"
      ? Math.max(0, Math.trunc(paginationTotalRowCount ?? totalCenterRowCount))
      : totalCenterRowCount;

  const paginationState = usePagination({
    enabled: effectivePaginationEnabled,
    mode: effectivePaginationMode,
    pageIndex: paginationPageIndex,
    pageSize: paginationPageSize,
    defaultPageIndex: paginationDefaultPageIndex,
    defaultPageSize: paginationDefaultPageSize,
    totalRowCount: paginationTotalRows,
    pageSizeOptions: paginationPageSizeOptions,
    keepPageOnSizeChange: paginationKeepPageOnSizeChange,
    cursor: paginationCursor,
    onPageChange,
    onPageSizeChange,
    onPageRequest,
    onCursorRequest,
  });

  const paginationIcons = useMemo(() => {
    if (!paginationIconOverrides) return resolvedTheme.icons;
    const normalizedOverrides = normalizePaginationIcons(
      paginationIconOverrides,
    );
    return {
      ...resolvedTheme.icons,
      ...normalizedOverrides,
    };
  }, [resolvedTheme.icons, paginationIconOverrides]);

  const {
    centerGroupsForRender,
    currentCenterRowCount,
    paginationRangeStart,
    paginationRangeEnd,
    paginationTotalRowsForRender,
    effectiveShowFirstLast,
  } = useGridPaginationSlice({
    enabled: effectivePaginationEnabled,
    mode: effectivePaginationMode,
    paginationState,
    paginationTotalRows,
    paginationTotalRowCount,
    totalCenterRowCount,
    centerGroupsWithDetail,
    ssrmPaginationActive,
    serverRowModelEnabled,
    serverRowRenderChunkSize,
    rowHeight,
    showFirstLast: paginationShowFirstLast,
  });

  const paginationRenderState = useMemo(
    () => ({
      ...paginationState,
      totalRowCount: paginationTotalRowsForRender,
      pageRowCount: currentCenterRowCount,
      rangeStart: paginationRangeStart,
      rangeEnd: paginationRangeEnd,
      icons: paginationIcons,
      disabled: paginationDisabled,
    }),
    [paginationState, paginationTotalRowsForRender, currentCenterRowCount, paginationRangeStart, paginationRangeEnd, paginationIcons, paginationDisabled],
  );

  useEffect(() => {
    if (!effectivePaginationEnabled) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = 0;
    commitScrollFromElement(el);
  }, [
    commitScrollFromElement,
    effectivePaginationEnabled,
    paginationState.pageIndex,
    paginationState.pageSize,
  ]);

  const containerEl = containerRef.current;
  const measuredVerticalScrollMax = containerEl
    ? Math.max(0, containerEl.scrollHeight - containerEl.clientHeight)
    : 0;
  const logicalVerticalScrollMax =
    containerEl && totalHeightRef.current > 0
      ? Math.max(0, totalHeightRef.current - containerEl.clientHeight)
      : measuredVerticalScrollMax;
  const verticalScrollMax =
    logicalVerticalScrollMax > 0
      ? // During layout transitions (e.g. SSRM mode/toggle changes), DOM
        // scrollHeight can be temporarily stale/smaller than the logical canvas.
        // Avoid treating that transient mismatch as "at bottom" because it can
        // force virtualization to render the entire SSRM center range.
        measuredVerticalScrollMax > 0 &&
        measuredVerticalScrollMax >= Math.max(0, logicalVerticalScrollMax - 4)
        ? Math.min(measuredVerticalScrollMax, logicalVerticalScrollMax)
        : logicalVerticalScrollMax
      : measuredVerticalScrollMax;
  const isAtVerticalScrollEnd =
    containerEl != null &&
    verticalScrollMax > 0 &&
    containerEl.scrollTop >= verticalScrollMax - 1;

  // Dimensions / sticky offsets
  const {
    pinnedLeftColumnCount,
    centerColumnCount,
    centerRowCount,
    pinnedLeftWidth,
    pinnedRightWidth,
    centerWidth,
    pinnedTopHeight,
    pinnedBottomHeight,
    inlineInfiniteScrollLoaderRowHeight,
    effectiveHeaderHeight,
    effectiveScrollTop,
    virtualCenterGroups,
    virtualCenterCols,
    centerColumnRange,
    centerRowRange,
    getColumnEdgeOffset,
    totalWidth,
    totalHeight,
  } = useGridLayoutMetrics({
    pinnedLeftColumns,
    pinnedRightColumns,
    centerColumns,
    columns,
    pinnedTopGroupsWithDetail,
    pinnedBottomGroupsWithDetail,
    effectivePinnedTopGroups,
    effectivePinnedBottomGroups,
    centerGroupsForRender,
    colWidthOf,
    rowHeight,
    height: effectiveViewportHeight,
    width,
    stickyHeader,
    headerTotalHeight: effectiveHeaderTotalHeight,
    scrollTop,
    scrollLeft,
    isAtVerticalScrollEnd,
    enableCellSpanning: enableCellSpanningProp,
    effectiveMergedCells,
    effectiveInfiniteScroll,
    infiniteScrollLoadingTop: infiniteScrollState.isLoadingTop,
    infiniteScrollLoadingBottom: infiniteScrollState.isLoadingBottom,
    effectiveVirtualization,
    enableHorizontalVirtualization,
    rowBufferPx,
    columnBufferPx,
    serverRowModelEnabled,
  });
  totalHeightRef.current = totalHeight;

  useEffect(() => {
    gridStore.setState((prev) => {
      const prevVirt = prev.virtualization;
      const nextVirt = {
        centerGroups: {
          before: virtualCenterGroups.before,
          after: virtualCenterGroups.after,
          start: virtualCenterGroups.start,
          end: virtualCenterGroups.end,
        },
        centerColumns: {
          before: virtualCenterCols.before,
          after: virtualCenterCols.after,
          start: virtualCenterCols.start,
          end: virtualCenterCols.end,
        },
      };

      if (
        prevVirt.centerGroups.before === nextVirt.centerGroups.before &&
        prevVirt.centerGroups.after === nextVirt.centerGroups.after &&
        prevVirt.centerGroups.start === nextVirt.centerGroups.start &&
        prevVirt.centerGroups.end === nextVirt.centerGroups.end &&
        prevVirt.centerColumns.before === nextVirt.centerColumns.before &&
        prevVirt.centerColumns.after === nextVirt.centerColumns.after &&
        prevVirt.centerColumns.start === nextVirt.centerColumns.start &&
        prevVirt.centerColumns.end === nextVirt.centerColumns.end
      ) {
        return prev;
      }

      return {
        ...prev,
        virtualization: nextVirt,
      };
    });
  }, [
    gridStore,
    virtualCenterCols.after,
    virtualCenterCols.before,
    virtualCenterCols.end,
    virtualCenterCols.start,
    virtualCenterGroups.after,
    virtualCenterGroups.before,
    virtualCenterGroups.end,
    virtualCenterGroups.start,
  ]);

  useEffect(() => {
    if (!serverRowModelEnabled || !ssrmPaginationActive) return;
    if (!effectivePaginationEnabled) return;
    const totalRows = Math.max(0, serverRowModelState.rowCount);
    if (totalRows <= 0) return;

    const pageSize = Math.max(1, Math.trunc(paginationState.pageSize));
    const pageStart = Math.max(0, paginationState.pageIndex * pageSize);
    if (pageStart >= totalRows) return;
    const pageEnd = Math.max(
      pageStart,
      Math.min(totalRows - 1, pageStart + pageSize - 1),
    );
    const key = `${pageStart}:${pageEnd}`;

    if (
      ssrmLastRangeKeyRef.current === key &&
      serverRowModelState.isRowLoaded(pageStart) &&
      serverRowModelState.isRowLoaded(pageEnd)
    ) {
      return;
    }

    if (ssrmLastRangeKeyRef.current !== key) {
      ssrmIsScrollingRef.current = false;
      serverRowModelState.cancelOutstandingLoads();
    }
    ssrmPendingRangeRef.current = null;
    ssrmLastRangeKeyRef.current = key;
    serverRowModelState.ensureRange(pageStart, pageEnd);
  }, [effectivePaginationEnabled, paginationState.pageIndex, paginationState.pageSize, serverGroupingRequestKey, serverTreeDataRequestKey, serverPivotRequestKey, serverRowModelEnabled, serverRowModelState.cancelOutstandingLoads, serverRowModelState.ensureRange, serverRowModelState.isRowLoaded, serverRowModelState.rowCount, ssrmPaginationActive, serverRowModelState]);

  const { cumulativeWidths, cumulativeHeights } = pinningModule.useStickyOffsets(
    pinnedLeftColumns,
    pinnedRightColumns,
    pinnedTopGroupsWithDetail,
    pinnedBottomGroupsWithDetail,
    colWidthOf,
  );

  const rowsRevisionRef = useRef(0);
  const rowsRevisionDependency = serverRowModelEnabled
    ? `${serverRowModelState.version}:${ssrmPendingPlaceholderOverlay?.key ?? ""}`
    : rows;
  const rowsRevision = useMemo(() => {
    if (
      Array.isArray(rowsRevisionDependency) &&
      rowsRevisionDependency.length < 0
    ) {
      return rowsRevisionRef.current;
    }
    rowsRevisionRef.current += 1;
    return rowsRevisionRef.current;
  }, [rowsRevisionDependency]);

  // Map rowId -> absolute index in the current rows array
  const rowIndexLookup = useMemo(() => {
    if (serverRowModelEnabled) {
      return serverRowModelState.rowIndexById;
    }
    const m = new Map<string | number, number>();
    rows.forEach((r, i) => m.set(r.id, i));
    return m;
  }, [rows, serverRowModelEnabled, serverRowModelState.rowIndexById]);

  const rowsById = useMemo(() => {
    const m = new Map<string | number, GridRow>();
    rows.forEach((r) => m.set(r.id, r));
    return m;
  }, [rows]);

  const validationEnabled = validationProps.enabled ?? false;
  const validationMode = validationProps.mode ?? "allow";
  const validationTrigger = validationProps.validateOn ?? "commit";
  const validationDebounceMs = validationProps.validateDebounceMs;
  const validateOnVisibleChange =
    validationProps.validateOnVisibleChange ?? false;
  const validateVisibleOnly = validationProps.validateVisibleOnly ?? false;
  const validateVisibleDebounceMs =
    validationProps.validateVisibleDebounceMs ?? 60;
  const validationIndicator = validationProps.indicator ?? "dot";
  const highlightErrors = validationProps.highlightErrors ?? true;
  const highlightWarnings = validationProps.highlightWarnings ?? true;
  const highlightInfo = validationProps.highlightInfo ?? false;
  const showTooltip = validationProps.tooltip ?? true;

  const {
    getCellValidation,
    validateCellValue,
    previewCellValue,
    validateVisibleRows,
    revision: validationRevision,
  } = validationModule.useGridValidation({
    enabled: validationEnabled,
    columns,
    rows,
    colIndex,
    rowIndexLookup,
    validation: validationProps,
  });
  const { validationDisplay } = validationModule.useGridValidationBridge({
    enabled: validationEnabled,
    highlightErrors,
    highlightWarnings,
    highlightInfo,
    indicator: validationIndicator,
    showTooltip,
    validateOnVisibleChange,
    validateVisibleOnly,
    validateVisibleDebounceMs,
    pinnedTopGroups: pinnedTopGroupsWithDetail,
    visibleCenterGroups: virtualCenterGroups.visible,
    pinnedBottomGroups: pinnedBottomGroupsWithDetail,
    virtualStart: virtualCenterGroups.start,
    virtualEnd: virtualCenterGroups.end,
    validateVisibleRows,
  });

  const allowGroupHeaderDrag = Boolean(rowGroupingProps.onReorderGroups);
  const rowGroupingDnDHandlers = useMemo(
    () => ({
      moveRowsToGroup: rowGroupingProps.onMoveRowsToGroup,
      reorderGroups: rowGroupingProps.onReorderGroups,
    }),
    [rowGroupingProps.onMoveRowsToGroup, rowGroupingProps.onReorderGroups],
  );

  const {
    visualColumns,
    visualColumnSizes,
    pinnedLeftColumnSizes,
    pinnedRightColumnSizes,
    virtualCenterColumnSizes,
    pinnedCenterColumnSizes,
    visualColumnIndex,
    selectionColumns,
    selectionColumnIndex,
    centerSpanCoverage,
    pinnedTopSpanCoverage,
    pinnedBottomSpanCoverage,
    pinnedVirtualCenterCols,
  } = useGridVisualColumnsState({
    pinnedLeftColumns,
    pinnedRightColumns,
    centerColumns,
    virtualCenterCols,
    virtualCenterGroups,
    colWidthOf,
    enableCellSpanning: enableCellSpanningProp,
    hasMergedCells: effectiveMergedCells.length > 0,
    effectiveVirtualization,
    centerGroupsForRender,
    effectivePinnedTopGroups,
    effectivePinnedBottomGroups,
  });

  const {
    visualRowOrder,
    rowIndexToVisual,
    resolveSemanticBodyRowIndex,
  } = useGridVisualRowsState({
    centerGroupsForRender,
    effectivePinnedTopGroups,
    effectivePinnedBottomGroups,
    rowIndexLookup,
    serverRowModelEnabled,
    ssrmPaginationActive,
    ssrmViewRowCount,
  });

  const handleColumnResize = useCallback(
    (key: string, width: number) => {
      onColumnResize?.(key, width);
    },
    [onColumnResize],
  );

  const resizeMode =
    resizeModeOverride ?? (performanceMode ? "deferred" : "immediate");

  const resizeColumns = useCallback(
    (updates: Array<{ key: string; width: number }>) => {
      updates.forEach(({ key, width }) => handleColumnResize(key, width));
    },
    [handleColumnResize],
  );

  useEffect(() => {
    const request = applySelectionFillRequest;
    if (!request) return;
    if (lastApplySelectionFillTokenRef.current === request.token) return;
    lastApplySelectionFillTokenRef.current = request.token;

    if (!onCellChange) return;
    if (serverRowModelEnabled) return;

    const targetSelection = request.selection ?? selection;
    if (!targetSelection) return;
    if (visualRowOrder.length === 0 || selectionColumns.length === 0) return;

    const rowStart = Math.max(
      0,
      Math.min(targetSelection.startRow, targetSelection.endRow),
    );
    const rowEnd = Math.min(
      visualRowOrder.length - 1,
      Math.max(targetSelection.startRow, targetSelection.endRow),
    );
    const colStart = Math.max(
      0,
      Math.min(targetSelection.startCol, targetSelection.endCol),
    );
    const colEnd = Math.min(
      selectionColumns.length - 1,
      Math.max(targetSelection.startCol, targetSelection.endCol),
    );

    if (rowStart > rowEnd || colStart > colEnd) return;

    for (
      let visualRowIndex = rowStart;
      visualRowIndex <= rowEnd;
      visualRowIndex += 1
    ) {
      const absRowIndex = visualRowOrder[visualRowIndex] ?? visualRowIndex;
      const row = rows[absRowIndex];
      if (!row) continue;

      for (
        let selectionColIndex = colStart;
        selectionColIndex <= colEnd;
        selectionColIndex += 1
      ) {
        const column = selectionColumns[selectionColIndex];
        if (!column || isSystemCol(column.key)) continue;

        const existing = row.data[column.key] ?? ({ value: "" } as CellValue);
        const existingFormat = existing.format ?? {};
        const nextFormat = { ...existingFormat };

        if (request.color == null) {
          delete nextFormat.backgroundColor;
        } else {
          nextFormat.backgroundColor = request.color;
        }

        const formatIsEmpty = Object.keys(nextFormat).length === 0;
        const nextBackgroundColor = formatIsEmpty
          ? undefined
          : nextFormat.backgroundColor;
        const formatChanged =
          existingFormat.backgroundColor !== nextBackgroundColor ||
          (formatIsEmpty
            ? Object.keys(existingFormat).length > 0
            : Object.keys(existingFormat).length !==
              Object.keys(nextFormat).length);

        if (!formatChanged) continue;
        if (!formatIsEmpty) {
          primeCompiledCellFormat(nextFormat);
        }

        onCellChange(row.id, column.key, {
          ...existing,
          format: formatIsEmpty ? undefined : nextFormat,
        });
      }
    }
  }, [
    applySelectionFillRequest,
    onCellChange,
    rows,
    selection,
    selectionColumns,
    serverRowModelEnabled,
    visualRowOrder,
  ]);

  const getColumnLabel = useCallback(
    (column: GridColumn) => {
      if (column.key === GRID_SYSTEM_COLUMN_KEYS.rowIndex) {
        return keyedHeaderRows?.headerLabel ?? "";
      }
      if (!keyedColumnsEnabled) return undefined;
      return keyedHeadersModule.getColumnLabel({
        column,
        formulaColumnIndex,
        keyedHeaders: keyedHeadersProp,
      });
    },
    [
      formulaColumnIndex,
      keyedColumnsEnabled,
      keyedHeaderRows?.headerLabel,
      keyedHeadersModule,
      keyedHeadersProp,
    ],
  );

  const getRowKeyLabel = useCallback(
    (row: GridRow, absRowIndex: number) => {
      return keyedHeadersModule.getRowLabel({
        row,
        absoluteRowIndex: absRowIndex,
        rowIndexToVisual,
        keyedHeaders: keyedHeadersProp,
      });
    },
    [keyedHeadersModule, keyedHeadersProp, rowIndexToVisual],
  );

  const resolveFormulaBarRow = useCallback(
    (absoluteRowIndex: number) =>
      serverRowModelEnabled
        ? rowModelForView?.getRow(absoluteRowIndex)
        : rows[absoluteRowIndex],
    [rowModelForView, rows, serverRowModelEnabled],
  );

  useGridFormulaBarSyncEffect({
    editingCell,
    enableFormulaBar,
    gridStore,
    resolveRow: resolveFormulaBarRow,
    selection,
    selectionColumns,
    visualRowOrder,
  });

  const {
    searchRowOffsets,
    centerColumnOffsets,
    denseRowOffsets,
  } = useGridViewportOffsetsState({
    centerColumns,
    colWidthOf,
    searchNavigationEnabled,
    hasSearchMatcher: Boolean(resolvedSearch.matcher),
    searchMatchCount: searchMatches.length,
    serverRowModelEnabled,
    visualRowOrder,
    rows,
    rowHeightOf,
    rowHeight,
    hasCustomRowHeights,
  });

  const { keepSelectionVisible, scrollToSearchMatch } =
    useGridViewportScrollActions({
      containerRef,
      centerColumnOffsets,
      centerWidth,
      denseRowOffsets,
      effectiveHeaderHeight,
      effectiveHeaderTotalHeight,
      effectiveScrollTop,
      height,
      leftPinnedSet,
      pinnedBottomHeight,
      pinnedLeftWidth,
      pinnedRightWidth,
      pinnedTopHeight,
      rightPinnedSet,
      rowHeight,
      rowHeightOf,
      scrollLeft,
      scrollTop,
      searchRowOffsets,
      serverRowModelEnabled,
      stickyHeader,
      width,
    });

  useGridSearchNavigationEffect({
    activeMatchIndex: searchProps?.activeMatchIndex,
    colIndex,
    columns,
    effectiveMergedCells,
    enableCellSpanning: enableCellSpanningProp,
    onActiveMatchChange: searchProps?.onActiveMatchChange,
    onSelectionRangeChange,
    rowIndexToVisual,
    scrollToSearchMatch,
    searchMatches,
    searchNavigationEnabled,
    selectionColumnIndex,
  });

  const { getColumnResizeHandleProps, getColumnResizeGuideProps } = useResize(
    handleColumnResize,
    colWidthOf,
    columnWidths,
    {
      containerRef,
      scrollLeft,
      mode: resizeMode,
      renderUpdates: false,
      guideRef: columnResizeGuideRef,
      getColumnEdgeOffset,
      quantize: resizeQuantize,
      throttle: columnResizeThrottle,
    },
  );

  const columnResizeGuide = enableColumnResize
    ? getColumnResizeGuideProps({
        color: tokens.selectionBorder,
      })
    : null;

  // 🔸 Selection helpers
  const {
    getSelection,
    selectionEdgeStyle,
    isCellSelected,
    handleCellMouseDown,
    handleCellMouseEnter,
    beginFillHandleDrag,
    applyRowSelectionToCells,
    applyColumnSelectionToCells,
    clearSelectionRange,
    lastSourceIs,
    isDraggingSelection,
    fillDragActive,
  } = useGridSelectionHandlers({
    selection: selection ?? null,
    enableCellSelection,
    selectEntireRowOnSelection,
    selectEntireColumnOnSelection,
    rowCellSelectionMode: resolvedRowCellSelectionMode,
    columnCellSelectionMode: resolvedColumnCellSelectionMode,
    rowCellSelectionIncludeSpans,
    columnCellSelectionIncludeSpans,
    rows,
    rowCount: serverRowModelEnabled ? centerRowCount : undefined,
    rowIndexLookup,
    pinnedTopGroups: effectivePinnedTopGroups,
    centerGroups: centerGroupsForRender,
    pinnedBottomGroups: effectivePinnedBottomGroups,
    visualColumns: selectionColumns,
    visualColumnIndex: selectionColumnIndex,
    rowIndexToVisual,
    onSelectionRangeChange,
    containerRef,
    edgeSize: 36,
    maxEdgeSpeed: 40,
    pinnedLeftColumnCount,
    centerColumnCount,
  });

  const fillHandleCell = useMemo(() => {
    if (!enableCellSelection || !selection) return null;
    if (
      (centerRowRange &&
        (selection.endRow < centerRowRange.start ||
          selection.endRow > centerRowRange.end)) ||
      (centerColumnRange &&
        (selection.endCol < centerColumnRange.start ||
          selection.endCol > centerColumnRange.end))
    ) {
      return null;
    }
    const absRow = visualRowOrder[selection.endRow] ?? selection.endRow;
    return { row: absRow, col: selection.endCol };
  }, [
    enableCellSelection,
    selection,
    visualRowOrder,
    centerRowRange,
    centerColumnRange,
  ]);

  const fillHandleEnabled = fillHandleConfig?.enabled !== false;
  const fillHandleIcon = fillHandleConfig?.icon;

  const renderFillHandleIcon = useCallback(() => {
    if (!fillHandleIcon) return null;
    const rendered =
      typeof fillHandleIcon === "function"
        ? fillHandleIcon({
            className: "ace-grid__fill-handle-icon",
            isDragging: fillDragActive,
          })
        : fillHandleIcon;
    if (!rendered) return null;
    const iconClassName = cx(
      "ace-grid__fill-handle-icon",
      fillHandleConfig?.iconClassName,
    );
    return (
      <span className={iconClassName} style={fillHandleConfig?.iconStyle}>
        {rendered}
      </span>
    );
  }, [
    fillHandleIcon,
    fillHandleConfig?.iconClassName,
    fillHandleConfig?.iconStyle,
    fillDragActive,
  ]);

  const isFillHandleCell = useCallback(
    (
      rowIndex: number,
      colIndex: number,
      rowSpan = 1,
      colSpan = 1,
      columnKey?: string,
    ) => {
      if (!fillHandleCell) return false;
      if (columnKey && isSystemCol(columnKey)) return false;
      return (
        fillHandleCell.row === rowIndex + rowSpan - 1 &&
        fillHandleCell.col === colIndex + colSpan - 1
      );
    },
    [fillHandleCell],
  );

  const renderFillHandle = useCallback(
    (visible: boolean) =>
      visible &&
      fillHandleEnabled &&
      !isDraggingSelection &&
      !fillDragActive ? (
        <div
          className={cx(
            "ace-grid__fill-handle",
            fillHandleIcon && "ace-grid__fill-handle--icon",
            fillHandleConfig?.className,
          )}
          style={fillHandleConfig?.style}
          onMouseDown={beginFillHandleDrag}
        >
          {renderFillHandleIcon()}
        </div>
      ) : null,
    [
      beginFillHandleDrag,
      fillDragActive,
      isDraggingSelection,
      fillHandleEnabled,
      fillHandleIcon,
      fillHandleConfig?.className,
      fillHandleConfig?.style,
      renderFillHandleIcon,
    ],
  );

  // 🔹 NEW: single-click selection that mirrors edit’s absolute-index logic
  const selectSingleCell = useCallback(
    (
      absRow: number,
      colIdx: number,
      ev?: React.MouseEvent,
      rowSpan: number = 1,
      colSpan: number = 1,
    ) => {
      // bubble to consumer first (kept behavior)
      onCellClick?.(absRow, colIdx, ev as any);

      if (!enableCellSelection) return;
      // if user was dragging, don't override drag result
      if (isDraggingSelection || fillDragActive) return;

      const visualRowStart =
        rowIndexToVisual.get(absRow) != null
          ? (rowIndexToVisual.get(absRow) as number)
          : absRow;
      const spanRows = Math.max(1, rowSpan);
      const spanCols = Math.max(1, colSpan);
      const absRowEnd = absRow + spanRows - 1;
      const visualRowEnd =
        rowIndexToVisual.get(absRowEnd) != null
          ? (rowIndexToVisual.get(absRowEnd) as number)
          : visualRowStart + spanRows - 1;

      const visualColStart = colIdx;
      const visualColEnd = colIdx + spanCols - 1;

      const startRow = Math.min(visualRowStart, visualRowEnd);
      const endRow = Math.max(visualRowStart, visualRowEnd);
      const startCol = Math.min(visualColStart, visualColEnd);
      const endCol = Math.max(visualColStart, visualColEnd);

      if (
        (centerRowRange &&
          (endRow < centerRowRange.start || startRow > centerRowRange.end)) ||
        (centerColumnRange &&
          (endCol < centerColumnRange.start ||
            startCol > centerColumnRange.end))
      ) {
        return;
      }

      const boundedStartRow = centerRowRange
        ? Math.max(startRow, centerRowRange.start)
        : startRow;
      const boundedEndRow = centerRowRange
        ? Math.min(endRow, centerRowRange.end)
        : endRow;
      const boundedStartCol = centerColumnRange
        ? Math.max(startCol, centerColumnRange.start)
        : startCol;
      const boundedEndCol = centerColumnRange
        ? Math.min(endCol, centerColumnRange.end)
        : endCol;

      onSelectionRangeChange?.({
        startRow: boundedStartRow,
        endRow: boundedEndRow,
        startCol: boundedStartCol,
        endCol: boundedEndCol,
      });
    },
    [
      onCellClick,
      enableCellSelection,
      isDraggingSelection,
      fillDragActive,
      rowIndexToVisual,
      onSelectionRangeChange,
      centerRowRange,
      centerColumnRange,
    ],
  );

  const {
    chartControls,
    settingsPanelEnabled,
    defaultChartSettings,
    chartSettings,
    chartModel,
    chartTypes,
    chartSeriesBy,
    seriesByOptions,
    chartGroupingOptions,
    chartGroupByKey,
    chartSamplingColumnOptions,
    chartOptions,
    chartMenuItems,
    createChartMenuPosition,
    disabledChartTypes,
    disabledSeriesBy,
    handleChartTypeChange,
    handleSeriesByChange,
    handleGroupByChange,
    handleChartSettingsChange,
    closeChart,
  } = chartsModule.useGridChartsController({
    chartsEnabled,
    chartsConfig,
    selection,
    activeFilters,
    rows,
    columns,
    selectionColumns,
    visualRowOrder,
    resolveRow: serverRowModelEnabled ? rowModelForView?.getRow : undefined,
    rowDataVersion: serverRowModelEnabled
      ? rowModelForView?.version ?? 0
      : undefined,
  });

  const {
    contextMenuEnabled,
    contextMenuState,
    contextMenuContext,
    contextMenuItems: resolvedContextMenuItems,
    openContextMenu: openCellContextMenu,
    closeContextMenu,
    handleMenuItemSelect,
  } = contextMenuBaseModule.useContextMenu({
    config: resolvedContextMenuConfig,
    selection: selection ?? null,
    selectionResolver: getSelection,
    rows,
    columns,
    mergedCells: effectiveMergedCells,
    onMergedCellsChange: emitMergedCellsChange,
    rowIndexToVisual,
    visualRowOrder,
    visualColumns: selectionColumns,
    colIndex,
    colByKey,
    pinnedRowSet,
    pinnedColumnSet: pinnedSet,
    onSelectionRangeChange,
    isDraggingSelection,
    fillDragActive,
    extraItems: chartMenuItems,
    extraItemsPlacement: createChartMenuPosition === "bottom" ? "end" : "start",
  });

  const { handleColumnSelectionChange, handleRowSelectionChange } =
    useGridSelectionMirrorHandlers({
      applyColumnSelectionToCells,
      applyRowSelectionToCells,
      clearSelectionRange,
      columnCellSelectionIncludeSpans,
      enableCellSelection,
      lastSourceIs,
      onColumnSelectionChange,
      onRowSelectionChange,
      onSelectionRangeChange,
      resolvedColumnCellSelectionMode,
      resolvedRowCellSelectionMode,
      rowCellSelectionIncludeSpans,
      rowsById,
      selectEntireColumnOnSelection,
      selectEntireRowOnSelection,
      selection,
      setRowSelectionIds,
    });

  const { selectedColumnKeys, toggleColumnSelection } = useColumnSelection(
    isColSelection,
    handleColumnSelectionChange,
  );

  const { createRowResizeHandle } = useRowResize({
    onRowResize: enableRowResize && onRowResize ? onRowResize : undefined,
    rowHeightOf: enableRowResize ? rowHeightOf : undefined,
    enabled: enableRowResize && Boolean(onRowResize),
    guideColor: tokens.selectionBorder,
    mode: resizeMode,
    renderUpdates: false,
    heightStep: resizeHeightStep,
    throttle: rowResizeThrottle,
  });

  const {
    triggerSort,
    handlePinRow,
    doPinColumn,
    pinColumnAtPosition,
    pinAndPositionColumn,
  } = useGridSortPinActions({
    clearSelectionRange,
    effectiveSortModel,
    isColPinning,
    multiSortKey: resolvedMultiSortKey,
    onPinAndPositionColumn,
    onPinColumn,
    onPinColumnAtPosition,
    onPinRow,
    onSort,
    onSortModelChange,
    sortColumn,
    sortDirection,
    sortingCapabilityEnabled,
  });

  const {
    updateEditingValue,
    registerEditorValueListener,
    commitEdit,
    cancelEdit,
    onCellDbl,
    handleGridPointerDownCapture,
    handleFormulaBarFocus,
    handleFormulaBarChange,
    handleFormulaBarSubmit,
  } = useGridEditingBridge({
    colByKey,
    colIndex,
    editingCell,
    effectiveMergedCells,
    effectivePinnedBottomGroups,
    effectivePinnedTopGroups,
    emitMergedCellsChange,
    enableFormulaBar,
    formulaBarValueRef,
    formulaCapabilityEnabled,
    formulaColumnIndex,
    formulaModule,
    isCellEditing,
    onCellChange,
    onCellDoubleClick,
    pinnedLeftColumns,
    pinnedRightColumns,
    selection,
    selectionColumns,
    validation: {
      enabled: validationEnabled,
      mode: validationMode,
      trigger: validationTrigger,
      debounceMs: validationDebounceMs,
      validateCellValue,
      previewCellValue,
    },
    virtualCenterCols,
    virtualCenterGroups,
    visualColumnIndex,
    visualColumns,
    visualRowOrder,
  });

  const {
    dragState,
    columnHasSpans,
    handleColDragStart,
    onColDragOver,
    onColDragLeave,
    onColDrop,
    onColDragEnd,
    onGroupDragStart,
    onGroupDragOver,
    onGroupDragLeave,
    onGroupDrop,
    rowDragState,
    handleRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
  } = useGridDnDBridge({
    clearSelectionRange,
    colIndex,
    columnLeafByKey: columnGroupingState.normalized.leafByKey,
    columns,
    columnsWithAnySpan,
    containerRef,
    doPinColumn,
    dragLeaveTimeoutRef,
    effectiveGroupByRowId,
    effectivePinnedRows,
    effectiveRowHasSpans,
    effectiveRowReorder,
    isColReorder,
    isGroupBoundaryBlocked,
    isMergeBoundaryBlocked,
    leftPinnedSet,
    marriedGroupColumns: columnGroupingState.marriedGroupColumns,
    moveColumnsWithinGroups,
    moveGroupWithinGroups,
    onColumnReorder,
    onMultiColumnReorder,
    onMultiRowReorder,
    onPinAndPositionColumn: pinAndPositionColumn,
    onPinAndPositionRow,
    onPinColumnAtPosition: pinColumnAtPosition,
    onPinMultipleRowsAtPosition,
    onPinRow,
    onPinRowAtPosition,
    onPinnedColumnReorder,
    onPinnedRowReorder,
    onReorderMultiplePinnedRows,
    onRowExternalDrop,
    onRowReorder,
    onUpdateColumnOrder,
    pinnedColumns,
    pinnedSet,
    columnReorderModule,
    advancedColumnReorderEnabled: reorderCapabilityEnabled,
    rowReorderModule,
    advancedRowReorderEnabled: reorderCapabilityEnabled,
    rightPinnedSet,
    rowDragSourceId,
    rowGroupingDnDHandlers,
    rows,
    rowsById,
    rowsRef,
    selectedColumnKeys,
    selectedRowIds,
  });

  const { applyPinnedStyle } = useGridPinnedStyle({
    cumulativeWidths,
    pinnedLeftColumns,
    pinnedRightColumns,
  });

  const {
    gridWrapperStyle,
    gridRootStyle,
    rootClassName,
    cellPadding,
    showPaginationTop,
    showPaginationBottom,
  } = useGridRootPresentationState({
    width,
    height,
    tokens,
    effectiveHeaderTotalHeight,
    effectiveViewportHeight,
    resolvedTheme,
    enableFormulaBar,
    className,
    style,
    effectivePaginationEnabled,
    paginationPosition,
  });
  const { infiniteScrollTopLoaderNode, infiniteScrollBottomLoaderNode } =
    useGridInfiniteScrollLoaderNodes({
      effectiveInfiniteScroll,
      fontSize: tokens.fontSize,
      hasMoreBottom: infiniteScrollState.hasMoreBottom,
      hasMoreTop: infiniteScrollState.hasMoreTop,
      infiniteScrollBottomLoader,
      infiniteScrollLoader,
      infiniteScrollTopLoader,
      isLoadingBottom: infiniteScrollState.isLoadingBottom,
      isLoadingTop: infiniteScrollState.isLoadingTop,
      renderInfiniteScrollLoader,
      textMuted: tokens.textMuted,
    });

  const {
    selectedCellLabel,
    gridAriaRowCount,
    gridAriaColCount,
    activeSelectionCellId,
  } = useGridSelectionPresentationState({
    selection,
    selectionColumns,
    formulaColumnIndex,
    visualRowOrder,
    headerRowCount,
    floatingFiltersEnabled,
    visualColumns,
    visualColumnIndex,
    gridBodyCellIdBase,
    resolveSemanticBodyRowIndex,
  });

  const { handleGridKeyDown, handleGridPointerDown } =
    useGridInteractionController({
      clipboardEnabled,
      enableKeyboardShortcuts,
      enableCellSelection,
      selection,
      editingCell,
      selectionColumns,
      visualRowOrder,
      serverRowModelEnabled,
      rowModelForView,
      rows,
      onClipboardCopy,
      onClipboardCut,
      onClipboardPaste,
      onSelectionRangeChange,
      onActivateSelection: onCellDbl,
      keepSelectionVisible,
      activeSelectionCellId,
      containerRef,
    });

  const { sharedSsrmSelectionProps, sharedRowViewProps } =
    useGridSharedRowViewProps({
      resolvedClientGroupSelects,
      ssrmSelectionEnabled,
      ssrmSelectionState,
      serverRowModelRowCount: serverRowModelState.rowCount,
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
      hasRowResizeHandler: Boolean(onRowResize),
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
    });

  return (
    <GridThemeProvider value={resolvedTheme}>
      <SparklineProvider value={sparklineProps}>
        <GridSearchProvider
          value={searchProps}
          activeMatch={activeSearchMatch}
        >
          <div
            style={gridWrapperStyle}
            className="ace-grid__wrapper"
            data-ace-grid-theme={resolvedTheme.slug}
          >
            <GridFormulaBar
              enabled={enableFormulaBar}
              onFocus={handleFormulaBarFocus}
              onChange={handleFormulaBarChange}
              onSubmit={handleFormulaBarSubmit}
              selectedCell={selectedCellLabel}
            />

            {showPaginationTop ? (
              <GridPaginationArea
                key="pagination-top"
                enabled={effectivePaginationEnabled}
                state={paginationRenderState}
                tokens={tokens}
                render={renderPagination}
                className={paginationClassName}
                style={paginationStyle}
                labels={paginationLabels}
                showPageSize={paginationShowPageSize}
                showRange={paginationShowRange}
                showPageInfo={paginationShowPageInfo}
                showControls={paginationShowControls}
                showFirstLast={effectiveShowFirstLast}
                disabled={paginationDisabled}
              />
            ) : null}

            <GridViewportShell
              containerRef={containerRef}
              rootClassName={rootClassName}
              themeSlug={resolvedTheme.slug}
              ariaLabel={resolvedAriaLabel}
              ariaLabelledBy={ariaLabelledBy}
              ariaDescribedBy={ariaDescribedBy}
              gridAriaRowCount={gridAriaRowCount}
              gridAriaColCount={gridAriaColCount}
              activeSelectionCellId={activeSelectionCellId}
              showGlobalLoadingIndicator={showGlobalLoadingIndicator}
              gridRootStyle={gridRootStyle}
              onScroll={onScroll}
              onPointerDownCapture={handleGridPointerDownCapture}
              onPointerDown={handleGridPointerDown}
              onKeyDown={handleGridKeyDown}
              serverRowModelEnabled={serverRowModelEnabled}
              columnResizeGuideRef={columnResizeGuideRef}
              columnResizeGuide={columnResizeGuide}
              totalWidth={totalWidth}
              totalHeight={totalHeight}
            >
                <GridHeaderLayer
                  headerRef={headerRef}
                  stickyHeader={stickyHeader}
                  headerBackground={tokens.headerBackground}
                  FloatingFilterRowComponent={floatingFilterModule.FloatingFilterRow}
                  headerRowProps={{
                    headerCellIdBase: gridHeaderCellIdBase,
                    pinnedLeftColumns,
                    pinnedRightColumns,
                    centerColumns,
                    virtualCenterCols,
                    headerRowHeight: headerHeight,
                    headerRowCount,
                    colWidthOf,
                    applyPinnedStyle,
                    columnGrouping: columnGroupingState,
                    onToggleColumnGroup: handleColumnGroupToggle,
                    onGroupDragStart,
                    onGroupDragOver,
                    onGroupDragLeave,
                    onGroupDrop,
                    resizeColumns,
                    columnHasSpans,
                    dragState,
                    isColReorder,
                    advancedColumnReorderEnabled: reorderCapabilityEnabled,
                    pinnedSet,
                    leftPinnedSet,
                    onColDragStart: handleColDragStart,
                    onColDragOver,
                    onColDragLeave,
                    onColDrop,
                    onColDragEnd,
                    isColSelection,
                    selectedColumnKeys,
                    toggleColumnSelection,
                    sortModel: effectiveSortModel,
                    triggerSort,
                    getColumnResizeHandleProps,
                    activeFilters: interactiveFilters,
                    activeFilterColumn,
                    setActiveFilterColumn,
                    onFilter,
                    rows,
                    rowsRevision,
                    enableAdvancedMultiFilter,
                    renderColumnFilterPanel,
                    doPinColumn,
                    isColPinning,
                    enableColumnResize,
                    getColumnLabel,
                    visualColumnIndex,
                    ariaRowIndexStart: 1,
                  }}
                  rowSelectHeaderProps={{
                    isHeader: true,
                    rows: selectionRows,
                    selectedRowIds,
                    selectedRowIdSet,
                    selectionMetrics: rowSelectSelectionMetrics,
                    onRowSelectionChange: handleRowSelectionChange,
                    clientGroupSelects:
                      sharedSsrmSelectionProps.clientGroupSelects,
                    ssrmSelectionState:
                      sharedSsrmSelectionProps.ssrmSelectionState,
                    ssrmSelectableRowCount:
                      sharedSsrmSelectionProps.ssrmSelectableRowCount,
                    ssrmGroupSelects:
                      sharedSsrmSelectionProps.ssrmGroupSelects,
                    ssrmSelectionCache:
                      sharedSsrmSelectionProps.ssrmSelectionCache,
                    onSsrmSelectionStateChange:
                      sharedSsrmSelectionProps.onSsrmSelectionStateChange,
                    style: {},
                  }}
                  floatingFiltersEnabled={floatingFiltersEnabled}
                  floatingFilterRowProps={{
                    pinnedLeftColumns,
                    pinnedRightColumns,
                    centerColumns,
                    virtualCenterCols,
                    rowHeight: resolvedFloatingFilterHeight,
                    colWidthOf,
                    activeFilters: interactiveFilters,
                    onFilter,
                    rows,
                    rowsRevision,
                    floatingFilterDebounceMs,
                    ariaRowIndex: headerRowCount + 1,
                    visualColumnIndex,
                    renderFloatingFilterCell,
                  }}
                />

                <GridPinnedRowGroupsLayer
                  position="top"
                  groups={pinnedTopGroupsWithDetail}
                  offsets={cumulativeHeights.top}
                  stickyHeader={stickyHeader}
                  effectiveHeaderTotalHeight={effectiveHeaderTotalHeight}
                  rowViewProps={sharedRowViewProps}
                  virtualCenterCols={pinnedVirtualCenterCols}
                  centerColumnSizes={pinnedCenterColumnSizes}
                  centerSpanCoverage={pinnedTopSpanCoverage}
                />

                <CenterBody
                  enableVirtualization={effectiveVirtualization}
                  defaultRowHeight={rowHeight}
                  virtualCenterGroups={virtualCenterGroups}
                  scrollLeftPx={scrollLeft}
                  viewportWidthPx={width}
                  topLoaderStickyOffsetPx={
                    (stickyHeader ? effectiveHeaderTotalHeight : 0) +
                    pinnedTopHeight
                  }
                  bottomLoaderStickyOffsetPx={pinnedBottomHeight}
                  topLoaderNode={infiniteScrollTopLoaderNode}
                  bottomLoaderNode={infiniteScrollBottomLoaderNode}
                  loaderRowMinHeight={inlineInfiniteScrollLoaderRowHeight}
                  {...sharedRowViewProps}
                  virtualCenterCols={virtualCenterCols}
                  centerColumnSizes={virtualCenterColumnSizes}
                  centerSpanCoverage={centerSpanCoverage}
                />

              <GridPinnedRowGroupsLayer
                position="bottom"
                groups={pinnedBottomGroupsWithDetail}
                offsets={cumulativeHeights.bottom}
                stickyHeader={stickyHeader}
                effectiveHeaderTotalHeight={effectiveHeaderTotalHeight}
                rowViewProps={sharedRowViewProps}
                virtualCenterCols={pinnedVirtualCenterCols}
                centerColumnSizes={pinnedCenterColumnSizes}
                centerSpanCoverage={pinnedBottomSpanCoverage}
              />
            </GridViewportShell>

            <GridSupplementaryOverlays
              chartsEnabled={chartsEnabled}
              ChartPanelComponent={chartsModule.IntegratedChartPanel}
              chartModel={chartModel}
              chartPanelProps={{
                options: chartOptions,
                chartTypes,
                disabledChartTypes,
                seriesBy: chartSeriesBy,
                seriesByOptions,
                disabledSeriesBy,
                groupByOptions:
                  chartGroupingOptions.length > 1
                    ? chartGroupingOptions
                    : undefined,
                groupByKey: chartGroupByKey ?? undefined,
                onGroupByChange: handleGroupByChange,
                containerRef,
                panel: chartsConfig.panel,
                zoom: chartsConfig.zoom,
                controls: chartControls,
                settings: settingsPanelEnabled ? chartSettings : undefined,
                defaultSettings: settingsPanelEnabled
                  ? defaultChartSettings
                  : undefined,
                onSettingsChange: handleChartSettingsChange,
                samplingColumnOptions: chartSamplingColumnOptions,
                initialBrushRowIds: chartsConfig.initialBrushRowIds,
                onTypeChange: handleChartTypeChange,
                onSeriesByChange: handleSeriesByChange,
                onClose: closeChart,
                renderChart: chartsConfig.renderChart,
                onBrushSelection: chartsConfig.onBrushSelection,
              }}
              paginationProps={{
                enabled: showPaginationBottom,
                state: paginationRenderState,
                tokens,
                render: renderPagination,
                className: paginationClassName,
                style: paginationStyle,
                labels: paginationLabels,
                showPageSize: paginationShowPageSize,
                showRange: paginationShowRange,
                showPageInfo: paginationShowPageInfo,
                showControls: paginationShowControls,
                showFirstLast: effectiveShowFirstLast,
                disabled: paginationDisabled,
              }}
              contextMenuProps={{
                enabled: contextMenuEnabled,
                open: Boolean(contextMenuState),
                context: contextMenuContext,
                items: resolvedContextMenuItems,
                config: resolvedContextMenuConfig,
                onClose: closeContextMenu,
                onSelect: handleMenuItemSelect,
              }}
            />
          </div>
        </GridSearchProvider>
      </SparklineProvider>
    </GridThemeProvider>
  );
};

export const createGridComponent = (
  runtimeTier: GridTierPreset,
  options: { requireLicense?: boolean } = {},
): React.FC<GridProps> => {
  const TierGrid: React.FC<GridProps> = (props) => {
    const licenseState = useAceGridLicense(
      options.requireLicense ? runtimeTier : "core",
      props.license,
    );

    if (options.requireLicense && licenseState.status !== "valid") {
      const title =
        licenseState.status === "validating"
          ? "Validating Ace Grid license"
          : `${runtimeTier === "enterprise" ? "Enterprise" : "Pro"} license required`;

      return (
        <div
          role={licenseState.status === "invalid" ? "alert" : "status"}
          aria-live="polite"
          style={{
            alignItems: "center",
            background: "#071225",
            border: "1px solid rgba(148, 163, 184, 0.32)",
            borderRadius: 12,
            color: "#eaf1ff",
            display: "flex",
            flexDirection: "column",
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            gap: 8,
            justifyContent: "center",
            minHeight: props.layout?.height ?? 240,
            padding: 24,
            textAlign: "center",
            width: props.layout?.width ?? "100%",
          }}
        >
          <strong style={{ fontSize: 18 }}>{title}</strong>
          <span style={{ color: "#b8c6dc", fontSize: 14 }}>
            {licenseState.message}
          </span>
        </div>
      );
    }

    return (
      <GridStoreProvider>
        <GridImpl {...props} __runtimeTier={runtimeTier} />
      </GridStoreProvider>
    );
  };

  TierGrid.displayName = `AceGrid(${runtimeTier})`;
  return TierGrid;
};

export const Grid: React.FC<GridProps> = createGridComponent("enterprise");
