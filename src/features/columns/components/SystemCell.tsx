// components/SystemCell.tsx
import React, { memo } from "react";
import { GRID_SYSTEM_COLUMN_KEYS } from "../../../types";
import type {
  GridLoadingCellRenderer,
  GridMasterDetailToggleCellRenderArgs,
  GridMasterDetailToggleRenderArgs,
  GridRowPinCellRenderArgs,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionState,
  GridSystemCellTypeKey,
} from "../../../types";
import { getGridRuntimeModules } from "../../../runtime/modules";
import type { SsrmSelectionLookupCache } from "../../selection/ssrmSelectionState";
import { useGridTheme } from "../../theming";
import type {
  RowSelectionChangeMeta,
  RowSelectSelectionMetrics,
} from "../../selection/components/RowSelectCell";
import { RowSelectCell } from "../../selection/components/RowSelectCell";
import { renderLoadingCellContent } from "../../../components/loadingCellRenderer";
import type { SystemCellState } from "../../theming/types";
import { cx } from "../../../utils/cx";
import { buildGridBodyCellId } from "../../interaction/utils";

type SystemCellProps = {
  typeKey: GridSystemCellTypeKey;
  row: GridRow;
  absRowIndex: number; // used in keys when needed
  isBoundary?: boolean;
  colIndex?: number;
  ariaColIndex?: number;
  ariaRowIndex?: number;
  gridBodyCellIdBase?: string;
  style: React.CSSProperties;
  loadingRenderer?: GridLoadingCellRenderer;
  rowIndexLabel?: React.ReactNode;
  // props your cells already expect:
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  onPinRow?: (rowId: string | number, side: "top" | "bottom" | null) => void;
  renderPinCell?: (args: GridRowPinCellRenderArgs) => React.ReactNode;
  rowHasSpans: (rowId: string | number) => boolean;
  isRowReorder: boolean;
  rows: GridRow[];
  selectedRowIds: (string | number)[];
  selectedRowIdSet: Set<string | number>;
  selectionMetrics?: RowSelectSelectionMetrics;
  onRowSelectionChange?: (
    ids: (string | number)[],
    meta?: RowSelectionChangeMeta
  ) => void;
  clientGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionState?: GridServerRowModelSelectionState;
  ssrmSelectableRowCount?: number;
  ssrmGroupSelects?: GridServerRowModelGroupSelects;
  ssrmSelectionCache?: SsrmSelectionLookupCache;
  onSsrmSelectionStateChange?: (
    state: GridServerRowModelSelectionState
  ) => void;
  detailCell?: {
    visible: boolean;
    disabled: boolean;
    expanded: boolean;
    onToggle: () => void;
    renderToggleIcon?: (
      args: GridMasterDetailToggleRenderArgs
    ) => React.ReactNode;
    renderToggleCell?: (
      args: GridMasterDetailToggleCellRenderArgs
    ) => React.ReactNode;
  };
};

