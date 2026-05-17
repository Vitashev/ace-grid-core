import React from "react";
import type {
  GridColumn,
  GridLoadingCellRenderer,
  GridMasterDetailProps,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionState,
  GridValidationCellState,
  GridRowGroup,
} from "../types";
import type { GridThemeTokens } from "../features/theming/types";
import type { SpanCoverage } from "../features/span/hooks/useSpanCoverage";
import type { SsrmSelectionLookupCache } from "../features/selection/ssrmSelectionState";
import type {
  RowSelectionChangeMeta,
  RowSelectSelectionMetrics,
} from "../features/selection/components/RowSelectCell";
import { RowGroupView, type FormulaHighlightRange } from "./RowGroupView";
import type { RowDragState } from "../features/reorder/hooks/useRowDnD";
import type { OpenContextMenuArgs } from "../features/context-menu/hooks/useContextMenu";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";
import type { GridValidationDisplayConfig } from "../features/validation/utils";

type CenterBodyProps = {
  enableVirtualization: boolean;
  defaultRowHeight: number;
  virtualCenterGroups: {
    visible: GridRowGroup[];
    start: number;
    end: number;
    before: number;
    after: number;
  };
  virtualCenterCols: {
    visible: GridColumn[];
    start: number;
    end: number;
    before: number;
    after: number;
  };
  scrollLeftPx: number;
  viewportWidthPx: number;
  topLoaderStickyOffsetPx: number;
  bottomLoaderStickyOffsetPx: number;
  topLoaderNode?: React.ReactNode;
  bottomLoaderNode?: React.ReactNode;
  loaderRowMinHeight?: number;
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  visualColumns: GridColumn[];
  visualColumnSizes: string[];
  visualColumnIndex: Map<string, number>;
  columnIndexLookup: Map<string, number>;
  pinnedLeftWidth: number;
  pinnedRightWidth: number;
  pinnedLeftColumnSizes: string[];
  pinnedRightColumnSizes: string[];
  centerColumnSizes: string[];
  rowIndexLookup: Map<string | number, number>;
  getRowKeyLabel?: (row: GridRow, rowIndex: number) => React.ReactNode;
  rowHeightOf: (rowId: string | number) => number;
  colWidthOf: (columnKey: string, fallback?: number) => number;
  applyPinnedStyle: (
    base: React.CSSProperties,
    column: GridColumn,
    isLeft: boolean,
    isRight: boolean
  ) => React.CSSProperties;
  tokens: GridThemeTokens;
  rowDragState: RowDragState;
  isRowReorder: boolean;
  handleRowDragStart: (e: React.DragEvent, rowId: string) => void;
  onRowDragOver: (e: React.DragEvent, rowId: string) => void;
  onRowDragLeave: (e: React.DragEvent) => void;
  onRowDrop: (e: React.DragEvent, rowId: string) => void;
  onRowDragEnd: (e: React.DragEvent) => void;
  rowHasSpans: (rowId: string | number) => boolean;
  centerSpanCoverage: Map<string, SpanCoverage>;
  cellPadding: string;
  selectionEdgeStyle: (
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    columnKey: string
  ) => React.CSSProperties;
  handleCellMouseDown: (
    rowIndex: number,
    colIndex: number,
    event: React.MouseEvent
  ) => void;
  handleCellMouseEnter: (
    rowIndex: number,
    colIndex: number,
    event: React.MouseEvent
  ) => void;
  selectSingleCell: (
    rowIndex: number,
    colIndex: number,
    event?: React.MouseEvent,
    rowSpan?: number,
    colSpan?: number
  ) => void;
  onCellDbl: (rowIndex: number, colIndex: number, element?: HTMLElement) => void;
  openCellContextMenu: (args: OpenContextMenuArgs) => void;
  renderFillHandle: (visible: boolean) => React.ReactNode;
  isFillHandleCell: (
    rowIndex: number,
    colIndex: number,
    rowSpan?: number,
    colSpan?: number,
    columnKey?: string
  ) => boolean;
  enableColumnResize: boolean;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;
  enableCellContentVirtualization: boolean;
  updateEditingValue: (value: any) => void;
  commitEdit: (rowIndex: number, colIndex: number, rawValue?: any) => void;
  cancelEdit: () => void;
  registerEditorValueListener: (listener: ((value: any) => void) | null) => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  getCellValidation: (
    rowId: string | number,
    columnKey: string
  ) => GridValidationCellState | null;
  validationDisplay: GridValidationDisplayConfig;
  validationRevision: number;
  loadingCellRenderer?: GridLoadingCellRenderer;
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  handlePinRow: (rowId: string | number, side: "top" | "bottom" | null) => void;
  rows: GridRow[];
  selectedRowIds: (string | number)[];
  selectedRowIdSet: Set<string | number>;
  selectionMetrics?: RowSelectSelectionMetrics;
  handleRowSelectionChange: (
    ids: (string | number)[],
    meta?: RowSelectionChangeMeta
  ) => void;
  clientGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionState?: GridServerRowModelSelectionState;
  ssrmSelectableRowCount?: number;
  ssrmGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionCache?: SsrmSelectionLookupCache;
  handleSsrmSelectionStateChange?: (
    state: GridServerRowModelSelectionState
  ) => void;
  enableRowResize: boolean;
  hasRowResizeHandler: boolean;
  createRowResizeHandle: (
    rowId: string | number,
    hasSpan: boolean,
    offset: number,
    containerHeight?: number
  ) => React.ReactNode;
  onToggleGroupRow?: (
    path: string,
    expanded: boolean,
    meta?: {
      rowIndex?: number;
      childCount?: number;
      level?: number;
      visibleDescendantCount?: number;
    }
  ) => void;
  resolveGroupExpandedState?: (path: string, fallback: boolean) => boolean;
  isGroupToggleLoading?: (path: string) => boolean;
  allowGroupHeaderDrag: boolean;
  masterDetail?: {
    enabled: boolean;
    isRowMaster: (row: GridRow) => boolean;
    isExpanded: (rowId: string | number) => boolean;
    toggleRow: (rowId: string | number) => void;
    collapseRow: (rowId: string | number) => void;
    detailRowHeightOf: (row: GridRow) => number;
    renderDetail?: GridMasterDetailProps["renderDetail"];
    renderToggleIcon?: GridMasterDetailProps["renderToggleIcon"];
  };
  rowModel?: {
    getRow: (index: number) => GridRow;
    version?: number;
    rowCount?: number;
  };
  formulaHighlightRanges?: FormulaHighlightRange[];
  ariaRowIndexOffset?: number;
  resolveBodyRowIndex?: (rowIndex: number) => number;
  gridBodyCellIdBase?: string;
};

