import { useEffect, useRef, useState, useCallback } from "react";

export interface CellContentVirtualizationOptions {
  enabled: boolean;
  rootMargin?: string;
  threshold?: number;
}

export interface CellVirtualizationState {
  isVisible: boolean;
  shouldRender: boolean;
}

type ObserverListener = (entry: IntersectionObserverEntry) => void;

type ObserverPool = {
  observer: IntersectionObserver;
  listenersByElement: Map<Element, Set<ObserverListener>>;
};

const observerPools = new Map<string, ObserverPool>();

const createPoolKey = (rootMargin: string, threshold: number) =>
  `${rootMargin}|${threshold}`;

const getObserverPool = (rootMargin: string, threshold: number) => {
  const key = createPoolKey(rootMargin, threshold);
  const existing = observerPools.get(key);
  if (existing) {
    return { key, pool: existing };
  }

  const listenersByElement = new Map<Element, Set<ObserverListener>>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const listeners = listenersByElement.get(entry.target);
        if (!listeners) return;
        listeners.forEach((listener) => listener(entry));
      });
    },
    { rootMargin, threshold }
  );

  const pool: ObserverPool = {
    observer,
    listenersByElement,
  };
  observerPools.set(key, pool);

  return { key, pool };
};

const observeWithPool = (
  element: Element,
  rootMargin: string,
  threshold: number,
  listener: ObserverListener
) => {
  const { key, pool } = getObserverPool(rootMargin, threshold);
  let listeners = pool.listenersByElement.get(element);
  if (!listeners) {
    listeners = new Set<ObserverListener>();
    pool.listenersByElement.set(element, listeners);
    pool.observer.observe(element);
  }
  listeners.add(listener);

  return () => {
    const currentListeners = pool.listenersByElement.get(element);
    if (!currentListeners) return;
    currentListeners.delete(listener);
    if (currentListeners.size > 0) return;

    pool.listenersByElement.delete(element);
    pool.observer.unobserve(element);

    if (pool.listenersByElement.size === 0) {
      pool.observer.disconnect();
      observerPools.delete(key);
    }
  };
};

/**
 * Hook for virtualizing cell content based on viewport visibility
 * Uses Intersection Observer to determine when cells should render their content
 */
export const useCellContentVirtualization = (
  options: CellContentVirtualizationOptions = { enabled: true }
): [React.MutableRefObject<HTMLDivElement | null>, CellVirtualizationState] => {
  const cellRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CellVirtualizationState>({
    isVisible: false,
    shouldRender: !options.enabled, // Only render initially if virtualization is disabled
  });

  const handleIntersection = useCallback((entry: IntersectionObserverEntry) => {
    const isVisible = entry.isIntersecting;
    setState((prev) => {
      if (prev.isVisible === isVisible && prev.shouldRender === isVisible) {
        return prev;
      }
      return {
        isVisible,
        shouldRender: isVisible, // Only render when visible
      };
    });
  }, []);

  useEffect(() => {
    if (!options.enabled || typeof IntersectionObserver === "undefined") {
      setState((prev) => {
        if (prev.isVisible && prev.shouldRender) return prev;
        return { isVisible: true, shouldRender: true };
      });
      return;
    }

    const element = cellRef.current;
    if (!element) return;

    const rootMargin = options.rootMargin || "200px"; // Increased buffer for faster loading
    const threshold = options.threshold || 0;
    const stopObserving = observeWithPool(element, rootMargin, threshold, handleIntersection);

    return () => {
      stopObserving();
    };
  }, [
    options.enabled,
    options.rootMargin,
    options.threshold,
    handleIntersection,
  ]);

  return [cellRef, state];
};
