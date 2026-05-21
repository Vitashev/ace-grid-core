import { useCallback, type Dispatch, type SetStateAction } from "react";

import { isSystemCol } from "../../features/cell-selection";
import { coerceInputValue } from "../../features/cell-format";
import { primeCompiledCellFormat } from "../../features/cell-format/compiledCellFormat";
import type { FormulaGridEvalOptions } from "../../runtime/publicCoreSupport";
import type {
  CellFormat,
  CellValue,
  CellValueType,
  GridColumn,
  GridMergedCell,
  GridRow,
  GridSelection,
} from "../../types";

type ClipboardSelectionContext = {
  rowIds?: (string | number)[];
  columnKeys?: string[];
  rowIndices?: number[];
  columnIndices?: number[];
  rowIndex?: number;
  colIndex?: number;
};

type ClipboardDataColumn = {
  index: number;
  column: GridColumn;
};

type UseGridClipboardCommandsArgs = {
  selection: GridSelection | null;
  rowsForGrid: GridRow[];
  reorderedColumns: GridColumn[];
  clampSelectionToGrid: (
    selection: GridSelection,
    rowCount: number,
    colCount: number,
  ) => GridSelection | null;
  uniquePreserveOrder: (values?: number[]) => number[] | null;
  uniqueRowIdsPreserveOrder: (
    values?: (string | number)[],
  ) => (string | number)[] | null;
  resolveCellValueType: (type?: string) => CellValueType;
  pushUndo: (snapshot: GridRow[]) => void;
  recalcFormulas: (
    nextRows: GridRow[],
    options?: FormulaGridEvalOptions,
  ) => { changed: boolean; rows: GridRow[] };
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
};

const normalizeClipboardText = (value: unknown): string => {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (err) {
      console.warn("Failed to stringify cell value", err);
      return String(value);
    }
  }
  return String(value);
};

