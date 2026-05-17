import { useState, useCallback, useMemo } from "react";
import type { RefObject } from "react";
import type {
  GridColumn,
  GridReorderProps,
  GridPinProps,
} from "../../../types";
import { safeRect } from "../../../components/gridUtils";
import type { GridColumnDropEdge, GridDragSide } from "../types";
import { isSystemCol } from "../../cell-selection";
import { useDnDAutoScroll } from "./useDnDAutoScroll";
import { useColumnGroupNodeDnD } from "./useColumnGroupNodeDnD";
import type {
  ColumnGroupNode,
  ColumnLeafNode,
  ColumnGroupDropPlacement,
} from "../../column-groups";

/** O(n) reorder with O(1) membership checks via Set */
export type ColumnGroupChildMeta =
  | { kind: "group"; id: string; leafKeys: string[]; width: number }
  | { kind: "leaf"; key: string; leafKeys: string[]; width: number };

export type ColumnGroupDragMeta = {
  columnKeys: string[];
  groupId: string;
  depth: number;
  parentGroupId: string | null;
  childNodes: ColumnGroupChildMeta[];
  path: string[];
};

type DragState = {
  isDragging: boolean;
  draggedColumnKey: string | null;
  draggedColumnKeys: string[];
  dragOverColumnKey: string | null;
  dragOverPosition: GridColumnDropEdge | null;
  draggedGroupId: string | null;
  draggedGroupDepth: number | null;
  draggedGroupParentId: string | null;
  dragOverGroupId: string | null;
  groupDropPlacement: ColumnGroupDropPlacement;
  groupDropInsideIndex: number | null;
  draggedGroupPath: string[];
};

const createInitialDragState = (): DragState => ({
  isDragging: false,
  draggedColumnKey: null,
  draggedColumnKeys: [],
  dragOverColumnKey: null,
  dragOverPosition: null,
  draggedGroupId: null,
  draggedGroupDepth: null,
  draggedGroupParentId: null,
  dragOverGroupId: null,
  groupDropPlacement: "before",
  groupDropInsideIndex: null,
  draggedGroupPath: [],
});

const reorderOrderArray = (
  order: string[],
  keys: string[],
  targetKey: string,
  pos: "before" | "after"
) => {
  const removal = new Set(keys);
  const remaining: string[] = [];
  for (let i = 0; i < order.length; i++) {
    const k = order[i];
    if (!removal.has(k)) remaining.push(k);
  }
  const at =
    Math.max(0, remaining.indexOf(targetKey)) + (pos === "after" ? 1 : 0);
  // build once; avoid multiple slice calls
  const final = new Array<string>(remaining.length + keys.length);
  let w = 0;
  for (let i = 0; i < at; i++) final[w++] = remaining[i];
  for (let i = 0; i < keys.length; i++) final[w++] = keys[i];
  for (let i = at; i < remaining.length; i++) final[w++] = remaining[i];
  return final;
};

