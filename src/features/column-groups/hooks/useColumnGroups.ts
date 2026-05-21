import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GridColumn,
  GridColumnDef,
  GridColumnGroup,
} from "../../../types";
import type {
  ColumnGroupId,
  ColumnGroupNode,
  ColumnLeafNode,
  ColumnGroupDropPlacement,
  MarriedGroupColumns,
  NormalizedColumnTree,
} from "../types";
import {
  isColumnGroupDef,
  isLeafVisible,
  normalizeColumnTree,
} from "../utils";
import type { DepthMap } from "../depth-nodes";
import {
  buildDepthMap,
} from "../depth-nodes";

const mapEquals = (
  a: Map<string, boolean>,
  b: Map<string, boolean>
): boolean => {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (!Object.is(b.get(key), value)) return false;
  }
  return true;
};

const computeDefsSignature = (defs: GridColumnDef[]): string => {
  const leafKeys = new Set<string>();
  const groupIds = new Set<string>();

  const walk = (nodes: GridColumnDef[], path: number[] = []) => {
    nodes.forEach((node, idx) => {
      if (isColumnGroupDef(node)) {
        const id =
          node.groupId && node.groupId.trim().length
            ? node.groupId
            : `__auto__${[...path, idx].join(".")}`;
        groupIds.add(id);
        walk(node.children, [...path, idx]);
      } else {
        leafKeys.add(node.key);
      }
    });
  };

  walk(defs);
  return (
    Array.from(leafKeys).sort().join("|") +
    "#" +
    Array.from(groupIds).sort().join("|")
  );
};

type LeafSearchResult = {
  column: GridColumn;
  parentArray: GridColumnDef[];
  parentGroup: GridColumnGroup | null;
  index: number;
  pathIds: string[];
};

type GroupSearchResult = {
  group: GridColumnGroup;
  parentArray: GridColumnDef[];
  parentGroup: GridColumnGroup | null;
  index: number;
  pathIds: string[];
};

const findLeafInDefs = (
  defs: GridColumnDef[],
  key: string
): LeafSearchResult | null => {
  const traverse = (
    nodes: GridColumnDef[],
    parentGroup: GridColumnGroup | null,
    parentArray: GridColumnDef[],
    pathIds: string[],
    indexTrail: number[]
  ): LeafSearchResult | null => {
    for (let idx = 0; idx < nodes.length; idx += 1) {
      const node = nodes[idx];
      if (isColumnGroupDef(node)) {
        const id =
          node.groupId && node.groupId.trim().length
            ? node.groupId
            : `__auto__${[...indexTrail, idx].join(".")}`;
        const result = traverse(
          node.children,
          node,
          node.children,
          [...pathIds, id],
          [...indexTrail, idx]
        );
        if (result) return result;
      } else if (node.key === key) {
        return {
          column: node,
          parentArray,
          parentGroup,
          index: idx,
          pathIds,
        };
      }
    }
    return null;
  };

  return traverse(defs, null, defs, [], []);
};

const findGroupInDefs = (
  defs: GridColumnDef[],
  groupId: string
): GroupSearchResult | null => {
  const traverse = (
    nodes: GridColumnDef[],
    parentGroup: GridColumnGroup | null,
    parentArray: GridColumnDef[],
    pathIds: string[],
    indexTrail: number[]
  ): GroupSearchResult | null => {
    for (let idx = 0; idx < nodes.length; idx += 1) {
      const node = nodes[idx];
      if (!isColumnGroupDef(node)) continue;
      const id = node.groupId && node.groupId.trim().length ? node.groupId : `__auto__${[...indexTrail, idx].join(".")}`;
      if (id === groupId) {
        return {
          group: node,
          parentArray,
          parentGroup,
          index: idx,
          pathIds,
        };
      }
      const result = traverse(
        node.children,
        node,
        node.children,
        [...pathIds, id],
        [...indexTrail, idx]
      );
      if (result) return result;
    }
    return null;
  };

  return traverse(defs, null, defs, [], []);
};

const cloneDefs = (
  defs: GridColumnDef[],
  ensureGroupId: (group: GridColumnGroup) => string
): GridColumnDef[] =>
  defs.map((def) => {
    if (isColumnGroupDef(def)) {
      const clone: GridColumnGroup = {
        ...def,
      };
      clone.groupId = ensureGroupId(clone);
      clone.children = cloneDefs(def.children, ensureGroupId);
      return clone;
    }
    return def;
  });

