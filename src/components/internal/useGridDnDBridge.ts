import { useCallback, type MutableRefObject, type RefObject } from "react";

import type {
  GridColumnReorderModule,
  GridRowReorderModule,
} from "../../runtime/modules";
import type {
  GridColumn,
  GridPinProps,
  GridPinnedColumns,
  GridPinnedRows,
  GridReorderProps,
  GridRow,
  GridRowExternalDropEvent,
  GridRowGroup,
  GridRowGroupingProps,
} from "../../types";
import type { ColumnLeafNode, ColumnGroupDropPlacement } from "../../features/column-groups";

type UseGridDnDBridgeArgs = {
  clearSelectionRange: () => void;
  colIndex: Map<string, number>;
  columnLeafByKey: Map<string, ColumnLeafNode>;
  columns: GridColumn[];
  columnsWithAnySpan: Set<string>;
  containerRef: RefObject<HTMLElement>;
  doPinColumn: (key: string, side: "left" | "right" | null) => void;
  dragLeaveTimeoutRef: MutableRefObject<number | null>;
  effectiveGroupByRowId: Map<string | number, GridRowGroup>;
  effectivePinnedRows: GridPinnedRows;
  effectiveRowHasSpans: (id: string | number) => boolean;
  effectiveRowReorder: boolean;
  isColReorder: boolean;
  isGroupBoundaryBlocked: (l: string | null, r: string | null) => boolean;
  isMergeBoundaryBlocked: (l: string | null, r: string | null) => boolean;
  leftPinnedSet: Set<string>;
  marriedGroupColumns: Map<string, string[]>;
  moveColumnsWithinGroups: (
    keys: string[],
    targetKey: string,
    position: "before" | "after",
  ) => boolean;
  moveGroupWithinGroups: (
    groupId: string,
    targetGroupId: string,
    placement: ColumnGroupDropPlacement,
    insideIndex?: number | null,
  ) => boolean;
  onColumnReorder: GridReorderProps["onColumnReorder"];
  onMultiColumnReorder: GridReorderProps["onMultiColumnReorder"];
  onMultiRowReorder: GridReorderProps["onMultiRowReorder"];
  onPinAndPositionColumn: GridPinProps["onPinAndPositionColumn"];
  onPinAndPositionRow: GridPinProps["onPinAndPositionRow"];
  onPinColumnAtPosition: GridPinProps["onPinColumnAtPosition"];
  onPinMultipleRowsAtPosition: GridPinProps["onPinMultipleRowsAtPosition"];
  onPinRow: GridPinProps["onPinRow"];
  onPinRowAtPosition: GridPinProps["onPinRowAtPosition"];
  onPinnedColumnReorder: GridPinProps["onPinnedColumnReorder"];
  onPinnedRowReorder: GridPinProps["onPinnedRowReorder"];
  onReorderMultiplePinnedRows: GridPinProps["onReorderMultiplePinnedRows"];
  onRowExternalDrop?: (event: GridRowExternalDropEvent) => void;
  onRowReorder: GridReorderProps["onRowReorder"];
  onUpdateColumnOrder: GridReorderProps["onUpdateColumnOrder"];
  pinnedColumns: GridPinnedColumns;
  pinnedSet: Set<string>;
  columnReorderModule: Pick<GridColumnReorderModule, "useColumnDnD">;
  advancedColumnReorderEnabled: boolean;
  rowReorderModule: Pick<GridRowReorderModule, "useRowDnD">;
  advancedRowReorderEnabled: boolean;
  rightPinnedSet: Set<string>;
  rowDragSourceId?: string;
  rowGroupingDnDHandlers?: {
    moveRowsToGroup?: GridRowGroupingProps["onMoveRowsToGroup"];
    reorderGroups?: GridRowGroupingProps["onReorderGroups"];
  };
  rows: GridRow[];
  rowsById: Map<string | number, GridRow>;
  rowsRef: MutableRefObject<GridRow[]>;
  selectedColumnKeys: string[];
  selectedRowIds: (string | number)[];
};

