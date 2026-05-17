import React from "react";
import type {
  GridLoadingCellRenderArgs,
  GridLoadingCellRenderer,
} from "../types";

const DEFAULT_LOADING_CELL_CONTENT = (
  <span className="ace-grid__cell-loading-shell" aria-hidden="true">
    <span className="ace-grid__cell-loading-bar" />
  </span>
);

export function renderLoadingCellContent(
  renderer: GridLoadingCellRenderer | undefined,
  args: GridLoadingCellRenderArgs
): React.ReactNode {
  if (renderer == null) return DEFAULT_LOADING_CELL_CONTENT;
  if (typeof renderer === "function") {
    const LoadingRenderer = renderer;
    return <LoadingRenderer {...args} />;
  }
  return renderer;
}
