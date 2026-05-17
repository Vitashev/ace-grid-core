import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { GridPinnedColumns, GridPinnedRows } from "../../types";

type UseGridPinningCommandsArgs = {
  setPinnedColumnsValue: (next: GridPinnedColumns) => void;
  setPinnedRowsValue: (next: GridPinnedRows) => void;
  setPinnedColumnsState: Dispatch<SetStateAction<GridPinnedColumns>>;
  setPinnedRowsState: Dispatch<SetStateAction<GridPinnedRows>>;
};

export const useGridPinningCommands = ({
  setPinnedColumnsValue,
  setPinnedRowsValue,
  setPinnedColumnsState,
  setPinnedRowsState,
}: UseGridPinningCommandsArgs) => {
  const processedOpsRef = useRef(new Set<string>());
  const cleanupTimersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      cleanupTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      cleanupTimersRef.current.clear();
      processedOpsRef.current.clear();
    },
    [],
  );

  const registerProcessedOp = useCallback((signature: string) => {
    if (processedOpsRef.current.has(signature)) return false;
    processedOpsRef.current.add(signature);
    const timerId = setTimeout(() => {
      processedOpsRef.current.delete(signature);
      cleanupTimersRef.current.delete(timerId);
    }, 1000);
    cleanupTimersRef.current.add(timerId);
    return true;
  }, []);

  const setPinnedColumns = useCallback(
    (next: GridPinnedColumns) => {
      setPinnedColumnsValue(next);
    },
    [setPinnedColumnsValue],
  );

  const setPinnedRows = useCallback(
    (next: GridPinnedRows) => {
      setPinnedRowsValue(next);
    },
    [setPinnedRowsValue],
  );

  const pinColumn = useCallback(
    (key: string, side: "left" | "right" | null) => {
      setPinnedColumnsState((prev) => {
        const left = prev.left.filter((columnKey) => columnKey !== key);
        const right = prev.right.filter((columnKey) => columnKey !== key);
        if (side === "left") left.push(key);
        else if (side === "right") right.push(key);
        return { left, right };
      });
    },
    [setPinnedColumnsState],
  );

  const pinColumnAtPosition = useCallback(
    (key: string, side: "left" | "right", index: number) => {
      setPinnedColumnsState((prev) => {
        const left = prev.left.filter((columnKey) => columnKey !== key);
        const right = prev.right.filter((columnKey) => columnKey !== key);
        if (side === "left") {
          left.splice(Math.max(0, Math.min(index, left.length)), 0, key);
        } else {
          right.splice(Math.max(0, Math.min(index, right.length)), 0, key);
        }
        return { left, right };
      });
    },
    [setPinnedColumnsState],
  );

  const pinRow = useCallback(
    (rowId: string | number, side: "top" | "bottom" | null) => {
      setPinnedRowsState((prev) => {
        const top = prev.top.filter((id) => id !== rowId);
        const bottom = prev.bottom.filter((id) => id !== rowId);
        if (side === "top") top.push(rowId);
        else if (side === "bottom") bottom.push(rowId);
        return { top, bottom };
      });
    },
    [setPinnedRowsState],
  );

  const pinRowAtPosition = useCallback(
    (rowId: string | number, side: "top" | "bottom", index: number) => {
      setPinnedRowsState((prev) => {
        const top = prev.top.filter((id) => id !== rowId);
        const bottom = prev.bottom.filter((id) => id !== rowId);
        if (side === "top") {
          top.splice(Math.max(0, Math.min(index, top.length)), 0, rowId);
        } else {
          bottom.splice(Math.max(0, Math.min(index, bottom.length)), 0, rowId);
        }
        return { top, bottom };
      });
    },
    [setPinnedRowsState],
  );

  const pinMultipleRowsAtPosition = useCallback(
    (
      ops: Array<{
        rowId: string | number;
        side: "top" | "bottom";
        index: number;
      }>,
    ) => {
      setPinnedRowsState((prev) => {
        let top = prev.top.slice();
        let bottom = prev.bottom.slice();

        const ids = new Set(ops.map((entry) => entry.rowId));
        top = top.filter((id) => !ids.has(id));
        bottom = bottom.filter((id) => !ids.has(id));

        const sorted = ops.slice().sort((left, right) => left.index - right.index);
        sorted.forEach(({ rowId, side, index }) => {
          if (side === "top") {
            top.splice(Math.max(0, Math.min(index, top.length)), 0, rowId);
          } else {
            bottom.splice(
              Math.max(0, Math.min(index, bottom.length)),
              0,
              rowId,
            );
          }
        });

        return { top, bottom };
      });
    },
    [setPinnedRowsState],
  );

  const pinRowAndReorderToPosition = useCallback(
    (
      rowId: string | number,
      targetRowId: string | number,
      side: "top" | "bottom",
      position: "before" | "after",
    ) => {
      setPinnedRowsState((prev) => {
        const top = prev.top.filter((id) => id !== rowId);
        const bottom = prev.bottom.filter((id) => id !== rowId);
        const targetList = side === "top" ? top : bottom;
        const targetIndex = targetList.indexOf(targetRowId);
        if (targetIndex === -1) {
          targetList.push(rowId);
        } else {
          targetList.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, rowId);
        }
        return side === "top"
          ? { top: targetList, bottom }
          : { top, bottom: targetList };
      });
    },
    [setPinnedRowsState],
  );

  const reorderPinnedColumns = useCallback(
    (
      key: string,
      targetKey: string,
      side: "left" | "right",
      position: "before" | "after",
    ) => {
      setPinnedColumnsState((prev) => {
        const next = { left: prev.left.slice(), right: prev.right.slice() };
        const targetList = side === "left" ? next.left : next.right;
        const currentIndex = targetList.indexOf(key);
        if (currentIndex === -1) return prev;
        targetList.splice(currentIndex, 1);
        const targetIndex = targetList.indexOf(targetKey);
        if (targetIndex === -1) return prev;
        targetList.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, key);
        return next;
      });
    },
    [setPinnedColumnsState],
  );

  const pinAndPositionColumn = useCallback(
    (
      key: string,
      targetKey: string,
      side: "left" | "right",
      position: "before" | "after",
    ) => {
      const signature = `pin-col:${key}->${targetKey}@${side}/${position}`;
      if (!registerProcessedOp(signature)) return;

      setPinnedColumnsState((prev) => {
        const next = {
          left: prev.left.filter((columnKey) => columnKey !== key),
          right: prev.right.filter((columnKey) => columnKey !== key),
        };
        const targetList = side === "left" ? next.left : next.right;
        const targetIndex = targetList.indexOf(targetKey);
        if (targetIndex === -1) {
          targetList.push(key);
        } else {
          targetList.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, key);
        }
        return next;
      });
    },
    [registerProcessedOp, setPinnedColumnsState],
  );

  const reorderMultiplePinnedRows = useCallback(
    (
      rowIds: Array<string | number>,
      targetRowId: string | number,
      side: "top" | "bottom",
      position: "before" | "after",
    ) => {
      setPinnedRowsState((prev) => {
        const next = { top: prev.top.slice(), bottom: prev.bottom.slice() };
        const targetList = side === "top" ? next.top : next.bottom;
        const rowIdSet = new Set(rowIds);
        const filtered = targetList.filter((id) => !rowIdSet.has(id));
        const targetIndex = filtered.indexOf(targetRowId);
        if (targetIndex === -1) {
          filtered.push(...rowIds);
        } else {
          filtered.splice(
            position === "after" ? targetIndex + 1 : targetIndex,
            0,
            ...rowIds,
          );
        }
        if (side === "top") next.top = filtered;
        else next.bottom = filtered;
        return next;
      });
    },
    [setPinnedRowsState],
  );

  const reorderPinnedRows = useCallback(
    (
      rowId: string | number,
      targetRowId: string | number,
      side: "top" | "bottom",
      position: "before" | "after",
    ) => {
      setPinnedRowsState((prev) => {
        const next = { top: prev.top.slice(), bottom: prev.bottom.slice() };
        const targetList = side === "top" ? next.top : next.bottom;
        const currentIndex = targetList.indexOf(rowId);
        if (currentIndex !== -1) targetList.splice(currentIndex, 1);
        const targetIndex = targetList.indexOf(targetRowId);
        if (targetIndex === -1) {
          targetList.push(rowId);
        } else {
          targetList.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, rowId);
        }
        return next;
      });
    },
    [setPinnedRowsState],
  );

  const pinAndPositionRow = useCallback(
    (
      rowId: string | number,
      targetRowId: string | number,
      side: "top" | "bottom",
      position: "before" | "after",
    ) => {
      const signature = `pin-row:${rowId}->${targetRowId}@${side}/${position}`;
      if (!registerProcessedOp(signature)) return;

      setPinnedRowsState((prev) => {
        const next = {
          top: prev.top.filter((id) => id !== rowId),
          bottom: prev.bottom.filter((id) => id !== rowId),
        };
        const targetList = side === "top" ? next.top : next.bottom;
        const targetIndex = targetList.indexOf(targetRowId);
        if (targetIndex === -1) {
          targetList.push(rowId);
        } else if (targetList[position === "after" ? targetIndex + 1 : targetIndex] !== rowId) {
          targetList.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, rowId);
        }
        return next;
      });
    },
    [registerProcessedOp, setPinnedRowsState],
  );

  return useMemo(
    () => ({
      setPinnedColumns,
      setPinnedRows,
      pinColumn,
      pinColumnAtPosition,
      pinRow,
      pinRowAtPosition,
      pinMultipleRowsAtPosition,
      pinRowAndReorderToPosition,
      reorderPinnedColumns,
      pinAndPositionColumn,
      reorderMultiplePinnedRows,
      reorderPinnedRows,
      pinAndPositionRow,
    }),
    [
      setPinnedColumns,
      setPinnedRows,
      pinColumn,
      pinColumnAtPosition,
      pinRow,
      pinRowAtPosition,
      pinMultipleRowsAtPosition,
      pinRowAndReorderToPosition,
      reorderPinnedColumns,
      pinAndPositionColumn,
      reorderMultiplePinnedRows,
      reorderPinnedRows,
      pinAndPositionRow,
    ],
  );
};
