import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  GridRowSelectionChangeMeta,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionProps,
  GridServerRowModelSelectionState,
} from "../../../types";
import {
  createSsrmSelectionState,
  getSsrmGroupRoute,
  getSsrmLeafRoute,
  getSsrmTreeSelectionForRouteNormalized,
  isSsrmRowSelectedFlatNormalized,
  normalizeSsrmSelectionState,
  ssrmSelectionStateEquals,
  type SsrmSelectionLookupCache,
} from "../ssrmSelectionState";

const EMPTY_ROWS: GridRow[] = [];
const EMPTY_ID_ARRAY: (string | number)[] = [];

const rowIdArraysEqual = (
  a: (string | number)[],
  b: (string | number)[]
) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

type SsrmLookupMutableState = {
  descendantMode: boolean;
  loadedRowsById: Map<string | number, GridRow>;
  selectableRowsById: Map<string | number, GridRow>;
  leafRouteByRowId: Map<string | number, string[]>;
  groupRouteByRowId: Map<string | number, string[]>;
  descendantLeafRowsByGroupPath: Map<string, GridRow[]>;
  leafGroupPathsByRowId: Map<string | number, string[]>;
};

const createSsrmLookupMutableState = (
  descendantMode: boolean
): SsrmLookupMutableState => ({
  descendantMode,
  loadedRowsById: new Map<string | number, GridRow>(),
  selectableRowsById: new Map<string | number, GridRow>(),
  leafRouteByRowId: new Map<string | number, string[]>(),
  groupRouteByRowId: new Map<string | number, string[]>(),
  descendantLeafRowsByGroupPath: new Map<string, GridRow[]>(),
  leafGroupPathsByRowId: new Map<string | number, string[]>(),
});

const removeLeafFromDescendantMap = (
  descendantLeafRowsByGroupPath: Map<string, GridRow[]>,
  groupPaths: string[],
  rowId: string | number
) => {
  for (let i = 0; i < groupPaths.length; i += 1) {
    const groupPath = groupPaths[i];
    const rows = descendantLeafRowsByGroupPath.get(groupPath);
    if (!rows || rows.length === 0) continue;

    let write = 0;
    for (let read = 0; read < rows.length; read += 1) {
      if (rows[read].id !== rowId) {
        rows[write] = rows[read];
        write += 1;
      }
    }

    if (write === 0) {
      descendantLeafRowsByGroupPath.delete(groupPath);
      continue;
    }

    if (write < rows.length) {
      rows.length = write;
    }
  }
};

const removeRowFromSsrmLookupState = (
  state: SsrmLookupMutableState,
  rowId: string | number
) => {
  state.loadedRowsById.delete(rowId);
  state.selectableRowsById.delete(rowId);
  state.groupRouteByRowId.delete(rowId);
  state.leafRouteByRowId.delete(rowId);
  const leafGroupPaths = state.leafGroupPathsByRowId.get(rowId);
  if (leafGroupPaths && leafGroupPaths.length) {
    removeLeafFromDescendantMap(
      state.descendantLeafRowsByGroupPath,
      leafGroupPaths,
      rowId
    );
  }
  state.leafGroupPathsByRowId.delete(rowId);
};

const addOrUpdateRowInSsrmLookupState = (
  state: SsrmLookupMutableState,
  row: GridRow
) => {
  const rowId = row.id;
  const isGroupRow = Boolean(row.meta?.group);

  if (isGroupRow) {
    state.groupRouteByRowId.set(rowId, getSsrmGroupRoute(row));
    state.selectableRowsById.delete(rowId);
    state.leafRouteByRowId.delete(rowId);
    const oldGroupPaths = state.leafGroupPathsByRowId.get(rowId);
    if (oldGroupPaths && oldGroupPaths.length) {
      removeLeafFromDescendantMap(
        state.descendantLeafRowsByGroupPath,
        oldGroupPaths,
        rowId
      );
    }
    state.leafGroupPathsByRowId.delete(rowId);
    state.loadedRowsById.set(rowId, row);
    return;
  }

  state.groupRouteByRowId.delete(rowId);
  state.selectableRowsById.set(rowId, row);

  if (!state.descendantMode) {
    state.leafRouteByRowId.delete(rowId);
    const oldGroupPaths = state.leafGroupPathsByRowId.get(rowId);
    if (oldGroupPaths && oldGroupPaths.length) {
      removeLeafFromDescendantMap(
        state.descendantLeafRowsByGroupPath,
        oldGroupPaths,
        rowId
      );
    }
    state.leafGroupPathsByRowId.delete(rowId);
    state.loadedRowsById.set(rowId, row);
    return;
  }

  const leafRoute = getSsrmLeafRoute(row);
  state.leafRouteByRowId.set(rowId, leafRoute);
  const groupPaths = leafRoute.slice(0, Math.max(0, leafRoute.length - 1));
  state.leafGroupPathsByRowId.set(rowId, groupPaths);
  for (let i = 0; i < groupPaths.length; i += 1) {
    const groupPath = groupPaths[i];
    const existingRows = state.descendantLeafRowsByGroupPath.get(groupPath);
    if (!existingRows) {
      state.descendantLeafRowsByGroupPath.set(groupPath, [row]);
      continue;
    }
    const existingIndex = existingRows.findIndex((entry) => entry.id === rowId);
    if (existingIndex >= 0) existingRows[existingIndex] = row;
    else existingRows.push(row);
  }

  state.loadedRowsById.set(rowId, row);
};

