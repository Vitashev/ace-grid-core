import React from "react";
import type { ComponentType } from "react";

import { ACE_GRID_ANGULAR_DEFAULT_TAG_NAME } from "./angular";
import type {
  GridColumn,
  GridColumnDef,
  GridFilterConfig,
  GridMergedCell,
  GridPinnedColumns,
  GridPinnedRows,
  GridProps,
  GridRow,
  GridSelection,
  GridSortConfig,
} from "./types";
import type {
  GridActions,
  UseGridChartViewState,
  UseGridOptions,
  UseGridPaginationViewState,
  UseGridPivotStateValue,
} from "./hooks/useGrid";
import { defineAceGridHookElement } from "./wc";

type GridUseGridHook = (
  options: UseGridOptions,
) => [GridRow[], GridActions];

type AngularTierHookOptions = UseGridOptions & {
  controlledRows?: GridRow[];
  controlledColumnDefs?: GridColumnDef[];
  controlledSortModel?: GridSortConfig[];
  controlledFilters?: GridFilterConfig[];
  controlledSelection?: GridSelection | null;
  controlledPinnedColumns?: GridPinnedColumns;
  controlledPinnedRows?: GridPinnedRows;
  controlledMergedCells?: GridMergedCell[];
  controlledPagination?: Partial<UseGridPaginationViewState>;
  controlledChart?: Partial<UseGridChartViewState>;
  controlledPivot?: Partial<UseGridPivotStateValue>;
  controlledFloatingFilters?: boolean;
  controlledFloatingFilterDebounceMs?: number;
  controlledAdvancedMultiFilter?: boolean;
};

const isColumnGroupDef = (def: GridColumnDef): def is GridColumnDef & {
  children: GridColumnDef[];
} => Array.isArray((def as { children?: GridColumnDef[] }).children);

const collectLeafColumns = (
  defs: GridColumnDef[] | undefined,
  acc: GridColumn[] = [],
): GridColumn[] => {
  if (!Array.isArray(defs)) return acc;
  defs.forEach((def) => {
    if (isColumnGroupDef(def)) {
      collectLeafColumns(def.children, acc);
      return;
    }
    acc.push(def as GridColumn);
  });
  return acc;
};

const collectLeafColumnKeys = (defs: GridColumnDef[] | undefined) =>
  collectLeafColumns(defs).map((column) => column.key);

const resolveControlledSortModel = (
  sorting?: GridProps["sorting"],
): GridSortConfig[] | undefined => {
  if (Array.isArray(sorting?.sortModel)) return sorting.sortModel;
  if (sorting?.sortColumn && sorting.sortDirection) {
    return [
      {
        columnKey: sorting.sortColumn,
        direction: sorting.sortDirection,
      },
    ];
  }
  return undefined;
};

