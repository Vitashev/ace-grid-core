import type {
  CellValue,
  CellValueType,
  GridColumn,
  GridCsvExportOptions,
  GridCsvImportOptions,
  GridCsvImportResult,
  GridCsvImportSource,
  GridRow,
} from "../../types";
import { coerceInputValue, formatCellValue } from "../cell-format";

const CSV_MIME = "text/csv;charset=utf-8";
const JSON_LIKE = /^\s*[\[{]/;
const BOM = "\uFEFF";

const normalizeLookupValue = (value?: string) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const slugifyColumnKey = (value: string, fallbackIndex: number) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || `column_${fallbackIndex + 1}`;
};

const ensureUniqueKey = (
  preferred: string,
  usedKeys: Set<string>,
  fallbackIndex: number,
) => {
  let candidate = preferred || `column_${fallbackIndex + 1}`;
  let suffix = 2;
  while (usedKeys.has(candidate)) {
    candidate = `${preferred || `column_${fallbackIndex + 1}`}_${suffix}`;
    suffix += 1;
  }
  usedKeys.add(candidate);
  return candidate;
};

const blankCell = (): CellValue => ({ value: "", type: "text" });

const cloneCell = (cell?: CellValue | null): CellValue => ({
  value: cell?.value ?? "",
  formula: cell?.formula,
  type: cell?.type,
  format: cell?.format ? { ...cell.format } : undefined,
  sparkline: cell?.sparkline,
  colSpan: cell?.colSpan,
  rowSpan: cell?.rowSpan,
  merged: cell?.merged,
  mergeId: cell?.mergeId,
  spillOrigin: cell?.spillOrigin,
});

const isMeaningfulCell = (cell?: CellValue | null) => {
  if (!cell) return false;
  if (cell.formula) return true;
  if (cell.value == null) return false;
  if (typeof cell.value === "string") return cell.value.trim().length > 0;
  if (Array.isArray(cell.value)) return cell.value.length > 0;
  if (typeof cell.value === "object") return true;
  return true;
};

const trimCellMatrix = (matrix: CellValue[][]) => {
  let lastRow = matrix.length - 1;
  while (lastRow >= 0 && matrix[lastRow].every((cell) => !isMeaningfulCell(cell))) {
    lastRow -= 1;
  }
  if (lastRow < 0) return [] as CellValue[][];

  let lastCol = -1;
  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex += 1) {
    const row = matrix[rowIndex];
    for (let colIndex = row.length - 1; colIndex >= 0; colIndex -= 1) {
      if (isMeaningfulCell(row[colIndex])) {
        lastCol = Math.max(lastCol, colIndex);
        break;
      }
    }
  }

  if (lastCol < 0) return [] as CellValue[][];
  return matrix
    .slice(0, lastRow + 1)
    .map((row) =>
      Array.from({ length: lastCol + 1 }, (_, index) => row[index] ?? blankCell()),
    );
};

const detectDelimiter = (text: string, preferred?: string) => {
  if (preferred && preferred.length > 0) return preferred;
  const sampleLine = text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!sampleLine) return ",";

  const candidates = [",", ";", "\t", "|"];
  let bestDelimiter = ",";
  let bestScore = -1;

  candidates.forEach((candidate) => {
    let count = 0;
    let inQuotes = false;
    for (let index = 0; index < sampleLine.length; index += 1) {
      const char = sampleLine[index];
      if (char === "\"") {
        const next = sampleLine[index + 1];
        if (inQuotes && next === "\"") {
          index += 1;
          continue;
        }
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && char === candidate) count += 1;
    }
    if (count > bestScore) {
      bestDelimiter = candidate;
      bestScore = count;
    }
  });

  return bestDelimiter;
};

