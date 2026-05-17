import { useCallback } from "react";
import type { KeyboardEvent, PointerEvent, RefObject } from "react";
import type {
  GridClipboardRangeContext,
  GridColumn,
  GridRow,
  GridSelection,
} from "../../../types";
import { isSystemCol } from "../../cell-selection";
import {
  findFirstFocusableDescendant,
  isGridInteractiveTarget,
  isGridTextEntryTarget,
} from "../utils";

type ClipboardHandler =
  | ((context: GridClipboardRangeContext) => void | Promise<void>)
  | undefined;

type RowModelView = {
  getRow: (rowIndex: number) => GridRow | undefined;
} | null | undefined;

type UseGridInteractionControllerParams = {
  clipboardEnabled: boolean;
  enableKeyboardShortcuts: boolean;
  enableCellSelection: boolean;
  selection: GridSelection | null | undefined;
  editingCell: unknown;
  selectionColumns: GridColumn[];
  visualRowOrder: number[];
  serverRowModelEnabled: boolean;
  rowModelForView: RowModelView;
  rows: GridRow[];
  onClipboardCopy: ClipboardHandler;
  onClipboardCut: ClipboardHandler;
  onClipboardPaste: ClipboardHandler;
  onSelectionRangeChange?: (selection: GridSelection) => void;
  onActivateSelection?: (rowIndex: number, colIndex: number) => void;
  keepSelectionVisible?: (args: {
    visualRowIndex: number;
    rowId?: string | number;
    columnKey: string;
  }) => void;
  activeSelectionCellId?: string;
  containerRef: RefObject<HTMLElement>;
};

