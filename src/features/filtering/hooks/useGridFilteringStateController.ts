import { useMemo, useState } from "react";

import type { GridFilterConfig } from "../../../types";

type GridFilteringStateValue = {
  activeFilters: GridFilterConfig[];
  enableFloatingFilters: boolean;
  floatingFilterDebounceMs: number;
  enableAdvancedMultiFilter: boolean;
};

type GridFilteringStateController = GridFilteringStateValue & {
  set: (patch: Partial<GridFilteringStateValue>) => void;
  setActiveFilters: (filters: GridFilterConfig[]) => void;
  setFilter: (columnKey: string, filter: GridFilterConfig | null) => void;
  clearFilter: (columnKey: string) => void;
  clearAllFilters: () => void;
  setEnableFloatingFilters: (enabled: boolean) => void;
  setFloatingFilterDebounceMs: (debounceMs: number) => void;
  setEnableAdvancedMultiFilter: (enabled: boolean) => void;
};

type UseGridFilteringStateControllerArgs = {
  initialActiveFilters: GridFilterConfig[];
  initialEnableFloatingFilters: boolean;
  initialFloatingFilterDebounceMs: number;
  initialEnableAdvancedMultiFilter: boolean;
};

export const useGridFilteringStateController = ({
  initialActiveFilters,
  initialEnableFloatingFilters,
  initialFloatingFilterDebounceMs,
  initialEnableAdvancedMultiFilter,
}: UseGridFilteringStateControllerArgs): {
  value: GridFilteringStateValue;
  state: GridFilteringStateController;
} => {
  const [activeFilters, setActiveFilters] =
    useState<GridFilterConfig[]>(initialActiveFilters);
  const [enableFloatingFilters, setEnableFloatingFilters] = useState(
    initialEnableFloatingFilters,
  );
  const [floatingFilterDebounceMs, setFloatingFilterDebounceMs] = useState(
    initialFloatingFilterDebounceMs,
  );
  const [enableAdvancedMultiFilter, setEnableAdvancedMultiFilter] = useState(
    initialEnableAdvancedMultiFilter,
  );

  const value = useMemo<GridFilteringStateValue>(
    () => ({
      activeFilters,
      enableFloatingFilters,
      floatingFilterDebounceMs,
      enableAdvancedMultiFilter,
    }),
    [
      activeFilters,
      enableFloatingFilters,
      floatingFilterDebounceMs,
      enableAdvancedMultiFilter,
    ],
  );

  const state = useMemo<GridFilteringStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.activeFilters != null) setActiveFilters(patch.activeFilters);
        if (patch.enableFloatingFilters != null) {
          setEnableFloatingFilters(patch.enableFloatingFilters);
        }
        if (patch.floatingFilterDebounceMs != null) {
          setFloatingFilterDebounceMs(
            Math.max(0, patch.floatingFilterDebounceMs),
          );
        }
        if (patch.enableAdvancedMultiFilter != null) {
          setEnableAdvancedMultiFilter(patch.enableAdvancedMultiFilter);
        }
      },
      setActiveFilters,
      setFilter: (columnKey, filter) => {
        setActiveFilters((prev) => {
          if (!filter) return prev.filter((entry) => entry.columnKey !== columnKey);
          const index = prev.findIndex((entry) => entry.columnKey === columnKey);
          if (index >= 0) {
            const next = prev.slice();
            next[index] = filter;
            return next;
          }
          return [...prev, filter];
        });
      },
      clearFilter: (columnKey) =>
        setActiveFilters((prev) =>
          prev.filter((entry) => entry.columnKey !== columnKey),
        ),
      clearAllFilters: () => setActiveFilters([]),
      setEnableFloatingFilters,
      setFloatingFilterDebounceMs: (debounceMs) =>
        setFloatingFilterDebounceMs(Math.max(0, debounceMs)),
      setEnableAdvancedMultiFilter,
    }),
    [value],
  );

  return { value, state };
};
