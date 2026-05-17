import type {
  GridRow,
  GridColumn,
  GridMergedCell,
  GridRowGroup,
  GridRowGroupSpan,
  GridSortConfig,
} from "../../types";

export class RowGrouping {
  private mergedCells: GridMergedCell[];
  private columns: GridColumn[];
  private rowHeight: number;
  private rowHeightOf?: (rowId: string | number) => number | undefined;

  // 🔧 precomputed lookups / caches
  private colIndexMap: Map<string, number>;
  private collator: Intl.Collator;
  private rowHeightCache: Map<string | number, number>;

  constructor(
    mergedCells: GridMergedCell[],
    columns: GridColumn[],
    rowHeight: number = 32,
    rowHeightOf?: (rowId: string | number) => number | undefined
  ) {
    this.mergedCells = mergedCells;
    this.columns = columns;
    this.rowHeight = rowHeight;
    this.rowHeightOf = rowHeightOf;

    this.colIndexMap = new Map<string, number>();
    for (let i = 0; i < columns.length; i++) {
      this.colIndexMap.set(columns[i].key, i);
    }

    // Intl.Collator is faster & more consistent for strings
    this.collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    this.rowHeightCache = new Map();
  }

  private getRowHeight = (rowId: string | number): number => {
    if (this.rowHeightCache.has(rowId)) return this.rowHeightCache.get(rowId)!;
    const h = this.rowHeightOf?.(rowId);
    const v = h != null ? h : this.rowHeight;
    this.rowHeightCache.set(rowId, v);
    return v;
  };

  private buildMergedCellGrid(): Map<number, Map<number, GridMergedCell>> {
    // rowStart -> (colStart -> cell)
    const grid = new Map<number, Map<number, GridMergedCell>>();
    for (const cell of this.mergedCells) {
      let byCol = grid.get(cell.startRow);
      if (!byCol) {
        byCol = new Map<number, GridMergedCell>();
        grid.set(cell.startRow, byCol);
      }
      byCol.set(cell.startCol, cell);
    }
    return grid;
  }

  /**
   * Create row groups from rows and merged cells
   * Each group represents a logical row that may span multiple physical rows
   */
  createRowGroups(rows: GridRow[]): GridRowGroup[] {
    const groups: GridRowGroup[] = [];
    const mergedGrid = this.buildMergedCellGrid();

    for (let rowIndex = 0; rowIndex < rows.length; ) {
      const groupStart = rowIndex;
      let groupEnd = rowIndex;
      const spans = new Map<string, GridRowGroupSpan[]>();
      const mergesInGroup: GridMergedCell[] = [];
      let hasSpanning = false;

      // March forward while any merge connected to this window extends it.
      for (
        let scanRow = groupStart;
        scanRow <= groupEnd && scanRow < rows.length;
        scanRow++
      ) {
        const rowMap = mergedGrid.get(scanRow);
        if (!rowMap) continue;

        for (const mergedCell of rowMap.values()) {
          mergesInGroup.push(mergedCell);
          if (mergedCell.endRow > groupEnd) {
            groupEnd = mergedCell.endRow;
          }
        }
      }

      if (groupEnd >= rows.length) {
        groupEnd = rows.length - 1;
      }

      // Populate span metadata (allow multiple spans per column).
      for (const mergedCell of mergesInGroup) {
        const colDef = this.columns[mergedCell.startCol];
        if (!colDef) continue;

        const colSpan = mergedCell.endCol - mergedCell.startCol + 1;
        const rowSpan = mergedCell.endRow - mergedCell.startRow + 1;

        const anchorRow = rows[mergedCell.startRow];
        const anchorCell = anchorRow?.data[colDef.key];
        const baseValue =
          mergedCell.value && typeof mergedCell.value === "object"
            ? (mergedCell.value as any)
            : { value: mergedCell.value };
        const resolvedValue = anchorCell
          ? { ...baseValue, ...anchorCell, format: anchorCell.format ?? baseValue.format }
          : baseValue;

        let bucket = spans.get(colDef.key);
        if (!bucket) {
          bucket = [];
          spans.set(colDef.key, bucket);
        }

        const offset = Math.max(0, mergedCell.startRow - groupStart);

        bucket.push({
          colSpan,
          rowSpan,
          value: resolvedValue,
          format: resolvedValue?.format,
          startRow: mergedCell.startRow,
          endRow: mergedCell.endRow,
          startRowOffset: offset,
        });

        if (rowSpan > 1 || colSpan > 1) {
          hasSpanning = true;
        }
      }

      // Keep spans deterministic for downstream consumers.
      spans.forEach((bucket) =>
        bucket.sort((a, b) =>
          a.startRow === b.startRow
            ? a.colSpan - b.colSpan
            : a.startRow - b.startRow
        )
      );

      const groupRows: GridRow[] = [];
      const last = Math.min(rows.length, groupEnd + 1);
      for (let i = groupStart; i < last; i++) {
        groupRows.push(rows[i]);
      }

      let groupHeight = 0;
      for (const r of groupRows) {
        groupHeight += this.getRowHeight(r.id);
      }
      if (groupHeight <= 0) {
        const logicalSpan = Math.max(1, groupEnd - groupStart + 1);
        groupHeight = this.rowHeight * logicalSpan;
      }

      groups.push({
        id: `group-${groupStart}`,
        rows: groupRows,
        startRowIndex: groupStart,
        endRowIndex: groupEnd,
        height: groupHeight,
        spans,
        isParent: hasSpanning,
        children: hasSpanning ? [] : undefined,
      });

      rowIndex = groupEnd + 1;
    }

    return groups;
  }

