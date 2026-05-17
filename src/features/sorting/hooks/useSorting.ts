import { useMemo } from "react";
import type {
  GridMergedCell,
  GridColumn,
  GridRow,
  GridFilterConfig,
  GridRowGroup,
  GridSpanRowIdMergeMode,
  GridSortConfig,
} from "../../../types";
import { RowGrouping } from "../utils";
import { RowFilter } from "../../filtering/utils/RowFilter";

const EMPTY_ROW_GROUPS: GridRowGroup[] = [];

const mapMergedCellsToRows = (
  mergedCells: GridMergedCell[],
  rows: GridRow[],
  viewRows: GridRow[],
  rowIdMergeMode: GridSpanRowIdMergeMode
) => {
  if (!mergedCells.length) return mergedCells;
  const hasRowIds = mergedCells.some((cell) => cell.rowIds?.length);
  if (viewRows === rows && !hasRowIds) return mergedCells;
  const rowIdToIndex = new Map<string, number>();
  viewRows.forEach((row, idx) => rowIdToIndex.set(String(row.id), idx));

  return mergedCells.flatMap((cell) => {
    const baseRowIds = cell.rowIds?.length
      ? cell.rowIds
      : rows
          .slice(cell.startRow, cell.endRow + 1)
          .map((row) => row.id);
    if (!baseRowIds.length) return [];

    const mappedEntries = baseRowIds
      .map((id) => ({ id, idx: rowIdToIndex.get(String(id)) }))
      .filter(
        (entry): entry is { id: string | number; idx: number } =>
          entry.idx != null
      )
      .sort((a, b) => a.idx - b.idx);

    if (!mappedEntries.length) return [];

    if (!cell.rowIds?.length) {
      if (mappedEntries.length !== baseRowIds.length) return [];
      const first = mappedEntries[0].idx;
      const last = mappedEntries[mappedEntries.length - 1].idx;
      if (last - first + 1 !== mappedEntries.length) return [];
      return [
        {
          ...cell,
          startRow: first,
          endRow: last,
        },
      ];
    }

    if (rowIdMergeMode !== "split") {
      const first = mappedEntries[0].idx;
      const last = mappedEntries[mappedEntries.length - 1].idx;
      return [
        {
          ...cell,
          startRow: first,
          endRow: last,
        },
      ];
    }

    const segments: Array<{
      start: number;
      end: number;
      rowIds: (string | number)[];
    }> = [];
    let current = {
      start: mappedEntries[0].idx,
      end: mappedEntries[0].idx,
      rowIds: [mappedEntries[0].id],
    };

    for (let i = 1; i < mappedEntries.length; i += 1) {
      const entry = mappedEntries[i];
      if (entry.idx === current.end + 1) {
        current.end = entry.idx;
        current.rowIds.push(entry.id);
      } else {
        segments.push(current);
        current = {
          start: entry.idx,
          end: entry.idx,
          rowIds: [entry.id],
        };
      }
    }
    segments.push(current);

    return segments.map((segment) => ({
      ...cell,
      startRow: segment.start,
      endRow: segment.end,
      rowIds: segment.rowIds,
    }));
  });
};

