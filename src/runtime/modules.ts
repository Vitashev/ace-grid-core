import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { GridContextMenuConfig, GridContextMenuItemDefinition } from "../features/context-menu";
import type { CellContextMenuProps } from "../features/context-menu/components/CellContextMenu";
import {
  sanitizeContextMenuBuilderOptions,
  sanitizeContextMenuConfig,
} from "../features/context-menu/capabilityUtils";
import type { useContextMenu } from "../features/context-menu/hooks/useContextMenu";
import {
  sanitizeFilterConfig,
  sanitizeFilterConfigs,
} from "../features/filtering/capabilityUtils";
import type {
  GridColumn,
  GridFilterConfig,
  GridKeyedHeadersProps,
  GridMergedCell,
  GridRow,
  GridSortConfig,
  GridTreeDataProps,
} from "../types";
import type { IntegratedChartPanel } from "../features/charts/components/IntegratedChartPanel";
import type { useGridChartsController } from "../features/charts/hooks/useGridChartsController";
import type {
  FormulaGridEvalOptions,
  FormulaGridState,
  FormulaReferenceRange,
} from "../features/formula";
import type { useFormulaRangePick } from "../features/formula/hooks/useFormulaRangePick";
import type {
  exportGridToExcel,
  importGridFromExcel,
} from "../features/io/excel";
import type { buildRowGroupingModel } from "../features/grouping/buildRowGroupingModel";
import type { buildTreeDataModel } from "../features/tree-data/buildTreeDataModel";
import type {
  buildClientPivotDataset,
  buildPivotColumnsFromFields,
} from "../features/pivoting";
import type { useMasterDetail } from "../features/master-detail/hooks/useMasterDetail";
import type { RowPinCell } from "../features/pinning/components/RowPinCell";
import type { usePinnedSets } from "../features/pinning/hooks/usePinnedSets";
import type { useStickyOffsets } from "../features/pinning/hooks/useStickyOffsets";
import type { RowOrderCell } from "../features/reorder/components/RowOrderCell";
import type { useColumnDnD } from "../features/reorder/hooks/useColumnDnD";
import type { useRowDnD } from "../features/reorder/hooks/useRowDnD";
import type { useSpan } from "../features/spanning/hooks/useSpan";
import type {
  GridSparklineProvider,
  Sparkline,
  useGridSparkline,
} from "../features/sparkline";
import type {
  buildSparklineTitle,
  hasSparklineData,
  normalizeSparklineData,
  resolveSparklineOptions,
} from "../features/sparkline/utils";
import type {
  resolveGridTreeDataPathColumnKeys,
  resolveGridTreeDataPathResolver,
} from "../features/tree-data/utils";
import type { getValidationClassNames } from "../features/validation/utils";
import type { useGridValidation } from "../features/validation/hooks/useValidation";
import type { useGridValidationBridge } from "../features/validation/hooks/useGridValidationBridge";
import type { normalizeGridServerPivotValueColumns, normalizeGridServerRequestColumns, normalizeGridServerRowModelConfig } from "../features/server-row-model/normalize";
import type { buildServerGroupingRequest, buildServerHierarchyConfigKey, buildServerPivotRequest, buildServerTreeDataRequest } from "../features/server-row-model/requestBuilders";
import type { mapSsrmBaseRowIndexToDisplay, resolveSsrmDisplayRowIndex } from "../features/server-row-model/ssrmDisplayOverlay";
import type { useServerRowModel } from "../features/server-row-model/hooks/useServerRowModel";
import type { useServerRowModelApiRef } from "../features/server-row-model/hooks/useServerRowModelApiRef";
import type { useSsrmGroupToggleOverlay } from "../features/server-row-model/hooks/useSsrmGroupToggleOverlay";
import type { useSsrmLoadingUiState } from "../features/server-row-model/hooks/useSsrmLoadingUiState";
import type { useSsrmViewportScrollCycle } from "../features/server-row-model/hooks/useSsrmViewportScrollCycle";

export interface GridFormulaBarComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  selectedCell?: string;
  disabled?: boolean;
}

export type GridFormulaRangePickHook = typeof useFormulaRangePick;

interface GridRuntimeModuleBase {
  implementationMarker?: string;
}

export interface GridFormulaModule extends GridRuntimeModuleBase {
  available: boolean;
  FormulaBar?: React.ComponentType<GridFormulaBarComponentProps>;
  useFormulaRangePick: GridFormulaRangePickHook;
  extractFormulaRanges: (formula: string) => FormulaReferenceRange[];
  remapFormulaColumns: (
    formula: string,
    remapColumnIndex: (colIndex: number) => number | null | undefined,
  ) => string;
  remapFormulaRows: (
    formula: string,
    remapRowIndex: (rowIndex: number) => number | null | undefined,
  ) => string;
  evaluateGrid: (
    rows: GridRow[],
    columns: GridColumn[],
    mergedCells?: GridMergedCell[],
    state?: FormulaGridState | null,
    options?: FormulaGridEvalOptions,
  ) => { rows: GridRow[]; changed: boolean; state: FormulaGridState };
}