const useAngularTierGrid = (
  useGridHook: GridUseGridHook,
  options: AngularTierHookOptions,
): [GridRow[], GridActions] => {
  const {
    controlledRows,
    controlledColumnDefs,
    controlledSortModel,
    controlledFilters,
    controlledSelection,
    controlledPinnedColumns,
    controlledPinnedRows,
    controlledMergedCells,
    controlledPagination,
    controlledChart,
    controlledPivot,
    controlledFloatingFilters,
    controlledFloatingFilterDebounceMs,
    controlledAdvancedMultiFilter,
    ...useGridOptions
  } = options;

  const [rows, actions] = useGridHook(useGridOptions);
  const rowsInitializedRef = React.useRef(controlledRows === undefined);

  React.useEffect(() => {
    if (!Array.isArray(controlledColumnDefs) || controlledColumnDefs.length === 0) {
      return;
    }
    actions.setColumnDefs(controlledColumnDefs);
    const leafKeys = collectLeafColumnKeys(controlledColumnDefs);
    if (leafKeys.length > 0) {
      actions.updateColumnOrder(leafKeys);
    }
  }, [controlledColumnDefs]);

  React.useEffect(() => {
    if (controlledRows === undefined) return;
    if (!rowsInitializedRef.current) {
      rowsInitializedRef.current = true;
      return;
    }
    actions.replaceRows(controlledRows);
  }, [controlledRows]);

  React.useEffect(() => {
    if (controlledSortModel === undefined) return;
    actions.setSortModel(controlledSortModel);
  }, [controlledSortModel]);

  React.useEffect(() => {
    if (controlledFilters === undefined) return;
    actions.setActiveFilters(controlledFilters);
  }, [controlledFilters]);

  React.useEffect(() => {
    const hasFilterStateOverride =
      controlledFloatingFilters !== undefined ||
      controlledFloatingFilterDebounceMs !== undefined ||
      controlledAdvancedMultiFilter !== undefined;
    if (!hasFilterStateOverride) return;
    actions.filtering.set({
      enableFloatingFilters:
        controlledFloatingFilters ?? actions.filtering.enableFloatingFilters,
      floatingFilterDebounceMs:
        controlledFloatingFilterDebounceMs ??
        actions.filtering.floatingFilterDebounceMs,
      enableAdvancedMultiFilter:
        controlledAdvancedMultiFilter ??
        actions.filtering.enableAdvancedMultiFilter,
    });
  }, [
    controlledAdvancedMultiFilter,
    controlledFloatingFilterDebounceMs,
    controlledFloatingFilters,
  ]);

  React.useEffect(() => {
    if (controlledSelection === undefined) return;
    actions.setSelection(controlledSelection);
  }, [controlledSelection]);

  React.useEffect(() => {
    if (controlledPinnedColumns === undefined) return;
    actions.setPinnedColumns(controlledPinnedColumns);
  }, [controlledPinnedColumns]);

  React.useEffect(() => {
    if (controlledPinnedRows === undefined) return;
    actions.setPinnedRows(controlledPinnedRows);
  }, [controlledPinnedRows]);

  React.useEffect(() => {
    if (controlledMergedCells === undefined) return;
    actions.setMergedCells(controlledMergedCells);
  }, [controlledMergedCells]);

  React.useEffect(() => {
    if (controlledPagination === undefined) return;
    actions.pagination.set(controlledPagination);
  }, [controlledPagination]);

  React.useEffect(() => {
    if (controlledChart === undefined) return;
    actions.chart.set(controlledChart);
  }, [controlledChart]);

  React.useEffect(() => {
    if (controlledPivot === undefined) return;
    actions.pivot.set(controlledPivot);
  }, [controlledPivot]);

  return [rows, actions];
};

export const registerAceGridAngularDefaultElement = <
  TProps extends Partial<GridProps>,