export const useGridDnDBridge = ({
  clearSelectionRange,
  colIndex,
  columnLeafByKey,
  columns,
  columnsWithAnySpan,
  containerRef,
  doPinColumn,
  dragLeaveTimeoutRef,
  effectiveGroupByRowId,
  effectivePinnedRows,
  effectiveRowHasSpans,
  effectiveRowReorder,
  isColReorder,
  isGroupBoundaryBlocked,
  isMergeBoundaryBlocked,
  leftPinnedSet,
  marriedGroupColumns,
  moveColumnsWithinGroups,
  moveGroupWithinGroups,
  onColumnReorder,
  onMultiColumnReorder,
  onMultiRowReorder,
  onPinAndPositionColumn,
  onPinAndPositionRow,
  onPinColumnAtPosition,
  onPinMultipleRowsAtPosition,
  onPinRow,
  onPinRowAtPosition,
  onPinnedColumnReorder,
  onPinnedRowReorder,
  onReorderMultiplePinnedRows,
  onRowExternalDrop,
  onRowReorder,
  onUpdateColumnOrder,
  pinnedColumns,
  pinnedSet,
  columnReorderModule,
  advancedColumnReorderEnabled,
  rowReorderModule,
  advancedRowReorderEnabled,
  rightPinnedSet,
  rowDragSourceId,
  rowGroupingDnDHandlers,
  rows,
  rowsById,
  rowsRef,
  selectedColumnKeys,
  selectedRowIds,
}: UseGridDnDBridgeArgs) => {
  const getLeafNode = useCallback(
    (key: string) => columnLeafByKey.get(key),
    [columnLeafByKey],
  );

  const {
    dragState,
    columnHasSpans,
    onColDragStart,
    onColDragOver,
    onColDragLeave,
    onColDrop,
    onColDragEnd,
    onGroupDragStart,
    onGroupDragOver,
    onGroupDragLeave,
    onGroupDrop,
  } = columnReorderModule.useColumnDnD(
    isColReorder,
    columnsWithAnySpan,
    colIndex,
    columns,
    pinnedColumns,
    leftPinnedSet,
    rightPinnedSet,
    pinnedSet,
    isMergeBoundaryBlocked,
    isGroupBoundaryBlocked,
    marriedGroupColumns,
    getLeafNode,
    moveColumnsWithinGroups,
    moveGroupWithinGroups,
    onUpdateColumnOrder,
    onMultiColumnReorder,
    onColumnReorder,
    onPinnedColumnReorder,
    onPinColumnAtPosition,
    onPinAndPositionColumn,
    doPinColumn,
    selectedColumnKeys,
    containerRef,
    { allowAdvancedReorder: advancedColumnReorderEnabled },
  );

  const {
    rowDragState,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
  } = rowReorderModule.useRowDnD(
    effectiveRowReorder,
    selectedRowIds,
    effectiveRowHasSpans,
    effectiveGroupByRowId,
    rows,
    rowsRef,
    rowsById,
    effectivePinnedRows,
    dragLeaveTimeoutRef,
    containerRef,
    advancedRowReorderEnabled ? onPinAndPositionRow : undefined,
    advancedRowReorderEnabled ? onPinMultipleRowsAtPosition : undefined,
    advancedRowReorderEnabled ? onPinRowAtPosition : undefined,
    advancedRowReorderEnabled ? onPinRow : undefined,
    advancedRowReorderEnabled ? onPinnedRowReorder : undefined,
    advancedRowReorderEnabled ? onMultiRowReorder : undefined,
    advancedRowReorderEnabled ? onReorderMultiplePinnedRows : undefined,
    onRowReorder,
    advancedRowReorderEnabled ? rowGroupingDnDHandlers : undefined,
    advancedRowReorderEnabled ? rowDragSourceId : undefined,
    advancedRowReorderEnabled ? onRowExternalDrop : undefined,
    { allowAdvancedReorder: advancedRowReorderEnabled },
  );

  const handleColDragStart = useCallback(
    (event: React.DragEvent, key: string) => {
      clearSelectionRange();
      onColDragStart(event, key);
    },
    [clearSelectionRange, onColDragStart],
  );

  const handleRowDragStart = useCallback(
    (event: React.DragEvent, rowId: string) => {
      clearSelectionRange();
      onRowDragStart(event, rowId);
    },
    [clearSelectionRange, onRowDragStart],
  );

  return {
    dragState,
    columnHasSpans,
    onColDragOver,
    onColDragLeave,
    onColDrop,
    onColDragEnd,
    onGroupDragStart,
    onGroupDragOver,
    onGroupDragLeave,
    onGroupDrop,
    rowDragState,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
    handleColDragStart,
    handleRowDragStart,
  };
};
