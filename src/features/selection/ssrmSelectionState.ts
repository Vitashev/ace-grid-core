import type {
  GridRow,
  GridServerRowModelSelectionNodeState,
  GridServerRowModelSelectionState,
} from "../../types";

export interface SsrmSelectionLookupCache {
  selectableRows: GridRow[];
  selectableRowIds: (string | number)[];
  selectableRowIdSet: Set<string | number>;
  leafRouteByRowId: Map<string | number, string[]>;
  groupRouteByRowId: Map<string | number, string[]>;
  descendantLeafRowsByGroupPath: Map<string, GridRow[]>;
}

const isValidNodeId = (nodeId: unknown): nodeId is string =>
  typeof nodeId === "string" && nodeId.length > 0;

const normalizeNodeSelectAll = (
  value: boolean | undefined,
  parentSelectAllChildren: boolean
) =>
  typeof value === "boolean" ? value : !parentSelectAllChildren;

const normalizeSelectionNodes = (
  nodes: GridServerRowModelSelectionNodeState[] | undefined,
  parentSelectAllChildren: boolean
): GridServerRowModelSelectionNodeState[] => {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  const byId = new Map<string, GridServerRowModelSelectionNodeState>();
  nodes.forEach((node) => {
    if (!node || !isValidNodeId(node.nodeId)) return;
    const selectAllChildren = normalizeNodeSelectAll(
      node.selectAllChildren,
      parentSelectAllChildren
    );
    byId.set(node.nodeId, {
      nodeId: node.nodeId,
      selectAllChildren,
      toggledNodes: normalizeSelectionNodes(node.toggledNodes, selectAllChildren),
    });
  });
  return Array.from(byId.values());
};

const selectionNodeIndexCache = new WeakMap<
  GridServerRowModelSelectionNodeState[],
  Map<string, GridServerRowModelSelectionNodeState>
>();

const getSelectionNodeIndex = (nodes: GridServerRowModelSelectionNodeState[]) => {
  const cached = selectionNodeIndexCache.get(nodes);
  if (cached) return cached;
  const next = new Map<string, GridServerRowModelSelectionNodeState>();
  nodes.forEach((node) => {
    next.set(node.nodeId, node);
  });
  selectionNodeIndexCache.set(nodes, next);
  return next;
};

const findNodeById = (
  nodes: GridServerRowModelSelectionNodeState[],
  nodeId: string
) => getSelectionNodeIndex(nodes).get(nodeId) ?? null;

const rowIdSetsEqual = (
  a: (string | number)[],
  b: (string | number)[]
) => {
  if (a.length !== b.length) return false;
  const bSet = new Set(b);
  for (let i = 0; i < a.length; i += 1) {
    if (!bSet.has(a[i])) return false;
  }
  return true;
};

const selectionNodesEqual = (
  a: GridServerRowModelSelectionNodeState[],
  b: GridServerRowModelSelectionNodeState[]
) => {
  if (a.length !== b.length) return false;
  const bMap = new Map<string, GridServerRowModelSelectionNodeState>();
  b.forEach((node) => {
    bMap.set(node.nodeId, node);
  });
  for (let i = 0; i < a.length; i += 1) {
    const aNode = a[i];
    const bNode = bMap.get(aNode.nodeId);
    if (!bNode) return false;
    if (aNode.selectAllChildren !== bNode.selectAllChildren) return false;
    const aChildren = aNode.toggledNodes ?? [];
    const bChildren = bNode.toggledNodes ?? [];
    if (!selectionNodesEqual(aChildren, bChildren)) return false;
  }
  return true;
};

const upsertSsrmTreeRoute = ({
  nodes,
  route,
  routeIndex,
  parentSelectAllChildren,
  selectAllChildren,
  clearDescendants,
}: {
  nodes: GridServerRowModelSelectionNodeState[];
  route: string[];
  routeIndex: number;
  parentSelectAllChildren: boolean;
  selectAllChildren: boolean;
  clearDescendants: boolean;
}): GridServerRowModelSelectionNodeState[] => {
  if (routeIndex >= route.length) return nodes;
  const nodeId = route[routeIndex];
  const existingIndex = nodes.findIndex((node) => node.nodeId === nodeId);
  const existing = existingIndex >= 0 ? nodes[existingIndex] : null;
  const next = nodes.slice();

  const currentSelectAllChildren = existing
    ? normalizeNodeSelectAll(existing.selectAllChildren, parentSelectAllChildren)
    : parentSelectAllChildren;

  let nextNode: GridServerRowModelSelectionNodeState;

  if (routeIndex === route.length - 1) {
    nextNode = {
      nodeId,
      selectAllChildren,
      toggledNodes: clearDescendants
        ? []
        : normalizeSelectionNodes(existing?.toggledNodes, selectAllChildren),
    };
  } else {
    const nextChildren = upsertSsrmTreeRoute({
      nodes: normalizeSelectionNodes(existing?.toggledNodes, currentSelectAllChildren),
      route,
      routeIndex: routeIndex + 1,
      parentSelectAllChildren: currentSelectAllChildren,
      selectAllChildren,
      clearDescendants,
    });
    nextNode = {
      nodeId,
      selectAllChildren: currentSelectAllChildren,
      toggledNodes: nextChildren,
    };
  }

  const shouldPrune =
    (nextNode.toggledNodes?.length ?? 0) === 0 &&
    nextNode.selectAllChildren === parentSelectAllChildren;

  if (shouldPrune) {
    if (existingIndex >= 0) next.splice(existingIndex, 1);
    return next;
  }

  if (existingIndex >= 0) {
    next[existingIndex] = nextNode;
  } else {
    next.push(nextNode);
  }

  return next;
};