  /**
   * Sort row groups while maintaining group integrity
   * Groups with spanning cells move as units
   */
  sortRowGroups(
    groups: GridRowGroup[],
    sortModel: GridSortConfig[]
  ): GridRowGroup[] {
    if (!sortModel.length) return groups;

    const indexed = groups.map((group, index) => ({ group, index }));

    const compareValues = (aVal: any, bVal: any) => {
      if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return aVal.getTime() - bVal.getTime();
      }
      return this.collator.compare(String(aVal), String(bVal));
    };

    indexed.sort((a, b) => {
      for (const sort of sortModel) {
        const aVal = a.group.rows[0]?.data[sort.columnKey]?.value ?? "";
        const bVal = b.group.rows[0]?.data[sort.columnKey]?.value ?? "";
        const cmp = compareValues(aVal, bVal);
        if (cmp !== 0) return sort.direction === "asc" ? cmp : -cmp;
      }
      return a.index - b.index;
    });

    return indexed.map((entry) => entry.group);
  }

  /**
   * Filter row groups while maintaining group integrity
   * If any row in a group matches the filter, the entire group is included
   */
  filterRowGroups(
    groups: GridRowGroup[],
    filters: Array<{ columnKey: string; value: any; operator: string }>
  ): GridRowGroup[] {
    if (!filters.length) return groups;

    // pre-normalize to avoid repeated lowercasing and boxing
    const prepared = filters.map((f) => {
      const sval =
        typeof f.value === "string"
          ? f.value.toLowerCase()
          : String(f.value).toLowerCase();
      return { ...f, sval };
    });

    return groups.filter((group) =>
      group.rows.some((row) =>
        prepared.some((f) => {
          const cellValue = row.data[f.columnKey]?.value;
          switch (f.operator) {
            case "equals":
              return cellValue === f.value;
            case "contains": {
              const cv = String(cellValue).toLowerCase();
              return cv.includes(f.sval);
            }
            case "startsWith": {
              const cv = String(cellValue).toLowerCase();
              return cv.startsWith(f.sval);
            }
            case "endsWith": {
              const cv = String(cellValue).toLowerCase();
              return cv.endsWith(f.sval);
            }
            case "greaterThan":
              return Number(cellValue) > Number(f.value);
            case "lessThan":
              return Number(cellValue) < Number(f.value);
            case "greaterThanOrEqual":
              return Number(cellValue) >= Number(f.value);
            case "lessThanOrEqual":
              return Number(cellValue) <= Number(f.value);
            default:
              return true;
          }
        })
      )
    );
  }

  /**
   * Pin row groups while maintaining group integrity
   */
  pinRowGroups(
    groups: GridRowGroup[],
    pinnedTop: (string | number)[],
    pinnedBottom: (string | number)[]
  ): {
    pinnedTopGroups: GridRowGroup[];
    centerGroups: GridRowGroup[];
    pinnedBottomGroups: GridRowGroup[];
  } {
    const topSet = new Set(pinnedTop.map(String));
    const botSet = new Set(pinnedBottom.map(String));

    const topPinned: GridRowGroup[] = [];
    const bottomPinned: GridRowGroup[] = [];
    const center: GridRowGroup[] = [];

    const warnedGroups = new Set<string>();

    for (const g of groups) {
      const groupId = g.rows[0]?.id ?? g.id;
      let topCount = 0;
      let bottomCount = 0;
      g.rows.forEach((r) => {
        const key = String(r.id);
        if (topSet.has(key)) topCount += 1;
        if (botSet.has(key)) bottomCount += 1;
      });

      const touchesTop = topCount > 0;
      const touchesBottom = bottomCount > 0;
      const partialTop = touchesTop && topCount !== g.rows.length;
      const partialBottom = touchesBottom && bottomCount !== g.rows.length;

      if ((partialTop || partialBottom) && !warnedGroups.has(String(groupId))) {
        console.warn(
          "[grid] Row pinning skipped for merged group containing partially pinned rows:",
          groupId
        );
        warnedGroups.add(String(groupId));
      }

      if (partialTop || partialBottom) {
        center.push(g);
      } else if (touchesTop) {
        topPinned.push(g);
      } else if (touchesBottom && !touchesTop) {
        bottomPinned.push(g);
      } else {
        center.push(g);
      }
    }

    const sortedTopPinned = this.sortGroupsByPinnedOrder(topPinned, pinnedTop);
    const sortedBottomPinned = this.sortGroupsByPinnedOrder(
      bottomPinned,
      pinnedBottom
    );

    return {
      pinnedTopGroups: sortedTopPinned,
      centerGroups: center,
      pinnedBottomGroups: sortedBottomPinned,
    };
  }

  /**
   * Sort groups according to the order specified in the pinned array
   * This preserves manual positioning set by drag and drop operations
   */
  private sortGroupsByPinnedOrder(
    groups: GridRowGroup[],
    pinnedOrder: (string | number)[]
  ): GridRowGroup[] {
    if (!pinnedOrder.length || groups.length <= 1) return groups;

    const orderMap = new Map<string, number>();
    for (let i = 0; i < pinnedOrder.length; i++) {
      orderMap.set(String(pinnedOrder[i]), i);
    }

    return groups.slice().sort((a, b) => {
      const aId = String(a.rows[0].id);
      const bId = String(b.rows[0].id);
      const ai = orderMap.get(aId) ?? Number.MAX_SAFE_INTEGER;
      const bi = orderMap.get(bId) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  }

  /**
   * Calculate effective column count considering spans
   * This helps with layout calculations
   */
  calculateEffectiveColumnCount(groups: GridRowGroup[]): number {
    let maxEffective = this.columns.length;

    // boolean array faster than Set for dense column keys
    const totalCols = this.columns.length;

    for (const group of groups) {
      const processed = new Array<boolean>(totalCols).fill(false);
      let count = 0;

      for (const col of this.columns) {
        const startIdx = this.colIndexMap.get(col.key)!;
        if (processed[startIdx]) continue;

        const spanBucket = group.spans.get(col.key);
        const multiCol =
          spanBucket != null && spanBucket.some((item) => item.colSpan > 1);
        if (multiCol) {
          count += 1;
          // mark contiguous spanned columns
          const maxColSpan = spanBucket!.reduce(
            (acc, item) => Math.max(acc, item.colSpan),
            1
          );
          const endIdx = Math.min(totalCols, startIdx + maxColSpan);
          for (let i = startIdx; i < endIdx; i++) processed[i] = true;
        } else {
          count += 1;
          processed[startIdx] = true;
        }
      }

      if (count > maxEffective) maxEffective = count;
    }

    return maxEffective;
  }

  /**
   * Get all rows from groups in order
   */
  flattenGroups(groups: GridRowGroup[]): GridRow[] {
    // groups are typically large; manual push loop is a tad faster than flatMap in tight loops
    const out: GridRow[] = [];
    for (const g of groups) {
      for (let i = 0; i < g.rows.length; i++) out.push(g.rows[i]);
    }
    return out;
  }

  /**
   * Update merged cells when groups are reordered
   */
  updateMergedCellsForGroups(groups: GridRowGroup[]): GridMergedCell[] {
    const result: GridMergedCell[] = [];
    let curRow = 0;

    for (const group of groups) {
      group.spans.forEach((bucket, columnKey) => {
        const startCol = this.colIndexMap.get(columnKey);
        if (startCol == null) return;

        bucket.forEach((span) => {
          const localStart = curRow + Math.max(0, span.startRowOffset);
          result.push({
            id: `updated-${localStart}-${startCol}`,
            startRow: localStart,
            endRow: localStart + Math.max(1, span.rowSpan) - 1,
            startCol,
            endCol: Math.min(
              this.columns.length - 1,
              startCol + Math.max(1, span.colSpan) - 1
            ),
            value: span.value,
          });
        });
      });

      curRow += group.rows.length;
    }

    return result;
  }
}
