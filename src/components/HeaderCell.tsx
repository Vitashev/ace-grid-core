import React, { memo, useId, useMemo } from "react";
import {
  GRID_SYSTEM_COLUMN_KEYS,
  GridColumn,
  GridColumnFilterPanelRendererArgs,
  GridRow,
  GridFilterConfig,
  GridSortConfig,
} from "../types";
import { RowFilter, ColumnFilter } from "../features/filtering";
import { resolveFilterValueChoices } from "../features/filtering/utils/filterValueChoices";
import type { GridColumnDropEdge } from "../features/reorder/types";
import { isSystemCol } from "../features/cell-selection";
import { useGridTheme } from "../features/theming";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";
import type {
  HeaderCellState as HeaderCellThemeState,
  HeaderCellDragHandleState,
  HeaderCellSortButtonState,
  HeaderCellFilterTriggerState,
  HeaderPinButtonState,
} from "../features/theming/types";
import { cx } from "../utils/cx";

const EMPTY_UNIQUE_VALUES: never[] = [];
const EMPTY_ROWS: GridRow[] = [];
const COLUMN_REORDER_DISABLED_REASON =
  "Cannot reorder columns that participate in merged cells";

type DragState = {
  draggedColumnKey: string | null;
  dragOverColumnKey: string | null;
  dragOverPosition: GridColumnDropEdge | null;
};

interface HeaderCellProps {
  id?: string;
  col: GridColumn;
  isPinned: boolean;
  headerHeight: number;
  headerLabel?: React.ReactNode;

  // lookups
  colWidthOf: (k: string) => number;
  columnHasSpans: (k: string) => boolean;

  // DnD
  dragState: DragState;
  isColReorder: boolean;
  pinnedSet: Set<string>;
  leftPinnedSet: Set<string>;
  onColDragStart: (e: React.DragEvent, key: string) => void;
  onColDragOver: (e: React.DragEvent, key: string) => void;
  onColDragLeave: (e: React.DragEvent) => void;
  onColDrop: (e: React.DragEvent, key: string) => void;
  onColDragEnd: (e: React.DragEvent) => void;

  // selection (columns)
  isColSelection: boolean;
  selectedColumnKeys: string[];
  toggleColumnSelection: (key: string) => void;

  // sorting
  sortModel: GridSortConfig[];
  triggerSort: (key: string, event?: React.MouseEvent) => void;

  // resizing
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;

  // filtering
  activeFilters: GridFilterConfig[];
  activeFilterColumn: string | null;
  setActiveFilterColumn: (value: string | null) => void;
  onFilter?: (columnKey: string, filter: GridFilterConfig | null) => void;
  rows: GridRow[];
  rowsRevision?: number;
  enableAdvancedMultiFilter?: boolean;
  renderColumnFilterPanel?: (
    args: GridColumnFilterPanelRendererArgs
  ) => React.ReactNode;

  // pinning
  doPinColumn: (key: string, side: "left" | "right" | null) => void;
  isColPinning: boolean;
  enableColumnResize: boolean;
  ariaColIndex?: number;
  ariaRowIndex?: number;

  // special header (row selection checkbox)
  renderRowSelectHeader: () => React.ReactNode;

  // container style (for grid positioning when in column groups)
  containerStyle?: React.CSSProperties;
  isSystemBoundary?: boolean;
}

