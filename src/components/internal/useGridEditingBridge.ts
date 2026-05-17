import { useCallback, type MutableRefObject } from "react";

import {
  useEditingWithFormula,
  useGridFormulaBarController,
} from "../../features/edit";
import type { GridFormulaModule } from "../../runtime/modules";
import type {
  GridColumn,
  GridEditProps,
  GridMergedCell,
  GridRowGroup,
  GridSelection,
  GridSelectionProps,
  GridSpanProps,
  GridValidationCellState,
  GridValidationMode,
  GridValidationTrigger,
} from "../../types";

type EditingValidationConfig = {
  enabled: boolean;
  mode: GridValidationMode;
  trigger: GridValidationTrigger;
  debounceMs?: number;
  validateCellValue: (
    row: any,
    column: GridColumn,
    rowIndex: number,
    columnIndex: number,
    value: any,
  ) => {
    state: GridValidationCellState | null;
    hasErrors: boolean;
    pendingAsync: boolean;
  };
  previewCellValue?: (
    row: any,
    column: GridColumn,
    rowIndex: number,
    columnIndex: number,
    value: any,
  ) => {
    state: GridValidationCellState | null;
    hasErrors: boolean;
    pendingAsync: boolean;
  };
};

type UseGridEditingBridgeArgs = {
  colByKey?: Map<string, GridColumn>;
  colIndex?: Map<string, number>;
  editingCell: unknown;
  effectiveMergedCells: GridMergedCell[];
  effectivePinnedBottomGroups: GridRowGroup[];
  effectivePinnedTopGroups: GridRowGroup[];
  emitMergedCellsChange?: GridSpanProps["onMergedCellsChange"];
  enableFormulaBar: boolean;
  formulaBarValueRef: MutableRefObject<string>;
  formulaCapabilityEnabled: boolean;
  formulaColumnIndex: Map<string, number>;
  formulaModule: Pick<GridFormulaModule, "useFormulaRangePick">;
  isCellEditing: boolean;
  onCellChange: GridEditProps["onCellChange"];
  onCellDoubleClick: GridSelectionProps["onCellDoubleClick"];
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  selection?: GridSelection | null;
  selectionColumns: GridColumn[];
  validation: EditingValidationConfig;
  virtualCenterCols: { visible: GridColumn[] };
  virtualCenterGroups: { visible: GridRowGroup[] };
  visualColumnIndex: Map<string, number>;
  visualColumns: GridColumn[];
  visualRowOrder: number[];
};

export const useGridEditingBridge = ({
  colByKey,
  colIndex,
  editingCell,
  effectiveMergedCells,
  effectivePinnedBottomGroups,
  effectivePinnedTopGroups,
  emitMergedCellsChange,
  enableFormulaBar,
  formulaBarValueRef,
  formulaCapabilityEnabled,
  formulaColumnIndex,
  formulaModule,
  isCellEditing,
  onCellChange,
  onCellDoubleClick,
  pinnedLeftColumns,
  pinnedRightColumns,
  selection,
  selectionColumns,
  validation,
  virtualCenterCols,
  virtualCenterGroups,
  visualColumnIndex,
  visualColumns,
  visualRowOrder,
}: UseGridEditingBridgeArgs) => {
  const handleCellDoubleClick = useCallback(
    (rowIndex: number, visualColIndex: number, el?: HTMLElement) => {
      if (!onCellDoubleClick) return;
      const column = visualColumns[visualColIndex];
      const selectionIndex =
        column && visualColumnIndex.has(column.key)
          ? (visualColumnIndex.get(column.key) as number)
          : visualColIndex;
      onCellDoubleClick(rowIndex, selectionIndex, el);
    },
    [onCellDoubleClick, visualColumnIndex, visualColumns],
  );

  const {
    updateEditingValue,
    registerEditorValueListener,
    onFormulaChange,
    onFormulaSubmit,
    commitEdit,
    cancelEdit,
    onCellDbl,
  } = useEditingWithFormula(
    formulaCapabilityEnabled,
    enableFormulaBar,
    isCellEditing,
    effectivePinnedTopGroups,
    virtualCenterGroups,
    effectivePinnedBottomGroups,
    pinnedLeftColumns,
    virtualCenterCols,
    pinnedRightColumns,
    onCellChange,
    handleCellDoubleClick,
    effectiveMergedCells,
    emitMergedCellsChange,
    colIndex,
    colByKey,
    validation,
  );

  const { handleGridPointerDownCapture } = formulaModule.useFormulaRangePick({
    editingCell,
    selection,
    selectionColumns,
    formulaColumnIndex,
    visualRowOrder,
    formulaBarValueRef,
    updateEditingValue,
  });

  const {
    handleFormulaBarFocus,
    handleFormulaBarChange,
    handleFormulaBarSubmit,
  } = useGridFormulaBarController({
    editingCell,
    selection,
    selectionColumns,
    visualColumnIndex,
    visualRowOrder,
    onCellDbl,
    onFormulaChange,
    onFormulaSubmit,
  });

  return {
    updateEditingValue,
    registerEditorValueListener,
    commitEdit,
    cancelEdit,
    onCellDbl,
    handleGridPointerDownCapture,
    handleFormulaBarFocus,
    handleFormulaBarChange,
    handleFormulaBarSubmit,
  };
};
