import type { ComponentType, CSSProperties, ReactNode } from "react";
import type {
  CellFormat,
  GridColumn,
  GridSystemCellTypeKey,
  GridValidationCellState,
  SortDirection,
} from "../../types";

export interface GridThemeTokens {
  fontFamily: string;
  fontSize: number;

  borderRadius: string;
  borderRadiusSmall: string;

  surfaceBase: string;
  surfaceSubtle: string;
  surfaceRaised: string;
  surfaceSunken: string;

  borderColor: string;
  borderColorStrong: string;
  headerBorderColor: string;
  cellBorderColor: string;
  cellBorderColorAlt: string;
  gridBorder: string;
  gridShadow: string;
  gridBackdropFilter: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;

  headerBackground: string;
  headerBackgroundPinned: string;
  headerBackgroundDragging: string;
  headerBackgroundSelected: string;
  headerBackgroundHover: string;
  headerTextColor: string;
  headerShadow: string;
  headerBackdropFilter: string;

  pinnedLeftBackground: string;
  pinnedRightBackground: string;
  pinnedShadowLeft: string;
  pinnedShadowRight: string;
  pinnedEdgeShadowLeft: string;
  pinnedEdgeShadowRight: string;

  cellBackground: string;
  cellBackgroundHover: string;
  cellBackgroundSelected: string;
  cellBackgroundPinned: string;
  cellTextColor: string;
  cellPaddingVertical: number;
  cellPaddingHorizontal: number;
  cellBorderRadius: string;
  cellShadow: string;
  cellHoverShadow: string;
  cellSelectedShadow: string;

  rowHoverBackground: string;
  rowActiveBackground: string;
  rowBorderColor: string;
  rowShadow: string;

  spanCellBackground: string;
  spanCellSelectedBackground: string;
  spanCellBorder: string;
  spanCellShadow: string;

  sparklineLineColor: string;
  sparklineAreaFill: string;
  sparklineAxisColor: string;
  sparklineMarkerFill: string;
  sparklineMarkerStroke: string;
  sparklinePositiveColor: string;
  sparklineNegativeColor: string;
  sparklineZeroColor: string;
  sparklineHighlightMin: string;
  sparklineHighlightMax: string;

  selectionBorder: string;
  selectionFill: string;

  fillHandleBackground: string;
  fillHandleBorder: string;
  fillHandleShadow: string;

  dropIndicator: string;
  dropIndicatorPin: string;
  dropIndicatorUnpin: string;
  dropIndicatorCrossPin: string;

  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;

  filterIconDefault: string;
  filterIconActive: string;
  filterIndicatorColor: string;
  filterIndicatorBorderColor: string;
  filterIndicatorSize: number;
  sortIconDefault: string;
  sortIconActive: string;

  pinIconDefault: string;
  pinIconActive: string;
  pinIconDisabled: string;

  focusOutline: string;
  focusOutlineWidth: string;

  resizeHandleColor: string;
  resizeHandleActiveColor: string;
  resizeHandleShadow: string;

  dragGhostBackground: string;
  dragGhostBorder: string;
  dragGhostShadow: string;

  successBackground: string;
  successBorder: string;
  successShadow: string;
  dangerBackground: string;
  dangerBorder: string;
  dangerShadow: string;
  warningBackground: string;
  warningBorder: string;
  warningShadow: string;
  infoBackground: string;
  infoBorder: string;
  infoShadow: string;

  formulaBarBackground: string;
  formulaBarBorder: string;
  formulaBarInputBorder: string;
  formulaBarSelectionBadgeBackground: string;
  formulaBarSelectionBadgeText: string;
  formulaBarShadow: string;

  popupBackground: string;
  popupBorder: string;
  popupShadow: string;

  checkboxAccent: string;
  editorBackground: string;
  editorBorder: string;
  editorShadow: string;
  editorBackdropFilter: string;

  contextMenuBackground: string;
  contextMenuBorder: string;
  contextMenuShadow: string;
  contextMenuDivider: string;
  contextMenuText: string;
  contextMenuTextMuted: string;
  contextMenuTextDisabled: string;
  contextMenuShortcut: string;
  contextMenuItemHoverBackground: string;
  contextMenuItemActiveBackground: string;

  chartBackground: string;
  chartPlotBackground: string;
  chartAxisColor: string;
  chartGridColor: string;
  chartLabelColor: string;
  chartLegendText: string;
  chartLegendMuted: string;
  chartTooltipBackground: string;
  chartTooltipBorder: string;
  chartTooltipShadow: string;
  chartHeatmapColor: string;
  chartHeatmapMissing: string;
  chartPalette: readonly string[];
}

