import { useCallback, type Dispatch, type SetStateAction } from "react";

import type {
  GridColumn,
  GridColumnDef,
  GridMergedCell,
  GridRow,
  GridSelection,
} from "../../types";

type NormalizedSelection = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

type UseGridSelectionInsertCommandsArgs = {
  rowCount: number;
  columnKeyCount: number;
  allColumns: GridColumn[];
  columnDefsState: GridColumnDef[];
  normalizeSelection: (selection: GridSelection) => NormalizedSelection;
  clampSelectionToGrid: (
    selection: GridSelection,
    rowCount: number,
    colCount: number,
  ) => NormalizedSelection | null;
  uniquePreserveOrder: (values?: number[]) => number[] | null;
  makeRow: (partial?: Partial<GridRow>) => GridRow;
  generateColumnKey: () => string;
  insertColumnsAt: (columns: GridColumn[], insertAt: number) => GridColumn[];
  insertColumnsIntoDefs: (
    defs: GridColumnDef[],
    anchorKey: string | null,
    position: "left" | "right",
    columns: GridColumn[],
  ) => GridColumnDef[];
  applyColumnDefs: (defs: GridColumnDef[]) => void;
  pushUndo: (snapshot: GridRow[]) => void;
  requestFullFormulaRecalc: () => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
};

export const useGridSelectionInsertCommands = ({
  rowCount,
  columnKeyCount,
  allColumns,
  columnDefsState,
  normalizeSelection,
  clampSelectionToGrid,
  uniquePreserveOrder,
  makeRow,
  generateColumnKey,
  insertColumnsAt,
  insertColumnsIntoDefs,
  applyColumnDefs,
  pushUndo,
  requestFullFormulaRecalc,
  setRows,
  setMergedCells,
}: UseGridSelectionInsertCommandsArgs) => {
  const addRowsRelativeToSelection = useCallback(
    (
      selection: GridSelection,
      position: "above" | "below",
      context?: { rowIndices?: number[] },
    ) => {
      const clamped = clampSelectionToGrid(
        selection,
        rowCount,
        Math.max(1, columnKeyCount || 1),
      );
      const normalized = clamped ?? normalizeSelection(selection);
      const resolved = uniquePreserveOrder(context?.rowIndices);
      const countFromContext = resolved?.length;
      const count = Math.max(
        1,
        countFromContext ?? normalized.endRow - normalized.startRow + 1,
      );

      const anchor = (() => {
        if (resolved?.length) {
          return position === "above"
            ? resolved[0]
            : resolved[resolved.length - 1];
        }
        return position === "above" ? normalized.startRow : normalized.endRow;
      })();

      const insertIndex = Math.max(
        0,
        Math.min(position === "above" ? anchor : anchor + 1, rowCount),
      );

      const newRows: GridRow[] = Array.from({ length: count }, () => makeRow());

      setRows((prev) => {
        pushUndo(prev);
        const insertAt = Math.max(0, Math.min(insertIndex, prev.length));
        const next = prev.slice();
        next.splice(insertAt, 0, ...newRows);
        return next;
      });

      if (count) {
        setMergedCells((prev) =>
          prev.map((cell) => {
            if (cell.endRow < insertIndex) return cell;
            if (cell.startRow >= insertIndex) {
              return {
                ...cell,
                startRow: cell.startRow + count,
                endRow: cell.endRow + count,
              };
            }
            if (cell.endRow >= insertIndex) {
              return { ...cell, endRow: cell.endRow + count };
            }
            return cell;
          }),
        );
        requestFullFormulaRecalc();
      }

      return newRows;
    },
    [
      clampSelectionToGrid,
      columnKeyCount,
      makeRow,
      normalizeSelection,
      pushUndo,
      requestFullFormulaRecalc,
      rowCount,
      setMergedCells,
      setRows,
      uniquePreserveOrder,
    ],
  );

  const addColumnsRelativeToSelection = useCallback(
    (
      selection: GridSelection,
      position: "left" | "right",
      context?: { columnIndices?: number[] },
    ) => {
      const columnCount = allColumns.length;
      const clamped = clampSelectionToGrid(
        selection,
        Math.max(1, rowCount),
        Math.max(1, columnCount),
      );
      const normalized = clamped ?? normalizeSelection(selection);
      const resolved = uniquePreserveOrder(context?.columnIndices);
      const countFromContext = resolved?.length;
      const count = Math.max(
        1,
        countFromContext ?? normalized.endCol - normalized.startCol + 1,
      );

      const anchorBase = (() => {
        if (resolved?.length) {
          return position === "left"
            ? resolved[0]
            : resolved[resolved.length - 1];
        }
        return position === "left" ? normalized.startCol : normalized.endCol;
      })();

      const templateIndex = Math.max(
        0,
        Math.min(
          position === "left"
            ? anchorBase
            : (resolved?.length
                ? resolved[resolved.length - 1]
                : normalized.endCol),
          Math.max(0, columnCount - 1),
        ),
      );
      const insertIndex = Math.max(
        0,
        Math.min(position === "left" ? anchorBase : anchorBase + 1, columnCount),
      );
      const anchorKey = allColumns[anchorBase]?.key ?? null;
      const template = allColumns[templateIndex];
      const titleBase = template?.title ?? "Column";

      const newColumns: GridColumn[] = Array.from({ length: count }, (_, index) => {
        const key = generateColumnKey();
        const titleSuffix = columnCount + index + 1;
        const base: GridColumn = template
          ? { ...template }
          : {
              key,
              title: `${titleBase} ${titleSuffix}`,
              width: 160,
              resizable: true,
              sortable: true,
              filterable: true,
              editable: true,
              type: "text",
            };

        return {
          ...base,
          key,
          title:
            count > 1 ? `${titleBase} ${titleSuffix}` : `${titleBase} Copy`,
        };
      });

      const inserted = insertColumnsAt(newColumns, insertIndex);

      if (columnDefsState.length && inserted.length) {
        const updatedDefs = insertColumnsIntoDefs(
          columnDefsState,
          anchorKey,
          position,
          inserted,
        );
        applyColumnDefs(updatedDefs);
      }

      return inserted;
    },
    [
      allColumns,
      applyColumnDefs,
      clampSelectionToGrid,
      columnDefsState,
      generateColumnKey,
      insertColumnsAt,
      insertColumnsIntoDefs,
      normalizeSelection,
      rowCount,
      uniquePreserveOrder,
    ],
  );

  return {
    addRowsRelativeToSelection,
    addColumnsRelativeToSelection,
  };
};
