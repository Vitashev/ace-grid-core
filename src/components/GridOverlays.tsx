import React from "react";
import { getGridRuntimeModules } from "../runtime/modules";
import type {
  GridContextMenuActionContext,
  GridContextMenuConfig,
  GridContextMenuContext,
  GridContextMenuResolvedItem,
} from "../features/context-menu";
import type {
  GridPaginationLabels,
  GridPaginationRenderState,
} from "../types";
import { useGridFormulaBarValue } from "../features/grid-store";
import { PaginationBar } from "../features/pagination";
import type { GridThemeTokens } from "../features/theming/types";

type GridFormulaBarProps = {
  enabled: boolean;
  selectedCell: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
};

export const GridFormulaBar: React.FC<GridFormulaBarProps> = ({
  enabled,
  selectedCell,
  onChange,
  onSubmit,
  onFocus,
}) => {
  const value = useGridFormulaBarValue();
  const FormulaBarComponent = getGridRuntimeModules().formula.FormulaBar;

  if (!enabled || !FormulaBarComponent) return null;

  return (
    <FormulaBarComponent
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      onFocus={onFocus}
      selectedCell={selectedCell}
    />
  );
};

type GridContextMenuOverlayProps = {
  enabled: boolean;
  open: boolean;
  context: GridContextMenuContext | null;
  items: GridContextMenuResolvedItem[];
  config: GridContextMenuConfig;
  onClose: () => void;
  onSelect: (ctx: GridContextMenuActionContext) => void;
};

export const GridContextMenuOverlay: React.FC<GridContextMenuOverlayProps> = ({
  enabled,
  open,
  context,
  items,
  config,
  onClose,
  onSelect,
}) => {
  const CellContextMenuComponent =
    getGridRuntimeModules().contextMenuBase.CellContextMenu;

  if (!enabled || !context || !CellContextMenuComponent) return null;

  return (
    <CellContextMenuComponent
      open={open}
      context={context}
      items={items}
      config={config}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
};

type GridPaginationAreaProps = {
  enabled: boolean;
  state: GridPaginationRenderState;
  tokens: GridThemeTokens;
  render?: (state: GridPaginationRenderState) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  labels?: GridPaginationLabels;
  showPageSize?: boolean;
  showRange?: boolean;
  showPageInfo?: boolean;
  showControls?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
};

export const GridPaginationArea: React.FC<GridPaginationAreaProps> = ({
  enabled,
  state,
  tokens,
  render,
  className,
  style,
  labels,
  showPageSize,
  showRange,
  showPageInfo,
  showControls,
  showFirstLast,
  disabled,
}) => {
  if (!enabled) return null;
  if (render) return <>{render(state)}</>;

  return (
    <PaginationBar
      state={state}
      tokens={tokens}
      className={className}
      style={style}
      labels={labels}
      showPageSize={showPageSize}
      showRange={showRange}
      showPageInfo={showPageInfo}
      showControls={showControls}
      showFirstLast={showFirstLast}
      disabled={disabled}
    />
  );
};
