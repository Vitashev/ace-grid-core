import React, {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";
import type { EditingCellState } from "../edit/types";
import type { GridValidationCellState } from "../../types";

export type GridStoreVirtualSlice = {
  before: number;
  after: number;
  start: number;
  end: number;
};

export type GridStoreHoverCell = {
  rowIndex: number;
  colIndex: number;
};

export type GridStoreEditingState = {
  cell: EditingCellState | null;
  draftValue: any;
  formulaBarValue: string;
  validation: GridValidationCellState | null;
};

export interface GridStoreState {
  scrollTop: number;
  scrollLeft: number;
  hoverRowId: string | number | null;
  hoverColumnKey: string | null;
  hoverCell: GridStoreHoverCell | null;
  virtualization: {
    centerGroups: GridStoreVirtualSlice;
    centerColumns: GridStoreVirtualSlice;
  };
  editing: GridStoreEditingState;
}

type GridStoreListener = () => void;

export interface GridStoreApi {
  getState: () => GridStoreState;
  setState: (
    partial:
      | Partial<GridStoreState>
      | ((state: GridStoreState) => GridStoreState)
  ) => void;
  subscribe: (listener: GridStoreListener) => () => void;
}

const defaultVirtualSlice: GridStoreVirtualSlice = {
  before: 0,
  after: 0,
  start: 0,
  end: -1,
};

export const defaultGridStoreState: GridStoreState = {
  scrollTop: 0,
  scrollLeft: 0,
  hoverRowId: null,
  hoverColumnKey: null,
  hoverCell: null,
  virtualization: {
    centerGroups: defaultVirtualSlice,
    centerColumns: defaultVirtualSlice,
  },
  editing: {
    cell: null,
    draftValue: "",
    formulaBarValue: "",
    validation: null,
  },
};

export const GridStoreContext = createContext<GridStoreApi | null>(null);

export const createGridStore = (
  initialState: Partial<GridStoreState> = {}
): GridStoreApi => {
  let state: GridStoreState = {
    ...defaultGridStoreState,
    ...initialState,
  };

  const listeners = new Set<GridStoreListener>();

  const getState = () => state;

  const setState: GridStoreApi["setState"] = (partial) => {
    let nextState: GridStoreState | null = null;

    if (typeof partial === "function") {
      nextState = partial(state);
      if (nextState === state) return;
    } else {
      let changed = false;
      const candidate = { ...state };
      (Object.keys(partial) as (keyof GridStoreState)[]).forEach((key) => {
        const value = partial[key];
        if (value === undefined) return;
        if (!Object.is(value, state[key])) {
          (candidate as any)[key] = value;
          changed = true;
        }
      });
      if (!changed) return;
      nextState = candidate;
    }

    if (!nextState) return;

    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const subscribe: GridStoreApi["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { getState, setState, subscribe };
};

type GridStoreProviderProps = {
  initialState?: Partial<GridStoreState>;
  children: React.ReactNode;
};

export const GridStoreProvider: React.FC<GridStoreProviderProps> = ({
  initialState,
  children,
}) => {
  const storeRef = useRef<GridStoreApi>();

  if (!storeRef.current) {
    storeRef.current = createGridStore(initialState);
  }

  const store = storeRef.current;

  return (
    <GridStoreContext.Provider value={store}>
      {children}
    </GridStoreContext.Provider>
  );
};

export const useGridStoreApi = (): GridStoreApi => {
  const store = useContext(GridStoreContext);
  if (!store) {
    throw new Error("useGridStoreApi must be used within a GridStoreProvider");
  }
  return store;
};

export const useGridStoreSelector = <T,>(
  selector: (state: GridStoreState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is
): T => {
  const store = useGridStoreApi();

  // Keep latest selector / equality without forcing re-subscribe churn.
  const selectorRef = useRef(selector);
  const equalityRef = useRef(equalityFn);
  const lastFnsRef = useRef({ selector, equalityFn });
  const lastSnapshotRef = useRef<{ initialized: boolean; value: T }>({
    initialized: false,
    value: undefined as unknown as T,
  });

  // If caller passes new function identities, drop memoized snapshot to avoid
  // returning a value computed with a previous selector/equality pair.
  if (
    lastFnsRef.current.selector !== selector ||
    lastFnsRef.current.equalityFn !== equalityFn
  ) {
    lastFnsRef.current = { selector, equalityFn };
    lastSnapshotRef.current.initialized = false;
  }

  selectorRef.current = selector;
  equalityRef.current = equalityFn;

  const getSnapshot = () => {
    const next = selectorRef.current(store.getState());
    const last = lastSnapshotRef.current;
    if (last.initialized && equalityRef.current(next, last.value)) {
      return last.value;
    }
    lastSnapshotRef.current = { initialized: true, value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export const useGridHoverState = () =>
  useGridStoreSelector(
    (state) => ({
      hoverCell: state.hoverCell,
      hoverRowId: state.hoverRowId,
      hoverColumnKey: state.hoverColumnKey,
    }),
    (a, b) =>
      a.hoverCell === b.hoverCell &&
      a.hoverRowId === b.hoverRowId &&
      a.hoverColumnKey === b.hoverColumnKey
  );

export const useGridVirtualizationState = () =>
  useGridStoreSelector((state) => state.virtualization);

export const useGridScrollState = () =>
  useGridStoreSelector(
    (state) => ({
      scrollTop: state.scrollTop,
      scrollLeft: state.scrollLeft,
    }),
    (a, b) => a.scrollTop === b.scrollTop && a.scrollLeft === b.scrollLeft
  );

const editingCellEqual = (
  a: EditingCellState | null,
  b: EditingCellState | null
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.rowIndex === b.rowIndex &&
    a.colIndex === b.colIndex &&
    a.version === b.version &&
    a.columnKey === b.columnKey
  );
};

export const useGridEditingCell = () =>
  useGridStoreSelector((state) => state.editing.cell, editingCellEqual);

export const useGridEditingDraftValue = () =>
  useGridStoreSelector(
    (state) => state.editing.draftValue,
    (a, b) => Object.is(a, b)
  );

export const useGridFormulaBarValue = () =>
  useGridStoreSelector(
    (state) => state.editing.formulaBarValue,
    (a, b) => a === b
  );
