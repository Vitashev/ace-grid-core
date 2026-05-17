import { useCallback, useEffect, useRef } from "react";

interface Options {
  edgeSize?: number;
  maxEdgeSpeed?: number;
}

export function useDnDAutoScroll(
  containerRef: React.RefObject<HTMLElement>,
  { edgeSize = 36, maxEdgeSpeed = 40 }: Options = {}
) {
  const rafIdRef = useRef<number | null>(null);
  const latestXYRef = useRef<{ x: number; y: number } | null>(null);
  const isActiveRef = useRef(false);

  const getEdgeDelta = useCallback(
    (pos: number, min: number, max: number) => {
      if (pos < min + edgeSize) {
        const d = Math.min(edgeSize, Math.max(0, min + edgeSize - pos));
        return -Math.min(maxEdgeSpeed, (d / edgeSize) * maxEdgeSpeed);
      }
      if (pos > max - edgeSize) {
        const d = Math.min(edgeSize, Math.max(0, pos - (max - edgeSize)));
        return Math.min(maxEdgeSpeed, (d / edgeSize) * maxEdgeSpeed);
      }
      return 0;
    },
    [edgeSize, maxEdgeSpeed]
  );

  const stop = useCallback(() => {
    isActiveRef.current = false;
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    latestXYRef.current = null;
  }, []);

  const tick = useCallback(() => {
    if (!isActiveRef.current) {
      rafIdRef.current = null;
      return;
    }

    const coords = latestXYRef.current;
    const container = containerRef.current;
    if (coords && container) {
      const rect = container.getBoundingClientRect();
      const dx = getEdgeDelta(coords.x, rect.left, rect.right);
      const dy = getEdgeDelta(coords.y, rect.top, rect.bottom);
      if (dx !== 0 || dy !== 0) {
        container.scrollBy({ left: dx, top: dy, behavior: "auto" });
      }
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [containerRef, getEdgeDelta]);

  const start = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const update = useCallback((x: number, y: number) => {
    latestXYRef.current = { x, y };
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    start,
    stop,
    update,
  };
}