const buildSsrmLookupCacheIncremental = (
  previousState: SsrmLookupMutableState | null,
  loadedRows: GridRow[],
  descendantMode: boolean
): { state: SsrmLookupMutableState; cache: SsrmSelectionLookupCache } => {
  const state =
    previousState && previousState.descendantMode === descendantMode
      ? previousState
      : createSsrmLookupMutableState(descendantMode);

  const nextLoadedRowsById = new Map<string | number, GridRow>();
  for (let i = 0; i < loadedRows.length; i += 1) {
    const row = loadedRows[i];
    nextLoadedRowsById.set(row.id, row);
  }

  if (state !== previousState) {
    for (let i = 0; i < loadedRows.length; i += 1) {
      addOrUpdateRowInSsrmLookupState(state, loadedRows[i]);
    }
  } else {
    const existingRowIds = Array.from(state.loadedRowsById.keys());
    for (let i = 0; i < existingRowIds.length; i += 1) {
      const existingRowId = existingRowIds[i];
      if (!nextLoadedRowsById.has(existingRowId)) {
        removeRowFromSsrmLookupState(state, existingRowId);
      }
    }

    for (let i = 0; i < loadedRows.length; i += 1) {
      const row = loadedRows[i];
      const rowId = row.id;
      const previousRow = state.loadedRowsById.get(rowId);
      if (previousRow === row) continue;
      if (previousRow) {
        removeRowFromSsrmLookupState(state, rowId);
      }
      addOrUpdateRowInSsrmLookupState(state, row);
    }
  }

  state.loadedRowsById = nextLoadedRowsById;

  const selectableRows: GridRow[] = [];
  for (let i = 0; i < loadedRows.length; i += 1) {
    const row = loadedRows[i];
    if (row.meta?.group) continue;
    const cachedRow = state.selectableRowsById.get(row.id);
    if (cachedRow) selectableRows.push(cachedRow);
  }
  const selectableRowIds = selectableRows.map((row) => row.id);
  const selectableRowIdSet = new Set<string | number>(selectableRowIds);

  return {
    state,
    cache: {
      selectableRows,
      selectableRowIds,
      selectableRowIdSet,
      leafRouteByRowId: state.leafRouteByRowId,
      groupRouteByRowId: state.groupRouteByRowId,
      descendantLeafRowsByGroupPath: state.descendantLeafRowsByGroupPath,
    },
  };
};

export interface UseSsrmSelectionControllerArgs {
  rows: GridRow[];
  isRowSelection: boolean;
  clientGroupSelects?: GridServerRowModelGroupSelects;
  onRowSelectionChange?: (
    selectedRowIds: (string | number)[],
    meta?: GridRowSelectionChangeMeta
  ) => void;
  serverRowModelEnabled: boolean;
  ssrmSelectionConfig?: GridServerRowModelSelectionProps;
  serverRowModelGetRow: (rowIndex: number) => GridRow;
  serverRowModelRowIndexById: Map<string | number, number>;
  serverRowModelVersion?: number;
}

export interface UseSsrmSelectionControllerResult {
  resolvedClientGroupSelects: GridServerRowModelGroupSelects;
  ssrmSelectionEnabled: boolean;
  ssrmGroupSelects: GridServerRowModelGroupSelects;
  ssrmSelectionState: GridServerRowModelSelectionState;
  ssrmSelectionLookupCache: SsrmSelectionLookupCache | null;
  selectionRows: GridRow[];
  selectedRowIds: (string | number)[];
  selectedRowIdSet: Set<string | number>;
  setRowSelectionIds: Dispatch<SetStateAction<(string | number)[]>>;
  handleSsrmSelectionStateChange: (
    nextState: GridServerRowModelSelectionState
  ) => void;
}

