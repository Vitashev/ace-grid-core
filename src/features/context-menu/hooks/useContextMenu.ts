import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { isSystemCol } from "../../cell-selection";
import type {
  GridColumn,
  GridRow,
  GridSelection,
  GridMergedCell,
} from "../../../types";
import {
  BUILT_IN_CONTEXT_MENU_ACTIONS,
  type GridContextMenuActionContext,
  type GridContextMenuActionHandler,
  type GridContextMenuBuiltInAction,
  type GridContextMenuConfig,
  type GridContextMenuContext,
  type GridContextMenuItemDefinition,
  type GridContextMenuResolvedActionItem,
  type GridContextMenuResolvedItem,
  type GridContextMenuResolvedLeafItem,
  type GridContextMenuPredicate,
} from "../types";

export interface ContextMenuState {
  anchorX: number;
  anchorY: number;
  targetRowIndex: number;
  targetVisualRow: number;
  targetColIndex: number;
  targetVisualCol: number;
  rowId: string | number | null;
  columnKey: string | null;
}

export interface OpenContextMenuArgs {
  rowIndex: number;
  visualColumnIndex: number;
  columnKey: string | null;
  event: ReactMouseEvent;
}

interface UseContextMenuParams {
  config?: GridContextMenuConfig;
  selection: GridSelection | null;
  selectionResolver?: () => GridSelection | null;
  rows: GridRow[];
  columns: GridColumn[];
  mergedCells: GridMergedCell[];
  onMergedCellsChange: (next: GridMergedCell[]) => void;
  rowIndexToVisual: Map<number, number>;
  visualRowOrder: number[];
  visualColumns: GridColumn[];
  colIndex: Map<string, number>;
  colByKey: Map<string, GridColumn>;
  pinnedRowSet: Set<string>;
  pinnedColumnSet: Set<string>;
  onSelectionRangeChange?: (selection: GridSelection) => void;
  isDraggingSelection: boolean;
  fillDragActive: boolean;
  extraItems?:
    | GridContextMenuItemDefinition[]
    | ((ctx: GridContextMenuContext) => GridContextMenuItemDefinition[]);
  extraItemsPlacement?: "start" | "end";
}

interface UseContextMenuResult {
  contextMenuEnabled: boolean;
  contextMenuState: ContextMenuState | null;
  contextMenuContext: GridContextMenuContext | null;
  contextMenuItems: GridContextMenuResolvedItem[];
  openContextMenu: (args: OpenContextMenuArgs) => void;
  closeContextMenu: () => void;
  handleMenuItemSelect: (ctx: GridContextMenuActionContext) => void;
}

const DEFAULT_CONTEXT_MENU_ITEMS: GridContextMenuItemDefinition[] = [
  "mergeCells",
  "unmergeCells",
  { type: "divider", id: "grid-context-menu-divider-merge" },
  "addRowsAbove",
  "addRowsBelow",
  { type: "divider", id: "grid-context-menu-divider-rows-cols" },
  "addColumnsLeft",
  "addColumnsRight",
];

const cellKey = (row: number, col: number) => `${row}:${col}`;

type MergeRange = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

const normalizeResolvedItems = <T extends GridContextMenuResolvedItem>(
  items: T[]
) => {
  const next: T[] = [];
  let previousWasDivider = true;

  for (const item of items) {
    if (item.type === "divider") {
      if (previousWasDivider) continue;
      next.push(item);
      previousWasDivider = true;
      continue;
    }

    next.push(item);
    previousWasDivider = false;
  }

  while (next.length > 0 && next[next.length - 1]?.type === "divider") {
    next.pop();
  }

  return next;
};

const rowIdsForCell = (cell: GridMergedCell, rows: GridRow[]) => {
  if (cell.rowIds?.length) return cell.rowIds;
  if (!rows.length) return [];
  const startRow = Math.min(cell.startRow, cell.endRow);
  const endRow = Math.max(cell.startRow, cell.endRow);
  const clampedStart = Math.max(0, startRow);
  const clampedEnd = Math.min(rows.length - 1, endRow);
  if (clampedStart > clampedEnd) return [];
  const ids: Array<string | number> = [];
  for (let i = clampedStart; i <= clampedEnd; i += 1) {
    const row = rows[i];
    if (row) ids.push(row.id);
  }
  return ids;
};