export interface GridChartsModule extends GridRuntimeModuleBase {
  available: boolean;
  chartCss: string;
  IntegratedChartPanel?: typeof IntegratedChartPanel;
  useGridChartsController: typeof useGridChartsController;
}

export interface GridFloatingFilterModule extends GridRuntimeModuleBase {
  available: boolean;
  FloatingFilterRow?: React.ComponentType<any>;
}

export interface GridAdvancedFilteringModule extends GridRuntimeModuleBase {
  available: boolean;
  sanitizeFilter: (
    filter: GridFilterConfig | null | undefined,
    options?: { allowAdvanced?: boolean },
  ) => GridFilterConfig | null;
  sanitizeFilters: (
    filters: GridFilterConfig[] | null | undefined,
    options?: { allowAdvanced?: boolean },
  ) => GridFilterConfig[];
}

export interface GridGroupingModule extends GridRuntimeModuleBase {
  available: boolean;
  buildRowGroupingModel: typeof buildRowGroupingModel;
}

export interface GridTreeDataModule extends GridRuntimeModuleBase {
  available: boolean;
  buildTreeDataModel: typeof buildTreeDataModel;
  resolveGridTreeDataPathResolver: (
    treeData?: Pick<GridTreeDataProps, "getDataPath" | "pathField" | "pathSeparator">
  ) => ReturnType<typeof resolveGridTreeDataPathResolver>;
  resolveGridTreeDataPathColumnKeys: (
    availableColumnKeys: Iterable<string>,
    treeData?: Pick<GridTreeDataProps, "pathColumnKeys" | "pathField">
  ) => ReturnType<typeof resolveGridTreeDataPathColumnKeys>;
}

export interface GridMultiSortModule extends GridRuntimeModuleBase {
  available: boolean;
  normalizeSortModel: (
    model?: GridSortConfig[],
    options?: { allowMultiSort?: boolean },
  ) => GridSortConfig[];
}

export interface GridExcelIoModule extends GridRuntimeModuleBase {
  available: boolean;
  exportGridToExcel: typeof exportGridToExcel;
  importGridFromExcel: typeof importGridFromExcel;
}

export interface GridPivotModule extends GridRuntimeModuleBase {
  available: boolean;
  buildClientPivotDataset: typeof buildClientPivotDataset;
  buildPivotColumnsFromFields: typeof buildPivotColumnsFromFields;
}

export interface GridPinningModule extends GridRuntimeModuleBase {
  available: boolean;
  RowPinCell?: typeof RowPinCell;
  usePinnedSets: typeof usePinnedSets;
  useStickyOffsets: typeof useStickyOffsets;
}

export interface GridReorderModule extends GridRuntimeModuleBase {
  available: boolean;
  RowOrderCell?: typeof RowOrderCell;
  useColumnDnD: typeof useColumnDnD;
  useRowDnD: typeof useRowDnD;
}

export interface GridColumnReorderModule extends GridRuntimeModuleBase {
  available: boolean;
  useColumnDnD: typeof useColumnDnD;
}

export interface GridRowReorderModule extends GridRuntimeModuleBase {
  available: boolean;
  RowOrderCell?: typeof RowOrderCell;
  useRowDnD: typeof useRowDnD;
}

export interface GridSpanningModule extends GridRuntimeModuleBase {
  available: boolean;
  useSpan: typeof useSpan;
}

export interface GridSparklineModule extends GridRuntimeModuleBase {
  available: boolean;
  GridSparklineProvider: typeof GridSparklineProvider;
  Sparkline: typeof Sparkline;
  useGridSparkline: typeof useGridSparkline;
  resolveSparklineOptions: typeof resolveSparklineOptions;
  normalizeSparklineData: typeof normalizeSparklineData;
  hasSparklineData: typeof hasSparklineData;
  buildSparklineTitle: typeof buildSparklineTitle;
}

export interface GridMasterDetailToggleCellProps {
  id?: string;
  row: GridRow;
  expanded: boolean;
  disabled: boolean;
  style: React.CSSProperties;
  className?: string;
  onToggle: () => void;
  renderToggleIcon?: (args: {
    row: GridRow;
    expanded: boolean;
    disabled: boolean;
  }) => React.ReactNode;
  role?: React.AriaRole;
  ariaColIndex?: number;
  ariaRowIndex?: number;
}

export interface GridMasterDetailModule extends GridRuntimeModuleBase {
  available: boolean;
  RowDetailToggleCell?: React.ComponentType<GridMasterDetailToggleCellProps>;
  useMasterDetail: typeof useMasterDetail;
}

export interface GridValidationModule extends GridRuntimeModuleBase {
  available: boolean;
  getValidationClassNames: typeof getValidationClassNames;
  useGridValidation: typeof useGridValidation;
  useGridValidationBridge: typeof useGridValidationBridge;
}

