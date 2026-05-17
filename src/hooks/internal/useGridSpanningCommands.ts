import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";

import type {
  GridColumn,
  GridMergedCell,
  GridRow,
  GridSelection,
  GridSpanRowIdMergeMode,
} from "../../types";

const mergedCellIntersects = (
  cell: GridMergedCell,
  selection: GridSelection,
) =>
  !(
    cell.endRow < selection.startRow ||
    cell.startRow > selection.endRow ||
    cell.endCol < selection.startCol ||
    cell.startCol > selection.endCol
  );

const rowIdsForCell = (cell: GridMergedCell, rows: GridRow[]) =>
  cell.rowIds?.length
    ? cell.rowIds
    : rows.slice(cell.startRow, cell.endRow + 1).map((row) => row.id);

const remapMergedCellsToRowOrder = (
  cells: GridMergedCell[],
  prevRows: GridRow[],
  nextRows: GridRow[],
) => {
  if (!cells.length) return cells;
  const rowIdToIndex = new Map<string, number>();
  nextRows.forEach((row, index) => rowIdToIndex.set(String(row.id), index));
  return cells.map((cell) => {
    const rowIds = rowIdsForCell(cell, prevRows);
    const mapped = rowIds
      .map((id) => rowIdToIndex.get(String(id)))
      .filter((index): index is number => index != null)
      .sort((left, right) => left - right);
    if (!mapped.length) return cell;
    return {
      ...cell,
      startRow: mapped[0],
      endRow: mapped[mapped.length - 1],
      rowIds,
    };
  });
};

const compactRowsByIds = (
  rows: GridRow[],
  rowIds: (string | number)[],
) => {
  if (!rowIds.length) return null;
  const idSet = new Set(rowIds.map((id) => String(id)));
  const indices: number[] = [];
  rows.forEach((row, index) => {
    if (idSet.has(String(row.id))) indices.push(index);
  });
  if (indices.length < 2) return null;
  const sorted = indices.slice().sort((left, right) => left - right);
  const minIndex = sorted[0];
  const maxIndex = sorted[sorted.length - 1];
  if (maxIndex - minIndex + 1 === sorted.length) return null;

  const moving = rows.filter((row) => idSet.has(String(row.id)));
  const remaining = rows.filter((row) => !idSet.has(String(row.id)));
  const insertAt = rows
    .slice(0, minIndex)
    .filter((row) => !idSet.has(String(row.id))).length;
  const nextRows = remaining.slice();
  nextRows.splice(insertAt, 0, ...moving);
  return {
    nextRows,
    startRow: insertAt,
    endRow: insertAt + moving.length - 1,
  };
};

type UseGridSpanningCommandsArgs = {
  rows: GridRow[];
  allColumns: GridColumn[];
  allColumnKeys: string[];
  rowIdMergeMode: GridSpanRowIdMergeMode;
  spanKeyAnchorsRef: MutableRefObject<Map<string, string[]>>;
  clampSelectionToGrid: (
    selection: GridSelection,
    rowCount: number,
    colCount: number,
  ) => GridSelection | null;
  uniquePreserveOrder: (values?: number[]) => number[] | null;
  uniqueRowIdsPreserveOrder: (
    values?: (string | number)[],
  ) => (string | number)[] | null;
  rowsHaveSameOrder: (left: GridRow[], right: GridRow[]) => boolean;
  pushUndo: (snapshot: GridRow[]) => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
};

