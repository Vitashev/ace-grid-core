import { useState, useCallback, useMemo } from "react";
import type { RefObject } from "react";
import type {
  GridPinProps,
  GridReorderProps,
  GridRow,
  GridRowGroup,
  GridRowGroupingProps,
  GridRowDragPayload,
  GridRowExternalDropEvent,
  GridRowGroupingValueMeta,
} from "../../../types";
import {
  ACE_GRID_ROW_DRAG_MIME,
  type GridRowDropEdge,
} from "../types";
import { useDnDAutoScroll } from "./useDnDAutoScroll";

export type RowDragState = {
  isDragging: boolean;
  draggedRowId: string | number | null;
  draggedRowIds: (string | number)[];
  dragOverRowId: string | number | null;
  dragOverPosition: GridRowDropEdge | null;
  draggedKind: "rows" | "group" | null;
};

type RowDnDOptions = {
  allowAdvancedReorder?: boolean;
};

export function useRowDnD(
  isRowReorder: boolean,
  selectedRowIds: (string | number)[],
  rowHasSpans: (id: string | number) => boolean,
  groupByRowId: Map<string | number, GridRowGroup>,
  rows: GridRow[],
  rowsRef: React.MutableRefObject<GridRow[]>,
  rowsById: Map<string | number, GridRow>,
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] },
  dragLeaveTimeoutRef: React.MutableRefObject<number | null>,
  containerRef: RefObject<HTMLElement>,
  onPinAndPositionRow: GridPinProps["onPinAndPositionRow"],
  onPinMultipleRowsAtPosition: GridPinProps["onPinMultipleRowsAtPosition"],
  onPinRowAtPosition: GridPinProps["onPinRowAtPosition"],
  onPinRow: GridPinProps["onPinRow"],
  onPinnedRowReorder: GridPinProps["onPinnedRowReorder"],
  onMultiRowReorder: GridReorderProps["onMultiRowReorder"],
  onReorderMultiplePinnedRows: GridPinProps["onReorderMultiplePinnedRows"],
  onRowReorder: GridReorderProps["onRowReorder"],
  rowGroupingHandlers?: {
    moveRowsToGroup?: GridRowGroupingProps["onMoveRowsToGroup"];
    reorderGroups?: GridRowGroupingProps["onReorderGroups"];
  },
  rowDragSourceId?: string,
  onRowExternalDrop?: (event: GridRowExternalDropEvent) => void,
  options?: RowDnDOptions
) {
  const allowAdvancedReorder = options?.allowAdvancedReorder ?? true;
  const [rowDragState, setRowDragState] = useState<RowDragState>({
    isDragging: false,
    draggedRowId: null,
    draggedRowIds: [],
    dragOverRowId: null,
    dragOverPosition: null,
    draggedKind: null,
  });

  const resetDragState = useCallback(() => {
    setRowDragState({
      isDragging: false,
      draggedRowId: null,
      draggedRowIds: [],
      dragOverRowId: null,
      dragOverPosition: null,
      draggedKind: null,
    });
  }, []);

  const {
    start: startAutoScroll,
    stop: stopAutoScroll,
    update: updateAutoScroll,
  } = useDnDAutoScroll(containerRef);

  // Fast membership for pinned zones
  const pinnedTopSet = useMemo(
    () => new Set(pinnedRows.top.map(String)),
    [pinnedRows.top]
  );
  const pinnedBottomSet = useMemo(
    () => new Set(pinnedRows.bottom.map(String)),
    [pinnedRows.bottom]
  );
  const isTop = useCallback(
    (id: string | number) => pinnedTopSet.has(String(id)),
    [pinnedTopSet]
  );
  const isBottom = useCallback(
    (id: string | number) => pinnedBottomSet.has(String(id)),
    [pinnedBottomSet]
  );
  const isPinned = useCallback(
    (id: string | number) => isTop(id) || isBottom(id),
    [isTop, isBottom]
  );

  // Fast row index lookup for current render
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < rows.length; i++) m.set(String(rows[i].id), i);
    return m;
  }, [rows]);

  const findGroup = useCallback(
    (rowId: string | number) => groupByRowId.get(rowId),
    [groupByRowId]
  );

  const wouldBreakSpanIntegrity = useCallback(
    (
      draggedIds: (string | number)[],
      targetId: string | number,
      pos: "before" | "after"
    ) => {
      // any dragged row has spans -> blocked
      for (let i = 0; i < draggedIds.length; i++) {
        if (rowHasSpans(draggedIds[i])) return true;
      }
      const tg = findGroup(targetId);
      if (tg && tg.spans.size > 0 && tg.rows.length > 1) {
        const idx = tg.rows.findIndex((r) => r.id === targetId);
        const atEdge =
          (pos === "before" && idx === 0) ||
          (pos === "after" && idx === tg.rows.length - 1);
        return !atEdge;
      }
      return false;
    },
    [rowHasSpans, findGroup]
  );

  const getRowObject = useCallback(
    (rowId: string | number) =>
      rowsById.get(rowId) ?? rowsById.get(String(rowId)),
    [rowsById]
  );

  type GroupingTarget =
    | {
        kind: "group";
        path: string;
        values: GridRowGroupingValueMeta[];
        level: number;
        rowIds: (string | number)[];
      }
    | {
        kind: "row";
        path: string;
        values: GridRowGroupingValueMeta[];
      };

  const resolveGroupingForRow = useCallback(
    (rowId: string | number): GroupingTarget | null => {
      const row = getRowObject(rowId);
      if (!row) return null;
      if (row.meta?.group) {
        return {
          kind: "group",
          path: row.meta.group.path,
          values: row.meta.group.valueChain ?? [],
          level: row.meta.group.level,
          rowIds: row.meta.group.rowIds ?? [],
        };
      }
      if (row.meta?.groupingPath) {
        return {
          kind: "row",
          path: row.meta.groupingPath.path,
          values: row.meta.groupingPath.levels ?? [],
        };
      }
      return null;
    },
    [getRowObject]
  );

  const readExternalPayload = useCallback((event: React.DragEvent) => {
    const raw = event.dataTransfer?.getData(ACE_GRID_ROW_DRAG_MIME);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as GridRowDragPayload;
      const rowIds = Array.isArray(parsed?.rowIds) ? parsed.rowIds : [];
      if (!rowIds.length) return null;
      const rows = Array.isArray(parsed?.rows) ? parsed.rows : [];
      return {
        rowIds,
        rows,
        sourceId: parsed?.sourceId,
      } as GridRowDragPayload;
    } catch {
      return null;
    }
  }, []);

  const resolveDropEdge = useCallback((event: React.DragEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = event.clientY - rect.top;
    const half = rect.height / 2;
    const edgeBuffer = 8;
    const pos: GridRowDropEdge = relY < half ? "top" : "bottom";
    return relY < edgeBuffer
      ? "top"
      : relY > rect.height - edgeBuffer
      ? "bottom"
      : pos;
  }, []);

  const onRowDragStart = useCallback(
    (e: React.DragEvent, rowId: string) => {
      if (!isRowReorder || rowHasSpans(rowId)) {
        e.preventDefault();
        return;
      }

      const rowObject = getRowObject(rowId);
      const isGroupRow = Boolean(rowObject?.meta?.group);
      if (isGroupRow && !allowAdvancedReorder) {
        e.preventDefault();
        return;
      }
      if (isGroupRow && !rowGroupingHandlers?.reorderGroups) {
        e.preventDefault();
        return;
      }

      const g = findGroup(rowId);
      if (g && g.rows.length > 1 && !isGroupRow) {
        // disallow dragging merged data groups
        e.preventDefault();
        return;
      }

      // Anchor zone
      const anchorPinned = isPinned(rowId);

      // Build dragged set
      let toDrag: (string | number)[] = [];
      if (isGroupRow) {
        toDrag = [rowId];
      } else {
        const selection =
          allowAdvancedReorder &&
          selectedRowIds.length &&
          selectedRowIds.includes(rowId)
            ? selectedRowIds
            : [rowId];

        for (let i = 0; i < selection.length; i++) {
          const id = selection[i];
          if (isPinned(id) === anchorPinned) toDrag.push(id);
        }
      }

      if (!toDrag.length) {
        e.preventDefault();
        return;
      }

      // If any has spans, block
      for (let i = 0; i < toDrag.length; i++) {
        if (rowHasSpans(toDrag[i])) {
          e.preventDefault();
          return;
        }
      }

      setRowDragState({
        isDragging: true,
        draggedRowId: rowId,
        draggedRowIds: toDrag,
        dragOverRowId: null,
        dragOverPosition: null,
        draggedKind: isGroupRow ? "group" : "rows",
      });

      startAutoScroll();

      if (!isGroupRow) {
        const dragRows = toDrag
          .map((id) => getRowObject(id))
          .filter(Boolean) as GridRow[];
        try {
          const payload: GridRowDragPayload = {
            rowIds: toDrag,
            rows: dragRows,
            sourceId: rowDragSourceId,
          };
          e.dataTransfer.setData(ACE_GRID_ROW_DRAG_MIME, JSON.stringify(payload));
        } catch (error) {
          void error;
        }
      }

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(toDrag));
    },
    [
      isRowReorder,
      rowHasSpans,
      findGroup,
      selectedRowIds,
      isPinned,
      startAutoScroll,
      getRowObject,
      rowGroupingHandlers,
      rowDragSourceId,
      allowAdvancedReorder,
    ]
  );

  const onRowDragOver = useCallback(
    (e: React.DragEvent, rowId: string) => {
      const isInternal = rowDragState.isDragging && rowDragState.draggedRowId;
      const dragTypes = Array.from(e.dataTransfer?.types ?? []);
      const canExternalDrop =
        allowAdvancedReorder &&
        !isInternal &&
        Boolean(onRowExternalDrop) &&
        (!dragTypes.length || dragTypes.includes(ACE_GRID_ROW_DRAG_MIME));

      if (!isInternal) {
        if (!canExternalDrop) return;
        startAutoScroll();
      }

      updateAutoScroll(e.clientX, e.clientY);

      const finalPos = resolveDropEdge(e);

      const dropSide = finalPos === "top" ? "before" : "after";

      // Blocked by spans?
      if (isInternal) {
        if (wouldBreakSpanIntegrity(rowDragState.draggedRowIds, rowId, dropSide))
          return;

        // Prevent dropping a multi-selection on itself
        if (
          rowDragState.draggedRowIds.length > 1 &&
          rowDragState.draggedRowIds.includes(rowId)
        )
          return;
      }

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      // Avoid state churn
      setRowDragState((s) =>
        s.dragOverRowId === rowId && s.dragOverPosition === finalPos
          ? s
          : { ...s, dragOverRowId: rowId, dragOverPosition: finalPos }
      );

      // clear any pending leave reset
      if (dragLeaveTimeoutRef.current) {
        clearTimeout(dragLeaveTimeoutRef.current);
        dragLeaveTimeoutRef.current = null;
      }
    },
    [
      rowDragState,
      wouldBreakSpanIntegrity,
      updateAutoScroll,
      dragLeaveTimeoutRef,
      onRowExternalDrop,
      startAutoScroll,
      resolveDropEdge,
      allowAdvancedReorder,
    ]
  );

  const onRowDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!rowDragState.isDragging) {
        stopAutoScroll();
      }
      if (dragLeaveTimeoutRef.current !== null) {
        window.clearTimeout(dragLeaveTimeoutRef.current);
        dragLeaveTimeoutRef.current = null;
      }
      const el = e.currentTarget as HTMLElement | null;
      const { clientX: x, clientY: y } = e;
      if (!el) {
        setRowDragState((s) =>
          s.dragOverRowId === null && s.dragOverPosition === null
            ? s
            : { ...s, dragOverRowId: null, dragOverPosition: null }
        );
        return;
      }
      const { left, right, top, bottom } = el.getBoundingClientRect();

      dragLeaveTimeoutRef.current = window.setTimeout(() => {
        if (!el || !el.isConnected) {
          setRowDragState((s) =>
            s.dragOverRowId === null && s.dragOverPosition === null
              ? s
              : { ...s, dragOverRowId: null, dragOverPosition: null }
          );
          dragLeaveTimeoutRef.current = null;
          return;
        }
        const tol = 8;
        const reallyLeft =
          x < left - tol ||
          x > right + tol ||
          y < top - tol ||
          y > bottom + tol;

        if (reallyLeft) {
          setRowDragState((s) =>
            s.dragOverRowId === null && s.dragOverPosition === null
              ? s
              : { ...s, dragOverRowId: null, dragOverPosition: null }
          );
        }
        dragLeaveTimeoutRef.current = null;
      }, 15);
    },
    [dragLeaveTimeoutRef, rowDragState.isDragging, stopAutoScroll]
  );

  const onRowDrop = useCallback(
    (e: React.DragEvent, targetRowId: string) => {
      e.preventDefault();
      const isInternal = rowDragState.isDragging && rowDragState.draggedRowId;
      if (!isInternal) {
        stopAutoScroll();
        if (!allowAdvancedReorder) {
          resetDragState();
          return;
        }
        const payload = readExternalPayload(e);
        if (payload && onRowExternalDrop) {
          const edge = rowDragState.dragOverPosition ?? resolveDropEdge(e);
          const pos: "before" | "after" = edge === "top" ? "before" : "after";
          const targetIndex = indexById.get(String(targetRowId)) ?? -1;
          const targetSection = isTop(targetRowId)
            ? "top"
            : isBottom(targetRowId)
            ? "bottom"
            : "center";
          onRowExternalDrop({
            payload,
            targetRowId,
            targetIndex,
            position: pos,
            targetSection,
          });
        }
        resetDragState();
        return;
      }
      stopAutoScroll();

      const pos: "before" | "after" =
        rowDragState.dragOverPosition === "top" ? "before" : "after";

      const targetIdx = indexById.get(String(targetRowId)) ?? -1;
      if (
        targetIdx === -1 ||
        rowDragState.draggedRowIds.length === 0 ||
        rowDragState.draggedRowIds.includes(targetRowId)
      ) {
        resetDragState();
        return;
      }

      if (
        wouldBreakSpanIntegrity(rowDragState.draggedRowIds, targetRowId, pos)
      ) {
        resetDragState();
        return;
      }

      const draggedIds = rowDragState.draggedRowIds.map(String);
      const allPinned = draggedIds.every(isPinned);
      const allCenter = draggedIds.every((id) => !isPinned(id));
      const mixed = !allPinned && !allCenter;

      if (!allowAdvancedReorder) {
        if (
          rowDragState.draggedKind !== "rows" ||
          rowDragState.draggedRowIds.length !== 1 ||
          isPinned(rowDragState.draggedRowIds[0]) ||
          isPinned(targetRowId)
        ) {
          resetDragState();
          return;
        }

        const fromIndex =
          indexById.get(String(rowDragState.draggedRowId)) ?? -1;

        if (fromIndex !== -1) {
          let to = pos === "after" ? targetIdx + 1 : targetIdx;
          if (fromIndex < to) to -= 1;
          if (fromIndex !== to) onRowReorder?.(fromIndex, to);
        }

        resetDragState();
        return;
      }

      if (
        rowGroupingHandlers?.reorderGroups &&
        rowDragState.draggedKind === "group" &&
        rowDragState.draggedRowId != null
      ) {
        const sourceInfo = resolveGroupingForRow(rowDragState.draggedRowId);
        if (sourceInfo && sourceInfo.kind === "group") {
          const targetInfo = resolveGroupingForRow(targetRowId);
          let targetPath: string | null = null;
          if (
            targetInfo &&
            targetInfo.kind === "group" &&
            targetInfo.level === sourceInfo.level
          ) {
            targetPath = targetInfo.path;
          } else if (targetInfo && targetInfo.kind === "row") {
            const match = targetInfo.values.find(
              (entry) => entry.level === sourceInfo.level
            );
            if (match) targetPath = match.path;
          }
          if (targetPath && targetPath !== sourceInfo.path) {
            rowGroupingHandlers.reorderGroups({
              sourcePath: sourceInfo.path,
              targetPath,
              level: sourceInfo.level,
              position: pos,
              sourceValues: sourceInfo.values,
              targetValues: targetInfo?.values,
              sourceGroupRowIds: sourceInfo.rowIds,
              targetGroupRowIds:
                targetInfo?.kind === "group" ? targetInfo.rowIds : undefined,
            });
            resetDragState();
            return;
          }
        }
      }

      if (
        rowGroupingHandlers?.moveRowsToGroup &&
        rowDragState.draggedKind !== "group"
      ) {
        const targetInfo = resolveGroupingForRow(targetRowId);
        if (targetInfo && targetInfo.values.length) {
          const deepestLevel =
            targetInfo.kind === "group"
              ? targetInfo.level
              : targetInfo.values[targetInfo.values.length - 1]?.level ?? 0;
          const sourceInfo =
            rowDragState.draggedRowId != null
              ? resolveGroupingForRow(rowDragState.draggedRowId)
              : null;
          rowGroupingHandlers.moveRowsToGroup({
            rowIds: rowDragState.draggedRowIds,
            sourcePath:
              sourceInfo && sourceInfo.kind === "row"
                ? sourceInfo.path
                : undefined,
            targetPath: targetInfo.path,
            targetValues: targetInfo.values,
            targetLevel: deepestLevel,
            dropPosition: pos,
            dropOverRowId:
              targetInfo.kind === "row" ? targetRowId : undefined,
            targetGroupRowIds:
              targetInfo.kind === "group" ? targetInfo.rowIds : undefined,
          });
          resetDragState();
          return;
        }
      }

      const targetIsPinned = isPinned(targetRowId);
      const side: "top" | "bottom" = isTop(targetRowId) ? "top" : "bottom";

      if (mixed) {
        resetDragState();
        return;
      }

      // Schedule helper to avoid flicker between unpin & reorder
      const afterBeforePaint = (fn: () => void) => {
        if (typeof requestAnimationFrame === "function")
          requestAnimationFrame(fn);
        else setTimeout(fn, 0);
      };

      if (allCenter && targetIsPinned) {
        // center -> pinned
        const base =
          (side === "top"
            ? pinnedRows.top.indexOf(String(targetRowId))
            : pinnedRows.bottom.indexOf(String(targetRowId))) +
          (pos === "after" ? 1 : 0);

        if (draggedIds.length === 1 && onPinAndPositionRow) {
          onPinAndPositionRow(draggedIds[0], String(targetRowId), side, pos);
        } else if (onPinMultipleRowsAtPosition) {
          onPinMultipleRowsAtPosition(
            draggedIds.map((id, i) => ({ rowId: id, side, index: base + i }))
          );
        } else if (onPinRowAtPosition) {
          draggedIds.forEach((id, i) => onPinRowAtPosition(id, side, base + i));
        } else if (onPinRow) {
          draggedIds.forEach((id) => onPinRow(id, side));
          if (onPinnedRowReorder && draggedIds.length === 1) {
            onPinnedRowReorder(draggedIds[0], String(targetRowId), side, pos);
          }
        }
      } else if (allPinned && !targetIsPinned) {
        // pinned -> center
        const draggedCopy = draggedIds.slice();
        const targetCopy = String(targetRowId);
        const posCopy = pos;

        if (onPinRow) draggedCopy.forEach((id) => onPinRow(id, null));

        afterBeforePaint(() => {
          const latest = rowsRef.current;
          if (!latest || !latest.length) return;

          // quick map on demand for current list
          const nowIndex = new Map<string, number>();
          for (let i = 0; i < latest.length; i++)
            nowIndex.set(String(latest[i].id), i);

          const targetNow = nowIndex.get(targetCopy);
          if (targetNow == null) return;

          if (onMultiRowReorder && draggedCopy.length > 1) {
            onMultiRowReorder(draggedCopy, targetNow, posCopy);
          } else if (onRowReorder) {
            const baseTo = posCopy === "after" ? targetNow + 1 : targetNow;
            // maintain relative order even via single-callback fallback
            for (let i = 0; i < draggedCopy.length; i++) {
              const id = draggedCopy[i];
              const from = nowIndex.get(id);
              if (from == null) continue;
              const to = baseTo + i;
              onRowReorder(from, to > from ? to - 1 : to);
            }
          }
        });
      } else if (allPinned && targetIsPinned) {
        // pinned -> pinned
        if (draggedIds.length === 1 && onPinnedRowReorder) {
          onPinnedRowReorder(draggedIds[0], String(targetRowId), side, pos);
        } else if (onReorderMultiplePinnedRows) {
          onReorderMultiplePinnedRows(
            draggedIds,
            String(targetRowId),
            side,
            pos
          );
        }
      } else {
        // center -> center
        if (draggedIds.length > 1 && onMultiRowReorder) {
          onMultiRowReorder(draggedIds, targetIdx, pos);
        } else if (onRowReorder) {
          const fromIndex =
            indexById.get(String(rowDragState.draggedRowId)) ?? -1;

          if (fromIndex !== -1) {
            // Compute intended destination (before/after the target)
            let to = pos === "after" ? targetIdx + 1 : targetIdx;

            // If we're moving downward, removal shifts the target left by 1
            if (fromIndex < to) to -= 1;

            // Avoid no-op churn
            if (fromIndex !== to) onRowReorder(fromIndex, to);
          }
        }
      }

      // Reset drag UI state
      resetDragState();
    },
    [
      rowDragState,
      stopAutoScroll,
      indexById,
      wouldBreakSpanIntegrity,
      isPinned,
      isTop,
      isBottom,
      pinnedRows,
      onPinAndPositionRow,
      onPinMultipleRowsAtPosition,
      onPinRowAtPosition,
      onPinRow,
      onPinnedRowReorder,
      onReorderMultiplePinnedRows,
      onMultiRowReorder,
      onRowReorder,
      rowsRef,
      rowGroupingHandlers,
      resolveGroupingForRow,
      resetDragState,
      readExternalPayload,
      onRowExternalDrop,
      resolveDropEdge,
      allowAdvancedReorder,
    ]
  );

  const onRowDragEnd = useCallback(() => {
    stopAutoScroll();
    setRowDragState((s) =>
      s.isDragging ||
      s.draggedRowId !== null ||
      s.draggedRowIds.length ||
      s.dragOverRowId !== null ||
      s.dragOverPosition !== null
        ? {
            isDragging: false,
            draggedRowId: null,
            draggedRowIds: [],
            dragOverRowId: null,
            dragOverPosition: null,
            draggedKind: null,
          }
        : s
    );
  }, [stopAutoScroll]);

  return {
    rowDragState,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
  };
}
