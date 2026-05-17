import { useCallback } from "react";

import type { GridColumn, GridSelection } from "../../../types";

type UseGridFormulaBarControllerArgs = {
  editingCell: unknown;
  selection?: GridSelection | null;
  selectionColumns: GridColumn[];
  visualColumnIndex: Map<string, number>;
  visualRowOrder: number[];
  onCellDbl: (rowIndex: number, colIndex: number) => void;
  onFormulaChange: (value: string) => void;
  onFormulaSubmit: () => void;
};

export const useGridFormulaBarController = ({
  editingCell,
  selection,
  selectionColumns,
  visualColumnIndex,
  visualRowOrder,
  onCellDbl,
  onFormulaChange,
  onFormulaSubmit,
}: UseGridFormulaBarControllerArgs) => {
  const ensureFormulaBarEditingCell = useCallback(() => {
    if (editingCell || !selection) return;
    const selectedColumn = selectionColumns[selection.startCol];
    if (!selectedColumn) return;
    const visualCol = visualColumnIndex.get(selectedColumn.key);
    if (visualCol == null) return;
    if (
      selection.startRow < 0 ||
      selection.startRow >= visualRowOrder.length ||
      selection.startCol < 0 ||
      selection.startCol >= selectionColumns.length
    ) {
      return;
    }
    const absRow = visualRowOrder[selection.startRow] ?? selection.startRow;
    onCellDbl(absRow, visualCol);
  }, [
    editingCell,
    selection,
    selectionColumns,
    visualColumnIndex,
    visualRowOrder,
    onCellDbl,
  ]);

  const handleFormulaBarChange = useCallback(
    (value: string) => {
      onFormulaChange(value);
    },
    [onFormulaChange],
  );

  const handleFormulaBarFocus = useCallback(() => {
    ensureFormulaBarEditingCell();
  }, [ensureFormulaBarEditingCell]);

  const handleFormulaBarSubmit = useCallback(() => {
    ensureFormulaBarEditingCell();
    onFormulaSubmit();
  }, [ensureFormulaBarEditingCell, onFormulaSubmit]);

  return {
    ensureFormulaBarEditingCell,
    handleFormulaBarFocus,
    handleFormulaBarChange,
    handleFormulaBarSubmit,
  };
};
