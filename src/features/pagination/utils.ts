import type { GridRowGroup } from "../../types";

export type PaginatedRowGroups = {
  groups: GridRowGroup[];
  totalRowCount: number;
  pageRowCount: number;
  startRowIndex: number | null;
  endRowIndex: number | null;
};

export const paginateRowGroups = (
  groups: GridRowGroup[],
  pageIndex: number,
  pageSize: number
): PaginatedRowGroups => {
  const totalRowCount = groups.reduce((sum, group) => sum + group.rows.length, 0);
  if (totalRowCount <= 0) {
    return {
      groups: [],
      totalRowCount: 0,
      pageRowCount: 0,
      startRowIndex: null,
      endRowIndex: null,
    };
  }

  const safeSize = Math.max(1, Math.trunc(pageSize) || 1);
  const safeIndex = Math.max(0, Math.trunc(pageIndex) || 0);
  const maxStart = Math.max(0, totalRowCount - 1);
  const startIndex = Math.min(safeIndex * safeSize, maxStart);
  const endIndex = startIndex + safeSize - 1;

  let cursor = 0;
  let startRowIndex: number | null = null;
  let endRowIndex: number | null = null;
  let pageRowCount = 0;
  const pageGroups: GridRowGroup[] = [];

  for (const group of groups) {
    const groupStart = cursor;
    const groupEnd = cursor + group.rows.length - 1;
    cursor = groupEnd + 1;

    if (groupEnd < startIndex) continue;

    if (startRowIndex == null) startRowIndex = groupStart;
    pageGroups.push(group);
    pageRowCount += group.rows.length;
    endRowIndex = groupEnd;

    if (groupEnd >= endIndex) break;
  }

  if (startRowIndex == null) {
    return {
      groups: [],
      totalRowCount,
      pageRowCount: 0,
      startRowIndex: null,
      endRowIndex: null,
    };
  }

  return {
    groups: pageGroups,
    totalRowCount,
    pageRowCount,
    startRowIndex,
    endRowIndex,
  };
};