export interface GridKeyedHeadersModule extends GridRuntimeModuleBase {
  available: boolean;
  getRowKeySystemColumnOptions: (
    rows?: GridKeyedHeadersProps["rows"],
  ) => {
    enabled: true;
    width?: number;
    title: string;
  };
  getColumnLabel: (args: {
    column: GridColumn;
    formulaColumnIndex: Map<string, number>;
    keyedHeaders: GridKeyedHeadersProps;
  }) => React.ReactNode | undefined;
  getRowLabel: (args: {
    row: GridRow;
    absoluteRowIndex: number;
    rowIndexToVisual: Map<number, number>;
    keyedHeaders: GridKeyedHeadersProps;
  }) => React.ReactNode;
}

export interface GridContextMenuBuilderOptions {
  className?: string;
  includeCopy?: boolean;
  includeHighlight?: boolean;
  includeLog?: boolean;
  extraItems?: GridContextMenuItemDefinition[];
}

export interface GridContextMenuBaseModule extends GridRuntimeModuleBase {
  available: boolean;
  CellContextMenu?: React.ComponentType<CellContextMenuProps>;
  useContextMenu: typeof useContextMenu;
}

export interface GridContextMenuCustomizationModule
  extends GridRuntimeModuleBase {
  available: boolean;
  sanitizeConfig: (
    config?: GridContextMenuConfig,
    options?: { allowCustomization?: boolean },
  ) => GridContextMenuConfig;
  sanitizeBuilderOptions: (
    options?: GridContextMenuBuilderOptions,
    sanitizeOptions?: { allowCustomization?: boolean },
  ) => GridContextMenuBuilderOptions | undefined;
}

export interface GridServerRowModelModule extends GridRuntimeModuleBase {
  available: boolean;
  useServerRowModel: typeof useServerRowModel;
  useServerRowModelApiRef: typeof useServerRowModelApiRef;
  useSsrmViewportScrollCycle: typeof useSsrmViewportScrollCycle;
  useSsrmGroupToggleOverlay: typeof useSsrmGroupToggleOverlay;
  useSsrmLoadingUiState: typeof useSsrmLoadingUiState;
  normalizeGridServerRequestColumns: typeof normalizeGridServerRequestColumns;
  normalizeGridServerPivotValueColumns: typeof normalizeGridServerPivotValueColumns;
  normalizeGridServerRowModelConfig: typeof normalizeGridServerRowModelConfig;
  buildServerGroupingRequest: typeof buildServerGroupingRequest;
  buildServerTreeDataRequest: typeof buildServerTreeDataRequest;
  buildServerPivotRequest: typeof buildServerPivotRequest;
  buildServerHierarchyConfigKey: typeof buildServerHierarchyConfigKey;
  resolveSsrmDisplayRowIndex: typeof resolveSsrmDisplayRowIndex;
  mapSsrmBaseRowIndexToDisplay: typeof mapSsrmBaseRowIndexToDisplay;
}

export interface GridRuntimeModules {
  advancedFiltering: GridAdvancedFilteringModule;
  charts: GridChartsModule;
  columnReorderBasic: GridColumnReorderModule;
  contextMenuBase: GridContextMenuBaseModule;
  contextMenuCustomization: GridContextMenuCustomizationModule;
  excelIo: GridExcelIoModule;
  floatingFilter: GridFloatingFilterModule;
  formula: GridFormulaModule;
  grouping: GridGroupingModule;
  keyedHeaders: GridKeyedHeadersModule;
  masterDetail: GridMasterDetailModule;
  multiSort: GridMultiSortModule;
  pinning: GridPinningModule;
  reorder: GridReorderModule;
  rowReorderBasic: GridRowReorderModule;
  pivot: GridPivotModule;
  sparkline: GridSparklineModule;
  spanning: GridSpanningModule;
  serverRowModel: GridServerRowModelModule;
  treeData: GridTreeDataModule;
  validation: GridValidationModule;
}

const buildEmptyFormulaState = (
  rows: GridRow[],
  columns: GridColumn[],
  mergedCells?: GridMergedCell[],
): FormulaGridState => ({
  columnsSignature: columns.map((column) => column.key).join("|"),
  rowCount: rows.length,
  mergedSignature: mergedCells?.length
    ? mergedCells
        .map(
          (cell) =>
            `${cell.id}:${cell.startRow},${cell.endRow},${cell.startCol},${cell.endCol}`,
        )
        .join("|")
    : "",
  hasFormula: false,
  formulaCells: new Map(),
  dependents: new Map(),
  computedValues: new Map(),
  mergedLookup: null,
});

const defaultFormulaModule: GridFormulaModule = {
  available: false,
  useFormulaRangePick: () => ({
    handleGridPointerDownCapture: () => undefined,
  }),
  extractFormulaRanges: () => [],
  remapFormulaColumns: (formula) => formula,
  remapFormulaRows: (formula) => formula,
  evaluateGrid: (rows, columns, mergedCells, state) => ({
    rows,
    changed: false,
    state: state ?? buildEmptyFormulaState(rows, columns, mergedCells),
  }),
};

