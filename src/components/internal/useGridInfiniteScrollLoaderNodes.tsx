import React, { useCallback, useMemo } from "react";

type InfiniteScrollDirection = "top" | "bottom";

type UseGridInfiniteScrollLoaderNodesArgs = {
  effectiveInfiniteScroll: boolean;
  fontSize: number;
  hasMoreBottom: boolean;
  hasMoreTop: boolean;
  infiniteScrollBottomLoader?: React.ReactNode;
  infiniteScrollLoader?: React.ReactNode;
  infiniteScrollTopLoader?: React.ReactNode;
  isLoadingBottom: boolean;
  isLoadingTop: boolean;
  renderInfiniteScrollLoader?: (args: {
    isLoading: boolean;
    hasMore: boolean;
    direction?: InfiniteScrollDirection;
  }) => React.ReactNode;
  textMuted: string;
};

const isRenderableLoaderNode = (
  node: React.ReactNode,
): node is Exclude<React.ReactNode, null | undefined | boolean> =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const useGridInfiniteScrollLoaderNodes = ({
  effectiveInfiniteScroll,
  fontSize,
  hasMoreBottom,
  hasMoreTop,
  infiniteScrollBottomLoader,
  infiniteScrollLoader,
  infiniteScrollTopLoader,
  isLoadingBottom,
  isLoadingTop,
  renderInfiniteScrollLoader,
  textMuted,
}: UseGridInfiniteScrollLoaderNodesArgs) => {
  const buildInfiniteScrollLoader = useCallback(
    (
      direction: InfiniteScrollDirection,
      isLoading: boolean,
      hasMore: boolean,
    ) => {
      if (!effectiveInfiniteScroll) return null;
      if (!isLoading) return null;
      if (renderInfiniteScrollLoader) {
        const rendered = renderInfiniteScrollLoader({
          isLoading,
          hasMore,
          direction,
        });
        if (isRenderableLoaderNode(rendered)) {
          return rendered;
        }
      }
      const directionalNode =
        direction === "top" ? infiniteScrollTopLoader : infiniteScrollBottomLoader;
      if (isRenderableLoaderNode(directionalNode)) {
        return directionalNode;
      }
      if (isRenderableLoaderNode(infiniteScrollLoader)) {
        return infiniteScrollLoader;
      }
      return (
        <div
          className="ace-grid__infinite-scroll-loader"
          style={{
            color: textMuted,
            fontSize: Math.max(12, fontSize - 1),
          }}
          role="status"
          aria-live="polite"
        >
          <span
            className="ace-grid__infinite-scroll-loader-spinner"
            aria-hidden="true"
          />
          <span className="ace-grid__infinite-scroll-loader-label">
            {direction === "top"
              ? "Loading previous rows..."
              : "Loading more rows..."}
          </span>
        </div>
      );
    },
    [
      effectiveInfiniteScroll,
      fontSize,
      infiniteScrollBottomLoader,
      infiniteScrollLoader,
      infiniteScrollTopLoader,
      renderInfiniteScrollLoader,
      textMuted,
    ],
  );

  const infiniteScrollTopLoaderNode = useMemo(
    () => buildInfiniteScrollLoader("top", isLoadingTop, hasMoreTop),
    [buildInfiniteScrollLoader, hasMoreTop, isLoadingTop],
  );

  const infiniteScrollBottomLoaderNode = useMemo(
    () => buildInfiniteScrollLoader("bottom", isLoadingBottom, hasMoreBottom),
    [buildInfiniteScrollLoader, hasMoreBottom, isLoadingBottom],
  );

  return {
    infiniteScrollTopLoaderNode,
    infiniteScrollBottomLoaderNode,
  };
};