export const useGridInteractionController = ({
  clipboardEnabled,
  enableKeyboardShortcuts,
  enableCellSelection,
  selection,
  editingCell,
  selectionColumns,
  visualRowOrder,
  serverRowModelEnabled,
  rowModelForView,
  rows,
  onClipboardCopy,
  onClipboardCut,
  onClipboardPaste,
  onSelectionRangeChange,
  onActivateSelection,
  keepSelectionVisible,
  activeSelectionCellId,
  containerRef,
}: UseGridInteractionControllerParams) => {
  const getFirstNavigableColumnIndex = useCallback(() => {
    if (selectionColumns.length === 0) return -1;
    const firstDataColumn = selectionColumns.findIndex(
      (column) => !isSystemCol(column.key)
    );
    return firstDataColumn >= 0 ? firstDataColumn : 0;
  }, [selectionColumns]);

  const resolveClampedSelection = useCallback(
    (nextSelection: GridSelection | null | undefined) => {
      if (visualRowOrder.length === 0 || selectionColumns.length === 0) {
        return null;
      }

      const fallbackCol = getFirstNavigableColumnIndex();
      if (fallbackCol < 0) return null;

      if (!nextSelection) {
        return {
          startRow: 0,
          endRow: 0,
          startCol: fallbackCol,
          endCol: fallbackCol,
        };
      }

      const maxRow = visualRowOrder.length - 1;
      const maxCol = selectionColumns.length - 1;
      const startRow = Math.max(0, Math.min(maxRow, nextSelection.startRow));
      const endRow = Math.max(0, Math.min(maxRow, nextSelection.endRow));
      const startCol = Math.max(0, Math.min(maxCol, nextSelection.startCol));
      const endCol = Math.max(0, Math.min(maxCol, nextSelection.endCol));

      return { startRow, endRow, startCol, endCol };
    },
    [getFirstNavigableColumnIndex, selectionColumns.length, visualRowOrder.length]
  );

  const focusGridRoot = useCallback(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, [containerRef]);

  const buildClipboardContext = useCallback(
    (): GridClipboardRangeContext | null => {
      if (!selection) return null;
      const startRow = Math.min(selection.startRow, selection.endRow);
      const endRow = Math.max(selection.startRow, selection.endRow);
      const startCol = Math.min(selection.startCol, selection.endCol);
      const endCol = Math.max(selection.startCol, selection.endCol);

      const rowIds: (string | number)[] = [];
      const rowIndices: number[] = [];
      for (let denseRow = startRow; denseRow <= endRow; denseRow += 1) {
        const absRow = visualRowOrder[denseRow] ?? denseRow;
        rowIndices.push(absRow);
        const row = serverRowModelEnabled
          ? rowModelForView?.getRow(absRow)
          : rows[absRow];
        if (row) rowIds.push(row.id);
      }

      const columnKeys: string[] = [];
      const columnIndices: number[] = [];
      for (let colIdx = startCol; colIdx <= endCol; colIdx += 1) {
        const column = selectionColumns[colIdx];
        if (!column) continue;
        columnIndices.push(colIdx);
        if (!isSystemCol(column.key)) columnKeys.push(column.key);
      }

      return {
        selection: { startRow, endRow, startCol, endCol },
        rowIds,
        columnKeys,
        rowIndices,
        columnIndices,
      };
    },
    [
      selection,
      selectionColumns,
      visualRowOrder,
      serverRowModelEnabled,
      rowModelForView,
      rows,
    ]
  );

  const applySelection = useCallback(
    (nextSelection: GridSelection | null | undefined) => {
      const clamped = resolveClampedSelection(nextSelection);
      if (!clamped) return null;

      onSelectionRangeChange?.(clamped);

      const column = selectionColumns[clamped.startCol];
      if (column) {
        const absRow =
          visualRowOrder[clamped.startRow] ?? clamped.startRow;
        const row = serverRowModelEnabled
          ? rowModelForView?.getRow(absRow)
          : rows[absRow];
        keepSelectionVisible?.({
          visualRowIndex: clamped.startRow,
          rowId: row?.id,
          columnKey: column.key,
        });
      }

      return clamped;
    },
    [
      keepSelectionVisible,
      onSelectionRangeChange,
      resolveClampedSelection,
      rowModelForView,
      rows,
      selectionColumns,
      serverRowModelEnabled,
      visualRowOrder,
    ]
  );

  const focusSelectedCellControl = useCallback(() => {
    if (!activeSelectionCellId) return false;
    const selectedCell =
      document.getElementById(activeSelectionCellId) ?? null;
    if (!selectedCell || !containerRef.current?.contains(selectedCell)) {
      return false;
    }
    const focusable = findFirstFocusableDescendant(selectedCell);
    if (!focusable) return false;
    focusable.focus({ preventScroll: true });
    return true;
  }, [activeSelectionCellId, containerRef]);

  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      const targetIsRoot = target === containerRef.current;

      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        target &&
        !targetIsRoot &&
        isGridInteractiveTarget(target)
      ) {
        event.preventDefault();
        event.stopPropagation();
        focusGridRoot();
        return;
      }

      if (event.defaultPrevented) return;

      if (
        target &&
        !targetIsRoot &&
        (isGridTextEntryTarget(target) || isGridInteractiveTarget(target))
      ) {
        return;
      }

      const isMod = event.metaKey || event.ctrlKey;
      if (
        clipboardEnabled &&
        enableKeyboardShortcuts &&
        selection &&
        !editingCell &&
        (onClipboardCopy || onClipboardCut || onClipboardPaste) &&
        isMod
      ) {
        const key = event.key.toLowerCase();
        const context = buildClipboardContext();
        if (!context) return;

        if (key === "c" && onClipboardCopy) {
          event.preventDefault();
          void onClipboardCopy(context);
          return;
        }
        if (key === "x" && onClipboardCut) {
          event.preventDefault();
          void onClipboardCut(context);
          return;
        }
        if (key === "v" && onClipboardPaste) {
          event.preventDefault();
          void onClipboardPaste(context);
          return;
        }
      }

      if (!enableCellSelection || editingCell) return;

      const currentSelection = resolveClampedSelection(selection);
      const baseSelection = currentSelection ?? resolveClampedSelection(null);
      if (!baseSelection) return;

      const normalized = {
        startRow: Math.min(baseSelection.startRow, baseSelection.endRow),
        endRow: Math.max(baseSelection.startRow, baseSelection.endRow),
        startCol: Math.min(baseSelection.startCol, baseSelection.endCol),
        endCol: Math.max(baseSelection.startCol, baseSelection.endCol),
      };

      const applySingleCellSelection = (rowIndex: number, colIndex: number) =>
        applySelection({
          startRow: rowIndex,
          endRow: rowIndex,
          startCol: colIndex,
          endCol: colIndex,
        });

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          applySingleCellSelection(
            Math.max(0, normalized.startRow - 1),
            normalized.startCol
          );
          return;
        case "ArrowDown":
          event.preventDefault();
          applySingleCellSelection(
            normalized.endRow + (currentSelection ? 1 : 0),
            normalized.startCol
          );
          return;
        case "ArrowLeft":
          event.preventDefault();
          applySingleCellSelection(
            normalized.startRow,
            Math.max(0, normalized.startCol - 1)
          );
          return;
        case "ArrowRight":
          event.preventDefault();
          applySingleCellSelection(
            normalized.startRow,
            normalized.endCol + (currentSelection ? 1 : 0)
          );
          return;
        case "Home":
          event.preventDefault();
          applySingleCellSelection(
            isMod ? 0 : normalized.startRow,
            getFirstNavigableColumnIndex()
          );
          return;
        case "End":
          event.preventDefault();
          applySingleCellSelection(
            isMod ? visualRowOrder.length - 1 : normalized.startRow,
            selectionColumns.length - 1
          );
          return;
        case "Enter":
        case "F2": {
          event.preventDefault();
          const ensuredSelection =
            currentSelection ?? applySelection(baseSelection);
          if (!ensuredSelection) return;
          if (focusSelectedCellControl()) return;
          const absRow =
            visualRowOrder[ensuredSelection.startRow] ??
            ensuredSelection.startRow;
          onActivateSelection?.(absRow, ensuredSelection.startCol);
          return;
        }
        default:
          return;
      }
    },
    [
      activeSelectionCellId,
      applySelection,
      buildClipboardContext,
      clipboardEnabled,
      containerRef,
      editingCell,
      enableKeyboardShortcuts,
      enableCellSelection,
      focusGridRoot,
      focusSelectedCellControl,
      getFirstNavigableColumnIndex,
      onActivateSelection,
      onClipboardCopy,
      onClipboardCut,
      onClipboardPaste,
      resolveClampedSelection,
      selection,
      selectionColumns.length,
      visualRowOrder,
    ]
  );

  const handleGridPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if (editingCell) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (isGridTextEntryTarget(target) || isGridInteractiveTarget(target))
      ) {
        return;
      }
      if (containerRef.current && document.activeElement !== containerRef.current) {
        focusGridRoot();
      }
    },
    [containerRef, editingCell, focusGridRoot]
  );

  return {
    handleGridKeyDown,
    handleGridPointerDown,
  };
};
