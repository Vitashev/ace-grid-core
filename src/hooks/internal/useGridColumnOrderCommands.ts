import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  GRID_SYSTEM_COLUMN_KEYS,
  type GridMergedCell,
  type GridRow,
} from "../../types";

type UseGridColumnOrderCommandsArgs = {
  setColumnOrder: Dispatch<SetStateAction<string[]>>;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
  remapColumnsByOrder: (
    rows: GridRow[],
    prevOrder: string[],
    nextOrder: string[],
  ) => GridRow[] | null;
  remapMergedCellsByColumnOrder: (
    mergedCells: GridMergedCell[],
    prevOrder: string[],
    nextOrder: string[],
  ) => GridMergedCell[];
};

export const useGridColumnOrderCommands = ({
  setColumnOrder,
  setRows,
  setMergedCells,
  remapColumnsByOrder,
  remapMergedCellsByColumnOrder,
}: UseGridColumnOrderCommandsArgs) => {
  const lastSingleColReorderRef = useRef<string | null>(null);
  const lastMultiColReorderRef = useRef<string | null>(null);
  const cleanupTimersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      cleanupTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      cleanupTimersRef.current.clear();
      lastSingleColReorderRef.current = null;
      lastMultiColReorderRef.current = null;
    },
    [],
  );

  const queueCleanup = useCallback((callback: () => void, delayMs: number) => {
    const timerId = setTimeout(() => {
      cleanupTimersRef.current.delete(timerId);
      callback();
    }, delayMs);
    cleanupTimersRef.current.add(timerId);
  }, []);

  const reorderColumns = useCallback(
    (from: number, to: number) => {
      setColumnOrder((prev) => {
        if (
          from === to ||
          from < 0 ||
          to < 0 ||
          from >= prev.length ||
          to >= prev.length
        ) {
          return prev;
        }
        const signature = `${prev[from]}|${from}->${to}|${prev.join(",")}`;
        if (lastSingleColReorderRef.current === signature) return prev;
        lastSingleColReorderRef.current = signature;
        queueCleanup(() => {
          lastSingleColReorderRef.current = null;
        }, 50);

        const oldOrder = prev.slice();
        const next = prev.slice();
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);

        setRows((current) => {
          const remapped = remapColumnsByOrder(current, oldOrder, next);
          return remapped ?? current;
        });
        setMergedCells((prevMerged) =>
          remapMergedCellsByColumnOrder(prevMerged, oldOrder, next),
        );
        return next;
      });
    },
    [
      queueCleanup,
      remapColumnsByOrder,
      remapMergedCellsByColumnOrder,
      setColumnOrder,
      setMergedCells,
      setRows,
    ],
  );

  const updateColumnOrder = useCallback(
    (newOrder: string[]) => {
      setColumnOrder((prev) => {
        const oldOrder = prev.slice();
        setRows((current) => {
          const remapped = remapColumnsByOrder(current, oldOrder, newOrder);
          return remapped ?? current;
        });
        setMergedCells((prevMerged) =>
          remapMergedCellsByColumnOrder(prevMerged, oldOrder, newOrder),
        );
        return newOrder.slice();
      });
    },
    [
      remapColumnsByOrder,
      remapMergedCellsByColumnOrder,
      setColumnOrder,
      setMergedCells,
      setRows,
    ],
  );

  const reorderMultipleColumns = useCallback(
    (keys: string[], targetKey: string, position: "before" | "after") => {
      setColumnOrder((prev) => {
        if (!keys.length || !prev.includes(targetKey)) return prev;

        const valid = keys.filter(
          (key) =>
            prev.includes(key) &&
            key !== GRID_SYSTEM_COLUMN_KEYS.rowIndex &&
            key !== GRID_SYSTEM_COLUMN_KEYS.rowDetail &&
            key !== GRID_SYSTEM_COLUMN_KEYS.rowSelection &&
            key !== GRID_SYSTEM_COLUMN_KEYS.rowOrdering &&
            key !== GRID_SYSTEM_COLUMN_KEYS.rowPinning,
        );
        if (!valid.length || valid.includes(targetKey)) return prev;

        const signature = `${valid.join("|")}@${targetKey}/${position}|${prev.join(",")}`;
        if (lastMultiColReorderRef.current === signature) return prev;
        lastMultiColReorderRef.current = signature;
        queueCleanup(() => {
          lastMultiColReorderRef.current = null;
        }, 50);

        const remaining = prev.filter((key) => !valid.includes(key));
        const targetIndex = remaining.indexOf(targetKey);
        if (targetIndex === -1) return prev;

        const insertAt = position === "after" ? targetIndex + 1 : targetIndex;
        const next = remaining.slice();
        next.splice(insertAt, 0, ...keys.filter((key) => valid.includes(key)));

        const oldOrder = prev.slice();
        setMergedCells((prevMerged) =>
          remapMergedCellsByColumnOrder(prevMerged, oldOrder, next),
        );
        return next;
      });
    },
    [queueCleanup, remapMergedCellsByColumnOrder, setColumnOrder, setMergedCells],
  );

  return {
    reorderColumns,
    updateColumnOrder,
    reorderMultipleColumns,
  };
};
