import { useMemo } from "react";

import type { GridColumn, GridRow } from "../../types";

type UseGridViewportOffsetsStateArgs = {
  centerColumns: GridColumn[];
  colWidthOf: (key: string) => number;
  searchNavigationEnabled: boolean;
  hasSearchMatcher: boolean;
  searchMatchCount: number;
  serverRowModelEnabled: boolean;
  visualRowOrder: number[];
  rows: GridRow[];
  rowHeightOf: (id: string | number) => number;
  rowHeight: number;
  hasCustomRowHeights: boolean;
};

export const useGridViewportOffsetsState = ({
  centerColumns,
  colWidthOf,
  searchNavigationEnabled,
  hasSearchMatcher,
  searchMatchCount,
  serverRowModelEnabled,
  visualRowOrder,
  rows,
  rowHeightOf,
  rowHeight,
  hasCustomRowHeights,
}: UseGridViewportOffsetsStateArgs) => {
  const searchRowOffsets = useMemo(() => {
    if (
      !searchNavigationEnabled ||
      !hasSearchMatcher ||
      searchMatchCount === 0 ||
      serverRowModelEnabled
    ) {
      return null;
    }

    const map = new Map<number, number>();
    let offset = 0;
    visualRowOrder.forEach((absoluteRowIndex) => {
      map.set(absoluteRowIndex, offset);
      const row = rows[absoluteRowIndex];
      const heightForRow = row?.id != null ? rowHeightOf(row.id) : rowHeight;
      offset += heightForRow;
    });
    return map;
  }, [
    searchNavigationEnabled,
    hasSearchMatcher,
    searchMatchCount,
    serverRowModelEnabled,
    visualRowOrder,
    rows,
    rowHeightOf,
    rowHeight,
  ]);

  const centerColumnOffsets = useMemo(() => {
    const map = new Map<string, { offset: number; width: number }>();
    let offset = 0;
    centerColumns.forEach((column) => {
      const width = colWidthOf(column.key);
      map.set(column.key, { offset, width });
      offset += width;
    });
    return map;
  }, [centerColumns, colWidthOf]);

  const denseRowOffsets = useMemo(() => {
    if (serverRowModelEnabled || !hasCustomRowHeights) return null;
    const offsets: number[] = new Array(visualRowOrder.length);
    let offset = 0;
    visualRowOrder.forEach((absoluteRowIndex, visualRowIndex) => {
      offsets[visualRowIndex] = offset;
      const row = rows[absoluteRowIndex];
      offset += row?.id != null ? rowHeightOf(row.id) : rowHeight;
    });
    return offsets;
  }, [
    serverRowModelEnabled,
    hasCustomRowHeights,
    visualRowOrder,
    rows,
    rowHeightOf,
    rowHeight,
  ]);

  return {
    searchRowOffsets,
    centerColumnOffsets,
    denseRowOffsets,
  };
};
