import { useMemo, useState } from "react";

type GridFeatureFlagsStateValue = {
  enableFormulaBar: boolean;
  enableFiltering: boolean;
  enableCellSpanning: boolean;
  enableRowGrouping: boolean;
  horizontalVirtualization: boolean;
  verticalVirtualization: boolean;
  cellContentVirtualization: boolean;
  isRowPinning: boolean;
  isColReorder: boolean;
  isRowReorder: boolean;
  isRowSelection: boolean;
  sortMode: "client" | "server";
};

type GridFeatureFlagsStateController = GridFeatureFlagsStateValue & {
  set: (patch: Partial<GridFeatureFlagsStateValue>) => void;
  setEnableFormulaBar: (enabled: boolean) => void;
  setEnableFiltering: (enabled: boolean) => void;
  setEnableCellSpanning: (enabled: boolean) => void;
  setEnableRowGrouping: (enabled: boolean) => void;
  setHorizontalVirtualization: (enabled: boolean) => void;
  setVerticalVirtualization: (enabled: boolean) => void;
  setCellContentVirtualization: (enabled: boolean) => void;
  setIsRowPinning: (enabled: boolean) => void;
  setIsColReorder: (enabled: boolean) => void;
  setIsRowReorder: (enabled: boolean) => void;
  setIsRowSelection: (enabled: boolean) => void;
  setSortMode: (mode: "client" | "server") => void;
};

type UseGridFeatureFlagsStateControllerArgs = {
  initialEnableFormulaBar: boolean;
  initialEnableFiltering: boolean;
  initialEnableCellSpanning: boolean;
  initialEnableRowGrouping: boolean;
  initialHorizontalVirtualization: boolean;
  initialVerticalVirtualization: boolean;
  initialCellContentVirtualization: boolean;
  initialIsRowPinning: boolean;
  initialIsColReorder: boolean;
  initialIsRowReorder: boolean;
  initialIsRowSelection: boolean;
  initialSortMode: "client" | "server";
};

export const useGridFeatureFlagsStateController = ({
  initialEnableFormulaBar,
  initialEnableFiltering,
  initialEnableCellSpanning,
  initialEnableRowGrouping,
  initialHorizontalVirtualization,
  initialVerticalVirtualization,
  initialCellContentVirtualization,
  initialIsRowPinning,
  initialIsColReorder,
  initialIsRowReorder,
  initialIsRowSelection,
  initialSortMode,
}: UseGridFeatureFlagsStateControllerArgs): {
  value: GridFeatureFlagsStateValue;
  state: GridFeatureFlagsStateController;
} => {
  const [enableFormulaBar, setEnableFormulaBar] = useState(
    initialEnableFormulaBar,
  );
  const [enableFiltering, setEnableFiltering] = useState(
    initialEnableFiltering,
  );
  const [enableCellSpanning, setEnableCellSpanning] = useState(
    initialEnableCellSpanning,
  );
  const [enableRowGrouping, setEnableRowGrouping] = useState(
    initialEnableRowGrouping,
  );
  const [horizontalVirtualization, setHorizontalVirtualization] = useState(
    initialHorizontalVirtualization,
  );
  const [verticalVirtualization, setVerticalVirtualization] = useState(
    initialVerticalVirtualization,
  );
  const [cellContentVirtualization, setCellContentVirtualization] = useState(
    initialCellContentVirtualization,
  );
  const [isRowPinning, setIsRowPinning] = useState(initialIsRowPinning);
  const [isColReorder, setIsColReorder] = useState(initialIsColReorder);
  const [isRowReorder, setIsRowReorder] = useState(initialIsRowReorder);
  const [isRowSelection, setIsRowSelection] = useState(initialIsRowSelection);
  const [sortMode, setSortMode] = useState<"client" | "server">(
    initialSortMode,
  );

  const value = useMemo<GridFeatureFlagsStateValue>(
    () => ({
      enableFormulaBar,
      enableFiltering,
      enableCellSpanning,
      enableRowGrouping,
      horizontalVirtualization,
      verticalVirtualization,
      cellContentVirtualization,
      isRowPinning,
      isColReorder,
      isRowReorder,
      isRowSelection,
      sortMode,
    }),
    [
      enableFormulaBar,
      enableFiltering,
      enableCellSpanning,
      enableRowGrouping,
      horizontalVirtualization,
      verticalVirtualization,
      cellContentVirtualization,
      isRowPinning,
      isColReorder,
      isRowReorder,
      isRowSelection,
      sortMode,
    ],
  );

  const state = useMemo<GridFeatureFlagsStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.enableFormulaBar != null) {
          setEnableFormulaBar(patch.enableFormulaBar);
        }
        if (patch.enableFiltering != null) {
          setEnableFiltering(patch.enableFiltering);
        }
        if (patch.enableCellSpanning != null) {
          setEnableCellSpanning(patch.enableCellSpanning);
        }
        if (patch.enableRowGrouping != null) {
          setEnableRowGrouping(patch.enableRowGrouping);
        }
        if (patch.horizontalVirtualization != null) {
          setHorizontalVirtualization(patch.horizontalVirtualization);
        }
        if (patch.verticalVirtualization != null) {
          setVerticalVirtualization(patch.verticalVirtualization);
        }
        if (patch.cellContentVirtualization != null) {
          setCellContentVirtualization(patch.cellContentVirtualization);
        }
        if (patch.isRowPinning != null) {
          setIsRowPinning(patch.isRowPinning);
        }
        if (patch.isColReorder != null) {
          setIsColReorder(patch.isColReorder);
        }
        if (patch.isRowReorder != null) {
          setIsRowReorder(patch.isRowReorder);
        }
        if (patch.isRowSelection != null) {
          setIsRowSelection(patch.isRowSelection);
        }
        if (patch.sortMode != null) {
          setSortMode(patch.sortMode);
        }
      },
      setEnableFormulaBar,
      setEnableFiltering,
      setEnableCellSpanning,
      setEnableRowGrouping,
      setHorizontalVirtualization,
      setVerticalVirtualization,
      setCellContentVirtualization,
      setIsRowPinning,
      setIsColReorder,
      setIsRowReorder,
      setIsRowSelection,
      setSortMode,
    }),
    [value],
  );

  return { value, state };
};
