import {
  GridRow,
  GridColumn,
  GridFilterConfig,
  FilterCondition,
  FilterOperator,
  FilterBlock,
  FilterJoin,
} from "../../../types";
import { parseFormattedNumber } from "../../cell-format";

/* =========================================
   Row Filtering
   ========================================= */

type PreparedSingleFilter = {
  operator: FilterOperator | null;
  normalizedFilterValue: string;
  filterValueIsBlank: boolean;
  numericFilterValue: number;
  betweenStart: number | null;
  betweenEnd: number | null;
  inValues: Set<string> | null;
};

type PreparedConditionGroup = {
  join: FilterJoin;
  conditions: PreparedSingleFilter[];
};

type PreparedSetConfig = {
  includeBlanks: boolean;
  normalizedValues: Set<string>;
};

type PreparedFilterBlock =
  | {
      kind: "set";
      set: PreparedSetConfig;
    }
  | {
      kind: "condition";
      join: FilterJoin;
      group: PreparedConditionGroup;
    };

type PreparedFilterMatcher = (value: any) => boolean;

export class RowFilter {
  private static uniqueValuesCache = new WeakMap<
    GridRow[],
    Map<number, Map<string, { values: any[]; hasBlanks: boolean }>>
  >();

  /**
   * Returns the subset of rows that satisfy all filters.
   */
  static run(
    rows: GridRow[],
    filters: GridFilterConfig[],
    _columns: GridColumn[]
  ): GridRow[] {
    if (!filters.length) return rows;

    const prepared = filters.map((filter) => ({
      columnKey: filter.columnKey,
      matcher: RowFilter.compileFilterMatcher(filter),
    }));

    const matchedRows: GridRow[] = [];
    outer: for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      for (let j = 0; j < prepared.length; j += 1) {
        const entry = prepared[j];
        if (!entry.matcher(row.data[entry.columnKey]?.value)) {
          continue outer;
        }
      }
      matchedRows.push(row);
    }