export const useGridSpanningCommands = ({
  rows,
  allColumns,
  allColumnKeys,
  rowIdMergeMode,
  spanKeyAnchorsRef,
  clampSelectionToGrid,
  uniquePreserveOrder,
  uniqueRowIdsPreserveOrder,
  rowsHaveSameOrder,
  pushUndo,
  setRows,
  setMergedCells,
}: UseGridSpanningCommandsArgs) => {
  const updateMergedCellsAfterReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      setMergedCells((prev) =>
        prev.map((cell) => {
          let startRow = cell.startRow;
          let endRow = cell.endRow;
          if (fromIndex < toIndex) {
            if (startRow > fromIndex && startRow <= toIndex) startRow -= 1;
            if (endRow > fromIndex && endRow <= toIndex) endRow -= 1;
          } else {
            if (startRow >= toIndex && startRow < fromIndex) startRow += 1;
            if (endRow >= toIndex && endRow < fromIndex) endRow += 1;
          }
          return { ...cell, startRow, endRow };
        }),
      );
    },
    [setMergedCells],
  );

  const updateMergedCellsAfterMultiReorder = useCallback(
    (
      ids: (string | number)[],
      targetIndex: number,
      position: "before" | "after",
    ) => {
      const idSet = new Set(ids);
      setMergedCells((prev) => {
        const original = rows;
        const remaining = original.filter((row) => !idSet.has(row.id));
        const target = original[targetIndex];
        if (!target) return prev;

        let insertAt = remaining.findIndex((row) => row.id === target.id);
        if (insertAt === -1) insertAt = remaining.length;
        if (position === "after") insertAt += 1;

        const idToRow = new Map(original.map((row) => [row.id, row]));
        const moveRows = ids
          .map((id) => idToRow.get(id))
          .filter(Boolean) as GridRow[];

        const orderMap = new Map(
          original.map((row, index) => [String(row.id), index]),
        );
        moveRows.sort(
          (left, right) =>
            (orderMap.get(String(left.id)) ?? 0) -
            (orderMap.get(String(right.id)) ?? 0),
        );

        const nextRows = remaining.slice();
        nextRows.splice(insertAt, 0, ...moveRows);

        return prev.map((cell) => {
          const spannedIds: (string | number)[] = [];
          for (let index = cell.startRow; index <= cell.endRow; index += 1) {
            if (original[index]) spannedIds.push(original[index].id);
          }
          if (!spannedIds.length) return cell;

          const mapped = spannedIds
            .map((rowId) => nextRows.findIndex((row) => row.id === rowId))
            .filter((index) => index >= 0)
            .sort((left, right) => left - right);

          if (!mapped.length) return cell;
          return {
            ...cell,
            startRow: mapped[0],
            endRow: mapped[mapped.length - 1],
          };
        });
      });
    },
    [rows, setMergedCells],
  );

  const mergeCells = useCallback(
    (
      selection: GridSelection,
      context?: {
        rowIndices?: number[];
        columnIndices?: number[];
        rowIds?: (string | number)[];
      },
    ): GridMergedCell | null => {
      const rowTotal = rows.length;
      const colTotal = allColumns.length;
      if (!rowTotal || !colTotal) return null;
      const clamped = clampSelectionToGrid(selection, rowTotal, colTotal);
      if (!clamped) return null;

      const resolvedRows = uniquePreserveOrder(context?.rowIndices);
      const resolvedCols = uniquePreserveOrder(context?.columnIndices);
      const resolvedRowIds = uniqueRowIdsPreserveOrder(context?.rowIds);

      const rowIdIndex = new Map<string, number>();
      rows.forEach((row, index) => rowIdIndex.set(String(row.id), index));
      const resolvedRowIndicesFromIds = resolvedRowIds
        ?.map((id) => rowIdIndex.get(String(id)))
        .filter((index): index is number => index != null);

      const sortedRows = resolvedRowIndicesFromIds?.length
        ? resolvedRowIndicesFromIds.slice().sort((left, right) => left - right)
        : resolvedRows?.length
          ? resolvedRows.slice().sort((left, right) => left - right)
          : null;
      const startRow = sortedRows?.length ? sortedRows[0] : clamped.startRow;
      const endRow = sortedRows?.length
        ? sortedRows[sortedRows.length - 1]
        : clamped.endRow;
      const startCol = resolvedCols?.length
        ? Math.min(...resolvedCols)
        : clamped.startCol;
      const endCol = resolvedCols?.length
        ? Math.max(...resolvedCols)
        : clamped.endCol;

      if (startRow === endRow && startCol === endCol) return null;

      const topRow = resolvedRowIds?.length
        ? rows.find((row) => String(row.id) === String(resolvedRowIds[0])) ??
          rows[startRow]
        : rows[startRow];
      const topColumn = allColumns[startCol];
      if (!topRow || !topColumn) return null;
      const cellValue = topRow.data[topColumn.key] ?? { value: "" };

      const rangeRowIds =
        resolvedRowIds?.length
          ? resolvedRowIds
          : resolvedRows?.length
            ? resolvedRows
                .map((index) => rows[index]?.id)
                .filter((id): id is string | number => id != null)
            : rows.slice(startRow, endRow + 1).map((row) => row.id);
      const rowIdSet = rangeRowIds.length
        ? new Set(rangeRowIds.map((id) => String(id)))
        : null;

      const compacted =
        rowIdMergeMode === "compact" ? compactRowsByIds(rows, rangeRowIds) : null;
      const effectiveStartRow = compacted ? compacted.startRow : startRow;
      const effectiveEndRow = compacted ? compacted.endRow : endRow;
      const mergedRange = {
        startRow: Math.max(0, effectiveStartRow),
        endRow: Math.min(rowTotal - 1, effectiveEndRow),
        startCol: Math.max(0, startCol),
        endCol: Math.min(colTotal - 1, endCol),
      };

      if (compacted && !rowsHaveSameOrder(rows, compacted.nextRows)) {
        pushUndo(rows);
        setRows(compacted.nextRows);
      }

      let created: GridMergedCell | null = null;
      setMergedCells((prev) => {
        const alignedPrev = compacted
          ? remapMergedCellsToRowOrder(prev, rows, compacted.nextRows)
          : prev;
        const overlaps = alignedPrev.filter((cell) => {
          if (!rowIdSet) {
            return mergedCellIntersects(cell, mergedRange);
          }
          const cellRowIds = rowIdsForCell(cell, rows);
          const rowsOverlap = cellRowIds.some((id) => rowIdSet.has(String(id)));
          const colsOverlap =
            cell.startCol <= mergedRange.endCol &&
            cell.endCol >= mergedRange.startCol;
          return rowsOverlap && colsOverlap;
        });
        if (overlaps.length) {
          overlaps.forEach((cell) => spanKeyAnchorsRef.current.delete(cell.id));
        }
        const overlapIds = new Set(overlaps.map((cell) => cell.id));
        const filtered = overlapIds.size
          ? alignedPrev.filter((cell) => !overlapIds.has(cell.id))
          : alignedPrev;

        created = {
          id: `merge-${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          startRow: mergedRange.startRow,
          endRow: mergedRange.endRow,
          startCol: mergedRange.startCol,
          endCol: mergedRange.endCol,
          value: cellValue,
          rowIds: rangeRowIds.length ? rangeRowIds : undefined,
        };

        const anchorStart = Math.max(0, mergedRange.startCol);
        const anchorEnd = Math.min(colTotal - 1, mergedRange.endCol);
        spanKeyAnchorsRef.current.set(
          created.id,
          allColumnKeys.slice(anchorStart, anchorEnd + 1),
        );

        return [...filtered, created];
      });

      return created;
    },
    [
      allColumnKeys,
      allColumns,
      clampSelectionToGrid,
      pushUndo,
      rowIdMergeMode,
      rows,
      rowsHaveSameOrder,
      setMergedCells,
      setRows,
      spanKeyAnchorsRef,
      uniquePreserveOrder,
      uniqueRowIdsPreserveOrder,
    ],
  );

  const unmergeCells = useCallback(
    (
      selection: GridSelection,
      context?: {
        rowIndices?: number[];
        columnIndices?: number[];
        rowIds?: (string | number)[];
      },
    ) => {
      const normalized = {
        startRow: Math.min(selection.startRow, selection.endRow),
        endRow: Math.max(selection.startRow, selection.endRow),
        startCol: Math.min(selection.startCol, selection.endCol),
        endCol: Math.max(selection.startCol, selection.endCol),
      };
      const resolvedRowIds = uniqueRowIdsPreserveOrder(context?.rowIds);
      const rowIdSet = resolvedRowIds?.length
        ? new Set(resolvedRowIds.map((id) => String(id)))
        : null;
      const removed: string[] = [];
      setMergedCells((prev) =>
        prev.filter((cell) => {
          const intersects = rowIdSet
            ? (() => {
                const cellRowIds = rowIdsForCell(cell, rows);
                const rowsOverlap = cellRowIds.some((id) =>
                  rowIdSet.has(String(id)),
                );
                const colsOverlap =
                  cell.startCol <= normalized.endCol &&
                  cell.endCol >= normalized.startCol;
                return rowsOverlap && colsOverlap;
              })()
            : mergedCellIntersects(cell, normalized);
          if (intersects) {
            removed.push(cell.id);
            spanKeyAnchorsRef.current.delete(cell.id);
            return false;
          }
          return true;
        }),
      );
      return removed;
    },
    [rows, setMergedCells, spanKeyAnchorsRef, uniqueRowIdsPreserveOrder],
  );

  return {
    updateMergedCellsAfterReorder,
    updateMergedCellsAfterMultiReorder,
    mergeCells,
    unmergeCells,
  };
};
