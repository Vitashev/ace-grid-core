import { useEffect, useRef } from "react";

import type {
  GridColumn,
  GridMergedCell,
  GridSearchMatch,
  GridSelection,
} from "../../types";

type UseGridSearchNavigationEffectArgs = {
  activeMatchIndex?: number;
  colIndex: Map<string, number>;
  columns: GridColumn[];
  effectiveMergedCells: GridMergedCell[];
  enableCellSpanning: boolean;
  onActiveMatchChange?: (
    match: GridSearchMatch | null,
    meta: { index: number; total: number },
  ) => void;
  onSelectionRangeChange?: (selection: GridSelection | null) => void;
  rowIndexToVisual: Map<number, number>;
  scrollToSearchMatch: (match: GridSearchMatch) => void;
  searchMatches: GridSearchMatch[];
  searchNavigationEnabled: boolean;
  selectionColumnIndex: Map<string, number>;
};

export const useGridSearchNavigationEffect = ({
  activeMatchIndex,
  colIndex,
  columns,
  effectiveMergedCells,
  enableCellSpanning,
  onActiveMatchChange,
  onSelectionRangeChange,
  rowIndexToVisual,
  scrollToSearchMatch,
  searchMatches,
  searchNavigationEnabled,
  selectionColumnIndex,
}: UseGridSearchNavigationEffectArgs) => {
  const lastScrolledMatchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!searchNavigationEnabled) {
      lastScrolledMatchKeyRef.current = null;
      return;
    }
    if (activeMatchIndex == null || !Number.isFinite(activeMatchIndex)) {
      lastScrolledMatchKeyRef.current = null;
      return;
    }

    if (!searchMatches.length) {
      lastScrolledMatchKeyRef.current = null;
      onActiveMatchChange?.(null, { index: -1, total: 0 });
      return;
    }

    const clamped = Math.max(0, Math.min(activeMatchIndex, searchMatches.length - 1));
    const match = searchMatches[clamped];
    if (!match) return;

    onActiveMatchChange?.(match, {
      index: clamped,
      total: searchMatches.length,
    });

    const matchKey = `${clamped}:${String(match.rowId)}:${match.rowIndex}:${match.columnKey}`;

    const selectionColIndex = selectionColumnIndex.get(match.columnKey);
    if (selectionColIndex != null) {
      let absStartRow = match.rowIndex;
      let absEndRow = match.rowIndex;
      let selectionStartCol = selectionColIndex;
      let selectionEndCol = selectionColIndex;

      if (enableCellSpanning && effectiveMergedCells.length) {
        const matchColIndex = colIndex.get(match.columnKey);
        if (matchColIndex != null) {
          const span = effectiveMergedCells.find((cell) => {
            const spanStartRow = Math.min(cell.startRow, cell.endRow);
            const spanEndRow = Math.max(cell.startRow, cell.endRow);
            const spanStartCol = Math.min(cell.startCol, cell.endCol);
            const spanEndCol = Math.max(cell.startCol, cell.endCol);
            return (
              match.rowIndex >= spanStartRow &&
              match.rowIndex <= spanEndRow &&
              matchColIndex >= spanStartCol &&
              matchColIndex <= spanEndCol
            );
          });

          if (span) {
            absStartRow = Math.min(span.startRow, span.endRow);
            absEndRow = Math.max(span.startRow, span.endRow);

            const startCol = columns[span.startCol];
            const endCol = columns[span.endCol];
            const startIdx = startCol
              ? selectionColumnIndex.get(startCol.key)
              : null;
            const endIdx = endCol ? selectionColumnIndex.get(endCol.key) : null;

            if (startIdx != null && endIdx != null) {
              selectionStartCol = Math.min(startIdx, endIdx);
              selectionEndCol = Math.max(startIdx, endIdx);
            }
          }
        }
      }

      const visualStartRow =
        rowIndexToVisual.get(absStartRow) != null
          ? (rowIndexToVisual.get(absStartRow) as number)
          : absStartRow;
      const visualEndRow =
        rowIndexToVisual.get(absEndRow) != null
          ? (rowIndexToVisual.get(absEndRow) as number)
          : absEndRow;

      onSelectionRangeChange?.({
        startRow: Math.min(visualStartRow, visualEndRow),
        endRow: Math.max(visualStartRow, visualEndRow),
        startCol: selectionStartCol,
        endCol: selectionEndCol,
      });
    }

    if (lastScrolledMatchKeyRef.current !== matchKey) {
      scrollToSearchMatch(match);
      lastScrolledMatchKeyRef.current = matchKey;
    }
  }, [
    activeMatchIndex,
    colIndex,
    columns,
    effectiveMergedCells,
    enableCellSpanning,
    onActiveMatchChange,
    onSelectionRangeChange,
    rowIndexToVisual,
    scrollToSearchMatch,
    searchMatches,
    searchNavigationEnabled,
    selectionColumnIndex,
  ]);
};
