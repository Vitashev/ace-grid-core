import { useEffect, useRef, useState } from "react";

import type { GridColumn, GridRowGroup, GridRowGroupSpan } from "../../../types";

export interface SpanCoverage {
  spanStartLookup: Map<string, GridRowGroupSpan>;
  coveredCells: Set<string>;
}

export const spanCellKey = (row: number, col: number) => `${row}:${col}`;

export const buildSpanCoverage = (
  spans: Map<string, GridRowGroupSpan[]>,
  visualColumns: GridColumn[],
  visualColumnIndex: Map<string, number>,
  rowCount: number
): SpanCoverage => {
  const spanStartLookup = new Map<string, GridRowGroupSpan>();
  const coveredCells = new Set<string>();

  if (!spans?.size || !visualColumns.length || rowCount <= 0) {
    return { spanStartLookup, coveredCells };
  }

  spans.forEach((bucket, columnKey) => {
    if (!bucket?.length) return;

    const baseColIdx =
      visualColumnIndex.get(columnKey) ??
      visualColumns.findIndex((col) => col.key === columnKey);
    if (baseColIdx == null || baseColIdx < 0) return;

    bucket.forEach((span) => {
      if (!span) return;
      const startOffset = Math.max(0, span.startRowOffset);
      const rowSpan = Math.max(1, span.rowSpan ?? 1);
      const colSpan = Math.max(1, span.colSpan ?? 1);

      spanStartLookup.set(spanCellKey(startOffset, baseColIdx), span);

      for (let r = 0; r < rowSpan; r += 1) {
        const rowOffset = startOffset + r;
        if (rowOffset >= rowCount) break;

        for (let cOffset = 0; cOffset < colSpan; cOffset += 1) {
          const colIndex = baseColIdx + cOffset;
          if (colIndex >= visualColumns.length) break;
          coveredCells.add(spanCellKey(rowOffset, colIndex));
        }
      }
    });
  });

  return { spanStartLookup, coveredCells };
};

type IdleCleanup = () => void;

const scheduleIdleTask = (task: () => void): IdleCleanup | undefined => {
  if (typeof window === "undefined") {
    task();
    return undefined;
  }

  const win = window as any;
  if (typeof win.requestIdleCallback === "function") {
    const handle = win.requestIdleCallback(task);
    return () => {
      if (typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(handle);
      }
    };
  }

  const timeout = window.setTimeout(task, 0);
  return () => window.clearTimeout(timeout);
};

const spanCoverageEquals = (
  a: SpanCoverage | undefined,
  b: SpanCoverage | undefined
) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.coveredCells.size !== b.coveredCells.size) return false;
  for (const cell of a.coveredCells) {
    if (!b.coveredCells.has(cell)) return false;
  }
  if (a.spanStartLookup.size !== b.spanStartLookup.size) return false;
  for (const [key, span] of a.spanStartLookup) {
    const other = b.spanStartLookup.get(key);
    if (!other) return false;
    if (
      other.startRow !== span.startRow ||
      other.endRow !== span.endRow ||
      other.rowSpan !== span.rowSpan ||
      other.colSpan !== span.colSpan ||
      other.startRowOffset !== span.startRowOffset
    ) {
      return false;
    }
  }
  return true;
};

const coverageMapsEqual = (
  prev: Map<string, SpanCoverage>,
  next: Map<string, SpanCoverage>
) => {
  if (prev === next) return true;
  if (prev.size !== next.size) return false;
  for (const [key, value] of next.entries()) {
    if (!spanCoverageEquals(value, prev.get(key))) return false;
  }
  return true;
};

export const useSpanCoverageMap = (
  groups: GridRowGroup[],
  visualColumns: GridColumn[],
  visualColumnIndex: Map<string, number>
): Map<string, SpanCoverage> => {
  const [coverageMap, setCoverageMap] = useState<Map<string, SpanCoverage>>(
    () => new Map()
  );
  const latestInputsRef = useRef<{
    groupCount: number;
    groupSignature: string;
    columnKeys: string[];
    columnIndexSignature: string;
  }>({
    groupCount: 0,
    groupSignature: "",
    columnKeys: [],
    columnIndexSignature: "",
  });

  useEffect(() => {
    const columnKeys = visualColumns.map((col) => col.key);
    const columnIndexSignature = columnKeys
      .map((key) => `${key}:${visualColumnIndex.get(key) ?? -1}`)
      .join("|");
    const groupSignature = groups
      .map((group) => {
        const spansSig: string[] = [];
        group.spans.forEach((bucket, columnKey) => {
          const detail = bucket
            .map(
              (span) =>
                `${span.startRow}:${span.endRow}:${span.startRowOffset}:${span.rowSpan ?? 0}:${
                  span.colSpan ?? 0
                }`
            )
            .join(",");
          spansSig.push(`${columnKey}|${detail}`);
        });
        spansSig.sort();
        return `${group.id}|${group.rows.length}|${spansSig.join("!")}`;
      })
      .join("||");

    const prev = latestInputsRef.current;
    const sameInputs =
      prev.groupCount === groups.length &&
      prev.groupSignature === groupSignature &&
      prev.columnIndexSignature === columnIndexSignature &&
      prev.columnKeys.length === columnKeys.length &&
      prev.columnKeys.every((key, idx) => key === columnKeys[idx]);

    if (sameInputs) {
      return;
    }

    if (!groups?.length) {
      latestInputsRef.current = {
        groupCount: groups.length,
        groupSignature,
        columnKeys,
        columnIndexSignature,
      };
      setCoverageMap((prevMap) => (prevMap.size ? new Map() : prevMap));
      return;
    }

    let cancelled = false;
    const compute = () => {
      if (cancelled) return;
      const map = new Map<string, SpanCoverage>();
      groups.forEach((group) => {
        const key =
          group.rows.length > 0 ? String(group.rows[0].id) : group.id;
        map.set(
          key,
          buildSpanCoverage(
            group.spans,
            visualColumns,
            visualColumnIndex,
            group.rows.length
          )
        );
      });
      if (!cancelled) {
        latestInputsRef.current = {
          groupCount: groups.length,
          groupSignature,
          columnKeys,
          columnIndexSignature,
        };
        setCoverageMap((prevMap) =>
          coverageMapsEqual(prevMap, map) ? prevMap : map
        );
      }
    };

    const cleanup = scheduleIdleTask(compute);
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [groups, visualColumns, visualColumnIndex]);

  return coverageMap;
};
