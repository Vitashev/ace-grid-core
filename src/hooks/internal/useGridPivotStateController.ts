import { useMemo, useState } from "react";

import type {
  GridServerRowGroupColumnRequest,
  GridServerRowModelPivotColumnRequest,
  GridServerRowModelPivotValueColumnRequest,
} from "../../types";

type GridPivotStateValue = {
  enabled: boolean;
  groupColumns: GridServerRowGroupColumnRequest[];
  pivotColumns: GridServerRowModelPivotColumnRequest[];
  valueColumns: GridServerRowModelPivotValueColumnRequest[];
  pivotMode: boolean;
  resultFieldSeparator: string;
  resultFields: string[];
};

type GridPivotStateController = GridPivotStateValue & {
  set: (patch: Partial<GridPivotStateValue>) => void;
  setEnabled: (enabled: boolean) => void;
  setGroupColumns: (columns: GridServerRowGroupColumnRequest[]) => void;
  setPivotColumns: (columns: GridServerRowModelPivotColumnRequest[]) => void;
  setValueColumns: (columns: GridServerRowModelPivotValueColumnRequest[]) => void;
  setPivotMode: (enabled: boolean) => void;
  setResultFieldSeparator: (separator: string) => void;
  setResultFields: (fields: string[]) => void;
};

type UseGridPivotStateControllerArgs = {
  initialEnabled: boolean;
  initialGroupColumns: GridServerRowGroupColumnRequest[];
  initialPivotColumns: GridServerRowModelPivotColumnRequest[];
  initialValueColumns: GridServerRowModelPivotValueColumnRequest[];
  initialPivotMode: boolean;
  initialResultFieldSeparator: string;
  initialResultFields: string[];
};

export const useGridPivotStateController = ({
  initialEnabled,
  initialGroupColumns,
  initialPivotColumns,
  initialValueColumns,
  initialPivotMode,
  initialResultFieldSeparator,
  initialResultFields,
}: UseGridPivotStateControllerArgs): {
  value: GridPivotStateValue;
  state: GridPivotStateController;
} => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [groupColumns, setGroupColumns] = useState(initialGroupColumns);
  const [pivotColumns, setPivotColumns] = useState(initialPivotColumns);
  const [valueColumns, setValueColumns] = useState(initialValueColumns);
  const [pivotMode, setPivotMode] = useState(initialPivotMode);
  const [resultFieldSeparator, setResultFieldSeparator] = useState(
    initialResultFieldSeparator,
  );
  const [resultFields, setResultFields] = useState(initialResultFields);

  const value = useMemo<GridPivotStateValue>(
    () => ({
      enabled,
      groupColumns,
      pivotColumns,
      valueColumns,
      pivotMode,
      resultFieldSeparator,
      resultFields,
    }),
    [
      enabled,
      groupColumns,
      pivotColumns,
      valueColumns,
      pivotMode,
      resultFieldSeparator,
      resultFields,
    ],
  );

  const state = useMemo<GridPivotStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.enabled != null) setEnabled(patch.enabled);
        if (patch.groupColumns != null) setGroupColumns(patch.groupColumns);
        if (patch.pivotColumns != null) setPivotColumns(patch.pivotColumns);
        if (patch.valueColumns != null) setValueColumns(patch.valueColumns);
        if (patch.pivotMode != null) setPivotMode(patch.pivotMode);
        if (patch.resultFieldSeparator != null) {
          setResultFieldSeparator(patch.resultFieldSeparator);
        }
        if (patch.resultFields != null) setResultFields(patch.resultFields);
      },
      setEnabled,
      setGroupColumns,
      setPivotColumns,
      setValueColumns,
      setPivotMode,
      setResultFieldSeparator,
      setResultFields,
    }),
    [value],
  );

  return { value, state };
};
