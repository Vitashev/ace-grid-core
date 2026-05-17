import React, { useMemo } from "react";
import type { CSSProperties } from "react";
import type {
  GridPaginationLabels,
  GridPaginationRenderState,
} from "../../../types";
import type { GridThemeTokens } from "../../theming/types";
import { cx } from "../../../utils/cx";

type PaginationBarProps = {
  state: GridPaginationRenderState;
  tokens: GridThemeTokens;
  className?: string;
  style?: CSSProperties;
  labels?: GridPaginationLabels;
  showPageSize?: boolean;
  showRange?: boolean;
  showPageInfo?: boolean;
  showControls?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
};

export const PaginationBar: React.FC<PaginationBarProps> = ({
  state,
  tokens,
  className,
  style,
  labels,
  showPageSize = true,
  showRange = true,
  showPageInfo = true,
  showControls = true,
  showFirstLast = true,
  disabled = false,
}) => {
  const formatter = useMemo(() => new Intl.NumberFormat(), []);
  const fmt = (value: number) => formatter.format(value);

  const labelPageSize = labels?.pageSize ?? "Page Size";
  const labelPage = labels?.page ?? "Page";
  const labelOf = labels?.of ?? "of";
  const rangeSeparator = labels?.rangeSeparator ?? "to";

  const rangeNode =
    labels?.range?.({
      start: state.rangeStart,
      end: state.rangeEnd,
      total: state.totalRowCount,
    }) ??
    `${fmt(state.rangeStart)} ${rangeSeparator} ${fmt(
      state.rangeEnd
    )} ${labelOf} ${fmt(state.totalRowCount)}`;

  const pageInfoNode =
    labels?.pageInfo?.({
      pageIndex: state.pageIndex,
      pageCount: state.pageCount,
    }) ??
    `${labelPage} ${fmt(state.pageIndex + 1)} ${labelOf} ${fmt(
      state.pageCount
    )}`;

  const baseFontSize = Math.max(12, tokens.fontSize - 1);
  const rootStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
    padding: "10px 12px",
    borderTop: `1px solid ${tokens.borderColor}`,
    background: tokens.surfaceBase,
    color: tokens.textPrimary,
    fontSize: baseFontSize,
  };

  const labelStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: tokens.textSecondary,
    fontWeight: 600,
  };

  const selectStyle: CSSProperties = {
    appearance: "none",
    padding: "6px 24px 6px 10px",
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.borderColor}`,
    background: tokens.surfaceRaised,
    color: tokens.textPrimary,
    fontSize: baseFontSize,
    lineHeight: 1.2,
  };

  const caretStyle: CSSProperties = {
    position: "absolute",
    right: 7,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: tokens.textMuted,
    width: 14,
    height: 14,
  };

  const controlsStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  const buttonStyle: CSSProperties = {
    appearance: "none",
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.borderColor}`,
    background: tokens.surfaceRaised,
    color: tokens.textPrimary,
    padding: "4px 8px",
    minWidth: 32,
    minHeight: 28,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: baseFontSize,
  };

  const buttonDisabledStyle: CSSProperties = {
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const iconCls = "ace-grid__pagination-icon";

  const renderButton = (
    label: string,
    onClick: () => void,
    isDisabled: boolean,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
      className="ace-grid__pagination-button"
      style={{
        ...buttonStyle,
        ...(isDisabled ? buttonDisabledStyle : null),
      }}
    >
      {icon}
    </button>
  );

  const effectiveDisabled = disabled || state.disabled;
  const disablePrev = effectiveDisabled || !state.canPrev;
  const disableNext = effectiveDisabled || !state.canNext;

  return (
    <div
      className={cx("ace-grid__pagination", className)}
      style={{ ...rootStyle, ...style }}
    >
      {showPageSize && (
        <label
          className="ace-grid__pagination-page-size"
          style={labelStyle}
        >
          {labelPageSize}:
          <span
            style={{ position: "relative", display: "inline-flex" }}
            className="ace-grid__pagination-select-wrap"
          >
            <select
              aria-label={labelPageSize}
              value={state.pageSize}
              onChange={(e) => state.setPageSize(parseInt(e.target.value, 10))}
              className="ace-grid__pagination-select"
              style={selectStyle}
              disabled={effectiveDisabled}
            >
              {state.pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {fmt(size)}
                </option>
              ))}
            </select>
            <span
              style={caretStyle}
              className="ace-grid__pagination-caret"
            >
              <svg
                viewBox="0 0 16 16"
                width="1em"
                height="1em"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 6.5 8 9.5l3-3" />
              </svg>
            </span>
          </span>
        </label>
      )}

      {showRange && (
        <span className="ace-grid__pagination-range">
          {rangeNode}
        </span>
      )}
      {showPageInfo && (
        <span className="ace-grid__pagination-page-info">
          {pageInfoNode}
        </span>
      )}

      {showControls && (
        <div
          className="ace-grid__pagination-controls"
          style={controlsStyle}
        >
          {showFirstLast &&
            renderButton(
              "First page",
              state.goToFirst,
              disablePrev,
              state.icons.paginationFirst({ className: iconCls, disabled: disablePrev })
            )}
          {renderButton(
            "Previous page",
            state.prevPage,
            disablePrev,
            state.icons.paginationPrev({ className: iconCls, disabled: disablePrev })
          )}
          {renderButton(
            "Next page",
            state.nextPage,
            disableNext,
            state.icons.paginationNext({ className: iconCls, disabled: disableNext })
          )}
          {showFirstLast &&
            renderButton(
              "Last page",
              state.goToLast,
              disableNext,
              state.icons.paginationLast({ className: iconCls, disabled: disableNext })
            )}
        </div>
      )}
    </div>
  );
};
