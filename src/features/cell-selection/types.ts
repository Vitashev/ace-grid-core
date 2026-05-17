import type { RefObject, CSSProperties, MouseEvent } from "react";
import type {
  GridHeaderCellSelectionMode,
  GridRow,
  GridColumn,
  GridSelection,
  GridRowGroupSpan,
} from "../../types";

export type SelectionSource = "drag" | "row" | "column" | "fill";
export type SelectionOverlayMode = GridHeaderCellSelectionMode;

export type SelectionOptions = {
  forceFullRow?: boolean;
  forceFullColumn?: boolean;
  expandToSpans?: boolean;
};

export type RowSelectionOverlayOptions = {
  mode?: SelectionOverlayMode;
  includeSpans?: boolean;
  anchorRowId?: string | number;
};

export type ColumnSelectionOverlayOptions = {
  mode?: SelectionOverlayMode;
  includeSpans?: boolean;
  anchorColumnKey?: string;
};

export type RowGroupLike = {
  startRowIndex: number;
  rows: GridRow[];
  height: number;
  spans: Map<string, GridRowGroupSpan[]>;
};

export type UseCellSelectionParams = {
  selection: GridSelection | null;
  enableCellSelection: boolean;
  selectEntireRowOnSelection: boolean;
  selectEntireColumnOnSelection: boolean;
  rowCellSelectionMode: SelectionOverlayMode;
  columnCellSelectionMode: SelectionOverlayMode;
  rowCellSelectionIncludeSpans: boolean;
  columnCellSelectionIncludeSpans: boolean;
  rows: GridRow[];
  rowCount?: number;
  rowIndexLookup: Map<string | number, number>;
  rowGroups: RowGroupLike[];
  visualColumns: GridColumn[];
  visualColumnIndex: Map<string, number>;
  rowIndexToVisual: Map<number, number>;
  onSelectionRangeChange?: (s: GridSelection | null) => void;
  containerRef: RefObject<HTMLDivElement>;
  edgeSize?: number;
  maxEdgeSpeed?: number;
  centerColumnRange?: { start: number; end: number } | null;
  centerRowRange?: { start: number; end: number } | null;
};

export type UseCellSelectionResult = {
  getSelection: () => GridSelection | null;
  selectionEdgeStyle: (
    r: number,
    c: number,
    rowSpan?: number,
    colSpan?: number,
    columnKey?: string,
    isHeader?: boolean
  ) => CSSProperties;
  isCellSelected: (r: number, c: number) => boolean;
  handleCellMouseDown: (
    rowIndex: number,
    columnIndex: number | null,
    event: MouseEvent
  ) => void;
  handleCellMouseEnter: (
    rowIndex: number,
    columnIndex: number | null
  ) => void;
  beginFillHandleDrag: (event: MouseEvent) => void;
  applyRowSelectionToCells: (
    map: Map<string | number, GridRow>,
    overlayOptions?: RowSelectionOverlayOptions
  ) => void;
  applyColumnSelectionToCells: (
    set: Set<string>,
    overlayOptions?: ColumnSelectionOverlayOptions
  ) => void;
  clearSelectionRange: () => void;
  lastSourceIs: (src: SelectionSource) => boolean;
  isDraggingSelection: boolean;
  fillDragActive: boolean;
};
