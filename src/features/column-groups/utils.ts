import type {
  GridColumn,
  GridColumnDef,
  GridColumnGroup,
} from "../../types";
import type {
  ColumnGroupId,
  ColumnGroupNode,
  ColumnLeafNode,
  ColumnTreeNode,
  NormalizedColumnTree,
} from "./types";

export const isColumnGroupDef = (
  def: GridColumnDef
): def is GridColumnGroup =>
  typeof (def as GridColumnGroup).children !== "undefined";

const makeAutoGroupId = (seq: number) => `__ace_grid_group_${seq}__`;

const isLeafVisibleWithOverrides = (
  leaf: ColumnLeafNode,
  overrides: Map<ColumnGroupId, boolean>,
  getDefaultOpen: (group: ColumnGroupNode) => boolean
) => {
  let current: ColumnLeafNode | ColumnGroupNode = leaf;
  while (current.parent) {
    const parent = current.parent as ColumnGroupNode;
    const parentState = overrides.has(parent.id)
      ? overrides.get(parent.id)!
      : getDefaultOpen(parent);
    const show = current.columnGroupShow;
    if (parentState) {
      if (show === "closed") return false;
    } else if (show === "open") {
      return false;
    }
    current = parent;
  }
  return true;
};

export const collectLeafKeysForNode = (
  node: ColumnTreeNode,
  acc: string[]
) => {
  if (node.kind === "leaf") {
    acc.push(node.column.key);
    return;
  }
  for (const child of node.children) collectLeafKeysForNode(child, acc);
};

export const normalizeColumnTree = (
  columnDefs: GridColumnDef[]
): NormalizedColumnTree => {
  const leafNodes: ColumnLeafNode[] = [];
  const leafByKey = new Map<string, ColumnLeafNode>();
  const groupsById = new Map<ColumnGroupId, ColumnGroupNode>();
  let maxDepth = 0;
  let autoGroupSeq = 0;
  const provisionalGroupChildren = new Map<
    ColumnGroupNode,
    GridColumnDef[]
  >();

  const buildNodes = (
    defs: GridColumnDef[],
    parent: ColumnGroupNode | null,
    depth: number
  ): ColumnTreeNode[] =>
    defs.map((def) => {
      if (isColumnGroupDef(def)) {
        const id =
          def.groupId && def.groupId.trim().length
            ? def.groupId
            : makeAutoGroupId(autoGroupSeq++);
        const node: ColumnGroupNode = {
          kind: "group",
          id,
          depth,
          parent,
          def,
          columnGroupShow: def.columnGroupShow,
          children: [],
          leafKeys: [],
          initialOpen:
            typeof def.openByDefault === "boolean" ? def.openByDefault : true,
          isExpandable: false,
        };
        groupsById.set(id, node);
        provisionalGroupChildren.set(node, def.children);
        return node;
      }

      const column: GridColumn = def;
      const leaf: ColumnLeafNode = {
        kind: "leaf",
        column,
        depth,
        parent,
        columnGroupShow: column.columnGroupShow,
        index: leafNodes.length,
      };
      leafNodes.push(leaf);
      leafByKey.set(column.key, leaf);
      if (depth > maxDepth) maxDepth = depth;
      return leaf;
    });

  const roots = buildNodes(columnDefs, null, 0);

  // Resolve group children & derived metadata
  const resolveGroup = (group: ColumnGroupNode) => {
    const defs = provisionalGroupChildren.get(group) ?? [];
    group.children = buildNodes(defs, group, group.depth + 1);
    group.leafKeys = [];
    for (const child of group.children) {
      collectLeafKeysForNode(child, group.leafKeys);
    }
    let openCount = 0;
    let closedCount = 0;
    const openOverrides = new Map<ColumnGroupId, boolean>([
      [group.id, true],
    ]);
    const closedOverrides = new Map<ColumnGroupId, boolean>([
      [group.id, false],
    ]);
    const assumeOpen = () => true;
    for (const key of group.leafKeys) {
      const leaf = leafByKey.get(key);
      if (!leaf) continue;
      if (isLeafVisibleWithOverrides(leaf, openOverrides, assumeOpen))
        openCount += 1;
      if (
        isLeafVisibleWithOverrides(leaf, closedOverrides, assumeOpen)
      )
        closedCount += 1;
    }
    group.isExpandable = openCount !== closedCount;
    if (group.depth + 1 > maxDepth) maxDepth = group.depth + 1;
    provisionalGroupChildren.delete(group);
    for (const child of group.children) {
      if (child.kind === "group") resolveGroup(child);
      else if (child.depth > maxDepth) maxDepth = child.depth;
    }
  };

  for (const group of groupsById.values()) {
    if (group.children.length === 0) resolveGroup(group);
  }

  const initialExpandedState = new Map<ColumnGroupId, boolean>();
  for (const [id, group] of groupsById) {
    initialExpandedState.set(id, group.initialOpen);
  }

  return {
    roots,
    leafNodes,
    leafByKey,
    groupsById,
    maxDepth,
    initialExpandedState,
  };
};

export const isLeafVisible = (
  leaf: ColumnLeafNode,
  expanded: Map<ColumnGroupId, boolean>
) =>
  isLeafVisibleWithOverrides(
    leaf,
    new Map(),
    (group) => expanded.get(group.id) ?? group.initialOpen
  );
