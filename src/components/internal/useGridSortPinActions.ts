import { useCallback } from "react";

import type { GridDragSide } from "../../features/reorder/types";
import type { GridSortModel, SortDirection } from "../../types";

type SortEventLike = {
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
};

type UseGridSortPinActionsArgs = {
  clearSelectionRange: () => void;
  effectiveSortModel: GridSortModel;
  isColPinning: boolean;
  multiSortKey: "shift" | "meta" | "ctrl" | "alt" | "none";
  onPinAndPositionColumn?: (
    columnKey: string,
    targetKey: string,
    side: GridDragSide,
    position: "before" | "after",
  ) => void;
  onPinColumn?: (columnKey: string, side: GridDragSide | null) => void;
  onPinColumnAtPosition?: (
    columnKey: string,
    side: GridDragSide,
    index: number,
  ) => void;
  onPinRow?: (rowId: string | number, side: "top" | "bottom" | null) => void;
  onSort?: (columnKey: string, direction: SortDirection) => void;
  onSortModelChange?: (model: GridSortModel) => void;
  sortColumn?: string | null;
  sortDirection?: SortDirection | null;
  sortingCapabilityEnabled: boolean;
};

export const useGridSortPinActions = ({
  clearSelectionRange,
  effectiveSortModel,
  isColPinning,
  multiSortKey,
  onPinAndPositionColumn,
  onPinColumn,
  onPinColumnAtPosition,
  onPinRow,
  onSort,
  onSortModelChange,
  sortColumn,
  sortDirection,
  sortingCapabilityEnabled,
}: UseGridSortPinActionsArgs) => {
  const triggerSort = useCallback(
    (key: string, event?: SortEventLike) => {
      if (!sortingCapabilityEnabled) return;
      if (onSortModelChange) {
        const isMulti =
          multiSortKey !== "none" &&
          !!event &&
          ((multiSortKey === "shift" && !!event.shiftKey) ||
            (multiSortKey === "meta" && !!event.metaKey) ||
            (multiSortKey === "ctrl" && !!event.ctrlKey) ||
            (multiSortKey === "alt" && !!event.altKey));

        const current = effectiveSortModel;
        const idx = current.findIndex((entry) => entry.columnKey === key);

        let next: typeof current;
        if (!isMulti) {
          const nextDir =
            idx >= 0 && current[idx].direction === "asc" ? "desc" : "asc";
          next = [{ columnKey: key, direction: nextDir }];
        } else if (idx < 0) {
          next = [...current, { columnKey: key, direction: "asc" }];
        } else if (current[idx].direction === "asc") {
          next = current.map((entry, index) =>
            index === idx ? { ...entry, direction: "desc" } : entry,
          );
        } else {
          next = current.filter((_, index) => index !== idx);
        }

        onSortModelChange(next);
        return;
      }

      if (!onSort) return;
      const next: SortDirection =
        sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
      onSort(key, next);
    },
    [
      effectiveSortModel,
      multiSortKey,
      onSort,
      onSortModelChange,
      sortColumn,
      sortDirection,
      sortingCapabilityEnabled,
    ],
  );

  const handlePinRow = useCallback(
    (rowId: string | number, side: "top" | "bottom" | null) => {
      clearSelectionRange();
      onPinRow?.(rowId, side);
    },
    [clearSelectionRange, onPinRow],
  );

  const doPinColumn = useCallback(
    (key: string, side: GridDragSide | null) => {
      if (!isColPinning) return;
      clearSelectionRange();
      onPinColumn?.(key, side);
    },
    [clearSelectionRange, isColPinning, onPinColumn],
  );

  const pinColumnAtPosition = useCallback(
    (key: string, side: GridDragSide, index: number) => {
      if (!isColPinning) return;
      onPinColumnAtPosition?.(key, side, index);
    },
    [isColPinning, onPinColumnAtPosition],
  );

  const pinAndPositionColumn = useCallback(
    (
      key: string,
      targetKey: string,
      side: GridDragSide,
      position: "before" | "after",
    ) => {
      if (!isColPinning) return;
      onPinAndPositionColumn?.(key, targetKey, side, position);
    },
    [isColPinning, onPinAndPositionColumn],
  );

  return {
    triggerSort,
    handlePinRow,
    doPinColumn,
    pinColumnAtPosition,
    pinAndPositionColumn,
  };
};
