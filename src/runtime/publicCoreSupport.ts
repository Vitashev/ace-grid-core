// Core-only fallback contracts. Ignored inputs are accepted explicitly; concrete
// return types keep the shared renderer checked without importing paid modules.
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  GridColumn,
  GridRow,
  GridRowGroupSpan,
  GridRowGroup,
  GridSparklineProps,
  GridSparklineOptions,
  GridServerRowModelProps,
  GridServerRowGroupColumnRequest,
  GridServerRowModelPivotValueColumnRequest,
  GridServerRowModelApi,
  GridServerRowModelTransactionResult,
  GridValidationIndicator,
} from "../types";

export type FormulaReferenceRange = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

export type FormulaGridEvalOptions = {
  changedCells?: Array<{
    rowId?: string | number;
    columnKey?: string;
    rowIndex?: number;
    colIndex?: number;
  }>;
  fullRebuild?: boolean;
};

export type FormulaGridState = {
  columnsSignature: string;
  rowCount: number;
  mergedSignature: string;
  hasFormula: boolean;
  formulaCells: Map<string, unknown>;
  dependents: Map<string, Set<string>>;
  computedValues: Map<string, unknown>;
  mergedLookup: unknown;
};

export interface RowGroupingModel {
  rows: GridRow[];
  groupPaths: string[];
  nodes: Map<string, unknown>;
}

export type GridValidationDisplayConfig = {
  enabled: boolean;
  highlightInvalidCells: boolean;
  highlightWarnings: boolean;
  highlightInfo: boolean;
  showIndicator: boolean;
  indicator: GridValidationIndicator;
  showTooltip: boolean;
};

export interface SpanCoverage {
  spanStartLookup: Map<string, GridRowGroupSpan>;
  coveredCells: Set<string>;
}

export const spanCellKey = (row: number, col: number) => `${row}:${col}`;

export const buildSpanCoverage = (..._args: unknown[]): SpanCoverage => ({
  spanStartLookup: new Map(),
  coveredCells: new Set(),
});

export const useFormulaRangePick = (..._args: unknown[]) => ({
  handleGridPointerDownCapture: (..._args: unknown[]) => undefined,
});

export const buildRowGroupingModel = ({ rows }: { rows: GridRow[]; [key: string]: unknown }): RowGroupingModel => ({
  rows: rows.slice(),
  groupPaths: [],
  nodes: new Map(),
});

export const buildTreeDataModel = ({ rows }: { rows: GridRow[]; [key: string]: unknown }) => ({
  rows: rows.slice(),
  groupPaths: [],
});

export const exportGridToExcel = async (..._args: unknown[]) => undefined;
export const importGridFromExcel = async ({ columns }: { columns: GridColumn[]; [key: string]: unknown }) => ({
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
});

export const buildClientPivotDataset = ({
  rows,
  columns,
}: {
  rows: GridRow[];
  columns: GridColumn[];
  [key: string]: unknown;
}) => ({
  columns: columns.slice(),
  rows: rows.slice(),
  pivotResultFields: [] as string[],
});

export const buildPivotColumnsFromFields = ({
  sourceColumns,
}: {
  sourceColumns: GridColumn[];
  [key: string]: unknown;
}) => sourceColumns.slice();

export const IntegratedChartPanel: React.FC<{ model: unknown }> = () => null;
export const useGridChartsController = (params: any) => ({
  chartControls: params.chartsConfig?.controls,
  settingsPanelEnabled: false,
  defaultChartSettings: {},
  chartSettings: {},
  chartModel: null as { model: unknown } | null,
  chartTypes: params.chartsConfig?.chartTypes?.slice?.() ?? [],
  chartSeriesBy: params.chartsConfig?.seriesBy ?? "columns",
  seriesByOptions: ["columns", "rows"],
  chartGroupingOptions: [],
  chartGroupByKey: null,
  chartSamplingColumnOptions: [],
  chartOptions: params.chartsConfig?.options ?? {},
  chartMenuItems: [],
  createChartMenuPosition: params.chartsConfig?.createChartMenu?.position ?? "top",
  disabledChartTypes: new Set(),
  disabledSeriesBy: new Set(),
  handleChartTypeChange: (..._args: unknown[]) => undefined,
  handleSeriesByChange: (..._args: unknown[]) => undefined,
  handleGroupByChange: (..._args: unknown[]) => undefined,
  handleChartSettingsChange: (..._args: unknown[]) => undefined,
  closeChart: (..._args: unknown[]) => undefined,
});

