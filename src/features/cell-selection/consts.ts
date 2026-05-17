import type { CSSProperties } from "react";

export const SELECTION_COLOR = "var(--ace-grid-selection-border)" as const;
export const SELECTION_WIDTH = 2 as const;
export const SELECTION_STYLE: CSSProperties["borderStyle"] = "solid";

export const borderAll = (
  width: number,
  color: string,
  style: CSSProperties["borderStyle"] = "solid"
): CSSProperties =>
  ({
    borderTopWidth: width,
    borderTopStyle: style,
    borderTopColor: color,
    borderRightWidth: width,
    borderRightStyle: style,
    borderRightColor: color,
    borderBottomWidth: width,
    borderBottomStyle: style,
    borderBottomColor: color,
    borderLeftWidth: width,
    borderLeftStyle: style,
    borderLeftColor: color,
  } as CSSProperties);

export const CELL_BORDER = {
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor:
    "var(--ace-grid-cell-border-top-color, var(--ace-grid-cell-border-color))",
  borderRightWidth: 1,
  borderRightStyle: "solid",
  borderRightColor:
    "var(--ace-grid-cell-border-right-color, var(--ace-grid-cell-border-color))",
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor:
    "var(--ace-grid-cell-border-bottom-color, var(--ace-grid-cell-border-color))",
  borderLeftWidth: 1,
  borderLeftStyle: "solid",
  borderLeftColor:
    "var(--ace-grid-cell-border-left-color, var(--ace-grid-cell-border-color))",
} as const satisfies CSSProperties;
export const EDIT_BORDER = borderAll(SELECTION_WIDTH, SELECTION_COLOR);