export const useSsrmSelectionController = ({
  rows,
  isRowSelection,
  clientGroupSelects,
  onRowSelectionChange,
  serverRowModelEnabled,
  ssrmSelectionConfig,
  serverRowModelGetRow,
  serverRowModelRowIndexById,
  serverRowModelVersion: _serverRowModelVersion,
}: UseSsrmSelectionControllerArgs): UseSsrmSelectionControllerResult => {
  const resolvedClientGroupSelects: GridServerRowModelGroupSelects =
    clientGroupSelects === "self" ||
    clientGroupSelects === "descendants" ||
    clientGroupSelects === "filteredDescendants"
      ? clientGroupSelects
      : "descendants";

  const ssrmSelectionEnabled = Boolean(
    serverRowModelEnabled &&
      isRowSelection &&
      (ssrmSelectionConfig?.enabled ?? true)
  );
  const ssrmGroupSelects: GridServerRowModelGroupSelects =
    ssrmSelectionConfig?.groupSelects ?? "self";
  const ssrmDescendantSelectionMode =
    ssrmGroupSelects === "descendants" ||
    ssrmGroupSelects === "filteredDescendants";

  const [rowSelectionIds, setRowSelectionIds] = useState<(string | number)[]>(
    () => rows.filter((row) => row.selected).map((row) => row.id)
  );
  const ssrmSelectionControlled = ssrmSelectionConfig?.state != null;
  const controlledSsrmSelectionState = useMemo(
    () => normalizeSsrmSelectionState(ssrmSelectionConfig?.state),
    [ssrmSelectionConfig?.state]
  );
  const [ssrmSelectionStateInternal, setSsrmSelectionStateInternal] =
    useState<GridServerRowModelSelectionState>(controlledSsrmSelectionState);

  useEffect(() => {
    if (!ssrmSelectionControlled) return;
    setSsrmSelectionStateInternal((prev) =>
      ssrmSelectionStateEquals(prev, controlledSsrmSelectionState)
        ? prev
        : controlledSsrmSelectionState
    );
  }, [controlledSsrmSelectionState, ssrmSelectionControlled]);

  const ssrmSelectionState = ssrmSelectionControlled
    ? controlledSsrmSelectionState
    : ssrmSelectionStateInternal;
  const ssrmSelectionToggledSet = useMemo(
    () => new Set(ssrmSelectionState.toggledRowIds),
    [ssrmSelectionState]
  );
  const handleSsrmSelectionStateChange = useCallback(
    (nextState: GridServerRowModelSelectionState) => {
      const normalized = normalizeSsrmSelectionState(nextState);
      if (ssrmSelectionStateEquals(ssrmSelectionState, normalized)) return;
      if (!ssrmSelectionControlled) {
        setSsrmSelectionStateInternal(normalized);
      }
      ssrmSelectionConfig?.onStateChange?.(normalized);
    },
    [ssrmSelectionConfig, ssrmSelectionControlled, ssrmSelectionState]
  );

  useEffect(() => {
    const apiRef = ssrmSelectionConfig?.apiRef;
    if (!apiRef) return;
    if (!ssrmSelectionEnabled) {
      apiRef.current = null;
      return;
    }
    apiRef.current = {
      getServerSideSelectionState: () => ssrmSelectionState,
      setServerSideSelectionState: (nextState) => {
        handleSsrmSelectionStateChange(nextState);
      },
      clearServerSideSelectionState: () => {
        handleSsrmSelectionStateChange(createSsrmSelectionState(false));
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [
    handleSsrmSelectionStateChange,
    ssrmSelectionConfig?.apiRef,
    ssrmSelectionEnabled,
    ssrmSelectionState,
  ]);

  useEffect(() => {
    if (ssrmSelectionEnabled) return;
    setRowSelectionIds((prev) => {
      const next = new Set(prev);
      rows.forEach((row) => {
        const rowId = row.id;
        if (row.selected) next.add(rowId);
        else next.delete(rowId);
      });
      const nextArr = Array.from(next);
      if (nextArr.length === prev.length) {
        let same = true;
        for (let i = 0; i < nextArr.length; i += 1) {
          if (nextArr[i] !== prev[i]) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return nextArr;
    });
  }, [rows, ssrmSelectionEnabled]);

  const ssrmLoadedRows = useMemo(() => {
    if (!ssrmSelectionEnabled) return EMPTY_ROWS;
    const loaded: GridRow[] = [];
    serverRowModelRowIndexById.forEach((rowIndex) => {
      const row = serverRowModelGetRow(rowIndex);
      if (!row || row.meta?.loading) return;
      loaded.push(row);
    });
    return loaded;
  }, [serverRowModelGetRow, serverRowModelRowIndexById, ssrmSelectionEnabled]);

  const ssrmLookupStateRef = useRef<SsrmLookupMutableState | null>(null);
  useEffect(() => {
    if (ssrmSelectionEnabled) return;
    ssrmLookupStateRef.current = null;
  }, [ssrmSelectionEnabled]);

  const ssrmSelectionLookupCache = useMemo<SsrmSelectionLookupCache | null>(() => {
    if (!ssrmSelectionEnabled) return null;
    const next = buildSsrmLookupCacheIncremental(
      ssrmLookupStateRef.current,
      ssrmLoadedRows,
      ssrmDescendantSelectionMode
    );
    ssrmLookupStateRef.current = next.state;
    return next.cache;
  }, [ssrmDescendantSelectionMode, ssrmLoadedRows, ssrmSelectionEnabled]);

  const selectionRows = ssrmSelectionEnabled ? ssrmLoadedRows : rows;
  const ssrmSelectableRows = ssrmSelectionLookupCache?.selectableRows ?? EMPTY_ROWS;

  const selectedRowIds = useMemo(() => {
    if (!ssrmSelectionEnabled) return rowSelectionIds;
    if (!ssrmSelectableRows.length) return EMPTY_ID_ARRAY;
    if (!ssrmDescendantSelectionMode) {
      return ssrmSelectableRows
        .filter((row) =>
          isSsrmRowSelectedFlatNormalized(
            ssrmSelectionState,
            row.id,
            ssrmSelectionToggledSet
          )
        )
        .map((row) => row.id);
    }
    return ssrmSelectableRows
      .filter((row) => {
        const route =
          ssrmSelectionLookupCache?.leafRouteByRowId.get(row.id) ??
          getSsrmLeafRoute(row);
        return getSsrmTreeSelectionForRouteNormalized(ssrmSelectionState, route);
      })
      .map((row) => row.id);
  }, [
    rowSelectionIds,
    ssrmDescendantSelectionMode,
    ssrmSelectableRows,
    ssrmSelectionLookupCache,
    ssrmSelectionEnabled,
    ssrmSelectionState,
    ssrmSelectionToggledSet,
  ]);

  const lastSsrmSelectedRowIdsRef = useRef<(string | number)[]>(EMPTY_ID_ARRAY);
  useEffect(() => {
    if (!ssrmSelectionEnabled || !onRowSelectionChange) return;
    if (rowIdArraysEqual(lastSsrmSelectedRowIdsRef.current, selectedRowIds)) {
      return;
    }
    lastSsrmSelectedRowIdsRef.current = selectedRowIds;
    onRowSelectionChange?.(selectedRowIds);
  }, [onRowSelectionChange, selectedRowIds, ssrmSelectionEnabled]);

  useEffect(() => {
    if (ssrmSelectionEnabled) return;
    lastSsrmSelectedRowIdsRef.current = EMPTY_ID_ARRAY;
  }, [ssrmSelectionEnabled]);

  const lastSsrmSelectionEventRef = useRef<{
    state: GridServerRowModelSelectionState;
    selectedRowIds: (string | number)[];
  } | null>(null);
  useEffect(() => {
    if (!ssrmSelectionEnabled) {
      lastSsrmSelectionEventRef.current = null;
      return;
    }
    const onSelectionChanged = ssrmSelectionConfig?.onSelectionChanged;
    if (!onSelectionChanged) return;

    const stateSnapshot = ssrmSelectionState;
    const selectedSnapshot = selectedRowIds.slice();
    const previous = lastSsrmSelectionEventRef.current;
    if (
      previous &&
      ssrmSelectionStateEquals(previous.state, stateSnapshot) &&
      rowIdArraysEqual(previous.selectedRowIds, selectedSnapshot)
    ) {
      return;
    }
    lastSsrmSelectionEventRef.current = {
      state: stateSnapshot,
      selectedRowIds: selectedSnapshot,
    };

    onSelectionChanged({
      state: stateSnapshot,
      selectedRowIds: selectedSnapshot,
      selectedRowCountLoaded: selectedSnapshot.length,
    });
  }, [
    selectedRowIds,
    ssrmSelectionConfig?.onSelectionChanged,
    ssrmSelectionEnabled,
    ssrmSelectionState,
  ]);

  const selectedRowIdSet = useMemo(
    () => new Set<string | number>(selectedRowIds),
    [selectedRowIds]
  );

  return {
    resolvedClientGroupSelects,
    ssrmSelectionEnabled,
    ssrmGroupSelects,
    ssrmSelectionState,
    ssrmSelectionLookupCache,
    selectionRows,
    selectedRowIds,
    selectedRowIdSet,
    setRowSelectionIds,
    handleSsrmSelectionStateChange,
  };
};
