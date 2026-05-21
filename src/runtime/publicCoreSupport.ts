import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  GridColumn,
  GridMergedCell,
  GridRow,
  GridRowGroupSpan,
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

export const buildSpanCoverage = (): SpanCoverage => ({
  spanStartLookup: new Map(),
  coveredCells: new Set(),
});

export const useFormulaRangePick = () => ({
  handleGridPointerDownCapture: () => undefined,
});

export const buildRowGroupingModel = ({ rows }: { rows: GridRow[] }): RowGroupingModel => ({
  rows: rows.slice(),
  groupPaths: [],
  nodes: new Map(),
});

export const buildTreeDataModel = ({ rows }: { rows: GridRow[] }) => ({
  rows: rows.slice(),
  groupPaths: [],
});

export const exportGridToExcel = async () => undefined;
export const importGridFromExcel = async ({ columns }: { columns: GridColumn[] }) => ({
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
}) => ({
  columns: columns.slice(),
  rows: rows.slice(),
  pivotResultFields: [],
});

export const buildPivotColumnsFromFields = ({
  sourceColumns,
}: {
  sourceColumns: GridColumn[];
}) => sourceColumns.slice();

export const IntegratedChartPanel = () => null;
export const useGridChartsController = (params: any) => ({
  chartControls: params.chartsConfig?.controls,
  settingsPanelEnabled: false,
  defaultChartSettings: {},
  chartSettings: {},
  chartModel: null,
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
  handleChartTypeChange: () => undefined,
  handleSeriesByChange: () => undefined,
  handleGroupByChange: () => undefined,
  handleChartSettingsChange: () => undefined,
  closeChart: () => undefined,
});

export const useSpan = () => ({
  columnsWithAnySpan: new Set<string>(),
  isMergeBoundaryBlocked: () => false,
  rowHasSpans: () => false,
});

export const GridSparklineProvider: React.FC<React.PropsWithChildren> = ({ children }) =>
  React.createElement(React.Fragment, null, children);
export const Sparkline = () => null;
export const useGridSparkline = () => ({ enabled: false, defaultOptions: {} });
export const resolveSparklineOptions = () => null;
export const normalizeSparklineData = () => null;
export const hasSparklineData = () => false;
export const buildSparklineTitle = () => null;

export const resolveGridTreeDataPathResolver = () => null;
export const resolveGridTreeDataPathColumnKeys = () => [];

export const useMasterDetail = ({ enabled }: { enabled?: boolean }) => {
  const expandedRowIdSet = useMemo<Set<string | number>>(() => new Set(), []);
  const isRowMaster = useCallback(() => false, []);
  const isExpanded = useCallback(() => false, []);
  const toggleRow = useCallback(() => undefined, []);
  const collapseRow = useCallback(() => undefined, []);
  const detailRowHeightOf = useCallback(() => 0, []);
  const applyDetailHeights = useCallback((groups: unknown) => groups, []);
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

export const getValidationClassNames = () => [];
export const useGridValidation = () => ({
  validationState: new Map(),
  revision: 0,
  getCellValidation: () => null,
  validateCellValue: () => ({ state: null, results: [], hasErrors: false, pendingAsync: false }),
  previewCellValue: () => ({ state: null, results: [], hasErrors: false, pendingAsync: false }),
  validateVisibleRows: () => undefined,
  validateAll: () => undefined,
  clearValidation: () => undefined,
});
export const useGridValidationBridge = ({ indicator }: { indicator: GridValidationIndicator }) => ({
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

export const normalizeGridServerRequestColumns = (configured?: GridColumn[]) =>
  Array.isArray(configured) ? configured.map((column) => ({ key: column.key, label: column.label })) : [];
export const normalizeGridServerPivotValueColumns = normalizeGridServerRequestColumns;
export const normalizeGridServerRowModelConfig = (props: any) => ({ enabled: props?.enabled === true });
export const buildServerGroupingRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerTreeDataRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerPivotRequest = (args: any) => (args?.enabled ? args : undefined);
export const buildServerHierarchyConfigKey = (args: any) => JSON.stringify(args ?? {});
export const resolveSsrmDisplayRowIndex = (displayIndex: number) => ({
  kind: "base" as const,
  baseIndex: Math.max(0, Math.trunc(displayIndex)),
});
export const mapSsrmBaseRowIndexToDisplay = (baseRowIndex: number) =>
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
      pivotResultFields: [],
      isLoading: false,
      loadedRows: [],
      rowIndexById: rowIndexByIdRef.current,
      getRow,
      getRowIndexById: () => -1,
      isRowLoaded: () => false,
      ensureRange: () => undefined,
      refresh: () => undefined,
      getRowNode: () => null,
      applyTransaction: () => ({ ...DEFAULT_SSRM_TRANSACTION_RESULT }),
      applyTransactionAsync: (_transaction: unknown, callback?: (result: typeof DEFAULT_SSRM_TRANSACTION_RESULT) => void) => {
        callback?.({ ...DEFAULT_SSRM_TRANSACTION_RESULT });
      },
      flushAsyncTransactions: () => undefined,
      retryFailedLoads: () => undefined,
      cancelOutstandingLoads: () => undefined,
      hierarchicalStoresActive: false,
    }),
    [args?.blockSize, args?.rowCount, getRow],
  );
};
export const useServerRowModelApiRef = ({ enabled, apiRef }: { enabled?: boolean; apiRef?: React.MutableRefObject<unknown> }) => {
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = enabled ? null : null;
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, enabled]);
};
export const useSsrmViewportScrollCycle = () => ({ startSsrmScrollCycle: () => undefined });
export const useSsrmGroupToggleOverlay = ({ ssrmRowCount }: { ssrmRowCount: number }) => ({
  handleServerGroupToggle: () => undefined,
  resolveServerGroupExpandedState: (_path: string, fallback: boolean) => fallback,
  isServerGroupTogglePending: () => false,
  hasPendingServerGroupCollapse: false,
  ssrmPendingPlaceholderOverlay: null,
  ssrmCollapsedPlaceholderMaskRowCacheRef: useRef<Map<string, GridRow>>(new Map()),
  getSsrmPendingPlaceholderRow: (_event: unknown, offset: number): GridRow => ({
    id: `__ssrm-pending__:${Math.max(0, Math.trunc(offset))}`,
    data: {},
  }),
  ssrmViewRowCount: Math.max(0, Math.trunc(ssrmRowCount)),
});
export const useSsrmLoadingUiState = () => ({
  suppressNextGlobalLoadingIndicator: () => undefined,
  globalLoadingIndicatorTimerRef: useRef<number | null>(null),
});
