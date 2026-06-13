import { useCallback, useMemo } from "react";
import type { GridColumn, GridMergedCell, GridRowGroup } from "../../../types";
import { useVirtualization } from "../../virtual";

type GridRange = { start: number; end: number } | null;

type UseGridLayoutMetricsParams = {
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  columns: GridColumn[];
  pinnedTopGroupsWithDetail: GridRowGroup[];
  pinnedBottomGroupsWithDetail: GridRowGroup[];
  effectivePinnedTopGroups: GridRowGroup[];
  effectivePinnedBottomGroups: GridRowGroup[];
  centerGroupsForRender: GridRowGroup[];
  colWidthOf: (key: string) => number;
  rowHeight: number;
  height: number;
  width: number;
  stickyHeader: boolean;
  headerTotalHeight: number;
  scrollTop: number;
  scrollLeft: number;
  isAtVerticalScrollEnd: boolean;
  enableCellSpanning: boolean;
  effectiveMergedCells: GridMergedCell[];
  effectiveInfiniteScroll: boolean;
  infiniteScrollLoadingTop: boolean;
  infiniteScrollLoadingBottom: boolean;
  effectiveVirtualization: boolean;
  enableHorizontalVirtualization: boolean;
  rowBufferPx?: number;
  columnBufferPx?: number;
  serverRowModelEnabled: boolean;
};

