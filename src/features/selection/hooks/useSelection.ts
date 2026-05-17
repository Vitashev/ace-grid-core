import { useCallback } from "react";
import { GridSelection } from "../../../types";

export function useSelection(
  selection: GridSelection | null,
  rowIndexToVisual?: Map<number, number>
) {
  const toDenseRow = useCallback(
    (rowIndex: number) => {
      if (!rowIndexToVisual) return rowIndex;
      const mapped = rowIndexToVisual.get(rowIndex);
      return mapped != null ? mapped : rowIndex;
    },
    [rowIndexToVisual]
  );

  const isCellSelected = useCallback(
    (ri: number, ci: number) => {
      if (!selection) return false;
      const denseRow = toDenseRow(ri);
      return (
        denseRow >= selection.startRow &&
        denseRow <= selection.endRow &&
        ci >= selection.startCol &&
        ci <= selection.endCol
      );
    },
    [selection, toDenseRow]
  );
  return { isCellSelected };
}
