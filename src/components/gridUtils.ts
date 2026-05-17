import React from "react";
import { GRID_SYSTEM_COLUMN_KEYS } from "../types";
import type {
  GridColumn,
  GridColumnDef,
  GridChartOptions,
  GridChartSettings,
  GridPaginationIcons,
  GridSelection,
  GridRow,
  GridMergedCell,
} from "../types";
import type {
  GridIconDefinition,
  GridIconRenderer,
  GridIconSet,
} from "../features/theming";
import { cx } from "../utils/cx";

const isIntrinsicIconTag = (value: string) => /^[a-z][\w:-]*$/.test(value);

export const normalizeIcon = <State extends { className?: string }>(
  icon: GridIconDefinition<State>
): GridIconRenderer<State> => {
  if (typeof icon === "function") {
    return (state) =>
      React.createElement(icon as React.ComponentType<State>, state);
  }

  if (typeof icon === "string" && isIntrinsicIconTag(icon)) {
    return (state) =>
      React.createElement(icon, { className: state.className });
  }

  return (state) => {
    const className =
      (state as { className?: string } | null | undefined)?.className ?? "";
    if (React.isValidElement(icon)) {
      const existingClassName =
        (icon.props as { className?: string } | undefined)?.className ?? "";
      const mergedClassName = cx(existingClassName, className);
      if (!mergedClassName) return icon;
      return React.cloneElement(icon, { className: mergedClassName });
    }
    if (!className) return icon;
    return React.createElement("span", { className }, icon);
  };
};

export const normalizePaginationIcons = (
  overrides?: GridPaginationIcons
): Partial<GridIconSet> => {
  if (!overrides) return {};
  const normalized: Partial<GridIconSet> = {};
  if (overrides.paginationFirst) {
    normalized.paginationFirst = normalizeIcon(overrides.paginationFirst);
  }
  if (overrides.paginationPrev) {
    normalized.paginationPrev = normalizeIcon(overrides.paginationPrev);
  }
  if (overrides.paginationNext) {
    normalized.paginationNext = normalizeIcon(overrides.paginationNext);
  }
  if (overrides.paginationLast) {
    normalized.paginationLast = normalizeIcon(overrides.paginationLast);
  }
  return normalized;
};

export const stripUndefined = (value: unknown): unknown => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const cleaned: Record<string, unknown> = {};
    entries.forEach(([key, entryValue]) => {
      if (entryValue === undefined) return;
      const next = stripUndefined(entryValue);
      if (next !== undefined) cleaned[key] = next;
    });
    return cleaned;
  }
  return value;
};

export const mergeChartOptions = (
  base: GridChartOptions,
  overrides?: GridChartOptions
): GridChartOptions => {
  if (!overrides) return base;
  const cleanedOverrides = stripUndefined(overrides) as GridChartOptions;
  return {
    ...base,
    ...cleanedOverrides,
    axis: {
      ...base.axis,
      ...cleanedOverrides.axis,
      x: { ...base.axis?.x, ...cleanedOverrides.axis?.x },
      y: { ...base.axis?.y, ...cleanedOverrides.axis?.y },
    },
    legend: { ...base.legend, ...cleanedOverrides.legend },
    tooltip: { ...base.tooltip, ...cleanedOverrides.tooltip },
    series: { ...base.series, ...cleanedOverrides.series },
    pie: { ...base.pie, ...cleanedOverrides.pie },
    histogram: { ...base.histogram, ...cleanedOverrides.histogram },
    heatmap: { ...base.heatmap, ...cleanedOverrides.heatmap },
    boxPlot: { ...base.boxPlot, ...cleanedOverrides.boxPlot },
    violin: { ...base.violin, ...cleanedOverrides.violin },
    waterfall: { ...base.waterfall, ...cleanedOverrides.waterfall },
    bullet: { ...base.bullet, ...cleanedOverrides.bullet },
    candlestick: {
      ...base.candlestick,
      ...cleanedOverrides.candlestick,
    },
  };
};