export interface SetSsrmTreeRouteSelectionOptions {
  clearDescendants?: boolean;
  clearFlatRowToggles?: boolean;
}

export const createSsrmSelectionState = (
  selectAllChildren: boolean = false
): GridServerRowModelSelectionState => ({
  selectAll: selectAllChildren,
  toggledRowIds: [],
  selectAllChildren,
  toggledNodes: [],
});

export const normalizeSsrmSelectionState = (
  state?: GridServerRowModelSelectionState | null
): GridServerRowModelSelectionState => {
  if (!state) return createSsrmSelectionState(false);
  const rootSelectAllChildren =
    typeof state.selectAllChildren === "boolean"
      ? state.selectAllChildren
      : Boolean(state.selectAll);
  const toggledRowIdSet = new Set<string | number>();
  (state.toggledRowIds ?? []).forEach((id) => {
    if (id == null) return;
    toggledRowIdSet.add(id);
  });
  return {
    selectAll: rootSelectAllChildren,
    toggledRowIds: Array.from(toggledRowIdSet),
    selectAllChildren: rootSelectAllChildren,
    toggledNodes: normalizeSelectionNodes(state.toggledNodes, rootSelectAllChildren),
  };
};

export const ssrmSelectionStateEquals = (
  a: GridServerRowModelSelectionState,
  b: GridServerRowModelSelectionState
) => {
  const normalizedA = normalizeSsrmSelectionState(a);
  const normalizedB = normalizeSsrmSelectionState(b);
  if (normalizedA.selectAllChildren !== normalizedB.selectAllChildren) return false;
  if (!rowIdSetsEqual(normalizedA.toggledRowIds, normalizedB.toggledRowIds)) {
    return false;
  }
  return selectionNodesEqual(
    normalizedA.toggledNodes ?? [],
    normalizedB.toggledNodes ?? []
  );
};

export const hasSsrmSelectionChanges = (
  state: GridServerRowModelSelectionState
) => {
  return hasSsrmSelectionChangesNormalized(normalizeSsrmSelectionState(state));
};

export const hasSsrmSelectionChangesNormalized = (
  state: GridServerRowModelSelectionState
) => {
  return (
    state.toggledRowIds.length > 0 || (state.toggledNodes?.length ?? 0) > 0
  );
};

export const isSsrmSelectionAllSelected = (
  state: GridServerRowModelSelectionState
) => {
  return isSsrmSelectionAllSelectedNormalized(normalizeSsrmSelectionState(state));
};

export const isSsrmSelectionAllSelectedNormalized = (
  state: GridServerRowModelSelectionState
) => {
  const rootSelected = Boolean(state.selectAllChildren);
  return rootSelected && !hasSsrmSelectionChangesNormalized(state);
};

export const setSsrmSelectionRoot = (
  state: GridServerRowModelSelectionState,
  selectAllChildren: boolean
) =>
  setSsrmSelectionRootNormalized(normalizeSsrmSelectionState(state), selectAllChildren);

export const setSsrmSelectionRootNormalized = (
  state: GridServerRowModelSelectionState,
  selectAllChildren: boolean
) => ({
    ...state,
    selectAll: selectAllChildren,
    selectAllChildren,
    toggledRowIds: [],
    toggledNodes: [],
  });

export const isSsrmRowSelectedFlat = (
  state: GridServerRowModelSelectionState,
  rowId: string | number,
  toggledRowIdSet?: Set<string | number>
) => {
  return isSsrmRowSelectedFlatNormalized(
    normalizeSsrmSelectionState(state),
    rowId,
    toggledRowIdSet
  );
};

export const isSsrmRowSelectedFlatNormalized = (
  state: GridServerRowModelSelectionState,
  rowId: string | number,
  toggledRowIdSet?: Set<string | number>
) => {
  const toggledSet = toggledRowIdSet ?? new Set(state.toggledRowIds);
  return state.selectAllChildren
    ? !toggledSet.has(rowId)
    : toggledSet.has(rowId);
};

