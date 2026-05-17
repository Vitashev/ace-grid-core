import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import type {
  GridFilterConfig,
  GridMergedCell,
  GridRow,
  GridSortConfig,
} from "../../types";

type SortClientRowsResult = {
  rows: GridRow[];
  merges: GridMergedCell[];
};

type UseGridSortFilterCommandsArgs = {
  cfgSortMode: "client" | "server";
  sortingCapabilityEnabled: boolean;
  filteringCapabilityEnabled: boolean;
  allowAdvancedFiltering: boolean;
  allowMultiSort: boolean;
  normalizeSortModel: (
    model?: GridSortConfig[],
    options?: { allowMultiSort?: boolean },
  ) => GridSortConfig[];
  sanitizeFilter: (
    filter: GridFilterConfig | null | undefined,
    options?: { allowAdvanced?: boolean },
  ) => GridFilterConfig | null;
  sanitizeFilters: (
    filters: GridFilterConfig[] | null | undefined,
    options?: { allowAdvanced?: boolean },
  ) => GridFilterConfig[];
  rows: GridRow[];
  allColumnKeys: string[];
  spanKeyAnchorsRef: MutableRefObject<Map<string, string[]>>;
  sortClientRows: (
    rows: GridRow[],
    model: GridSortConfig[],
  ) => SortClientRowsResult | null;
  pushUndo: (rows: GridRow[]) => void;
  requestFullFormulaRecalc: () => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
  setSortModelState: Dispatch<SetStateAction<GridSortConfig[]>>;
  setSortColumn: Dispatch<SetStateAction<string | null>>;
  setSortDirection: Dispatch<SetStateAction<"asc" | "desc" | null>>;
  setActiveFiltersState: (filters: GridFilterConfig[]) => void;
  setFilterState: (columnKey: string, filter: GridFilterConfig | null) => void;
  clearFilterState: (columnKey: string) => void;
  clearAllFiltersState: () => void;
};

export const useGridSortFilterCommands = ({
  cfgSortMode,
  sortingCapabilityEnabled,
  filteringCapabilityEnabled,
  allowAdvancedFiltering,
  allowMultiSort,
  normalizeSortModel,
  sanitizeFilter,
  sanitizeFilters,
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
}: UseGridSortFilterCommandsArgs) => {
  const setSortModel = useCallback(
    (model: GridSortConfig[]) => {
      const normalized = sortingCapabilityEnabled
        ? normalizeSortModel(model, { allowMultiSort })
        : [];
      setSortModelState(normalized);
      setSortColumn(normalized[0]?.columnKey ?? null);
      setSortDirection(normalized[0]?.direction ?? null);

      if (!sortingCapabilityEnabled) return;
      if (cfgSortMode !== "client") return;
      if (!normalized.length) return;

      const result = sortClientRows(rows, normalized);
      if (!result) return;

      const { rows: sortedRows, merges: recalculatedMerges } = result;
      pushUndo(rows);
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
          Math.min(allColumnKeys.length - 1, endCol),
        );
        spanKeyAnchorsRef.current.set(
          cell.id,
          allColumnKeys.slice(safeStart, safeEnd + 1),
        );
      });
    },
    [
      allColumnKeys,
      allowMultiSort,
      cfgSortMode,
      normalizeSortModel,
      pushUndo,
      requestFullFormulaRecalc,
      rows,
      setMergedCells,
      setRows,
      setSortColumn,
      setSortDirection,
      setSortModelState,
      sortClientRows,
      sortingCapabilityEnabled,
      spanKeyAnchorsRef,
    ],
  );

  const setSorting = useCallback(
    (key: string | null, direction: "asc" | "desc" | null) => {
      if (!key || !direction) {
        setSortModel([]);
        return;
      }
      setSortModel([{ columnKey: key, direction }]);
    },
    [setSortModel],
  );

  const clearSorting = useCallback(() => {
    setSortModel([]);
  }, [setSortModel]);

  const setActiveFilters = useCallback(
    (filters: GridFilterConfig[]) => {
      if (!filteringCapabilityEnabled) {
        clearAllFiltersState();
        return;
      }
      setActiveFiltersState(
        sanitizeFilters(filters, { allowAdvanced: allowAdvancedFiltering }),
      );
    },
    [
      allowAdvancedFiltering,
      clearAllFiltersState,
      filteringCapabilityEnabled,
      sanitizeFilters,
      setActiveFiltersState,
    ],
  );

  const setFilter = useCallback(
    (columnKey: string, filter: GridFilterConfig | null) => {
      if (!filteringCapabilityEnabled) {
        clearAllFiltersState();
        return;
      }
      setFilterState(
        columnKey,
        sanitizeFilter(filter, { allowAdvanced: allowAdvancedFiltering }),
      );
    },
    [
      allowAdvancedFiltering,
      clearAllFiltersState,
      filteringCapabilityEnabled,
      sanitizeFilter,
      setFilterState,
    ],
  );

  const clearFilter = useCallback(
    (columnKey: string) => {
      if (!filteringCapabilityEnabled) {
        clearAllFiltersState();
        return;
      }
      clearFilterState(columnKey);
    },
    [clearAllFiltersState, clearFilterState, filteringCapabilityEnabled],
  );

  const clearAllFilters = useCallback(() => {
    clearAllFiltersState();
  }, [clearAllFiltersState]);

  return {
    setSortModel,
    setSorting,
    clearSorting,
    setActiveFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
  };
};
