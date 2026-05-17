import type { FilterBlock, GridFilterConfig } from "../../types";

type FilterSanitizeOptions = {
  allowAdvanced?: boolean;
};

const cloneBlock = (block: FilterBlock): FilterBlock =>
  block.kind === "condition"
    ? {
        kind: "condition",
        join: block.join,
        conditions: block.conditions.map((condition) => ({
          operator: condition.operator,
          value: condition.value,
        })),
      }
    : {
        kind: "set",
        set: {
          values: Array.isArray(block.set.values)
            ? [...block.set.values]
            : [],
          includeBlanks: block.set.includeBlanks,
        },
      };

const toBasicFilterFromBlock = (
  filter: GridFilterConfig,
  block: FilterBlock,
): GridFilterConfig =>
  block.kind === "condition"
    ? {
        columnKey: filter.columnKey,
        type: filter.type,
        mode: "condition",
        conditions: block.conditions.map((condition) => ({
          operator: condition.operator,
          value: condition.value,
        })),
        join: block.join ?? "and",
      }
    : {
        columnKey: filter.columnKey,
        type: filter.type,
        mode: "set",
        set: {
          values: Array.isArray(block.set.values) ? [...block.set.values] : [],
          includeBlanks: block.set.includeBlanks,
        },
      };

export const sanitizeFilterConfig = (
  filter: GridFilterConfig | null | undefined,
  options?: FilterSanitizeOptions,
): GridFilterConfig | null => {
  if (!filter?.columnKey || !filter.type) return null;

  const allowAdvanced = options?.allowAdvanced ?? true;
  const blocks = Array.isArray(filter.blocks)
    ? filter.blocks.map(cloneBlock)
    : undefined;

  if (!allowAdvanced && blocks?.length) {
    return toBasicFilterFromBlock(filter, blocks[0]!);
  }

  if (!allowAdvanced) {
    const downgraded: GridFilterConfig = {
      ...filter,
      mode:
        filter.mode === "advanced"
          ? filter.set
            ? "set"
            : "condition"
          : filter.mode,
    };
    delete downgraded.blocks;
    delete downgraded.blockJoin;
    return downgraded;
  }

  return {
    ...filter,
    conditions: Array.isArray(filter.conditions)
      ? filter.conditions.map((condition) => ({
          operator: condition.operator,
          value: condition.value,
        }))
      : filter.conditions,
    set: filter.set
      ? {
          values: Array.isArray(filter.set.values)
            ? [...filter.set.values]
            : [],
          includeBlanks: filter.set.includeBlanks,
        }
      : filter.set,
    blocks,
  };
};

export const sanitizeFilterConfigs = (
  filters: GridFilterConfig[] | null | undefined,
  options?: FilterSanitizeOptions,
): GridFilterConfig[] => {
  if (!Array.isArray(filters) || filters.length === 0) return [];
  const sanitizedByColumn = new Map<string, GridFilterConfig>();
  filters.forEach((filter) => {
    const sanitized = sanitizeFilterConfig(filter, options);
    if (!sanitized) return;
    sanitizedByColumn.set(sanitized.columnKey, sanitized);
  });
  return Array.from(sanitizedByColumn.values());
};
