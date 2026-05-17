import { useMemo } from "react";

import type {
  GridPaginationMode,
  GridRowGroup,
} from "../../../types";
import type { UsePaginationResult } from "./usePagination";
import { paginateRowGroups, type PaginatedRowGroups } from "../utils";

interface UseGridPaginationSliceArgs {
  enabled: boolean;
  mode: GridPaginationMode;
  paginationState: UsePaginationResult;
  paginationTotalRows: number;
  paginationTotalRowCount?: number;
  totalCenterRowCount: number;
  centerGroupsWithDetail: GridRowGroup[];
  ssrmPaginationActive: boolean;
  serverRowModelEnabled: boolean;
  serverRowRenderChunkSize: number;
  rowHeight: number;
  showFirstLast: boolean;
}

export interface UseGridPaginationSliceResult {
  paginationSlice: PaginatedRowGroups;
  centerGroupsForRender: GridRowGroup[];
  currentCenterRowCount: number;
  paginationRangeStart: number;
  paginationRangeEnd: number;
  paginationTotalRowsForRender: number;
  effectiveShowFirstLast: boolean;
}

const buildSsrmPageChunkGroups = ({
  pageStart,
  pageEnd,
  chunkSize,
  rowHeight,
}: {
  pageStart: number;
  pageEnd: number;
  chunkSize: number;
  rowHeight: number;
}) => {
  const firstChunkStart = Math.floor(pageStart / chunkSize) * chunkSize;
  const pageGroups: GridRowGroup[] = [];
  for (
    let chunkStart = firstChunkStart;
    chunkStart <= pageEnd;
    chunkStart += chunkSize
  ) {
    const startRow = Math.max(pageStart, chunkStart);
    const endRow = Math.min(pageEnd, chunkStart + chunkSize - 1);
    const count = Math.max(0, endRow - startRow + 1);
    pageGroups.push({
      id: `sr-page-chunk-${startRow}`,
      rows: [],
      startRowIndex: startRow,
      endRowIndex: endRow,
      height: count * rowHeight,
      spans: new Map(),
      isParent: false,
    });
  }
  return pageGroups;
};

export const useGridPaginationSlice = ({
  enabled,
  mode,
  paginationState,
  paginationTotalRows,
  paginationTotalRowCount,
  totalCenterRowCount,
  centerGroupsWithDetail,
  ssrmPaginationActive,
  serverRowModelEnabled,
  serverRowRenderChunkSize,
  rowHeight,
  showFirstLast,
}: UseGridPaginationSliceArgs): UseGridPaginationSliceResult => {
  const paginationSlice = useMemo<PaginatedRowGroups>(() => {
    if (!enabled) {
      return {
        groups: centerGroupsWithDetail,
        totalRowCount: totalCenterRowCount,
        pageRowCount: totalCenterRowCount,
        startRowIndex: totalCenterRowCount > 0 ? 0 : null,
        endRowIndex: totalCenterRowCount > 0 ? totalCenterRowCount - 1 : null,
      };
    }

    if (mode === "server" || mode === "cursor") {
      if (ssrmPaginationActive && serverRowModelEnabled) {
        const totalRows = Math.max(0, totalCenterRowCount);
        if (totalRows <= 0) {
          return {
            groups: [],
            totalRowCount: paginationTotalRows,
            pageRowCount: 0,
            startRowIndex: null,
            endRowIndex: null,
          };
        }

        const pageSize = Math.max(1, Math.trunc(paginationState.pageSize));
        const pageStart = Math.max(0, paginationState.pageIndex * pageSize);
        if (pageStart >= totalRows) {
          return {
            groups: [],
            totalRowCount: paginationTotalRows,
            pageRowCount: 0,
            startRowIndex: null,
            endRowIndex: null,
          };
        }
        const pageEnd = Math.max(
          pageStart,
          Math.min(totalRows - 1, pageStart + pageSize - 1)
        );
        const chunkSize = Math.max(1, serverRowRenderChunkSize);

        return {
          groups: buildSsrmPageChunkGroups({
            pageStart,
            pageEnd,
            chunkSize,
            rowHeight,
          }),
          totalRowCount: paginationTotalRows,
          pageRowCount: Math.max(0, pageEnd - pageStart + 1),
          startRowIndex: pageStart,
          endRowIndex: pageEnd,
        };
      }

      const pageRowCount = totalCenterRowCount;
      const startRowIndex =
        paginationTotalRows > 0
          ? paginationState.pageIndex * paginationState.pageSize
          : null;
      const endRowIndex =
        startRowIndex != null && pageRowCount > 0
          ? Math.min(
              paginationTotalRows - 1,
              startRowIndex + pageRowCount - 1
            )
          : null;

      return {
        groups: centerGroupsWithDetail,
        totalRowCount: paginationTotalRows,
        pageRowCount,
        startRowIndex,
        endRowIndex,
      };
    }

    return paginateRowGroups(
      centerGroupsWithDetail,
      paginationState.pageIndex,
      paginationState.pageSize
    );
  }, [
    centerGroupsWithDetail,
    enabled,
    mode,
    paginationState.pageIndex,
    paginationState.pageSize,
    paginationTotalRows,
    rowHeight,
    serverRowModelEnabled,
    serverRowRenderChunkSize,
    ssrmPaginationActive,
    totalCenterRowCount,
  ]);

  const centerGroupsForRender = paginationSlice.groups;
  const currentCenterRowCount = paginationSlice.pageRowCount;

  const hasPaginationRows =
    enabled &&
    currentCenterRowCount > 0 &&
    (mode === "cursor" ? true : paginationTotalRows > 0);

  const paginationRangeStart = hasPaginationRows
    ? mode === "server" || mode === "cursor"
      ? paginationState.pageIndex * paginationState.pageSize + 1
      : (paginationSlice.startRowIndex ?? 0) + 1
    : 0;

  const paginationRangeEnd = hasPaginationRows
    ? mode === "cursor" && paginationTotalRowCount == null
      ? paginationRangeStart + currentCenterRowCount - 1
      : Math.min(
          paginationTotalRows,
          paginationRangeStart + currentCenterRowCount - 1
        )
    : 0;

  const paginationTotalRowsForRender =
    mode === "cursor" && paginationTotalRowCount == null
      ? paginationRangeEnd
      : paginationTotalRows;

  const effectiveShowFirstLast = mode === "cursor" ? false : showFirstLast;

  return {
    paginationSlice,
    centerGroupsForRender,
    currentCenterRowCount,
    paginationRangeStart,
    paginationRangeEnd,
    paginationTotalRowsForRender,
    effectiveShowFirstLast,
  };
};