export interface GridThemeComponentParams<State = Record<string, unknown>> {
  base: CSSProperties;
  state: State;
  tokens: GridThemeTokens;
}

export type GridThemeComponentResolver<State = Record<string, unknown>> = (
  params: GridThemeComponentParams<State>
) => CSSProperties;

export interface GridRootState {
  width: number;
  height: number;
  isFocused: boolean;
}

export interface HeaderCellState {
  isPinned: boolean;
  isDragged: boolean;
  isColumnSelected: boolean;
  isDragOver: boolean;
  dragEdge: "left" | "right" | null;
  dropIntent: "pin" | "unpin" | "cross" | null;
  hasSpans: boolean;
  column: GridColumn;
}

export interface HeaderCellDragHandleState {
  isPinned: boolean;
  isDragging: boolean;
}

export interface HeaderCellSortButtonState {
  isActive: boolean;
  direction: SortDirection | null;
  order?: number | null;
}

export interface HeaderCellFilterTriggerState {
  isActive: boolean;
  isOpen: boolean;
}

export interface HeaderPinButtonState {
  type: "left" | "right" | "clear";
  disabled: boolean;
  isPinned: boolean;
  targetSide?: "left" | "right" | null;
  /** True when this side action will unpin instead of pin. */
  isActionUnpin?: boolean;
}

export interface GridCellState {
  isSelected: boolean;
  isSpanned: boolean;
  rowIndex: number;
  colIndex: number;
  column: GridColumn;
  format?: CellFormat;
  validation?: GridValidationCellState | null;
}

export interface RowSelectCellState {
  isSelected: boolean;
}

export interface FormulaBarState {
  hasSelection: boolean;
  disabled: boolean;
}

export interface ColumnFilterState {
  column: GridColumn;
}

export interface RowOrderCellState {
  isReorderable: boolean;
}

export interface SystemCellState {
  type: GridSystemCellTypeKey;
  isLoading: boolean;
}

export interface RowPinCellState {
  isPinnedTop: boolean;
  isPinnedBottom: boolean;
  isBlocked: boolean;
}

export interface RowPinButtonState {
  side: "top" | "bottom";
  isPinned: boolean;
  isBlocked: boolean;
}

export interface RowDetailToggleCellState {
  expanded: boolean;
  disabled: boolean;
}

export interface RowDetailToggleButtonState {
  expanded: boolean;
  disabled: boolean;
}

export interface ContextMenuState {
  anchorX: number;
  anchorY: number;
  itemCount: number;
  isSubmenu?: boolean;
}

export interface ContextMenuItemState {
  id: string;
  actionId?: string;
  isDisabled: boolean;
  isHighlighted: boolean;
}

export interface GridThemeComponents {
  gridRoot?: GridThemeComponentResolver<GridRootState>;
  headerCell?: GridThemeComponentResolver<HeaderCellState>;
  headerCellDragHandle?: GridThemeComponentResolver<HeaderCellDragHandleState>;
  headerCellSortButton?: GridThemeComponentResolver<HeaderCellSortButtonState>;
  headerCellFilterTrigger?: GridThemeComponentResolver<HeaderCellFilterTriggerState>;
  headerPinButton?: GridThemeComponentResolver<HeaderPinButtonState>;
  gridCell?: GridThemeComponentResolver<GridCellState>;
  rowSelectCell?: GridThemeComponentResolver<RowSelectCellState>;
  formulaBar?: GridThemeComponentResolver<FormulaBarState>;
  columnFilter?: GridThemeComponentResolver<ColumnFilterState>;
  rowOrderCell?: GridThemeComponentResolver<RowOrderCellState>;
  systemCell?: GridThemeComponentResolver<SystemCellState>;
  rowPinCell?: GridThemeComponentResolver<RowPinCellState>;
  rowPinButton?: GridThemeComponentResolver<RowPinButtonState>;
  rowDetailToggleCell?: GridThemeComponentResolver<RowDetailToggleCellState>;
  rowDetailToggleButton?: GridThemeComponentResolver<RowDetailToggleButtonState>;
  contextMenu?: GridThemeComponentResolver<ContextMenuState>;
  contextMenuItem?: GridThemeComponentResolver<ContextMenuItemState>;
}