const defaultChartsModule: GridChartsModule = {
  available: false,
  chartCss: "",
  useGridChartsController: (params) => ({
    chartControls: params.chartsConfig.controls,
    settingsPanelEnabled: false,
    defaultChartSettings: {},
    chartSettings: {},
    chartModel: null,
    chartTypes: params.chartsConfig.chartTypes?.slice() ?? [],
    chartSeriesBy: params.chartsConfig.seriesBy ?? "columns",
    seriesByOptions: ["columns", "rows"],
    chartGroupingOptions: [],
    chartGroupByKey: null,
    chartSamplingColumnOptions: [],
    chartOptions: params.chartsConfig.options ?? {},
    chartMenuItems: [],
    createChartMenuPosition: params.chartsConfig.createChartMenu?.position ?? "top",
    disabledChartTypes: new Set(),
    disabledSeriesBy: new Set(),
    handleChartTypeChange: () => undefined,
    handleSeriesByChange: () => undefined,
    handleGroupByChange: () => undefined,
    handleChartSettingsChange: () => undefined,
    closeChart: () => undefined,
  }),
};

const defaultAdvancedFilteringModule: GridAdvancedFilteringModule = {
  available: false,
  sanitizeFilter: (filter) =>
    sanitizeFilterConfig(filter, { allowAdvanced: false }),
  sanitizeFilters: (filters) =>
    sanitizeFilterConfigs(filters, { allowAdvanced: false }),
};

const defaultFloatingFilterModule: GridFloatingFilterModule = {
  available: false,
};

const defaultGroupingModule: GridGroupingModule = {
  available: false,
  buildRowGroupingModel: ({ rows }) => ({
    rows: rows.slice(),
    groupPaths: [],
    nodes: new Map(),
  }),
};

const normalizeSortModelFallback = (
  model?: GridSortConfig[],
): GridSortConfig[] => {
  if (!Array.isArray(model) || !model.length) return [];
  const normalized: GridSortConfig[] = [];
  const seen = new Set<string>();
  for (const entry of model) {
    if (!entry?.columnKey || !entry?.direction) continue;
    if (entry.direction !== "asc" && entry.direction !== "desc") continue;
    if (seen.has(entry.columnKey)) continue;
    seen.add(entry.columnKey);
    normalized.push({ columnKey: entry.columnKey, direction: entry.direction });
  }
  return normalized;
};

const defaultMultiSortModule: GridMultiSortModule = {
  available: false,
  normalizeSortModel: (model) => {
    const normalized = normalizeSortModelFallback(model);
    return normalized.slice(0, 1);
  },
};

const defaultTreeDataModule: GridTreeDataModule = {
  available: false,
  buildTreeDataModel: ({ rows }) => ({
    rows: rows.slice(),
    groupPaths: [],
  }),
  resolveGridTreeDataPathResolver: () => null,
  resolveGridTreeDataPathColumnKeys: () => [],
};

const defaultKeyedHeadersModule: GridKeyedHeadersModule = {
  available: false,
  getRowKeySystemColumnOptions: (rows) => ({
    enabled: true,
    width: rows?.width,
    title: typeof rows?.headerLabel === "string" ? rows.headerLabel : "",
  }),
  getColumnLabel: () => undefined,
  getRowLabel: ({ absoluteRowIndex }) => String(absoluteRowIndex + 1),
};

const defaultContextMenuCustomizationModule: GridContextMenuCustomizationModule =
  {
    available: false,
    sanitizeConfig: sanitizeContextMenuConfig,
    sanitizeBuilderOptions: sanitizeContextMenuBuilderOptions,
  };

const defaultContextMenuBaseModule: GridContextMenuBaseModule = {
  available: false,
  useContextMenu: () => ({
    contextMenuEnabled: false,
    contextMenuState: null,
    contextMenuContext: null,
    contextMenuItems: [],
    openContextMenu: () => undefined,
    closeContextMenu: () => undefined,
    handleMenuItemSelect: () => undefined,
  }),
};

const defaultExcelIoModule: GridExcelIoModule = {
  available: false,
  exportGridToExcel: async () => undefined,
  importGridFromExcel: async ({ columns }) => ({
    columns: columns.slice(),
    rows: [],
    mergedCells: [],
    columnWidths: {},
    rowHeights: {},
    meta: {
      sheetName: "Ace Grid",
      rowCount: 0,
      columnCount: columns.length,
      updatedColumns: false,
    },
  }),
};

const defaultPivotModule: GridPivotModule = {
  available: false,
  buildClientPivotDataset: ({ rows, columns }) => ({
    columns: columns.slice(),
    rows: rows.slice(),
    pivotResultFields: [],
  }),
  buildPivotColumnsFromFields: ({ sourceColumns }) => sourceColumns.slice(),
};

const defaultPinningModule: GridPinningModule = {
  available: false,
  usePinnedSets: () => ({
    leftPinnedSet: new Set<string>(),
    rightPinnedSet: new Set<string>(),
    pinnedSet: new Set<string>(),
  }),
  useStickyOffsets: () => ({
    cumulativeWidths: { left: {}, right: {} },
    cumulativeHeights: { top: {}, bottom: {} },
  }),
};

