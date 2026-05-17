import React, { memo } from "react";
import { useGridTheme } from "../../theming";
import type { RowOrderCellState } from "../../theming/types";
import { cx } from "../../../utils/cx";

const ROW_REORDER_DISABLED_REASON =
  "Cannot reorder rows that participate in merged cells";

export interface RowOrderCellProps {
  id?: string;
  rowId: string | number;
  style?: React.CSSProperties;
  /** Whether row reordering is enabled globally */
  isRowReorder: boolean;
  /** Function that returns true if the row has any spanning cells */
  rowHasSpans: (rowId: string | number) => boolean;
  /** Optional for test IDs or extra classes */
  className?: string;
  role?: React.AriaRole;
  ariaColIndex?: number;
  ariaRowIndex?: number;
}

export const RowOrderCell: React.FC<RowOrderCellProps> = memo(
  ({
    id,
    rowId,
    style,
    isRowReorder,
    rowHasSpans,
    className,
    role,
    ariaColIndex,
    ariaRowIndex,
  }) => {
    const can = isRowReorder && !rowHasSpans(rowId);
    const { icons, components, tokens } = useGridTheme();
    const dragIcon = icons.dragHandle({
      className: "ace-grid__row-order-icon",
      isPinned: false,
      isDragging: false,
      orientation: "row",
    });
    const state: RowOrderCellState = {
      isReorderable: can,
    };
    const baseStyle: React.CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
      boxShadow: "var(--ace-grid-cell-shadow, none)",
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: "var(--ace-grid-cell-border-color-alt)",
      cursor: can ? "grab" : "not-allowed",
      userSelect: "none",
    };
    const themedStyle = components.rowOrderCell
      ? components.rowOrderCell({
          base: baseStyle,
          state,
          tokens,
        })
      : baseStyle;

    return (
      <div
        id={id}
        className={cx(
          "ace-grid__row-order-cell",
          !can && "ace-grid__row-order-cell--disabled",
          className
        )}
        role={role}
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        aria-label={can ? "Drag row to reorder" : ROW_REORDER_DISABLED_REASON}
        aria-disabled={(!can) || undefined}
        data-row-drag-handle={can ? "true" : undefined}
        style={themedStyle}
        title={can ? "Drag row to reorder" : ROW_REORDER_DISABLED_REASON}
      >
        <span
          className="ace-grid__row-order-handle"
          style={{
            fontSize: 14,
            color: can
              ? "var(--ace-grid-text-secondary)"
              : "var(--ace-grid-pin-icon-disabled)",
            fontWeight: "bold",
          }}
        >
          {dragIcon}
        </span>
      </div>
    );
  }
);
