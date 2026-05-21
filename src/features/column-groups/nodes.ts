import type { GridColumn, GridColumnDef, GridColumnGroup } from "../../types";

export type ColumnHierarchyNodeKind = "group" | "leaf";

export interface ColumnHierarchyNodeBase {
  id: string;
  kind: ColumnHierarchyNodeKind;
  depth: number;
  parentId: string | null;
  order: number;
}

export interface ColumnHierarchyGroupNode extends ColumnHierarchyNodeBase {
  kind: "group";
  def: GridColumnGroup;
  childIds: string[];
  leafKeys: string[];
}

export interface ColumnHierarchyLeafNode extends ColumnHierarchyNodeBase {
  kind: "leaf";
  column: GridColumn;
}

export type ColumnHierarchyNode = ColumnHierarchyGroupNode | ColumnHierarchyLeafNode;

export interface ColumnHierarchy {
  nodes: Map<string, ColumnHierarchyNode>;
  depthMap: Map<number, string[]>;
  rootIds: string[];
  leafOrder: string[];
}

const isColumnGroupDef = (def: GridColumnDef): def is GridColumnGroup =>
  typeof (def as GridColumnGroup).children !== "undefined";

const ensureGroupId = (
  group: GridColumnGroup,
  autoSeq: { current: number },
  path: number[]
): string => {
  if (group.groupId && group.groupId.trim().length) return group.groupId;
  autoSeq.current += 1;
  return `__grid_group_${path.join("_")}_${autoSeq.current}__`;
};

export const buildColumnHierarchy = (
  columnDefs: GridColumnDef[]
): ColumnHierarchy => {
  const nodes = new Map<string, ColumnHierarchyNode>();
  const depthMap = new Map<number, string[]>();
  const leafOrder: string[] = [];
  const rootIds: string[] = [];
  const autoSeq = { current: 0 };

  const register = (node: ColumnHierarchyNode) => {
    nodes.set(node.id, node);
    if (!depthMap.has(node.depth)) depthMap.set(node.depth, []);
    depthMap.get(node.depth)!.push(node.id);
  };

  const visit = (
    defs: GridColumnDef[],
    depth: number,
    parentId: string | null,
    path: number[]
  ) => {
    defs.forEach((def, index) => {
      const currentPath = [...path, index];
      if (isColumnGroupDef(def)) {
        const id = ensureGroupId(def, autoSeq, currentPath);
        const groupNode: ColumnHierarchyGroupNode = {
          id,
          kind: "group",
          depth,
          parentId,
          order: currentPath[currentPath.length - 1] ?? 0,
          def,
          childIds: [],
          leafKeys: [],
        };
        register(groupNode);
        if (depth === 0) rootIds.push(id);
        visitGroupChildren(def.children, depth + 1, id, currentPath, groupNode);
      } else {
        const column = def as GridColumn;
        const node: ColumnHierarchyLeafNode = {
          id: column.key,
          kind: "leaf",
          depth,
          parentId,
          order: currentPath[currentPath.length - 1] ?? 0,
          column,
        };
        register(node);
        leafOrder.push(column.key);
        if (parentId) {
          const parent = nodes.get(parentId);
          if (parent && parent.kind === "group") {
            parent.childIds.push(node.id);
            parent.leafKeys.push(column.key);
          }
        } else {
          rootIds.push(node.id);
        }
      }
    });
  };

  const visitGroupChildren = (
    children: GridColumnDef[],
    depth: number,
    parentId: string,
    path: number[],
    parentNode: ColumnHierarchyGroupNode
  ) => {
    children.forEach((child, index) => {
      const currentPath = [...path, index];
      if (isColumnGroupDef(child)) {
        const id = ensureGroupId(child, autoSeq, currentPath);
        const node: ColumnHierarchyGroupNode = {
          id,
          kind: "group",
          depth,
          parentId,
          order: currentPath[currentPath.length - 1] ?? 0,
          def: child,
          childIds: [],
          leafKeys: [],
        };
        register(node);
        parentNode.childIds.push(id);
        visitGroupChildren(child.children, depth + 1, id, currentPath, node);
        parentNode.leafKeys.push(...node.leafKeys);
      } else {
        const column = child as GridColumn;
        const node: ColumnHierarchyLeafNode = {
          id: column.key,
          kind: "leaf",
          depth,
          parentId,
          order: currentPath[currentPath.length - 1] ?? 0,
          column,
        };
        register(node);
        parentNode.childIds.push(node.id);
        parentNode.leafKeys.push(column.key);
        leafOrder.push(column.key);
      }
    });
  };

  visit(columnDefs, 0, null, []);

  return {
    nodes,
    depthMap,
    rootIds,
    leafOrder,
  };
};

export const rebuildColumnDefsFromTree = (
  tree: ColumnHierarchy
): GridColumnDef[] => {
  const toDef = (nodeId: string): GridColumnDef | null => {
    const node = tree.nodes.get(nodeId);
    if (!node) return null;
    if (node.kind === "leaf") return node.column;
    const children = node.childIds
      .map((childId) => toDef(childId))
      .filter(Boolean) as GridColumnDef[];
    return {
      ...node.def,
      groupId: node.id,
      children,
    };
  };

  return tree.rootIds
    .map((rootId) => toDef(rootId))
    .filter(Boolean) as GridColumnDef[];
};
