import { useMemo } from "react";
import type { RefObject } from "react";
import { RowGroupLike, useCellSelection } from "../features/cell-selection";
import {
  GridHeaderCellSelectionMode,
  GridSelection,
  GridRow,
  GridRowGroup,
  GridColumn,
} from "../types";

type UseGridSelectionHandlersArgs = {
  selection: GridSelection | null;
  enableCellSelection: boolean;
  selectEntireRowOnSelection: boolean;
  selectEntireColumnOnSelection: boolean;
  rowCellSelectionMode: GridHeaderCellSelectionMode;
  columnCellSelectionMode: GridHeaderCellSelectionMode;
  rowCellSelectionIncludeSpans: boolean;
  columnCellSelectionIncludeSpans: boolean;
  rows: GridRow[];
  rowCount?: number;
  rowIndexLookup: Map<string | number, number>;
  pinnedTopGroups: GridRowGroup[];
  centerGroups: GridRowGroup[];
  pinnedBottomGroups: GridRowGroup[];
  visualColumns: GridColumn[];
  visualColumnIndex: Map<string, number>;
  rowIndexToVisual: Map<number, number>;
  onSelectionRangeChange?: (selection: GridSelection | null) => void;
  containerRef: RefObject<HTMLDivElement>;
  edgeSize?: number;
  maxEdgeSpeed?: number;
  pinnedLeftColumnCount: number;
  centerColumnCount: number;
};

export const useGridSelectionHandlers = ({
  selection,
  enableCellSelection,
  selectEntireRowOnSelection,
  selectEntireColumnOnSelection,
  rowCellSelectionMode,
  columnCellSelectionMode,
  rowCellSelectionIncludeSpans,
  columnCellSelectionIncludeSpans,
  rows,
  rowCount,
  rowIndexLookup,
  pinnedTopGroups,
  centerGroups,
  pinnedBottomGroups,
  visualColumns,
  visualColumnIndex,
  rowIndexToVisual,
  onSelectionRangeChange,
  containerRef,
  edgeSize = 36,
  maxEdgeSpeed = 40,
  pinnedLeftColumnCount,
  centerColumnCount,
}: UseGridSelectionHandlersArgs) => {
  const rowGroups = useMemo(
    () =>
      [
        ...pinnedTopGroups,
        ...centerGroups,
        ...pinnedBottomGroups,
      ] as RowGroupLike[],
    [pinnedTopGroups, centerGroups, pinnedBottomGroups]
  );

  const pinnedTopRowCount = useMemo(
    () =>
      pinnedTopGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [pinnedTopGroups]
  );
  const pinnedBottomRowCount = useMemo(
    () =>
      pinnedBottomGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [pinnedBottomGroups]
  );
  const pinnedRightColumnCount = useMemo(
    () =>
      Math.max(
        0,
        visualColumns.length - pinnedLeftColumnCount - centerColumnCount
      ),
    [visualColumns.length, pinnedLeftColumnCount, centerColumnCount]
  );

  const centerRowCount = useMemo(
    () => centerGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [centerGroups]
  );

  const centerColumnRange = useMemo(() => {
    if (centerColumnCount <= 0) {
      const pinnedCount = pinnedLeftColumnCount + pinnedRightColumnCount;
      return pinnedCount > 0 ? { start: 1, end: 0 } : null;
    }
    const start = Math.max(0, pinnedLeftColumnCount);
    const end = start + centerColumnCount - 1;
    return { start, end };
  }, [pinnedLeftColumnCount, pinnedRightColumnCount, centerColumnCount]);

  const centerRowRange = useMemo(() => {
    if (centerRowCount <= 0) {
      const pinnedCount = pinnedTopRowCount + pinnedBottomRowCount;
      return pinnedCount > 0 ? { start: 1, end: 0 } : null;
    }
    const start = Math.max(0, pinnedTopRowCount);
    const end = start + centerRowCount - 1;
    return { start, end };
  }, [pinnedTopRowCount, pinnedBottomRowCount, centerRowCount]);

  return useCellSelection({
    selection,
    enableCellSelection,
    selectEntireRowOnSelection,
    selectEntireColumnOnSelection,
    rowCellSelectionMode,
    columnCellSelectionMode,
    rowCellSelectionIncludeSpans,
    columnCellSelectionIncludeSpans,
    rows,
    rowCount,
    rowIndexLookup,
    rowGroups,
    visualColumns,
    visualColumnIndex,
    rowIndexToVisual,
    onSelectionRangeChange,
    containerRef,
    edgeSize,
    maxEdgeSpeed,
    centerColumnRange,
    centerRowRange,
  });
};