export const useSpan = (..._args: unknown[]) => ({
  columnsWithAnySpan: new Set<string>(),
  isMergeBoundaryBlocked: (..._args: unknown[]) => false,
  rowHasSpans: (..._args: unknown[]) => false,
});

export const GridSparklineProvider: React.FC<React.PropsWithChildren<{ value?: GridSparklineProps }>> = ({ children }) =>
  React.createElement(React.Fragment, null, children);
export const Sparkline: React.FC<Record<string, unknown>> = () => null;
export const useGridSparkline = (..._args: unknown[]) => ({ enabled: false, defaultOptions: {} });
export const resolveSparklineOptions = (..._args: unknown[]): GridSparklineOptions | null => null;
export const normalizeSparklineData = (..._args: unknown[]) => null;
export const hasSparklineData = (..._args: unknown[]) => false;
export const buildSparklineTitle = (..._args: unknown[]) => null;

export const resolveGridTreeDataPathResolver = (..._args: unknown[]) => null;
export const resolveGridTreeDataPathColumnKeys = (..._args: unknown[]) => [];

export const useMasterDetail = ({ enabled }: { enabled?: boolean; [key: string]: unknown }) => {
  const expandedRowIdSet = useMemo<Set<string | number>>(() => new Set(), []);
  const isRowMaster = useCallback((..._args: unknown[]) => false, []);
  const isExpanded = useCallback((..._args: unknown[]) => false, []);
  const toggleRow = useCallback((..._args: unknown[]) => undefined, []);
  const collapseRow = useCallback((..._args: unknown[]) => undefined, []);
  const detailRowHeightOf = useCallback((..._args: unknown[]) => 0, []);
  const applyDetailHeights = useCallback((groups: GridRowGroup[]) => groups, []);
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
    [applyDetailHeights, collapseRow, detailRowHeightOf, enabled, expandedRowIdSet, isExpanded, isRowMaster, toggleRow],
  );
};

export const getValidationClassNames = (..._args: unknown[]) => [];
export const useGridValidation = (..._args: unknown[]) => ({
  validationState: new Map(),
  revision: 0,
  getCellValidation: () => null,
  validateCellValue: () => ({ state: null, results: [], hasErrors: false, pendingAsync: false }),
  previewCellValue: () => ({ state: null, results: [], hasErrors: false, pendingAsync: false }),
  validateVisibleRows: (..._args: unknown[]) => undefined,
  validateAll: (..._args: unknown[]) => undefined,
  clearValidation: (..._args: unknown[]) => undefined,
});
export const useGridValidationBridge = ({ indicator }: { indicator: GridValidationIndicator; [key: string]: unknown }) => ({
  validationDisplay: {
    enabled: false,
    highlightInvalidCells: false,
    highlightWarnings: false,
    highlightInfo: false,
    showIndicator: false,
    indicator,
    showTooltip: false,
  },
});

export const normalizeGridServerRequestColumns = (configured?: GridServerRowGroupColumnRequest[]) =>
  configured?.map(({ key, label }) => ({ key, label })) ?? [];
export const normalizeGridServerPivotValueColumns = (configured?: GridServerRowModelPivotValueColumnRequest[]) =>
  configured?.map(({ key, label, aggFunc }) => ({ key, label, aggFunc })) ?? [];