>(
  GridComponent: ComponentType<TProps>,
  useGridHook: GridUseGridHook,
) => {
  if (typeof customElements === "undefined") return;

  defineAceGridHookElement<
    TProps,
    AngularTierHookOptions,
    GridRow[],
    GridActions
  >(
    ACE_GRID_ANGULAR_DEFAULT_TAG_NAME,
    (hookOptions) => useAngularTierGrid(useGridHook, hookOptions),
    GridComponent,
    {
      mapHookOptions(hookOptions, host) {
        const grid = (host.gridProps ?? {}) as Partial<GridProps>;
        const data = grid.data;
        const sorting = grid.sorting;
        const filter = grid.filter;
        const selection = grid.selection;
        const pinning = grid.pinning;
        const spanning = grid.spanning;
        const reorder = grid.reorder;
        const pagination = grid.pagination;
        const charts = grid.charts;
        const pivot = grid.pivot;
        const controlledColumnDefs = Array.isArray(data?.columns)
          ? data.columns
          : undefined;

        return {
          ...hookOptions,
          columns:
            controlledColumnDefs != null
              ? collectLeafColumns(controlledColumnDefs)
              : hookOptions.columns,
          initialRows: data?.rows ?? hookOptions.initialRows,
          enableFormulaBar:
            hookOptions.enableFormulaBar ??
            grid.formula?.enableFormulaBar,
          enableFiltering:
            hookOptions.enableFiltering ??
            (filter !== undefined ? true : undefined),
          enableCellSpanning:
            hookOptions.enableCellSpanning ??
            grid.spanning?.enableCellSpanning,
          horizontalVirtualization:
            hookOptions.horizontalVirtualization ??
            grid.virtual?.enableHorizontalVirtualization,
          verticalVirtualization:
            hookOptions.verticalVirtualization ??
            grid.virtual?.enableVirtualization,
          cellContentVirtualization:
            hookOptions.cellContentVirtualization ??
            grid.virtual?.enableCellContentVirtualization,
          isRowPinning:
            hookOptions.isRowPinning ??
            pinning?.isRowPinning,
          isColReorder:
            hookOptions.isColReorder ??
            reorder?.isColReorder,
          isRowReorder:
            hookOptions.isRowReorder ??
            reorder?.isRowReorder,
          formulaReferenceMode:
            hookOptions.formulaReferenceMode ??
            grid.formula?.formulaReferenceMode,
          columnReorderMode:
            hookOptions.columnReorderMode ??
            reorder?.columnReorderMode,
          rowReorderMode:
            hookOptions.rowReorderMode ??
            reorder?.rowReorderMode,
          isRowSelection:
            hookOptions.isRowSelection ??
            selection?.isRowSelection,
          sortMode:
            hookOptions.sortMode ??
            sorting?.sortMode,
          initialSortModel:
            hookOptions.initialSortModel ??
            resolveControlledSortModel(sorting),
          pagination: hookOptions.pagination ?? pagination,
          chartDefaults:
            hookOptions.chartDefaults ??
            (charts
              ? {
                  autoSortCategories: charts.autoSortCategories,
                  uniqueCategories: charts.uniqueCategories,
                  uniqueCategoryMode: charts.uniqueCategoryMode,
                  categoryAggregation: charts.categoryAggregation,
                  scatterCategoryMode: charts.scatterCategoryMode,
                  normalization: charts.normalization,
                  missingValueMode: charts.missingValueMode,
                  timeBucket: charts.timeBucket,
                  initialBrushRowIds: charts.initialBrushRowIds,
                  sampling: charts.sampling
                    ? {
                        mode: charts.sampling.mode,
                        size: charts.sampling.size,
                        seed: charts.sampling.seed,
                        columnKey: charts.sampling.columnKey,
                      }
                    : undefined,
                  histogramBins: charts.options?.histogram?.bins,
                  boxShowOutliers: charts.options?.boxPlot?.showOutliers,
                  violinShowMedian: charts.options?.violin?.showMedian,
                  axis: charts.options?.axis
                    ? {
                        xScale: charts.options.axis.x?.scale,
                        yScale: charts.options.axis.y?.scale,
                        showAllXTicks: charts.options.axis.x?.showAllTicks,
                        showAllYTicks: charts.options.axis.y?.showAllTicks,
                        autoFitTicks:
                          charts.options.axis.x?.autoFitTicks ??
                          charts.options.axis.y?.autoFitTicks,
                      }
                    : undefined,
                  seriesByMode: charts.seriesBy,
                }
              : undefined),
          pivotDefaults:
            hookOptions.pivotDefaults ??
            (pivot
              ? {
                  enabled: pivot.enabled,
                  groupColumns: pivot.groupColumns,
                  pivotColumns: pivot.pivotColumns,
                  valueColumns: pivot.valueColumns,
                  pivotMode: pivot.pivotMode,
                  resultFieldSeparator: pivot.resultFieldSeparator,
                }
              : undefined),
          controlledRows: data?.rows,
          controlledColumnDefs,
          controlledSortModel: resolveControlledSortModel(sorting),
          controlledFilters: filter?.activeFilters,
          controlledSelection: selection?.selection,
          controlledPinnedColumns: pinning?.pinnedColumns,
          controlledPinnedRows: pinning?.pinnedRows,
          controlledMergedCells: spanning?.initialMergedCells,
          controlledPagination: pagination,
          controlledChart: charts
            ? {
                enabled: charts.enabled,
                createChartMenuEnabled: charts.createChartMenu?.enabled,
                autoUpdateSelection: charts.autoUpdateSelection,
                autoDetectChartType: charts.autoDetectChartType,
                enableDownload: charts.controls?.downloadAction?.enabled,
                showTypeSelector: charts.controls?.showTypeSelector,
                showSeriesBy: charts.controls?.showSeriesBy,
                showGroupBy: charts.controls?.showGroupBy,
                showMappingSummary: charts.controls?.showMappingSummary,
                enableBrushSelection: charts.controls?.enableBrushSelection,
                brushSelectionModifier: charts.controls?.brushSelectionModifier,
                useCustomIcons: undefined,
              }
            : undefined,
          controlledPivot: pivot
            ? {
                enabled: pivot.enabled,
                groupColumns: pivot.groupColumns ?? [],
                pivotColumns: pivot.pivotColumns ?? [],
                valueColumns: pivot.valueColumns ?? [],
                pivotMode: pivot.pivotMode ?? true,
                resultFieldSeparator: pivot.resultFieldSeparator ?? "_",
              }
            : undefined,
          controlledFloatingFilters: filter?.enableFloatingFilters,
          controlledFloatingFilterDebounceMs:
            filter?.floatingFilterDebounceMs,
          controlledAdvancedMultiFilter:
            filter?.enableAdvancedMultiFilter,
        } satisfies AngularTierHookOptions;
      },
      mapGridProps({ gridProps, hookOptions, rows, actions, host }) {
        const grid = (gridProps ?? {}) as Partial<GridProps>;
        const opts = hookOptions;
        const hostRect = host.getBoundingClientRect();
        const layout = grid.layout ?? {
          width: Math.max(480, Math.floor(hostRect.width || 960)),
          height: Math.max(320, Math.floor(hostRect.height || 540)),
        };
        const columnDefs =
          actions.columnDefs.length > 0
            ? actions.columnDefs
            : opts.controlledColumnDefs ??
              opts.columns ??
              grid.data?.columns ??
              [];
        const filteringEnabled =
          actions.enableFiltering || grid.filter !== undefined;
        const selectionEnabled =
          grid.selection !== undefined ||
          actions.isRowSelection ||
          actions.selection != null;
        const pinningEnabled =
          grid.pinning !== undefined ||
          actions.isRowPinning ||
          actions.pinnedColumns.left.length > 0 ||
          actions.pinnedColumns.right.length > 0 ||
          actions.pinnedRows.top.length > 0 ||
          actions.pinnedRows.bottom.length > 0;
        const reorderEnabled =
          grid.reorder !== undefined ||
          actions.isColReorder ||
          actions.isRowReorder;
        const formulaEnabled =
          grid.formula !== undefined || actions.enableFormulaBar;
        const paginationEnabled =
          grid.pagination !== undefined || actions.pagination.enabled;
        const chartsEnabled =
          grid.charts !== undefined || actions.chart.enabled;
        const pivotEnabled =
          grid.pivot !== undefined || actions.pivot.enabled;

        return {
          ...grid,
          data: {
            rows,
            columns: columnDefs,
          },
          layout,
          columns: {
            ...grid.columns,
            columnWidths: {
              ...(grid.columns?.columnWidths ?? {}),
              ...actions.columnWidths,
            },
          },
          rowsConfig: {
            ...grid.rowsConfig,
            rowHeights: {
              ...(grid.rowsConfig?.rowHeights ?? {}),
              ...actions.rowHeights,
            },
          },
          formula: formulaEnabled
            ? {
                ...grid.formula,
                enableFormulaBar: actions.enableFormulaBar,
              }
            : undefined,
          filter: filteringEnabled
            ? {
                ...grid.filter,
                activeFilters: actions.activeFilters,
                onFilter: grid.filter?.onFilter ?? actions.setFilter,
                enableFloatingFilters:
                  actions.filtering.enableFloatingFilters,
                floatingFilterDebounceMs:
                  actions.filtering.floatingFilterDebounceMs,
                enableAdvancedMultiFilter:
                  actions.filtering.enableAdvancedMultiFilter,
              }
            : undefined,
          selection: selectionEnabled
            ? {
                ...grid.selection,
                selection: actions.selection,
                isRowSelection: actions.isRowSelection,
                onSelectionRangeChange: (nextSelection) => {
                  if (nextSelection) {
                    actions.setSelection(nextSelection);
                  } else {
                    actions.clearSelection();
                  }
                  grid.selection?.onSelectionRangeChange?.(nextSelection);
                },
                onRowSelectionChange: (ids, meta) => {
                  actions.setSelectedRowIds(ids);
                  actions.updateRowsSelection(ids);
                  grid.selection?.onRowSelectionChange?.(ids, meta);
                },
                onColumnSelectionChange: (keys, meta) => {
                  actions.setSelectedColumnKeys(keys);
                  grid.selection?.onColumnSelectionChange?.(keys, meta);
                },
              }
            : undefined,
          edit: {
            ...grid.edit,
            onCellChange:
              grid.edit?.onCellChange ??
              ((rowId, columnKey, value) =>
                actions.updateCell(rowId, columnKey, value)),
            onRowAdd:
              grid.edit?.onRowAdd ??
              (() => actions.appendRow({})),
            onRowDelete:
              grid.edit?.onRowDelete ??
              ((rowIds) => actions.deleteRows(rowIds)),
          },
          sorting: {
            ...grid.sorting,
            sortMode: actions.sortMode,
            sortColumn: actions.sortColumn,
            sortDirection: actions.sortDirection,
            sortModel: actions.sortModel,
            onSort: grid.sorting?.onSort ?? actions.setSorting,
            onSortModelChange:
              grid.sorting?.onSortModelChange ?? actions.setSortModel,
          },
          pinning: pinningEnabled
            ? {
                ...grid.pinning,
                isRowPinning: actions.isRowPinning,
                pinnedColumns: actions.pinnedColumns,
                pinnedRows: actions.pinnedRows,
                onPinColumn:
                  grid.pinning?.onPinColumn ?? actions.pinColumn,
                onPinColumnAtPosition:
                  grid.pinning?.onPinColumnAtPosition ??
                  actions.pinColumnAtPosition,
                onPinAndPositionColumn:
                  grid.pinning?.onPinAndPositionColumn ??
                  actions.pinAndPositionColumn,
                onPinnedColumnReorder:
                  grid.pinning?.onPinnedColumnReorder ??
                  actions.reorderPinnedColumns,
                onPinRow:
                  grid.pinning?.onPinRow ?? actions.pinRow,
                onPinRowAtPosition:
                  grid.pinning?.onPinRowAtPosition ??
                  actions.pinRowAtPosition,
                onPinMultipleRowsAtPosition:
                  grid.pinning?.onPinMultipleRowsAtPosition ??
                  actions.pinMultipleRowsAtPosition,
                onPinAndPositionRow:
                  grid.pinning?.onPinAndPositionRow ??
                  actions.pinAndPositionRow,
                onPinnedRowReorder:
                  grid.pinning?.onPinnedRowReorder ??
                  actions.reorderPinnedRows,
                onReorderMultiplePinnedRows:
                  grid.pinning?.onReorderMultiplePinnedRows ??
                  actions.reorderMultiplePinnedRows,
              }
            : undefined,
          reorder: reorderEnabled
            ? {
                ...grid.reorder,
                isColReorder: actions.isColReorder,
                isRowReorder: actions.isRowReorder,
                onColumnReorder:
                  grid.reorder?.onColumnReorder ??
                  actions.reorderColumns,
                onRowReorder:
                  grid.reorder?.onRowReorder ?? actions.reorderRows,
                onMultiRowReorder:
                  grid.reorder?.onMultiRowReorder ??
                  actions.reorderMultipleRows,
                onMultiColumnReorder:
                  grid.reorder?.onMultiColumnReorder ??
                  actions.reorderMultipleColumns,
                onUpdateColumnOrder:
                  grid.reorder?.onUpdateColumnOrder ??
                  actions.updateColumnOrder,
                onColumnGroupsChange:
                  grid.reorder?.onColumnGroupsChange ??
                  actions.setColumnDefs,
              }
            : undefined,
          resize: {
            ...grid.resize,
            onColumnResize:
              grid.resize?.onColumnResize ??
              ((key, width) =>
                actions.updateColumnWidths({ [key]: width })),
            onRowResize:
              grid.resize?.onRowResize ??
              ((rowId, height) => actions.setRowHeight(rowId, height)),
          },
          spanning:
            grid.spanning !== undefined ||
            actions.mergedCells.length > 0 ||
            actions.enableCellSpanning
              ? {
                  ...grid.spanning,
                  enableCellSpanning: actions.enableCellSpanning,
                  initialMergedCells: actions.mergedCells,
                  onMergedCellsChange:
                    grid.spanning?.onMergedCellsChange ??
                    actions.setMergedCells,
                }
              : undefined,
          pagination: paginationEnabled
            ? {
                ...grid.pagination,
                enabled: actions.pagination.enabled,
                mode: actions.pagination.mode,
                pageIndex: actions.pagination.pageIndex,
                pageSize: actions.pagination.pageSize,
                pageSizeOptions: actions.pagination.pageSizeOptions,
                totalRowCount:
                  grid.pagination?.totalRowCount ??
                  actions.pagination.totalRowCount,
                keepPageOnSizeChange:
                  actions.pagination.keepPageOnSizeChange,
                showPageSize: actions.pagination.showPageSize,
                showRange: actions.pagination.showRange,
                showPageInfo: actions.pagination.showPageInfo,
                showControls: actions.pagination.showControls,
                showFirstLast: actions.pagination.showFirstLast,
                disabled: actions.pagination.disabled,
                onPageChange:
                  grid.pagination?.onPageChange ??
                  ((pageIndex) => actions.pagination.setPageIndex(pageIndex)),
                onPageSizeChange:
                  grid.pagination?.onPageSizeChange ??
                  ((pageSize) => {
                    actions.pagination.setPageSize(pageSize);
                    actions.pagination.setPageIndex(0);
                  }),
              }
            : undefined,
          charts: chartsEnabled
            ? {
                ...grid.charts,
                enabled: actions.chart.enabled,
                createChartMenu: {
                  ...grid.charts?.createChartMenu,
                  enabled: actions.chart.createChartMenuEnabled,
                },
                autoUpdateSelection: actions.chart.autoUpdateSelection,
                autoDetectChartType: actions.chart.autoDetectChartType,
                controls: {
                  ...grid.charts?.controls,
                  showTypeSelector: actions.chart.controls.showTypeSelector,
                  showSeriesBy: actions.chart.controls.showSeriesBy,
                  showGroupBy: actions.chart.controls.showGroupBy,
                  showMappingSummary:
                    actions.chart.controls.showMappingSummary,
                  enableBrushSelection:
                    actions.chart.controls.enableBrushSelection,
                  brushSelectionModifier:
                    actions.chart.controls.brushSelectionModifier,
                  downloadAction: {
                    ...grid.charts?.controls?.downloadAction,
                    enabled: actions.chart.enableDownload,
                  },
                },
                onBrushSelection:
                  grid.charts?.onBrushSelection ??
                  actions.chartBrush.onBrushSelection,
                onSettingsChange:
                  grid.charts?.onSettingsChange ??
                  actions.chart.handleSettingsChange,
              }
            : undefined,
          pivot: pivotEnabled
            ? {
                ...grid.pivot,
                enabled: actions.pivot.enabled,
                groupColumns: actions.pivot.groupColumns,
                pivotColumns: actions.pivot.pivotColumns,
                valueColumns: actions.pivot.valueColumns,
                pivotMode: actions.pivot.pivotMode,
                resultFieldSeparator:
                  actions.pivot.resultFieldSeparator,
              }
            : undefined,
        } as TProps;
      },
    },
  );
};