const leafIsDescendantOf = (
  leaf: ColumnLeafNode,
  groupId: ColumnGroupId
) => {
  let parent = leaf.parent;
  while (parent) {
    if (parent.id === groupId) return true;
    parent = parent.parent;
  }
  return false;
};

export interface ColumnGroupingState {
  normalized: NormalizedColumnTree;
  expanded: Map<ColumnGroupId, boolean>;
  visibleLeafNodes: ColumnLeafNode[];
  visibleLeafColumns: GridColumn[];
  marriedBoundaries: Set<string>;
  marriedGroupColumns: MarriedGroupColumns;
  toggleGroup: (groupId: ColumnGroupId, open?: boolean) => void;
  setGroupOpen: (groupId: ColumnGroupId, open: boolean) => void;
  isGroupOpen: (groupId: ColumnGroupId) => boolean;
  getColumnGroup: (groupId: ColumnGroupId) => ColumnGroupNode | undefined;
  getDisplayNameForColumnGroup: (groupId: ColumnGroupId) => string | undefined;
  moveColumns: (
    keys: string[],
    targetKey: string,
    position: "before" | "after"
  ) => boolean;
  moveGroup: (
    groupId: ColumnGroupId,
    targetGroupId: ColumnGroupId,
    placement: ColumnGroupDropPlacement,
    insideIndex?: number | null
  ) => boolean;
  exportColumnDefs: () => GridColumnDef[];
  depthMap: DepthMap;
  moveNodeWithinDepth: (
    draggedNodeId: string,
    targetNodeId: string,
    position: "before" | "after"
  ) => boolean;
}

