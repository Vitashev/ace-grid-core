// components/OffsetCell.tsx
import React, { memo } from "react";
import { cx } from "../../../utils/cx";

export const OffsetCell: React.FC<{
  width: number;
  height: number;
  label?: React.ReactNode;
  showLabel?: boolean;
  rowHeightHint?: number;
  columnWidthHint?: number;
  variant?: "body" | "header";
  position?: "before" | "after";
  tone?: "default" | "system";
  surface?: string;
  borderColor?: string;
  edgeShadow?: string;
  style?: React.CSSProperties;
}> = memo(
  ({
    width,
    height,
    label,
    showLabel = false,
    rowHeightHint,
    columnWidthHint,
    variant = "body",
    position = "before",
    tone = "default",
    surface,
    borderColor,
    edgeShadow,
    style,
  }) => {
    const shouldShowLabel = showLabel && label != null;
    const resolvedRowHeight = Math.max(
      20,
      Math.trunc(rowHeightHint ?? height) || 32
    );
    const resolvedColumnWidth = Math.max(
      64,
      Math.trunc(columnWidthHint ?? 140) || 140
    );

    return width > 0 ? (
      <div
        className={cx(
          "ace-grid__offset-cell",
          variant === "header"
            ? "ace-grid__offset-cell--header"
            : "ace-grid__offset-cell--body",
          position === "after"
            ? "ace-grid__offset-cell--after"
            : "ace-grid__offset-cell--before",
          tone === "system" && "ace-grid__offset-cell--system",
          shouldShowLabel && "ace-grid__offset-cell--label"
        )}
        role="presentation"
        aria-hidden="true"
        style={{
          "--ace-grid-offset-row-h": `${resolvedRowHeight}px`,
          "--ace-grid-offset-col-w": `${resolvedColumnWidth}px`,
          ...(surface ? { "--ace-grid-offset-bg": surface } : {}),
          ...(borderColor
            ? { "--ace-grid-offset-border": borderColor }
            : {}),
          ...(edgeShadow
            ? { "--ace-grid-offset-edge-shadow": edgeShadow }
            : {}),
          width,
          minWidth: width,
          maxWidth: width,
          height,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          boxSizing: "border-box",
          pointerEvents: shouldShowLabel ? "auto" : "none",
          ...style,
        } as React.CSSProperties & Record<string, string>}
      >
        {shouldShowLabel ? (
          <span className="ace-grid__offset-cell-label">{label}</span>
        ) : null}
      </div>
    ) : null;
  }
);