export const normalizeGridServerRowModelConfig = (props?: GridServerRowModelProps) => ({
  ...props,
  enabled: props?.enabled === true,
  grouping: { ...props?.grouping, enabled: false, columns: props?.grouping?.columns ?? [] },
  treeData: { ...props?.treeData, enabled: false },
  pivot: { ...props?.pivot, enabled: false, pivotColumns: props?.pivot?.pivotColumns ?? [], valueColumns: props?.pivot?.valueColumns ?? [] },
});
export const buildServerGroupingRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerTreeDataRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerPivotRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerHierarchyConfigKey = (args: any) => JSON.stringify(args ?? {});
export const resolveSsrmDisplayRowIndex = (displayIndex: number, ..._args: unknown[]):
  | { kind: "base"; baseIndex: number }
  | { kind: "pending"; event: unknown; offset: number } => ({
  kind: "base" as const,
  baseIndex: Math.max(0, Math.trunc(displayIndex)),
});
export const mapSsrmBaseRowIndexToDisplay = (baseRowIndex: number, ..._args: unknown[]) =>
  Math.max(0, Math.trunc(baseRowIndex));

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

export const useServerRowModel = (args: any) => {
  const rowIndexByIdRef = useRef<Map<string | number, number>>(new Map());
  const getRow = useCallback(
    (rowIndex: number): GridRow => ({
      id: `__ssrm-placeholder__:${Math.max(0, Math.trunc(rowIndex))}`,
      data: {},
    }),
    [],
  );
  return useMemo(
    () => ({
      rowCount: Math.max(0, Math.trunc(args?.rowCount ?? 0)),
      blockSize: Math.max(1, Math.trunc(args?.blockSize ?? 120)),
      version: 0,
      pivotResultFields: [] as string[],
      isLoading: false,
      loadedRows: [] as GridRow[],
      rowIndexById: rowIndexByIdRef.current,
      getRow,
      getRowIndexById: (..._args: unknown[]) => -1,
      isRowLoaded: (..._args: unknown[]) => false,
      ensureRange: (..._args: unknown[]) => undefined,
      refresh: (..._args: unknown[]) => undefined,
      getRowNode: (..._args: unknown[]) => null,
      applyTransaction: (..._args: unknown[]) => ({ ...DEFAULT_SSRM_TRANSACTION_RESULT }),
      applyTransactionAsync: (_transaction: unknown, callback?: (result: GridServerRowModelTransactionResult) => void) => {
        callback?.({ ...DEFAULT_SSRM_TRANSACTION_RESULT });
      },
      flushAsyncTransactions: (..._args: unknown[]) => undefined,
      retryFailedLoads: (..._args: unknown[]) => undefined,
      cancelOutstandingLoads: (..._args: unknown[]) => undefined,
      hierarchicalStoresActive: false,
    }),
    [args?.blockSize, args?.rowCount, getRow],
  );
};
export const useServerRowModelApiRef = ({ enabled, apiRef }: { enabled?: boolean; apiRef?: React.MutableRefObject<GridServerRowModelApi | null> | null; [key: string]: unknown }) => {
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = enabled ? null : null;
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, enabled]);
};
export const useSsrmViewportScrollCycle = (..._args: unknown[]) => ({ startSsrmScrollCycle: () => undefined });
export const useSsrmGroupToggleOverlay = ({ ssrmRowCount }: { ssrmRowCount: number; [key: string]: unknown }) => ({
  handleServerGroupToggle: (..._args: unknown[]) => undefined,
  resolveServerGroupExpandedState: (_path: string, fallback: boolean) => fallback,
  isServerGroupTogglePending: (..._args: unknown[]) => false,
  hasPendingServerGroupCollapse: false,
  ssrmPendingPlaceholderOverlay: null as { key: string } | null,
  ssrmCollapsedPlaceholderMaskRowCacheRef: useRef<Map<string, GridRow>>(new Map()),
  getSsrmPendingPlaceholderRow: (_event: unknown, offset: number): GridRow => ({
    id: `__ssrm-pending__:${Math.max(0, Math.trunc(offset))}`,
    data: {},
  }),
  ssrmViewRowCount: Math.max(0, Math.trunc(ssrmRowCount)),
});
export const useSsrmLoadingUiState = (..._args: unknown[]) => ({
  suppressNextGlobalLoadingIndicator: (..._args: unknown[]) => undefined,
  globalLoadingIndicatorTimerRef: useRef<number | null>(null),
});