export const useGridLayoutMetrics = ({
  pinnedLeftColumns,
  pinnedRightColumns,
  centerColumns,
  columns,
  pinnedTopGroupsWithDetail,
  pinnedBottomGroupsWithDetail,
  effectivePinnedTopGroups,
  effectivePinnedBottomGroups,
  centerGroupsForRender,
  colWidthOf,
  rowHeight,
  height,
  width,
  stickyHeader,
  headerTotalHeight,
  scrollTop,
  scrollLeft,
  isAtVerticalScrollEnd,
  enableCellSpanning,
  effectiveMergedCells,
  effectiveInfiniteScroll,
  infiniteScrollLoadingTop,
  infiniteScrollLoadingBottom,
  effectiveVirtualization,
  enableHorizontalVirtualization,
  rowBufferPx,
  columnBufferPx,
  serverRowModelEnabled,
}: UseGridLayoutMetricsParams) => {
  const pinnedLeftWidth = useMemo(
    () => pinnedLeftColumns.reduce((sum, column) => sum + colWidthOf(column.key), 0),
    [pinnedLeftColumns, colWidthOf]
  );

  const pinnedRightWidth = useMemo(
    () =>
      pinnedRightColumns.reduce((sum, column) => sum + colWidthOf(column.key), 0),
    [pinnedRightColumns, colWidthOf]
  );

  const centerWidth = useMemo(
    () => centerColumns.reduce((sum, column) => sum + colWidthOf(column.key), 0),
    [centerColumns, colWidthOf]
  );

  const pinnedTopHeight = useMemo(
    () => pinnedTopGroupsWithDetail.reduce((sum, group) => sum + group.height, 0),
    [pinnedTopGroupsWithDetail]
  );

  const pinnedBottomHeight = useMemo(
    () =>
      pinnedBottomGroupsWithDetail.reduce((sum, group) => sum + group.height, 0),
    [pinnedBottomGroupsWithDetail]
  );

  const inlineInfiniteScrollLoaderRowHeight = Math.max(36, rowHeight);

  const topInlineInfiniteScrollLoaderHeight =
    effectiveInfiniteScroll && infiniteScrollLoadingTop
      ? inlineInfiniteScrollLoaderRowHeight
      : 0;

  const bottomInlineInfiniteScrollLoaderHeight =
    effectiveInfiniteScroll && infiniteScrollLoadingBottom
      ? inlineInfiniteScrollLoaderRowHeight
      : 0;

  const centerHeight = useMemo(
    () =>
      centerGroupsForRender.reduce((sum, group) => sum + group.height, 0) +
      topInlineInfiniteScrollLoaderHeight +
      bottomInlineInfiniteScrollLoaderHeight,
    [
      centerGroupsForRender,
      topInlineInfiniteScrollLoaderHeight,
      bottomInlineInfiniteScrollLoaderHeight,
    ]
  );

  const effectiveHeaderHeight = stickyHeader
    ? headerTotalHeight
    : Math.max(0, headerTotalHeight - scrollTop);

  const effectiveScrollTop = stickyHeader
    ? scrollTop
    : Math.max(0, scrollTop - headerTotalHeight);

  const centerSpanRanges = useMemo(() => {
    if (
      !enableCellSpanning ||
      effectiveMergedCells.length === 0 ||
      centerColumns.length === 0
    ) {
      return [] as Array<{ start: number; end: number }>;
    }

    const centerIndex = new Map<string, number>();
    centerColumns.forEach((column, index) => {
      centerIndex.set(column.key, index);
    });

    const ranges: Array<{ start: number; end: number }> = [];
    effectiveMergedCells.forEach((cell) => {
      if (cell.startCol === cell.endCol) return;
      const startColumn = columns[cell.startCol];
      const endColumn = columns[cell.endCol];
      if (!startColumn || !endColumn) return;
      const startIndex = centerIndex.get(startColumn.key);
      const endIndex = centerIndex.get(endColumn.key);
      if (startIndex == null || endIndex == null) return;
      ranges.push({
        start: Math.min(startIndex, endIndex),
        end: Math.max(startIndex, endIndex),
      });
    });

    return ranges;
  }, [enableCellSpanning, effectiveMergedCells, columns, centerColumns]);

  const verticalOverscanPx =
    rowBufferPx == null
      ? serverRowModelEnabled
        ? Math.max(rowHeight * 40, height * 2)
        : Math.max(rowHeight * 16, height)
      : Math.max(0, rowBufferPx);

  const { virtualCenterGroups, virtualCenterCols } = useVirtualization(
    effectiveVirtualization,
    enableHorizontalVirtualization,
    height,
    width,
    effectiveHeaderHeight,
    pinnedTopHeight,
    pinnedBottomHeight,
    rowHeight,
    pinnedLeftWidth,
    pinnedRightWidth,
    centerGroupsForRender,
    centerColumns,
    colWidthOf,
    effectiveScrollTop,
    scrollLeft,
    centerSpanRanges,
    verticalOverscanPx,
    topInlineInfiniteScrollLoaderHeight,
    isAtVerticalScrollEnd,
    columnBufferPx
  );

  const pinnedLeftColumnCount = pinnedLeftColumns.length;
  const centerColumnCount = centerColumns.length;
  const pinnedRightColumnCount = pinnedRightColumns.length;

  const pinnedTopRowCount = useMemo(
    () =>
      effectivePinnedTopGroups.reduce(
        (sum, group) => sum + group.rows.length,
        0
      ),
    [effectivePinnedTopGroups]
  );

  const pinnedBottomRowCount = useMemo(
    () =>
      effectivePinnedBottomGroups.reduce(
        (sum, group) => sum + group.rows.length,
        0
      ),
    [effectivePinnedBottomGroups]
  );

  const centerRowCount = useMemo(() => {
    if (serverRowModelEnabled) {
      return centerGroupsForRender.reduce(
        (sum, group) =>
          sum + Math.max(0, group.endRowIndex - group.startRowIndex + 1),
        0
      );
    }
    return centerGroupsForRender.reduce(
      (sum, group) => sum + group.rows.length,
      0
    );
  }, [centerGroupsForRender, serverRowModelEnabled]);

  const centerColumnRange = useMemo<GridRange>(() => {
    if (centerColumnCount <= 0) {
      const pinnedCount = pinnedLeftColumnCount + pinnedRightColumnCount;
      return pinnedCount > 0 ? { start: 1, end: 0 } : null;
    }
    const start = Math.max(0, pinnedLeftColumnCount);
    const end = start + centerColumnCount - 1;
    return { start, end };
  }, [pinnedLeftColumnCount, pinnedRightColumnCount, centerColumnCount]);

  const centerRowRange = useMemo<GridRange>(() => {
    if (centerRowCount <= 0) {
      const pinnedCount = pinnedTopRowCount + pinnedBottomRowCount;
      return pinnedCount > 0 ? { start: 1, end: 0 } : null;
    }
    const start = Math.max(0, pinnedTopRowCount);
    const end = start + centerRowCount - 1;
    return { start, end };
  }, [pinnedTopRowCount, pinnedBottomRowCount, centerRowCount]);

  const pinnedLeftEdgeMap = useMemo(() => {
    const map = new Map<string, number>();
    let acc = 0;
    pinnedLeftColumns.forEach((column) => {
      acc += colWidthOf(column.key);
      map.set(column.key, acc);
    });
    return map;
  }, [pinnedLeftColumns, colWidthOf]);

  const centerVisibleWidth = useMemo(
    () => virtualCenterCols.visible.reduce((sum, column) => sum + colWidthOf(column.key), 0),
    [colWidthOf, virtualCenterCols.visible]
  );

  const centerEdgeMap = useMemo(() => {
    const map = new Map<string, number>();
    let acc = 0;
    virtualCenterCols.visible.forEach((column) => {
      acc += colWidthOf(column.key);
      map.set(column.key, acc);
    });
    return map;
  }, [colWidthOf, virtualCenterCols.visible]);

  const pinnedRightEdgeMap = useMemo(() => {
    const map = new Map<string, number>();
    let acc = 0;
    pinnedRightColumns.forEach((column) => {
      acc += colWidthOf(column.key);
      map.set(column.key, acc);
    });
    return map;
  }, [pinnedRightColumns, colWidthOf]);

  const getColumnEdgeOffset = useCallback(
    (columnKey: string) => {
      const leftEdge = pinnedLeftEdgeMap.get(columnKey);
      if (leftEdge != null) return leftEdge;

      const centerEdge = centerEdgeMap.get(columnKey);
      if (centerEdge != null) {
        return pinnedLeftWidth + virtualCenterCols.before + centerEdge;
      }

      const rightEdge = pinnedRightEdgeMap.get(columnKey);
      if (rightEdge != null) {
        return (
          pinnedLeftWidth +
          virtualCenterCols.before +
          centerVisibleWidth +
          virtualCenterCols.after +
          rightEdge
        );
      }

      return null;
    },
    [
      centerEdgeMap,
      centerVisibleWidth,
      pinnedLeftEdgeMap,
      pinnedLeftWidth,
      pinnedRightEdgeMap,
      virtualCenterCols.after,
      virtualCenterCols.before,
    ]
  );

  const totalWidth = pinnedLeftWidth + centerWidth + pinnedRightWidth;
  const totalHeight =
    headerTotalHeight + pinnedTopHeight + centerHeight + pinnedBottomHeight;

  return {
    pinnedLeftColumnCount,
    centerColumnCount,
    pinnedRightColumnCount,
    centerRowCount,
    pinnedLeftWidth,
    pinnedRightWidth,
    centerWidth,
    pinnedTopHeight,
    pinnedBottomHeight,
    centerHeight,
    inlineInfiniteScrollLoaderRowHeight,
    topInlineInfiniteScrollLoaderHeight,
    bottomInlineInfiniteScrollLoaderHeight,
    effectiveHeaderHeight,
    effectiveScrollTop,
    centerSpanRanges,
    virtualCenterGroups,
    virtualCenterCols,
    centerColumnRange,
    centerRowRange,
    getColumnEdgeOffset,
    totalWidth,
    totalHeight,
  };
};
