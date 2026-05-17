// import { useMemo, useCallback } from "react";
import { useMemo, useCallback } from "react";
import type { GridColumn } from "../../../types";
import type { GridRowGroup } from "../../sorting";

export function useSpan(
  groups: GridRowGroup[],
  cols: GridColumn[],
  keyToIndex: Map<string, number>
) {
  // Precompute once; used in multiple places
  const colCount = cols.length;

  // Build both: (1) columnsWithAnySpan, (2) spanPrefixMaxEnd
  const { columnsWithAnySpan, spanPrefixMaxEnd } = useMemo(() => {
    // Marks which column indices are covered by any span (including the start cell)
    const coveredIdx = new Uint8Array(colCount); // 0/1 flags

    // For each start index s, track max end index e among spans that begin at s
    const maxEndAtStart = new Int32Array(colCount);
    maxEndAtStart.fill(-1);

    // Single walk over all spans across all groups
    for (const grp of groups) {
      if (grp.spans.size === 0) continue;

      for (const [startKey, bucket] of grp.spans) {
        const s = keyToIndex.get(startKey);
        if (s == null || s < 0 || s >= colCount) continue;

        coveredIdx[s] = 1;

        for (const meta of bucket) {
          const colSpan = (meta.colSpan as number) | 0; // coerce to int
          if (colSpan <= 1) continue;

          const e = Math.min(colCount - 1, s + colSpan - 1);

          for (let i = s; i <= e; i++) coveredIdx[i] = 1;

          if (e > maxEndAtStart[s]) maxEndAtStart[s] = e;
        }
      }
    }

    // Rolling prefix max: at i, how far can any span that starts at/before i reach?
    const reach = new Array<number>(colCount);
    let carry = -1;
    for (let i = 0; i < colCount; i++) {
      const v = maxEndAtStart[i];
      if (v > carry) carry = v;
      reach[i] = carry;
    }

    // Convert covered indices back to a Set of keys
    const coveredKeys = new Set<string>();
    for (let i = 0; i < colCount; i++) {
      if (coveredIdx[i]) coveredKeys.add(cols[i].key);
    }

    return {
      columnsWithAnySpan: coveredKeys,
      spanPrefixMaxEnd: reach,
    };
  }, [groups, cols, keyToIndex, colCount]);

  // Fast lookup: does any group containing this row have spans?
  const rowsWithAnySpan = useMemo(() => {
    const ids = new Set<string | number>();
    for (const grp of groups) {
      if (grp.spans.size === 0) continue;
      for (const r of grp.rows) ids.add(r.id);
    }
    return ids;
  }, [groups]);

  // Boundary check stays O(1)
  const isMergeBoundaryBlocked = useCallback(
    (leftKey: string | null, rightKey: string | null): boolean => {
      if (!leftKey || !rightKey) return false;

      const li = keyToIndex.get(leftKey);
      const ri = keyToIndex.get(rightKey);
      if (li == null || ri == null) return false;

      const a = li < ri ? li : ri;
      const b = li < ri ? ri : li;
      if (a < 0 || b < 0 || a >= colCount || b >= colCount) return false;

      // If any span starting at/before a reaches b, the boundary a|b is blocked.
      return spanPrefixMaxEnd[a] >= b;
    },
    [keyToIndex, colCount, spanPrefixMaxEnd]
  );

  const rowHasSpans = useCallback(
    (rowId: string | number): boolean => rowsWithAnySpan.has(rowId),
    [rowsWithAnySpan]
  );

  return { columnsWithAnySpan, isMergeBoundaryBlocked, rowHasSpans };
}
