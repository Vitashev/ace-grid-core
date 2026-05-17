import { useMemo, useState } from "react";

import type { GridSelection } from "../../types";

type GridSelectionStateValue = {
  selection: GridSelection | null;
};

type GridSelectionStateController = GridSelectionStateValue & {
  setSelection: (selection: GridSelection | null) => void;
  clearSelection: () => void;
};

type UseGridSelectionStateControllerArgs = {
  initialSelection: GridSelection | null;
};

export const useGridSelectionStateController = ({
  initialSelection,
}: UseGridSelectionStateControllerArgs): {
  value: GridSelectionStateValue;
  state: GridSelectionStateController;
} => {
  const [selection, setSelection] = useState<GridSelection | null>(
    initialSelection,
  );

  const value = useMemo<GridSelectionStateValue>(
    () => ({
      selection,
    }),
    [selection],
  );

  const state = useMemo<GridSelectionStateController>(
    () => ({
      ...value,
      setSelection,
      clearSelection: () => setSelection(null),
    }),
    [value],
  );

  return { value, state };
};
