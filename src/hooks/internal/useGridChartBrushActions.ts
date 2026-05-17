import { useCallback } from "react";

import type { GridChartBrushActionOptions, GridFilterConfig } from "../../types";

type UseGridChartBrushActionsArgs = {
  chartBrushRowIds: Array<string | number>;
  rowIdFilterActive: boolean;
  setChartBrushRowIds: (rowIds: Array<string | number>) => void;
  setSelectedRowIds: (rowIds: Array<string | number>) => void;
  setFilteringEnabled: (enabled: boolean) => void;
  setFilter: (columnKey: string, filter: GridFilterConfig | null) => void;
  clearFilter: (columnKey: string) => void;
};

export const useGridChartBrushActions = ({
  chartBrushRowIds,
  rowIdFilterActive,
  setChartBrushRowIds,
  setSelectedRowIds,
  setFilteringEnabled,
  setFilter,
  clearFilter,
}: UseGridChartBrushActionsArgs) => {
  const onBrushSelection = useCallback(
    (rowIds: Array<string | number>) => {
      setChartBrushRowIds(rowIds);
      setSelectedRowIds(rowIds);
    },
    [setChartBrushRowIds, setSelectedRowIds],
  );

  const getBrushActions = useCallback(
    (enabled = false): GridChartBrushActionOptions[] => {
      if (!enabled) return [];
      const brushCount = chartBrushRowIds.length;
      const filterLabel = brushCount
        ? rowIdFilterActive
          ? `Update filter (${brushCount})`
          : `Filter rows (${brushCount})`
        : "Filter rows";
      return [
        {
          label: filterLabel,
          onApply: (rowIds: Array<string | number>) => {
            const ids = rowIds.length ? rowIds : chartBrushRowIds;
            if (!ids.length) {
              clearFilter("__rowId");
              return;
            }
            setFilteringEnabled(true);
            setFilter("__rowId", {
              columnKey: "__rowId",
              type: "multiSelect",
              operator: "in",
              value: ids.map((value) => String(value)),
            });
          },
        },
        ...(rowIdFilterActive
          ? [
              {
                label: "Clear filter",
                clearBrush: true,
                onApply: () => clearFilter("__rowId"),
              },
            ]
          : []),
      ];
    },
    [
      chartBrushRowIds,
      clearFilter,
      rowIdFilterActive,
      setFilter,
      setFilteringEnabled,
    ],
  );

  return {
    onBrushSelection,
    getBrushActions,
  };
};
