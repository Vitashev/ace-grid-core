import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { GridMergedCell, GridRow } from "../../types";

type UseGridRowMutationCommandsArgs = {
  makeRow: (partial?: Partial<GridRow>) => GridRow;
  pushUndo: (snapshot: GridRow[]) => void;
  requestFullFormulaRecalc: () => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  setMergedCells: Dispatch<SetStateAction<GridMergedCell[]>>;
  setRowHeights: Dispatch<SetStateAction<Record<string, number>>>;
};

export const useGridRowMutationCommands = ({
  makeRow,
  pushUndo,
  requestFullFormulaRecalc,
  setRows,
  setMergedCells,
  setRowHeights,
}: UseGridRowMutationCommandsArgs) => {
  const appendRow = useCallback(
    (partial?: Partial<GridRow>) => {
      const row = makeRow(partial);
      setRows((prev) => {
        pushUndo(prev);
        return [...prev, row];
      });
      requestFullFormulaRecalc();
    },
    [makeRow, pushUndo, requestFullFormulaRecalc, setRows],
  );

  const appendRows = useCallback(
    (partials: Partial<GridRow>[]) => {
      if (!partials?.length) return [] as GridRow[];
      const nextRows = partials.map((partial) => makeRow(partial));
      setRows((prev) => {
        pushUndo(prev);
        return [...prev, ...nextRows];
      });
      requestFullFormulaRecalc();
      return nextRows;
    },
    [makeRow, pushUndo, requestFullFormulaRecalc, setRows],
  );

  const prependRows = useCallback(
    (partials: Partial<GridRow>[]) => {
      if (!partials?.length) return [] as GridRow[];
      const nextRows = partials.map((partial) => makeRow(partial));
      const count = nextRows.length;
      setRows((prev) => {
        pushUndo(prev);
        return [...nextRows, ...prev];
      });
      if (count) {
        setMergedCells((prev) =>
          prev.map((cell) => ({
            ...cell,
            startRow: cell.startRow + count,
            endRow: cell.endRow + count,
          })),
        );
      }
      requestFullFormulaRecalc();
      return nextRows;
    },
    [makeRow, pushUndo, requestFullFormulaRecalc, setMergedCells, setRows],
  );

  const replaceRows = useCallback(
    (partials: Partial<GridRow>[]) => {
      const nextRows = (partials ?? []).map((partial) => makeRow(partial));
      setRows((prev) => {
        pushUndo(prev);
        return nextRows;
      });
      setRowHeights({});
      requestFullFormulaRecalc();
      return nextRows;
    },
    [makeRow, pushUndo, requestFullFormulaRecalc, setRowHeights, setRows],
  );

  const deleteRows = useCallback(
    (ids: Array<string | number>) => {
      const kill = new Set(ids);
      let changed = false;
      setRows((prev) => {
        if (!prev.some((row) => kill.has(row.id))) return prev;
        pushUndo(prev);
        changed = true;
        return prev.filter((row) => !kill.has(row.id));
      });
      if (changed) requestFullFormulaRecalc();
    },
    [pushUndo, requestFullFormulaRecalc, setRows],
  );

  return {
    appendRow,
    appendRows,
    prependRows,
    replaceRows,
    deleteRows,
  };
};