const defaultReorderModule: GridReorderModule = {
  available: false,
  useColumnDnD: () => ({
    dragState: {
      isDragging: false,
      draggedColumnKey: null,
      draggedColumnKeys: [],
      dragOverColumnKey: null,
      dragOverPosition: null,
      draggedGroupId: null,
      draggedGroupDepth: null,
      draggedGroupParentId: null,
      dragOverGroupId: null,
      groupDropPlacement: "before",
      groupDropInsideIndex: null,
      draggedGroupPath: [],
    },
    columnHasSpans: () => false,
    onColDragStart: () => undefined,
    onColDragOver: () => undefined,
    onColDragLeave: () => undefined,
    onColDrop: () => undefined,
    onColDragEnd: () => undefined,
    onGroupDragStart: () => undefined,
    onGroupDragOver: () => undefined,
    onGroupDragLeave: () => undefined,
    onGroupDrop: () => undefined,
    onNodeDragStart: () => undefined,
    onNodeDragOver: () => undefined,
    onNodeDrop: () => undefined,
  }),
  useRowDnD: () => ({
    rowDragState: {
      isDragging: false,
      draggedRowId: null,
      draggedRowIds: [],
      dragOverRowId: null,
      dragOverPosition: null,
      draggedKind: null,
    },
    onRowDragStart: () => undefined,
    onRowDragOver: () => undefined,
    onRowDragLeave: () => undefined,
    onRowDrop: () => undefined,
    onRowDragEnd: () => undefined,
  }),
};

const defaultColumnReorderModule: GridColumnReorderModule = {
  available: false,
  useColumnDnD: defaultReorderModule.useColumnDnD,
};

const defaultRowReorderModule: GridRowReorderModule = {
  available: false,
  useRowDnD: defaultReorderModule.useRowDnD,
};

const defaultSpanningModule: GridSpanningModule = {
  available: false,
  useSpan: () => ({
    columnsWithAnySpan: new Set<string>(),
    isMergeBoundaryBlocked: () => false,
    rowHasSpans: () => false,
  }),
};

const defaultSparklineModule: GridSparklineModule = {
  available: false,
  GridSparklineProvider: ({ children }) =>
    React.createElement(React.Fragment, null, children),
  Sparkline: () => null,
  useGridSparkline: () => ({
    enabled: false,
    defaultOptions: {},
  }),
  resolveSparklineOptions: () => null,
  normalizeSparklineData: () => null,
  hasSparklineData: () => false,
  buildSparklineTitle: () => null,
};

const defaultMasterDetailModule: GridMasterDetailModule = {
  available: false,
  useMasterDetail: ({ enabled }) => {
    const expandedRowIdSet = useMemo<Set<string | number>>(
      () => new Set(),
      [],
    );
    const isRowMaster = useCallback(() => false, []);
    const isExpanded = useCallback(() => false, []);
    const toggleRow = useCallback(() => undefined, []);
    const collapseRow = useCallback(() => undefined, []);
    const detailRowHeightOf = useCallback(() => 0, []);
    const applyDetailHeights = useCallback<
      ReturnType<typeof useMasterDetail>["applyDetailHeights"]
    >((groups) => groups, []);
    return useMemo(
      () => ({
        enabled: enabled && false,
        expandedRowIdSet,
        isRowMaster,
        isExpanded,
        toggleRow,
        collapseRow,
        detailRowHeightOf,
        applyDetailHeights,
        view: undefined,
      }),
      [
        applyDetailHeights,
        collapseRow,
        detailRowHeightOf,
        enabled,
        expandedRowIdSet,
        isExpanded,
        isRowMaster,
        toggleRow,
      ],
    );
  },
};

const defaultValidationModule: GridValidationModule = {
  available: false,
  getValidationClassNames: () => [],
  useGridValidation: () => ({
    validationState: new Map(),
    revision: 0,
    getCellValidation: () => null,
    validateCellValue: () => ({
      state: null,
      results: [],
      hasErrors: false,
      pendingAsync: false,
    }),
    previewCellValue: () => ({
      state: null,
      results: [],
      hasErrors: false,
      pendingAsync: false,
    }),
    validateVisibleRows: () => undefined,
    validateAll: () => undefined,
    clearValidation: () => undefined,
  }),
  useGridValidationBridge: ({
    indicator,
  }) => ({
    validationDisplay: {
      enabled: false,
      highlightInvalidCells: false,
      highlightWarnings: false,
      highlightInfo: false,
      showIndicator: false,
      indicator,
      showTooltip: false,
    },
  }),
};

const DEFAULT_SSRM_ROW: GridRow = {
  id: "__ssrm-placeholder__",
  data: {},
};

const DEFAULT_SSRM_TRANSACTION_RESULT = {
  status: "ignored",
  add: 0,
  update: 0,
  remove: 0,
  appliedAdd: 0,
  appliedUpdate: 0,
  appliedRemove: 0,
  refreshed: false,
} as const;