const evaluateMergeOverlap = (
  range: MergeRange,
  cells: GridMergedCell[],
  rows: GridRow[],
  selectedRowIds?: (string | number)[],
  selectedColumnIndices?: number[]
): {
  overlappingIds: string[];
  fullyContainedIds: string[];
  hasPartialOverlap: boolean;
} => {
  const overlappingIds: string[] = [];
  const fullyContainedIds: string[] = [];
  let hasPartialOverlap = false;
  const rowIdSet =
    selectedRowIds && selectedRowIds.length
      ? new Set(selectedRowIds.map((id) => String(id)))
      : null;
  const colIndexSet =
    selectedColumnIndices && selectedColumnIndices.length
      ? new Set(selectedColumnIndices)
      : null;

  for (const cell of cells) {
    if (!cell) continue;

    const startCol = Math.min(cell.startCol, cell.endCol);
    const endCol = Math.max(cell.startCol, cell.endCol);
    const cellRowIds = rowIdSet ? rowIdsForCell(cell, rows) : null;

    const rowsOverlap = rowIdSet
      ? cellRowIds != null &&
        cellRowIds.some((id) => rowIdSet.has(String(id)))
      : cell.startRow <= range.endRow && cell.endRow >= range.startRow;
    const colsOverlap = colIndexSet
      ? (() => {
          for (let c = startCol; c <= endCol; c += 1) {
            if (colIndexSet.has(c)) return true;
          }
          return false;
        })()
      : startCol <= range.endCol && endCol >= range.startCol;
    if (!rowsOverlap || !colsOverlap) continue;

    overlappingIds.push(cell.id);

    const rowsContained = rowIdSet
      ? cellRowIds != null &&
        cellRowIds.length > 0 &&
        cellRowIds.every((id) => rowIdSet.has(String(id)))
      : cell.startRow >= range.startRow && cell.endRow <= range.endRow;
    const colsContained = colIndexSet
      ? (() => {
          for (let c = startCol; c <= endCol; c += 1) {
            if (!colIndexSet.has(c)) return false;
          }
          return true;
        })()
      : startCol >= range.startCol && endCol <= range.endCol;
    const fullyContained = rowsContained && colsContained;

    if (fullyContained) {
      fullyContainedIds.push(cell.id);
    } else {
      hasPartialOverlap = true;
    }
  }

  return { overlappingIds, fullyContainedIds, hasPartialOverlap };
};

