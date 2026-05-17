import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";

import { createGridCapabilityError } from "../../capabilities";
import { coerceInputValue } from "../../features/cell-format";
import { exportGridToCsv, importGridFromCsv } from "../../features/io/csv";
import type { GridExcelIoModule } from "../../runtime/modules";
import type {
  CellValue,
  CellValueType,
  GridColumn,
  GridColumnDef,
  GridCsvExportOptions,
  GridCsvImportOptions,
  GridCsvImportResult,
  GridCsvImportSource,
  GridExcelExportOptions,
  GridExcelImportOptions,
  GridExcelImportResult,
  GridExcelImportSource,
  GridFilterConfig,
  GridMergedCell,
  GridPinnedColumns,
  GridPinnedRows,
  GridRow,
  GridSelection,
  GridSortConfig,
} from "../../types";

type UseGridDataCommandsArgs = {
  allColumns: GridColumn[];
  rows: GridRow[];
  mergedCells: GridMergedCell[];
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  csvCapabilityEnabled: boolean;
  excelIoCapabilityEnabled: boolean;
  excelIoModule: GridExcelIoModule;
  resolveCellValueType: (type?: string) => CellValueType;
  pushUndo: (snapshot: GridRow[]) => void;
  requestFullFormulaRecalc: () => void;
  applyColumnDefs: (defs: GridColumn[]) => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setUndoStack: Dispatch<SetStateAction<GridRow[][]>>;
  setRedoStack: Dispatch<SetStateAction<GridRow[][]>>;
  setRowHeights: Dispatch<SetStateAction<Record<string, number>>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
  setColumnWidths: Dispatch<SetStateAction<Record<string, number>>>;
  setSelectionState: (selection: GridSelection | null) => void;
  setSortColumn: Dispatch<SetStateAction<string | null>>;
  setSortDirection: Dispatch<SetStateAction<"asc" | "desc" | null>>;
  setSortModelState: Dispatch<SetStateAction<GridSortConfig[]>>;
  setActiveFilters: (filters: GridFilterConfig[]) => void;
  setPinnedColumns: (pinnedColumns: GridPinnedColumns) => void;
  setPinnedRows: (pinnedRows: GridPinnedRows) => void;
  clearSearch: () => void;
  setValidationAllToken: (token: number | undefined) => void;
  columnDefsSignatureRef: MutableRefObject<string>;
  setColumnDefsState: Dispatch<SetStateAction<GridColumnDef[]>>;
};