export const SystemCell: React.FC<SystemCellProps> = memo((p) => {
  const masterDetailModule = getGridRuntimeModules().masterDetail;
  const pinningModule = getGridRuntimeModules().pinning;
  const rowReorderModule = getGridRuntimeModules().rowReorderBasic;
  const {
    typeKey,
    row,
    style,
    loadingRenderer,
    ariaColIndex,
    ariaRowIndex,
    gridBodyCellIdBase,
  } = p;
  const cellId = buildGridBodyCellId(
    gridBodyCellIdBase,
    ariaRowIndex,
    ariaColIndex
  );
  const boundarySystemClassName = p.isBoundary
    ? "ace-grid__system-cell--boundary"
    : "";
  const { components, tokens } = useGridTheme();
  const isLoading = Boolean(row.meta?.loading);
  const systemCellState: SystemCellState = {
    type: typeKey,
    isLoading,
  };
  const applySystemCellTheme = (base: React.CSSProperties) =>
    components.systemCell
      ? components.systemCell({
          base,
          state: systemCellState,
          tokens,
        })
      : base;
  const resolvedStyle = {
    ...style,
    // Keep system columns above regular row cells, but below pinned-row layers.
    zIndex: Math.max(typeof style?.zIndex === "number" ? style.zIndex : 0, 60),
  };

  if (isLoading) {
    return (
      <div
        id={cellId}
        className={cx(
          "ace-grid__system-cell",
          "ace-grid__system-cell--loading",
          "ace-grid__cell",
          "ace-grid__cell--loading",
          boundarySystemClassName
        )}
        role="gridcell"
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        style={applySystemCellTheme({
          ...resolvedStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 8px",
          backgroundColor:
            "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
          boxShadow: "var(--ace-grid-cell-shadow, none)",
          borderRightWidth: 1,
          borderRightStyle: "solid",
          borderRightColor: "var(--ace-grid-cell-border-color-alt)",
        })}
      >
        {renderLoadingCellContent(loadingRenderer, {
          row,
          rowIndex: p.absRowIndex,
          colIndex: p.colIndex ?? -1,
          isSystemCell: true,
          systemCellType: typeKey,
        })}
      </div>
    );
  }

  if (typeKey === GRID_SYSTEM_COLUMN_KEYS.rowIndex) {
    return (
      <div
        id={cellId}
        className={cx(
          "ace-grid__system-cell",
          "ace-grid__row-index-cell",
          boundarySystemClassName
        )}
        role="rowheader"
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        style={applySystemCellTheme({
          ...resolvedStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontVariantNumeric: "tabular-nums",
          color: "var(--ace-grid-text-muted, #6b7280)",
          backgroundColor:
            "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
          boxShadow: "var(--ace-grid-cell-shadow, none)",
          borderRightWidth: 1,
          borderRightStyle: "solid",
          borderRightColor: "var(--ace-grid-cell-border-color-alt)",
        })}
        title={typeof p.rowIndexLabel === "string" ? p.rowIndexLabel : undefined}
      >
        {p.rowIndexLabel}
      </div>
    );
  }

  if (typeKey === GRID_SYSTEM_COLUMN_KEYS.rowDetail) {
    const RowDetailToggleCell = masterDetailModule.RowDetailToggleCell;
    const visible = Boolean(p.detailCell?.visible);
    const disabled = p.detailCell?.disabled ?? true;
    const expanded = p.detailCell?.expanded ?? false;
    const onToggle = p.detailCell?.onToggle ?? (() => undefined);
    const renderToggleIcon = p.detailCell?.renderToggleIcon;
    const renderDefault = () =>
      !visible ? (
        <div
          id={cellId}
          className={cx(
            "ace-grid__system-cell",
            "ace-grid__system-cell--detail-empty",
            boundarySystemClassName
          )}
          style={applySystemCellTheme({
            ...resolvedStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
            boxShadow: "var(--ace-grid-cell-shadow, none)",
            borderRightWidth: 1,
            borderRightStyle: "solid",
            borderRightColor: "var(--ace-grid-cell-border-color-alt)",
          })}
        />
      ) : RowDetailToggleCell ? (
        <RowDetailToggleCell
          id={cellId}
          row={row}
          expanded={expanded}
          disabled={disabled}
          onToggle={onToggle}
          renderToggleIcon={renderToggleIcon}
          className={
            p.isBoundary ? "ace-grid__row-detail-toggle--system-boundary" : ""
          }
          role="gridcell"
          ariaColIndex={ariaColIndex}
          ariaRowIndex={ariaRowIndex}
          style={resolvedStyle}
        />
      ) : (
        <div
          id={cellId}
          className={cx(
            "ace-grid__system-cell",
            "ace-grid__system-cell--detail-empty",
            boundarySystemClassName
          )}
          style={applySystemCellTheme({
            ...resolvedStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
            boxShadow: "var(--ace-grid-cell-shadow, none)",
            borderRightWidth: 1,
            borderRightStyle: "solid",
            borderRightColor: "var(--ace-grid-cell-border-color-alt)",
          })}
        />
      );
    const customRenderer = p.detailCell?.renderToggleCell;
    return customRenderer
      ? customRenderer({
          row,
          visible,
          expanded,
          disabled,
          style: resolvedStyle,
          onToggle,
          renderToggleIcon,
          renderDefault,
        })
      : renderDefault();
  }

  if (typeKey === GRID_SYSTEM_COLUMN_KEYS.rowPinning) {
    const RowPinCell = pinningModule.RowPinCell;
    const rowId = row.id;
    const rowIdString = String(rowId);
    const isPinnedTop = p.pinnedRows.top.some((id) => String(id) === rowIdString);
    const isPinnedBottom = p.pinnedRows.bottom.some(
      (id) => String(id) === rowIdString
    );
    const isBlocked = p.rowHasSpans(rowId);
    const renderDefault = () =>
      RowPinCell ? (
      <RowPinCell
        id={cellId}
        key={`row-pin-${row.id}-${p.absRowIndex}`}
        rowId={rowId}
        className={p.isBoundary ? "ace-grid__row-pin--system-boundary" : ""}
        role="gridcell"
        ariaColIndex={ariaColIndex}
        ariaRowIndex={ariaRowIndex}
        style={resolvedStyle}
        pinnedRows={p.pinnedRows}
        onPinRow={p.onPinRow}
        rowHasSpans={p.rowHasSpans}
      />
      ) : (
        <div
          id={cellId}
          className={cx(
            "ace-grid__system-cell",
            "ace-grid__system-cell--pin-empty",
            boundarySystemClassName
          )}
          style={applySystemCellTheme({
            ...resolvedStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
            boxShadow: "var(--ace-grid-cell-shadow, none)",
            borderRightWidth: 1,
            borderRightStyle: "solid",
            borderRightColor: "var(--ace-grid-cell-border-color-alt)",
          })}
        />
      );
    return p.renderPinCell
      ? p.renderPinCell({
          row,
          rowId,
          style: resolvedStyle,
          pinnedRows: p.pinnedRows,
          onPinRow: p.onPinRow,
          rowHasSpans: p.rowHasSpans,
          isPinnedTop,
          isPinnedBottom,
          isBlocked,
          renderDefault,
        })
      : renderDefault();
  }
  if (typeKey === GRID_SYSTEM_COLUMN_KEYS.rowOrdering) {
    const RowOrderCell = rowReorderModule.RowOrderCell;
    return RowOrderCell ? (
      <RowOrderCell
        id={cellId}
        key={`row-order-${row.id}-${p.absRowIndex}`}
        rowId={row.id}
        isRowReorder={p.isRowReorder}
        rowHasSpans={p.rowHasSpans}
        className={
          p.isBoundary ? "ace-grid__row-order-cell--system-boundary" : ""
        }
        role="gridcell"
        ariaColIndex={ariaColIndex}
        ariaRowIndex={ariaRowIndex}
        style={resolvedStyle}
      />
    ) : (
      <div
        id={cellId}
        className={cx(
          "ace-grid__system-cell",
          "ace-grid__system-cell--order-empty",
          boundarySystemClassName
        )}
        role="gridcell"
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        style={applySystemCellTheme({
          ...resolvedStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
          boxShadow: "var(--ace-grid-cell-shadow, none)",
          borderRightWidth: 1,
          borderRightStyle: "solid",
          borderRightColor: "var(--ace-grid-cell-border-color-alt)",
        })}
      />
    );
  }
  return (
    <RowSelectCell
      id={cellId}
      key={`row-select-${row.id}-${p.absRowIndex}`}
      className={p.isBoundary ? "ace-grid__row-select--system-boundary" : ""}
      role="gridcell"
      ariaColIndex={ariaColIndex}
      ariaRowIndex={ariaRowIndex}
      row={row}
      rowId={row.id}
      rows={p.rows}
      selectedRowIds={p.selectedRowIds}
      selectedRowIdSet={p.selectedRowIdSet}
      selectionMetrics={p.selectionMetrics}
      onRowSelectionChange={p.onRowSelectionChange}
      clientGroupSelects={p.clientGroupSelects}
      ssrmSelectionState={p.ssrmSelectionState}
      ssrmSelectableRowCount={p.ssrmSelectableRowCount}
      ssrmGroupSelects={p.ssrmGroupSelects}
      ssrmSelectionCache={p.ssrmSelectionCache}
      onSsrmSelectionStateChange={p.onSsrmSelectionStateChange}
      style={resolvedStyle}
    />
  );
});
