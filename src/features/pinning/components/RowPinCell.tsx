// components/RowPinCell.tsx
import React, { memo } from "react";
import { useGridTheme } from "../../theming";
import type { RowPinButtonState, RowPinCellState } from "../../theming/types";
import { cx } from "../../../utils/cx";

const ROW_PIN_DISABLED_REASON = "Cannot pin rows that participate in merged cells";

const FALLBACK_PIN_TOP_ICON = (
  <svg
    className="ace-grid__row-pin-icon ace-grid__row-pin-icon--top"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 3.3h10" />
    <path d="M8 12.6V5.6" />
    <path d="M5.8 7.8 8 5.6l2.2 2.2" />
  </svg>
);

const FALLBACK_PIN_BOTTOM_ICON = (
  <svg
    className="ace-grid__row-pin-icon ace-grid__row-pin-icon--bottom"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 12.7h10" />
    <path d="M8 3.4v7.1" />
    <path d="M5.8 8.2 8 10.5l2.2-2.3" />
  </svg>
);

export interface RowPinCellProps {
  id?: string;
  rowId: string | number;
  style?: React.CSSProperties;
  className?: string;
  role?: React.AriaRole;
  ariaColIndex?: number;
  ariaRowIndex?: number;

  // From parent/grid state
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  onPinRow?: (rowId: string | number, side: "top" | "bottom" | null) => void;

  // Either pass a boolean…
  hasSpans?: boolean;
  // …or pass the helper to compute it (the boolean takes precedence if both provided)
  rowHasSpans?: (rowId: string | number) => boolean;
}

export const RowPinCell: React.FC<RowPinCellProps> = memo(
  ({
    id,
    rowId,
    style,
    className,
    role,
    ariaColIndex,
    ariaRowIndex,
    pinnedRows,
    onPinRow,
    hasSpans,
    rowHasSpans,
  }) => {
    const idStr = String(rowId);
    const topPinned = pinnedRows.top.some((id) => String(id) === idStr);
    const bottomPinned = pinnedRows.bottom.some((id) => String(id) === idStr);
    const blocked =
      typeof hasSpans === "boolean" ? hasSpans : !!rowHasSpans?.(rowId);
    const { icons, components, tokens } = useGridTheme();
    const pinTopIcon =
      icons.pinRowTop?.({
        className: cx(
          "ace-grid__pin-icon",
          "ace-grid__row-pin-icon",
          "ace-grid__row-pin-icon--top",
          topPinned && "ace-grid__pin-icon--active",
          topPinned && "ace-grid__row-pin-icon--active"
        ),
        disabled: blocked,
        isPinned: topPinned,
        targetSide: "top",
      }) ?? FALLBACK_PIN_TOP_ICON;
    const pinBottomIcon =
      icons.pinRowBottom?.({
        className: cx(
          "ace-grid__pin-icon",
          "ace-grid__row-pin-icon",
          "ace-grid__row-pin-icon--bottom",
          bottomPinned && "ace-grid__pin-icon--active",
          bottomPinned && "ace-grid__row-pin-icon--active"
        ),
        disabled: blocked,
        isPinned: bottomPinned,
        targetSide: "bottom",
      }) ?? FALLBACK_PIN_BOTTOM_ICON;
    const cellState: RowPinCellState = {
      isPinnedTop: topPinned,
      isPinnedBottom: bottomPinned,
      isBlocked: blocked,
    };
    const baseCellStyle: React.CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      cursor: blocked ? "not-allowed" : "default",
      backgroundColor: "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
      boxShadow: "var(--ace-grid-cell-shadow, none)",
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: "var(--ace-grid-cell-border-color-alt)",
    };
    const cellStyle = components.rowPinCell
      ? components.rowPinCell({
          base: baseCellStyle,
          state: cellState,
          tokens,
        })
      : baseCellStyle;
    const topButtonState: RowPinButtonState = {
      side: "top",
      isPinned: topPinned,
      isBlocked: blocked,
    };
    const topButtonBaseStyle: React.CSSProperties = {
      background: "none",
      border: "none",
      cursor: blocked ? "not-allowed" : "pointer",
      fontSize: Math.max(tokens.fontSize - 3, 9),
      padding: 2,
      color: blocked
        ? "var(--ace-grid-pin-icon-disabled)"
        : "var(--ace-grid-pin-icon)",
      opacity: blocked ? 0.4 : topPinned ? 0.58 : 1,
      display: "inline-flex",
      alignItems: "center",
    };
    const topButtonStyle = components.rowPinButton
      ? components.rowPinButton({
          base: topButtonBaseStyle,
          state: topButtonState,
          tokens,
        })
      : topButtonBaseStyle;
    const bottomButtonState: RowPinButtonState = {
      side: "bottom",
      isPinned: bottomPinned,
      isBlocked: blocked,
    };
    const bottomButtonBaseStyle: React.CSSProperties = {
      background: "none",
      border: "none",
      cursor: blocked ? "not-allowed" : "pointer",
      fontSize: Math.max(tokens.fontSize - 3, 9),
      padding: 2,
      color: blocked
        ? "var(--ace-grid-pin-icon-disabled)"
        : "var(--ace-grid-pin-icon)",
      opacity: blocked ? 0.4 : bottomPinned ? 0.58 : 1,
      display: "inline-flex",
      alignItems: "center",
    };
    const bottomButtonStyle = components.rowPinButton
      ? components.rowPinButton({
          base: bottomButtonBaseStyle,
          state: bottomButtonState,
          tokens,
        })
      : bottomButtonBaseStyle;

    return (
      <div
        id={id}
        // key is the parent's responsibility
        className={cx(
          "ace-grid__row-pin",
          blocked && "ace-grid__row-pin--disabled",
          className
        )}
        role={role}
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        aria-disabled={blocked || undefined}
        style={cellStyle}
        title={blocked ? ROW_PIN_DISABLED_REASON : undefined}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onPinRow && !blocked) onPinRow(rowId, topPinned ? null : "top");
          }}
          disabled={blocked}
          className={cx(
            topPinned && "ace-grid__pin-button--unpin",
            topPinned && "ace-grid__pin-button--active",
            "ace-grid__row-pin-button",
            "ace-grid__row-pin-button--top",
            topPinned && "ace-grid__row-pin-button--unpin",
            topPinned && "ace-grid__row-pin-button--active"
          )}
          style={topButtonStyle}
          title={
            blocked
              ? ROW_PIN_DISABLED_REASON
              : topPinned
              ? "Unpin from top"
              : "Pin to top"
          }
          aria-label={
            blocked
              ? "Pinning disabled"
              : topPinned
              ? "Unpin row from top"
              : "Pin row to top"
          }
        >
          {pinTopIcon}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onPinRow && !blocked)
              onPinRow(rowId, bottomPinned ? null : "bottom");
          }}
          disabled={blocked}
          className={cx(
            bottomPinned && "ace-grid__pin-button--unpin",
            bottomPinned && "ace-grid__pin-button--active",
            "ace-grid__row-pin-button",
            "ace-grid__row-pin-button--bottom",
            bottomPinned && "ace-grid__row-pin-button--unpin",
            bottomPinned && "ace-grid__row-pin-button--active"
          )}
          style={bottomButtonStyle}
          title={
            blocked
              ? ROW_PIN_DISABLED_REASON
              : bottomPinned
              ? "Unpin from bottom"
              : "Pin to bottom"
          }
          aria-label={
            blocked
              ? "Pinning disabled"
              : bottomPinned
              ? "Unpin row from bottom"
              : "Pin row to bottom"
          }
        >
          {pinBottomIcon}
        </button>
      </div>
    );
  }
);
