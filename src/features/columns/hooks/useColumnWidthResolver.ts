import { useCallback, useMemo } from "react";
import { GRID_SYSTEM_COLUMN_KEYS, GridColumn } from "../../../types";
import { SPECIAL_COL_WIDTH } from "../../../components/gridUtils";

const SYSTEM_COLUMN_KEYS = new Set<string>(
  Object.values(GRID_SYSTEM_COLUMN_KEYS)
);

export function resolveFillWidthColumnWidths(
  columnWidths: Record<string, number>,
  colByKey: Map<string, GridColumn>,
  columns: GridColumn[] | undefined,
  containerWidth: number | undefined,
  fillWidth: boolean | undefined,
) {
  if (!fillWidth || !containerWidth || !columns?.length) {
    return columnWidths;
  }

  const baseWidths = new Map<string, number>();
  const dataColumns = columns.filter(
    (column) => !SYSTEM_COLUMN_KEYS.has(column.key),
  );
  const allColumns = Array.from(colByKey.values());

  for (const column of allColumns) {
    baseWidths.set(
      column.key,
      resolveBaseColumnWidth(column.key, columnWidths, colByKey),
    );
  }

  const totalWidth = allColumns.reduce(
    (sum, column) => sum + (baseWidths.get(column.key) ?? 0),
    0,
  );
  let remaining = Math.floor(containerWidth - totalWidth);

  if (remaining <= 0 || dataColumns.length === 0) {
    return columnWidths;
  }

  const nextWidths = { ...columnWidths };
  let growableColumns = dataColumns.slice();

  while (remaining > 0 && growableColumns.length > 0) {
    const share = Math.max(1, Math.floor(remaining / growableColumns.length));
    const nextGrowableColumns: GridColumn[] = [];
    let consumed = 0;

    for (const column of growableColumns) {
      const key = column.key;
      const currentWidth =
        nextWidths[key] ??
        baseWidths.get(key) ??
        resolveBaseColumnWidth(key, columnWidths, colByKey);
      const maxWidth = column.maxWidth ?? Number.POSITIVE_INFINITY;
      const capacity = Math.max(0, maxWidth - currentWidth);

      if (capacity <= 0) {
        continue;
      }

      const growth = Math.min(share, capacity, remaining - consumed);
      nextWidths[key] = currentWidth + growth;
      consumed += growth;

      if (capacity > growth) {
        nextGrowableColumns.push(column);
      }

      if (consumed >= remaining) {
        break;
      }
    }

    if (consumed <= 0) {
      break;
    }

    remaining -= consumed;
    growableColumns = nextGrowableColumns;
  }

  return nextWidths;
}

export function useColumnWidthResolver(
  columnWidths: Record<string, number>,
  colByKey: Map<string, GridColumn>,
  options: {
    columns?: GridColumn[];
    containerWidth?: number;
    fillWidth?: boolean;
  } = {},
) {
  const resolvedColumnWidths = useMemo(
    () =>
      resolveFillWidthColumnWidths(
        columnWidths,
        colByKey,
        options.columns,
        options.containerWidth,
        options.fillWidth,
      ),
    [
      columnWidths,
      colByKey,
      options.columns,
      options.containerWidth,
      options.fillWidth,
    ],
  );

  return useCallback(
    (k: string, fallback = 120) => {
      if (SYSTEM_COLUMN_KEYS.has(k)) {
        const columnWidth = colByKey.get(k)?.width;
        return columnWidth ?? SPECIAL_COL_WIDTH[k] ?? fallback;
      }
      return (
        resolvedColumnWidths[k] ??
        resolveBaseColumnWidth(k, columnWidths, colByKey, fallback)
      );
    },
    [columnWidths, colByKey, resolvedColumnWidths]
  );
}

function resolveBaseColumnWidth(
  key: string,
  columnWidths: Record<string, number>,
  colByKey: Map<string, GridColumn>,
  fallback = 120,
) {
  const columnWidth = colByKey.get(key)?.width;
  const defaultWidth = SPECIAL_COL_WIDTH[key] ?? fallback;
  return columnWidths[key] ?? columnWidth ?? defaultWidth;
}
