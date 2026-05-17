import type { GridColumn } from "../../../types";

export type GridFilterValueChoice = {
  key: string;
  value: any;
  label: string;
};

function isBlankValue(value: any) {
  return value === null || value === undefined || value === "";
}

function normalizeValue(value: any) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim().toLowerCase();
  return String(value);
}

function toChoice(
  entry:
    | string
    | number
    | boolean
    | { value: string | number | boolean | null; label: string },
) {
  if (
    entry &&
    typeof entry === "object" &&
    "label" in entry &&
    "value" in entry
  ) {
    return {
      value: entry.value,
      label: entry.label,
    };
  }

  return {
    value: entry,
    label: String(entry),
  };
}

export function resolveFilterValueChoices(
  column: GridColumn,
  uniqueValues: any[],
  hasBlanksFromRows: boolean = false,
): {
  choices: GridFilterValueChoice[];
  values: any[];
  hasBlanks: boolean;
} {
  const source =
    column.filterValues && column.filterValues.length > 0
      ? column.filterValues
      : column.options && column.options.length > 0
        ? column.options
        : uniqueValues;

  const seen = new Set<string>();
  const choices: GridFilterValueChoice[] = [];
  let hasBlanks = hasBlanksFromRows;

  source.forEach((entry) => {
    const choice = toChoice(
      entry as
        | string
        | number
        | boolean
        | { value: string | number | boolean | null; label: string },
    );

    if (isBlankValue(choice.value)) {
      hasBlanks = true;
      return;
    }

    const key = normalizeValue(choice.value);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    choices.push({
      key,
      value: choice.value,
      label: choice.label,
    });
  });

  return {
    choices,
    values: choices.map((choice) => choice.value),
    hasBlanks,
  };
}
