import { useCallback, type RefObject } from "react";

type ScrollOffsetEntry = {
  offset: number;
  width: number;
};

type UseGridViewportScrollActionsArgs = {
  containerRef: RefObject<HTMLDivElement | null>;
  centerColumnOffsets: Map<string, ScrollOffsetEntry>;
  centerWidth: number;
  denseRowOffsets: number[] | null;
  effectiveHeaderHeight: number;
  effectiveHeaderTotalHeight: number;
  effectiveScrollTop: number;
  height: number;
  leftPinnedSet: Set<string>;
  pinnedBottomHeight: number;
  pinnedLeftWidth: number;
  pinnedRightWidth: number;
  pinnedTopHeight: number;
  rightPinnedSet: Set<string>;
  rowHeight: number;
  rowHeightOf: (id: string | number) => number;
  scrollLeft: number;
  scrollTop: number;
  searchRowOffsets: Map<number, number> | null;
  serverRowModelEnabled: boolean;
  stickyHeader: boolean;
  width: number;
};

export const useGridViewportScrollActions = ({
  containerRef,
  centerColumnOffsets,
  centerWidth,
  denseRowOffsets,
  effectiveHeaderHeight,
  effectiveHeaderTotalHeight,
  effectiveScrollTop,
  height,
  leftPinnedSet,
  pinnedBottomHeight,
  pinnedLeftWidth,
  pinnedRightWidth,
  pinnedTopHeight,
  rightPinnedSet,
  rowHeight,
  rowHeightOf,
  scrollLeft,
  scrollTop,
  searchRowOffsets,
  serverRowModelEnabled,
  stickyHeader,
  width,
}: UseGridViewportScrollActionsArgs) => {
  const keepSelectionVisible = useCallback(
    ({
      visualRowIndex,
      rowId,
      columnKey,
    }: {
      visualRowIndex: number;
      rowId?: string | number;
      columnKey: string;
    }) => {
      const container = containerRef.current;
      if (!container) return;

      let nextScrollTop = scrollTop;
      let nextScrollLeft = scrollLeft;

      const rowOffset = serverRowModelEnabled
        ? visualRowIndex * rowHeight
        : denseRowOffsets?.[visualRowIndex] ?? visualRowIndex * rowHeight;
      const rowHeightValue = serverRowModelEnabled
        ? rowHeight
        : rowId != null
          ? rowHeightOf(rowId)
          : rowHeight;
      const viewportHeight = container.clientHeight || height;
      const rowsViewportHeight = Math.max(
        0,
        viewportHeight -
          effectiveHeaderHeight -
          pinnedTopHeight -
          pinnedBottomHeight,
      );
      const visibleTop = effectiveScrollTop + pinnedTopHeight;
      const visibleBottom = visibleTop + rowsViewportHeight;
      const rowTop = rowOffset;
      const rowBottom = rowTop + rowHeightValue;

      if (rowTop < visibleTop) {
        const nextEffective = Math.max(0, rowTop - pinnedTopHeight);
        nextScrollTop = stickyHeader
          ? nextEffective
          : nextEffective + effectiveHeaderTotalHeight;
      } else if (rowBottom > visibleBottom) {
        const nextEffective = Math.max(
          0,
          rowBottom - pinnedTopHeight - rowsViewportHeight,
        );
        nextScrollTop = stickyHeader
          ? nextEffective
          : nextEffective + effectiveHeaderTotalHeight;
      }

      if (!leftPinnedSet.has(columnKey) && !rightPinnedSet.has(columnKey)) {
        const entry = centerColumnOffsets.get(columnKey);
        if (entry) {
          const viewportWidth =
            (container.clientWidth || width) -
            pinnedLeftWidth -
            pinnedRightWidth;
          const viewLeft = scrollLeft;
          const viewRight = scrollLeft + Math.max(0, viewportWidth);
          const colLeft = entry.offset;
          const colRight = entry.offset + entry.width;

          if (colLeft < viewLeft) {
            nextScrollLeft = colLeft;
          } else if (colRight > viewRight) {
            nextScrollLeft = colRight - Math.max(0, viewportWidth);
          }

          const maxScrollLeft = Math.max(0, centerWidth - viewportWidth);
          nextScrollLeft = Math.max(0, Math.min(nextScrollLeft, maxScrollLeft));
        }
      }

      if (nextScrollTop !== scrollTop || nextScrollLeft !== scrollLeft) {
        container.scrollTo({
          top: nextScrollTop,
          left: nextScrollLeft,
          behavior: "auto",
        });
      }
    },
    [
      centerColumnOffsets,
      centerWidth,
      containerRef,
      denseRowOffsets,
      effectiveHeaderHeight,
      effectiveHeaderTotalHeight,
      effectiveScrollTop,
      height,
      leftPinnedSet,
      pinnedBottomHeight,
      pinnedLeftWidth,
      pinnedRightWidth,
      pinnedTopHeight,
      rightPinnedSet,
      rowHeight,
      rowHeightOf,
      scrollLeft,
      scrollTop,
      serverRowModelEnabled,
      stickyHeader,
      width,
    ],
  );

  const scrollToSearchMatch = useCallback(
    (match: {
      rowId: string | number;
      rowIndex: number;
      columnKey: string;
    }) => {
      const container = containerRef.current;
      if (!container) return;

      let nextScrollTop = scrollTop;
      let nextScrollLeft = scrollLeft;

      const rowOffset =
        searchRowOffsets?.get(match.rowIndex) ??
        (serverRowModelEnabled ? match.rowIndex * rowHeight : null);
      if (rowOffset != null) {
        const rowHeightValue = serverRowModelEnabled
          ? rowHeight
          : rowHeightOf(match.rowId);
        const viewportHeight = container.clientHeight || height;
        const rowsViewportHeight = Math.max(
          0,
          viewportHeight -
            effectiveHeaderHeight -
            pinnedTopHeight -
            pinnedBottomHeight,
        );
        const visibleTop = effectiveScrollTop + pinnedTopHeight;
        const visibleBottom = visibleTop + rowsViewportHeight;
        const rowTop = rowOffset;
        const rowBottom = rowTop + rowHeightValue;

        if (rowTop < visibleTop) {
          const nextEffective = Math.max(0, rowTop - pinnedTopHeight);
          nextScrollTop = stickyHeader
            ? nextEffective
            : nextEffective + effectiveHeaderTotalHeight;
        } else if (rowBottom > visibleBottom) {
          const nextEffective = Math.max(
            0,
            rowBottom - pinnedTopHeight - rowsViewportHeight,
          );
          nextScrollTop = stickyHeader
            ? nextEffective
            : nextEffective + effectiveHeaderTotalHeight;
        }
      }

      if (
        !leftPinnedSet.has(match.columnKey) &&
        !rightPinnedSet.has(match.columnKey)
      ) {
        const entry = centerColumnOffsets.get(match.columnKey);
        if (entry) {
          const viewportWidth =
            (container.clientWidth || width) -
            pinnedLeftWidth -
            pinnedRightWidth;
          const viewLeft = scrollLeft;
          const viewRight = scrollLeft + Math.max(0, viewportWidth);
          const colLeft = entry.offset;
          const colRight = entry.offset + entry.width;

          if (colLeft < viewLeft) {
            nextScrollLeft = colLeft;
          } else if (colRight > viewRight) {
            nextScrollLeft = colRight - Math.max(0, viewportWidth);
          }

          const maxScrollLeft = Math.max(0, centerWidth - viewportWidth);
          nextScrollLeft = Math.max(0, Math.min(nextScrollLeft, maxScrollLeft));
        }
      }

      if (nextScrollTop !== scrollTop || nextScrollLeft !== scrollLeft) {
        container.scrollTo({
          top: nextScrollTop,
          left: nextScrollLeft,
          behavior: "auto",
        });
      }
    },
    [
      centerColumnOffsets,
      centerWidth,
      containerRef,
      effectiveHeaderHeight,
      effectiveHeaderTotalHeight,
      effectiveScrollTop,
      height,
      leftPinnedSet,
      pinnedBottomHeight,
      pinnedLeftWidth,
      pinnedRightWidth,
      pinnedTopHeight,
      rightPinnedSet,
      rowHeight,
      rowHeightOf,
      scrollLeft,
      scrollTop,
      searchRowOffsets,
      serverRowModelEnabled,
      stickyHeader,
      width,
    ],
  );

  return {
    keepSelectionVisible,
    scrollToSearchMatch,
  };
};