export const HeaderCell: React.FC<HeaderCellProps> = memo(
  ({
    id,
    col,
    isPinned,
    headerHeight,
    headerLabel,

    colWidthOf,
    columnHasSpans,

    dragState,
    isColReorder,
    pinnedSet,
    leftPinnedSet,
    onColDragStart,
    onColDragOver,
    onColDragLeave,
    onColDrop,
    onColDragEnd,

    isColSelection,
    selectedColumnKeys,
    toggleColumnSelection,

    sortModel,
    triggerSort,

    getColumnResizeHandleProps,

    activeFilters,
    activeFilterColumn,
    setActiveFilterColumn,
    onFilter,
    rows,
    rowsRevision = 0,
    enableAdvancedMultiFilter,
    renderColumnFilterPanel,

    doPinColumn,
    isColPinning,

    enableColumnResize,
    ariaColIndex,
    ariaRowIndex,

    renderRowSelectHeader,

    containerStyle,
    isSystemBoundary = false,
  }) => {
    const { tokens, components, icons } = useGridTheme();
    const filterTriggerId = useId();
    const horizontalPadding = tokens.cellPaddingHorizontal;
    const filterInteractive = col.filterable && Boolean(onFilter);
    const filterOpen = filterInteractive && activeFilterColumn === col.key;
    const hasFilter = filterInteractive
      ? activeFilters.some((f) => f.columnKey === col.key)
      : false;
    const uniqueValueRows = filterOpen ? rows : EMPTY_ROWS;
    const { values: uniqueValues, hasBlanks } = useMemo(
      () =>
        filterOpen
          ? RowFilter.uniqueValuesCached(uniqueValueRows, col.key, rowsRevision)
          : { values: EMPTY_UNIQUE_VALUES, hasBlanks: false },
      [filterOpen, uniqueValueRows, col.key, rowsRevision]
    );
    const {
      values: resolvedFilterValues,
      hasBlanks: resolvedFilterHasBlanks,
    } = useMemo(
      () => resolveFilterValueChoices(col, uniqueValues, hasBlanks),
      [col, hasBlanks, uniqueValues],
    );
    const w = colWidthOf(col.key);
    const hasSp = columnHasSpans(col.key);

    const isSystemColumn = isSystemCol(col.key);
    const isRightPinnedColumn =
      pinnedSet.has(col.key) && !leftPinnedSet.has(col.key);
    const isDragged = dragState.draggedColumnKey === col.key;
    const isColSel = isColSelection && selectedColumnKeys.includes(col.key);
    const isDragOver = dragState.dragOverColumnKey === col.key;
    const canDrag = isColReorder && !hasSp && !isSystemColumn;
    const showDragHandle = isColReorder && !isSystemColumn;

    let dropTypeClass = "";
    let dropIntent: "pin" | "unpin" | "cross" | null = null;
    if (isDragOver && dragState.draggedColumnKey) {
      const draggedPinned = pinnedSet.has(dragState.draggedColumnKey);
      const targetPinned = pinnedSet.has(col.key);
      const draggedLeft = leftPinnedSet.has(dragState.draggedColumnKey);
      const targetLeft = leftPinnedSet.has(col.key);
      if (draggedPinned && !targetPinned) {
        dropTypeClass = "unpin-drop";
        dropIntent = "unpin";
      } else if (!draggedPinned && targetPinned) {
        dropTypeClass = "pin-drop";
        dropIntent = "pin";
      } else if (draggedPinned && targetPinned && draggedLeft !== targetLeft) {
        dropTypeClass = "cross-pin-drop";
        dropIntent = "cross";
      }
    }

    const dragEdge =
      isDragOver && dragState.dragOverPosition
        ? dragState.dragOverPosition
        : null;

    const headerBaseStyle: React.CSSProperties = {
      width: w,
      minWidth: w,
      maxWidth: w,
      height: headerHeight,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: isSystemColumn ? "center" : "space-between",
      padding: isSystemColumn ? 0 : `0 ${horizontalPadding}px`,
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: tokens.headerBorderColor,
      borderBottom: `1px solid ${tokens.headerBorderColor}`,
      backgroundColor: isDragged
        ? tokens.headerBackgroundDragging
        : isColSel
        ? tokens.headerBackgroundSelected
        : isPinned
        ? tokens.headerBackgroundPinned
        : tokens.headerBackground,
      fontWeight: 600,
      fontSize: tokens.fontSize,
      cursor: canDrag ? "grab" : "default",
      userSelect: "none",
      position: "relative",
      boxSizing: "border-box",
      opacity: isDragged ? 0.5 : 1,
      color: tokens.headerTextColor,
      gap: isSystemColumn ? 0 : 8,
    };

    const headerThemeState: HeaderCellThemeState = {
      isPinned,
      isDragged,
      isColumnSelected: isColSel,
      isDragOver,
      dragEdge,
      dropIntent,
      hasSpans: hasSp,
      column: col,
    };

    const headerStyle = components.headerCell
      ? components.headerCell({
          base: headerBaseStyle,
          state: headerThemeState,
          tokens,
        })
      : headerBaseStyle;

    // Merge containerStyle (grid positioning) with headerStyle
    // Grid positioning styles (gridColumn, gridRow, zIndex) from containerStyle
    // should be applied first, then headerStyle properties take precedence
    const finalStyle = containerStyle
      ? {
          ...containerStyle,
          ...headerStyle,
          // Ensure grid positioning from containerStyle is preserved
          gridColumn: containerStyle.gridColumn,
          gridRow: containerStyle.gridRow,
          zIndex: containerStyle.zIndex ?? headerStyle.zIndex,
        }
      : headerStyle;

    const headerClassName = cx(
      "ace-grid__header-cell",
      isDragged && "ace-grid__header-cell--dragging",
      isDragOver &&
        dragState.dragOverPosition === "left" &&
        "ace-grid__header-cell--drag-over-left",
      isDragOver &&
        dragState.dragOverPosition === "right" &&
        "ace-grid__header-cell--drag-over-right",
      dropTypeClass && `ace-grid__header-cell--${dropTypeClass}`,
      hasSp && "ace-grid__header-cell--has-spans",
      showDragHandle &&
        !canDrag &&
        "ace-grid__header-cell--drag-disabled",
      isSystemColumn && "ace-grid__header-cell--system",
      isSystemColumn &&
        isSystemBoundary &&
        "ace-grid__header-cell--system-boundary",
      filterOpen && "ace-grid__header-cell--filter-open"
    );

    const dragHandleState: HeaderCellDragHandleState = {
      isPinned,
      isDragging: isDragged,
    };
    const dragHandleBaseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      color: canDrag ? tokens.textMuted : "var(--ace-grid-pin-icon-disabled)",
      cursor: canDrag ? "grab" : "not-allowed",
    };
    const dragHandleStyle = components.headerCellDragHandle
      ? components.headerCellDragHandle({
          base: dragHandleBaseStyle,
          state: dragHandleState,
          tokens,
        })
      : dragHandleBaseStyle;
    const dragHandleIcon = icons.dragHandle({
      className: "ace-grid__drag-handle-icon",
      isPinned,
      isDragging: isDragged,
      orientation: "column",
    });

    const sortIndex = sortModel.findIndex((entry) => entry.columnKey === col.key);
    const sortEntry = sortIndex >= 0 ? sortModel[sortIndex] : null;
    const sortIsActive = sortIndex >= 0;
    const sortOrder =
      sortIsActive && sortModel.length > 1 ? sortIndex + 1 : null;
    const sortState: HeaderCellSortButtonState = {
      isActive: sortIsActive,
      direction: sortIsActive ? sortEntry?.direction ?? null : null,
      order: sortOrder,
    };
    const sortButtonBaseStyle: React.CSSProperties = {
      background: "none",
      border: "none",
      padding: 0,
      fontSize: Math.max(tokens.fontSize - 2, 10),
      lineHeight: 1,
      cursor: "pointer",
      color: sortState.isActive
        ? tokens.sortIconActive
        : tokens.sortIconDefault,
      display: "inline-flex",
      alignItems: "center",
    };
    const sortButtonStyle = components.headerCellSortButton
      ? components.headerCellSortButton({
          base: sortButtonBaseStyle,
          state: sortState,
          tokens,
        })
      : sortButtonBaseStyle;
    const sortIcon = icons.sort({
      className: cx(
        "ace-grid__sort-icon",
        sortState.isActive && "ace-grid__sort-icon--active",
        sortState.direction === "asc" && "ace-grid__sort-icon--asc",
        sortState.direction === "desc" && "ace-grid__sort-icon--desc"
      ),
      direction: sortState.direction,
    });

    const filterState: HeaderCellFilterTriggerState = {
      isActive: hasFilter,
      isOpen: activeFilterColumn === col.key,
    };
    const filterTriggerHighlighted =
      filterState.isActive || filterState.isOpen;
    const filterTriggerBaseStyle: React.CSSProperties = {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontSize: Math.max(tokens.fontSize - 2, 10),
      color: filterTriggerHighlighted
        ? tokens.filterIconActive
        : tokens.filterIconDefault,
      display: "inline-flex",
      alignItems: "center",
    };
    const filterTriggerStyle = components.headerCellFilterTrigger
      ? components.headerCellFilterTrigger({
          base: filterTriggerBaseStyle,
          state: filterState,
          tokens,
        })
      : filterTriggerBaseStyle;
    const filterIconNode = icons.filter({
      className: "ace-grid__filter-icon",
      isActive: filterState.isActive,
      isOpen: filterState.isOpen,
    });

    const buildPinStyle = (state: HeaderPinButtonState) => {
      const base: React.CSSProperties = {
        background: "none",
        border: "none",
        padding: 0,
        cursor: state.disabled ? "not-allowed" : "pointer",
        fontSize: Math.max(tokens.fontSize - 3, 9),
        color: state.disabled
          ? tokens.pinIconDisabled
          : tokens.pinIconDefault,
        opacity: state.disabled ? 0.4 : state.isActionUnpin ? 0.58 : 1,
        display: "inline-flex",
        alignItems: "center",
      };
      return components.headerPinButton
        ? components.headerPinButton({ base, state, tokens })
        : base;
    };

    const isPinnedLeft = isPinned && leftPinnedSet.has(col.key);
    const isPinnedRight = isPinned && !isPinnedLeft;
    const leftActsAsUnpin = isPinnedLeft;
    const rightActsAsUnpin = isPinnedRight;
    const leftPinDisabled = leftActsAsUnpin ? false : hasSp;
    const rightPinDisabled = rightActsAsUnpin ? false : hasSp;

    const pinLeftState: HeaderPinButtonState = {
      type: "left",
      disabled: leftPinDisabled,
      isPinned,
      targetSide: "left",
      isActionUnpin: leftActsAsUnpin,
    };
    const pinRightState: HeaderPinButtonState = {
      type: "right",
      disabled: rightPinDisabled,
      isPinned,
      targetSide: "right",
      isActionUnpin: rightActsAsUnpin,
    };

    const pinLeftStyle = buildPinStyle(pinLeftState);
    const pinRightStyle = buildPinStyle(pinRightState);

    const pinLeftIcon = icons.pinLeft({
      className: cx(
        "ace-grid__pin-icon",
        leftActsAsUnpin && "ace-grid__pin-icon--unpin",
        leftActsAsUnpin && "ace-grid__pin-icon--active"
      ),
      disabled: leftPinDisabled,
      isPinned,
      targetSide: "left",
    });
    const pinRightIcon = icons.pinRight({
      className: cx(
        "ace-grid__pin-icon",
        rightActsAsUnpin && "ace-grid__pin-icon--unpin",
        rightActsAsUnpin && "ace-grid__pin-icon--active"
      ),
      disabled: rightPinDisabled,
      isPinned,
      targetSide: "right",
    });

    const showHeaderActions = !isSystemColumn;

    const resolvedLabel = headerLabel ?? col.title;
    const hasCustomHeaderRenderer = typeof col.renderHeader === "function";
    const renderHeaderMode = col.renderHeaderMode ?? "passive";
    const customHeaderLabel = hasCustomHeaderRenderer
      ? col.renderHeader?.({ column: col, label: resolvedLabel })
      : resolvedLabel;
    const resolvedHeaderLabel =
      hasCustomHeaderRenderer && renderHeaderMode === "passive" ? (
        <span className="ace-grid__header-cell-rendered-label">
          {customHeaderLabel}
        </span>
      ) : (
        customHeaderLabel
      );

    const resolvedStyle = isSystemColumn
      ? {
          ...finalStyle,
          zIndex:
            (typeof finalStyle.zIndex === "number"
              ? finalStyle.zIndex
              : Number(finalStyle.zIndex ?? 0) || 0) + 200,
        }
      : finalStyle;

    return (
      <div
        id={id}
        role="columnheader"
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        aria-sort={
          col.sortable
            ? sortState.isActive
              ? sortState.direction === "desc"
                ? "descending"
                : "ascending"
              : "none"
            : undefined
        }
        className={headerClassName}
        data-column-key={col.key}
        draggable={canDrag}
        onDragStart={(e) => onColDragStart(e, col.key)}
        onDragOver={(e) => onColDragOver(e, col.key)}
        onDragLeave={onColDragLeave}
        onDrop={(e) => onColDrop(e, col.key)}
        onDragEnd={onColDragEnd}
        style={resolvedStyle}
      >
        <div
          className={cx(
            "ace-grid__header-cell-content",
            isSystemColumn && "ace-grid__header-cell-content--system"
          )}
        >
          {showDragHandle && (
            <span
              className="ace-grid__drag-handle"
              title={
                !canDrag
                  ? COLUMN_REORDER_DISABLED_REASON
                  : isPinned
                  ? "Drag to reorder or unpin (drop in center area)"
                  : "Drag to reorder or pin (drop in pinned area)"
              }
              style={dragHandleStyle}
              data-col-drag-handle={canDrag ? "true" : undefined}
              aria-disabled={!canDrag || undefined}
            >
              {dragHandleIcon}
            </span>
          )}
          {col.key === GRID_SYSTEM_COLUMN_KEYS.rowSelection ? (
            renderRowSelectHeader()
          ) : isSystemColumn ? (
            <span
              className="ace-grid__header-cell-title ace-grid__header-cell-title--system"
            >
              {resolvedHeaderLabel}
            </span>
          ) : (
            <span className="ace-grid__header-cell-label">
              <span
                className="ace-grid__header-cell-label-inner"
              >
                {isColSelection && !isSystemColumn ? (
                  <input
                    type="checkbox"
                    checked={selectedColumnKeys.includes(col.key)}
                    onClick={(ev) => ev.stopPropagation()}
                    onChange={(ev) => {
                      ev.stopPropagation();
                      toggleColumnSelection(col.key);
                    }}
                    className="ace-grid__header-cell-select"
                    aria-label={
                      selectedColumnKeys.includes(col.key)
                        ? `Deselect column ${col.title}`
                        : `Select column ${col.title}`
                    }
                    title={
                      selectedColumnKeys.includes(col.key)
                        ? "Deselect column"
                        : "Select column"
                    }
                  />
                ) : null}
                <span className="ace-grid__header-cell-title">
                  {resolvedHeaderLabel}
                </span>
              </span>
            </span>
          )}
        </div>

        {showHeaderActions ? (
          <div className="ace-grid__header-cell-actions">
            {col.sortable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSort(col.key, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                title={
                  sortState.isActive
                    ? sortState.direction === "asc"
                      ? "Sort descending"
                      : "Sort ascending"
                    : "Sort ascending"
                }
                aria-label={
                  sortState.isActive
                    ? `Sort ${col.title} ${
                        sortState.direction === "asc"
                          ? "descending"
                          : "ascending"
                      }`
                    : `Sort ${col.title} ascending`
                }
                style={sortButtonStyle}
                className={cx(
                  "ace-grid__sort-button",
                  sortState.isActive && "ace-grid__sort-button--active",
                  sortState.direction === "asc" && "ace-grid__sort-button--asc",
                  sortState.direction === "desc" && "ace-grid__sort-button--desc"
                )}
              >
                {sortIcon}
                {sortOrder ? (
                  <span className="ace-grid__sort-order">
                    {sortOrder}
                  </span>
                ) : null}
              </button>
            )}

            {filterInteractive && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilterColumn(
                    activeFilterColumn === col.key ? null : col.key
                  );
                }}
                aria-label={
                  filterState.isOpen
                    ? `Close filter for ${col.title}`
                    : `Open filter for ${col.title}`
                }
                aria-haspopup="dialog"
                aria-controls={filterState.isOpen ? `${filterTriggerId}-panel` : undefined}
                aria-expanded={filterState.isOpen || undefined}
                aria-pressed={filterState.isOpen || undefined}
                id={filterTriggerId}
                style={filterTriggerStyle}
                className={cx(
                  "ace-grid__filter-trigger",
                  filterState.isOpen && "ace-grid__filter-trigger--open",
                  filterState.isActive && "ace-grid__filter-trigger--active"
                )}
              >
                <span
                  className={cx(
                    "ace-grid__filter-trigger-icon",
                    filterState.isOpen && "ace-grid__filter-trigger-icon--open",
                    filterState.isActive && "ace-grid__filter-trigger-icon--active"
                  )}
                >
                  {filterIconNode}
                  {filterState.isActive && (
                    <span className="ace-grid__filter-indicator" />
                  )}
                </span>
              </button>
            )}

            {isColPinning && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!leftPinDisabled) {
                      doPinColumn(col.key, leftActsAsUnpin ? null : "left");
                    }
                  }}
                  aria-label={
                    leftPinDisabled
                      ? `Pinning disabled for ${col.title}`
                      : leftActsAsUnpin
                        ? `Unpin ${col.title} from left`
                        : `Pin ${col.title} to left`
                  }
                  style={pinLeftStyle}
                  className={cx(
                    "ace-grid__pin-button",
                    "ace-grid__pin-button--left",
                    leftActsAsUnpin && "ace-grid__pin-button--unpin",
                    leftActsAsUnpin && "ace-grid__pin-button--active"
                  )}
                  title={
                    leftPinDisabled
                      ? "Cannot pin columns with spanning cells"
                      : leftActsAsUnpin
                      ? "Unpin from left"
                      : "Pin to left"
                  }
                >
                  {pinLeftIcon}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!rightPinDisabled) {
                      doPinColumn(col.key, rightActsAsUnpin ? null : "right");
                    }
                  }}
                  aria-label={
                    rightPinDisabled
                      ? `Pinning disabled for ${col.title}`
                      : rightActsAsUnpin
                        ? `Unpin ${col.title} from right`
                        : `Pin ${col.title} to right`
                  }
                  style={pinRightStyle}
                  className={cx(
                    "ace-grid__pin-button",
                    "ace-grid__pin-button--right",
                    rightActsAsUnpin && "ace-grid__pin-button--unpin",
                    rightActsAsUnpin && "ace-grid__pin-button--active"
                  )}
                  title={
                    rightPinDisabled
                      ? "Cannot pin columns with spanning cells"
                      : rightActsAsUnpin
                      ? "Unpin from right"
                      : "Pin to right"
                  }
                >
                  {pinRightIcon}
                </button>
              </>
            )}
          </div>
        ) : null}

        {enableColumnResize && col.resizable !== false && (
          <div
            {
              ...getColumnResizeHandleProps(col.key, {
                className:
                  "ace-grid__column-resize-handle ace-grid__column-resize-handle--header",
                resizeFrom: isRightPinnedColumn ? "left" : "right",
                style: {
                  position: "absolute",
                  ...(isRightPinnedColumn ? { left: -6 } : { right: -6 }),
                  top: 0,
                  bottom: 0,
                  width: 12,
                  cursor: "col-resize",
                  zIndex: 5,
                },
              })
            }
          />
        )}

        {filterOpen &&
          (() => {
            const currentFilter =
              activeFilters.find((f) => f.columnKey === col.key) ?? undefined;
            const handleClose = () => setActiveFilterColumn(null);
            const handleFilterChange = (next: GridFilterConfig | null) =>
              onFilter?.(col.key, next);
            const renderDefault = () => (
              <ColumnFilter
                column={col}
                currentFilter={currentFilter}
                uniqueValues={resolvedFilterValues}
                hasBlanks={resolvedFilterHasBlanks}
                enableAdvancedMultiFilter={enableAdvancedMultiFilter}
                onFilterChange={handleFilterChange}
                onClose={handleClose}
                triggerId={filterTriggerId}
              />
            );
            const args: GridColumnFilterPanelRendererArgs = {
              column: col,
              currentFilter,
              uniqueValues: resolvedFilterValues,
              hasBlanks: resolvedFilterHasBlanks,
              enableAdvancedMultiFilter: Boolean(enableAdvancedMultiFilter),
              onFilterChange: handleFilterChange,
              onClose: handleClose,
              renderDefault,
            };
            return renderColumnFilterPanel
              ? renderColumnFilterPanel(args)
              : renderDefault();
          })()}
      </div>
    );
  }
);
