import { useCallback, useRef } from "react";

import type {
  GridColumnSelectionChangeMeta,
  GridHeaderCellSelectionMode,
  GridRow,
  GridRowSelectionChangeMeta,
  GridSelection,
} from "../../types";

type UseGridSelectionMirrorHandlersArgs = {
  applyColumnSelectionToCells: (
    keys: Set<string>,
    options: {
      mode: GridHeaderCellSelectionMode;
      includeSpans: boolean;
      anchorColumnKey?: string;
    },
  ) => void;
  applyRowSelectionToCells: (
    rows: Map<string | number, GridRow>,
    options: {
      mode: GridHeaderCellSelectionMode;
      includeSpans: boolean;
      anchorRowId?: string | number;
    },
  ) => void;
  clearSelectionRange: () => void;
  columnCellSelectionIncludeSpans: boolean;
  enableCellSelection: boolean;
  lastSourceIs: (source: "row" | "column") => boolean;
  onColumnSelectionChange?: (
    keys: string[],
    meta?: GridColumnSelectionChangeMeta,
  ) => void;
  onRowSelectionChange?: (
    selectedRowIds: (string | number)[],
    meta?: GridRowSelectionChangeMeta,
  ) => void;
  onSelectionRangeChange?: (selection: GridSelection | null) => void;
  resolvedColumnCellSelectionMode: GridHeaderCellSelectionMode;
  resolvedRowCellSelectionMode: GridHeaderCellSelectionMode;
  rowCellSelectionIncludeSpans: boolean;
  rowsById: Map<string | number, GridRow>;
  selectEntireColumnOnSelection: boolean;
  selectEntireRowOnSelection: boolean;
  selection: GridSelection | null | undefined;
  setRowSelectionIds: (selectedRowIds: (string | number)[]) => void;
};

export const useGridSelectionMirrorHandlers = ({
  applyColumnSelectionToCells,
  applyRowSelectionToCells,
  clearSelectionRange,
  columnCellSelectionIncludeSpans,
  enableCellSelection,
  lastSourceIs,
  onColumnSelectionChange,
  onRowSelectionChange,
  onSelectionRangeChange,
  resolvedColumnCellSelectionMode,
  resolvedRowCellSelectionMode,
  rowCellSelectionIncludeSpans,
  rowsById,
  selectEntireColumnOnSelection,
  selectEntireRowOnSelection,
  selection,
  setRowSelectionIds,
}: UseGridSelectionMirrorHandlersArgs) => {
  const prevColumnSelectionCountRef = useRef(0);
  const prevRowSelectionCountRef = useRef(0);

  const handleColumnSelectionChange = useCallback(
    (keys: string[], meta?: GridColumnSelectionChangeMeta) => {
      onColumnSelectionChange?.(keys, meta);

      if (!enableCellSelection) return;

      const hadColumnSelection = prevColumnSelectionCountRef.current > 0;

      if (!keys.length) {
        if (hadColumnSelection || lastSourceIs("column")) {
          clearSelectionRange();
        }
        prevColumnSelectionCountRef.current = 0;
        return;
      }

      if (selectEntireColumnOnSelection) {
        applyColumnSelectionToCells(new Set(keys), {
          mode: resolvedColumnCellSelectionMode,
          includeSpans: columnCellSelectionIncludeSpans,
          anchorColumnKey: meta?.anchorColumnKey,
        });
      } else if (hadColumnSelection && selection) {
        onSelectionRangeChange?.(selection);
      }

      prevColumnSelectionCountRef.current = keys.length;
    },
    [
      applyColumnSelectionToCells,
      clearSelectionRange,
      columnCellSelectionIncludeSpans,
      enableCellSelection,
      lastSourceIs,
      onColumnSelectionChange,
      onSelectionRangeChange,
      resolvedColumnCellSelectionMode,
      selectEntireColumnOnSelection,
      selection,
    ],
  );

  const handleRowSelectionChange = useCallback(
    (
      selectedRowIds: (string | number)[],
      meta?: GridRowSelectionChangeMeta,
    ) => {
      setRowSelectionIds(selectedRowIds);
      onRowSelectionChange?.(selectedRowIds, meta);

      if (!enableCellSelection) return;

      const hadRowSelection = prevRowSelectionCountRef.current > 0;

      if (!selectedRowIds.length) {
        if (hadRowSelection || lastSourceIs("row")) {
          clearSelectionRange();
        }
        prevRowSelectionCountRef.current = 0;
        return;
      }

      if (selectEntireRowOnSelection) {
        const map = new Map<string | number, GridRow>();
        selectedRowIds.forEach((id) => {
          const row = rowsById.get(id);
          if (row) map.set(id, row);
        });
        applyRowSelectionToCells(map, {
          mode: resolvedRowCellSelectionMode,
          includeSpans: rowCellSelectionIncludeSpans,
          anchorRowId: meta?.anchorRowId,
        });
      } else if (hadRowSelection && selection) {
        onSelectionRangeChange?.(selection);
      }

      prevRowSelectionCountRef.current = selectedRowIds.length;
    },
    [
      applyRowSelectionToCells,
      clearSelectionRange,
      enableCellSelection,
      lastSourceIs,
      onRowSelectionChange,
      onSelectionRangeChange,
      resolvedRowCellSelectionMode,
      rowCellSelectionIncludeSpans,
      rowsById,
      selectEntireRowOnSelection,
      selection,
      setRowSelectionIds,
    ],
  );

  return {
    handleColumnSelectionChange,
    handleRowSelectionChange,
  };
};