const normalizeServerRequestColumnsFallback: GridServerRowModelModule["normalizeGridServerRequestColumns"] =
  (configured) => {
    if (!Array.isArray(configured)) return [];
    const seen = new Set<string>();
    return configured
      .filter((column) => column && typeof column.key === "string")
      .map((column) => ({ key: column.key, label: column.label }))
      .filter((column) => {
        if (!column.key || seen.has(column.key)) return false;
        seen.add(column.key);
        return true;
      });
  };

const normalizeServerPivotValueColumnsFallback: GridServerRowModelModule["normalizeGridServerPivotValueColumns"] =
  (configured) => {
    if (!Array.isArray(configured)) return [];
    const seen = new Set<string>();
    return configured
      .filter((column) => column && typeof column.key === "string")
      .map((column) => ({
        key: column.key,
        label: column.label,
        aggFunc:
          typeof column.aggFunc === "string" && column.aggFunc
            ? column.aggFunc
            : undefined,
      }))
      .filter((column) => {
        if (!column.key || seen.has(column.key)) return false;
        seen.add(column.key);
        return true;
      });
  };

const normalizeServerRowModelConfigFallback: GridServerRowModelModule["normalizeGridServerRowModelConfig"] =
  (props) => ({
    enabled: props?.enabled === true,
    storeMode: props?.storeMode,
    rowCount: props?.rowCount,
    blockSize: props?.blockSize,
    maxBlocksInCache: props?.maxBlocksInCache,
    prefetchBlocks: props?.prefetchBlocks,
    debounceMs: props?.debounceMs,
    grouping: {
      enabled: props?.grouping?.enabled !== false && Array.isArray(props?.grouping?.columns),
      columns: normalizeServerRequestColumnsFallback(props?.grouping?.columns),
      groupColumnKey: props?.grouping?.groupColumnKey,
      defaultExpanded: props?.grouping?.defaultExpanded,
    },
    treeData: {
      enabled: props?.treeData?.enabled === true,
      groupColumnKey: props?.treeData?.groupColumnKey,
      defaultExpanded: props?.treeData?.defaultExpanded,
    },
    pivot: {
      enabled: props?.pivot?.enabled !== false && Array.isArray(props?.pivot?.pivotColumns),
      groupColumns: normalizeServerRequestColumnsFallback(props?.pivot?.groupColumns),
      pivotColumns: normalizeServerRequestColumnsFallback(props?.pivot?.pivotColumns),
      valueColumns: normalizeServerPivotValueColumnsFallback(props?.pivot?.valueColumns),
      pivotMode: props?.pivot?.pivotMode ?? true,
      resultFieldSeparator: props?.pivot?.resultFieldSeparator,
    },
    pagination: props?.pagination,
    selection: props?.selection,
  });