export const useColumnGroups = (
  columnDefs: GridColumnDef[]
): ColumnGroupingState => {
  const autoGroupSeqRef = useRef(0);
  const ensureGroupId = (group: GridColumnGroup): string => {
    if (group.groupId && group.groupId.trim().length) return group.groupId;
    const id = `__ace_grid_group_${autoGroupSeqRef.current++}`;
    group.groupId = id;
    return id;
  };

  const defsRef = useRef<GridColumnDef[]>([]);
  const signatureRef = useRef<string>("");
  const initializedRef = useRef(false);

  if (!initializedRef.current) {
    defsRef.current = cloneDefs(columnDefs, ensureGroupId);
    signatureRef.current = computeDefsSignature(defsRef.current);
    initializedRef.current = true;
  }

  const [normalized, setNormalized] = useState<NormalizedColumnTree>(() =>
    normalizeColumnTree(defsRef.current)
  );

  // Depth map for efficient DnD operations
  useEffect(() => {
    const nextSignature = computeDefsSignature(columnDefs);
    if (nextSignature === signatureRef.current) return;
    const cloned = cloneDefs(columnDefs, ensureGroupId);
    defsRef.current = cloned;
    signatureRef.current = computeDefsSignature(cloned);
    setNormalized(normalizeColumnTree(cloned));
  }, [columnDefs]);

  const mutateDefs = (
    mutator: (ctx: {
      defs: GridColumnDef[];
      normalized: NormalizedColumnTree;
    }) => boolean
  ): boolean => {
    let changed = false;

    setNormalized((prevNormalized) => {
      const workingDefs = cloneDefs(defsRef.current, ensureGroupId);
      const mutated = mutator({ defs: workingDefs, normalized: prevNormalized });
      if (!mutated) return prevNormalized;
      defsRef.current = workingDefs;
      signatureRef.current = computeDefsSignature(workingDefs);
      changed = true;
      return normalizeColumnTree(workingDefs);
    });

    return changed;
  };

  const moveColumns = (
    keys: string[],
    targetKey: string,
    position: "before" | "after"
  ): boolean => {
    if (!keys.length || !targetKey) {
      return false;
    }
    return mutateDefs(({ defs }) => {
      // Filter out the target key from the dragged keys
      // This handles the case where we're dragging a selection that includes the drop target
      const uniqueKeys = Array.from(new Set(keys)).filter(k => k !== targetKey);
      if (!uniqueKeys.length) {
        return false;
      }

      const targetInfo = findLeafInDefs(defs, targetKey);
      if (!targetInfo) {
        return false;
      }
      const targetParentId = targetInfo.parentGroup?.groupId ?? null;

      const movingInfos = uniqueKeys
        .map((key) => {
          const info = findLeafInDefs(defs, key);
          return info ? { key, info } : null;
        })
        .filter(Boolean) as { key: string; info: LeafSearchResult }[];

      if (!movingInfos.length) {
        return false;
      }

      const sourceParentIds = new Set(
        movingInfos.map(({ info }) => info.parentGroup?.groupId ?? null)
      );
      if (sourceParentIds.size !== 1) {
        return false;
      }
      const [sourceParentId] = sourceParentIds;

      if (sourceParentId !== targetParentId) {
        return false;
      }

      const removals = movingInfos
        .map(({ info }) => info)
        .sort((a, b) => {
          if (a.parentArray === b.parentArray) return b.index - a.index;
          return 0;
        });

      removals.forEach((info) => {
        info.parentArray.splice(info.index, 1);
      });

      const updatedTarget = findLeafInDefs(defs, targetKey);
      if (!updatedTarget) {
        return false;
      }

      const insertArray = updatedTarget.parentArray;
      let insertIndex =
        position === "before" ? updatedTarget.index : updatedTarget.index + 1;

      movingInfos.forEach(({ info }) => {
        insertArray.splice(insertIndex, 0, info.column);
        insertIndex += 1;
      });

      return true;
    });
  };

  const exportColumnDefs = useCallback(() => {
    const cloneNode = (node: GridColumnDef): GridColumnDef => {
      if (isColumnGroupDef(node)) {
        return {
          ...node,
          children: node.children.map(cloneNode),
        };
      }
      return { ...node };
    };
    return defsRef.current.map(cloneNode);
  }, []);

  const depthMap = useMemo(() => buildDepthMap(defsRef.current), [normalized]);

  const moveGroup = (
    groupId: ColumnGroupId,
    targetGroupId: ColumnGroupId,
    placement: ColumnGroupDropPlacement,
    _insideIndex: number | null = null
  ): boolean => {
    if (
      !groupId ||
      !targetGroupId ||
      groupId === targetGroupId ||
      placement == null
    ) {
      return false;
    }
    return mutateDefs(({ defs }) => {
      const source = findGroupInDefs(defs, groupId);
      const target = findGroupInDefs(defs, targetGroupId);
      if (!source || !target) {
        return false;
      }

      if (placement === "inside") {
        return false;
      }

      // Prevent cycles (dropping into descendants)
      if (target.pathIds.includes(groupId)) {
        return false;
      }

      if (source.parentArray !== target.parentArray) {
        return false;
      }

      const sourceParentArray = source.parentArray;
      const [removed] = sourceParentArray.splice(source.index, 1);
      if (!removed) {
        return false;
      }

      const restoreSource = () => {
        sourceParentArray.splice(source.index, 0, removed);
      };

      const insertArray = target.parentArray;
      if (!insertArray) {
        restoreSource();
        return false;
      }

      let insertIndex =
        placement === "before" ? target.index : target.index + 1;
      if (sourceParentArray === insertArray && source.index < insertIndex) {
        insertIndex -= 1;
      }
      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > insertArray.length) insertIndex = insertArray.length;

      insertArray.splice(insertIndex, 0, removed);
      return true;
    });
  };

  const [expanded, setExpanded] = useState<Map<ColumnGroupId, boolean>>(() => {
    const map = new Map<ColumnGroupId, boolean>();
    for (const [id, value] of normalized.initialExpandedState) {
      map.set(id, value);
    }
    return map;
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Map<ColumnGroupId, boolean>();
      for (const [id, group] of normalized.groupsById) {
        if (prev.has(id)) {
          next.set(id, prev.get(id)!);
        } else if (normalized.initialExpandedState.has(id)) {
          next.set(id, normalized.initialExpandedState.get(id)!);
        } else {
          next.set(id, group.initialOpen);
        }
      }
      return mapEquals(prev, next) ? prev : next;
    });
  }, [normalized]);

  const visibleLeafNodes = useMemo(
    () =>
      normalized.leafNodes.filter((leaf) =>
        isLeafVisible(leaf, expanded)
      ),
    [normalized.leafNodes, expanded]
  );

  const visibleLeafColumns = useMemo(
    () => visibleLeafNodes.map((leaf) => leaf.column),
    [visibleLeafNodes]
  );

  const marriedBoundaries = useMemo(() => {
    const set = new Set<string>();
    normalized.groupsById.forEach((group) => {
      if (!group.def.marryChildren) return;
      const leaves = visibleLeafNodes.filter((leaf) =>
        leafIsDescendantOf(leaf, group.id)
      );
      for (let i = 1; i < leaves.length; i += 1) {
        const left = leaves[i - 1]?.column.key;
        const right = leaves[i]?.column.key;
        if (left && right) set.add(`${left}|${right}`);
      }
    });
    return set;
  }, [normalized.groupsById, visibleLeafNodes]);

  const marriedGroupColumns = useMemo<MarriedGroupColumns>(() => {
    const map = new Map<string, string[]>();
    normalized.groupsById.forEach((group) => {
      if (!group.def.marryChildren) return;
      const keys = group.leafKeys.slice();
      if (!keys.length) return;
      keys.forEach((key) => {
        map.set(key, keys);
      });
    });
    return map;
  }, [normalized.groupsById]);

  const toggleGroup = (
    groupId: ColumnGroupId,
    open?: boolean
  ) => {
    setExpanded((prev) => {
      const curr = prev.get(groupId);
      const fallback = normalized.initialExpandedState.get(groupId) ?? true;
      const nextState =
        typeof open === "boolean" ? open : !(curr ?? fallback);
      const currentState = curr ?? fallback;
      if (currentState === nextState) return prev;
      const next = new Map(prev);
      next.set(groupId, nextState);
      return next;
    });
  };

  const setGroupOpen = (groupId: ColumnGroupId, open: boolean) =>
    toggleGroup(groupId, open);

  const isGroupOpen = (groupId: ColumnGroupId) =>
    expanded.get(groupId) ??
    normalized.initialExpandedState.get(groupId) ??
    true;

  const getColumnGroup = (groupId: ColumnGroupId) =>
    normalized.groupsById.get(groupId);

  const getDisplayNameForColumnGroup = (groupId: ColumnGroupId) => {
    const group = normalized.groupsById.get(groupId);
    if (!group) return undefined;
    return (
      group.def.title ??
      group.def.headerName ??
      group.def.groupId ??
      group.id
    );
  };

  // Keep a single source of truth: node moves delegate back to the grouped
  // tree mutators instead of mutating a parallel depth-map model.
  const moveNodeWithinDepth = useCallback((
    draggedNodeId: string,
    targetNodeId: string,
    position: "before" | "after"
  ): boolean => {
    if (!draggedNodeId || !targetNodeId || draggedNodeId === targetNodeId) {
      return false;
    }

    const draggedGroup = normalized.groupsById.get(draggedNodeId);
    const targetGroup = normalized.groupsById.get(targetNodeId);

    if (draggedGroup || targetGroup) {
      if (!draggedGroup || !targetGroup) {
        return false;
      }
      if (draggedGroup.depth !== targetGroup.depth) {
        return false;
      }
      if ((draggedGroup.parent?.id ?? null) !== (targetGroup.parent?.id ?? null)) {
        return false;
      }
      return moveGroup(draggedGroup.id, targetGroup.id, position);
    }

    const draggedLeaf = normalized.leafByKey.get(draggedNodeId);
    const targetLeaf = normalized.leafByKey.get(targetNodeId);

    if (!draggedLeaf || !targetLeaf) {
      return false;
    }
    if (draggedLeaf.depth !== targetLeaf.depth) {
      return false;
    }
    if ((draggedLeaf.parent?.id ?? null) !== (targetLeaf.parent?.id ?? null)) {
      return false;
    }

    return moveColumns(
      [draggedLeaf.column.key],
      targetLeaf.column.key,
      position,
    );
  }, [moveColumns, moveGroup, normalized.groupsById, normalized.leafByKey]);

  return {
    normalized,
    expanded,
    visibleLeafNodes,
    visibleLeafColumns,
    marriedBoundaries,
    marriedGroupColumns,
    toggleGroup,
    setGroupOpen,
    isGroupOpen,
    getColumnGroup,
    getDisplayNameForColumnGroup,
    moveColumns,
    moveGroup,
    exportColumnDefs,
    depthMap,
    moveNodeWithinDepth,
  };
};
