import { useMemo, type CSSProperties } from "react";

import type { GridResolvedTheme, GridThemeTokens } from "../../features/theming";
import type { GridRootState } from "../../features/theming/types";
import { cx } from "../../utils/cx";

type UseGridRootPresentationStateArgs = {
  width: number;
  height: number;
  tokens: GridThemeTokens;
  effectiveHeaderTotalHeight: number;
  effectiveViewportHeight: number;
  resolvedTheme: GridResolvedTheme;
  enableFormulaBar?: boolean;
  className?: string;
  style?: CSSProperties;
  effectivePaginationEnabled: boolean;
  paginationPosition: string;
};

export const useGridRootPresentationState = ({
  width,
  height,
  tokens,
  effectiveHeaderTotalHeight,
  effectiveViewportHeight,
  resolvedTheme,
  enableFormulaBar = false,
  className,
  style,
  effectivePaginationEnabled,
  paginationPosition,
}: UseGridRootPresentationStateArgs) => {
  const gridWrapperStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      position: "relative",
      width,
      height,
      fontFamily: tokens.fontFamily,
    }),
    [width, height, tokens.fontFamily],
  );

  const gridRootStyle = useMemo(() => {
    const base: CSSProperties = {
      flex: 1,
      position: "relative",
      overflow: "auto",
      border: tokens.gridBorder,
      background: tokens.surfaceBase,
      color: tokens.textPrimary,
      fontFamily: tokens.fontFamily,
      boxShadow: tokens.gridShadow,
      backdropFilter: tokens.gridBackdropFilter,
      borderRadius: tokens.borderRadius,
    };
    (base as CSSProperties & Record<string, string>)[
      "--ace-grid-header-total-height"
    ] = `${effectiveHeaderTotalHeight}px`;
    const viewportFilterPanelMaxHeight = Math.max(
      0,
      Math.floor(effectiveViewportHeight - effectiveHeaderTotalHeight - 8),
    );
    (base as CSSProperties & Record<string, string>)[
      "--ace-grid-filter-max-height"
    ] = `${viewportFilterPanelMaxHeight}px`;

    const state: GridRootState = {
      width,
      height,
      isFocused: false,
    };

    const themed = resolvedTheme.components.gridRoot
      ? resolvedTheme.components.gridRoot({
          base,
          state,
          tokens,
        })
      : base;

    return {
      ...themed,
      ...(style ?? {}),
    };
  }, [
    effectiveHeaderTotalHeight,
    effectiveViewportHeight,
    height,
    resolvedTheme,
    style,
    tokens,
    width,
  ]);

  const rootClassName = useMemo(
    () =>
      cx(
        "ace-grid",
        enableFormulaBar && "ace-grid--with-formula-bar",
        className,
      ),
    [className, enableFormulaBar],
  );

  const cellPadding = useMemo(
    () =>
      `${tokens.cellPaddingVertical}px ${tokens.cellPaddingHorizontal}px`,
    [tokens.cellPaddingHorizontal, tokens.cellPaddingVertical],
  );

  const showPaginationTop =
    effectivePaginationEnabled &&
    (paginationPosition === "top" || paginationPosition === "both");
  const showPaginationBottom =
    effectivePaginationEnabled &&
    (paginationPosition === "bottom" || paginationPosition === "both");

  return {
    gridWrapperStyle,
    gridRootStyle,
    rootClassName,
    cellPadding,
    showPaginationTop,
    showPaginationBottom,
  };
};
