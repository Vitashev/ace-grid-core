import type { CellFormat, CellValueType, GridColumn } from "../../types";

const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const getNumberFormatter = (format?: string) => {
  const usePercent = Boolean(format?.includes("%"));
  const minimumFractionDigits = format?.includes(".") ? 2 : 0;
  const key = `${usePercent ? "percent" : "decimal"}:${minimumFractionDigits}`;
  const cached = numberFormatterCache.get(key);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat("en-US", {
    style: usePercent ? "percent" : "decimal",
    minimumFractionDigits,
  });
  numberFormatterCache.set(key, formatter);
  return formatter;
};

const normalizeNumericInput = (value: string): string =>
  value
    .replace(/[\u00A0\u202F\s]/g, "")
    .replace(/['’`]/g, "");

const trimBoundaryCurrencyCode = (value: string): string => {
  let next = value.trim();
  let previous = "";

  while (next !== previous) {
    previous = next;
    next = next.replace(/^[A-Za-z]{2,}(?=[\d+\-−(])/u, "").trim();
    next = next.replace(/(?<=[\d%)])[A-Za-z]{2,}$/u, "").trim();
  }

  return next;
};

const inferDecimalSeparator = (value: string): "." | "," | null => {
  const lastDot = value.lastIndexOf(".");
  const lastComma = value.lastIndexOf(",");

  if (lastDot >= 0 && lastComma >= 0) {
    return lastDot > lastComma ? "." : ",";
  }

  const separator = lastDot >= 0 ? "." : lastComma >= 0 ? "," : null;
  if (!separator) return null;

  const occurrences = value.split(separator).length - 1;
  const digitsAfter = value.length - value.lastIndexOf(separator) - 1;

  if (digitsAfter <= 0) return null;
  if (occurrences > 1) {
    return digitsAfter <= 2 || digitsAfter > 3 ? separator : null;
  }

  if (digitsAfter === 3) return null;
  return separator;
};

export const parseFormattedNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  let text = value.trim();
  if (!text) return null;

  let negative = false;
  if (/^\(.*\)$/u.test(text)) {
    negative = true;
    text = text.slice(1, -1).trim();
  }

  while (/^[+\-−]/u.test(text)) {
    if (text[0] === "-" || text[0] === "−") negative = !negative;
    text = text.slice(1).trim();
  }

  const isPercent = text.includes("%");
  text = trimBoundaryCurrencyCode(text);
  text = normalizeNumericInput(text)
    .replace(/%/g, "")
    .replace(/\p{Sc}/gu, "");

  if (!text || /[A-Za-z]/u.test(text) || !/[0-9]/.test(text)) {
    return null;
  }
  if (/[+\-−]/u.test(text)) {
    return null;
  }
  if (!/^[0-9.,]+$/u.test(text)) {
    return null;
  }

  const decimalSeparator = inferDecimalSeparator(text);
  let normalized = text;

  if (decimalSeparator) {
    const groupSeparator = decimalSeparator === "." ? "," : ".";
    normalized = normalized.split(groupSeparator).join("");
    const parts = normalized.split(decimalSeparator);
    if (parts.length > 2) {
      const decimalPart = parts.pop() ?? "";
      normalized = `${parts.join("")}.${decimalPart}`;
    } else if (decimalSeparator === ",") {
      normalized = normalized.replace(",", ".");
    }
  } else {
    normalized = normalized.replace(/[.,]/g, "");
  }

  if (normalized.startsWith(".")) {
    normalized = `0${normalized}`;
  }

  if (!/^\d+(\.\d+)?$/u.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;

  let nextValue = negative ? -Math.abs(parsed) : parsed;
  if (isPercent) nextValue /= 100;
  return nextValue;
};

export const coerceInputValue = (
  raw: string,
  type: CellValueType,
  column?: GridColumn,
): any => {
  if (column?.parser) {
    try {
      return column.parser(raw);
    } catch {
      return raw;
    }
  }

  if (raw === "") return "";

  switch (type) {
    case "number": {
      const parsed = parseFormattedNumber(raw);
      return parsed ?? raw;
    }
    case "boolean": {
      const lower = raw.trim().toLowerCase();
      if (
        lower === "true" ||
        lower === "1" ||
        lower === "yes" ||
        lower === "y" ||
        lower === "on"
      ) {
        return true;
      }
      if (
        lower === "false" ||
        lower === "0" ||
        lower === "no" ||
        lower === "n" ||
        lower === "off"
      ) {
        return false;
      }
      return raw;
    }
    case "json":
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    case "date":
    case "datetime": {
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? raw : parsed;
    }
    case "time":
    case "text":
    case "radio":
    case "formula":
    default:
      return raw;
  }
};

const formatJsonCellPreview = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const count = value.length;
    return `[${count} item${count === 1 ? "" : "s"}]`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    try {
      const keyCount = Object.keys(value as Record<string, unknown>).length;
      return `{${keyCount} key${keyCount === 1 ? "" : "s"}}`;
    } catch {
      return "{...}";
    }
  }
  return String(value);
};

export const formatCellValue = (
  column: GridColumn,
  value: any,
  format?: CellFormat,
): string => {
  if (value === null || value === undefined) return "";

  if (column.formatter) {
    const formatted = column.formatter(value);
    return formatted == null ? "" : String(formatted);
  }

  switch (column.type) {
    case "number": {
      if (typeof value === "number") {
        if (!format?.numberFormat) return value.toString();
        return getNumberFormatter(format.numberFormat).format(value);
      }
      return String(value);
    }
    case "date": {
      if (value instanceof Date) return dateFormatter.format(value);
      if (typeof value === "string" && Date.parse(value))
        return dateFormatter.format(new Date(value));
      return String(value);
    }
    case "datetime": {
      if (value instanceof Date) return dateTimeFormatter.format(value);
      if (typeof value === "string" && Date.parse(value))
        return dateTimeFormatter.format(new Date(value));
      return String(value);
    }
    case "time": {
      if (value instanceof Date) return timeFormatter.format(value);
      return String(value);
    }
    case "boolean":
      return value ? "TRUE" : "FALSE";
    case "json":
      return formatJsonCellPreview(value);
    default:
      return String(value);
  }
};
