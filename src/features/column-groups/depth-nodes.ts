import type { GridColumn, GridColumnDef } from "../../types";

/**
 * DnDNode represents a single node in the column hierarchy,
 * flattened by depth for efficient drag-and-drop operations.
 */
export interface DnDNode {
  nodeId: string;              // groupId for groups, columnKey for leaves
  type: 'group' | 'leaf';
  depth: number;               // 0 = root, 1 = first nesting, etc.
  parentId: string | null;     // null for root nodes
  order: number;               // Sequential position within depth level

  // Group-specific data
  groupData?: {
    title: string;
    headerName?: string;
    isExpandable: boolean;
    marryChildren: boolean;
    openByDefault?: boolean;
  };

  // Leaf-specific data
  columnKey?: string;
  column?: GridColumn;
}

/**
 * DepthMap organizes nodes by depth level for O(1) DnD operations.
 */
export interface DepthMap {
  maxDepth: number;
  byDepth: Map<number, DnDNode[]>;     // depth → ordered array of nodes
  byNodeId: Map<string, DnDNode>;      // nodeId → node (fast lookup)
}

/**
 * Type guard for checking if a column def is a group.
 */
function isColumnGroupDef(def: GridColumnDef): def is {
  groupId: string;
  title?: string;
  headerName?: string;
  children: GridColumnDef[];
  marryChildren?: boolean;
  openByDefault?: boolean;
} {
  return 'children' in def && Array.isArray(def.children);
}

let groupIdCounter = 0;

/**
 * Generate a unique group ID when one isn't provided.
 */
function generateGroupId(): string {
  return `__group_${groupIdCounter++}`;
}

/**
 * Build a DepthMap from a column definition tree.
 *
 * This function traverses the column definition tree and creates a flat
 * representation where each depth level is stored as an ordered array.
 *
 * Time complexity: O(N) where N = total nodes
 * Space complexity: O(N)
 */
export function buildDepthMap(columnDefs: GridColumnDef[]): DepthMap {
  const byDepth = new Map<number, DnDNode[]>();
  const byNodeId = new Map<string, DnDNode>();
  let maxDepth = 0;
  let globalOrder = 0;

  /**
   * Recursively traverse the column definition tree.
   */
  function traverse(
    defs: GridColumnDef[],
    depth: number,
    parentId: string | null
  ): void {
    // Ensure depth array exists
    if (!byDepth.has(depth)) {
      byDepth.set(depth, []);
    }

    const depthNodes = byDepth.get(depth)!;

    defs.forEach((def) => {
      if (isColumnGroupDef(def)) {
        // Create group node
        const nodeId = def.groupId || generateGroupId();
        const node: DnDNode = {
          nodeId,
          type: 'group',
          depth,
          parentId,
          order: globalOrder++,
          groupData: {
            title: def.title || def.headerName || nodeId,
            headerName: def.headerName,
            isExpandable: def.children.length > 0,
            marryChildren: def.marryChildren ?? false,
            openByDefault: def.openByDefault
          }
        };

        depthNodes.push(node);
        byNodeId.set(nodeId, node);
        maxDepth = Math.max(maxDepth, depth);

        // Recurse into children at next depth
        if (def.children.length > 0) {
          traverse(def.children, depth + 1, nodeId);
        }
      } else {
        // Create leaf node
        const column = def as GridColumn;
        const node: DnDNode = {
          nodeId: column.key,
          type: 'leaf',
          depth,
          parentId,
          order: globalOrder++,
          columnKey: column.key,
          column
        };

        depthNodes.push(node);
        byNodeId.set(column.key, node);
        maxDepth = Math.max(maxDepth, depth);
      }
    });
  }

  // Start traversal from root
  traverse(columnDefs, 0, null);

  return { maxDepth, byDepth, byNodeId };
}

/**
 * Rebuild a column definition tree from a DepthMap.
 *
 * This reconstructs the hierarchical column structure from the flat
 * per-depth arrays, using parentId links to restore the tree.
 *
 * Time complexity: O(N) where N = total nodes
 * Space complexity: O(N)
 */
export function rebuildColumnDefsFromDepthMap(depthMap: DepthMap): GridColumnDef[] {
  const rootNodes = depthMap.byDepth.get(0) || [];

  /**
   * Recursively build a column definition from a node.
   */
  function buildDef(node: DnDNode): GridColumnDef {
    if (node.type === 'leaf') {
      // Leaf nodes return their column directly
      return node.column!;
    }

    // Group nodes: find all children at next depth with this parentId
    const childDepth = node.depth + 1;
    const allChildNodes = depthMap.byDepth.get(childDepth) || [];
    const childNodes = allChildNodes
      .filter(n => n.parentId === node.nodeId)
      .sort((a, b) => a.order - b.order);

    const children = childNodes.map(child => buildDef(child));

    return {
      groupId: node.nodeId,
      title: node.groupData!.title,
      headerName: node.groupData!.headerName,
      marryChildren: node.groupData!.marryChildren,
      openByDefault: node.groupData!.openByDefault,
      children
    };
  }

  // Build from root nodes in order
  return rootNodes
    .sort((a, b) => a.order - b.order)
    .map(node => buildDef(node));
}

/**
 * Check if a node is an ancestor of another node.
 *
 * This prevents circular moves (e.g., moving a parent into its own child).
 */
export function isAncestorOf(
  depthMap: DepthMap,
  ancestorId: string,
  descendantId: string
): boolean {
  let current = depthMap.byNodeId.get(descendantId);

  while (current && current.parentId !== null) {
    if (current.parentId === ancestorId) {
      return true;
    }
    current = depthMap.byNodeId.get(current.parentId);
  }

  return false;
}

/**
 * Get all child nodes of a given node.
 */
export function getChildrenOf(
  depthMap: DepthMap,
  nodeId: string
): DnDNode[] {
  const node = depthMap.byNodeId.get(nodeId);
  if (!node) return [];

  const childDepth = node.depth + 1;
  const allChildNodes = depthMap.byDepth.get(childDepth) || [];

  return allChildNodes.filter(n => n.parentId === nodeId);
}

/**
 * Get all descendant leaf keys of a node (recursively).
 */
export function getLeafKeysOf(
  depthMap: DepthMap,
  nodeId: string
): string[] {
  const node = depthMap.byNodeId.get(nodeId);
  if (!node) return [];

  if (node.type === 'leaf') {
    return [node.columnKey!];
  }

  const children = getChildrenOf(depthMap, nodeId);
  return children.flatMap(child => getLeafKeysOf(depthMap, child.nodeId));
}

/**
 * Clone a DepthMap for immutable updates.
 */
export function cloneDepthMap(depthMap: DepthMap): DepthMap {
  const newByDepth = new Map<number, DnDNode[]>();

  depthMap.byDepth.forEach((nodes, depth) => {
    newByDepth.set(depth, nodes.map(node => ({ ...node })));
  });

  const newByNodeId = new Map<string, DnDNode>();
  newByDepth.forEach(nodes => {
    nodes.forEach(node => newByNodeId.set(node.nodeId, node));
  });

  return {
    maxDepth: depthMap.maxDepth,
    byDepth: newByDepth,
    byNodeId: newByNodeId
  };
}