export const useGridDataCommands = ({
  allColumns,
  rows,
  mergedCells,
  columnWidths,
  rowHeights,
  csvCapabilityEnabled,
  excelIoCapabilityEnabled,
  excelIoModule,
  resolveCellValueType,
  pushUndo,
  requestFullFormulaRecalc,
  applyColumnDefs,
  setRows,
  setUndoStack,
  setRedoStack,
  setRowHeights,
  setMergedCells,
  setColumnWidths,
  setSelectionState,
  setSortColumn,
  setSortDirection,
  setSortModelState,
  setActiveFilters,
  setPinnedColumns,
  setPinnedRows,
  clearSearch,
  setValidationAllToken,
  columnDefsSignatureRef,
  setColumnDefsState,
}: UseGridDataCommandsArgs) => {
  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (!prev.length) return prev;
      setRows((current) => {
        const last = prev[prev.length - 1];
        setRedoStack((redoStack) => [...redoStack, current]);
        requestFullFormulaRecalc();
        return last;
      });
      return prev.slice(0, -1);
    });
  }, [requestFullFormulaRecalc, setRedoStack, setRows, setUndoStack]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      setRows((current) => {
        const next = prev[prev.length - 1];
        setUndoStack((undoStack) => [...undoStack, current]);
        requestFullFormulaRecalc();
        return next;
      });
      return prev.slice(0, -1);
    });
  }, [requestFullFormulaRecalc, setRedoStack, setRows, setUndoStack]);

  const clearData = useCallback(() => {
    setRows((prev) => {
      pushUndo(prev);
      return [];
    });
    setRowHeights({});
    requestFullFormulaRecalc();
  }, [pushUndo, requestFullFormulaRecalc, setRowHeights, setRows]);

  const importData = useCallback(
    (data: any[][]) => {
      setRows((prev) => {
        pushUndo(prev);
        return data.map((rowValues, index) => ({
          id: `imported-${index}`,
          data: allColumns.reduce<Record<string, CellValue>>((acc, column, colIdx) => {
            const rawValue = rowValues[colIdx] ?? "";
            let nextValue = rawValue;
            const nextType: CellValueType =
              column.type != null
                ? resolveCellValueType(column.type)
                : rawValue instanceof Date
                  ? "datetime"
                  : typeof rawValue === "boolean"
                    ? "boolean"
                    : typeof rawValue === "number"
                      ? "number"
                      : rawValue != null && typeof rawValue === "object"
                        ? "json"
                        : "text";

            if (typeof rawValue === "string") {
              nextValue = coerceInputValue(rawValue, nextType, column);
            }

            acc[column.key] = {
              value: nextValue,
              type: nextType,
            };
            return acc;
          }, {}),
        }));
      });
      setRowHeights({});
      requestFullFormulaRecalc();
    },
    [allColumns, pushUndo, requestFullFormulaRecalc, resolveCellValueType, setRowHeights, setRows],
  );

  const exportData = useCallback(() => {
    const columnKeys = allColumns.map((column) => column.key);
    return rows.map((row) => columnKeys.map((key) => row.data[key]?.value ?? ""));
  }, [allColumns, rows]);

  const exportCSV = useCallback(
    (filenameOrOptions?: string | GridCsvExportOptions) => {
      if (!csvCapabilityEnabled) {
        throw createGridCapabilityError("io.csv");
      }
      const options =
        typeof filenameOrOptions === "string"
          ? { filename: filenameOrOptions }
          : filenameOrOptions;
      exportGridToCsv({
        columns: allColumns,
        rows,
        options,
      });
    },
    [allColumns, csvCapabilityEnabled, rows],
  );

  const importCSV = useCallback(
    async (
      source: GridCsvImportSource,
      options?: GridCsvImportOptions,
    ): Promise<GridCsvImportResult> => {
      if (!csvCapabilityEnabled) {
        throw createGridCapabilityError("io.csv");
      }
      const imported = await importGridFromCsv({
        source,
        columns: allColumns,
        options,
      });

      setRows((prev) => {
        pushUndo(prev);
        return imported.rows;
      });

      if (imported.columns) {
        applyColumnDefs(imported.columns);
        setColumnWidths({});
      }

      setRowHeights({});
      setMergedCells([]);
      requestFullFormulaRecalc();

      return imported.meta;
    },
    [
      allColumns,
      applyColumnDefs,
      csvCapabilityEnabled,
      pushUndo,
      requestFullFormulaRecalc,
      setColumnWidths,
      setMergedCells,
      setRowHeights,
      setRows,
    ],
  );

  const exportExcel = useCallback(
    async (options?: GridExcelExportOptions) => {
      if (!excelIoCapabilityEnabled) {
        throw createGridCapabilityError("io.excel");
      }
      await excelIoModule.exportGridToExcel({
        columns: allColumns,
        rows,
        mergedCells,
        columnWidths,
        rowHeights,
        options,
      });
    },
    [
      allColumns,
      columnWidths,
      excelIoCapabilityEnabled,
      excelIoModule,
      mergedCells,
      rowHeights,
      rows,
    ],
  );

  const importExcel = useCallback(
    async (
      source: GridExcelImportSource,
      options?: GridExcelImportOptions,
    ): Promise<GridExcelImportResult> => {
      if (!excelIoCapabilityEnabled) {
        throw createGridCapabilityError("io.excel");
      }
      const imported = await excelIoModule.importGridFromExcel({
        source,
        columns: allColumns,
        options,
      });

      setRows((prev) => {
        pushUndo(prev);
        return imported.rows;
      });

      if (imported.columns) {
        applyColumnDefs(imported.columns);
      }

      setColumnWidths(imported.columnWidths);
      setRowHeights(imported.rowHeights);
      setMergedCells(imported.mergedCells);
      requestFullFormulaRecalc();

      return imported.meta;
    },
    [
      allColumns,
      applyColumnDefs,
      excelIoCapabilityEnabled,
      excelIoModule,
      pushUndo,
      requestFullFormulaRecalc,
      setColumnWidths,
      setMergedCells,
      setRowHeights,
      setRows,
    ],
  );

  const resetGridState = useCallback(() => {
    setSelectionState(null);
    setSortColumn(null);
    setSortDirection(null);
    setSortModelState([]);
    setActiveFilters([]);
    setPinnedColumns({ left: [], right: [] });
    setPinnedRows({ top: [], bottom: [] });
    clearSearch();
    setValidationAllToken(undefined);
    setColumnWidths({});
    setRowHeights({});
    columnDefsSignatureRef.current = "";
    setColumnDefsState([]);
  }, [
    clearSearch,
    columnDefsSignatureRef,
    setActiveFilters,
    setColumnDefsState,
    setColumnWidths,
    setPinnedColumns,
    setPinnedRows,
    setRowHeights,
    setSelectionState,
    setSortColumn,
    setSortDirection,
    setSortModelState,
    setValidationAllToken,
  ]);

  return {
    undo,
    redo,
    clearData,
    importData,
    exportData,
    exportCSV,
    importCSV,
    exportExcel,
    importExcel,
    resetGridState,
  };
};
