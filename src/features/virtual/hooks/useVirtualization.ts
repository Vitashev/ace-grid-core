import { useMemo } from "react";
import type { GridColumn } from "../../../types";
import type { GridRowGroup } from "../../sorting";
import { makePrefix, lb } from "../utils";

/**
 * Completely reworked virtualization hook.
 * Same inputs/outputs & behavior, but different structure, helpers, and naming.
 */
export function useVirtualization(
  vEnabled: boolean,
  hEnabled: boolean,
  canvasH: number,
  canvasW: number,
  headerH: number,
  topPinnedH: number,
  bottomPinnedH: number,
  rowH: number,
  leftPinnedW: number,
  rightPinnedW: number,
  middleRowGroups: GridRowGroup[],
  middleCols: GridColumn[],
  widthOf: (key: string, fallback?: number) => number,
  scTop: number,
  scLeft: number,
  spanRanges?: Array<{ start: number; end: number }>,
  verticalOverscanPx?: number,
  verticalLeadingInsetPx?: number,
  forceAtVerticalEnd?: boolean,
  horizontalOverscanPx?: number
) {
  const groupHeights = useMemo(
    () => middleRowGroups.map((g) => g.height),
    [middleRowGroups]
  );
  const colWidths = useMemo(
    () => middleCols.map((c) => widthOf(c.key)),
    [middleCols, widthOf]
  );

  const groupPrefix = useMemo(() => makePrefix(groupHeights), [groupHeights]);
  const colPrefix = useMemo(() => makePrefix(colWidths), [colWidths]);

  const virtualCenterGroups = useMemo(() => {
    if (!vEnabled) {
      return {
        visible: middleRowGroups,
        start: 0,
        end: middleRowGroups.length - 1,
        before: 0,
        after: 0,
      };
    }

    const viewportH = Math.max(
      0,
      canvasH - headerH - topPinnedH - bottomPinnedH
    );

    // Keep a wider overscan window when requested (e.g. SSRM) to avoid
    // transient blank areas during fast scrolling.
    const pad =
      verticalOverscanPx == null
        ? 3 * rowH
        : Math.max(0, verticalOverscanPx);
    const rowsTotalPx = groupPrefix[middleRowGroups.length] ?? 0;
    const leadingInsetPx = Math.max(0, verticalLeadingInsetPx ?? 0);
    const rowSpaceTop = Math.min(
      rowsTotalPx,
      Math.max(0, scTop - leadingInsetPx)
    );
    const viewportBottomPx = rowSpaceTop + viewportH;
    // When bottom-pinned rows are present, center-row content can already be at
    // its logical end before we consume the pinned-bottom reservation. Clamp in
    // either case to avoid trailing blank gaps near the bottom.
    const viewportBottomIgnoringPinnedBottomPx = viewportBottomPx + bottomPinnedH;
    const canForceAtBottom =
      Boolean(forceAtVerticalEnd) &&
      rowsTotalPx > viewportH + 1 &&
      rowSpaceTop > 0;
    const atOrPastBottom =
      canForceAtBottom ||
      viewportBottomPx >= rowsTotalPx - 1 ||
      viewportBottomIgnoringPinnedBottomPx >= rowsTotalPx - 1;
    const fromPx = Math.max(0, rowSpaceTop - pad);
    const toPx = rowSpaceTop + viewportH + pad;

    // Convert scroll-window to index-window using prefix sums
    // We want the first group whose end is > fromPx => lb(prefix, fromPx+1) - 1
    const startIdx = Math.max(
      0,
      Math.min(middleRowGroups.length - 1, lb(groupPrefix, fromPx + 1) - 1)
    );
    const endIdx = atOrPastBottom
      ? middleRowGroups.length - 1
      : Math.max(
          startIdx,
          Math.min(middleRowGroups.length - 1, lb(groupPrefix, toPx + 1) - 1)
        );

    // spacer sizes before/after the visible slice
    const beforePx = groupPrefix[startIdx];
    const afterPx = atOrPastBottom
      ? 0
      : groupPrefix[middleRowGroups.length] - groupPrefix[endIdx + 1];

    const result = {
      visible: middleRowGroups.slice(startIdx, endIdx + 1),
      start: startIdx,
      end: endIdx,
      before: beforePx,
      after: afterPx,
    };
    return result;
  }, [
    vEnabled,
    middleRowGroups,
    groupPrefix,
    canvasH,
    headerH,
    topPinnedH,
    bottomPinnedH,
    rowH,
    verticalOverscanPx,
    verticalLeadingInsetPx,
    forceAtVerticalEnd,
    scTop,
  ]);

  // ---------- horizontal (columns) ----------
  const virtualCenterCols = useMemo(() => {
    if (!hEnabled) {
      // return everything
      return {
        visible: middleCols,
        start: 0,
        end: middleCols.length - 1,
        before: 0,
        after: 0,
      };
    }

    // available horizontal viewport
    const viewportW = Math.max(0, canvasW - leftPinnedW - rightPinnedW);

    const pad =
      horizontalOverscanPx == null
        ? 2 * 120
        : Math.max(0, horizontalOverscanPx);

    const fromPx = Math.max(0, scLeft - pad);
    const toPx = scLeft + viewportW + pad;

    let startIdx = Math.max(
      0,
      Math.min(middleCols.length - 1, lb(colPrefix, fromPx + 1) - 1)
    );
    let endIdx = Math.max(
      startIdx,
      Math.min(middleCols.length - 1, lb(colPrefix, toPx + 1) - 1)
    );

    if (spanRanges?.length) {
      const baseStart = startIdx;
      const baseEnd = endIdx;
      let nextStart = startIdx;
      let nextEnd = endIdx;

      spanRanges.forEach((range) => {
        if (range.end < baseStart || range.start > baseEnd) return;
        if (range.start < nextStart) nextStart = range.start;
        if (range.end > nextEnd) nextEnd = range.end;
      });

      if (nextStart !== startIdx || nextEnd !== endIdx) {
        startIdx = Math.max(
          0,
          Math.min(middleCols.length - 1, nextStart)
        );
        endIdx = Math.max(startIdx, Math.min(middleCols.length - 1, nextEnd));
      }
    }

    const beforePx = colPrefix[startIdx];
    const afterPx = colPrefix[middleCols.length] - colPrefix[endIdx + 1];

    return {
      visible: middleCols.slice(startIdx, endIdx + 1),
      start: startIdx,
      end: endIdx,
      before: beforePx,
      after: afterPx,
    };
  }, [
    hEnabled,
    middleCols,
    colPrefix,
    canvasW,
    leftPinnedW,
    rightPinnedW,
    scLeft,
    spanRanges,
    horizontalOverscanPx,
  ]);

  return { virtualCenterGroups, virtualCenterCols };
}