const resolveBounds = (
  values: number[],
  fallback: number
): { min: number; max: number } => {
  if (!values.length) {
    return { min: fallback, max: fallback };
  }

  let min = values[0]!;
  let max = values[0]!;
  for (let idx = 1; idx < values.length; idx += 1) {
    const value = values[idx]!;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return { min, max };
};

export const useContextMenu = ({
  config,
  selection,
  selectionResolver,
  rows,
  columns,
  mergedCells,
  onMergedCellsChange,
  rowIndexToVisual,
  visualRowOrder,
  visualColumns,
  colIndex,
  colByKey,
  pinnedRowSet,
  pinnedColumnSet,
  onSelectionRangeChange,
  isDraggingSelection,
  fillDragActive,
  extraItems,
  extraItemsPlacement = "start",
}: UseContextMenuParams): UseContextMenuResult => {
  const contextMenuEnabled = config?.enabled !== false;
  const handlerBag = config?.handlers;
  const mergeCellsHandler = handlerBag?.mergeCells;
  const unmergeCellsHandler = handlerBag?.unmergeCells;
  const insertRowsHandler = handlerBag?.insertRows;
  const insertColumnsHandler = handlerBag?.insertColumns;

  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  useEffect(() => {
    if (!contextMenuEnabled && contextMenuState) {
      setContextMenuState(null);
    }
  }, [contextMenuEnabled, contextMenuState]);

  const absoluteRowToVisual = useMemo(() => {
    const map = new Map<number, number>();
    visualRowOrder.forEach((absRow, denseIdx) => {
      if (!map.has(absRow)) {
        map.set(absRow, denseIdx);
      }
    });
    return map;
  }, [visualRowOrder]);

  const visualColumnIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    visualColumns.forEach((column, idx) => {
      map.set(column.key, idx);
    });
    return map;
  }, [visualColumns]);

  const rowIdToIndex = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, idx) => map.set(String(row.id), idx));
    return map;
  }, [rows]);

  const mergedCellIndex = useMemo(() => {
    const map = new Map<string, GridMergedCell>();
    mergedCells.forEach((cell) => {
      const startCol = Math.min(cell.startCol, cell.endCol);
      const endCol = Math.max(cell.startCol, cell.endCol);
      const rowIndices = cell.rowIds?.length
        ? cell.rowIds
            .map((id) => rowIdToIndex.get(String(id)))
            .filter((idx): idx is number => idx != null)
        : null;
      const startRow = Math.min(cell.startRow, cell.endRow);
      const endRow = Math.max(cell.startRow, cell.endRow);

      if (rowIndices && rowIndices.length) {
        rowIndices.forEach((r) => {
          for (let c = startCol; c <= endCol; c += 1) {
            map.set(cellKey(r, c), cell);
          }
        });
        return;
      }

      for (let r = startRow; r <= endRow; r += 1) {
        for (let c = startCol; c <= endCol; c += 1) {
          map.set(cellKey(r, c), cell);
        }
      }
    });
    return map;
  }, [mergedCells, rowIdToIndex]);

  const closeContextMenu = useCallback(() => {
    setContextMenuState((prev) => (prev ? null : prev));
  }, []);

  const openContextMenu = useCallback(
    ({
      rowIndex,
      visualColumnIndex,
      columnKey,
      event,
    }: OpenContextMenuArgs) => {
      if (!contextMenuEnabled) return;
      event.preventDefault();
      event.stopPropagation();

      let visualRow = rowIndexToVisual.get(rowIndex);
      if (visualRow == null) {
        const fallbackIndex = absoluteRowToVisual.get(rowIndex);
        visualRow = fallbackIndex != null ? fallbackIndex : rowIndex;
      }

      if (visualRow < 0 || visualColumnIndex < 0) return;

      const column = visualColumns[visualColumnIndex];
      const resolvedColumnKey = column?.key ?? columnKey;
      const absoluteColIndex = resolvedColumnKey
        ? colIndex.get(resolvedColumnKey) ?? visualColumnIndex
        : visualColumnIndex;

      const row = rows[rowIndex];
      const rowId = row?.id ?? null;
      const currentSelection = selectionResolver?.() ?? selection ?? null;

      const selectionCoversCell =
        currentSelection &&
        visualRow >= currentSelection.startRow &&
        visualRow <= currentSelection.endRow &&
        visualColumnIndex >= currentSelection.startCol &&
        visualColumnIndex <= currentSelection.endCol;

      if (!selectionCoversCell) {
        const mergedCell = mergedCellIndex.get(
          cellKey(rowIndex, absoluteColIndex)
        );

        if (mergedCell) {
          const startVisualRow =
            rowIndexToVisual.get(mergedCell.startRow) ??
            absoluteRowToVisual.get(mergedCell.startRow) ??
            mergedCell.startRow;

          const endVisualRow =
            rowIndexToVisual.get(mergedCell.endRow) ??
            absoluteRowToVisual.get(mergedCell.endRow) ??
            mergedCell.endRow;

          const startColumnKey = columns[mergedCell.startCol]?.key ?? null;
          const endColumnKey = columns[mergedCell.endCol]?.key ?? null;

          const startVisualColLookup =
            startColumnKey != null
              ? visualColumnIndexMap.get(startColumnKey)
              : undefined;
          const endVisualColLookup =
            endColumnKey != null
              ? visualColumnIndexMap.get(endColumnKey)
              : undefined;

          const startVisualCol =
            startVisualColLookup != null
              ? startVisualColLookup
              : mergedCell.startCol;

          const endVisualCol =
            endVisualColLookup != null
              ? endVisualColLookup
              : mergedCell.endCol;

          onSelectionRangeChange?.({
            startRow: startVisualRow >= 0 ? startVisualRow : visualRow,
            endRow: endVisualRow >= 0 ? endVisualRow : visualRow,
            startCol:
              startVisualCol >= 0 ? startVisualCol : visualColumnIndex,
            endCol: endVisualCol >= 0 ? endVisualCol : visualColumnIndex,
          });
        } else {
          onSelectionRangeChange?.({
            startRow: visualRow,
            endRow: visualRow,
            startCol: visualColumnIndex,
            endCol: visualColumnIndex,
          });
        }
      }

      setContextMenuState({
        anchorX: event.clientX,
        anchorY: event.clientY,
        targetRowIndex: rowIndex,
        targetVisualRow: visualRow,
        targetColIndex: absoluteColIndex,
        targetVisualCol: visualColumnIndex,
        rowId,
        columnKey: resolvedColumnKey ?? null,
      });
    },
    [
      contextMenuEnabled,
      rowIndexToVisual,
      absoluteRowToVisual,
      selection,
      selectionResolver,
      mergedCellIndex,
      columns,
      visualColumns,
      visualColumnIndexMap,
      colIndex,
      rows,
      onSelectionRangeChange,
    ]
  );

  const promptForCount = useCallback((message: string, fallback: number) => {
    if (typeof window === "undefined") return fallback;
    const input = window.prompt(message, String(Math.max(1, fallback)));
    if (input == null) return 0;
    const parsed = Number(input);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.floor(parsed);
  }, []);

  const selectionForMenu = useMemo(() => {
    const resolvedSelection = selectionResolver?.() ?? selection ?? null;
    if (!contextMenuState) return resolvedSelection;
    const base = resolvedSelection;
    const targetRow = contextMenuState.targetVisualRow;
    const targetCol = contextMenuState.targetVisualCol;
    if (!base) {
      return {
        startRow: targetRow,
        endRow: targetRow,
        startCol: targetCol,
        endCol: targetCol,
      };
    }
    const coversTarget =
      targetRow >= base.startRow &&
      targetRow <= base.endRow &&
      targetCol >= base.startCol &&
      targetCol <= base.endCol;
    if (coversTarget) return base;
    return {
      startRow: targetRow,
      endRow: targetRow,
      startCol: targetCol,
      endCol: targetCol,
    };
  }, [contextMenuState, selection, selectionResolver]);

  const contextMenuContext = useMemo<GridContextMenuContext | null>(() => {
    if (!contextMenuEnabled || !contextMenuState) return null;

    const effectiveSelection = selectionForMenu;

    const rowIndices: number[] = [];
    const rowIds: (string | number)[] = [];
    const columnKeys: string[] = [];
    const columnIndices: number[] = [];

    if (effectiveSelection) {
      for (
        let denseRow = effectiveSelection.startRow;
        denseRow <= effectiveSelection.endRow;
        denseRow += 1
      ) {
        const absRow = visualRowOrder[denseRow] ?? denseRow;
        rowIndices.push(absRow);
        const row = rows[absRow];
        if (row) rowIds.push(row.id);
      }

      for (
        let denseCol = effectiveSelection.startCol;
        denseCol <= effectiveSelection.endCol;
        denseCol += 1
      ) {
        const column = visualColumns[denseCol];
        if (!column) continue;
        columnKeys.push(column.key);
        const absCol = colIndex.get(column.key);
        if (absCol != null) columnIndices.push(absCol);
      }
    }

    const uniqueRowIds = (() => {
      const seen = new Set<string>();
      const result: (string | number)[] = [];
      rowIds.forEach((id) => {
        const key = String(id);
        if (seen.has(key)) return;
        seen.add(key);
        result.push(id);
      });
      return result;
    })();

    const uniqueColumnKeys = Array.from(new Set(columnKeys));
    const hasPinnedRow = uniqueRowIds.some((id) =>
      pinnedRowSet.has(String(id))
    );
    const hasPinnedColumn = uniqueColumnKeys.some((key) =>
      pinnedColumnSet.has(key)
    );
    const hasSystemColumn = uniqueColumnKeys.some((key) => isSystemCol(key));

    const { min: rowSpanStart, max: rowSpanEnd } = resolveBounds(
      rowIndices,
      contextMenuState.targetRowIndex
    );
    const { min: colSpanStart, max: colSpanEnd } = resolveBounds(
      columnIndices,
      contextMenuState.targetColIndex
    );

    const selectionRange = {
      startRow: rowSpanStart,
      endRow: rowSpanEnd,
      startCol: colSpanStart,
      endCol: colSpanEnd,
    };

    const {
      overlappingIds,
      fullyContainedIds,
      hasPartialOverlap,
    } = evaluateMergeOverlap(
      selectionRange,
      mergedCells,
      rows,
      uniqueRowIds,
      columnIndices
    );

    const targetColumn = contextMenuState.columnKey
      ? colByKey.get(contextMenuState.columnKey)
      : null;
    const targetRow = rows[contextMenuState.targetRowIndex];

    const targetPinnedRow =
      contextMenuState.rowId != null &&
      pinnedRowSet.has(String(contextMenuState.rowId));
    const targetPinnedCol =
      contextMenuState.columnKey != null &&
      pinnedColumnSet.has(contextMenuState.columnKey);
    const targetSystemCol =
      contextMenuState.columnKey != null &&
      isSystemCol(contextMenuState.columnKey);

    const target = {
      rowIndex: contextMenuState.targetRowIndex,
      colIndex: contextMenuState.targetColIndex,
      rowId: contextMenuState.rowId,
      columnKey: contextMenuState.columnKey,
      row: targetRow,
      column: targetColumn ?? undefined,
      isPinnedRow: targetPinnedRow,
      isPinnedColumn: targetPinnedCol,
      isSystemColumn: targetSystemCol,
    };

    const selectionInfo = {
      rowIds: uniqueRowIds,
      columnKeys: uniqueColumnKeys,
      rowIndices,
      columnIndices,
      selectionRange,
      includesPinnedCell:
        hasPinnedRow ||
        hasPinnedColumn ||
        hasSystemColumn ||
        targetPinnedRow ||
        targetPinnedCol ||
        targetSystemCol,
      isSingleCell:
        selectionRange.startRow === selectionRange.endRow &&
        selectionRange.startCol === selectionRange.endCol,
      isMultiRow: selectionRange.startRow !== selectionRange.endRow,
      isMultiColumn: selectionRange.startCol !== selectionRange.endCol,
      activeMergeIds: overlappingIds,
      fullyContainedMergeIds: fullyContainedIds,
      hasPartialMergeOverlap: hasPartialOverlap,
    };

    return {
      anchorX: contextMenuState.anchorX,
      anchorY: contextMenuState.anchorY,
      event: null,
      selection: effectiveSelection,
      selectionInfo,
      target,
    };
  }, [
    contextMenuEnabled,
    contextMenuState,
    selectionForMenu,
    visualRowOrder,
    rows,
    visualColumns,
    colIndex,
    pinnedRowSet,
    pinnedColumnSet,
    mergedCells,
    colByKey,
  ]);

  const wasContextMenuOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = wasContextMenuOpenRef.current;
    const isOpen = Boolean(contextMenuState && contextMenuContext);
    if (isOpen && !wasOpen && contextMenuContext) {
      config?.onOpen?.(contextMenuContext);
    }
    if (!isOpen && wasOpen) {
      config?.onClose?.();
    }
    wasContextMenuOpenRef.current = isOpen;
  }, [contextMenuState, contextMenuContext, config]);

  useEffect(() => {
    if ((isDraggingSelection || fillDragActive) && contextMenuState) {
      closeContextMenu();
    }
  }, [
    isDraggingSelection,
    fillDragActive,
    contextMenuState,
    closeContextMenu,
  ]);

  const contextMenuItemDefinitions = useMemo(() => {
    if (!contextMenuContext) return [] as GridContextMenuItemDefinition[];
    const defs = config?.items
      ? typeof config.items === "function"
        ? config.items(contextMenuContext)
        : config.items
      : DEFAULT_CONTEXT_MENU_ITEMS;
    if (!defs || defs.length === 0) return DEFAULT_CONTEXT_MENU_ITEMS;
    const extras = extraItems
      ? typeof extraItems === "function"
        ? extraItems(contextMenuContext)
        : extraItems
      : [];
    if (!extras.length) return defs;
    return extraItemsPlacement === "end" ? [...defs, ...extras] : [...extras, ...defs];
  }, [config, contextMenuContext, extraItems, extraItemsPlacement]);

  const handleMergeCellsAction = useCallback(
    (ctx: GridContextMenuActionContext) => {
      if (!ctx.selection) return;
      const rowIndices = ctx.selectionInfo.rowIndices.length
        ? ctx.selectionInfo.rowIndices
        : [ctx.target?.rowIndex ?? contextMenuState?.targetRowIndex ?? 0];
      const columnIndices = ctx.selectionInfo.columnIndices.length
        ? ctx.selectionInfo.columnIndices
        : [ctx.target?.colIndex ?? contextMenuState?.targetColIndex ?? 0];

      const fallbackRow = ctx.target?.rowIndex ?? contextMenuState?.targetRowIndex ?? 0;
      const fallbackCol = ctx.target?.colIndex ?? contextMenuState?.targetColIndex ?? 0;
      const { min: startRow, max: endRow } = resolveBounds(
        rowIndices,
        fallbackRow
      );
      const { min: startCol, max: endCol } = resolveBounds(
        columnIndices,
        fallbackCol
      );

      const topRow = rows[startRow];
      const topColumn = columns[startCol];
      if (!topRow || !topColumn) return;
      const cellValue = topRow.data[topColumn.key] ?? { value: "" };
      const mergeId = `merge-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const rowIds = ctx.selectionInfo.rowIds.length
        ? ctx.selectionInfo.rowIds
        : undefined;

      const mergedCell: GridMergedCell = {
        id: mergeId,
        startRow,
        endRow,
        startCol,
        endCol,
        value: cellValue,
        rowIds,
      };

      const currentRange: MergeRange = {
        startRow,
        endRow,
        startCol,
        endCol,
      };

      const { hasPartialOverlap, fullyContainedIds } = evaluateMergeOverlap(
        currentRange,
        mergedCells,
        rows,
        ctx.selectionInfo.rowIds,
        ctx.selectionInfo.columnIndices
      );

      if (hasPartialOverlap) return;

      const containedMergeIds = new Set(fullyContainedIds);
      const baseMergedCells = containedMergeIds.size
        ? mergedCells.filter((cell) => !containedMergeIds.has(cell.id))
        : mergedCells;

      onMergedCellsChange([...baseMergedCells, mergedCell]);
      mergeCellsHandler?.(ctx);
    },
    [
      rows,
      columns,
      mergedCells,
      onMergedCellsChange,
      mergeCellsHandler,
      contextMenuState,
    ]
  );

  const handleUnmergeCellsAction = useCallback(
    (ctx: GridContextMenuActionContext) => {
      if (!ctx.selectionInfo.activeMergeIds.length) return;
      const removeSet = new Set(ctx.selectionInfo.activeMergeIds);
      const next = mergedCells.filter((cell) => !removeSet.has(cell.id));
      if (next.length !== mergedCells.length) {
        onMergedCellsChange(next);
      }
      unmergeCellsHandler?.(ctx);
    },
    [mergedCells, onMergedCellsChange, unmergeCellsHandler]
  );

  const handleInsertRowsAction = useCallback(
    (ctx: GridContextMenuActionContext, position: "above" | "below") => {
      if (!insertRowsHandler) return;
      const defaultCount = Math.max(
        1,
        ctx.selectionInfo.rowIndices.length || 1
      );
      const promptMessage =
        position === "above"
          ? "Add how many rows above the selection?"
          : "Add how many rows below the selection?";
      const count = promptForCount(promptMessage, defaultCount);
      if (!count) return;
      insertRowsHandler({ ...ctx, position, count });
    },
    [insertRowsHandler, promptForCount]
  );

  const handleInsertColumnsAction = useCallback(
    (ctx: GridContextMenuActionContext, position: "left" | "right") => {
      if (!insertColumnsHandler) return;
      const defaultCount = Math.max(
        1,
        ctx.selectionInfo.columnIndices.length || 1
      );
      const promptMessage =
        position === "left"
          ? "Add how many columns to the left of the selection?"
          : "Add how many columns to the right of the selection?";
      const count = promptForCount(promptMessage, defaultCount);
      if (!count) return;
      insertColumnsHandler({ ...ctx, position, count });
    },
    [insertColumnsHandler, promptForCount]
  );

  const createBuiltInItem = useCallback(
    (
      action: GridContextMenuBuiltInAction,
      path: string,
      ctx: GridContextMenuContext
    ): GridContextMenuResolvedActionItem | null => {
      const id = `${action}-${path}`;
      switch (action) {
        case "mergeCells": {
          const disabled =
            !ctx.selection ||
            ctx.selectionInfo.isSingleCell ||
            ctx.selectionInfo.includesPinnedCell ||
            ctx.selectionInfo.hasPartialMergeOverlap;
          return {
            id,
            type: "action",
            actionId: action,
            label: "Merge cells",
            disabled,
            hidden: false,
            onSelect: handleMergeCellsAction,
            description: undefined,
            shortcut: undefined,
            icon: undefined,
            definition: action,
          };
        }
        case "unmergeCells": {
          const disabled =
            !ctx.selectionInfo.activeMergeIds.length ||
            ctx.selectionInfo.includesPinnedCell;
          return {
            id,
            type: "action",
            actionId: action,
            label: "Unmerge cells",
            disabled,
            hidden: false,
            onSelect: handleUnmergeCellsAction,
            description: undefined,
            shortcut: undefined,
            icon: undefined,
            definition: action,
          };
        }
        case "addRowsAbove":
        case "addRowsBelow": {
          const disabled =
            !insertRowsHandler || ctx.selectionInfo.includesPinnedCell;
          return {
            id,
            type: "action",
            actionId: action,
            label:
              action === "addRowsAbove" ? "Add rows above…" : "Add rows below…",
            disabled,
            hidden: false,
            onSelect: (payload) =>
              handleInsertRowsAction(
                payload,
                action === "addRowsAbove" ? "above" : "below"
              ),
            description: undefined,
            shortcut: undefined,
            icon: undefined,
            definition: action,
          };
        }
        case "addColumnsLeft":
        case "addColumnsRight": {
          const disabled =
            !insertColumnsHandler || ctx.selectionInfo.includesPinnedCell;
          return {
            id,
            type: "action",
            actionId: action,
            label:
              action === "addColumnsLeft"
                ? "Add columns left…"
                : "Add columns right…",
            disabled,
            hidden: false,
            onSelect: (payload) =>
              handleInsertColumnsAction(
                payload,
                action === "addColumnsLeft" ? "left" : "right"
              ),
            description: undefined,
            shortcut: undefined,
            icon: undefined,
            definition: action,
          };
        }
        default:
          return null;
      }
    },
    [
      handleMergeCellsAction,
      handleUnmergeCellsAction,
      insertRowsHandler,
      insertColumnsHandler,
      handleInsertRowsAction,
      handleInsertColumnsAction,
    ]
  );

  const resolveContextMenuItem = useCallback(
    (
      definition: GridContextMenuItemDefinition,
      path: string,
      ctx: GridContextMenuContext
    ): GridContextMenuResolvedItem | null => {
      const evaluateFlag = (
        value: boolean | GridContextMenuPredicate | undefined
      ) => {
        if (typeof value === "function") return value(ctx);
        return Boolean(value);
      };

      if (typeof definition === "string") {
        return createBuiltInItem(definition, path, ctx);
      }

      if (definition.type === "divider") {
        if (evaluateFlag(definition.hidden)) return null;
        return {
          id: definition.id ?? `divider-${path}`,
          type: "divider",
          disabled: false,
          hidden: false,
          definition,
        };
      }

      if (definition.type === "custom") {
        if (evaluateFlag(definition.hidden)) return null;
        const disabled = evaluateFlag(definition.disabled);
        return {
          id: definition.id ?? `custom-${path}`,
          type: "custom",
          actionId: definition.id,
          label: undefined,
          description: undefined,
          shortcut: undefined,
          icon: undefined,
          disabled,
          hidden: false,
          render: definition.render,
          onSelect: undefined,
          definition,
        };
      }

      if (definition.type === "submenu") {
        if (evaluateFlag(definition.hidden)) return null;
        const disabled = evaluateFlag(definition.disabled);
        const label =
          typeof definition.label === "function"
            ? definition.label(ctx)
            : definition.label;
        const icon =
          typeof definition.icon === "function"
            ? definition.icon(ctx)
            : definition.icon;
        const description =
          typeof definition.description === "function"
            ? definition.description(ctx)
            : definition.description;
        const childItems = normalizeResolvedItems(
          definition.items.flatMap((child, childIndex) => {
            const resolved = resolveContextMenuItem(
              child,
              `${path}-${childIndex}`,
              ctx
            );
            return resolved ? [resolved] : [];
          })
        ).filter(
          (item): item is GridContextMenuResolvedLeafItem =>
            item.type !== "submenu"
        );

        if (!childItems.length) return null;

        return {
          id: definition.id ?? `submenu-${path}`,
          type: "submenu",
          label,
          description,
          shortcut: definition.shortcut,
          icon,
          disabled,
          hidden: false,
          items: childItems,
          definition,
        };
      }

      const actionDef = definition;
      const maybeBuiltIn =
        actionDef.action &&
        BUILT_IN_CONTEXT_MENU_ACTIONS.includes(
          actionDef.action as GridContextMenuBuiltInAction
        )
          ? createBuiltInItem(
              actionDef.action as GridContextMenuBuiltInAction,
              path,
              ctx
            )
          : null;

      if (evaluateFlag(actionDef.hidden)) return null;

      const id = actionDef.id ?? maybeBuiltIn?.id ?? `action-${path}`;
      const baseDisabled = maybeBuiltIn?.disabled ?? false;
      const extraDisabled = evaluateFlag(actionDef.disabled);
      const disabled = baseDisabled || extraDisabled;

      const label =
        typeof actionDef.label === "function"
          ? actionDef.label(ctx)
          : actionDef.label ?? maybeBuiltIn?.label ?? actionDef.action ?? id;

      const icon =
        typeof actionDef.icon === "function"
          ? actionDef.icon(ctx)
          : actionDef.icon ?? maybeBuiltIn?.icon;

      const description =
        typeof actionDef.description === "function"
          ? actionDef.description(ctx)
          : actionDef.description ?? maybeBuiltIn?.description;

      const shortcut = actionDef.shortcut ?? maybeBuiltIn?.shortcut;

      const combinedOnSelect: GridContextMenuActionHandler | undefined =
        actionDef.onSelect || maybeBuiltIn?.onSelect
          ? (payload: GridContextMenuActionContext) => {
              maybeBuiltIn?.onSelect?.(payload);
              actionDef.onSelect?.(payload);
            }
          : undefined;

      return {
        id,
        type: "action",
        actionId: actionDef.action ?? maybeBuiltIn?.actionId ?? id,
        label,
        description,
        shortcut,
        icon,
        disabled,
        hidden: false,
        onSelect: combinedOnSelect,
        definition: actionDef,
      };
    },
    [createBuiltInItem]
  );

  const resolveContextMenuItems = useCallback(
    (
      definitions: GridContextMenuItemDefinition[],
      ctx: GridContextMenuContext,
      pathPrefix = ""
    ): GridContextMenuResolvedItem[] => {
      const items = definitions.flatMap((definition, index) => {
        const path = pathPrefix ? `${pathPrefix}-${index}` : `${index}`;
        const resolved = resolveContextMenuItem(definition, path, ctx);
        return resolved ? [resolved] : [];
      });
      return normalizeResolvedItems(items);
    },
    [resolveContextMenuItem]
  );

  const contextMenuItems = useMemo(() => {
    if (!contextMenuContext) return [] as GridContextMenuResolvedItem[];
    return resolveContextMenuItems(contextMenuItemDefinitions, contextMenuContext);
  }, [contextMenuContext, contextMenuItemDefinitions, resolveContextMenuItems]);

  const handleMenuItemSelect = useCallback(
    (ctx: GridContextMenuActionContext) => {
      const actionId =
        (ctx.item.type === "action" || ctx.item.type === "custom") &&
        typeof ctx.item.actionId === "string"
          ? ctx.item.actionId
          : ctx.item.id;
      if (actionId) {
        config?.onAction?.(actionId, ctx);
      }
    },
    [config]
  );

  return {
    contextMenuEnabled,
    contextMenuState,
    contextMenuContext,
    contextMenuItems,
    openContextMenu,
    closeContextMenu,
    handleMenuItemSelect,
  };
};
