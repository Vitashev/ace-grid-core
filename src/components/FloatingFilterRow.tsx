import React, { memo, useMemo, useEffect, useRef, useState } from "react";
import type {
  ColumnFilterType,
  GridFilterConfig,
  GridFloatingFilterCellRendererArgs,
  GridColumn,
  GridRow,
} from "../types";
import { RowFilter } from "../features/filtering";
import { resolveFilterValueChoices } from "../features/filtering/utils/filterValueChoices";
import { useGridTheme } from "../features/theming";
import { isSystemCol } from "../features/cell-selection";
import { OffsetCell } from "../features/virtual/components/OffsetCell";
import { cx } from "../utils/cx";

type FloatingFilterRowProps = {
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  virtualCenterCols: {
    visible: GridColumn[];
    start: number;
    end: number;
    before: number;
    after: number;
  };
  rowHeight: number;
  colWidthOf: (key: string) => number;
  activeFilters: GridFilterConfig[];
  onFilter?: (columnKey: string, filter: GridFilterConfig | null) => void;
  rows: GridRow[];
  rowsRevision?: number;
  floatingFilterDebounceMs?: number;
  ariaRowIndex?: number;
  visualColumnIndex?: Map<string, number>;
  renderFloatingFilterCell?: (
    args: GridFloatingFilterCellRendererArgs
  ) => React.ReactNode;
};

const BLANKS_TOKEN = "__blanks__";
const EMPTY_UNIQUE_VALUES: never[] = [];
const EMPTY_ROWS: GridRow[] = [];

const normalizeValue = (value: any) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim().toLowerCase();
  return String(value);
};

const resolveFilterType = (column: GridColumn): ColumnFilterType =>
  column.filterType ??
  (column.type === "number" || column.type === "date"
    ? column.type
    : column.type === "select" || column.type === "boolean"
    ? "select"
    : "text");

const toInputType = (column: GridColumn) => {
  switch (column.type) {
    case "number":
      return "number";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    case "time":
      return "time";
    default:
      return "text";
  }
};

const formatDateInputValue = (value: any, type?: GridColumn["type"]) => {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  if (type === "date") return date.toISOString().slice(0, 10);
  if (type === "time") return date.toISOString().slice(11, 16);
  if (type === "datetime") return date.toISOString().slice(0, 16);
  return date.toISOString();
};

const resolveFilterValue = (
  filter: GridFilterConfig | undefined,
  column: GridColumn
) => {
  if (!filter) return "";
  if (filter.operator === "isBlank") return BLANKS_TOKEN;

  const formatValue = (value: any) => {
    if (column.type === "date" || column.type === "datetime" || column.type === "time") {
      return formatDateInputValue(value, column.type);
    }
    if (column.type === "select") {
      return normalizeValue(value);
    }
    return String(value ?? "");
  };

  const conditions = filter.conditions ?? [];
  if (conditions.length) {
    const [first] = conditions;
    if (first?.operator === "isBlank") return BLANKS_TOKEN;
    if (first?.value == null) return "";
    return formatValue(first.value);
  }

  if (filter.operator && filter.value != null) {
    return formatValue(filter.value);
  }

  if (filter.operator === "in" && Array.isArray(filter.value)) {
    if (filter.value.length === 1) {
      return formatValue(filter.value[0]);
    }
  }

  if (filter.set?.values?.length === 1 && !filter.set.includeBlanks) {
    return formatValue(filter.set.values[0]);
  }
  if (filter.set?.values?.length === 0 && filter.set.includeBlanks) {
    return BLANKS_TOKEN;
  }

  return "";
};

