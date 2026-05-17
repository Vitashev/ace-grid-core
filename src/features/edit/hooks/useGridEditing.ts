import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  GridColumn,
  GridRowGroup,
  GridRow,
  GridMergedCell,
  CellValueType,
  GridEditProps,
  GridSelectionProps,
  GridSpanProps,
  GridValidationCellState,
  GridValidationMode,
  GridValidationTrigger,
} from "../../../types";
import { coerceInputValue } from "../../cell-format";
import { useGridStoreApi, useGridStoreSelector } from "../../grid-store";
import type { GridStoreState } from "../../grid-store/store";
import type { EditingCellState } from "../../edit/types";

type EditingValidationConfig = {
  enabled: boolean;
  mode: GridValidationMode;
  trigger: GridValidationTrigger;
  debounceMs?: number;
  validateCellValue: (
    row: GridRow,
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
    row: GridRow,
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

const resolveCellValueType = (type?: string): CellValueType => {
  switch (type) {
    case "number":
    case "date":
    case "datetime":
    case "time":
    case "boolean":
    case "json":
    case "formula":
    case "radio":
      return type as CellValueType;
    default:
      return "text";
  }
};

const toFormulaDisplay = (value: any): string => {
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

const isFormulaInput = (value: any): value is string =>
  typeof value === "string" && value.trim().startsWith("=");

const resolveEditingValue = (value: any, formulaEnabled: boolean): any => {
  if (formulaEnabled && value && typeof value === "object" && "formula" in value) {
    const formula = (value as { formula?: string }).formula;
    if (isFormulaInput(formula)) return formula;
  }
  if (value && typeof value === "object" && "value" in value) {
    const raw = (value as { value?: any }).value;
    if (formulaEnabled && isFormulaInput(raw)) return raw;
    return raw ?? "";
  }
  if (formulaEnabled && isFormulaInput(value)) return value;
  return value ?? "";
};

const EMPTY_EDITING_STATE: GridStoreState["editing"] = {
  cell: null,
  draftValue: "",
  formulaBarValue: "",
  validation: null,
};

const validationStateEqual = (
  a: GridValidationCellState | null | undefined,
  b: GridValidationCellState | null | undefined,
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.severity === b.severity &&
    a.message === b.message &&
    a.pending === b.pending &&
    (a.results?.length ?? 0) === (b.results?.length ?? 0)
  );
};

const editingStateIsEqual = (
  a: GridStoreState["editing"],
  b: GridStoreState["editing"],
) =>
  a.cell === b.cell &&
  Object.is(a.draftValue, b.draftValue) &&
  a.formulaBarValue === b.formulaBarValue &&
  validationStateEqual(a.validation, b.validation);

const editingCellIsEqual = (
  a: EditingCellState | null,
  b: EditingCellState | null,
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.rowIndex === b.rowIndex &&
    a.colIndex === b.colIndex &&
    a.columnKey === b.columnKey &&
    a.version === b.version
  );
};

export function useGridEditing(
  formulaEnabled: boolean,
  enableFormulaBar: boolean,
  isCellEditing: boolean,
  pinnedTopGroups: GridRowGroup[],
  virtualCenterGroups: { visible: GridRowGroup[] },
  pinnedBottomGroups: GridRowGroup[],
  pinnedLeftColumns: GridColumn[],
  virtualCenterCols: { visible: GridColumn[] },
  pinnedRightColumns: GridColumn[],
  onCellChange: GridEditProps["onCellChange"],
  onCellDoubleClick: GridSelectionProps["onCellDoubleClick"],
  mergedCells: GridMergedCell[],
  onMergedCellsChange?: GridSpanProps["onMergedCellsChange"],
  columnIndexLookup?: Map<string, number>,
  columnByKey?: Map<string, GridColumn>,
  validationConfig?: EditingValidationConfig,
) {
  const store = useGridStoreApi();
  const editingCell = useGridStoreSelector(
    (state) => state.editing.cell,
    editingCellIsEqual,
  );

  const editingValueRef = useRef<any>(store.getState().editing.draftValue ?? "");
  const editorListenerRef = useRef<((value: any) => void) | null>(null);
  const editingVersionRef = useRef(store.getState().editing.cell?.version ?? 0);
  const liveValidationTimerRef = useRef<number | null>(null);
  const liveValidationTokenRef = useRef(0);
  const visualColumns = useMemo(
    () => [
      ...pinnedLeftColumns,
      ...virtualCenterCols.visible,
      ...pinnedRightColumns,
    ],
    [pinnedLeftColumns, virtualCenterCols.visible, pinnedRightColumns],
  );
  const visualColumnIndex = useMemo(() => {
    const map = new Map<string, number>();
    visualColumns.forEach((col, idx) => map.set(col.key, idx));
    return map;
  }, [visualColumns]);
  const pinnedColumnKeys = useMemo(() => {
    const keys = new Set<string>();
    pinnedLeftColumns.forEach((column) => keys.add(column.key));
    pinnedRightColumns.forEach((column) => keys.add(column.key));
    return keys;
  }, [pinnedLeftColumns, pinnedRightColumns]);
  const isPinnedRowIndex = useCallback(
    (rowIndex: number) => {
      const isInGroup = (group: GridRowGroup) =>
        rowIndex >= group.startRowIndex && rowIndex <= group.endRowIndex;
      return pinnedTopGroups.some(isInGroup) || pinnedBottomGroups.some(isInGroup);
    },
    [pinnedTopGroups, pinnedBottomGroups],
  );
  const isPinnedCell = useCallback(
    (rowIndex: number, columnKey: string) =>
      isPinnedRowIndex(rowIndex) || pinnedColumnKeys.has(columnKey),
    [isPinnedRowIndex, pinnedColumnKeys],
  );
  const columnKeyByIndex = useMemo(() => {
    if (!columnIndexLookup) return null;
    const map = new Map<number, string>();
    columnIndexLookup.forEach((idx, key) => map.set(idx, key));
    return map;
  }, [columnIndexLookup]);
  const resolveColumnByKey = useCallback(
    (key: string) =>
      columnByKey?.get(key) ?? visualColumns.find((col) => col.key === key),
    [columnByKey, visualColumns],
  );
  const resolveMergedAnchor = useCallback(
    (rowIndex: number, columnKey: string) => {
      if (!mergedCells.length || !columnIndexLookup) return null;
      const columnIndex = columnIndexLookup.get(columnKey);
      if (columnIndex == null) return null;
      for (const cell of mergedCells) {
        if (rowIndex < cell.startRow || rowIndex > cell.endRow) continue;
        if (columnIndex < cell.startCol || columnIndex > cell.endCol) continue;
        const anchorKey = columnKeyByIndex?.get(cell.startCol);
        if (!anchorKey) return null;
        return {
          rowIndex: cell.startRow,
          columnIndex: cell.startCol,
          columnKey: anchorKey,
        };
      }
      return null;
    },
    [mergedCells, columnIndexLookup, columnKeyByIndex],
  );

  const setEditingState = useCallback(
    (
      updater:
        | GridStoreState["editing"]
        | ((current: GridStoreState["editing"]) => GridStoreState["editing"]),
    ) => {
      store.setState((prev) => {
        const currentEditing = prev.editing;
        const nextEditing =
          typeof updater === "function"
            ? (updater as (
                current: GridStoreState["editing"],
              ) => GridStoreState["editing"])(currentEditing)
            : updater;

        if (
          nextEditing === currentEditing ||
          editingStateIsEqual(currentEditing, nextEditing)
        ) {
          return prev;
        }

        return {
          ...prev,
          editing: nextEditing,
        };
      });
    },
    [store],
  );

  const resetEditingState = useCallback(() => {
    editingValueRef.current = "";
    editorListenerRef.current = null;
    liveValidationTokenRef.current += 1;
    if (liveValidationTimerRef.current != null) {
      clearTimeout(liveValidationTimerRef.current);
      liveValidationTimerRef.current = null;
    }
    setEditingState(EMPTY_EDITING_STATE);
  }, [setEditingState]);

  useEffect(() => {
    if (!editingCell) return;
    const nextIndex = visualColumns.findIndex(
      (col) => col.key === editingCell.columnKey,
    );
    if (nextIndex < 0 || nextIndex === editingCell.colIndex) return;
    setEditingState((current) => {
      if (!current.cell) return current;
      if (current.cell.columnKey !== editingCell.columnKey) return current;
      if (current.cell.colIndex === nextIndex) return current;
      return {
        ...current,
        cell: { ...current.cell, colIndex: nextIndex },
      };
    });
  }, [editingCell, visualColumns, setEditingState]);

  useEffect(() => {
    if (!isCellEditing) {
      resetEditingState();
    }
  }, [isCellEditing, resetEditingState]);

  useEffect(() => {
    if (!editingCell) return;
    if (!isPinnedCell(editingCell.rowIndex, editingCell.columnKey)) return;
    resetEditingState();
  }, [editingCell, isPinnedCell, resetEditingState]);

  useEffect(() => {
    if (validationConfig?.enabled && validationConfig.trigger === "change") {
      return;
    }
    liveValidationTokenRef.current += 1;
    if (liveValidationTimerRef.current != null) {
      clearTimeout(liveValidationTimerRef.current);
      liveValidationTimerRef.current = null;
    }
  }, [validationConfig?.enabled, validationConfig?.trigger]);

  const commitEdit = useCallback(
    (rowIndex: number, visualColIndex: number, rawValue?: any) => {
      if (!isCellEditing) {
        resetEditingState();
        return;
      }

      const value = rawValue ?? editingValueRef.current;
      const column = visualColumns[visualColIndex];

      if (!column) {
        resetEditingState();
        return;
      }

      const anchor = resolveMergedAnchor(rowIndex, column.key);
      const targetRowIndex = anchor?.rowIndex ?? rowIndex;
      const targetColumnKey = anchor?.columnKey ?? column.key;
      const targetColumn = anchor ? resolveColumnByKey(targetColumnKey) : column;
      const targetColIndex = anchor
        ? visualColumnIndex.get(targetColumnKey) ?? visualColIndex
        : visualColIndex;

      if (!targetColumn) {
        resetEditingState();
        return;
      }

      if (
        isPinnedCell(rowIndex, column.key) ||
        isPinnedCell(targetRowIndex, targetColumn.key)
      ) {
        resetEditingState();
        return;
      }

      const allGroups = [
        ...pinnedTopGroups,
        ...virtualCenterGroups.visible,
        ...pinnedBottomGroups,
      ];
      const group = allGroups.find(
        (g) =>
          targetRowIndex >= g.startRowIndex && targetRowIndex <= g.endRowIndex,
      );

      if (!group) {
        resetEditingState();
        return;
      }

      const row = group.rows[targetRowIndex - group.startRowIndex];
      const spanBucket = group.spans.get(targetColumn.key);
      const span = spanBucket?.find(
        (entry) =>
          targetRowIndex >= entry.startRow && targetRowIndex <= entry.endRow,
      );
      const spanRaw = span?.value as any;
      const spanValue =
        spanRaw && typeof spanRaw === "object" ? spanRaw : { value: spanRaw };

      const formula =
        formulaEnabled && isFormulaInput(value) ? value.trim() : null;
      const resolvedInputType = formula
        ? "formula"
        : resolveCellValueType((spanValue as any).type ?? targetColumn.type);
      const committedValue = formula
        ? value
        : typeof value === "string"
          ? coerceInputValue(value, resolvedInputType, targetColumn)
          : value;
      if (
        validationConfig?.enabled &&
        row &&
        validationConfig.trigger !== "manual" &&
        !formula
      ) {
        const columnIndex = columnIndexLookup?.get(targetColumn.key) ?? targetColIndex;
        const validationResult = validationConfig.validateCellValue(
          row,
          targetColumn,
          targetRowIndex,
          columnIndex,
          committedValue,
        );
        if (validationConfig.mode === "block" && validationResult.hasErrors) {
          setEditingState((current) => {
            const nextValidation = validationResult.state ?? null;
            if (validationStateEqual(current.validation, nextValidation)) {
              return current;
            }
            return { ...current, validation: nextValidation };
          });
          return;
        }
      }

      if (span) {
        if (
          onMergedCellsChange &&
          mergedCells.length > 0 &&
          columnIndexLookup?.has(targetColumn.key)
        ) {
          const anchorColIndex = columnIndexLookup.get(targetColumn.key)!;
          let updated: GridMergedCell[] | null = null;

          for (let i = 0; i < mergedCells.length; i += 1) {
            const cell = mergedCells[i];
            if (
              cell.startRow === group.startRowIndex &&
              cell.startCol === anchorColIndex
            ) {
              const baseValue =
                cell.value && typeof cell.value === "object"
                  ? (cell.value as any)
                  : spanValue;
              const nextType = formula
                ? "formula"
                : resolveCellValueType((baseValue as any).type ?? targetColumn.type);
              if (
                (baseValue as any).value === committedValue &&
                (baseValue as any).type === nextType
              ) {
                break;
              }
              const nextMergedValue = {
                ...baseValue,
                value: formula ? (baseValue as any).value ?? "" : committedValue,
                type: nextType,
              };
              if (formula) {
                (nextMergedValue as any).formula = formula;
              } else if ("formula" in nextMergedValue) {
                delete (nextMergedValue as any).formula;
              }
              updated = mergedCells.slice();
              updated[i] = { ...cell, value: nextMergedValue };
              break;
            }
          }

          if (updated) {
            onMergedCellsChange(updated);
          }
        }

        if (row && onCellChange) {
          const nextCellValue: any = {
            ...(spanValue ?? {}),
            value: formula ? (spanValue as any)?.value ?? "" : committedValue,
            type: formula ? "formula" : resolvedInputType,
          };
          if (formula) {
            nextCellValue.formula = formula;
          } else if ("formula" in nextCellValue) {
            delete (nextCellValue as any).formula;
          }
          onCellChange(row.id, targetColumn.key, nextCellValue);
        }
      } else if (row && onCellChange) {
        const nextCellValue: any = {
          value: formula ? "" : committedValue,
          type: formula ? "formula" : resolvedInputType,
        };
        if (formula) {
          nextCellValue.formula = formula;
        }
        onCellChange(row.id, targetColumn.key, nextCellValue);
      }

      resetEditingState();
    },
    [
      formulaEnabled,
      isCellEditing,
      pinnedTopGroups,
      virtualCenterGroups.visible,
      pinnedBottomGroups,
      visualColumns,
      visualColumnIndex,
      resolveMergedAnchor,
      resolveColumnByKey,
      isPinnedCell,
      onCellChange,
      onMergedCellsChange,
      mergedCells,
      columnIndexLookup,
      validationConfig,
      setEditingState,
      resetEditingState,
    ],
  );

  const resolveLiveValidationFor = useCallback(
    (rowIndex: number, colIndex: number, value: any) => {
      if (!validationConfig?.enabled || validationConfig.trigger !== "change") {
        return null;
      }
      if (formulaEnabled && isFormulaInput(value)) return null;

      const allGroups = [
        ...pinnedTopGroups,
        ...virtualCenterGroups.visible,
        ...pinnedBottomGroups,
      ];
      const group = allGroups.find(
        (g) => rowIndex >= g.startRowIndex && rowIndex <= g.endRowIndex,
      );
      const column = visualColumns[colIndex];

      if (!group || !column) return null;

      const row = group.rows[rowIndex - group.startRowIndex];
      if (!row) return null;

      const columnIndex = columnIndexLookup?.get(column.key) ?? colIndex;
      const validator =
        validationConfig.previewCellValue ?? validationConfig.validateCellValue;
      const resolvedValue =
        typeof value === "string"
          ? coerceInputValue(value, resolveCellValueType(column.type), column)
          : value;
      const validationResult = validator(
        row,
        column,
        rowIndex,
        columnIndex,
        resolvedValue,
      );
      return validationResult.state ?? null;
    },
    [
      formulaEnabled,
      validationConfig,
      pinnedTopGroups,
      virtualCenterGroups.visible,
      pinnedBottomGroups,
      visualColumns,
      columnIndexLookup,
    ],
  );

  const updateEditingValue = useCallback(
    (value: any, syncFormula: boolean = true) => {
      editingValueRef.current = value;

      const liveValidationEnabled =
        validationConfig?.enabled && validationConfig.trigger === "change";
      const debounceMs = Math.max(0, validationConfig?.debounceMs ?? 0);
      let nextValidation: GridValidationCellState | null | undefined;

      if (liveValidationEnabled) {
        const cell = store.getState().editing.cell;
        if (cell) {
          if (debounceMs > 0) {
            liveValidationTokenRef.current += 1;
            const token = liveValidationTokenRef.current;
            if (liveValidationTimerRef.current != null) {
              clearTimeout(liveValidationTimerRef.current);
            }
            const targetVersion = cell.version;
            liveValidationTimerRef.current = window.setTimeout(() => {
              liveValidationTimerRef.current = null;
              if (token !== liveValidationTokenRef.current) return;
              const currentCell = store.getState().editing.cell;
              if (!currentCell || currentCell.version !== targetVersion) return;
              const resolved = resolveLiveValidationFor(
                currentCell.rowIndex,
                currentCell.colIndex,
                editingValueRef.current,
              );
              setEditingState((current) => {
                if (!current.cell || current.cell.version !== targetVersion) {
                  return current;
                }
                if (validationStateEqual(current.validation, resolved)) {
                  return current;
                }
                return { ...current, validation: resolved };
              });
            }, debounceMs);
          } else {
            nextValidation = resolveLiveValidationFor(
              cell.rowIndex,
              cell.colIndex,
              value,
            );
          }
        }
      }

      setEditingState((current) => {
        const nextFormula =
          enableFormulaBar && syncFormula
            ? toFormulaDisplay(value)
            : current.formulaBarValue;
        const resolvedValidation = liveValidationEnabled
          ? debounceMs > 0
            ? current.validation
            : nextValidation === undefined
              ? current.validation
              : nextValidation
          : null;

        if (
          Object.is(current.draftValue, value) &&
          nextFormula === current.formulaBarValue &&
          validationStateEqual(current.validation, resolvedValidation)
        ) {
          return current;
        }

        return {
          ...current,
          draftValue: value,
          formulaBarValue: nextFormula,
          validation: resolvedValidation,
        };
      });
    },
    [
      enableFormulaBar,
      setEditingState,
      validationConfig,
      resolveLiveValidationFor,
      store,
    ],
  );

  const registerEditorValueListener = useCallback(
    (listener: ((value: any) => void) | null) => {
      editorListenerRef.current = listener;
    },
    [],
  );

  const onCellDbl = useCallback(
    (rowIndex: number, colIndex: number, el?: HTMLElement) => {
      const column = visualColumns[colIndex];

      if (!column) {
        onCellDoubleClick?.(rowIndex, colIndex, el);
        return;
      }

      const anchor = resolveMergedAnchor(rowIndex, column.key);
      const anchorColumn = anchor ? resolveColumnByKey(anchor.columnKey) : null;
      const useAnchor = Boolean(anchor && anchorColumn);
      const targetRowIndex = useAnchor ? anchor!.rowIndex : rowIndex;
      const targetColumnKey = useAnchor ? anchor!.columnKey : column.key;
      const targetColumn = useAnchor ? (anchorColumn as GridColumn) : column;
      const targetColIndex = useAnchor
        ? visualColumnIndex.get(targetColumnKey) ?? colIndex
        : colIndex;

      if (
        !isCellEditing ||
        targetColumn.editable === false ||
        isPinnedCell(rowIndex, column.key) ||
        isPinnedCell(targetRowIndex, targetColumn.key)
      ) {
        onCellDoubleClick?.(rowIndex, colIndex, el);
        return;
      }

      const allGroups = [
        ...pinnedTopGroups,
        ...virtualCenterGroups.visible,
        ...pinnedBottomGroups,
      ];
      const group = allGroups.find(
        (g) =>
          targetRowIndex >= g.startRowIndex && targetRowIndex <= g.endRowIndex,
      );

      if (group) {
        const row = group.rows[targetRowIndex - group.startRowIndex];
        const spanBucket = group.spans.get(targetColumn.key);
        const span = spanBucket?.find(
          (entry) =>
            targetRowIndex >= entry.startRow && targetRowIndex <= entry.endRow,
        );
        const spanVal = span?.value as any;
        const rawValue = spanVal
          ? resolveEditingValue(spanVal, formulaEnabled)
          : resolveEditingValue(row?.data[targetColumn.key], formulaEnabled);
        const valueType =
          formulaEnabled && isFormulaInput(rawValue)
            ? "formula"
            : resolveCellValueType(
                (spanVal && typeof spanVal === "object" && spanVal.type) ||
                  targetColumn.type,
              );
        const nextValidation =
          row && validationConfig?.enabled && validationConfig.trigger === "change"
            ? resolveLiveValidationFor(targetRowIndex, targetColIndex, rawValue)
            : null;
        editingValueRef.current = rawValue;
        const nextVersion = editingVersionRef.current + 1;
        editingVersionRef.current = nextVersion;
        const nextCell: EditingCellState = {
          rowIndex: targetRowIndex,
          colIndex: targetColIndex,
          columnKey: targetColumn.key,
          rowId: row?.id,
          initialValue: rawValue,
          valueType,
          version: nextVersion,
        };
        setEditingState((current) => ({
          cell: nextCell,
          draftValue: rawValue,
          formulaBarValue: enableFormulaBar
            ? toFormulaDisplay(rawValue)
            : current.formulaBarValue,
          validation:
            validationConfig?.enabled && validationConfig.trigger === "change"
              ? nextValidation
              : null,
        }));
      }

      onCellDoubleClick?.(rowIndex, colIndex, el);
    },
    [
      formulaEnabled,
      isCellEditing,
      onCellDoubleClick,
      pinnedTopGroups,
      virtualCenterGroups.visible,
      pinnedBottomGroups,
      visualColumns,
      visualColumnIndex,
      resolveMergedAnchor,
      resolveColumnByKey,
      isPinnedCell,
      enableFormulaBar,
      setEditingState,
      validationConfig,
      resolveLiveValidationFor,
    ],
  );

  const onFormulaChange = useCallback(
    (value: string) => {
      const cell = store.getState().editing.cell;
      const column = cell ? resolveColumnByKey(cell.columnKey) : undefined;
      const inputType =
        cell?.valueType === "formula"
          ? resolveCellValueType(column?.type)
          : cell?.valueType ?? "text";
      const next =
        formulaEnabled && cell
          ? coerceInputValue(value, inputType, column)
          : value;
      editingValueRef.current = next;
      editorListenerRef.current?.(next);
      setEditingState((current) => {
        if (
          current.formulaBarValue === value &&
          Object.is(current.draftValue, next)
        ) {
          return current;
        }
        return {
          ...current,
          draftValue: next,
          formulaBarValue: value,
        };
      });
    },
    [formulaEnabled, resolveColumnByKey, setEditingState, store],
  );

  const onFormulaSubmit = useCallback(() => {
    const cell = store.getState().editing.cell;
    if (!cell) return;
    const nextIndex = visualColumns.findIndex((col) => col.key === cell.columnKey);
    const visualIndex = nextIndex >= 0 ? nextIndex : cell.colIndex;
    commitEdit(cell.rowIndex, visualIndex, editingValueRef.current);
  }, [commitEdit, store, visualColumns]);

  const cancelEdit = useCallback(() => {
    resetEditingState();
  }, [resetEditingState]);

  return {
    updateEditingValue,
    registerEditorValueListener,
    onFormulaChange,
    onFormulaSubmit,
    commitEdit,
    cancelEdit,
    onCellDbl,
  };
}