/**
 * Selector -> style object map emitted as scoped CSS with `!important`.
 * Use this when you need to override internal inline styles.
 *
 * Selectors are scoped to `[data-ace-grid-theme="..."]`.
 * Use `&` to reference the scoped root itself.
 */
export type GridThemeInlineStyleOverrides = Record<string, CSSProperties>;

export interface GridIconStateBase {
  className?: string;
}

export interface GridIconFilterState extends GridIconStateBase {
  isActive: boolean;
  isOpen: boolean;
}

export interface GridIconSortState extends GridIconStateBase {
  direction: SortDirection | null;
}

export interface GridIconPinState extends GridIconStateBase {
  disabled: boolean;
  isPinned?: boolean;
  targetSide?: "left" | "right" | "top" | "bottom" | null;
}

export interface GridIconDragHandleState extends GridIconStateBase {
  isPinned: boolean;
  isDragging: boolean;
  orientation?: "row" | "column";
}

export interface GridIconPaginationState extends GridIconStateBase {
  disabled: boolean;
}

export interface GridIconHeaderGroupChevronState extends GridIconStateBase {
  isOpen: boolean;
  isExpandable: boolean;
}

export interface GridIconRowDetailToggleState extends GridIconStateBase {
  expanded: boolean;
  disabled: boolean;
}

export type GridIconRenderer<
  State extends GridIconStateBase = GridIconStateBase,
> = (state: State) => ReactNode;

export type GridIconDefinition<
  State extends GridIconStateBase = GridIconStateBase,
> =
  | GridIconRenderer<State>
  | ComponentType<State>
  | keyof JSX.IntrinsicElements
  | ReactNode;

export interface GridIconSet {
  dragHandle: GridIconRenderer<GridIconDragHandleState>;
  sort: GridIconRenderer<GridIconSortState>;
  filter: GridIconRenderer<GridIconFilterState>;
  pinLeft: GridIconRenderer<GridIconPinState>;
  pinRight: GridIconRenderer<GridIconPinState>;
  pinClear: GridIconRenderer<GridIconPinState>;
  headerGroupChevron: GridIconRenderer<GridIconHeaderGroupChevronState>;
  rowPinningHeader: GridIconRenderer<GridIconStateBase>;
  rowOrderingHeader: GridIconRenderer<GridIconDragHandleState>;
  rowDetailToggle: GridIconRenderer<GridIconRowDetailToggleState>;
  pinRowTop?: GridIconRenderer<GridIconPinState>;
  pinRowBottom?: GridIconRenderer<GridIconPinState>;
  paginationFirst: GridIconRenderer<GridIconPaginationState>;
  paginationPrev: GridIconRenderer<GridIconPaginationState>;
  paginationNext: GridIconRenderer<GridIconPaginationState>;
  paginationLast: GridIconRenderer<GridIconPaginationState>;
  chartCreate: GridIconRenderer<GridIconStateBase>;
  chartClose: GridIconRenderer<GridIconStateBase>;
  chartTypeLine: GridIconRenderer<GridIconStateBase>;
  chartTypeArea: GridIconRenderer<GridIconStateBase>;
  chartTypeColumn: GridIconRenderer<GridIconStateBase>;
  chartTypeBar: GridIconRenderer<GridIconStateBase>;
  chartTypeStackedColumn: GridIconRenderer<GridIconStateBase>;
  chartTypeStackedBar: GridIconRenderer<GridIconStateBase>;
  chartTypePie: GridIconRenderer<GridIconStateBase>;
  chartTypeDonut: GridIconRenderer<GridIconStateBase>;
  chartTypeScatter: GridIconRenderer<GridIconStateBase>;
  chartTypeBubble: GridIconRenderer<GridIconStateBase>;
  chartTypeHistogram: GridIconRenderer<GridIconStateBase>;
  chartTypeHeatmap: GridIconRenderer<GridIconStateBase>;
}

export type GridIconSetInput = {
  [K in keyof GridIconSet]: GridIconDefinition<
    Parameters<NonNullable<GridIconSet[K]>>[0]
  >;
};

export interface GridTheme {
  name: string;
  description?: string;
  tokens: GridThemeTokens;
  components?: GridThemeComponents;
  css?: string;
  inlineStyleOverrides?: GridThemeInlineStyleOverrides;
  icons?: Partial<GridIconSetInput>;
}

export type GridThemeName =
  | "data"
  | "dataDark"
  | "material3"
  | "material3Dark"
  | "liquidGlass"
  | "liquidGlassDark";

export type GridThemeInput = GridTheme | GridThemeName;