const FloatingFilterCell: React.FC<{
  column: GridColumn;
  width: number;
  height: number;
  isPinned: boolean;
  isSystemBoundary?: boolean;
  filter?: GridFilterConfig;
  onFilter?: (columnKey: string, filter: GridFilterConfig | null) => void;
  rows: GridRow[];
  rowsRevision?: number;
  debounceMs?: number;
  ariaRowIndex?: number;
  ariaColIndex?: number;
}> = memo(({
  column,
  width,
  height,
  isPinned,
  isSystemBoundary = false,
  filter,
  onFilter,
  rows,
  rowsRevision = 0,
  debounceMs,
  ariaRowIndex,
  ariaColIndex,
}) => {
  const { tokens } = useGridTheme();
  const isSystemColumn = isSystemCol(column.key);
  const canFilter = Boolean(onFilter) && column.filterable && !isSystemColumn;
  const needsValueSet = canFilter && column.type === "select";
  const valueSetRows = needsValueSet ? rows : EMPTY_ROWS;
  const { values: loadedUniqueValues, hasBlanks: loadedHasBlanks } = useMemo(
    () =>
      needsValueSet
        ? RowFilter.uniqueValuesCached(valueSetRows, column.key, rowsRevision)
        : { values: EMPTY_UNIQUE_VALUES, hasBlanks: false },
    [needsValueSet, valueSetRows, column.key, rowsRevision]
  );
  const { choices, hasBlanks } = useMemo(
    () =>
      resolveFilterValueChoices(column, loadedUniqueValues, loadedHasBlanks),
    [column, loadedHasBlanks, loadedUniqueValues]
  );
  const valueKeyMap = useMemo(() => {
    const map = new Map<string, any>();
    choices.forEach((choice) => {
      if (!map.has(choice.key)) map.set(choice.key, choice.value);
    });
    return map;
  }, [choices]);

  const derivedValue = useMemo(
    () => (canFilter ? resolveFilterValue(filter, column) : ""),
    [canFilter, filter, column]
  );
  const [inputValue, setInputValue] = useState<string>(derivedValue);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setInputValue(derivedValue);
  }, [derivedValue]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const applyValue = (next: string) => {
    if (!onFilter) return;
    const resolvedType = resolveFilterType(column);

    if (!next) {
      onFilter(column.key, null);
      return;
    }

    if (next === BLANKS_TOKEN) {
      onFilter(column.key, {
        columnKey: column.key,
        type: resolvedType,
        operator: "isBlank",
        value: "",
      });
      return;
    }

    if (column.type === "boolean") {
      onFilter(column.key, {
        columnKey: column.key,
        type: resolvedType,
        operator: "equals",
        value: next === "true",
      });
      return;
    }

    if (column.type === "select") {
      const resolved = valueKeyMap.get(normalizeValue(next)) ?? next;
      onFilter(column.key, {
        columnKey: column.key,
        type: resolvedType,
        operator: "equals",
        value: resolved,
      });
      return;
    }

    onFilter(column.key, {
      columnKey: column.key,
      type: resolvedType,
      operator:
        column.type === "number" ||
        column.type === "date" ||
        column.type === "datetime" ||
        column.type === "time"
          ? "equals"
          : "contains",
      value: next,
    });
  };

  const scheduleApply = (next: string) => {
    setInputValue(next);
    if (!onFilter) return;
    if (debounceMs && debounceMs > 0) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => applyValue(next), debounceMs);
    } else {
      applyValue(next);
    }
  };

  const cellStyle: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    height,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    backgroundColor: isPinned
      ? tokens.headerBackgroundPinned
      : tokens.headerBackground,
  };

  const disabledClassName = cx(
    "ace-grid__floating-filter-cell",
    "ace-grid__floating-filter-cell--disabled",
    isSystemColumn && "ace-grid__floating-filter-cell--system",
    isSystemColumn &&
      isSystemBoundary &&
      "ace-grid__floating-filter-cell--system-boundary"
  );
  const selectClassName = cx(
    "ace-grid__floating-filter-cell",
    "ace-grid__floating-filter-cell--select",
    isSystemColumn && "ace-grid__floating-filter-cell--system",
    isSystemColumn &&
      isSystemBoundary &&
      "ace-grid__floating-filter-cell--system-boundary"
  );
  const textClassName = cx(
    "ace-grid__floating-filter-cell",
    "ace-grid__floating-filter-cell--text",
    isSystemColumn && "ace-grid__floating-filter-cell--system",
    isSystemColumn &&
      isSystemBoundary &&
      "ace-grid__floating-filter-cell--system-boundary"
  );

  if (!canFilter) {
    return (
      <div
        className={disabledClassName}
        style={cellStyle}
        role="gridcell"
        aria-rowindex={ariaRowIndex}
        aria-colindex={ariaColIndex}
      />
    );
  }

  const sharedInputStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  };

  if (column.type === "boolean") {
    return (
      <div
        className={selectClassName}
        style={cellStyle}
        role="gridcell"
        aria-rowindex={ariaRowIndex}
        aria-colindex={ariaColIndex}
      >
        <select
          className="ace-grid__floating-filter-input ace-grid__floating-filter-select"
          value={inputValue}
          onChange={(e) => scheduleApply(e.target.value)}
          style={sharedInputStyle}
          aria-label={`Filter ${column.title}`}
        >
          <option value="">Any</option>
          <option value="true">TRUE</option>
          <option value="false">FALSE</option>
          {hasBlanks && <option value={BLANKS_TOKEN}>(Blanks)</option>}
        </select>
      </div>
    );
  }

  if (column.type === "select") {
    return (
      <div
        className={selectClassName}
        style={cellStyle}
        role="gridcell"
        aria-rowindex={ariaRowIndex}
        aria-colindex={ariaColIndex}
      >
        <select
          className="ace-grid__floating-filter-input ace-grid__floating-filter-select"
          value={inputValue}
          onChange={(e) => scheduleApply(e.target.value)}
          style={sharedInputStyle}
          aria-label={`Filter ${column.title}`}
        >
          <option value="">Any</option>
          {hasBlanks && <option value={BLANKS_TOKEN}>(Blanks)</option>}
          {choices.map((choice, idx) => {
            return (
              <option key={`${choice.key}-${idx}`} value={choice.key}>
                {choice.label}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <div
      className={textClassName}
      style={cellStyle}
      role="gridcell"
      aria-rowindex={ariaRowIndex}
      aria-colindex={ariaColIndex}
    >
      <input
        className="ace-grid__floating-filter-input ace-grid__floating-filter-text"
        type={toInputType(column)}
        value={inputValue}
        onChange={(e) => scheduleApply(e.target.value)}
        placeholder="Filter..."
        style={sharedInputStyle}
        aria-label={`Filter ${column.title}`}
      />
    </div>
  );
});

export const FloatingFilterRow: React.FC<FloatingFilterRowProps> = memo(
  ({
    pinnedLeftColumns,
    pinnedRightColumns,
    centerColumns,
    virtualCenterCols,
    rowHeight,
    colWidthOf,
    activeFilters,
    onFilter,
    rows,
    rowsRevision = 0,
    floatingFilterDebounceMs,
    ariaRowIndex,
    visualColumnIndex,
    renderFloatingFilterCell,
  }) => {
    const { tokens } = useGridTheme();
    const systemBoundaryColumnKey = useMemo(() => {
      for (let i = pinnedLeftColumns.length - 1; i >= 0; i -= 1) {
        const key = pinnedLeftColumns[i]?.key;
        if (key && isSystemCol(key)) return key;
      }
      return null;
    }, [pinnedLeftColumns]);

    const renderCell = (
      column: GridColumn,
      kind: "left" | "center" | "right"
    ) => {
      const isPinned = kind !== "center";
      const width = colWidthOf(column.key);
      const filter = activeFilters.find((f) => f.columnKey === column.key);
      const renderDefault = () => (
        <FloatingFilterCell
          column={column}
          width={width}
          height={rowHeight}
          isPinned={isPinned}
          isSystemBoundary={
            kind === "left" && column.key === systemBoundaryColumnKey
          }
          filter={filter}
          onFilter={onFilter}
          rows={rows}
          rowsRevision={rowsRevision}
          debounceMs={floatingFilterDebounceMs}
          ariaRowIndex={ariaRowIndex}
          ariaColIndex={(visualColumnIndex?.get(column.key) ?? 0) + 1}
        />
      );
      const args: GridFloatingFilterCellRendererArgs = {
        column,
        width,
        height: rowHeight,
        isPinned,
        filter,
        onFilter,
        rows,
        rowsRevision,
        debounceMs: floatingFilterDebounceMs,
        renderDefault,
      };
      const rendered = renderFloatingFilterCell
        ? renderFloatingFilterCell(args)
        : renderDefault();
      return <React.Fragment key={column.key}>{rendered}</React.Fragment>;
    };

    const renderSegment = (
      segmentColumns: GridColumn[],
      kind: "left" | "center" | "right"
    ) => {
      if (!segmentColumns.length) return null;
      const templateColumns = segmentColumns
        .map((col) => `${colWidthOf(col.key)}px`)
        .join(" ");
      const containerStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: templateColumns || "auto",
        gridTemplateRows: `repeat(1, ${rowHeight}px)`,
        alignItems: "stretch",
        flexShrink: 0,
      };

      if (kind === "left") {
        containerStyle.position = "sticky";
        containerStyle.left = 0;
        containerStyle.zIndex = 510;
      } else if (kind === "right") {
        containerStyle.position = "sticky";
        containerStyle.right = 0;
        containerStyle.zIndex = 510;
      }

      return (
        <div
          className={cx(
            "ace-grid__floating-filter-segment",
            `ace-grid__floating-filter-segment--${kind}`
          )}
          role="presentation"
          style={containerStyle}
        >
          {segmentColumns.map((col) => renderCell(col, kind))}
        </div>
      );
    };

    const leftContent = renderSegment(pinnedLeftColumns, "left");
    const centerContent = renderSegment(virtualCenterCols.visible, "center");
    const rightContent = renderSegment(pinnedRightColumns, "right");
    const hiddenBeforeColumns = useMemo(
      () => centerColumns.slice(0, Math.max(0, virtualCenterCols.start)),
      [centerColumns, virtualCenterCols.start]
    );
    const hiddenAfterColumns = useMemo(
      () =>
        centerColumns.slice(
          Math.min(centerColumns.length, virtualCenterCols.end + 1)
        ),
      [centerColumns, virtualCenterCols.end]
    );
    const resolveOffsetTone = useMemo(
      () =>
        (columns: GridColumn[]): "default" | "system" => {
          if (!columns.length) return "default";
          let systemCount = 0;
          for (let i = 0; i < columns.length; i += 1) {
            if (isSystemCol(columns[i].key)) systemCount += 1;
          }
          return systemCount / columns.length >= 0.5 ? "system" : "default";
        },
      []
    );
    const beforeOffsetTone = useMemo(
      () => resolveOffsetTone(hiddenBeforeColumns),
      [hiddenBeforeColumns, resolveOffsetTone]
    );
    const afterOffsetTone = useMemo(
      () => resolveOffsetTone(hiddenAfterColumns),
      [hiddenAfterColumns, resolveOffsetTone]
    );
    const beforeColumnWidthHint = useMemo(() => {
      const referenceColumn =
        hiddenBeforeColumns[hiddenBeforeColumns.length - 1] ??
        centerColumns[Math.max(0, virtualCenterCols.start)] ??
        virtualCenterCols.visible[0] ??
        centerColumns[0];
      if (!referenceColumn) return 140;
      return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
    }, [
      centerColumns,
      hiddenBeforeColumns,
      virtualCenterCols.start,
      virtualCenterCols.visible,
      colWidthOf,
    ]);
    const afterColumnWidthHint = useMemo(() => {
      const referenceColumn =
        hiddenAfterColumns[0] ??
        centerColumns[Math.max(0, virtualCenterCols.end)] ??
        virtualCenterCols.visible[virtualCenterCols.visible.length - 1] ??
        centerColumns[centerColumns.length - 1];
      if (!referenceColumn) return 140;
      return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
    }, [
      centerColumns,
      colWidthOf,
      hiddenAfterColumns,
      virtualCenterCols.end,
      virtualCenterCols.visible,
    ]);
    const beforeOffsetEdgeShadow =
      pinnedLeftColumns.length > 0 ? tokens.pinnedEdgeShadowLeft : undefined;
    const afterOffsetEdgeShadow =
      pinnedRightColumns.length > 0 ? tokens.pinnedEdgeShadowRight : undefined;

    return (
      <div
        className="ace-grid__floating-filter-row"
        role="row"
        aria-rowindex={ariaRowIndex}
      >
        {leftContent}
        {virtualCenterCols.before > 0 && (
          <OffsetCell
            width={virtualCenterCols.before}
            height={rowHeight}
            rowHeightHint={rowHeight}
            columnWidthHint={beforeColumnWidthHint}
            variant="header"
            position="before"
            tone={beforeOffsetTone}
            edgeShadow={beforeOffsetEdgeShadow}
          />
        )}
        {centerContent}
        {virtualCenterCols.after > 0 && (
          <OffsetCell
            width={virtualCenterCols.after}
            height={rowHeight}
            rowHeightHint={rowHeight}
            columnWidthHint={afterColumnWidthHint}
            variant="header"
            position="after"
            tone={afterOffsetTone}
            edgeShadow={afterOffsetEdgeShadow}
          />
        )}
        {rightContent}
      </div>
    );
  }
);
