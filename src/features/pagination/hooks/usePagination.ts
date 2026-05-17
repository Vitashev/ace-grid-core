import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  GridPaginationCursorState,
  GridPaginationMode,
} from "../../../types";

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

const coercePageSize = (value: number | undefined, fallback: number) => {
  const v = Math.trunc(value ?? fallback);
  if (!Number.isFinite(v) || v <= 0) return fallback;
  return v;
};

const normalizePageSizeOptions = (
  options: number[],
  fallback: number,
  current: number
) => {
  const seen = new Set<number>();
  const list: number[] = [];
  const push = (raw: number) => {
    const v = Math.trunc(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    if (seen.has(v)) return;
    seen.add(v);
    list.push(v);
  };
  options.forEach(push);
  push(fallback);
  push(current);
  return list.sort((a, b) => a - b);
};

export type UsePaginationArgs = {
  enabled?: boolean;
  mode?: GridPaginationMode;
  pageIndex?: number;
  pageSize?: number;
  defaultPageIndex?: number;
  defaultPageSize?: number;
  totalRowCount?: number;
  pageSizeOptions?: number[];
  keepPageOnSizeChange?: boolean;
  cursor?: GridPaginationCursorState;
  onPageChange?: (
    pageIndex: number,
    context: { pageSize: number; pageCount: number; mode: GridPaginationMode }
  ) => void;
  onPageSizeChange?: (
    pageSize: number,
    context: { pageIndex: number; pageCount: number; mode: GridPaginationMode }
  ) => void;
  onPageRequest?: (args: { pageIndex: number; pageSize: number }) => void | Promise<void>;
  onCursorRequest?: (args: {
    direction: "next" | "prev";
    cursor: string | null;
    pageIndex: number;
    pageSize: number;
  }) => void | Promise<void>;
};

export type UsePaginationResult = {
  enabled: boolean;
  mode: GridPaginationMode;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRowCount: number;
  canNext: boolean;
  canPrev: boolean;
  cursor?: GridPaginationCursorState;
  pageSizeOptions: number[];
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
};

export const usePagination = ({
  enabled = false,
  mode = "client",
  pageIndex,
  pageSize,
  defaultPageIndex = 0,
  defaultPageSize,
  totalRowCount = 0,
  pageSizeOptions,
  keepPageOnSizeChange = false,
  cursor,
  onPageChange,
  onPageSizeChange,
  onPageRequest,
  onCursorRequest,
}: UsePaginationArgs): UsePaginationResult => {
  const baseOptions = useMemo(
    () => (pageSizeOptions == null ? DEFAULT_PAGE_SIZES : pageSizeOptions),
    [pageSizeOptions]
  );
  const fallbackPageSize = useMemo(
    () => coercePageSize(defaultPageSize ?? baseOptions[0] ?? 20, 20),
    [defaultPageSize, baseOptions]
  );

  const [internalPageIndex, setInternalPageIndex] = useState(() => {
    const v = Math.trunc(defaultPageIndex);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  });
  const [internalPageSize, setInternalPageSize] = useState(() => fallbackPageSize);

  const isPageIndexControlled = pageIndex != null;
  const isPageSizeControlled = pageSize != null;

  const rawPageIndex = Math.trunc(
    (isPageIndexControlled ? pageIndex : internalPageIndex) ?? 0
  );
  const rawPageSize = coercePageSize(
    isPageSizeControlled ? pageSize : internalPageSize,
    fallbackPageSize
  );

  const total = Math.max(0, Math.trunc(totalRowCount || 0));
  const cursorState = cursor ?? {};
  const canNextCursor = mode === "cursor" && cursorState.next != null;
  const canPrevCursor = mode === "cursor" && cursorState.prev != null;
  const pageCount =
    mode === "cursor"
      ? Math.max(1, Math.max(0, rawPageIndex) + 1 + (canNextCursor ? 1 : 0))
      : Math.max(1, Math.ceil(total / rawPageSize));
  const clampedPageIndex =
    mode === "cursor"
      ? Math.max(0, rawPageIndex)
      : Math.min(Math.max(0, rawPageIndex), pageCount - 1);

  const normalizedPageSizeOptions = useMemo(
    () => normalizePageSizeOptions(baseOptions, fallbackPageSize, rawPageSize),
    [baseOptions, fallbackPageSize, rawPageSize]
  );

  useEffect(() => {
    if (!isPageSizeControlled && internalPageSize !== rawPageSize) {
      setInternalPageSize(rawPageSize);
    }
  }, [isPageSizeControlled, internalPageSize, rawPageSize]);

  useEffect(() => {
    if (!enabled) return;
    if (!isPageIndexControlled && internalPageIndex !== clampedPageIndex) {
      setInternalPageIndex(clampedPageIndex);
      return;
    }
    if (isPageIndexControlled && rawPageIndex !== clampedPageIndex) {
      onPageChange?.(clampedPageIndex, {
        pageSize: rawPageSize,
        pageCount,
        mode,
      });
    }
  }, [
    enabled,
    isPageIndexControlled,
    internalPageIndex,
    clampedPageIndex,
    rawPageIndex,
    onPageChange,
    rawPageSize,
    pageCount,
    mode,
  ]);

  useEffect(() => {
    if (!enabled || mode !== "server" || !onPageRequest) return;
    onPageRequest({ pageIndex: clampedPageIndex, pageSize: rawPageSize });
  }, [enabled, mode, onPageRequest, clampedPageIndex, rawPageSize]);

  const setPageIndex = useCallback(
    (nextPageIndex: number) => {
      const next =
        mode === "cursor"
          ? Math.max(0, Math.trunc(nextPageIndex) || 0)
          : Math.min(
              Math.max(0, Math.trunc(nextPageIndex) || 0),
              pageCount - 1
            );
      if (!isPageIndexControlled) setInternalPageIndex(next);
      onPageChange?.(next, { pageSize: rawPageSize, pageCount, mode });
    },
    [isPageIndexControlled, onPageChange, pageCount, rawPageSize, mode]
  );

  const setPageSize = useCallback(
    (nextSize: number) => {
      const nextPageSize = coercePageSize(nextSize, rawPageSize);
      const nextPageCount = Math.max(1, Math.ceil(total / nextPageSize));
      const nextPageIndex = keepPageOnSizeChange
        ? Math.min(clampedPageIndex, nextPageCount - 1)
        : 0;

      if (!isPageSizeControlled) setInternalPageSize(nextPageSize);
      onPageSizeChange?.(nextPageSize, {
        pageIndex: nextPageIndex,
        pageCount: nextPageCount,
        mode,
      });

      if (!keepPageOnSizeChange || clampedPageIndex !== nextPageIndex) {
        if (!isPageIndexControlled) setInternalPageIndex(nextPageIndex);
        onPageChange?.(nextPageIndex, {
          pageSize: nextPageSize,
          pageCount: nextPageCount,
          mode,
        });
      }
    },
    [
      clampedPageIndex,
      isPageIndexControlled,
      isPageSizeControlled,
      keepPageOnSizeChange,
      mode,
      onPageChange,
      onPageSizeChange,
      rawPageSize,
      total,
    ]
  );

  const goToFirst = useCallback(() => {
    if (mode === "cursor") return;
    setPageIndex(0);
  }, [mode, setPageIndex]);
  const goToLast = useCallback(() => {
    if (mode === "cursor") return;
    setPageIndex(pageCount - 1);
  }, [mode, pageCount, setPageIndex]);
  const nextPage = useCallback(() => {
    if (mode === "cursor") {
      if (!canNextCursor) return;
      onCursorRequest?.({
        direction: "next",
        cursor: cursorState.next ?? null,
        pageIndex: clampedPageIndex + 1,
        pageSize: rawPageSize,
      });
      setPageIndex(clampedPageIndex + 1);
      return;
    }
    setPageIndex(clampedPageIndex + 1);
  }, [
    canNextCursor,
    clampedPageIndex,
    cursorState.next,
    mode,
    onCursorRequest,
    rawPageSize,
    setPageIndex,
  ]);
  const prevPage = useCallback(() => {
    if (mode === "cursor") {
      if (!canPrevCursor) return;
      onCursorRequest?.({
        direction: "prev",
        cursor: cursorState.prev ?? null,
        pageIndex: Math.max(0, clampedPageIndex - 1),
        pageSize: rawPageSize,
      });
      setPageIndex(clampedPageIndex - 1);
      return;
    }
    setPageIndex(clampedPageIndex - 1);
  }, [
    canPrevCursor,
    clampedPageIndex,
    cursorState.prev,
    mode,
    onCursorRequest,
    rawPageSize,
    setPageIndex,
  ]);

  return {
    enabled,
    mode,
    pageIndex: clampedPageIndex,
    pageSize: rawPageSize,
    pageCount,
    totalRowCount: total,
    canNext: mode === "cursor" ? canNextCursor : clampedPageIndex < pageCount - 1,
    canPrev: mode === "cursor" ? canPrevCursor : clampedPageIndex > 0,
    cursor: cursorState,
    pageSizeOptions: normalizedPageSizeOptions,
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
  };
};
