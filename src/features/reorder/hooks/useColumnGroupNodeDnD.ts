import { useCallback, useMemo } from "react";
import type { DragEvent } from "react";
import type { GridColumn } from "../../../types";
import { collectLeafKeysForNode } from "../../column-groups";
import type { ColumnGroupNode, ColumnLeafNode } from "../../column-groups";
import type { ColumnGroupDragMeta, ColumnGroupChildMeta } from "./useColumnDnD";

const DEFAULT_COLUMN_WIDTH = 140;

type ResolveGroupLeafKeys = (groupId: string) => string[];

type DragEventHandler = (event: DragEvent, key: string) => void;
type GroupDragEventHandler = (
  event: DragEvent,
  meta: ColumnGroupDragMeta
) => void;

type UseColumnGroupNodeDnDParams = {
  columns: GridColumn[];
  getLeafNode: (key: string) => ColumnLeafNode | undefined;
  getGroupNode: (groupId: string) => ColumnGroupNode | undefined;
  resolveGroupLeafKeys: ResolveGroupLeafKeys;
  onColDragStart: DragEventHandler;
  onColDragOver: DragEventHandler;
  onColDrop: DragEventHandler;
  onGroupDragStart: GroupDragEventHandler;
  onGroupDragOver: GroupDragEventHandler;
  onGroupDrop: GroupDragEventHandler;
};

const toPath = (group: ColumnGroupNode) => {
  const path: string[] = [];
  let current: ColumnGroupNode | null = group;
  while (current) {
    path.unshift(current.id);
    current = current.parent;
  }
  return path;
};

const toChildMeta = (
  child: ColumnGroupNode | ColumnLeafNode,
  widthByKey: Map<string, number>
): ColumnGroupChildMeta => {
  const leafKeys: string[] = [];
  collectLeafKeysForNode(child, leafKeys);
  const width = leafKeys.reduce(
    (sum, key) => sum + (widthByKey.get(key) ?? DEFAULT_COLUMN_WIDTH),
    0
  );

  if (child.kind === "group") {
    return {
      kind: "group",
      id: child.id,
      leafKeys,
      width,
    };
  }

  return {
    kind: "leaf",
    key: child.column.key,
    leafKeys,
    width,
  };
};

const buildGroupDragMeta = (
  group: ColumnGroupNode,
  resolveGroupLeafKeys: ResolveGroupLeafKeys,
  widthByKey: Map<string, number>
): ColumnGroupDragMeta => {
  const resolvedLeafKeys = resolveGroupLeafKeys(group.id);
  const columnKeys = resolvedLeafKeys.length
    ? resolvedLeafKeys
    : group.leafKeys.slice();

  return {
    columnKeys,
    groupId: group.id,
    depth: group.depth,
    parentGroupId: group.parent?.id ?? null,
    childNodes: group.children.map((child) => toChildMeta(child, widthByKey)),
    path: toPath(group),
  };
};

type NodeResolution =
  | { kind: "group"; group: ColumnGroupNode }
  | { kind: "leaf"; key: string };

export const useColumnGroupNodeDnD = ({
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
}: UseColumnGroupNodeDnDParams) => {
  const widthByKey = useMemo(() => {
    const next = new Map<string, number>();
    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];
      next.set(column.key, column.width ?? DEFAULT_COLUMN_WIDTH);
    }
    return next;
  }, [columns]);

  const resolveNode = useCallback(
    (nodeId: string, depth?: number): NodeResolution | null => {
      const group = getGroupNode(nodeId);
      const leaf = getLeafNode(nodeId);

      if (group && leaf && depth != null) {
        if (group.depth === depth) return { kind: "group", group };
        if (leaf.depth === depth) return { kind: "leaf", key: nodeId };
      }

      if (group) return { kind: "group", group };
      if (leaf) return { kind: "leaf", key: nodeId };
      return null;
    },
    [getGroupNode, getLeafNode]
  );

  const onNodeDragStart = useCallback(
    (event: DragEvent, nodeId: string, depth: number) => {
      const resolved = resolveNode(nodeId, depth);
      if (!resolved) return;
      if (resolved.kind === "leaf") {
        onColDragStart(event, resolved.key);
        return;
      }

      const meta = buildGroupDragMeta(
        resolved.group,
        resolveGroupLeafKeys,
        widthByKey
      );
      onGroupDragStart(event, meta);
    },
    [
      onColDragStart,
      onGroupDragStart,
      resolveGroupLeafKeys,
      resolveNode,
      widthByKey,
    ]
  );

  const onNodeDragOver = useCallback(
    (event: DragEvent, nodeId: string, depth: number) => {
      const resolved = resolveNode(nodeId, depth);
      if (!resolved) return;
      if (resolved.kind === "leaf") {
        onColDragOver(event, resolved.key);
        return;
      }

      const meta = buildGroupDragMeta(
        resolved.group,
        resolveGroupLeafKeys,
        widthByKey
      );
      onGroupDragOver(event, meta);
    },
    [
      onColDragOver,
      onGroupDragOver,
      resolveGroupLeafKeys,
      resolveNode,
      widthByKey,
    ]
  );

  const onNodeDrop = useCallback(
    (event: DragEvent, nodeId: string) => {
      const resolved = resolveNode(nodeId);
      if (!resolved) return;
      if (resolved.kind === "leaf") {
        onColDrop(event, resolved.key);
        return;
      }

      const meta = buildGroupDragMeta(
        resolved.group,
        resolveGroupLeafKeys,
        widthByKey
      );
      onGroupDrop(event, meta);
    },
    [
      onColDrop,
      onGroupDrop,
      resolveGroupLeafKeys,
      resolveNode,
      widthByKey,
    ]
  );

  return {
    onNodeDragStart,
    onNodeDragOver,
    onNodeDrop,
  };
};
