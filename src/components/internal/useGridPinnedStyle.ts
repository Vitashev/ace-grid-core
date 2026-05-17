import { useCallback, type CSSProperties } from "react";

import type { GridColumn } from "../../types";

type StickyWidthOffsets = {
  left: Record<string, number>;
  right: Record<string, number>;
};

type UseGridPinnedStyleArgs = {
  cumulativeWidths: StickyWidthOffsets;
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
};

export const useGridPinnedStyle = ({
  cumulativeWidths,
  pinnedLeftColumns,
  pinnedRightColumns,
}: UseGridPinnedStyleArgs) => {
  const pinnedLeftEdgeColumnKey =
    pinnedLeftColumns[pinnedLeftColumns.length - 1]?.key ?? null;
  const pinnedRightEdgeColumnKey = pinnedRightColumns[0]?.key ?? null;

  const applyPinnedStyle = useCallback(
    (
      base: CSSProperties,
      column: GridColumn,
      isLeft: boolean,
      isRight: boolean,
      mode: "cell" | "strip" = "cell",
    ): CSSProperties => {
      if (!isLeft && !isRight) return base;
      const style: CSSProperties = {
        ...base,
      };
      const setVar = (name: string, value: string) => {
        (style as CSSProperties & Record<string, string>)[name] = value;
      };
      if (mode === "cell") {
        style.position = "sticky";
        style.alignSelf = "stretch";
      }
      if (isLeft) {
        if (mode === "cell") {
          style.left = cumulativeWidths.left[column.key] || 0;
        }
        const isEdgeColumn = column.key === pinnedLeftEdgeColumnKey;
        const shadow = isEdgeColumn
          ? "var(--ace-grid-pinned-shadow-left-edge)"
          : "var(--ace-grid-pinned-shadow-left)";
        setVar("--ace-grid-cell-bg", "var(--ace-grid-pinned-left-bg)");
        setVar("--ace-grid-cell-shadow", shadow);
        setVar("--ace-grid-cell-hover-shadow", shadow);
        if (mode === "cell" && isEdgeColumn) {
          style.clipPath = `inset(0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)) 0 0)`;
        }
      } else {
        if (mode === "cell") {
          style.right = cumulativeWidths.right[column.key] || 0;
        }
        const isEdgeColumn = column.key === pinnedRightEdgeColumnKey;
        const shadow = isEdgeColumn
          ? "var(--ace-grid-pinned-shadow-right-edge)"
          : "var(--ace-grid-pinned-shadow-right)";
        setVar("--ace-grid-cell-bg", "var(--ace-grid-pinned-right-bg)");
        setVar("--ace-grid-cell-shadow", shadow);
        setVar("--ace-grid-cell-hover-shadow", shadow);
        if (mode === "cell" && isEdgeColumn) {
          style.clipPath = `inset(0 0 0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)))`;
        }
      }
      return style;
    },
    [cumulativeWidths, pinnedLeftEdgeColumnKey, pinnedRightEdgeColumnKey],
  );

  return {
    applyPinnedStyle,
  };
};