const parseDelimited = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === "\"") {
        const next = text[index + 1];
        if (next === "\"") {
          cell += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (char === "\r") {
      if (text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const escapeDelimitedCell = (value: string, delimiter: string) => {
  if (!value) return "";
  const pattern =
    delimiter === "\t" ? /[\t\n\r"]/ : new RegExp(`[${delimiter}\n\r"]`);
  if (!pattern.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
};

const serializeDelimited = (rows: string[][], delimiter: string) =>
  rows
    .map((row) =>
      row.map((value) => escapeDelimitedCell(value, delimiter)).join(delimiter),
    )
    .join("\r\n");

const decodeCsvSource = async (source: GridCsvImportSource) => {
  if (typeof source === "string") return source.replace(/^\uFEFF/, "");
  const buffer =
    source instanceof ArrayBuffer ? source : await source.arrayBuffer();
  return new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
};

const isDateValue = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

const resolveColumnCellType = (
  type?: GridColumn["type"],
): CellValueType | undefined => {
  switch (type) {
    case "number":
    case "date":
    case "datetime":
    case "time":
    case "boolean":
    case "json":
    case "radio":
      return type;
    default:
      return "text";
  }
};

const inferScalar = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return { value: "", type: "text" as const };

  if (/^(true|false)$/i.test(trimmed)) {
    return {
      value: trimmed.toLowerCase() === "true",
      type: "boolean" as const,
    };
  }

  const numeric = Number(trimmed);
  if (trimmed !== "" && Number.isFinite(numeric)) {
    return { value: numeric, type: "number" as const };
  }

  if (JSON_LIKE.test(trimmed)) {
    try {
      return { value: JSON.parse(trimmed), type: "json" as const };
    } catch {
      // fall back to text
    }
  }

  return { value: raw, type: "text" as const };
};

const coerceCellForColumn = (raw: string, column?: GridColumn): CellValue => {
  if (raw.trim().startsWith("=")) {
    return {
      value: raw,
      formula: raw,
      type: "formula",
    };
  }

  const inferred = inferScalar(raw);
  const next = cloneCell({
    value: inferred.value,
    type: inferred.type,
  });

  switch (column?.type) {
    case "number":
      if (typeof raw === "string" && raw.trim().length > 0) {
        next.value = coerceInputValue(raw, "number", column);
      }
      next.type = "number";
      return next;
    case "boolean": {
      next.value = coerceInputValue(raw, "boolean", column);
      next.type = "boolean";
      return next;
    }
    case "json":
      next.value = JSON_LIKE.test(raw) ? coerceInputValue(raw, "json", column) : raw;
      next.type = "json";
      return next;
    case "date":
    case "datetime":
    case "time":
      next.type = column.type;
      next.value = raw;
      return next;
    case "radio":
      next.type = "radio";
      next.value = raw;
      return next;
    default:
      next.type = next.type ?? resolveColumnCellType(column?.type) ?? "text";
      return next;
  }
};

const inferColumnType = (cells: CellValue[]): GridColumn["type"] => {
  const meaningful = cells.filter(isMeaningfulCell);
  if (!meaningful.length) return "text";
  const values = meaningful.map((cell) => cell.value).filter((value) => value !== "");
  if (!values.length) return "text";
  if (values.every((value) => typeof value === "boolean")) return "boolean";
  if (values.every((value) => typeof value === "number" && Number.isFinite(value))) {
    return "number";
  }
  if (values.every((value) => value != null && typeof value === "object")) {
    return "json";
  }
  return "text";
};

const saveTextFile = (text: string, filename: string) => {
  const blob = new Blob([text], { type: CSV_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportGridToCsv = ({
  columns,
  rows,
  options,
}: {
  columns: GridColumn[];
  rows: GridRow[];
  options?: GridCsvExportOptions;
}) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("CSV export is only available in a browser environment.");
  }

  const delimiter = options?.delimiter ?? ",";
  const includeHeaders = options?.includeHeaders ?? false;
  const useFormattedValues = options?.useFormattedValues ?? false;
  const includeBom = options?.bom ?? false;
  const filename = options?.filename?.trim() || "grid-data.csv";

  const matrix: string[][] = [];
  if (includeHeaders) {
    matrix.push(columns.map((column) => column.headerName || column.title || column.key));
  }

  rows.forEach((row) => {
    matrix.push(
      columns.map((column) => {
        const cell = row.data[column.key];
        if (!cell) return "";
        if (useFormattedValues) {
          return formatCellValue(column, cell.value, cell.format);
        }
        if (cell.formula) return cell.formula;
        if (cell.value == null) return "";
        if (isDateValue(cell.value)) return cell.value.toISOString();
        if (typeof cell.value === "object") {
          try {
            return JSON.stringify(cell.value);
          } catch {
            return String(cell.value);
          }
        }
        return String(cell.value);
      }),
    );
  });

  const text = `${includeBom ? BOM : ""}${serializeDelimited(matrix, delimiter)}`;
  saveTextFile(text, filename);
};

export interface ParsedCsvImport {
  rows: GridRow[];
  columns?: GridColumn[];
  meta: GridCsvImportResult;
}

export const importGridFromCsv = async ({
  source,
  columns,
  options,
}: {
  source: GridCsvImportSource;
  columns: GridColumn[];
  options?: GridCsvImportOptions;
}): Promise<ParsedCsvImport> => {
  const text = await decodeCsvSource(source);
  const delimiter = detectDelimiter(text, options?.delimiter);
  const rawMatrix = parseDelimited(text, delimiter);
  const cellMatrix = trimCellMatrix(
    rawMatrix.map((row) => row.map((value) => coerceCellForColumn(value))),
  );

  const headerRowEnabled = options?.headerRow ?? true;
  const headerOffset = headerRowEnabled && cellMatrix.length > 0 ? 1 : 0;
  const headerCells = headerOffset ? cellMatrix[0] : [];
  const dataMatrix = cellMatrix.slice(headerOffset);
  const sourceColumnCount = cellMatrix[0]?.length ?? 0;
  const headerLabels = Array.from({ length: sourceColumnCount }, (_, index) => {
    const headerCell = headerCells[index];
    const label = headerCell?.value == null ? "" : String(headerCell.value).trim();
    return label || `Column ${index + 1}`;
  });

  const updateColumns = options?.updateColumns ?? false;
  const nextColumns: GridColumn[] | undefined = updateColumns
    ? (() => {
        const usedKeys = new Set<string>();
        return headerLabels.map((label, index) => {
          const key = ensureUniqueKey(
            slugifyColumnKey(label, index),
            usedKeys,
            index,
          );
          const columnCells = dataMatrix.map((row) => row[index] ?? blankCell());
          return {
            key,
            title: label,
            type: inferColumnType(columnCells),
          };
        });
      })()
    : undefined;

  const targetColumns = nextColumns ?? columns;
  const sourceToTargetKey = new Map<number, string>();

  if (nextColumns) {
    nextColumns.forEach((column, index) => {
      sourceToTargetKey.set(index, column.key);
    });
  } else {
    const lookup = new Map<string, GridColumn>();
    columns.forEach((column) => {
      [column.key, column.title, column.headerName].forEach((candidate) => {
        const normalized = normalizeLookupValue(candidate);
        if (normalized && !lookup.has(normalized)) {
          lookup.set(normalized, column);
        }
      });
    });

    const usedKeys = new Set<string>();
    for (let sourceIndex = 0; sourceIndex < sourceColumnCount; sourceIndex += 1) {
      const byHeader = lookup.get(normalizeLookupValue(headerLabels[sourceIndex]));
      const byPosition = columns[sourceIndex];
      const targetColumn =
        (byHeader && !usedKeys.has(byHeader.key) ? byHeader : undefined) ??
        (byPosition && !usedKeys.has(byPosition.key) ? byPosition : undefined);
      if (!targetColumn) continue;
      usedKeys.add(targetColumn.key);
      sourceToTargetKey.set(sourceIndex, targetColumn.key);
    }
  }

  const emptyRowData = () =>
    targetColumns.reduce<Record<string, CellValue>>((acc, column) => {
      acc[column.key] = {
        value: "",
        type: resolveColumnCellType(column.type) ?? "text",
      };
      return acc;
    }, {});

  const rows = dataMatrix.map((sourceRow, rowIndex) => {
    const data = emptyRowData();
    for (let sourceIndex = 0; sourceIndex < sourceColumnCount; sourceIndex += 1) {
      const targetKey = sourceToTargetKey.get(sourceIndex);
      if (!targetKey) continue;
      const targetColumn = targetColumns.find((column) => column.key === targetKey);
      const rawCell = sourceRow[sourceIndex];
      data[targetKey] = rawCell?.formula
        ? cloneCell(rawCell)
        : coerceCellForColumn(String(rawCell?.value ?? ""), targetColumn);
    }
    return {
      id: `csv-${Date.now()}-${rowIndex}`,
      data,
    } satisfies GridRow;
  });

  return {
    rows,
    columns: nextColumns,
    meta: {
      rowCount: rows.length,
      columnCount: sourceToTargetKey.size,
      delimiter,
      updatedColumns: Boolean(nextColumns),
    },
  };
};