export const setSsrmFlatSelectionForRowIds = (
  state: GridServerRowModelSelectionState,
  rowIds: (string | number)[],
  shouldSelect: boolean
) => {
  return setSsrmFlatSelectionForRowIdsNormalized(
    normalizeSsrmSelectionState(state),
    rowIds,
    shouldSelect
  );
};

export const setSsrmFlatSelectionForRowIdsNormalized = (
  state: GridServerRowModelSelectionState,
  rowIds: (string | number)[],
  shouldSelect: boolean
) => {
  const nextToggled = new Set(state.toggledRowIds);
  rowIds.forEach((rowId) => {
    if (rowId == null) return;
    if (shouldSelect === Boolean(state.selectAllChildren)) nextToggled.delete(rowId);
    else nextToggled.add(rowId);
  });
  return {
    ...state,
    toggledRowIds: Array.from(nextToggled),
  };
};

export const getRowGroupingPathLevels = (row: GridRow): string[] => {
  const groupValueChain = row.meta?.group?.valueChain;
  if (Array.isArray(groupValueChain) && groupValueChain.length > 0) {
    return groupValueChain
      .map((entry) => entry?.path)
      .filter((path): path is string => typeof path === "string" && path.length > 0);
  }

  const groupingPathLevels = row.meta?.groupingPath?.levels;
  if (Array.isArray(groupingPathLevels) && groupingPathLevels.length > 0) {
    return groupingPathLevels
      .map((entry) => entry?.path)
      .filter((path): path is string => typeof path === "string" && path.length > 0);
  }

  const fallbackPath = row.meta?.group?.path ?? row.meta?.groupingPath?.path;
  if (typeof fallbackPath === "string" && fallbackPath.length > 0) {
    return [fallbackPath];
  }

  return [];
};

export const getSsrmGroupRoute = (row: GridRow): string[] => {
  const levels = getRowGroupingPathLevels(row);
  if (levels.length) return levels;
  const fallbackPath = row.meta?.group?.path;
  if (typeof fallbackPath === "string" && fallbackPath.length > 0) {
    return [fallbackPath];
  }
  return [];
};

export const getSsrmLeafRoute = (row: GridRow): string[] => [
  ...getRowGroupingPathLevels(row),
  String(row.id),
];

export const getSsrmTreeSelectionForRoute = (
  state: GridServerRowModelSelectionState,
  route: string[]
) => {
  return getSsrmTreeSelectionForRouteNormalized(
    normalizeSsrmSelectionState(state),
    route
  );
};

export const getSsrmTreeSelectionForRouteNormalized = (
  state: GridServerRowModelSelectionState,
  route: string[]
) => {
  let current = Boolean(state.selectAllChildren);
  let nodes = state.toggledNodes ?? [];
  for (let i = 0; i < route.length; i += 1) {
    const node = findNodeById(nodes, route[i]);
    if (!node) return current;
    current = node.selectAllChildren ?? !current;
    nodes = node.toggledNodes ?? [];
  }
  return current;
};

export const getSsrmTreeNodeAtRoute = (
  state: GridServerRowModelSelectionState,
  route: string[]
) => {
  return getSsrmTreeNodeAtRouteNormalized(normalizeSsrmSelectionState(state), route);
};

export const getSsrmTreeNodeAtRouteNormalized = (
  state: GridServerRowModelSelectionState,
  route: string[]
) => {
  let nodes = state.toggledNodes ?? [];
  let node: GridServerRowModelSelectionNodeState | null = null;
  for (let i = 0; i < route.length; i += 1) {
    node = findNodeById(nodes, route[i]);
    if (!node) return null;
    nodes = node.toggledNodes ?? [];
  }
  return node;
};

export const setSsrmTreeRouteSelection = (
  state: GridServerRowModelSelectionState,
  route: string[],
  selectAllChildren: boolean,
  options: SetSsrmTreeRouteSelectionOptions = {}
) => {
  return setSsrmTreeRouteSelectionNormalized(
    normalizeSsrmSelectionState(state),
    route,
    selectAllChildren,
    options
  );
};

export const setSsrmTreeRouteSelectionNormalized = (
  state: GridServerRowModelSelectionState,
  route: string[],
  selectAllChildren: boolean,
  options: SetSsrmTreeRouteSelectionOptions = {}
) => {
  const cleanedRoute = route.filter(
    (segment): segment is string =>
      typeof segment === "string" && segment.length > 0
  );
  if (!cleanedRoute.length) return state;

  const nextNodes = upsertSsrmTreeRoute({
    nodes: state.toggledNodes ?? [],
    route: cleanedRoute,
    routeIndex: 0,
    parentSelectAllChildren: Boolean(state.selectAllChildren),
    selectAllChildren,
    clearDescendants: Boolean(options.clearDescendants),
  });

  return {
    ...state,
    selectAll: Boolean(state.selectAllChildren),
    selectAllChildren: Boolean(state.selectAllChildren),
    toggledRowIds: options.clearFlatRowToggles ? [] : state.toggledRowIds,
    toggledNodes: nextNodes,
  };
};
