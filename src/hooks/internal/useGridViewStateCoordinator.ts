import { useCallback } from "react";

import type {
  GridPinnedColumns,
  GridPinnedRows,
  GridRowGroupingOptions,
  GridSelection,
  GridSortConfig,
} from "../../types";
import type {
  UseGridChartState,
  UseGridChartViewState,
  UseGridFeatureFlagsState,
  UseGridFeatureFlagsStateValue,
  UseGridFilteringState,
  UseGridFilteringStateValue,
  UseGridPaginationState,
  UseGridPaginationViewState,
  UseGridPivotState,
  UseGridPivotStateValue,
  UseGridSearchState,
  UseGridSearchStateValue,
  UseGridSparklineState,
  UseGridSparklineStateValue,
  UseGridValidationState,
  UseGridValidationStateValue,
  UseGridViewState,
} from "../useGrid";

type UseGridViewStateCoordinatorArgs = {
  currentFeatureFlags: UseGridFeatureFlagsStateValue;
  currentFiltering: UseGridFilteringStateValue;
  currentSearch: UseGridSearchStateValue;
  currentValidation: UseGridValidationStateValue;
  currentPagination: UseGridPaginationViewState;
  currentChart: UseGridChartViewState;
  currentSparkline: UseGridSparklineStateValue;
  currentPivot: UseGridPivotStateValue;
  currentPinnedColumns: GridPinnedColumns;
  currentPinnedRows: GridPinnedRows;
  currentSortModel: GridSortConfig[];
  currentSelection: GridSelection | null;
  currentSelectedRowIds: Array<string | number>;
  currentSelectedColumnKeys: string[];
  currentRowGrouping: GridRowGroupingOptions | null;
  featureFlagsState: UseGridFeatureFlagsState;
  filteringState: UseGridFilteringState;
  searchState: UseGridSearchState;
  validationState: UseGridValidationState;
  paginationState: UseGridPaginationState;
  chartState: UseGridChartState;
  sparklineState: UseGridSparklineState;
  pivotState: UseGridPivotState;
  setPinnedColumns: (value: GridPinnedColumns) => void;
  setPinnedRows: (value: GridPinnedRows) => void;
  setSortModel: (model: GridSortConfig[]) => void;
  setSelection: (selection: GridSelection | null) => void;
  setSelectedRowIds: (ids: Array<string | number>) => void;
  setSelectedColumnKeys: (keys: string[]) => void;
  setRowGrouping: (value: GridRowGroupingOptions | null) => void;
};

export const useGridViewStateCoordinator = ({
  currentFeatureFlags,
  currentFiltering,
  currentSearch,
  currentValidation,
  currentPagination,
  currentChart,
  currentSparkline,
  currentPivot,
  currentPinnedColumns,
  currentPinnedRows,
  currentSortModel,
  currentSelection,
  currentSelectedRowIds,
  currentSelectedColumnKeys,
  currentRowGrouping,
  featureFlagsState,
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
}: UseGridViewStateCoordinatorArgs) => {
  const getViewState = useCallback<() => UseGridViewState>(
    () => ({
      featureFlags: currentFeatureFlags,
      filtering: currentFiltering,
      search: currentSearch,
      validation: currentValidation,
      pagination: currentPagination,
      chart: currentChart,
      sparkline: currentSparkline,
      pivot: currentPivot,
      pinnedColumns: currentPinnedColumns,
      pinnedRows: currentPinnedRows,
      sortModel: currentSortModel,
      selection: currentSelection,
      selectedRowIds: currentSelectedRowIds,
      selectedColumnKeys: currentSelectedColumnKeys,
      rowGrouping: currentRowGrouping,
    }),
    [
      currentFeatureFlags,
      currentFiltering,
      currentSearch,
      currentValidation,
      currentPagination,
      currentChart,
      currentSparkline,
      currentPivot,
      currentPinnedColumns,
      currentPinnedRows,
      currentSortModel,
      currentSelection,
      currentSelectedRowIds,
      currentSelectedColumnKeys,
      currentRowGrouping,
    ],
  );

  const applyViewState = useCallback(
    (state: Partial<UseGridViewState>) => {
      if (state.featureFlags) featureFlagsState.set(state.featureFlags);
      if (state.filtering) filteringState.set(state.filtering);
      if (state.search) searchState.set(state.search);
      if (state.validation) validationState.set(state.validation);
      if (state.pagination) paginationState.set(state.pagination);
      if (state.chart) chartState.set(state.chart);
      if (state.sparkline) sparklineState.set(state.sparkline);
      if (state.pivot) pivotState.set(state.pivot);
      if (state.pinnedColumns) setPinnedColumns(state.pinnedColumns);
      if (state.pinnedRows) setPinnedRows(state.pinnedRows);
      if (state.sortModel) setSortModel(state.sortModel);
      if ("selection" in state) setSelection(state.selection ?? null);
      if (state.selectedRowIds) setSelectedRowIds(state.selectedRowIds);
      if (state.selectedColumnKeys) {
        setSelectedColumnKeys(state.selectedColumnKeys);
      }
      if ("rowGrouping" in state) {
        setRowGrouping(state.rowGrouping ?? null);
      }
    },
    [
      featureFlagsState,
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
    ],
  );

  return {
    getViewState,
    applyViewState,
  };
};
