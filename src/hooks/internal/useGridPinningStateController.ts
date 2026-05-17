import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import type { GridPinnedColumns, GridPinnedRows } from "../../types";

type GridPinningStateValue = {
  pinnedColumns: GridPinnedColumns;
  pinnedRows: GridPinnedRows;
};

type GridPinningStateController = GridPinningStateValue & {
  setPinnedColumns: (next: GridPinnedColumns) => void;
  setPinnedRows: (next: GridPinnedRows) => void;
  setPinnedColumnsState: Dispatch<SetStateAction<GridPinnedColumns>>;
  setPinnedRowsState: Dispatch<SetStateAction<GridPinnedRows>>;
};

type UseGridPinningStateControllerArgs = {
  initialPinnedColumns: GridPinnedColumns;
  initialPinnedRows: GridPinnedRows;
};

export const useGridPinningStateController = ({
  initialPinnedColumns,
  initialPinnedRows,
}: UseGridPinningStateControllerArgs): {
  value: GridPinningStateValue;
  state: GridPinningStateController;
} => {
  const [pinnedColumns, setPinnedColumnsState] =
    useState<GridPinnedColumns>(initialPinnedColumns);
  const [pinnedRows, setPinnedRowsState] =
    useState<GridPinnedRows>(initialPinnedRows);

  const value = useMemo<GridPinningStateValue>(
    () => ({
      pinnedColumns,
      pinnedRows,
    }),
    [pinnedColumns, pinnedRows],
  );

  const state = useMemo<GridPinningStateController>(
    () => ({
      ...value,
      setPinnedColumns: (next) =>
        setPinnedColumnsState((prev) => ({
          left: Array.isArray(next.left) ? next.left.slice() : prev.left.slice(),
          right: Array.isArray(next.right) ? next.right.slice() : prev.right.slice(),
        })),
      setPinnedRows: (next) =>
        setPinnedRowsState((prev) => ({
          top: Array.isArray(next.top) ? next.top.slice() : prev.top.slice(),
          bottom: Array.isArray(next.bottom)
            ? next.bottom.slice()
            : prev.bottom.slice(),
        })),
      setPinnedColumnsState,
      setPinnedRowsState,
    }),
    [value],
  );

  return { value, state };
};
