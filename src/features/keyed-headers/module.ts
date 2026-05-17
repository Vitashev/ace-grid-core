import { Fragment, createElement, type ReactNode } from "react";

import { isSystemCol } from "../cell-selection";
import type {
  GridColumn,
  GridKeyedHeadersProps,
  GridRow,
} from "../../types";
import type { GridKeyedHeadersModule } from "../../runtime/modules";

const columnIndexToLetters = (columnIndex: number): string => {
  let current = Math.max(1, Math.floor(columnIndex));
  let letters = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    current = Math.floor((current - 1) / 26);
  }
  return letters || "A";
};

type ColumnLabelArgs = {
  column: GridColumn;
  formulaColumnIndex: Map<string, number>;
  keyedHeaders: GridKeyedHeadersProps;
};

type RowLabelArgs = {
  row: GridRow;
  absoluteRowIndex: number;
  rowIndexToVisual: Map<number, number>;
  keyedHeaders: GridKeyedHeadersProps;
};

const isTextLabel = (value: ReactNode): value is string | number =>
  typeof value === "string" || typeof value === "number";

const annotateLabel = ({
  annotated,
  original,
  enabled,
}: {
  annotated: ReactNode;
  original: ReactNode;
  enabled?: boolean;
}): ReactNode => {
  if (!enabled) return annotated;
  if (annotated == null || annotated === "") return original;
  if (original == null || original === "") return annotated;

  if (isTextLabel(annotated) && isTextLabel(original)) {
    const annotatedText = String(annotated).trim();
    const originalText = String(original).trim();
    if (!annotatedText) return original;
    if (!originalText || annotatedText === originalText) return annotated;
    return `${annotatedText} : ${originalText}`;
  }

  return createElement(Fragment, null, annotated, " : ", original);
};

const getColumnLabel = ({
  column,
  formulaColumnIndex,
  keyedHeaders,
}: ColumnLabelArgs): ReactNode | undefined => {
  if (isSystemCol(column.key)) return undefined;
  if (keyedHeaders.enabled === false) return undefined;
  if (keyedHeaders.columns?.enabled === false) return undefined;
  const index = formulaColumnIndex.get(column.key);
  if (index == null) return undefined;
  const defaultLabel = columnIndexToLetters(index + 1);
  const annotatedLabel = keyedHeaders.columns?.label
    ? keyedHeaders.columns.label({ column, index, defaultLabel })
    : defaultLabel;
  return annotateLabel({
    annotated: annotatedLabel,
    original: column.title,
    enabled: keyedHeaders.columns?.annotate,
  });
};

const getRowLabel = ({
  row,
  absoluteRowIndex,
  rowIndexToVisual,
  keyedHeaders,
}: RowLabelArgs): ReactNode => {
  const visualIndex =
    rowIndexToVisual.get(absoluteRowIndex) ?? absoluteRowIndex;
  const defaultLabel = String(absoluteRowIndex + 1);
  const annotatedLabel = keyedHeaders.rows?.label
    ? keyedHeaders.rows.label({
        row,
        rowIndex: absoluteRowIndex,
        visualIndex,
        defaultLabel,
      })
    : defaultLabel;
  return annotateLabel({
    annotated: annotatedLabel,
    original: defaultLabel,
    enabled: keyedHeaders.rows?.annotate,
  });
};

export const gridKeyedHeadersModule: GridKeyedHeadersModule = {
  available: true,
  implementationMarker: "__ACE_GRID_CORE_KEYED_HEADERS__",
  getRowKeySystemColumnOptions: (rows) => ({
    enabled: true,
    width: rows?.width,
    title: typeof rows?.headerLabel === "string" ? rows.headerLabel : "",
  }),
  getColumnLabel,
  getRowLabel,
};