export const colBox = (w: number, h: number): React.CSSProperties => ({
  width: w,
  minWidth: w,
  maxWidth: w,
  height: h,
  flexShrink: 0,
  boxSizing: "border-box",
});

export const SPECIAL_COL_WIDTH: Record<string, number> = {
  [GRID_SYSTEM_COLUMN_KEYS.rowOrdering]: 36,
  [GRID_SYSTEM_COLUMN_KEYS.rowSelection]: 36,
  [GRID_SYSTEM_COLUMN_KEYS.rowPinning]: 44,
  [GRID_SYSTEM_COLUMN_KEYS.rowDetail]: 28,
  [GRID_SYSTEM_COLUMN_KEYS.rowIndex]: 52,
};

export const safeRect = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  if (
    !node ||
    !node.isConnected ||
    typeof node.getBoundingClientRect !== "function"
  ) {
    return null;
  }
  try {
    return node.getBoundingClientRect();
  } catch {
    return null;
  }
};

export const normalizeMergedCells = (cells: GridMergedCell[]): GridMergedCell[] => {
  if (!cells?.length) return [];
  return cells
    .map((cell) => {
      const startRow = Math.min(cell.startRow, cell.endRow);
      const endRow = Math.max(cell.startRow, cell.endRow);
      const startCol = Math.min(cell.startCol, cell.endCol);
      const endCol = Math.max(cell.startCol, cell.endCol);
      if (
        startRow === cell.startRow &&
        endRow === cell.endRow &&
        startCol === cell.startCol &&
        endCol === cell.endCol
      ) {
        return cell;
      }
      return {
        ...cell,
        startRow,
        endRow,
        startCol,
        endCol,
      };
    })
    .sort((a, b) => {
      if (a.startRow !== b.startRow) return a.startRow - b.startRow;
      if (a.startCol !== b.startCol) return a.startCol - b.startCol;
      if (a.endRow !== b.endRow) return a.endRow - b.endRow;
      return a.endCol - b.endCol;
    });
};

const arrayIdentity = new WeakMap<object, number>();
let arrayIdentityCounter = 0;
export const getArrayIdentity = (value: object | null | undefined) => {
  if (!value) return 0;
  const existing = arrayIdentity.get(value);
  if (existing != null) return existing;
  arrayIdentityCounter += 1;
  arrayIdentity.set(value, arrayIdentityCounter);
  return arrayIdentityCounter;
};

export const selectionCacheKey = (selection?: GridSelection | null) =>
  selection
    ? `${selection.startRow}:${selection.endRow}:${selection.startCol}:${selection.endCol}`
    : "none";

export const samplingCacheKey = (sampling?: GridChartSettings["sampling"]) => {
  if (!sampling || sampling.mode === "none") return "none";
  return [
    sampling.mode,
    sampling.size ?? "",
    sampling.seed ?? "",
    sampling.columnKey ?? "",
  ].join(":");
};

export const EMPTY_ROWS: GridRow[] = [];
export const EMPTY_COLUMNS: GridColumn[] = [];
export const EMPTY_MERGED_CELLS: GridMergedCell[] = [];
export const EMPTY_FILTERS: never[] = [];
export const EMPTY_PINNED_ROWS: {
  top: (string | number)[];
  bottom: (string | number)[];
} = {
  top: [],
  bottom: [],
};
export const EMPTY_ROW_INDEX_MAP = new Map<number, number>();
export const EMPTY_STRING_ARRAY: string[] = [];

export const stringArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const flattenLeafColumns = (defs: GridColumnDef[]): GridColumn[] => {
  const leaves: GridColumn[] = [];
  const visit = (items: GridColumnDef[]) => {
    items.forEach((item) => {
      if (!item) return;
      if ("children" in item && Array.isArray(item.children)) {
        visit(item.children);
        return;
      }
      leaves.push(item as GridColumn);
    });
  };
  visit(defs);
  return leaves;
};