const defaultServerRowModelModule: GridServerRowModelModule = {
  available: false,
  useServerRowModel: (args) => {
    const rowIndexByIdRef = useRef<Map<string | number, number>>(new Map());
    const getRow = useCallback(
      (rowIndex: number) => ({
        ...DEFAULT_SSRM_ROW,
        id: `__ssrm-placeholder__:${Math.max(0, Math.trunc(rowIndex))}`,
      }),
      [],
    );
    const getRowIndexById = useCallback(() => -1, []);
    const isRowLoaded = useCallback(() => false, []);
    const ensureRange = useCallback(() => undefined, []);
    const refresh = useCallback(() => undefined, []);
    const getRowNode = useCallback(() => null, []);
    const applyTransaction = useCallback(
      () => ({ ...DEFAULT_SSRM_TRANSACTION_RESULT }),
      [],
    );
    const applyTransactionAsync = useCallback(
      (_transaction: Parameters<ReturnType<typeof useServerRowModel>["applyTransactionAsync"]>[0], callback?: Parameters<ReturnType<typeof useServerRowModel>["applyTransactionAsync"]>[1]) => {
        callback?.({ ...DEFAULT_SSRM_TRANSACTION_RESULT });
      },
      [],
    );
    const flushAsyncTransactions = useCallback(() => undefined, []);
    const retryFailedLoads = useCallback(() => undefined, []);
    const cancelOutstandingLoads = useCallback(() => undefined, []);

    return useMemo(
      () => ({
        rowCount: Math.max(0, Math.trunc(args.rowCount ?? 0)),
        blockSize: Math.max(1, Math.trunc(args.blockSize ?? 120)),
        version: 0,
        pivotResultFields: [] as string[],
        isLoading: false,
        loadedRows: [] as GridRow[],
        rowIndexById: rowIndexByIdRef.current,
        getRow,
        getRowIndexById,
        isRowLoaded,
        ensureRange,
        refresh,
        getRowNode,
        applyTransaction,
        applyTransactionAsync,
        flushAsyncTransactions,
        retryFailedLoads,
        cancelOutstandingLoads,
        hierarchicalStoresActive: false,
      }),
      [
        applyTransaction,
        applyTransactionAsync,
        args.blockSize,
        args.rowCount,
        cancelOutstandingLoads,
        ensureRange,
        flushAsyncTransactions,
        getRow,
        getRowIndexById,
        getRowNode,
        isRowLoaded,
        refresh,
        retryFailedLoads,
      ],
    );
  },
  useServerRowModelApiRef: ({
    enabled,
    apiRef,
  }) => {
    useEffect(() => {
      if (!apiRef) return;
      apiRef.current = enabled ? null : null;
      return () => {
        apiRef.current = null;
      };
    }, [apiRef, enabled]);
  },
  useSsrmViewportScrollCycle: () => ({
    startSsrmScrollCycle: () => undefined,
  }),
  useSsrmGroupToggleOverlay: ({ ssrmRowCount }) => {
    const maskCacheRef = useRef<Map<string, GridRow>>(new Map());
    const handleServerGroupToggle = useCallback<
      ReturnType<typeof useSsrmGroupToggleOverlay>["handleServerGroupToggle"]
    >(() => undefined, []);
    const resolveServerGroupExpandedState = useCallback(
      (_path: string, fallback: boolean) => fallback,
      [],
    );
    const isServerGroupTogglePending = useCallback<
      ReturnType<typeof useSsrmGroupToggleOverlay>["isServerGroupTogglePending"]
    >(() => false, []);
    const getSsrmPendingPlaceholderRow = useCallback<
      ReturnType<
        typeof useSsrmGroupToggleOverlay
      >["getSsrmPendingPlaceholderRow"]
    >((_event, offset) => ({
        ...DEFAULT_SSRM_ROW,
        id: `__ssrm-pending__:${Math.max(0, Math.trunc(offset))}`,
      }), []);
    return useMemo(
      () => ({
        handleServerGroupToggle,
        resolveServerGroupExpandedState,
        isServerGroupTogglePending,
        hasPendingServerGroupCollapse: false,
        ssrmPendingPlaceholderOverlay: null,
        ssrmCollapsedPlaceholderMaskRowCacheRef: maskCacheRef,
        getSsrmPendingPlaceholderRow,
        ssrmViewRowCount: Math.max(0, Math.trunc(ssrmRowCount)),
      }),
      [
        getSsrmPendingPlaceholderRow,
        handleServerGroupToggle,
        isServerGroupTogglePending,
        resolveServerGroupExpandedState,
        ssrmRowCount,
      ],
    );
  },
  useSsrmLoadingUiState: () => {
    const globalLoadingIndicatorTimerRef =
      useRef<number | null>(null);
    const suppressNextGlobalLoadingIndicator = useCallback(
      () => undefined,
      [],
    );
    return useMemo(
      () => ({
        suppressNextGlobalLoadingIndicator,
        globalLoadingIndicatorTimerRef,
      }),
      [suppressNextGlobalLoadingIndicator],
    );
  },
  normalizeGridServerRequestColumns: normalizeServerRequestColumnsFallback,
  normalizeGridServerPivotValueColumns: normalizeServerPivotValueColumnsFallback,
  normalizeGridServerRowModelConfig: normalizeServerRowModelConfigFallback,
  buildServerGroupingRequest: ({
    enabled,
    columns,
    groupColumnKey,
    defaultExpanded,
    expansion,
  }) => {
    if (!enabled) return undefined;
    return {
      columns,
      groupColumnKey,
      defaultExpanded,
      expansion:
        expansion && Object.keys(expansion).length > 0 ? expansion : undefined,
    };
  },
  buildServerTreeDataRequest: ({
    enabled,
    groupColumnKey,
    defaultExpanded,
    expansion,
  }) => {
    if (!enabled) return undefined;
    return {
      enabled: true,
      groupColumnKey,
      defaultExpanded,
      expansion:
        expansion && Object.keys(expansion).length > 0 ? expansion : undefined,
    };
  },
  buildServerPivotRequest: ({
    enabled,
    groupColumns,
    pivotColumns,
    valueColumns,
    pivotMode = true,
    resultFieldSeparator,
  }) => {
    if (!enabled) return undefined;
    return {
      groupColumns,
      pivotColumns,
      valueColumns,
      pivotMode,
      resultFieldSeparator,
    };
  },
  buildServerHierarchyConfigKey: ({
    groupingEnabled,
    groupingColumns,
    groupingGroupColumnKey,
    groupingDefaultExpanded,
    treeDataEnabled,
    treeDataGroupColumnKey,
    treeDataDefaultExpanded,
  }) =>
    JSON.stringify({
      grouping: {
        enabled: groupingEnabled,
        columns: groupingColumns,
        groupColumnKey: groupingGroupColumnKey,
        defaultExpanded: groupingDefaultExpanded,
      },
      treeData: {
        enabled: treeDataEnabled,
        groupColumnKey: treeDataGroupColumnKey,
        defaultExpanded: treeDataDefaultExpanded,
      },
    }),
  resolveSsrmDisplayRowIndex: (displayIndex) => ({
    kind: "base",
    baseIndex: Math.max(0, Math.trunc(displayIndex)),
  }),
  mapSsrmBaseRowIndexToDisplay: (baseRowIndex) =>
    Math.max(0, Math.trunc(baseRowIndex)),
};

