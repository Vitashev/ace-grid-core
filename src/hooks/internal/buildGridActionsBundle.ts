import type { GridActions } from "../useGrid";

export type BuildGridActionsBundleArgs = GridActions & {
  pinningCapabilityEnabled: boolean;
  spanningCapabilityEnabled: boolean;
};

const EMPTY_PINNED_COLUMNS: GridActions["pinnedColumns"] = {
  left: [],
  right: [],
};

const EMPTY_PINNED_ROWS: GridActions["pinnedRows"] = {
  top: [],
  bottom: [],
};

const EMPTY_MERGED_CELLS: GridActions["mergedCells"] = [];

const noop = () => undefined;
const noopMerge: GridActions["mergeCells"] = () => null;
const noopUnmerge: GridActions["unmergeCells"] = () => [];

export const buildGridActionsBundle = ({
  pinningCapabilityEnabled,
  spanningCapabilityEnabled,
  ...actions
}: BuildGridActionsBundleArgs): GridActions => ({
  ...actions,
  pinnedColumns: pinningCapabilityEnabled
    ? actions.pinnedColumns
    : EMPTY_PINNED_COLUMNS,
  pinnedRows: pinningCapabilityEnabled ? actions.pinnedRows : EMPTY_PINNED_ROWS,
  setPinnedColumns: pinningCapabilityEnabled ? actions.setPinnedColumns : noop,
  setPinnedRows: pinningCapabilityEnabled ? actions.setPinnedRows : noop,
  pinColumn: pinningCapabilityEnabled ? actions.pinColumn : noop,
  pinColumnAtPosition: pinningCapabilityEnabled
    ? actions.pinColumnAtPosition
    : noop,
  pinRow: pinningCapabilityEnabled ? actions.pinRow : noop,
  pinRowAtPosition: pinningCapabilityEnabled ? actions.pinRowAtPosition : noop,
  pinMultipleRowsAtPosition: pinningCapabilityEnabled
    ? actions.pinMultipleRowsAtPosition
    : noop,
  pinRowAndReorderToPosition: pinningCapabilityEnabled
    ? actions.pinRowAndReorderToPosition
    : noop,
  pinAndPositionRow: pinningCapabilityEnabled ? actions.pinAndPositionRow : noop,
  pinAndPositionColumn: pinningCapabilityEnabled
    ? actions.pinAndPositionColumn
    : noop,
  reorderPinnedColumns: pinningCapabilityEnabled
    ? actions.reorderPinnedColumns
    : noop,
  reorderPinnedRows: pinningCapabilityEnabled
    ? actions.reorderPinnedRows
    : noop,
  reorderMultiplePinnedRows: pinningCapabilityEnabled
    ? actions.reorderMultiplePinnedRows
    : noop,
  mergedCells: spanningCapabilityEnabled
    ? actions.mergedCells
    : EMPTY_MERGED_CELLS,
  setMergedCells: spanningCapabilityEnabled ? actions.setMergedCells : noop,
  updateMergedCellsAfterReorder: spanningCapabilityEnabled
    ? actions.updateMergedCellsAfterReorder
    : noop,
  updateMergedCellsAfterMultiReorder: spanningCapabilityEnabled
    ? actions.updateMergedCellsAfterMultiReorder
    : noop,
  mergeCells: spanningCapabilityEnabled ? actions.mergeCells : noopMerge,
  unmergeCells: spanningCapabilityEnabled ? actions.unmergeCells : noopUnmerge,
});