const escapeDelimitedCell = (value: string, delimiter: string) => {
  if (!value) return "";
  const specialPattern =
    delimiter === "\t" ? /[\t\n\r"]/ : new RegExp(`[${delimiter}\n\r"]`);
  if (!specialPattern.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
};

const serializeDelimited = (rows: string[][], delimiter: string) =>
  rows
    .map((row) =>
      row.map((value) => escapeDelimitedCell(value, delimiter)).join(delimiter),
    )
    .join("\r\n");

const serializeTSV = (rows: string[][]) => serializeDelimited(rows, "\t");

const parseTSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === "\"") {
        const next = text[i + 1];
        if (next === "\"") {
          cell += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }
    if (char === "\t") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const isFormulaInput = (value: unknown): value is string =>
  typeof value === "string" && value.trim().startsWith("=");

export const useGridClipboardCommands = ({
  selection,
  rowsForGrid,
  reorderedColumns,
  clampSelectionToGrid,
  uniquePreserveOrder,
  uniqueRowIdsPreserveOrder,
  resolveCellValueType,
  pushUndo,
  recalcFormulas,
  setRows,
  setMergedCells,
}: UseGridClipboardCommandsArgs) => {
  const writeClipboardText = useCallback(async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard write failed", err);
      }
    }
    if (typeof window !== "undefined") {
      window.prompt("Copy data", text);
    }
    return false;
  }, []);

  const readClipboardText = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        console.warn("Clipboard read failed", err);
      }
    }
    if (typeof window !== "undefined") {
      return window.prompt("Paste data") ?? null;
    }
    return null;
  }, []);

  const collectDataColumnsInRange = useCallback(
    (startCol: number, endCol: number) => {
      const result: ClipboardDataColumn[] = [];
      const start = Math.max(0, Math.min(startCol, reorderedColumns.length - 1));
      const end = Math.max(0, Math.min(endCol, reorderedColumns.length - 1));
      for (let colIdx = start; colIdx <= end; colIdx += 1) {
        const column = reorderedColumns[colIdx];
        if (!column || isSystemCol(column.key)) continue;
        result.push({ index: colIdx, column });
      }
      return result;
    },
    [reorderedColumns],
  );

  const collectDataColumnsFrom = useCallback(
    (startCol: number, count: number) => {
      if (count <= 0) return [] as ClipboardDataColumn[];
      const result: ClipboardDataColumn[] = [];
      const start = Math.max(0, startCol);
      for (
        let colIdx = start;
        colIdx < reorderedColumns.length && result.length < count;
        colIdx += 1
      ) {
        const column = reorderedColumns[colIdx];
        if (!column || isSystemCol(column.key)) continue;
        result.push({ index: colIdx, column });
      }
      return result;
    },
    [reorderedColumns],
  );

  const collectRowIndicesFrom = useCallback(
    (startRow: number, count: number) => {
      if (count <= 0) return [] as number[];
      const result: number[] = [];
      const start = Math.max(0, startRow);
      for (
        let rowIdx = start;
        rowIdx < rowsForGrid.length && result.length < count;
        rowIdx += 1
      ) {
        if (rowsForGrid[rowIdx]) result.push(rowIdx);
      }
      return result;
    },
    [rowsForGrid],
  );

  const resolveClipboardBase = useCallback(
    (
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const baseSelection = selectionOverride ?? selection;
      const fallbackFromContext =
        !baseSelection && context?.rowIndex != null && context?.colIndex != null
          ? {
              startRow: context.rowIndex,
              endRow: context.rowIndex,
              startCol: context.colIndex,
              endCol: context.colIndex,
            }
          : !baseSelection &&
              context?.rowIndices?.length &&
              context?.columnIndices?.length
            ? {
                startRow: Math.min(...context.rowIndices),
                endRow: Math.max(...context.rowIndices),
                startCol: Math.min(...context.columnIndices),
                endCol: Math.max(...context.columnIndices),
              }
            : null;
      const inputSelection = baseSelection ?? fallbackFromContext;
      if (!inputSelection) return null;
      const clamped = clampSelectionToGrid(
        inputSelection,
        rowsForGrid.length,
        reorderedColumns.length,
      );
      if (!clamped) return null;

      const rowIndices = (() => {
        if (context?.rowIndices?.length) {
          const unique = uniquePreserveOrder(context.rowIndices);
          return unique?.length ? unique : [];
        }
        if (context?.rowIds?.length) {
          const order = uniqueRowIdsPreserveOrder(context.rowIds) ?? [];
          if (!order.length) return [];
          const rowIdToIndex = new Map(
            rowsForGrid.map((row, idx) => [String(row.id), idx]),
          );
          return order
            .map((id) => rowIdToIndex.get(String(id)))
            .filter((idx): idx is number => idx != null);
        }
        return collectRowIndicesFrom(
          clamped.startRow,
          clamped.endRow - clamped.startRow + 1,
        );
      })();

      const dataColumns = (() => {
        if (context?.columnKeys?.length) {
          const columnIndex = new Map(
            reorderedColumns.map((column, idx) => [column.key, idx]),
          );
          const seen = new Set<string>();
          const result: ClipboardDataColumn[] = [];
          context.columnKeys.forEach((key) => {
            if (!key || seen.has(key) || isSystemCol(key)) return;
            const idx = columnIndex.get(key);
            if (idx == null) return;
            const column = reorderedColumns[idx];
            if (!column) return;
            seen.add(key);
            result.push({ index: idx, column });
          });
          if (result.length) return result;
        }
        return collectDataColumnsInRange(clamped.startCol, clamped.endCol);
      })();

      return {
        selection: clamped,
        rowIndices,
        dataColumns,
      };
    },
    [
      clampSelectionToGrid,
      collectDataColumnsInRange,
      collectRowIndicesFrom,
      reorderedColumns,
      rowsForGrid,
      selection,
      uniquePreserveOrder,
      uniqueRowIdsPreserveOrder,
    ],
  );

  const buildPasteCellValue = useCallback(
    (existing: CellValue | undefined, column: GridColumn, raw: string) => {
      const base = existing ? { ...existing } : { value: "" };
      const formula = isFormulaInput(raw) ? raw.trim() : null;
      if (formula) {
        const next: CellValue = {
          ...base,
          value: base.value ?? "",
          type: "formula",
          formula,
        };
        return next;
      }
      const resolvedType =
        base.type && base.type !== "formula"
          ? base.type
          : resolveCellValueType(column.type);
      const nextValue = coerceInputValue(raw, resolvedType, column);
      const next: CellValue = {
        ...base,
        value: nextValue,
        type: resolvedType,
      };
      if ("formula" in next) delete (next as CellValue).formula;
      return next;
    },
    [resolveCellValueType],
  );

  const copySelectionToClipboard = useCallback(
    async (
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const resolved = resolveClipboardBase(selectionOverride, context);
      if (!resolved) return null;
      const { rowIndices, dataColumns } = resolved;
      if (!rowIndices.length || !dataColumns.length) return null;
      const rows = rowIndices.map((idx) => rowsForGrid[idx]).filter(Boolean);
      if (!rows.length) return null;
      const matrix = rows.map((row) =>
        dataColumns.map(({ column }) => {
          const cell = row.data[column.key];
          const raw =
            typeof cell?.formula === "string" ? cell.formula : cell?.value;
          return normalizeClipboardText(raw);
        }),
      );
      const text = serializeTSV(matrix);
      await writeClipboardText(text);
      return text;
    },
    [resolveClipboardBase, rowsForGrid, writeClipboardText],
  );

  const applySelectionClear = useCallback(
    (
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const resolved = resolveClipboardBase(selectionOverride, context);
      if (!resolved) return false;
      const { rowIndices, dataColumns } = resolved;
      if (!rowIndices.length || !dataColumns.length) return false;

      setRows((prev) => {
        const rowIdToIndex = new Map(
          prev.map((row, idx) => [String(row.id), idx]),
        );
        let changed = false;
        const changedCells: Array<{ rowId: string | number; columnKey: string }> =
          [];
        const next = prev.slice();

        rowIndices.forEach((denseRowIdx) => {
          const viewRow = rowsForGrid[denseRowIdx];
          if (!viewRow) return;
          const rowIdx = rowIdToIndex.get(String(viewRow.id));
          if (rowIdx == null) return;
          const row = prev[rowIdx];
          if (row.locked || row.meta?.group) return;
          let rowChanged = false;
          const nextData = { ...row.data };

          dataColumns.forEach(({ column }) => {
            const hadCell = column.key in row.data;
            const existing = row.data[column.key] ?? { value: "" };
            if (!hadCell && existing.value === "") return;
            if (existing.value === "" && !existing.formula) return;
            const nextCell: CellValue = {
              ...existing,
              value: "",
            };
            if ("formula" in nextCell) delete (nextCell as CellValue).formula;
            rowChanged = true;
            nextData[column.key] = nextCell;
            changedCells.push({ rowId: row.id, columnKey: column.key });
          });

          if (!rowChanged) return;
          changed = true;
          next[rowIdx] = { ...row, data: nextData };
        });

        if (!changed) return prev;
        pushUndo(prev);
        const recalculated = recalcFormulas(next, { changedCells });
        return recalculated.changed ? recalculated.rows : next;
      });

      return true;
    },
    [pushUndo, recalcFormulas, resolveClipboardBase, rowsForGrid, setRows],
  );

  const applyCellFormatToSelection = useCallback(
    (
      formatPatch: Partial<CellFormat>,
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const resolved = resolveClipboardBase(selectionOverride, context);
      if (!resolved) return false;
      const { selection: resolvedSelection, rowIndices, dataColumns } = resolved;
      if (!rowIndices.length || !dataColumns.length) return false;

      const rowIndexSet = new Set(rowIndices);
      const columnKeySet = new Set(dataColumns.map(({ column }) => column.key));
      const patchEntries = Object.entries(formatPatch) as Array<
        [keyof CellFormat, CellFormat[keyof CellFormat]]
      >;

      const buildNextFormat = (base: CellFormat | undefined) => {
        const nextFormat: CellFormat = { ...(base ?? {}) };
        patchEntries.forEach(([key, value]) => {
          if (value == null) {
            delete nextFormat[key];
          } else {
            (
              nextFormat as Record<
                keyof CellFormat,
                CellFormat[keyof CellFormat] | undefined
              >
            )[key] = value;
          }
        });
        if (Object.keys(nextFormat).length === 0) return undefined;
        primeCompiledCellFormat(nextFormat);
        return nextFormat;
      };

      let changed = false;
      setRows((prev) => {
        const next = prev.map((row, rowIdx) => {
          if (!rowIndexSet.has(rowIdx)) return row;
          let rowChanged = false;
          const nextData = { ...row.data };

          columnKeySet.forEach((columnKey) => {
            const existing = row.data[columnKey] ?? { value: "" };
            const nextFormat = buildNextFormat(existing.format);
            const sameFormat =
              JSON.stringify(existing.format ?? null) ===
              JSON.stringify(nextFormat ?? null);
            if (sameFormat) return;
            rowChanged = true;
            nextData[columnKey] = {
              ...existing,
              format: nextFormat,
            };
          });

          if (!rowChanged) return row;
          changed = true;
          return { ...row, data: nextData };
        });

        if (!changed) return prev;
        pushUndo(prev);
        return next;
      });

      setMergedCells((prev) => {
        let mergedChanged = false;
        const next = prev.map((cell) => {
          const fullyContained =
            cell.startRow >= resolvedSelection.startRow &&
            cell.endRow <= resolvedSelection.endRow &&
            cell.startCol >= resolvedSelection.startCol &&
            cell.endCol <= resolvedSelection.endCol;
          if (!fullyContained) return cell;

          const baseValue =
            cell.value && typeof cell.value === "object"
              ? cell.value
              : { value: cell.value ?? "" };
          const nextFormat = buildNextFormat(baseValue.format);
          const sameFormat =
            JSON.stringify(baseValue.format ?? null) ===
            JSON.stringify(nextFormat ?? null);
          if (sameFormat) return cell;
          mergedChanged = true;
          return {
            ...cell,
            value: {
              ...baseValue,
              format: nextFormat,
            },
          };
        });
        return mergedChanged ? next : prev;
      });

      return changed;
    },
    [pushUndo, resolveClipboardBase, setMergedCells, setRows],
  );

  const clearCellFormatFromSelection = useCallback(
    (
      keys: Array<keyof CellFormat> = ["backgroundColor"],
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) =>
      applyCellFormatToSelection(
        keys.reduce<Partial<CellFormat>>((acc, key) => {
          (
            acc as Record<
              keyof CellFormat,
              CellFormat[keyof CellFormat] | undefined
            >
          )[key] = undefined;
          return acc;
        }, {}),
        selectionOverride,
        context,
      ),
    [applyCellFormatToSelection],
  );

  const pasteFromClipboard = useCallback(
    async (
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const resolved = resolveClipboardBase(selectionOverride, context);
      if (!resolved) return false;
      const { selection: resolvedSelection, dataColumns } = resolved;
      if (!dataColumns.length) return false;
      const rawText = await readClipboardText();
      if (!rawText) return false;
      const parsed = parseTSV(rawText);
      if (!parsed.length) return false;
      const maxCols = Math.max(...parsed.map((row) => row.length));
      const matrix = parsed.map((row) =>
        row.concat(Array(Math.max(0, maxCols - row.length)).fill("")),
      );
      const dataRowCount = matrix.length;
      const dataColCount = maxCols || 1;

      const selectionRowCount =
        resolvedSelection.endRow - resolvedSelection.startRow + 1;
      const selectionColCount = dataColumns.length;
      const selectionIsSingle =
        selectionRowCount === 1 && selectionColCount === 1;
      const pasteIsSingle = dataRowCount === 1 && dataColCount === 1;

      const targetRowCount =
        selectionIsSingle && !pasteIsSingle
          ? dataRowCount
          : !selectionIsSingle && pasteIsSingle
            ? selectionRowCount
            : Math.min(dataRowCount, selectionRowCount);
      const targetColCount =
        selectionIsSingle && !pasteIsSingle
          ? dataColCount
          : !selectionIsSingle && pasteIsSingle
            ? selectionColCount
            : Math.min(dataColCount, selectionColCount);

      const targetRowIndices = collectRowIndicesFrom(
        resolvedSelection.startRow,
        targetRowCount,
      );
      const targetColumns =
        selectionIsSingle && !pasteIsSingle
          ? collectDataColumnsFrom(dataColumns[0].index, targetColCount)
          : dataColumns.slice(0, targetColCount);

      if (!targetRowIndices.length || !targetColumns.length) return false;

      setRows((prev) => {
        const rowIdToIndex = new Map(
          prev.map((row, idx) => [String(row.id), idx]),
        );
        let changed = false;
        const changedCells: Array<{ rowId: string | number; columnKey: string }> =
          [];
        const next = prev.slice();

        targetRowIndices.forEach((denseRowIdx, rIdx) => {
          const viewRow = rowsForGrid[denseRowIdx];
          if (!viewRow) return;
          const rowIdx = rowIdToIndex.get(String(viewRow.id));
          if (rowIdx == null) return;
          const row = prev[rowIdx];
          if (row.locked || row.meta?.group) return;
          let rowChanged = false;
          const nextData = { ...row.data };

          targetColumns.forEach(({ column }, cIdx) => {
            const rawValue = pasteIsSingle
              ? matrix[0][0] ?? ""
              : matrix[rIdx]?.[cIdx] ?? "";
            const hadCell = column.key in row.data;
            const existing = row.data[column.key] ?? { value: "" };
            const nextCell = buildPasteCellValue(existing, column, rawValue);

            const cellChanged = !hadCell
              ? rawValue !== ""
              : existing.value !== nextCell.value ||
                existing.formula !== nextCell.formula ||
                existing.type !== nextCell.type;

            if (!cellChanged) return;
            rowChanged = true;
            nextData[column.key] = nextCell;
            changedCells.push({ rowId: row.id, columnKey: column.key });
          });

          if (!rowChanged) return;
          changed = true;
          next[rowIdx] = { ...row, data: nextData };
        });

        if (!changed) return prev;
        pushUndo(prev);
        const recalculated = recalcFormulas(next, { changedCells });
        return recalculated.changed ? recalculated.rows : next;
      });

      return true;
    },
    [
      buildPasteCellValue,
      collectDataColumnsFrom,
      collectRowIndicesFrom,
      pushUndo,
      readClipboardText,
      recalcFormulas,
      resolveClipboardBase,
      rowsForGrid,
      setRows,
    ],
  );

  const cutSelection = useCallback(
    async (
      selectionOverride?: GridSelection | null,
      context?: ClipboardSelectionContext,
    ) => {
      const text = await copySelectionToClipboard(selectionOverride, context);
      if (text == null) return null;
      applySelectionClear(selectionOverride, context);
      return text;
    },
    [applySelectionClear, copySelectionToClipboard],
  );

  return {
    copySelectionToClipboard,
    pasteFromClipboard,
    cutSelection,
    applyCellFormatToSelection,
    clearCellFormatFromSelection,
  };
};
