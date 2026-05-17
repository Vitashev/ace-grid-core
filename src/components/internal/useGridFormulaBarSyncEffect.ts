import { useEffect } from "react";

import type { GridStoreApi } from "../../features/grid-store/store";
import { isSystemCol } from "../../features/cell-selection";
import type { GridColumn, GridRow, GridSelection } from "../../types";

type UseGridFormulaBarSyncEffectArgs = {
  editingCell: unknown;
  enableFormulaBar: boolean;
  gridStore: GridStoreApi;
  resolveRow: (absoluteRowIndex: number) => GridRow | undefined;
  selection?: GridSelection | null;
  selectionColumns: GridColumn[];
  visualRowOrder: number[];
};

const resolveFormulaBarValue = (
  row: GridRow | undefined,
  column: GridColumn | undefined,
) => {
  if (!row || !column) return "";
  const cell = row.data[column.key];
  if (!cell) return "";
  const formula =
    typeof cell.formula === "string"
      ? cell.formula
      : typeof cell.value === "string" && cell.value.trim().startsWith("=")
        ? cell.value
        : null;
  if (formula) return formula;
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const setFormulaBarValue = (gridStore: GridStoreApi, nextValue: string) => {
  gridStore.setState((prev) => {
    if (prev.editing.formulaBarValue === nextValue) return prev;
    return {
      ...prev,
      editing: { ...prev.editing, formulaBarValue: nextValue },
    };
  });
};

export const useGridFormulaBarSyncEffect = ({
  editingCell,
  enableFormulaBar,
  gridStore,
  resolveRow,
  selection,
  selectionColumns,
  visualRowOrder,
}: UseGridFormulaBarSyncEffectArgs) => {
  useEffect(() => {
    if (!enableFormulaBar) return;
    if (editingCell) return;
    if (!selection) {
      setFormulaBarValue(gridStore, "");
      return;
    }

    const absRow = visualRowOrder[selection.startRow] ?? selection.startRow;
    const row = resolveRow(absRow);
    const column = selectionColumns[selection.startCol];
    if (column && isSystemCol(column.key)) {
      setFormulaBarValue(gridStore, "");
      return;
    }

    setFormulaBarValue(gridStore, resolveFormulaBarValue(row, column));
  }, [
    editingCell,
    enableFormulaBar,
    gridStore,
    resolveRow,
    selection,
    selectionColumns,
    visualRowOrder,
  ]);
};
