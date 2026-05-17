import type { GridMultiSortModule } from "../../runtime/modules";
import type { GridSortConfig } from "../../types";

const normalizeSortModel = (model?: GridSortConfig[]): GridSortConfig[] => {
  if (!Array.isArray(model) || !model.length) return [];

  const normalized: GridSortConfig[] = [];
  const seen = new Set<string>();
  for (const entry of model) {
    if (!entry?.columnKey || !entry?.direction) continue;
    if (entry.direction !== "asc" && entry.direction !== "desc") continue;
    if (seen.has(entry.columnKey)) continue;
    seen.add(entry.columnKey);
    normalized.push({ columnKey: entry.columnKey, direction: entry.direction });
  }
  return normalized;
};

export const gridMultiSortModule: GridMultiSortModule = {
  available: true,
  implementationMarker: "__ACE_GRID_CORE_MULTI_SORT__",
  normalizeSortModel: (model, options) => {
    const normalized = normalizeSortModel(model);
    return options?.allowMultiSort === true
      ? normalized
      : normalized.slice(0, 1);
  },
};