export function useColumnDnD(
  isColReorder: boolean,
  columnsWithAnySpan: Set<string>,
  colIndex: Map<string, number>,
  columns: GridColumn[],
  pinnedColumns: { left: string[]; right: string[] },
  leftPinnedSet: Set<string>,
  rightPinnedSet: Set<string>,
  pinnedSet: Set<string>,
  isMergeBoundaryBlocked: (l: string | null, r: string | null) => boolean,
  isGroupBoundaryBlocked: (l: string | null, r: string | null) => boolean,
  marriedGroupColumns: Map<string, string[]>,
  getLeafNode: (key: string) => ColumnLeafNode | undefined,
  moveColumnsWithinGroups: (
    keys: string[],
    targetKey: string,
    position: "before" | "after"
  ) => boolean,
  moveGroupWithinGroups: (
    groupId: string,
    targetGroupId: string,
    placement: ColumnGroupDropPlacement,
    insideIndex?: number | null
  ) => boolean,
  onUpdateColumnOrder: GridReorderProps["onUpdateColumnOrder"],
  onMultiColumnReorder: GridReorderProps["onMultiColumnReorder"],
  onColumnReorder: GridReorderProps["onColumnReorder"],
  onPinnedColumnReorder: GridPinProps["onPinnedColumnReorder"],
  onPinColumnAtPosition: GridPinProps["onPinColumnAtPosition"],
  onPinAndPositionColumn: GridPinProps["onPinAndPositionColumn"],
  onPinColumn: GridPinProps["onPinColumn"],
  selectedColumnKeys: string[],
  containerRef: RefObject<HTMLElement>,
  options: { allowAdvancedReorder?: boolean } = {}
) {
  const allowAdvancedReorder = options.allowAdvancedReorder !== false;
  const [dragState, setDragState] = useState<DragState>(() =>
    createInitialDragState()
  );

  const {
    start: startAutoScroll,
    stop: stopAutoScroll,
    update: updateAutoScroll,
  } = useDnDAutoScroll(containerRef);

  const columnHasSpans = useCallback(
    (key: string) => columnsWithAnySpan.has(key),
    [columnsWithAnySpan]
  );

  const resolveLeafParentId = useCallback(
    (key: string) => getLeafNode(key)?.parent?.id ?? null,
    [getLeafNode]
  );

  const groupById = useMemo(() => {
    const map = new Map<string, ColumnGroupNode>();
    for (let i = 0; i < columns.length; i += 1) {
      const leaf = getLeafNode(columns[i].key);
      let parent = leaf?.parent;
      while (parent) {
        if (!map.has(parent.id)) map.set(parent.id, parent);
        parent = parent.parent;
      }
    }
    return map;
  }, [columns, getLeafNode]);

  const getGroupNode = useCallback(
    (groupId: string) => groupById.get(groupId),
    [groupById]
  );

  const canAdoptIntoTarget = useCallback(
    (dragKeys: string[], targetKey: string) => {
      if (!dragKeys.length) {
        return false;
      }
      const targetLeaf = getLeafNode(targetKey);
      if (!targetLeaf) {
        return false;
      }
      const targetParent = targetLeaf.parent;
      const targetParentId = targetParent?.id ?? null;

      let sourceParentId: string | null = null;

      // Leaf column reordering within grouped columns is only allowed
      // within the current immediate parent group.
      for (let i = 0; i < dragKeys.length; i += 1) {
        const leaf = getLeafNode(dragKeys[i]);
        if (!leaf) {
          return false;
        }
        const leafParent = leaf.parent;
        const leafParentId = leafParent?.id ?? null;
        if (sourceParentId == null) {
          sourceParentId = leafParentId;
        } else if (sourceParentId !== leafParentId) {
          return false;
        }
      }

      return sourceParentId === targetParentId;
    },
    [getLeafNode]
  );

  const boundaryForDrop = useCallback(
    (
      targetKey: string,
      pos: GridColumnDropEdge
    ): { leftKey: string | null; rightKey: string | null } => {
      const idx = colIndex.get(targetKey);
      if (idx == null || idx < 0) return { leftKey: null, rightKey: null };
      if (pos === "left") {
        const leftKey = idx > 0 ? columns[idx - 1]?.key ?? null : null;
        return { leftKey, rightKey: targetKey };
      }
      const rightKey =
        idx < columns.length - 1 ? columns[idx + 1]?.key ?? null : null;
      return { leftKey: targetKey, rightKey };
    },
    [colIndex, columns]
  );

  const boundaryBlocked = useCallback(
    (
      leftKey: string | null,
      rightKey: string | null,
      draggedKeys?: string[],
      dropTargetKey?: string | null
    ) => {
      if (isMergeBoundaryBlocked(leftKey, rightKey)) return true;
      if (!isGroupBoundaryBlocked(leftKey, rightKey)) return false;
      if (!draggedKeys || draggedKeys.length === 0) return true;

      // Reordering within the same immediate parent lane should stay legal even
      // when the visible drop edge sits on the outer boundary of that lane.
      if (dropTargetKey && canAdoptIntoTarget(draggedKeys, dropTargetKey)) {
        return false;
      }

      const groupKeys =
        (leftKey && marriedGroupColumns.get(leftKey)) ||
        (rightKey && marriedGroupColumns.get(rightKey));
      if (!groupKeys || !leftKey || !rightKey) return true;
      if (!groupKeys.includes(leftKey) || !groupKeys.includes(rightKey)) {
        return true;
      }

      if (draggedKeys.every((key) => groupKeys.includes(key))) {
        return false;
      }

      return !canAdoptIntoTarget(draggedKeys, rightKey);
    },
    [
      isMergeBoundaryBlocked,
      isGroupBoundaryBlocked,
      marriedGroupColumns,
      canAdoptIntoTarget,
    ]
  );

  const resolveGroupLeafKeys = useCallback(
    (groupId: string) => {
      const keys: string[] = [];
      for (let i = 0; i < columns.length; i += 1) {
        const colKey = columns[i]?.key;
        if (!colKey) continue;
        const leaf = getLeafNode(colKey);
        if (!leaf) continue;
        let parent = leaf.parent;
        while (parent) {
          if (parent.id === groupId) {
            keys.push(colKey);
            break;
          }
          parent = parent.parent;
        }
      }
      return keys;
    },
    [columns, getLeafNode]
  );

  const resolveGroupTargetFromMeta = useCallback(
    (meta: ColumnGroupDragMeta, targetDepth: number | null) => {
      if (targetDepth == null) return null;
      if (meta.depth < targetDepth) return null;
      const groupId =
        meta.depth === targetDepth ? meta.groupId : meta.path[targetDepth];
      if (!groupId) return null;
      const path = meta.path.slice(0, targetDepth + 1);
      const columnKeys =
        meta.depth === targetDepth ? meta.columnKeys : resolveGroupLeafKeys(groupId);
      const parentGroupId = targetDepth > 0 ? path[targetDepth - 1] : null;
      return { groupId, parentGroupId, columnKeys, path };
    },
    [resolveGroupLeafKeys]
  );

  const resolveGroupTargetFromLeaf = useCallback(
    (key: string, targetDepth: number | null) => {
      if (targetDepth == null) return null;
      const leaf = getLeafNode(key);
      if (!leaf) return null;
      const path: string[] = [];
      let parent = leaf.parent;
      while (parent) {
        path.unshift(parent.id);
        parent = parent.parent;
      }
      if (path.length <= targetDepth) return null;
      const groupId = path[targetDepth];
      if (!groupId) return null;
      const columnKeys = resolveGroupLeafKeys(groupId);
      const parentGroupId = targetDepth > 0 ? path[targetDepth - 1] : null;
      return { groupId, parentGroupId, columnKeys, path };
    },
    [getLeafNode, resolveGroupLeafKeys]
  );

  const canMoveDraggedGroupToParent = useCallback(
    (targetParentId: string | null) => {
      const sourceParentId = dragState.draggedGroupParentId;
      if (sourceParentId == null) {
        return targetParentId == null;
      }
      return sourceParentId === targetParentId;
    },
    [dragState.draggedGroupParentId]
  );

  const clearDragOverState = useCallback(() => {
    setDragState((d) =>
      d.dragOverColumnKey === null &&
      d.dragOverPosition === null &&
      d.dragOverGroupId === null &&
      d.groupDropPlacement === "before" &&
      d.groupDropInsideIndex === null
        ? d
        : {
            ...d,
            dragOverColumnKey: null,
            dragOverPosition: null,
            dragOverGroupId: null,
            groupDropPlacement: "before",
            groupDropInsideIndex: null,
          }
    );
  }, []);

  const startDrag = useCallback(
    (
      e: React.DragEvent,
      key: string,
      overrideKeys?: string[],
      groupMeta?: {
        id: string;
        depth: number;
        parentId: string | null;
        path: string[];
      }
    ) => {
      const isGroupDrag = Boolean(groupMeta?.id);
      if (!isColReorder || (!isGroupDrag && columnHasSpans(key))) {
        e.preventDefault();
        return;
      }

      if (isGroupDrag && !allowAdvancedReorder) {
        e.preventDefault();
        return;
      }
      const clickedParentId = resolveLeafParentId(key);

      const selectedKeysRaw =
        selectedColumnKeys.includes(key) && selectedColumnKeys.length
          ? selectedColumnKeys
          : null;

      const marriedKeys = marriedGroupColumns.get(key);

      const selectedKeys = selectedKeysRaw
        ? selectedKeysRaw.filter((k) => !isSystemCol(k))
        : null;

      const scopedSelection =
        !isGroupDrag && selectedKeys
          ? selectedKeys.filter(
              (k) => resolveLeafParentId(k) === clickedParentId
            )
          : selectedKeys;

      const selectionCoversMarried = marriedKeys
        ? marriedKeys.every((mk) => scopedSelection?.includes(mk))
        : true;

      // Determine which columns to drag:
      // - If overrideKeys provided (group drag), use those
      // - If there's a multi-column selection that covers all married columns, use selection
      // - Otherwise, ONLY drag the single clicked column
      const keys =
        allowAdvancedReorder && overrideKeys && overrideKeys.length
          ? overrideKeys
          : allowAdvancedReorder &&
            scopedSelection &&
            scopedSelection.length &&
            selectionCoversMarried
          ? scopedSelection
          : [key];

      setDragState((d) =>
        d.isDragging &&
        d.draggedColumnKey === key &&
        d.draggedColumnKeys.length === keys.length &&
        d.draggedGroupId === (groupMeta?.id ?? null)
          ? d
          : {
              isDragging: true,
              draggedColumnKey: key,
              draggedColumnKeys: keys,
              dragOverColumnKey: null,
              dragOverPosition: null,
              draggedGroupId: groupMeta?.id ?? null,
              draggedGroupDepth: groupMeta?.depth ?? null,
              draggedGroupParentId: groupMeta?.parentId ?? null,
              dragOverGroupId: null,
              groupDropPlacement: "before",
              groupDropInsideIndex: null,
              draggedGroupPath: groupMeta?.path ?? [],
            }
      );

      startAutoScroll();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(keys));
    },
    [
      columnHasSpans,
      isColReorder,
      marriedGroupColumns,
      selectedColumnKeys,
      startAutoScroll,
      resolveLeafParentId,
      allowAdvancedReorder,
    ]
  );

  const onColDragStart = useCallback(
    (e: React.DragEvent, key: string) => {
      startDrag(e, key);
    },
    [startDrag]
  );

  const onColDragOver = useCallback(
    (e: React.DragEvent, key: string) => {
      if (!dragState.isDragging || !dragState.draggedColumnKey) return;

      updateAutoScroll(e.clientX, e.clientY);

      const rect = safeRect(e.currentTarget);
      if (!rect) {
        if (
          dragState.dragOverColumnKey !== null ||
          dragState.dragOverPosition !== null ||
          dragState.dragOverGroupId !== null
        ) {
          clearDragOverState();
        }
        return;
      }

      e.preventDefault();

      const pos: GridColumnDropEdge =
        e.clientX < rect.left + rect.width / 2 ? "left" : "right";
      const draggedKeys =
        dragState.draggedColumnKeys.length > 0
          ? dragState.draggedColumnKeys
          : dragState.draggedColumnKey
          ? [dragState.draggedColumnKey]
          : [];

      if (dragState.draggedGroupId) {
        if (!allowAdvancedReorder) {
          e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }
        const target = resolveGroupTargetFromLeaf(
          key,
          dragState.draggedGroupDepth
        );
        if (!target || !target.columnKeys.length) {
          e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        if (!canMoveDraggedGroupToParent(target.parentGroupId)) {
          e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        const placement: ColumnGroupDropPlacement =
          pos === "left" ? "before" : "after";
        const targetKey =
          placement === "before"
            ? target.columnKeys[0]
            : target.columnKeys[target.columnKeys.length - 1];
        const canDrop =
          targetKey != null &&
          target.groupId !== dragState.draggedGroupId &&
          !target.path.includes(dragState.draggedGroupId);

        if (!canDrop) {
          e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        e.dataTransfer.dropEffect = "move";
        setDragState((d) =>
          d.dragOverColumnKey === null &&
          d.dragOverPosition === pos &&
          d.dragOverGroupId === target.groupId &&
          d.groupDropPlacement === placement
            ? d
            : {
                ...d,
                dragOverColumnKey: null,
                dragOverPosition: pos,
                dragOverGroupId: target.groupId,
                groupDropPlacement: placement,
                groupDropInsideIndex: null,
              }
        );
        return;
      }

      // Skip work if nothing changed
      if (
        dragState.dragOverColumnKey === key &&
        dragState.dragOverPosition === pos
      ) {
        return;
      }

      const { leftKey, rightKey } = boundaryForDrop(key, pos);
      const isBlocked = boundaryBlocked(leftKey, rightKey, draggedKeys, key);
      if (isBlocked) {
        e.dataTransfer.dropEffect = "none";
        // Clear only if previously set
        if (
          dragState.dragOverColumnKey !== null ||
          dragState.dragOverPosition !== null ||
          dragState.dragOverGroupId !== null
        ) {
          clearDragOverState();
        }
        return;
      }

      if (!canAdoptIntoTarget(draggedKeys, key)) {
        e.dataTransfer.dropEffect = "none";
        if (
          dragState.dragOverColumnKey !== null ||
          dragState.dragOverPosition !== null ||
          dragState.dragOverGroupId !== null
        ) {
          clearDragOverState();
        }
        return;
      }

      e.dataTransfer.dropEffect = "move";
      setDragState((d) =>
        d.dragOverColumnKey === key && d.dragOverPosition === pos
          ? d
          : {
              ...d,
              dragOverColumnKey: key,
              dragOverPosition: pos,
              dragOverGroupId: null,
              groupDropPlacement: "before",
          groupDropInsideIndex: null,
        }
      );
    },
    [
      dragState.isDragging,
      dragState.draggedColumnKey,
      dragState.draggedColumnKeys,
      dragState.draggedGroupId,
      dragState.draggedGroupDepth,
      dragState.dragOverColumnKey,
      dragState.dragOverPosition,
      dragState.dragOverGroupId,
      boundaryBlocked,
      boundaryForDrop,
      updateAutoScroll,
      canAdoptIntoTarget,
      canMoveDraggedGroupToParent,
      clearDragOverState,
      resolveGroupTargetFromLeaf,
      allowAdvancedReorder,
    ]
  );

  const onColDragLeave = useCallback(
    (e: React.DragEvent) => {
      const rect = safeRect(e.currentTarget);
      if (!rect) {
        clearDragOverState();
        return;
      }
      const { left, right, top, bottom } = rect;
      const { clientX: x, clientY: y } = e;
      if (x < left || x > right || y < top || y > bottom) {
        clearDragOverState();
      }
    },
    [clearDragOverState]
  );

  const onGroupDragStart = useCallback(
    (e: React.DragEvent, meta: ColumnGroupDragMeta) => {
      if (!allowAdvancedReorder) {
        e.preventDefault();
        return;
      }
      const normalized = meta.columnKeys.filter((k) => !isSystemCol(k));
      if (!normalized.length) {
        e.preventDefault();
        return;
      }
      startDrag(e, normalized[0], normalized, {
        id: meta.groupId,
        depth: meta.depth,
        parentId: meta.parentGroupId,
        path: meta.path,
      });
    },
    [startDrag, allowAdvancedReorder]
  );

  const onGroupDragOver = useCallback(
    (e: React.DragEvent, meta: ColumnGroupDragMeta) => {
      if (!allowAdvancedReorder) {
        if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
        clearDragOverState();
        return;
      }
      if (!dragState.isDragging || !dragState.draggedColumnKey) return;

      updateAutoScroll(e.clientX, e.clientY);

      const rect = safeRect(e.currentTarget);
      if (!rect) {
        if (
          dragState.dragOverColumnKey !== null ||
          dragState.dragOverPosition !== null ||
          dragState.dragOverGroupId !== null
        ) {
          setDragState((d) =>
            d.dragOverColumnKey === null &&
            d.dragOverPosition === null &&
            d.dragOverGroupId === null
              ? d
              : {
                  ...d,
                  dragOverColumnKey: null,
                  dragOverPosition: null,
                  dragOverGroupId: null,
                }
          );
        }
        return;
      }

      e.preventDefault();

      const draggedKeys = dragState.draggedColumnKeys.length
        ? dragState.draggedColumnKeys
        : dragState.draggedColumnKey
        ? [dragState.draggedColumnKey]
        : [];

      if (!draggedKeys.length) {
        if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
        clearDragOverState();
        return;
      }

      const draggedGroupId = dragState.draggedGroupId;
      if (draggedGroupId) {
        const target = resolveGroupTargetFromMeta(
          meta,
          dragState.draggedGroupDepth
        );
        if (!target || !target.columnKeys.length) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        const placement: ColumnGroupDropPlacement =
          e.clientX < rect.left + rect.width / 2 ? "before" : "after";
        const targetKey =
          placement === "before"
            ? target.columnKeys[0]
            : target.columnKeys[target.columnKeys.length - 1];
        const dropEdge: GridColumnDropEdge = placement === "before" ? "left" : "right";

        const canDrop =
          targetKey != null &&
          target.groupId !== draggedGroupId &&
          !target.path.includes(draggedGroupId);

        if (!canMoveDraggedGroupToParent(target.parentGroupId)) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        if (!canDrop) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
          clearDragOverState();
          return;
        }

        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        setDragState((d) =>
          d.dragOverColumnKey === null &&
          d.dragOverPosition === dropEdge &&
          d.dragOverGroupId === target.groupId &&
          d.groupDropPlacement === placement
            ? d
            : {
                ...d,
                dragOverColumnKey: null,
                dragOverPosition: dropEdge,
                dragOverGroupId: target.groupId,
                groupDropPlacement: placement,
                groupDropInsideIndex: null,
              }
        );
        return;
      }

      if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
      clearDragOverState();
    },
    [
      dragState,
      updateAutoScroll,
      clearDragOverState,
      resolveGroupTargetFromMeta,
      canMoveDraggedGroupToParent,
      allowAdvancedReorder,
    ]
  );

  const onGroupDragLeave = useCallback(
    (e: React.DragEvent) => {
      const rect = safeRect(e.currentTarget);
      if (!rect) {
        clearDragOverState();
        return;
      }
      const { left, right, top, bottom } = rect;
      const { clientX: x, clientY: y } = e;
      if (x < left || x > right || y < top || y > bottom) {
        clearDragOverState();
      }
    },
    [clearDragOverState]
  );

  const onColDrop = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      if (!dragState.isDragging || !dragState.draggedColumnKey) {
        stopAutoScroll();
        return;
      }
      stopAutoScroll();

      const dropPos: "before" | "after" =
        dragState.dragOverPosition === "right" ? "after" : "before";

      const draggedKeys = dragState.draggedColumnKeys.length
        ? dragState.draggedColumnKeys
        : dragState.draggedColumnKey
        ? [dragState.draggedColumnKey]
        : [];
      if (dragState.draggedGroupId) {
        const target =
          resolveGroupTargetFromLeaf(targetKey, dragState.draggedGroupDepth) ??
          null;
        const dropGroupId = dragState.dragOverGroupId ?? target?.groupId ?? null;
        if (
          dropGroupId &&
          canMoveDraggedGroupToParent(target?.parentGroupId ?? null)
        ) {
          moveGroupWithinGroups(
            dragState.draggedGroupId,
            dropGroupId,
            dragState.groupDropPlacement
          );
        }

        setDragState(() => createInitialDragState());
        return;
      }

      if (
        !dragState.draggedGroupId &&
        !canAdoptIntoTarget(draggedKeys, targetKey)
      ) {
        setDragState(() => createInitialDragState());
        return;
      }

      const { leftKey, rightKey } = boundaryForDrop(
        targetKey,
        dragState.dragOverPosition || "left"
      );
      if (boundaryBlocked(leftKey, rightKey, draggedKeys, targetKey)) {
        setDragState(() => createInitialDragState());
        return;
      }

      const moveWithinGroupsIfAllowed = (): boolean => {
        if (!allowAdvancedReorder) return false;
        if (canAdoptIntoTarget(draggedKeys, targetKey)) {
          return moveColumnsWithinGroups(draggedKeys, targetKey, dropPos);
        }
        return false;
      };

      // Target pin info (cached)
      const targetIsPinnedLeft = leftPinnedSet.has(targetKey);
      const targetIsPinnedRight = rightPinnedSet.has(targetKey);
      const targetIsPinned = targetIsPinnedLeft || targetIsPinnedRight;

      // Dragged pin composition (cached)
      const allCenter = draggedKeys.every((k) => !pinnedSet.has(k));
      const allLeft = draggedKeys.every((k) => leftPinnedSet.has(k));
      const allRight = draggedKeys.every((k) => rightPinnedSet.has(k));
      const mixedPinned = !(allCenter || allLeft || allRight);

      const currentOrder = columns.map((c) => c.key);

      if (draggedKeys.length > 1) {
        if (!allowAdvancedReorder) {
          setDragState(() => createInitialDragState());
          return;
        }
        if (mixedPinned) {
          // mixed pinned groups: no-op, just clear state
        } else if (allCenter && !targetIsPinned) {
          // Try to move within groups first
          const movedWithinGroups = moveWithinGroupsIfAllowed();
          // Only update flat column order if NOT moved within groups
          // (when groups are active, column order is derived from group structure)
          if (!movedWithinGroups) {
            const final = reorderOrderArray(
              currentOrder,
              draggedKeys,
              targetKey,
              dropPos
            );
            if (onUpdateColumnOrder) onUpdateColumnOrder(final);
            else if (onMultiColumnReorder)
              onMultiColumnReorder(draggedKeys, targetKey, dropPos);
            else if (onColumnReorder) {
              // replay minimal moves
              const working = currentOrder.slice();
              for (let i = 0; i < final.length; i++) {
                const want = i;
                const key = final[i];
                const from = working.indexOf(key);
                if (from !== want) {
                  working.splice(from, 1);
                  working.splice(want, 0, key);
                  onColumnReorder(from, want);
                }
              }
            }
          }
        } else if (!allCenter && targetIsPinned) {
          moveWithinGroupsIfAllowed();
          const side: GridDragSide = targetIsPinnedLeft ? "left" : "right";
          const arr =
            side === "left" ? pinnedColumns.left : pinnedColumns.right;
          const tIdx = arr.indexOf(targetKey);
          const base = dropPos === "after" ? tIdx + 1 : tIdx;
          if (onPinColumnAtPosition) {
            draggedKeys.forEach((k, i) =>
              onPinColumnAtPosition(k, side, base + i)
            );
          } else if (onPinAndPositionColumn) {
            draggedKeys.forEach((k) =>
              onPinAndPositionColumn(k, targetKey, side, dropPos)
            );
          } else if (onPinnedColumnReorder) {
            draggedKeys.forEach((k) =>
              onPinnedColumnReorder(k, targetKey, side, dropPos)
            );
          } else if (onPinColumn) {
            draggedKeys.forEach((k) => onPinColumn(k, side));
          }
        } else if (!allCenter && !targetIsPinned) {
          if (onPinColumn) draggedKeys.forEach((k) => onPinColumn(k, null));
          // allow parent state to update pins first
          Promise.resolve().then(() => {
            moveWithinGroupsIfAllowed();
            const now = columns.map((c) => c.key);
            const final = reorderOrderArray(
              now,
              draggedKeys,
              targetKey,
              dropPos
            );
            if (onUpdateColumnOrder) onUpdateColumnOrder(final);
            else if (onMultiColumnReorder)
              onMultiColumnReorder(draggedKeys, targetKey, dropPos);
            else if (onColumnReorder) {
              const working = now.slice();
              for (let i = 0; i < final.length; i++) {
                const want = i;
                const key = final[i];
                const from = working.indexOf(key);
                if (from !== want) {
                  working.splice(from, 1);
                  working.splice(want, 0, key);
                  onColumnReorder(from, want);
                }
              }
            }
          });
        } else if (allCenter && targetIsPinned) {
          moveWithinGroupsIfAllowed();
          const side: GridDragSide = targetIsPinnedLeft ? "left" : "right";
          const arr =
            side === "left" ? pinnedColumns.left : pinnedColumns.right;
          const tIdx = arr.indexOf(targetKey);
          const base = dropPos === "after" ? tIdx + 1 : tIdx;
          if (onPinColumnAtPosition) {
            draggedKeys.forEach((k, i) =>
              onPinColumnAtPosition(k, side, base + i)
            );
          } else if (onPinAndPositionColumn) {
            draggedKeys.forEach((k) =>
              onPinAndPositionColumn(k, targetKey, side, dropPos)
            );
          } else if (onPinColumn) {
            draggedKeys.forEach((k) => onPinColumn(k, side));
          }
        }

        setDragState(() => createInitialDragState());
        return;
      }

      // single key
      const draggedKey = dragState.draggedColumnKey!;
      const fromIdx = columns.findIndex((c) => c.key === draggedKey);
      const toIdx = columns.findIndex((c) => c.key === targetKey);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const draggedPinnedLeft = leftPinnedSet.has(draggedKey);
        const draggedPinnedRight = rightPinnedSet.has(draggedKey);
        const draggedPinned = draggedPinnedLeft || draggedPinnedRight;

        if (
          (draggedPinnedLeft && targetIsPinnedLeft) ||
          (draggedPinnedRight && targetIsPinnedRight)
        ) {
          if (onPinnedColumnReorder) {
            moveWithinGroupsIfAllowed();
            onPinnedColumnReorder(
              draggedKey,
              targetKey,
              draggedPinnedLeft ? "left" : "right",
              dropPos
            );
          }
        } else if (draggedPinned && !targetIsPinned) {
          if (onPinColumn) onPinColumn(draggedKey, null);
          Promise.resolve().then(() => {
            const movedWithinGroups = moveWithinGroupsIfAllowed();
            // Only update flat column order if NOT moved within groups
            if (!movedWithinGroups) {
              const now = columns.map((c) => c.key);
              const final = reorderOrderArray(
                now,
                [draggedKey],
                targetKey,
                dropPos
              );
              if (onUpdateColumnOrder) onUpdateColumnOrder(final);
              else if (onColumnReorder) {
                const working = now.slice();
                for (let i = 0; i < final.length; i++) {
                  const want = i;
                  const key = final[i];
                  const from = working.indexOf(key);
                  if (from !== want) {
                    working.splice(from, 1);
                    working.splice(want, 0, key);
                    onColumnReorder(from, want);
                  }
                }
              }
            }
          });
        } else if (!draggedPinned && targetIsPinned) {
          moveWithinGroupsIfAllowed();
          const side: GridDragSide = targetIsPinnedLeft ? "left" : "right";
          const arr =
            side === "left" ? pinnedColumns.left : pinnedColumns.right;
          const tIdx = arr.indexOf(targetKey);
          const insert =
            dragState.dragOverPosition === "right" ? tIdx + 1 : tIdx;
          if (onPinColumnAtPosition) {
            onPinColumnAtPosition(draggedKey, side, insert);
          } else if (onPinAndPositionColumn) {
            onPinAndPositionColumn(draggedKey, targetKey, side, dropPos);
          } else if (onPinnedColumnReorder && onPinColumn) {
            onPinColumn(draggedKey, side);
            onPinnedColumnReorder(draggedKey, targetKey, side, dropPos);
          } else if (onPinColumn) {
            onPinColumn(draggedKey, side);
          }
        } else if (draggedPinned && targetIsPinned) {
          moveWithinGroupsIfAllowed();
          const side: GridDragSide = targetIsPinnedLeft ? "left" : "right";
          const arr =
            side === "left" ? pinnedColumns.left : pinnedColumns.right;
          const tIdx = arr.indexOf(targetKey);
          const insert =
            dragState.dragOverPosition === "right" ? tIdx + 1 : tIdx;
          if (onPinColumnAtPosition) {
            onPinColumnAtPosition(draggedKey, side, insert);
          } else if (onPinAndPositionColumn) {
            onPinAndPositionColumn(draggedKey, targetKey, side, dropPos);
          } else if (onPinnedColumnReorder && onPinColumn) {
            onPinColumn(draggedKey, side);
            onPinnedColumnReorder(draggedKey, targetKey, side, dropPos);
          } else if (onPinColumn) {
            onPinColumn(draggedKey, side);
          }
        } else {
          // center-to-center simple reorder
          const movedWithinGroups = moveWithinGroupsIfAllowed();
          // Only update flat column order if NOT moved within groups
          if (!movedWithinGroups) {
            const finalTo =
              dragState.dragOverPosition === "right" ? toIdx + 1 : toIdx;
            if (onColumnReorder)
              onColumnReorder(
                fromIdx,
                finalTo > fromIdx ? finalTo - 1 : finalTo
              );
          }
        }
      }

      setDragState(() => createInitialDragState());
    },
    [
      dragState,
      boundaryForDrop,
      boundaryBlocked,
      columns,
      canAdoptIntoTarget,
      leftPinnedSet,
      rightPinnedSet,
      pinnedSet,
      pinnedColumns,
      moveColumnsWithinGroups,
      moveGroupWithinGroups,
      onUpdateColumnOrder,
      onMultiColumnReorder,
      onColumnReorder,
      onPinnedColumnReorder,
      onPinColumnAtPosition,
      onPinAndPositionColumn,
      onPinColumn,
      stopAutoScroll,
      resolveGroupTargetFromLeaf,
      canMoveDraggedGroupToParent,
      allowAdvancedReorder,
    ]
  );

  const onGroupDrop = useCallback(
    (e: React.DragEvent, meta: ColumnGroupDragMeta) => {
      if (!allowAdvancedReorder) {
        stopAutoScroll();
        clearDragOverState();
        setDragState(() => createInitialDragState());
        return;
      }
      if (!dragState.isDragging || !meta.columnKeys.length) return;

      const placement = dragState.groupDropPlacement;
      if (dragState.draggedGroupId) {
        const dropGroupId = dragState.dragOverGroupId;
        if (!dropGroupId) {
          stopAutoScroll();
          clearDragOverState();
          setDragState(() => createInitialDragState());
          return;
        }
        if (!canMoveDraggedGroupToParent(meta.parentGroupId)) {
          stopAutoScroll();
          clearDragOverState();
          setDragState(() => createInitialDragState());
          return;
        }
        e.preventDefault();
        moveGroupWithinGroups(dragState.draggedGroupId, dropGroupId, placement);
        stopAutoScroll();
        setDragState(() => createInitialDragState());
        return;
      }

      stopAutoScroll();
      clearDragOverState();
      setDragState(() => createInitialDragState());
    },
    [
      dragState.isDragging,
      dragState.draggedGroupId,
      dragState.groupDropPlacement,
      dragState.dragOverGroupId,
      clearDragOverState,
      moveGroupWithinGroups,
      stopAutoScroll,
      canMoveDraggedGroupToParent,
      allowAdvancedReorder,
    ]
  );

  const onColDragEnd = useCallback(() => {
      stopAutoScroll();
      setDragState((d) =>
        d.isDragging ||
        d.draggedColumnKey !== null ||
        d.draggedColumnKeys.length ||
        d.dragOverColumnKey !== null ||
        d.dragOverPosition !== null ||
        d.dragOverGroupId !== null
          ? {
            isDragging: false,
            draggedColumnKey: null,
            draggedColumnKeys: [],
            dragOverColumnKey: null,
            dragOverPosition: null,
            draggedGroupId: null,
            draggedGroupDepth: null,
            draggedGroupParentId: null,
            dragOverGroupId: null,
            groupDropPlacement: "before",
            groupDropInsideIndex: null,
            draggedGroupPath: [],
          }
        : d
    );
  }, [stopAutoScroll]);

  const { onNodeDragStart, onNodeDragOver, onNodeDrop } =
    useColumnGroupNodeDnD({
      columns,
      getLeafNode,
      getGroupNode,
      resolveGroupLeafKeys,
      onColDragStart,
      onColDragOver,
      onColDrop,
      onGroupDragStart,
      onGroupDragOver,
      onGroupDrop,
    });

  return {
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
    onNodeDragStart: allowAdvancedReorder ? onNodeDragStart : undefined,
    onNodeDragOver: allowAdvancedReorder ? onNodeDragOver : undefined,
    onNodeDrop: allowAdvancedReorder ? onNodeDrop : undefined,
  };
}