const runtimeModules: GridRuntimeModules = {
  advancedFiltering: defaultAdvancedFilteringModule,
  charts: defaultChartsModule,
  columnReorderBasic: defaultColumnReorderModule,
  contextMenuBase: defaultContextMenuBaseModule,
  contextMenuCustomization: defaultContextMenuCustomizationModule,
  excelIo: defaultExcelIoModule,
  floatingFilter: defaultFloatingFilterModule,
  formula: defaultFormulaModule,
  grouping: defaultGroupingModule,
  keyedHeaders: defaultKeyedHeadersModule,
  masterDetail: defaultMasterDetailModule,
  multiSort: defaultMultiSortModule,
  pinning: defaultPinningModule,
  reorder: defaultReorderModule,
  rowReorderBasic: defaultRowReorderModule,
  pivot: defaultPivotModule,
  sparkline: defaultSparklineModule,
  spanning: defaultSpanningModule,
  serverRowModel: defaultServerRowModelModule,
  treeData: defaultTreeDataModule,
  validation: defaultValidationModule,
};

export const registerGridRuntimeModules = (
  modules: Partial<GridRuntimeModules>,
) => {
  if (modules.advancedFiltering) {
    runtimeModules.advancedFiltering = modules.advancedFiltering;
  }
  if (modules.charts) {
    runtimeModules.charts = modules.charts;
  }
  if (modules.columnReorderBasic) {
    runtimeModules.columnReorderBasic = modules.columnReorderBasic;
  }
  if (modules.contextMenuBase) {
    runtimeModules.contextMenuBase = modules.contextMenuBase;
  }
  if (modules.contextMenuCustomization) {
    runtimeModules.contextMenuCustomization = modules.contextMenuCustomization;
  }
  if (modules.excelIo) {
    runtimeModules.excelIo = modules.excelIo;
  }
  if (modules.floatingFilter) {
    runtimeModules.floatingFilter = modules.floatingFilter;
  }
  if (modules.formula) {
    runtimeModules.formula = modules.formula;
  }
  if (modules.grouping) {
    runtimeModules.grouping = modules.grouping;
  }
  if (modules.keyedHeaders) {
    runtimeModules.keyedHeaders = modules.keyedHeaders;
  }
  if (modules.masterDetail) {
    runtimeModules.masterDetail = modules.masterDetail;
  }
  if (modules.multiSort) {
    runtimeModules.multiSort = modules.multiSort;
  }
  if (modules.pinning) {
    runtimeModules.pinning = modules.pinning;
  }
  if (modules.reorder) {
    runtimeModules.reorder = modules.reorder;
  }
  if (modules.rowReorderBasic) {
    runtimeModules.rowReorderBasic = modules.rowReorderBasic;
  }
  if (modules.pivot) {
    runtimeModules.pivot = modules.pivot;
  }
  if (modules.sparkline) {
    runtimeModules.sparkline = modules.sparkline;
  }
  if (modules.spanning) {
    runtimeModules.spanning = modules.spanning;
  }
  if (modules.serverRowModel) {
    runtimeModules.serverRowModel = modules.serverRowModel;
  }
  if (modules.treeData) {
    runtimeModules.treeData = modules.treeData;
  }
  if (modules.validation) {
    runtimeModules.validation = modules.validation;
  }
};

export const resetGridRuntimeModules = () => {
  runtimeModules.advancedFiltering = defaultAdvancedFilteringModule;
  runtimeModules.charts = defaultChartsModule;
  runtimeModules.columnReorderBasic = defaultColumnReorderModule;
  runtimeModules.contextMenuBase = defaultContextMenuBaseModule;
  runtimeModules.contextMenuCustomization =
    defaultContextMenuCustomizationModule;
  runtimeModules.excelIo = defaultExcelIoModule;
  runtimeModules.floatingFilter = defaultFloatingFilterModule;
  runtimeModules.formula = defaultFormulaModule;
  runtimeModules.grouping = defaultGroupingModule;
  runtimeModules.keyedHeaders = defaultKeyedHeadersModule;
  runtimeModules.masterDetail = defaultMasterDetailModule;
  runtimeModules.multiSort = defaultMultiSortModule;
  runtimeModules.pinning = defaultPinningModule;
  runtimeModules.reorder = defaultReorderModule;
  runtimeModules.rowReorderBasic = defaultRowReorderModule;
  runtimeModules.pivot = defaultPivotModule;
  runtimeModules.sparkline = defaultSparklineModule;
  runtimeModules.spanning = defaultSpanningModule;
  runtimeModules.serverRowModel = defaultServerRowModelModule;
  runtimeModules.treeData = defaultTreeDataModule;
  runtimeModules.validation = defaultValidationModule;
};

export const getGridRuntimeModules = (): GridRuntimeModules => runtimeModules;