    return matchedRows;
  }

  /**
   * Returns distinct, non-empty values for a column (sorted ascending).
   */
  static uniqueValues(
    rows: GridRow[],
    columnKey: string
  ): { values: any[]; hasBlanks: boolean } {
    const unique = new Map<string, any>();
    let hasBlanks = false;
    for (const row of rows) {
      const value = row.data[columnKey]?.value;
      if (RowFilter.isBlankValue(value)) {
        hasBlanks = true;
        continue;
      }
      const key = RowFilter.normalizeValue(value);
      if (!unique.has(key)) unique.set(key, value);
    }
    const values = Array.from(unique.values()).sort((a, b) =>
      RowFilter.compareStrings(a, b)
    );
    return { values, hasBlanks };
  }

  /**
   * Cached distinct values by (rows reference, rows revision, column key).
   */
  static uniqueValuesCached(
    rows: GridRow[],
    columnKey: string,
    rowsRevision: number = 0
  ): { values: any[]; hasBlanks: boolean } {
    let revisions = RowFilter.uniqueValuesCache.get(rows);
    if (!revisions) {
      revisions = new Map();
      RowFilter.uniqueValuesCache.set(rows, revisions);
    }

    let byColumn = revisions.get(rowsRevision);
    if (!byColumn) {
      byColumn = new Map();
      revisions.set(rowsRevision, byColumn);
      // Keep only the most recent revisions per rows reference to avoid cache growth.
      while (revisions.size > 8) {
        const oldestRevision = revisions.keys().next().value;
        if (oldestRevision === undefined || oldestRevision === rowsRevision) {
          break;
        }
        revisions.delete(oldestRevision);
      }
    }

    const cached = byColumn.get(columnKey);
    if (cached) return cached;

    const computed = RowFilter.uniqueValues(rows, columnKey);
    byColumn.set(columnKey, computed);
    return computed;
  }

  // ---------- internals ----------

  static matchesSingleFilter(value: any, filter: GridFilterConfig): boolean {
    const operator = filter.operator;
    if (!operator) return true;

    if (operator === "isBlank") return RowFilter.isBlankValue(value);
    if (operator === "isNotBlank") return !RowFilter.isBlankValue(value);

    // Nullish cell values only match nullish/empty filter values
    if (value === null || value === undefined) {
      return (
        filter.value === "" ||
        filter.value === null ||
        filter.value === undefined
      );
    }

    const cellAsString = RowFilter.normalizeValue(value);
    const filterAsString = RowFilter.normalizeValue(filter.value);

    switch (operator) {
      case "equals":
        return cellAsString === filterAsString;

      case "contains":
        return cellAsString.includes(filterAsString);

      case "startsWith":
        return cellAsString.startsWith(filterAsString);

      case "endsWith":
        return cellAsString.endsWith(filterAsString);

      case "gt":
        return RowFilter.compareNumbers(value, filter.value) > 0;

      case "lt":
        return RowFilter.compareNumbers(value, filter.value) < 0;

      case "gte":
        return RowFilter.compareNumbers(value, filter.value) >= 0;

      case "lte":
        return RowFilter.compareNumbers(value, filter.value) <= 0;

      case "between": {
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const numeric = RowFilter.toNumber(value);
          const start = RowFilter.toNumberOrNull(filter.value[0]);
          const end = RowFilter.toNumberOrNull(filter.value[1]);
          if (start != null && numeric < start) return false;
          if (end != null && numeric > end) return false;
          return true;
        }
        return false;
      }

      case "in":
        if (Array.isArray(filter.value)) {
          return RowFilter.containsNormalized(
            filter.value,
            cellAsString
          );
        }
        return false;

      default:
        // Fallback to "contains" for text
        return cellAsString.includes(filterAsString);
    }
  }

  private static compareNumbers(a: any, b: any): number {
    return RowFilter.toNumber(a) - RowFilter.toNumber(b);
  }

  private static toNumber(value: any): number {
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    const formatted = parseFormattedNumber(value);
    if (formatted != null) return formatted;
    const parsed = parseFloat(String(value));
    if (!Number.isNaN(parsed)) return parsed;
    const maybeDate = Date.parse(String(value));
    return Number.isNaN(maybeDate) ? 0 : maybeDate;
  }

  private static toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = RowFilter.toNumber(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private static normalizeValue(value: any): string {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value.trim().toLowerCase();
    return String(value);
  }

  private static compareStrings(a: any, b: any): number {
    return RowFilter.normalizeValue(a).localeCompare(
      RowFilter.normalizeValue(b),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  }

  private static isBlankValue(value: any): boolean {
    return value === null || value === undefined || value === "";
  }

  static matchesFilter(value: any, filter: GridFilterConfig): boolean {
    return RowFilter.compileFilterMatcher(filter)(value);
  }

  private static compileFilterMatcher(filter: GridFilterConfig): PreparedFilterMatcher {
    if (filter.blocks && filter.blocks.length) {
      const activeBlocks = filter.blocks.filter(RowFilter.isBlockActive);
      if (!activeBlocks.length) return () => true;
      const join = filter.blockJoin ?? "and";
      const preparedBlocks: PreparedFilterBlock[] = activeBlocks.map((block) => {
        if (block.kind === "set") {
          return {
            kind: "set",
            set: RowFilter.compileSetConfig(block.set),
          };
        }
        return {
          kind: "condition",
          join: block.join ?? "and",
          group: RowFilter.compileConditionGroup(
            block.conditions,
            block.join ?? "and"
          ),
        };
      });

      return (value: any) => {
        if (join === "or") {
          for (let i = 0; i < preparedBlocks.length; i += 1) {
            const block = preparedBlocks[i];
            const matches =
              block.kind === "set"
                ? RowFilter.matchesPreparedSet(value, block.set)
                : RowFilter.matchesPreparedConditionGroup(value, block.group);
            if (matches) return true;
          }
          return false;
        }

        for (let i = 0; i < preparedBlocks.length; i += 1) {
          const block = preparedBlocks[i];
          const matches =
            block.kind === "set"
              ? RowFilter.matchesPreparedSet(value, block.set)
              : RowFilter.matchesPreparedConditionGroup(value, block.group);
          if (!matches) return false;
        }
        return true;
      };
    }

    if (filter.mode === "set" || filter.set) {
      const setValues =
        filter.set?.values ?? (Array.isArray(filter.value) ? filter.value : []);
      const includeBlanks = filter.set?.includeBlanks ?? false;
      const preparedSet = RowFilter.compileSetConfig({
        values: Array.isArray(setValues) ? setValues : [],
        includeBlanks,
      });
      return (value: any) => RowFilter.matchesPreparedSet(value, preparedSet);
    }

    if (filter.conditions && filter.conditions.length) {
      const preparedGroup = RowFilter.compileConditionGroup(
        filter.conditions,
        filter.join ?? "and"
      );
      return (value: any) =>
        RowFilter.matchesPreparedConditionGroup(value, preparedGroup);
    }

    const preparedSingle = RowFilter.compileSingleFilter({
      operator: filter.operator ?? null,
      value: filter.value,
    });
    return (value: any) => RowFilter.matchesPreparedSingleFilter(value, preparedSingle);
  }

  private static compileConditionGroup(
    conditions: FilterCondition[],
    join: FilterJoin
  ): PreparedConditionGroup {
    return {
      join,
      conditions: conditions.map((condition) =>
        RowFilter.compileSingleFilter({
          operator: condition.operator as FilterOperator,
          value: condition.value,
        })
      ),
    };
  }

  private static compileSingleFilter(input: {
    operator: FilterOperator | null;
    value: any;
  }): PreparedSingleFilter {
    const operator = input.operator;
    const filterValue = input.value;
    const betweenStart =
      operator === "between" &&
      Array.isArray(filterValue) &&
      filterValue.length === 2
        ? RowFilter.toNumberOrNull(filterValue[0])
        : null;
    const betweenEnd =
      operator === "between" &&
      Array.isArray(filterValue) &&
      filterValue.length === 2
        ? RowFilter.toNumberOrNull(filterValue[1])
        : null;

    return {
      operator,
      normalizedFilterValue: RowFilter.normalizeValue(filterValue),
      filterValueIsBlank:
        filterValue === "" || filterValue === null || filterValue === undefined,
      numericFilterValue: RowFilter.toNumber(filterValue),
      betweenStart,
      betweenEnd,
      inValues:
        operator === "in" && Array.isArray(filterValue)
          ? new Set(
              filterValue.map((candidate) =>
                RowFilter.normalizeValue(candidate)
              )
            )
          : null,
    };
  }

  private static matchesPreparedConditionGroup(
    value: any,
    group: PreparedConditionGroup
  ): boolean {
    if (!group.conditions.length) return true;
    if (group.join === "or") {
      for (let i = 0; i < group.conditions.length; i += 1) {
        if (RowFilter.matchesPreparedSingleFilter(value, group.conditions[i])) {
          return true;
        }
      }
      return false;
    }
    for (let i = 0; i < group.conditions.length; i += 1) {
      if (!RowFilter.matchesPreparedSingleFilter(value, group.conditions[i])) {
        return false;
      }
    }
    return true;
  }

  private static matchesPreparedSingleFilter(
    value: any,
    filter: PreparedSingleFilter
  ): boolean {
    const operator = filter.operator;
    if (!operator) return true;

    if (operator === "isBlank") return RowFilter.isBlankValue(value);
    if (operator === "isNotBlank") return !RowFilter.isBlankValue(value);

    if (value === null || value === undefined) {
      return filter.filterValueIsBlank;
    }

    const cellAsString = RowFilter.normalizeValue(value);

    switch (operator) {
      case "equals":
        return cellAsString === filter.normalizedFilterValue;
      case "contains":
        return cellAsString.includes(filter.normalizedFilterValue);
      case "startsWith":
        return cellAsString.startsWith(filter.normalizedFilterValue);
      case "endsWith":
        return cellAsString.endsWith(filter.normalizedFilterValue);
      case "gt":
        return RowFilter.toNumber(value) > filter.numericFilterValue;
      case "lt":
        return RowFilter.toNumber(value) < filter.numericFilterValue;
      case "gte":
        return RowFilter.toNumber(value) >= filter.numericFilterValue;
      case "lte":
        return RowFilter.toNumber(value) <= filter.numericFilterValue;
      case "between": {
        const numeric = RowFilter.toNumber(value);
        if (filter.betweenStart != null && numeric < filter.betweenStart) {
          return false;
        }
        if (filter.betweenEnd != null && numeric > filter.betweenEnd) {
          return false;
        }
        return filter.betweenStart != null || filter.betweenEnd != null;
      }
      case "in":
        return filter.inValues ? filter.inValues.has(cellAsString) : false;
      default:
        return cellAsString.includes(filter.normalizedFilterValue);
    }
  }

  private static compileSetConfig(setConfig: {
    values: any[];
    includeBlanks?: boolean;
  }): PreparedSetConfig {
    return {
      includeBlanks: setConfig.includeBlanks ?? false,
      normalizedValues: new Set(
        setConfig.values.map((value) => RowFilter.normalizeValue(value))
      ),
    };
  }

  private static matchesPreparedSet(
    value: any,
    setConfig: PreparedSetConfig
  ): boolean {
    if (RowFilter.isBlankValue(value)) return setConfig.includeBlanks;
    if (setConfig.normalizedValues.size === 0) return false;
    return setConfig.normalizedValues.has(RowFilter.normalizeValue(value));
  }

  private static containsNormalized(values: any[], normalizedTarget: string) {
    for (let i = 0; i < values.length; i += 1) {
      if (RowFilter.normalizeValue(values[i]) === normalizedTarget) {
        return true;
      }
    }
    return false;
  }

  private static isBlockActive(block: FilterBlock): boolean {
    if (block.kind === "set") {
      return Boolean(block.set.includeBlanks) || block.set.values.length > 0;
    }
    return block.conditions.length > 0;
  }
}
