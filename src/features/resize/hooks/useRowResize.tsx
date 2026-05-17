import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ResizeMode } from "./useResize";
import { cx } from "../../../utils/cx";

type RowResizeState = {
  rowId: string | number;
  startY: number;
  startHeight: number;
  currentY: number;
  draftHeight: number;
};

export interface UseRowResizeOptions {
  onRowResize?: (rowId: string | number, height: number) => void;
  rowHeightOf?: (rowId: string | number) => number;
  enabled?: boolean;
  minRowHeight?: number;
  mode?: ResizeMode;
  guideColor?: string;
  hitboxHeight?: number;
  lineThickness?: number;
  /** When false, avoids re-rendering on every mousemove. */
  renderUpdates?: boolean;
  /** Pixel step for emitted heights (0 disables quantization). */
  heightStep?: number;
  /** Throttle mode for row resize commits. */
  throttle?: "raf" | "none";
}

export function useRowResize({
  onRowResize,
  rowHeightOf,
  enabled = true,
  minRowHeight = 20,
  mode = "immediate",
  guideColor = "#2683ff",
  hitboxHeight = 10,
  lineThickness = 2,
  renderUpdates: renderUpdatesOverride,
  heightStep: heightStepOverride,
  throttle: throttleOverride,
}: UseRowResizeOptions) {
  const renderUpdates = renderUpdatesOverride ?? true;
  const heightStep = heightStepOverride ?? 1;
  const throttle = throttleOverride ?? "raf";
  const [resizing, setResizing] = useState<RowResizeState | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestHeightRef = useRef<number | null>(null);
  const lastEmittedRef = useRef(new Map<string | number, number>());
  const resizingRef = useRef<RowResizeState | null>(null);
  const stateFrameRef = useRef<number | null>(null);
  const pendingStateRef = useRef<RowResizeState | null>(null);
  const pendingLineStateRef = useRef<RowResizeState | null>(null);
  const lineMapRef = useRef(new Map<string | number, HTMLDivElement | null>());
  const rowMetricsRef = useRef(
    new Map<
      string | number,
      { topOffset?: number; containerHeight?: number }
    >()
  );
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const activeHandleRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const usingPointerRef = useRef(false);

  const scheduleResizingUpdate = useCallback(
    (
      next: RowResizeState | null,
      {
        immediate = false,
        render = true,
      }: { immediate?: boolean; render?: boolean } = {}
    ) => {
      pendingStateRef.current = next;
      resizingRef.current = next;

      if (!render) return;

      if (immediate) {
        if (stateFrameRef.current != null) {
          cancelAnimationFrame(stateFrameRef.current);
          stateFrameRef.current = null;
        }
        setResizing(next);
        return;
      }

      if (stateFrameRef.current != null) {
        return;
      }

      stateFrameRef.current = requestAnimationFrame(() => {
        stateFrameRef.current = null;
        setResizing(pendingStateRef.current);
      });
    },
    []
  );

  const flush = useCallback(
    (rowId: string | number, height: number) => {
      frameRef.current = null;
      latestHeightRef.current = null;
      if (!onRowResize) return;
      const lastHeight = lastEmittedRef.current.get(rowId);
      if (lastHeight === height) return;
      lastEmittedRef.current.set(rowId, height);
      onRowResize(rowId, height);
    },
    [onRowResize]
  );

  const showActiveLine = useCallback((rowId: string | number) => {
    const line = lineMapRef.current.get(rowId) ?? null;
    activeLineRef.current = line;
    if (line) {
      line.style.display = "block";
    }
  }, []);

  const hideActiveLine = useCallback(() => {
    const line = activeLineRef.current;
    if (line) {
      line.style.display = "none";
    }
    activeLineRef.current = null;
  }, []);

  const updateLinePosition = useCallback(
    (state: RowResizeState, useLayoutOnly = false) => {
      const line = activeLineRef.current;
      if (!line) return;
      // Keep the guide visible across immediate-mode row-height commits that can
      // remount/hide the active line while the drag is still in progress.
      line.style.display = "block";
      const metrics = rowMetricsRef.current.get(state.rowId);
      if (!metrics) return;
      const { topOffset, containerHeight } = metrics;

      const clampTop = (value: number) => {
        if (!Number.isFinite(value)) return value;
        return Math.max(-hitboxHeight / 2, value);
      };

      let lineTop = 0;
      if (topOffset == null) {
        const height = Number.isFinite(containerHeight ?? NaN)
          ? (containerHeight as number)
          : 0;
        lineTop = height - lineThickness / 2;
      } else if (useLayoutOnly || mode === "immediate") {
        lineTop = clampTop(topOffset) - lineThickness / 2;
      } else {
        const reference = rowHeightOf
          ? rowHeightOf(state.rowId) ?? state.startHeight
          : state.startHeight;
        const effectiveOffset = topOffset + (state.draftHeight - reference);
        lineTop = clampTop(effectiveOffset) - lineThickness / 2;
      }

      line.style.bottom = "";
      line.style.top = "0px";
      line.style.transform = `translateY(${lineTop}px)`;
    },
    [hitboxHeight, lineThickness, mode, rowHeightOf]
  );

  const clearActiveHandle = useCallback(() => {
    if (!activeHandleRef.current) return;
    activeHandleRef.current.classList.remove(
      "ace-grid__row-resize-hitbox--active"
    );
    activeHandleRef.current = null;
  }, []);

  const startResize = useCallback(
    (clientY: number, handleEl: HTMLDivElement, rowId: string | number) => {
      if (!enabled || !onRowResize || !rowHeightOf) return;
      const startHeight = rowHeightOf(rowId);
      const initialState: RowResizeState = {
        rowId,
        startY: clientY,
        startHeight,
        currentY: clientY,
        draftHeight: startHeight,
      };
      scheduleResizingUpdate(initialState, { immediate: true, render: true });
      showActiveLine(rowId);
      updateLinePosition(initialState);
      if (!rowMetricsRef.current.get(rowId)) {
        const line = lineMapRef.current.get(rowId) ?? null;
        if (line) {
          line.style.display = "block";
          line.style.bottom = "";
          line.style.top = "0px";
          const fallbackTop =
            handleEl.offsetTop + handleEl.offsetHeight / 2 - lineThickness / 2;
          line.style.transform = `translateY(${fallbackTop}px)`;
        }
      }
      if (activeHandleRef.current && activeHandleRef.current !== handleEl) {
        activeHandleRef.current.classList.remove(
          "ace-grid__row-resize-hitbox--active"
        );
      }
      activeHandleRef.current = handleEl;
      handleEl.classList.add("ace-grid__row-resize-hitbox--active");
    },
    [
      enabled,
      onRowResize,
      rowHeightOf,
      scheduleResizingUpdate,
      showActiveLine,
      lineThickness,
      updateLinePosition,
    ]
  );

  const onResizeDown = useCallback(
    (event: React.MouseEvent, rowId: string | number) => {
      usingPointerRef.current = false;
      pointerIdRef.current = null;
      event.preventDefault();
      event.stopPropagation();
      startResize(event.clientY, event.currentTarget as HTMLDivElement, rowId);
    },
    [startResize]
  );

  const handleMoveClientY = useCallback(
    (clientY: number) => {
      const active = resizingRef.current;
      if (!active || !onRowResize) return;
      const dy = clientY - active.startY;
      const rawHeight = active.startHeight + dy;
      const quantized =
        heightStep > 0
          ? Math.round(rawHeight / heightStep) * heightStep
          : rawHeight;
      const nextHeight = Math.max(minRowHeight, quantized);
      latestHeightRef.current = nextHeight;

      const nextState: RowResizeState = {
        ...active,
        currentY: clientY,
        draftHeight: nextHeight,
      };

      if (mode === "immediate") {
        if (throttle === "none") {
          if (resizingRef.current?.rowId !== undefined) {
            flush(resizingRef.current.rowId, nextHeight);
          }
          updateLinePosition(nextState, true);
        } else if (frameRef.current == null) {
          frameRef.current = requestAnimationFrame(() => {
            if (
              latestHeightRef.current != null &&
              resizingRef.current?.rowId !== undefined
            ) {
              flush(resizingRef.current.rowId, latestHeightRef.current);
            }
            if (pendingLineStateRef.current) {
              updateLinePosition(pendingLineStateRef.current, true);
            }
          });
        }
      }

      if (mode === "immediate") {
        pendingLineStateRef.current = nextState;
      } else {
        updateLinePosition(nextState);
      }
      scheduleResizingUpdate(nextState, { render: renderUpdates });
    },
    [
      flush,
      heightStep,
      minRowHeight,
      mode,
      onRowResize,
      renderUpdates,
      scheduleResizingUpdate,
      throttle,
      updateLinePosition,
    ]
  );

  const handleMove = useCallback(
    (event: MouseEvent) => {
      if (usingPointerRef.current) return;
      handleMoveClientY(event.clientY);
    },
    [handleMoveClientY]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && event.pointerId !== pointerIdRef.current) {
        return;
      }
      handleMoveClientY(event.clientY);
    },
    [handleMoveClientY]
  );

  const finishResize = useCallback(() => {
    const activeHandle = activeHandleRef.current;
    const active = resizingRef.current;
    if (active && latestHeightRef.current != null) {
      flush(active.rowId, latestHeightRef.current);
    }
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    latestHeightRef.current = null;
    pendingLineStateRef.current = null;
    scheduleResizingUpdate(null, { immediate: true, render: true });
    hideActiveLine();
    if (usingPointerRef.current && pointerIdRef.current != null) {
      try {
        activeHandle?.releasePointerCapture(pointerIdRef.current);
      } catch {
        // no-op
      }
    }
    clearActiveHandle();
    usingPointerRef.current = false;
    pointerIdRef.current = null;
  }, [clearActiveHandle, flush, hideActiveLine, scheduleResizingUpdate]);

  const handleMouseUp = useCallback(() => {
    if (usingPointerRef.current) return;
    finishResize();
  }, [finishResize]);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && event.pointerId !== pointerIdRef.current) {
        return;
      }
      finishResize();
    },
    [finishResize]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent) => {
      if (!usingPointerRef.current) return;
      if (pointerIdRef.current != null && event.pointerId !== pointerIdRef.current) {
        return;
      }
      finishResize();
    },
    [finishResize]
  );

  useEffect(() => {
    if (!enabled || !resizing) return;
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      latestHeightRef.current = null;
      pendingLineStateRef.current = null;
      // During active drags, this effect can resubscribe when callback identities
      // change; avoid hiding visuals in that transition.
      if (!resizingRef.current) {
        hideActiveLine();
        clearActiveHandle();
      }
    };
  }, [
    clearActiveHandle,
    enabled,
    handleMove,
    handleMouseUp,
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
    hideActiveLine,
    resizing,
  ]);

  useEffect(
    () => () => {
      if (stateFrameRef.current != null) {
        cancelAnimationFrame(stateFrameRef.current);
        stateFrameRef.current = null;
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (mode !== "immediate") return;
    const active = resizingRef.current;
    if (!active) return;
    showActiveLine(active.rowId);
    updateLinePosition(active, true);
  }, [mode, rowHeightOf, showActiveLine, updateLinePosition]);

  const createRowResizeHandle = useCallback(
    (
      rowId: string | number | undefined,
      _hasSpans: boolean,
      topOffset?: number,
      containerHeight?: number
    ) => {
      if (!enabled || !onRowResize || !rowId) {
        return null;
      }

      const activeState =
        resizingRef.current?.rowId === rowId ? resizingRef.current : null;
      const isActive = Boolean(activeState);
      const keySuffix =
        topOffset != null ? `-${Math.round(topOffset * 1000)}` : "";

      const clampTop = (value: number) => {
        if (!Number.isFinite(value)) return value;
        return Math.max(-hitboxHeight / 2, value);
      };

      rowMetricsRef.current.set(rowId, { topOffset, containerHeight });

      const effectiveOffset = (() => {
        if (topOffset == null) return topOffset;
        if (!activeState) return topOffset;

        if (!rowHeightOf) {
          return topOffset + (activeState.draftHeight - activeState.startHeight);
        }

        const currentHeight = rowHeightOf(rowId);
        const reference =
          currentHeight != null ? currentHeight : activeState.startHeight;
        return topOffset + (activeState.draftHeight - reference);
      })();

      const rawTop =
        effectiveOffset != null
          ? clampTop(effectiveOffset - hitboxHeight / 2)
          : undefined;
      const maxTop =
        Number.isFinite(containerHeight) && containerHeight != null
          ? Math.max(0, containerHeight - hitboxHeight)
          : null;
      const clampedTop =
        rawTop != null && maxTop != null
          ? Math.min(Math.max(0, rawTop), maxTop)
          : rawTop;

      const basePosition = {
        left: 0,
        right: 0,
        bottom: topOffset == null ? -hitboxHeight / 2 : undefined,
        top: clampedTop != null ? clampedTop : undefined,
      } as const;

      const lineRef = (node: HTMLDivElement | null) => {
        if (node) {
          lineMapRef.current.set(rowId, node);
          if (!renderUpdates) {
            const isActiveRow = resizingRef.current?.rowId === rowId;
            if (isActiveRow && resizingRef.current) {
              activeLineRef.current = node;
              node.style.display = "block";
              updateLinePosition(resizingRef.current);
            } else {
              node.style.display = "none";
            }
          }
        } else {
          lineMapRef.current.delete(rowId);
        }
      };

      const lineStyle: React.CSSProperties = {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 0,
        borderTop: `${lineThickness}px solid ${guideColor}`,
        pointerEvents: "none",
        zIndex: 60,
        willChange: "transform",
      };

      const lineTop =
        topOffset == null
          ? (Number.isFinite(containerHeight ?? NaN)
              ? (containerHeight as number)
              : 0) - lineThickness / 2
          : isActive && effectiveOffset != null
          ? clampTop(effectiveOffset) - lineThickness / 2
          : clampTop(topOffset) - lineThickness / 2;
      lineStyle.transform = `translateY(${lineTop}px)`;

      if (renderUpdates) {
        lineStyle.display = isActive ? "block" : "none";
      }

      const shouldRenderLine = renderUpdates ? isActive : true;
      const line = shouldRenderLine ? (
        <div
          key={`row-resize-line-${rowId}${keySuffix}`}
          ref={lineRef}
          className="ace-grid__row-resize-line"
          role="presentation"
          aria-hidden="true"
          style={lineStyle}
        />
      ) : null;

      const handle = (
        <div
          key={`row-resize-hit-${rowId}${keySuffix}`}
          role="presentation"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            usingPointerRef.current = true;
            pointerIdRef.current = event.pointerId;
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // no-op
            }
            startResize(event.clientY, event.currentTarget as HTMLDivElement, rowId);
          }}
          onMouseDown={(event) => {
            if (usingPointerRef.current) return;
            event.stopPropagation();
            onResizeDown(event, rowId);
          }}
          className={cx(
            "ace-grid__row-resize-hitbox",
            isActive && "ace-grid__row-resize-hitbox--active"
          )}
          style={{
            position: "absolute",
            ...basePosition,
            height: hitboxHeight,
            cursor: "row-resize",
            zIndex: 20,
            background: "transparent",
            touchAction: "none",
          }}
        />
      );

      return (
        <React.Fragment key={`row-resize-wrap-${rowId}${keySuffix}`}>
          {line}
          {handle}
        </React.Fragment>
      );
    },
    [enabled, guideColor, hitboxHeight, lineThickness, onResizeDown, onRowResize, renderUpdates, rowHeightOf, startResize, updateLinePosition]
  );

  return {
    rowResizing: resizing,
    onRowResizeDown: onResizeDown,
    createRowResizeHandle,
    mode,
  } as const;
}
