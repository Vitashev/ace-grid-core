import { useMemo } from "react";
import type { GridColumn } from "../../../types";
import type { GridRowGroup } from "../../sorting";

export function useStickyOffsets(
  pinnedLeftColumns: GridColumn[],
  pinnedRightColumns: GridColumn[],
  pinnedTopGroups: GridRowGroup[],
  pinnedBottomGroups: GridRowGroup[],
  colWidthOf: (k: string, fallback?: number) => number
) {
  // Cache widths once per unique key across both pinned sides
  const widthCache = useMemo(() => {
    const cache = new Map<string, number>();
    // pre-size set to avoid duplicates and keep stable iteration
    for (let i = 0; i < pinnedLeftColumns.length; i++) {
      const key = pinnedLeftColumns[i].key;
      if (!cache.has(key)) cache.set(key, colWidthOf(key));
    }
    for (let i = 0; i < pinnedRightColumns.length; i++) {
      const key = pinnedRightColumns[i].key;
      if (!cache.has(key)) cache.set(key, colWidthOf(key));
    }
    return cache;
  }, [pinnedLeftColumns, pinnedRightColumns, colWidthOf]);

  const cumulativeWidths = useMemo(() => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    // Left offsets (prefix sums)
    let acc = 0;
    for (let i = 0; i < pinnedLeftColumns.length; i++) {
      const key = pinnedLeftColumns[i].key;
      left[key] = acc;
      acc += widthCache.get(key)!; // cached
    }

    // Right offsets (suffix sums)
    acc = 0;
    for (let i = pinnedRightColumns.length - 1; i >= 0; i--) {
      const key = pinnedRightColumns[i].key;
      right[key] = acc;
      acc += widthCache.get(key)!; // cached
    }

    return { left, right };
  }, [pinnedLeftColumns, pinnedRightColumns, widthCache]);

  const cumulativeHeights = useMemo(() => {
    const top: Record<string, number> = {};
    const bottom: Record<string, number> = {};

    // Top offsets (prefix sums)
    let acc = 0;
    for (let i = 0; i < pinnedTopGroups.length; i++) {
      const g = pinnedTopGroups[i];
      const groupKey = String(g.id);
      top[groupKey] = acc;
      acc += g.height;
    }

    // Bottom offsets (suffix sums)
    acc = 0;
    for (let i = pinnedBottomGroups.length - 1; i >= 0; i--) {
      const g = pinnedBottomGroups[i];
      const groupKey = String(g.id);
      bottom[groupKey] = acc;
      acc += g.height;
    }

    return { top, bottom };
  }, [pinnedTopGroups, pinnedBottomGroups]);

  return { cumulativeWidths, cumulativeHeights };
}
