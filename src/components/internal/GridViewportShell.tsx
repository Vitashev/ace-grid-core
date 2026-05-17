import React, { type CSSProperties } from "react";

import type { ColumnResizeGuideProps } from "../../features/resize";
import { cx } from "../../utils/cx";

type GridViewportShellProps = {
  containerRef: React.Ref<HTMLDivElement>;
  rootClassName: string;
  themeSlug: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  gridAriaRowCount: number;
  gridAriaColCount: number;
  activeSelectionCellId?: string;
  showGlobalLoadingIndicator: boolean;
  gridRootStyle: CSSProperties;
  onScroll: React.UIEventHandler<HTMLDivElement>;
  onPointerDownCapture: React.PointerEventHandler<HTMLDivElement>;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  serverRowModelEnabled: boolean;
  columnResizeGuideRef: React.Ref<HTMLDivElement>;
  columnResizeGuide?: ColumnResizeGuideProps | null;
  totalWidth: number;
  totalHeight: number;
  children: React.ReactNode;
};

export const GridViewportShell: React.FC<GridViewportShellProps> = ({
  containerRef,
  rootClassName,
  themeSlug,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  gridAriaRowCount,
  gridAriaColCount,
  activeSelectionCellId,
  showGlobalLoadingIndicator,
  gridRootStyle,
  onScroll,
  onPointerDownCapture,
  onPointerDown,
  onKeyDown,
  serverRowModelEnabled,
  columnResizeGuideRef,
  columnResizeGuide,
  totalWidth,
  totalHeight,
  children,
}) => {
  return (
    <div
      ref={containerRef}
      className={rootClassName}
      data-ace-grid-theme={themeSlug}
      role="grid"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-rowcount={gridAriaRowCount}
      aria-colcount={gridAriaColCount}
      aria-multiselectable="true"
      aria-activedescendant={activeSelectionCellId}
      aria-busy={showGlobalLoadingIndicator || undefined}
      tabIndex={0}
      style={gridRootStyle}
      onScroll={onScroll}
      onPointerDownCapture={onPointerDownCapture}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {serverRowModelEnabled ? (
        <div
          className={cx(
            "ace-grid__global-loading-indicator",
            showGlobalLoadingIndicator &&
              "ace-grid__global-loading-indicator--visible",
          )}
          role="presentation"
          aria-hidden={!showGlobalLoadingIndicator}
          style={{
            position: "absolute",
            top: "calc(var(--ace-grid-header-total-height, 0px) + 8px)",
            right: 10,
            pointerEvents: "none",
            zIndex: 690,
          }}
        >
          <div className="ace-grid__global-loading-pill">
            <span className="ace-grid__global-loading-dot" />
            Loading
          </div>
        </div>
      ) : null}
      <div
        className="ace-grid__canvas"
        style={{
          width: totalWidth,
          height: totalHeight,
          position: "relative",
        }}
      >
        {columnResizeGuide ? (
          <div
            ref={columnResizeGuideRef}
            {...columnResizeGuide}
            style={{ ...columnResizeGuide.style, zIndex: 600 }}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
};
