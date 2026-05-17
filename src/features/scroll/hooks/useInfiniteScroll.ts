import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  GridInfiniteScrollDirection,
  GridInfiniteScrollLoadMore,
  GridInfiniteScrollMode,
  GridInfiniteScrollRequest,
  GridInfiniteScrollResult,
  GridInfiniteScrollStrategy,
  GridInfiniteScrollCursorState,
  GridRow,
} from "../../../types";

type UseInfiniteScrollArgs = {
  enabled: boolean;
  rowCount: number;
  rowStartIndex?: number;
  batchSize?: number;
  thresholdPx?: number;
  mode?: GridInfiniteScrollMode;
  strategy?: GridInfiniteScrollStrategy;
  initialCursor?: GridInfiniteScrollCursorState;
  loadMoreRows?: GridInfiniteScrollLoadMore;
};

export const useInfiniteScroll = ({
  enabled,
  rowCount,
  rowStartIndex = 0,
  batchSize = 50,
  thresholdPx = 240,
  mode = "bottom",
  strategy = "offset",
  initialCursor,
  loadMoreRows,
}: UseInfiniteScrollArgs) => {
  const loadingTopRef = useRef(false);
  const loadingBottomRef = useRef(false);
  const exhaustedTopRef = useRef(false);
  const exhaustedBottomRef = useRef(false);
  const requestedForCountRef = useRef<number | null>(null);
  const requestedForStartRef = useRef<number | null>(null);
  const requestedForPageRef = useRef<number | null>(null);
  const requestedForPrevPageRef = useRef<number | null>(null);
  const requestedForNextCursorRef = useRef<string | null>(null);
  const requestedForPrevCursorRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);
  const [lastDirection, setLastDirection] =
    useState<GridInfiniteScrollDirection | null>(null);
  const [loadCycle, setLoadCycle] = useState(0);
  const lastScrollTopRef = useRef<number | null>(null);
  const nextCursorRef = useRef<string | null>(initialCursor?.next ?? null);
  const prevCursorRef = useRef<string | null>(initialCursor?.prev ?? null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    requestedForCountRef.current = null;
    requestedForPageRef.current = null;
    requestedForNextCursorRef.current = null;
    exhaustedBottomRef.current = false;
    if (strategy === "cursor") {
      const nextCursor = nextCursorRef.current;
      exhaustedBottomRef.current = nextCursor == null;
      if (mountedRef.current) setHasMoreBottom(nextCursor != null);
      return;
    }
    if (mountedRef.current) setHasMoreBottom(true);
  }, [rowCount, rowStartIndex, strategy]);

  useEffect(() => {
    requestedForStartRef.current = null;
    requestedForPrevPageRef.current = null;
    requestedForPrevCursorRef.current = null;
    if (strategy === "cursor") {
      const prevCursor = prevCursorRef.current;
      exhaustedTopRef.current = prevCursor == null;
      if (mountedRef.current) setHasMoreTop(prevCursor != null);
      return;
    }
    const normalizedStart = Math.max(0, Math.trunc(rowStartIndex));
    exhaustedTopRef.current = normalizedStart <= 0;
    if (mountedRef.current) setHasMoreTop(normalizedStart > 0);
  }, [rowStartIndex, strategy]);

  useEffect(() => {
    if (strategy !== "cursor") return;
    nextCursorRef.current = initialCursor?.next ?? null;
    prevCursorRef.current = initialCursor?.prev ?? null;
    exhaustedBottomRef.current = nextCursorRef.current == null;
    exhaustedTopRef.current = prevCursorRef.current == null;
    requestedForNextCursorRef.current = null;
    requestedForPrevCursorRef.current = null;
    if (mountedRef.current) {
      setHasMoreBottom(nextCursorRef.current != null);
      setHasMoreTop(prevCursorRef.current != null);
    }
  }, [initialCursor?.next, initialCursor?.prev, strategy]);

  const effectiveBatchSize = useMemo(() => {
    const v = Math.trunc(batchSize);
    if (!Number.isFinite(v)) return 50;
    return Math.max(1, v);
  }, [batchSize]);

  const effectiveThresholdPx = useMemo(() => {
    const v = Math.trunc(thresholdPx);
    if (!Number.isFinite(v)) return 240;
    return Math.max(0, v);
  }, [thresholdPx]);

  const normalizedMode = useMemo<GridInfiniteScrollMode>(() => {
    if (mode === "top" || mode === "both" || mode === "bottom") return mode;
    return "bottom";
  }, [mode]);

  const normalizedStrategy = useMemo<GridInfiniteScrollStrategy>(() => {
    if (strategy === "page" || strategy === "cursor" || strategy === "offset") {
      return strategy;
    }
    return "offset";
  }, [strategy]);

  const allowTop = normalizedMode !== "bottom";
  const allowBottom = normalizedMode !== "top";

  const normalizeResult = useCallback(
    (result: GridInfiniteScrollResult | undefined | null) => {
      if (!result) return { rows: [] as GridRow[] };
      if (Array.isArray(result)) return { rows: result };
      return {
        rows: result.rows ?? [],
        nextCursor: result.nextCursor,
        prevCursor: result.prevCursor,
        hasMoreTop: result.hasMoreTop,
        hasMoreBottom: result.hasMoreBottom,
      };
    },
    []
  );

  const requestMoreBottom = useCallback(async () => {
    if (!enabled) return;
    if (!allowBottom) return;
    if (!loadMoreRows) return;
    if (loadingBottomRef.current) return;
    if (exhaustedBottomRef.current) return;
    if (
      normalizedStrategy === "offset" &&
      requestedForCountRef.current === rowCount
    ) {
      return;
    }

    if (normalizedStrategy === "page") {
      const normalizedStart = Math.max(0, Math.trunc(rowStartIndex));
      const currentPage = Math.floor(normalizedStart / effectiveBatchSize);
      const nextPage = currentPage + 1;
      if (requestedForPageRef.current === nextPage) return;
      requestedForPageRef.current = nextPage;
    }

    if (normalizedStrategy === "cursor") {
      const nextCursor = nextCursorRef.current ?? null;
      if (nextCursor == null) {
        exhaustedBottomRef.current = true;
        if (mountedRef.current) setHasMoreBottom(false);
        return;
      }
      if (requestedForNextCursorRef.current === nextCursor) return;
      requestedForNextCursorRef.current = nextCursor;
    }

    loadingBottomRef.current = true;
    if (mountedRef.current) setIsLoadingBottom(true);
    if (normalizedStrategy === "offset") {
      requestedForCountRef.current = rowCount;
    }

    try {
      const normalizedStart = Math.max(0, Math.trunc(rowStartIndex));
      const startIndex = normalizedStart + rowCount;
      const stopIndex = startIndex + effectiveBatchSize - 1;
      let result: GridInfiniteScrollResult | undefined;
      if (normalizedStrategy === "offset") {
        result = await (
          loadMoreRows as (
            startIndex: number,
            stopIndex: number,
            direction?: GridInfiniteScrollDirection,
          ) => Promise<GridInfiniteScrollResult>
        )(startIndex, stopIndex, "bottom");
      } else if (normalizedStrategy === "page") {
        const currentPage = Math.floor(normalizedStart / effectiveBatchSize);
        const nextPage = currentPage + 1;
        result = await (
          loadMoreRows as (
            request: GridInfiniteScrollRequest,
          ) => Promise<GridInfiniteScrollResult>
        )({
          strategy: "page",
          pageIndex: nextPage,
          pageSize: effectiveBatchSize,
          direction: "bottom",
        });
      } else {
        const cursor = nextCursorRef.current ?? null;
        result = await (
          loadMoreRows as (
            request: GridInfiniteScrollRequest,
          ) => Promise<GridInfiniteScrollResult>
        )({
          strategy: "cursor",
          cursor,
          limit: effectiveBatchSize,
          direction: "bottom",
        });
      }
      const normalized = normalizeResult(result);
      if (!mountedRef.current) return;
      if (normalized.rows.length) {
        setLastDirection("bottom");
        setLoadCycle((prev) => prev + 1);
      }
      if (normalizedStrategy === "cursor") {
        if (normalized.nextCursor !== undefined) {
          nextCursorRef.current = normalized.nextCursor ?? null;
          exhaustedBottomRef.current = normalized.nextCursor == null;
          setHasMoreBottom(normalized.nextCursor != null);
        } else if (!normalized.rows.length) {
          exhaustedBottomRef.current = true;
          setHasMoreBottom(false);
        }
        if (normalized.prevCursor !== undefined) {
          prevCursorRef.current = normalized.prevCursor ?? null;
          exhaustedTopRef.current = normalized.prevCursor == null;
          setHasMoreTop(normalized.prevCursor != null);
        }
      }
      if (normalized.hasMoreBottom !== undefined) {
        exhaustedBottomRef.current = !normalized.hasMoreBottom;
        setHasMoreBottom(normalized.hasMoreBottom);
      } else if (!normalized.rows.length) {
        exhaustedBottomRef.current = true;
        setHasMoreBottom(false);
      }
      if (normalized.hasMoreTop !== undefined) {
        exhaustedTopRef.current = !normalized.hasMoreTop;
        setHasMoreTop(normalized.hasMoreTop);
      }
    } catch {
      if (!mountedRef.current) return;
      if (normalizedStrategy === "offset") requestedForCountRef.current = null;
      if (normalizedStrategy === "page") requestedForPageRef.current = null;
      if (normalizedStrategy === "cursor")
        requestedForNextCursorRef.current = null;
    } finally {
      if (mountedRef.current) {
        loadingBottomRef.current = false;
        if (mountedRef.current) setIsLoadingBottom(false);
      }
    }
  }, [
    allowBottom,
    effectiveBatchSize,
    enabled,
    loadMoreRows,
    normalizeResult,
    normalizedStrategy,
    rowCount,
    rowStartIndex,
  ]);

  const requestMoreTop = useCallback(async () => {
    if (!enabled) return;
    if (!allowTop) return;
    if (!loadMoreRows) return;
    if (loadingTopRef.current) return;
    if (exhaustedTopRef.current) return;

    const normalizedStart = Math.max(0, Math.trunc(rowStartIndex));
    if (normalizedStrategy !== "cursor") {
      if (normalizedStart <= 0) {
        exhaustedTopRef.current = true;
        if (mountedRef.current) setHasMoreTop(false);
        return;
      }
      if (normalizedStrategy === "offset") {
        if (requestedForStartRef.current === normalizedStart) return;
      }
      if (normalizedStrategy === "page") {
        const currentPage = Math.floor(normalizedStart / effectiveBatchSize);
        const prevPage = currentPage - 1;
        if (prevPage < 0) {
          exhaustedTopRef.current = true;
          if (mountedRef.current) setHasMoreTop(false);
          return;
        }
        if (requestedForPrevPageRef.current === prevPage) return;
        requestedForPrevPageRef.current = prevPage;
      }
    }
    if (normalizedStrategy === "cursor") {
      const prevCursor = prevCursorRef.current ?? null;
      if (prevCursor == null) {
        exhaustedTopRef.current = true;
        if (mountedRef.current) setHasMoreTop(false);
        return;
      }
      if (requestedForPrevCursorRef.current === prevCursor) return;
      requestedForPrevCursorRef.current = prevCursor;
    }

    loadingTopRef.current = true;
    if (mountedRef.current) setIsLoadingTop(true);
    if (normalizedStrategy === "offset") {
      requestedForStartRef.current = normalizedStart;
    }

    try {
      const stopIndex = normalizedStart - 1;
      const startIndex = Math.max(0, stopIndex - effectiveBatchSize + 1);
      let result: GridInfiniteScrollResult | undefined;
      if (normalizedStrategy === "offset") {
        result = await (
          loadMoreRows as (
            startIndex: number,
            stopIndex: number,
            direction?: GridInfiniteScrollDirection,
          ) => Promise<GridInfiniteScrollResult>
        )(startIndex, stopIndex, "top");
      } else if (normalizedStrategy === "page") {
        const currentPage = Math.floor(normalizedStart / effectiveBatchSize);
        const prevPage = currentPage - 1;
        result = await (
          loadMoreRows as (
            request: GridInfiniteScrollRequest,
          ) => Promise<GridInfiniteScrollResult>
        )({
          strategy: "page",
          pageIndex: prevPage,
          pageSize: effectiveBatchSize,
          direction: "top",
        });
      } else {
        const cursor = prevCursorRef.current ?? null;
        result = await (
          loadMoreRows as (
            request: GridInfiniteScrollRequest,
          ) => Promise<GridInfiniteScrollResult>
        )({
          strategy: "cursor",
          cursor,
          limit: effectiveBatchSize,
          direction: "top",
        });
      }
      const normalized = normalizeResult(result);
      if (!mountedRef.current) return;
      if (normalized.rows.length) {
        setLastDirection("top");
        setLoadCycle((prev) => prev + 1);
      }
      if (normalizedStrategy === "cursor") {
        if (normalized.prevCursor !== undefined) {
          prevCursorRef.current = normalized.prevCursor ?? null;
          exhaustedTopRef.current = normalized.prevCursor == null;
          setHasMoreTop(normalized.prevCursor != null);
        } else if (!normalized.rows.length) {
          exhaustedTopRef.current = true;
          setHasMoreTop(false);
        }
        if (normalized.nextCursor !== undefined) {
          nextCursorRef.current = normalized.nextCursor ?? null;
          exhaustedBottomRef.current = normalized.nextCursor == null;
          setHasMoreBottom(normalized.nextCursor != null);
        }
      }
      if (normalized.hasMoreTop !== undefined) {
        exhaustedTopRef.current = !normalized.hasMoreTop;
        setHasMoreTop(normalized.hasMoreTop);
      } else if (!normalized.rows.length) {
        exhaustedTopRef.current = true;
        setHasMoreTop(false);
      }
      if (normalized.hasMoreBottom !== undefined) {
        exhaustedBottomRef.current = !normalized.hasMoreBottom;
        setHasMoreBottom(normalized.hasMoreBottom);
      }
    } catch {
      if (!mountedRef.current) return;
      if (normalizedStrategy === "offset") requestedForStartRef.current = null;
      if (normalizedStrategy === "page") requestedForPrevPageRef.current = null;
      if (normalizedStrategy === "cursor")
        requestedForPrevCursorRef.current = null;
    } finally {
      if (mountedRef.current) {
        loadingTopRef.current = false;
        if (mountedRef.current) setIsLoadingTop(false);
      }
    }
  }, [
    allowTop,
    effectiveBatchSize,
    enabled,
    loadMoreRows,
    normalizeResult,
    normalizedStrategy,
    rowStartIndex,
  ]);

  const check = useCallback(
    (el: HTMLDivElement | null) => {
      if (!enabled) return;
      if (!el) return;
      if (!loadMoreRows) return;
      const currentTop = el.scrollTop;
      const lastTop = lastScrollTopRef.current;
      const delta = lastTop == null ? 0 : currentTop - lastTop;
      lastScrollTopRef.current = currentTop;
      const scrollDirection =
        delta > 0 ? "down" : delta < 0 ? "up" : null;

      if (allowTop && (!scrollDirection || scrollDirection === "up")) {
        const distanceToTop = el.scrollTop;
        if (distanceToTop <= effectiveThresholdPx) {
          requestMoreTop();
        }
      }
      if (
        allowBottom &&
        (!scrollDirection || scrollDirection === "down")
      ) {
        const distanceToBottom =
          el.scrollHeight - (el.scrollTop + el.clientHeight);
        if (distanceToBottom <= effectiveThresholdPx) {
          requestMoreBottom();
        }
      }
    },
    [
      allowBottom,
      allowTop,
      effectiveThresholdPx,
      enabled,
      loadMoreRows,
      requestMoreBottom,
      requestMoreTop,
    ]
  );

  const isLoading = isLoadingTop || isLoadingBottom;
  const hasMore =
    (allowTop ? hasMoreTop : false) ||
    (allowBottom ? hasMoreBottom : false);

  return {
    check,
    requestMoreTop,
    requestMoreBottom,
    isLoading,
    isLoadingTop,
    isLoadingBottom,
    hasMore,
    hasMoreTop,
    hasMoreBottom,
    lastDirection,
    loadCycle,
  };
};