const CenterBodyComponent: React.FC<CenterBodyProps> = ({
  enableVirtualization,
  defaultRowHeight,
  pinnedLeftColumns,
  pinnedRightColumns,
  centerColumns,
  visualColumns,
  visualColumnSizes,
  visualColumnIndex,
  columnIndexLookup,
  pinnedLeftWidth,
  pinnedRightWidth,
  pinnedLeftColumnSizes,
  pinnedRightColumnSizes,
  centerColumnSizes,
  rowIndexLookup,
  getRowKeyLabel,
  rowHeightOf,
  colWidthOf,
  applyPinnedStyle,
  tokens,
  rowDragState,
  isRowReorder,
  handleRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  onRowDragEnd,
  rowHasSpans,
  centerSpanCoverage,
  cellPadding,
  selectionEdgeStyle,
  handleCellMouseDown,
  handleCellMouseEnter,
  selectSingleCell,
  onCellDbl,
  openCellContextMenu,
  renderFillHandle,
  isFillHandleCell,
  enableColumnResize,
  getColumnResizeHandleProps,
  enableCellContentVirtualization,
  updateEditingValue,
  commitEdit,
  cancelEdit,
  registerEditorValueListener,
  isCellSelected,
  getCellValidation,
  validationDisplay,
  validationRevision,
  loadingCellRenderer,
  pinnedRows,
  handlePinRow,
  rows,
  selectedRowIds,
  selectedRowIdSet,
  selectionMetrics,
  handleRowSelectionChange,
  clientGroupSelects,
  ssrmSelectionState,
  ssrmSelectableRowCount,
  ssrmGroupSelects,
  ssrmSelectionCache,
  handleSsrmSelectionStateChange,
  enableRowResize,
  hasRowResizeHandler,
  createRowResizeHandle,
  onToggleGroupRow,
  resolveGroupExpandedState,
  isGroupToggleLoading,
  allowGroupHeaderDrag,
  masterDetail,
  rowModel,
  formulaHighlightRanges,
  ariaRowIndexOffset = 0,
  resolveBodyRowIndex,
  gridBodyCellIdBase,
  virtualCenterGroups,
  virtualCenterCols,
  scrollLeftPx,
  viewportWidthPx,
  topLoaderStickyOffsetPx,
  bottomLoaderStickyOffsetPx,
  topLoaderNode,
  bottomLoaderNode,
  loaderRowMinHeight,
}) => {
  const virtualSpacerStyle = React.useMemo(
    () =>
      ({
        "--ace-grid-spacer-row-h": `${Math.max(
          20,
          Math.trunc(defaultRowHeight) || 32
        )}px`,
        "--ace-grid-spacer-pin-left-w": `${Math.max(
          0,
          Math.round(pinnedLeftWidth)
        )}px`,
        "--ace-grid-spacer-pin-right-w": `${Math.max(
          0,
          Math.round(pinnedRightWidth)
        )}px`,
        "--ace-grid-spacer-pin-left-bg":
          pinnedLeftWidth > 0
            ? "var(--ace-grid-pinned-left-bg)"
            : "var(--ace-grid-spacer-bg)",
        "--ace-grid-spacer-pin-right-bg":
          pinnedRightWidth > 0
            ? "var(--ace-grid-pinned-right-bg)"
            : "var(--ace-grid-spacer-bg)",
        "--ace-grid-spacer-pin-left-edge":
          pinnedLeftWidth > 0 ? "var(--ace-grid-pinned-shadow-left-edge)" : "none",
        "--ace-grid-spacer-pin-right-edge":
          pinnedRightWidth > 0 ? "var(--ace-grid-pinned-shadow-right-edge)" : "none",
      }) as React.CSSProperties & Record<string, string>,
    [
      defaultRowHeight,
      pinnedLeftWidth,
      pinnedRightWidth,
    ]
  );
  const hasVirtualSpace =
    virtualCenterGroups.before > 0 || virtualCenterGroups.after > 0;
  const hasVisibleVirtualRows = virtualCenterGroups.visible.length > 0;
  const loaderViewportLeft = Math.max(0, Math.round(scrollLeftPx));
  const loaderViewportWidth = Math.max(0, Math.round(viewportWidthPx));
  // Anchor loader content to the currently visible viewport slice of the canvas.
  const loaderContentStyle = React.useMemo(
    () =>
      ({
        marginLeft: loaderViewportLeft,
        width: loaderViewportWidth > 0 ? loaderViewportWidth : undefined,
        maxWidth: "100%",
        flex: "0 0 auto",
      }) as React.CSSProperties,
    [loaderViewportLeft, loaderViewportWidth]
  );
  const fallbackVirtualSpacerStyle = React.useMemo(
    () =>
      ({
        ...virtualSpacerStyle,
        height: Math.max(Math.trunc(defaultRowHeight) * 8 || 0, 220),
      }) as React.CSSProperties,
    [defaultRowHeight, virtualSpacerStyle]
  );
  const beforeVirtualSpacerStyle = React.useMemo(
    () =>
      ({
        ...virtualSpacerStyle,
        height: virtualCenterGroups.before,
      }) as React.CSSProperties,
    [virtualCenterGroups.before, virtualSpacerStyle]
  );
  const afterVirtualSpacerStyle = React.useMemo(
    () =>
      ({
        ...virtualSpacerStyle,
        height: virtualCenterGroups.after,
      }) as React.CSSProperties,
    [virtualCenterGroups.after, virtualSpacerStyle]
  );
  const topLoaderRowStyle = React.useMemo(
    () =>
      ({
        ...(loaderRowMinHeight != null ? { minHeight: loaderRowMinHeight } : undefined),
        top: Math.max(0, Math.round(topLoaderStickyOffsetPx)),
      }) as React.CSSProperties,
    [loaderRowMinHeight, topLoaderStickyOffsetPx]
  );
  const bottomLoaderRowStyle = React.useMemo(
    () =>
      ({
        ...(loaderRowMinHeight != null ? { minHeight: loaderRowMinHeight } : undefined),
        bottom: Math.max(0, Math.round(bottomLoaderStickyOffsetPx)),
      }) as React.CSSProperties,
    [bottomLoaderStickyOffsetPx, loaderRowMinHeight]
  );

  return (
    <>
      {enableVirtualization && hasVirtualSpace && !hasVisibleVirtualRows && (
        <div
          className="ace-grid__virtual-spacer ace-grid__virtual-spacer--fallback"
          role="presentation"
          aria-hidden="true"
          style={fallbackVirtualSpacerStyle}
        />
      )}

      {enableVirtualization &&
        hasVisibleVirtualRows &&
        virtualCenterGroups.before > 0 && (
        <div
          className="ace-grid__virtual-spacer ace-grid__virtual-spacer--before"
          role="presentation"
          aria-hidden="true"
          style={beforeVirtualSpacerStyle}
        />
      )}

      {topLoaderNode ? (
        <div
          className="ace-grid__infinite-scroll-row ace-grid__infinite-scroll-row--top"
          role="presentation"
          style={topLoaderRowStyle}
        >
          <div
            className="ace-grid__infinite-scroll-row-content"
            style={loaderContentStyle}
          >
            {topLoaderNode}
          </div>
        </div>
      ) : null}

      {virtualCenterGroups.visible.map((group) => (
        <RowGroupView
          key={`center-${String(group.id)}`}
          group={group}
          pinnedLeftColumns={pinnedLeftColumns}
          pinnedRightColumns={pinnedRightColumns}
          centerColumns={centerColumns}
          visualColumns={visualColumns}
          visualColumnSizes={visualColumnSizes}
          visualColumnIndex={visualColumnIndex}
          columnIndexLookup={columnIndexLookup}
          pinnedLeftWidth={pinnedLeftWidth}
          pinnedRightWidth={pinnedRightWidth}
          pinnedLeftColumnSizes={pinnedLeftColumnSizes}
          pinnedRightColumnSizes={pinnedRightColumnSizes}
          centerColumnSizes={centerColumnSizes}
          virtualCenterCols={virtualCenterCols}
          rowIndexLookup={rowIndexLookup}
          getRowKeyLabel={getRowKeyLabel}
          rowHeightOf={rowHeightOf}
          colWidthOf={colWidthOf}
          applyPinnedStyle={applyPinnedStyle}
          tokens={tokens}
          rowDragState={rowDragState}
          isRowReorder={isRowReorder}
          handleRowDragStart={handleRowDragStart}
          onRowDragOver={onRowDragOver}
          onRowDragLeave={onRowDragLeave}
          onRowDrop={onRowDrop}
          onRowDragEnd={onRowDragEnd}
          rowHasSpans={rowHasSpans}
          centerSpanCoverage={centerSpanCoverage}
          cellPadding={cellPadding}
          selectionEdgeStyle={selectionEdgeStyle}
          handleCellMouseDown={handleCellMouseDown}
          handleCellMouseEnter={handleCellMouseEnter}
          selectSingleCell={selectSingleCell}
          onCellDbl={onCellDbl}
          openCellContextMenu={openCellContextMenu}
          renderFillHandle={renderFillHandle}
          isFillHandleCell={isFillHandleCell}
          enableColumnResize={enableColumnResize}
          getColumnResizeHandleProps={getColumnResizeHandleProps}
          enableCellContentVirtualization={enableCellContentVirtualization}
          updateEditingValue={updateEditingValue}
          commitEdit={commitEdit}
          cancelEdit={cancelEdit}
          registerEditorValueListener={registerEditorValueListener}
          isCellSelected={isCellSelected}
          getCellValidation={getCellValidation}
          validationDisplay={validationDisplay}
          validationRevision={validationRevision}
          loadingCellRenderer={loadingCellRenderer}
          pinnedRows={pinnedRows}
          handlePinRow={handlePinRow}
          rows={rows}
          selectedRowIds={selectedRowIds}
          selectedRowIdSet={selectedRowIdSet}
          selectionMetrics={selectionMetrics}
          handleRowSelectionChange={handleRowSelectionChange}
          clientGroupSelects={clientGroupSelects}
          ssrmSelectionState={ssrmSelectionState}
          ssrmSelectableRowCount={ssrmSelectableRowCount}
          ssrmGroupSelects={ssrmGroupSelects}
          ssrmSelectionCache={ssrmSelectionCache}
          handleSsrmSelectionStateChange={handleSsrmSelectionStateChange}
          enableRowResize={enableRowResize}
          hasRowResizeHandler={hasRowResizeHandler}
          createRowResizeHandle={createRowResizeHandle}
          onToggleGroupRow={onToggleGroupRow}
          resolveGroupExpandedState={resolveGroupExpandedState}
          isGroupToggleLoading={isGroupToggleLoading}
          allowGroupHeaderDrag={allowGroupHeaderDrag}
          masterDetail={masterDetail}
          rowModel={rowModel}
          formulaHighlightRanges={formulaHighlightRanges}
          ariaRowIndexOffset={ariaRowIndexOffset}
          resolveBodyRowIndex={resolveBodyRowIndex}
          gridBodyCellIdBase={gridBodyCellIdBase}
        />
      ))}

      {bottomLoaderNode ? (
        <div
          className="ace-grid__infinite-scroll-row ace-grid__infinite-scroll-row--bottom"
          role="presentation"
          style={bottomLoaderRowStyle}
        >
          <div
            className="ace-grid__infinite-scroll-row-content"
            style={loaderContentStyle}
          >
            {bottomLoaderNode}
          </div>
        </div>
      ) : null}

      {enableVirtualization &&
        hasVisibleVirtualRows &&
        virtualCenterGroups.after > 0 && (
        <div
          className="ace-grid__virtual-spacer ace-grid__virtual-spacer--after"
          role="presentation"
          aria-hidden="true"
          style={afterVirtualSpacerStyle}
        />
      )}
    </>
  );
};

export const CenterBody = React.memo(CenterBodyComponent);
CenterBody.displayName = "CenterBody";
