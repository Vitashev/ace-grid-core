import { useMemo } from "react";

import type { GridColumn, GridSelection } from "../../types";
import { buildGridBodyCellId } from "../../features/interaction/utils";

type UseGridSelectionPresentationStateArgs = {
  selection: GridSelection | null | undefined;
  selectionColumns: GridColumn[];
  formulaColumnIndex: Map<string, number>;
  visualRowOrder: number[];
  headerRowCount: number;
  floatingFiltersEnabled: boolean;
  visualColumns: GridColumn[];
  visualColumnIndex: Map<string, number>;
  gridBodyCellIdBase?: string;
  resolveSemanticBodyRowIndex: (rowIndex: number) => number;
};

const columnIndexToLetters = (columnIndex: number): string => {
  let current = Math.max(1, Math.floor(columnIndex));
  let letters = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    current = Math.floor((current - 1) / 26);
  }
  return letters || "A";
};

export const useGridSelectionPresentationState = ({
  selection,
  selectionColumns,
  formulaColumnIndex,
  visualRowOrder,
  headerRowCount,
  floatingFiltersEnabled,
  visualColumns,
  visualColumnIndex,
  gridBodyCellIdBase,
  resolveSemanticBodyRowIndex,
}: UseGridSelectionPresentationStateArgs) => {
  const selectedCellLabel = useMemo(() => {
    if (!selection) return "";
    const column = selectionColumns[selection.startCol];
    if (!column) return "";
    const baseIndex = formulaColumnIndex.get(column.key);
    if (baseIndex == null) return "";
    const absRow = visualRowOrder[selection.startRow] ?? selection.startRow;
    return `${columnIndexToLetters(baseIndex + 1)}${absRow + 1}`;
  }, [selection, selectionColumns, formulaColumnIndex, visualRowOrder]);

  const headerSemanticRowCount =
    headerRowCount + (floatingFiltersEnabled ? 1 : 0);
  const bodySemanticRowCount = visualRowOrder.length;
  const gridAriaRowCount = headerSemanticRowCount + bodySemanticRowCount;
  const gridAriaColCount = visualColumns.length;

  const activeSelectionCellId = useMemo(() => {
    if (!selection) return undefined;
    const column = selectionColumns[selection.startCol];
    if (!column) return undefined;
    const visualColIdx = visualColumnIndex.get(column.key);
    if (visualColIdx == null) return undefined;
    const absRow = visualRowOrder[selection.startRow] ?? selection.startRow;
    return buildGridBodyCellId(
      gridBodyCellIdBase,
      headerSemanticRowCount + resolveSemanticBodyRowIndex(absRow) + 1,
      visualColIdx + 1,
    );
  }, [
    gridBodyCellIdBase,
    headerSemanticRowCount,
    resolveSemanticBodyRowIndex,
    selection,
    selectionColumns,
    visualColumnIndex,
    visualRowOrder,
  ]);

  return {
    selectedCellLabel,
    gridAriaRowCount,
    gridAriaColCount,
    activeSelectionCellId,
  };
};
