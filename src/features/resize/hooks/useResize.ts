import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import { cx } from "../../../utils/cx";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

export type ResizeMode = "immediate" | "deferred";
export type ColumnResizeEdge = "left" | "right";

export interface ColumnResizeState {
  columnKey: string;
  startX: number;
  startWidth: number;
  currentX: number;
  draftWidth: number;
  resizeFrom: ColumnResizeEdge;
}

export interface UseColumnResizeOptions {
  minWidth?: number;
  mode?: ResizeMode;
  containerRef?: RefObject<HTMLElement> | null;
  scrollLeft?: number;
  /** When false, avoids re-rendering on every mousemove. */
  renderUpdates?: boolean;
  /** Optional ref for imperative guide updates. */
  guideRef?: RefObject<HTMLDivElement> | null;
  /** Optional method to align guide to the actual column edge. */
  getColumnEdgeOffset?: (columnKey: string) => number | null;
  /** Throttle mode for column resize commits. */
  throttle?: "raf" | "none";
  /** Pixel step for emitted widths (0 disables quantization). */
  quantize?: number;
}

export interface ColumnResizeHandleOverrides {
  className?: string;
  style?: CSSProperties;
  resizeFrom?: ColumnResizeEdge;
  onMouseDown?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export interface ColumnResizeGuideOptions {
  color: string;
  thickness?: number;
  zIndex?: number;
}

export type ColumnResizeHandleProps = Readonly<{
  className: string;
  style?: CSSProperties;
  onMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}>;

export type ColumnResizeGuideProps = Readonly<{
  className: string;
  style: CSSProperties;
}>;

const mergeClassNames = (
  ...names: (string | null | undefined | false)[]
): string => cx(...names);

export function useResize(
  onColumnResize: (columnKey: string, width: number) => void,
  colWidthOf: (k: string, fallback?: number) => number,
  columnWidths: Record<string, number>,
  {
    minWidth: minWidthOverride,
    mode: modeOverride,
    containerRef,
    scrollLeft,
    renderUpdates: renderUpdatesOverride,
    guideRef: guideRefOverride,
    getColumnEdgeOffset: getColumnEdgeOffsetOverride,
    throttle: throttleOverride,
    quantize: quantizeOverride,
  }: UseColumnResizeOptions = {}
) {
  const minWidth = minWidthOverride ?? 50;
  const mode: ResizeMode = modeOverride ?? "immediate";
  const renderUpdates = renderUpdatesOverride ?? true;
  const guideRef = guideRefOverride ?? null;
  const getColumnEdgeOffset = getColumnEdgeOffsetOverride ?? null;
  const throttle = throttleOverride ?? "raf";
  const quantize = quantizeOverride ?? 1;
  const useImperativeGuide = Boolean(guideRef);

  const [resizing, setResizing] = useState<ColumnResizeState | null>(null);
  const resizingRef = useRef<ColumnResizeState | null>(null);

  // ---- swallow post-drag click/dblclick so selection is not collapsed
  const swallowActiveRef = useRef(false);
  const swallowTimerRef = useRef<number | null>(null);
  const swallowHandlerRef = useRef<(ev: Event) => void>();

  const addSwallowers = useCallback(() => {
    if (swallowActiveRef.current) return;
    swallowActiveRef.current = true;
    const handler = (ev: Event) => {
      if (!swallowActiveRef.current) return;
      ev.preventDefault();
      ev.stopPropagation();
    };
    swallowHandlerRef.current = handler;
    window.addEventListener("click", handler, true);
    window.addEventListener("dblclick", handler, true);
  }, []);

  const removeSwallowers = useCallback(() => {
    if (swallowHandlerRef.current) {
      window.removeEventListener("click", swallowHandlerRef.current, true);
      window.removeEventListener("dblclick", swallowHandlerRef.current, true);
      swallowHandlerRef.current = undefined;
    }
    swallowActiveRef.current = false;
    if (swallowTimerRef.current != null) {
      clearTimeout(swallowTimerRef.current);
      swallowTimerRef.current = null;
    }
  }, []);

  const frameRef = useRef<number | null>(null);
  const pendingWidthRef = useRef<number | null>(null);
  const lastEmittedWidthRef = useRef<Record<string, number>>({});
  const stateFrameRef = useRef<number | null>(null);
  const pendingStateRef = useRef<ColumnResizeState | null>(null);
  const scrollLeftRef = useRef<number>(scrollLeft ?? 0);
  const guideVisibleRef = useRef(false);
  const guideLeftRef = useRef<number | null>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const activeHandleRef = useRef<HTMLElement | null>(null);
  const lastClientXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const usingPointerRef = useRef(false);

  useEffect(() => {
    scrollLeftRef.current = scrollLeft ?? 0;
  }, [scrollLeft]);

  const updateContainerRect = useCallback(() => {
    const container = containerRef?.current ?? null;
    containerRectRef.current = container
      ? container.getBoundingClientRect()
      : null;
  }, [containerRef]);

  const startObservingContainer = useCallback(() => {
    const container = containerRef?.current ?? null;
    if (!container || typeof ResizeObserver === "undefined") return;
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    const observer = new ResizeObserver(() => {
      updateContainerRect();
    });
    observer.observe(container);
    resizeObserverRef.current = observer;
  }, [containerRef, updateContainerRect]);

  const stopObservingContainer = useCallback(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, []);

  const updateGuidePosition = useCallback(
    (clientX: number) => {
      const guide = guideRef?.current;
      const container = containerRef?.current;
      if (!guide || !container) return;
      if (!containerRectRef.current) {
        updateContainerRect();
      }
      const rect = containerRectRef.current;
      if (!rect) return;
      const offset = scrollLeftRef.current + (clientX - rect.left);
      const max = container.scrollWidth;
      const clamped = Math.max(0, Math.min(offset, max));
      const rounded = Math.round(clamped) + 0.5;
      if (guideLeftRef.current !== rounded) {
        guideLeftRef.current = rounded;
        guide.style.transform = `translateX(${rounded}px)`;
      }
      if (!guideVisibleRef.current) {
        guide.style.display = "block";
        guideVisibleRef.current = true;
      }
    },
    [containerRef, guideRef, updateContainerRect]
  );

  const updateGuideFromOffset = useCallback(
    (left: number) => {
      const guide = guideRef?.current;
      const container = containerRef?.current;
      if (!guide || !container || !Number.isFinite(left)) return;
      const max = container.scrollWidth;
      const clamped = Math.max(0, Math.min(left, max));
      const rounded = Math.round(clamped) + 0.5;
      if (guideLeftRef.current !== rounded) {
        guideLeftRef.current = rounded;
        guide.style.transform = `translateX(${rounded}px)`;
      }
      if (!guideVisibleRef.current) {
        guide.style.display = "block";
        guideVisibleRef.current = true;
      }
    },
    [containerRef, guideRef]
  );

  const resolveVisibleColumnEdgeOffset = useCallback(
    (columnKey: string): number | null => {
      if (!getColumnEdgeOffset) return null;
      const edgeOffset = getColumnEdgeOffset(columnKey);
      if (edgeOffset == null || !Number.isFinite(edgeOffset)) return null;

      const container = containerRef?.current;
      if (!container) return edgeOffset;

      const visibleStart = scrollLeftRef.current;
      const visibleEnd = visibleStart + container.clientWidth;
      if (edgeOffset < visibleStart - 1 || edgeOffset > visibleEnd + 1) {
        return null;
      }
      return edgeOffset;
    },
    [containerRef, getColumnEdgeOffset]
  );

  const syncGuideToColumnEdge = useCallback(
    (columnKey: string, fallbackClientX?: number | null) => {
      const edgeOffset = resolveVisibleColumnEdgeOffset(columnKey);
      if (edgeOffset != null) {
        updateGuideFromOffset(edgeOffset);
        return;
      }
      if (fallbackClientX != null) {
        updateGuidePosition(fallbackClientX);
      }
    },
    [resolveVisibleColumnEdgeOffset, updateGuideFromOffset, updateGuidePosition]
  );

  const hideGuide = useCallback(() => {
    const guide = guideRef?.current;
    if (!guide) return;
    if (guideVisibleRef.current) {
      guide.style.display = "none";
      guideVisibleRef.current = false;
    }
  }, [guideRef]);

  useEffect(() => {
    if (!useImperativeGuide) return;
    const guide = guideRef?.current;
    if (guide) {
      guide.style.display = "none";
      guideVisibleRef.current = false;
    }
  }, [guideRef, useImperativeGuide]);

  const clearActiveHandle = useCallback(() => {
    if (!activeHandleRef.current) return;
    activeHandleRef.current.classList.remove(
      "ace-grid__column-resize-handle--resizing"
    );
    activeHandleRef.current = null;
  }, []);

  const scheduleResizingUpdate = useCallback(
    (
      next: ColumnResizeState | null,
      {
        immediate = false,
        render = true,
      }: { immediate?: boolean; render?: boolean } = {}
    ) => {
      pendingStateRef.current = next;
      resizingRef.current = next;

      if (!render) return;

      if (immediate) {
        if (stateFrameRef.current !== null) {
          cancelAnimationFrame(stateFrameRef.current);
          stateFrameRef.current = null;
        }
        setResizing(next);
        return;
      }

      if (stateFrameRef.current !== null) {
        return;
      }

      stateFrameRef.current = requestAnimationFrame(() => {
        stateFrameRef.current = null;
        setResizing(pendingStateRef.current);
      });
    },
    []
  );

  const flushResize = useCallback(
    (columnKey: string, width: number) => {
      frameRef.current = null;
      pendingWidthRef.current = null;
      const lastWidth = lastEmittedWidthRef.current[columnKey];
      if (lastWidth === width) return;
      lastEmittedWidthRef.current[columnKey] = width;
      onColumnResize(columnKey, width);
    },
    [onColumnResize]
  );

  const startResize = useCallback(
    (
      clientX: number,
      handleEl: HTMLElement,
      key: string,
      resizeFrom: ColumnResizeEdge = "right"
    ) => {
      const startWidth = columnWidths[key] ?? colWidthOf(key, minWidth);

      const initialState: ColumnResizeState = {
        columnKey: key,
        startX: clientX,
        startWidth,
        currentX: clientX,
        draftWidth: startWidth,
        resizeFrom,
      };

      lastClientXRef.current = clientX;
      scheduleResizingUpdate(initialState, { immediate: true, render: true });

      if (useImperativeGuide) {
        updateContainerRect();
        startObservingContainer();
        if (
          mode === "immediate" &&
          getColumnEdgeOffset &&
          resizeFrom === "right"
        ) {
          syncGuideToColumnEdge(key, clientX);
        } else {
          updateGuidePosition(clientX);
        }
      }

      if (activeHandleRef.current && activeHandleRef.current !== handleEl) {
        activeHandleRef.current.classList.remove(
          "ace-grid__column-resize-handle--resizing"
        );
      }
      activeHandleRef.current = handleEl;
      handleEl.classList.add("ace-grid__column-resize-handle--resizing");

      // arm global click/dblclick swallower; will be removed shortly after mouseup
      addSwallowers();
    },
    [
      addSwallowers,
      colWidthOf,
      columnWidths,
      getColumnEdgeOffset,
      minWidth,
      mode,
      scheduleResizingUpdate,
      startObservingContainer,
      updateContainerRect,
      updateGuidePosition,
      useImperativeGuide,
      syncGuideToColumnEdge,
    ]
  );

  const onResizeDown = useCallback(
    (event: ReactMouseEvent, key: string) => {
      usingPointerRef.current = false;
      pointerIdRef.current = null;
      event.preventDefault();
      event.stopPropagation();
      startResize(event.clientX, event.currentTarget as HTMLElement, key);
    },
    [startResize]
  );

  const handleMoveClientX = useCallback(
    (clientX: number) => {
      const active = resizingRef.current;
      if (!active) return;
      const dx = clientX - active.startX;
      lastClientXRef.current = clientX;
      const rawWidth =
        active.resizeFrom === "left"
          ? active.startWidth - dx
          : active.startWidth + dx;
      const quantized =
        quantize > 0 ? Math.round(rawWidth / quantize) * quantize : rawWidth;
      const nextWidth = Math.max(minWidth, quantized);
      pendingWidthRef.current = nextWidth;

      if (mode === "immediate") {
        if (throttle === "none") {
          if (resizingRef.current?.columnKey) {
            flushResize(resizingRef.current.columnKey, nextWidth);
            if (useImperativeGuide && lastClientXRef.current != null) {
              if (
                getColumnEdgeOffset &&
                resizingRef.current?.resizeFrom !== "left"
              ) {
                syncGuideToColumnEdge(
                  resizingRef.current.columnKey,
                  lastClientXRef.current
                );
              } else {
                updateGuidePosition(lastClientXRef.current);
              }
            }
          }
        } else if (frameRef.current === null) {
          frameRef.current = requestAnimationFrame(() => {
            if (
              pendingWidthRef.current !== null &&
              resizingRef.current?.columnKey
            ) {
              flushResize(
                resizingRef.current.columnKey,
                pendingWidthRef.current
              );
              if (useImperativeGuide && lastClientXRef.current != null) {
                if (
                  getColumnEdgeOffset &&
                  resizingRef.current?.resizeFrom !== "left"
                ) {
                  syncGuideToColumnEdge(
                    resizingRef.current.columnKey,
                    lastClientXRef.current
                  );
                } else {
                  updateGuidePosition(lastClientXRef.current);
                }
              }
            }
          });
        }
      }

      const nextState: ColumnResizeState = {
        ...active,
        currentX: clientX,
        draftWidth: nextWidth,
      };

      if (useImperativeGuide && mode !== "immediate") {
        updateGuidePosition(clientX);
      }

      scheduleResizingUpdate(nextState, { render: renderUpdates });
    },
    [
      flushResize,
      minWidth,
      mode,
      quantize,
      renderUpdates,
      scheduleResizingUpdate,
      getColumnEdgeOffset,
      syncGuideToColumnEdge,
      throttle,
      updateGuidePosition,
      useImperativeGuide,
    ]
  );

  const onResizeMove = useCallback(
    (e: MouseEvent) => {
      if (usingPointerRef.current) return;
      handleMoveClientX(e.clientX);
    },
    [handleMoveClientX]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) {
        return;
      }
      handleMoveClientX(e.clientX);
    },
    [handleMoveClientX]
  );

  const finishResize = useCallback(() => {
    const active = resizingRef.current;
    if (active && pendingWidthRef.current !== null) {
      flushResize(active.columnKey, pendingWidthRef.current);
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    pendingWidthRef.current = null;
    scheduleResizingUpdate(null, { immediate: true, render: true });

    if (useImperativeGuide) {
      hideGuide();
      stopObservingContainer();
    }
    clearActiveHandle();
    if (usingPointerRef.current && pointerIdRef.current != null) {
      try {
        activeHandleRef.current?.releasePointerCapture(pointerIdRef.current);
      } catch {
        // no-op
      }
    }
    usingPointerRef.current = false;
    pointerIdRef.current = null;

    // Keep swallowing for a short window to catch the post-drag click,
    // then clean up. (If a click never comes, we still clean up.)
    if (swallowActiveRef.current) {
      if (swallowTimerRef.current != null) {
        clearTimeout(swallowTimerRef.current);
      }
      swallowTimerRef.current = window.setTimeout(() => {
        removeSwallowers();
      }, 250); // 200–300ms is plenty
    }
  }, [
    clearActiveHandle,
    flushResize,
    hideGuide,
    removeSwallowers,
    scheduleResizingUpdate,
    stopObservingContainer,
    useImperativeGuide,
  ]);

  const onResizeUp = useCallback(() => {
    if (usingPointerRef.current) return;
    finishResize();
  }, [finishResize]);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) {
        return;
      }
      finishResize();
    },
    [finishResize]
  );

  const onPointerCancel = useCallback(
    (e: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) {
        return;
      }
      finishResize();
    },
    [finishResize]
  );

  useEffect(() => {
    if (!resizing) return;
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeUp);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    return () => {
      document.removeEventListener("mousemove", onResizeMove);
      document.removeEventListener("mouseup", onResizeUp);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingWidthRef.current = null;
      const stillResizing = Boolean(resizingRef.current);
      if (useImperativeGuide && !stillResizing) {
        hideGuide();
        stopObservingContainer();
      }
      if (!stillResizing) {
        clearActiveHandle();
      }
    };
  }, [
    clearActiveHandle,
    hideGuide,
    onPointerCancel,
    onPointerMove,
    onPointerUp,
    onResizeMove,
    onResizeUp,
    resizing,
    stopObservingContainer,
    useImperativeGuide,
  ]);

  useLayoutEffect(() => {
    if (!useImperativeGuide || mode !== "immediate" || !getColumnEdgeOffset) {
      return;
    }
    const active = resizingRef.current;
    if (!active) return;
    if (active.resizeFrom === "left") {
      if (lastClientXRef.current != null) {
        updateGuidePosition(lastClientXRef.current);
      }
      return;
    }
    syncGuideToColumnEdge(active.columnKey, lastClientXRef.current);
  }, [
    columnWidths,
    getColumnEdgeOffset,
    mode,
    syncGuideToColumnEdge,
    updateGuidePosition,
    useImperativeGuide,
  ]);

  // global cleanup in case an unmount happens mid-resize
  useEffect(() => removeSwallowers, [removeSwallowers]);

  useEffect(
    () => () => {
      if (stateFrameRef.current !== null) {
        cancelAnimationFrame(stateFrameRef.current);
        stateFrameRef.current = null;
      }
    },
    []
  );

  const columnResizeGuideLeft = useMemo(() => {
    if (useImperativeGuide) return null;
    if (!resizing || !containerRef?.current) return null;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = resizing.currentX ?? resizing.startX;
    const offset = container.scrollLeft + (x - rect.left);
    const max = container.scrollWidth;
    if (!Number.isFinite(offset)) return null;
    return Math.max(0, Math.min(offset, max));
  }, [resizing, containerRef, useImperativeGuide]);

  const getColumnResizeHandleProps = useCallback(
    (
      columnKey: string,
      overrides: ColumnResizeHandleOverrides = {}
    ): ColumnResizeHandleProps => {
      const isActive = resizingRef.current?.columnKey === columnKey;
      const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
        if (usingPointerRef.current) return;
        overrides.onMouseDown?.(event);
        if (event.defaultPrevented) return;
        usingPointerRef.current = false;
        pointerIdRef.current = null;
        // prevent the cell's selection mousedown and any immediate click
        event.preventDefault();
        event.stopPropagation();
        startResize(
          event.clientX,
          event.currentTarget as HTMLElement,
          columnKey,
          overrides.resizeFrom ?? "right"
        );
      };

      const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        overrides.onPointerDown?.(event);
        if (event.defaultPrevented) return;
        usingPointerRef.current = true;
        pointerIdRef.current = event.pointerId;
        // prevent the cell's selection mousedown and any immediate click
        event.preventDefault();
        event.stopPropagation();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // no-op
        }
        startResize(
          event.clientX,
          event.currentTarget as HTMLElement,
          columnKey,
          overrides.resizeFrom ?? "right"
        );
      };

      const mergedStyle = overrides.style
        ? { ...overrides.style, touchAction: overrides.style.touchAction ?? "none" }
        : { touchAction: "none" };

      return {
        className: mergeClassNames(
          "ace-grid__column-resize-handle",
          overrides.className,
          isActive && "ace-grid__column-resize-handle--resizing"
        ),
        style: mergedStyle,
        onMouseDown: handleMouseDown,
        onPointerDown: handlePointerDown,
      } as const;
    },
    [startResize]
  );

  const getColumnResizeGuideProps = useCallback(
    ({
      color,
      thickness = 2,
      zIndex = 180,
    }: ColumnResizeGuideOptions): ColumnResizeGuideProps | null => {
      if (useImperativeGuide) {
        const style: CSSProperties = {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 0,
          borderLeft: `${thickness}px solid ${color}`,
          pointerEvents: "none",
          zIndex,
          willChange: "transform",
        };
        return {
          className: "ace-grid__column-resize-guide",
          style,
        };
      }

      if (columnResizeGuideLeft == null || !resizingRef.current) return null;
      const style: CSSProperties = {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: Math.round(columnResizeGuideLeft) + 0.5,
        width: 0,
        borderLeft: `${thickness}px solid ${color}`,
        pointerEvents: "none",
        zIndex,
      };

      return {
        className: "ace-grid__column-resize-guide",
        style,
      };
    },
    [columnResizeGuideLeft, useImperativeGuide]
  );

  return {
    resizing,
    onResizeDown,
    columnResizeGuideLeft,
    mode,
    getColumnResizeHandleProps,
    getColumnResizeGuideProps,
  } as const;
}
