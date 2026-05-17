import type { CSSProperties } from "react";
import type {
  GridColumn,
  GridRow,
  GridSearchMatch,
  GridSearchMode,
  GridSearchProps,
} from "../../types";
import { formatCellValue } from "../cell-format";

export type SearchMatcher = {
  query: string;
  regex: RegExp;
};

export type SearchMatchSegment = {
  text: string;
  match: boolean;
};

export type SearchActiveMatch = Pick<GridSearchMatch, "rowId" | "columnKey">;

export type ResolvedGridSearch = {
  enabled: boolean;
  query: string;
  mode: GridSearchMode;
  caseSensitive: boolean;
  wholeWord: boolean;
  highlight: boolean;
  highlightClassName: string;
  highlightStyle?: CSSProperties;
  activeHighlightClassName: string;
  activeHighlightStyle?: CSSProperties;
  activeMatch: SearchActiveMatch | null;
  columns?: string[];
  matcher: SearchMatcher | null;
};

export type { GridSearchMatch };

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createSearchMatcher = (
  query: string,
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
  }
): SearchMatcher | null => {
  const normalized = query.trim();
  if (!normalized) return null;
  const escaped = escapeRegExp(normalized);
  const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped;
  const flags = options.caseSensitive ? "g" : "gi";
  return {
    query: normalized,
    regex: new RegExp(pattern, flags),
  };
};

export const hasSearchMatch = (text: string, matcher: SearchMatcher) => {
  if (!text) return false;
  matcher.regex.lastIndex = 0;
  return matcher.regex.test(text);
};

export const splitSearchMatches = (
  text: string,
  matcher: SearchMatcher
): SearchMatchSegment[] | null => {
  if (!text) return null;
  const regex = matcher.regex;
  regex.lastIndex = 0;
  const segments: SearchMatchSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;

    if (start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, start),
        match: false,
      });
    }

    segments.push({
      text: text.slice(start, end),
      match: true,
    });

    lastIndex = end;

    if (regex.lastIndex === start) {
      regex.lastIndex = end;
    }
  }

  if (!segments.length) return null;

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      match: false,
    });
  }

  return segments;
};

export const isActiveSearchCell = (
  search: Pick<ResolvedGridSearch, "activeMatch">,
  rowId: string | number | null | undefined,
  columnKey: string
) =>
  rowId != null &&
  search.activeMatch?.rowId === rowId &&
  search.activeMatch.columnKey === columnKey;

export const getSearchHighlightMarkProps = (
  search: Pick<
    ResolvedGridSearch,
    | "highlightClassName"
    | "highlightStyle"
    | "activeHighlightClassName"
    | "activeHighlightStyle"
  >,
  options?: { active?: boolean }
) => {
  const active = options?.active ?? false;
  const className = active
    ? [search.highlightClassName, search.activeHighlightClassName]
        .filter(Boolean)
        .join(" ")
    : search.highlightClassName;
  const style = active
    ? {
        ...(search.highlightStyle ?? {}),
        ...(search.activeHighlightStyle ?? {}),
      }
    : search.highlightStyle;

  return {
    className,
    style,
  };
};

export const collectSearchMatches = (
  rows: GridRow[],
  columns: GridColumn[],
  matcher: SearchMatcher,
  options?: { columnKeys?: Set<string> }
): GridSearchMatch[] => {
  const matches: GridSearchMatch[] = [];
  const columnKeys = options?.columnKeys;

  rows.forEach((row, rowIndex) => {
    columns.forEach((column, columnIndex) => {
      if (columnKeys && !columnKeys.has(column.key)) return;
      const cell = row.data[column.key];
      if (!cell) return;
      const text = formatCellValue(column, cell.value, cell.format);
      if (!hasSearchMatch(text, matcher)) return;
      matches.push({
        rowId: row.id,
        rowIndex,
        columnKey: column.key,
        columnIndex,
        text,
      });
    });
  });

  return matches;
};

export const getNextSearchIndex = (
  current: number,
  total: number,
  wrap: boolean = true
) => {
  if (total <= 0) return -1;
  const next = current + 1;
  if (next < total) return next;
  return wrap ? 0 : total - 1;
};

export const getPrevSearchIndex = (
  current: number,
  total: number,
  wrap: boolean = true
) => {
  if (total <= 0) return -1;
  const prev = current - 1;
  if (prev >= 0) return prev;
  return wrap ? total - 1 : 0;
};

export const resolveGridSearch = (
  value?: GridSearchProps,
  activeMatch?: SearchActiveMatch | null
): ResolvedGridSearch => {
  const rawQuery = value?.query;
  const query = rawQuery == null ? "" : String(rawQuery).trim();
  const mode = value?.mode ?? "highlight";
  const caseSensitive = value?.caseSensitive ?? false;
  const wholeWord = value?.wholeWord ?? false;
  const highlight = value?.highlight ?? true;
  const highlightClassName =
    value?.highlightClassName ?? "ace-grid__search-highlight";
  const activeHighlightClassName =
    value?.activeHighlightClassName ?? "ace-grid__search-highlight--active";
  const matcher = (value?.enabled ?? true)
    ? createSearchMatcher(query, { caseSensitive, wholeWord })
    : null;
  const enabled = Boolean(matcher);

  return {
    enabled,
    query,
    mode,
    caseSensitive,
    wholeWord,
    highlight,
    highlightClassName,
    highlightStyle: value?.highlightStyle,
    activeHighlightClassName,
    activeHighlightStyle: value?.activeHighlightStyle,
    activeMatch: activeMatch ?? null,
    columns: value?.columns,
    matcher,
  };
};
