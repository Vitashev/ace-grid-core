import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { CellValue, GridColumn, GridMergedCell, GridPinnedColumns, GridRow } from "../../types";

type UseGridColumnMutationCommandsArgs = {
  allColumnKeys: string[];
  columns: GridColumn[];
  columnKeyCount: number;
  pushUndo: (snapshot: GridRow[]) => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setDynamicColumns: Dispatch<SetStateAction<GridColumn[]>>;
  setColumnOrder: Dispatch<SetStateAction<string[]>>;
  setColumnWidths: Dispatch<SetStateAction<Record<string, number>>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
  setPinnedColumnsState: Dispatch<SetStateAction<GridPinnedColumns>>;
  setSelectedColumnKeys: Dispatch<SetStateAction<string[]>>;
  clearSpanKeyAnchors: () => void;
  deleteColumnDefs: (key: string) => void;
};

export const useGridColumnMutationCommands = ({
  allColumnKeys,
  columns,
  columnKeyCount,
  pushUndo,
  setRows,
  setDynamicColumns,
  setColumnOrder,
  setColumnWidths,
  setMergedCells,
  setPinnedColumnsState,
  setSelectedColumnKeys,
  clearSpanKeyAnchors,
  deleteColumnDefs,
}: UseGridColumnMutationCommandsArgs) => {
  const insertColumnsAt = useCallback(
    (colsToInsert: GridColumn[], insertAt: number) => {
      if (!colsToInsert.length) return [] as GridColumn[];

      const existingKeys = new Set(allColumnKeys);
      const seen = new Set<string>();
      const filtered = colsToInsert.filter((col) => {
        if (!col?.key) return false;
        if (existingKeys.has(col.key)) return false;
        if (seen.has(col.key)) return false;
        seen.add(col.key);
        return true;
      });

      if (!filtered.length) return [] as GridColumn[];

      setRows((prev) => {
        pushUndo(prev);
        let changed = false;
        const next = prev.map((row) => {
          let mutated = false;
          const data: Record<string, CellValue> = { ...row.data };
          filtered.forEach((col) => {
            if (!data[col.key]) {
              data[col.key] = { value: "", type: "text" as const };
              mutated = true;
            }
          });
          if (mutated) {
            changed = true;
            return { ...row, data };
          }
          return row;
        });
        return changed ? next : prev;
      });

      setDynamicColumns((prev) => {
        const baseKeys = new Set(columns.map((column) => column.key));
        const next = prev.slice();
        filtered.forEach((col) => {
          if (baseKeys.has(col.key)) return;
          const existingIndex = next.findIndex((column) => column.key === col.key);
          if (existingIndex >= 0) next[existingIndex] = col;
          else next.push(col);
        });
        return next;
      });

      setColumnOrder((prev) => {
        const next = prev.slice();
        let offset = 0;
        filtered.forEach((col) => {
          if (next.includes(col.key)) return;
          const index = Math.max(0, Math.min(insertAt + offset, next.length));
          next.splice(index, 0, col.key);
          offset += 1;
        });
        return next;
      });

      setColumnWidths((prev) => {
        let next: Record<string, number> | null = null;
        filtered.forEach((col) => {
          if (prev[col.key] != null || col.width == null) return;
          if (!next) next = { ...prev };
          next[col.key] = col.width;
        });
        return next ?? prev;
      });

      setMergedCells((prev) =>
        prev.map((cell) => {
          if (cell.endCol < insertAt) return cell;
          if (cell.startCol >= insertAt) {
            return {
              ...cell,
              startCol: cell.startCol + filtered.length,
              endCol: cell.endCol + filtered.length,
            };
          }
          if (cell.endCol >= insertAt) {
            return { ...cell, endCol: cell.endCol + filtered.length };
          }
          return cell;
        }),
      );

      return filtered;
    },
    [
      allColumnKeys,
      columns,
      pushUndo,
      setColumnOrder,
      setColumnWidths,
      setDynamicColumns,
      setMergedCells,
      setRows,
    ],
  );

  const addColumn = useCallback(
    (column: GridColumn, index?: number) => {
      const insertAt = Math.max(0, Math.min(index ?? columnKeyCount, columnKeyCount));
      insertColumnsAt([column], insertAt);
    },
    [columnKeyCount, insertColumnsAt],
  );

  const deleteColumn = useCallback(
    (key: string) => {
      setRows((prev) => {
        pushUndo(prev);
        return prev.map((row) => {
          const { [key]: _omit, ...rest } = row.data;
          return { ...row, data: rest };
        });
      });
      setDynamicColumns((prev) => prev.filter((column) => column.key !== key));
      setColumnWidths((prev) => {
        if (!(key in prev)) return prev;
        const { [key]: _omit, ...rest } = prev;
        return rest;
      });
      setPinnedColumnsState((prev) => ({
        left: prev.left.filter((columnKey) => columnKey !== key),
        right: prev.right.filter((columnKey) => columnKey !== key),
      }));
      setSelectedColumnKeys((prev) => prev.filter((columnKey) => columnKey !== key));
      setColumnOrder((prev) => {
        const baseOrder = prev.length ? prev : allColumnKeys;
        const removeIndex = baseOrder.indexOf(key);
        const nextOrder = baseOrder.filter((columnKey) => columnKey !== key);
        if (removeIndex >= 0) {
          setMergedCells((prevMerged) =>
            prevMerged.flatMap((cell) => {
              if (cell.endCol < removeIndex) return [cell];
              if (cell.startCol > removeIndex) {
                return [
                  {
                    ...cell,
                    startCol: cell.startCol - 1,
                    endCol: cell.endCol - 1,
                  },
                ];
              }
              if (cell.startCol === cell.endCol) return [];
              const nextEnd = cell.endCol - 1;
              if (nextEnd < cell.startCol) return [];
              return [{ ...cell, endCol: nextEnd }];
            }),
          );
          clearSpanKeyAnchors();
        }
        return nextOrder;
      });
      deleteColumnDefs(key);
    },
    [
      allColumnKeys,
      clearSpanKeyAnchors,
      deleteColumnDefs,
      pushUndo,
      setColumnOrder,
      setColumnWidths,
      setDynamicColumns,
      setMergedCells,
      setPinnedColumnsState,
      setRows,
      setSelectedColumnKeys,
    ],
  );

  return {
    insertColumnsAt,
    addColumn,
    deleteColumn,
  };
};