export function useSorting(
  initialMergedCells: GridMergedCell[],
  columns: GridColumn[],
  rowHeight: number,
  rows: GridRow[],
  activeFilters: GridFilterConfig[],
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] },
  sortModel: GridSortConfig[],
  rowHeightOf?: (rowId: string | number) => number | undefined,
  rowIdMergeMode: GridSpanRowIdMergeMode = "compact"
) {
  const activeSortModel = useMemo(() => {
    if (!Array.isArray(sortModel) || !sortModel.length) return [];
    const normalized: GridSortConfig[] = [];
    const seen = new Set<string>();
    for (const entry of sortModel) {
      if (!entry?.columnKey || !entry?.direction) continue;
      if (entry.direction !== "asc" && entry.direction !== "desc") continue;
      if (seen.has(entry.columnKey)) continue;
      seen.add(entry.columnKey);
      normalized.push({ columnKey: entry.columnKey, direction: entry.direction });
    }
    return normalized;
  }, [sortModel]);
  const rowIdFilter = useMemo(
    () =>
      activeFilters.find(
        (filter) =>
          filter.columnKey === "__rowId" && Array.isArray(filter.value)
      ),
    [activeFilters]
  );
  const rowIdSet = useMemo(() => {
    if (!rowIdFilter || !Array.isArray(rowIdFilter.value)) return null;
    return new Set(rowIdFilter.value.map((value) => String(value)));
  }, [rowIdFilter]);
  const rowIdFilteredRows = useMemo(() => {
    if (!rowIdSet) return rows;
    return rows.filter((row) => rowIdSet.has(String(row.id)));
  }, [rows, rowIdSet]);
  const dataFilters = useMemo(
    () => activeFilters.filter((filter) => filter.columnKey !== "__rowId"),
    [activeFilters]
  );
  const mergedCellsForFiltering = useMemo(
    () =>
      mapMergedCellsToRows(
        initialMergedCells,
        rows,
        rowIdFilteredRows,
        rowIdMergeMode
      ),
    [initialMergedCells, rows, rowIdFilteredRows, rowIdMergeMode]
  );
  const groupingForFiltering = useMemo(
    () =>
      new RowGrouping(
        mergedCellsForFiltering,
        columns,
        rowHeight,
        rowHeightOf
      ),
    [mergedCellsForFiltering, columns, rowHeight, rowHeightOf]
  );
  const groupsForFiltering = useMemo(
    () => groupingForFiltering.createRowGroups(rowIdFilteredRows),
    [groupingForFiltering, rowIdFilteredRows]
  );
  const dataFilterMatchIds = useMemo(() => {
    if (!dataFilters.length) return null;
    const matched = RowFilter.run(rowIdFilteredRows, dataFilters, columns);
    if (!matched.length) return new Set<string>();
    return new Set(matched.map((row) => String(row.id)));
  }, [rowIdFilteredRows, dataFilters, columns]);
  const baseGroups: GridRowGroup[] = useMemo(() => {
    if (!dataFilters.length) return groupsForFiltering;
    if (!dataFilterMatchIds || dataFilterMatchIds.size === 0) {
      return EMPTY_ROW_GROUPS;
    }
    return groupsForFiltering.filter((group) =>
      group.rows.some((row) => dataFilterMatchIds.has(String(row.id)))
    );
  }, [
    dataFilters.length,
    dataFilterMatchIds,
    groupsForFiltering,
  ]);
  const grouping = groupingForFiltering;

  const separated = useMemo(() => {
    const out = grouping.pinRowGroups(
      baseGroups,
      pinnedRows.top,
      pinnedRows.bottom
    );
    if (activeSortModel.length) {
      out.centerGroups = grouping.sortRowGroups(out.centerGroups, activeSortModel);
    }
    return out;
  }, [grouping, baseGroups, pinnedRows, activeSortModel]);

  const pinnedTopGroups = separated.pinnedTopGroups;
  const centerGroups = separated.centerGroups;
  const pinnedBottomGroups = separated.pinnedBottomGroups;

  const rowGroups = useMemo(
    () => [...pinnedTopGroups, ...centerGroups, ...pinnedBottomGroups],
    [pinnedTopGroups, centerGroups, pinnedBottomGroups]
  );

  const groupByRowId = useMemo(() => {
    const m = new Map<string | number, GridRowGroup>();
    for (const g of rowGroups) for (const r of g.rows) m.set(r.id, g);
    return m;
  }, [rowGroups]);

  return {
    grouping,
    baseGroups,
    pinnedTopGroups,
    centerGroups,
    pinnedBottomGroups,
    rowGroups,
    groupByRowId,
  };
}
