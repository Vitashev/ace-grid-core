import type {
  ComponentType,
  CSSProperties,
  MutableRefObject,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import type {
  GridIconSet,
  GridIconSetInput,
  GridThemeInlineStyleOverrides,
  GridThemeInput,
} from "./features/theming";
import type { GridContextMenuConfig } from "./features/context-menu/types";
import type { GridLicenseConfig } from "./license";

/* ======================================================
   Core cell/row/column/value types
   ====================================================== */

export type CellValueType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "json"
  | "radio"
  | "formula";

export type ColumnDataType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "select"
  | "radio"
  | "textarea"
  | "json"
  | "custom";
export type ColumnFilterType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiSelect";
export type FilterOperator =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "between"
  | "in"
  | "isBlank"
  | "isNotBlank";
export type FilterJoin = "and" | "or";
export type FilterMode = "condition" | "set" | "advanced";

export interface FilterCondition {
  operator: FilterOperator;
  value: any;
}

export interface FilterSetConfig {
  values: any[];
  includeBlanks?: boolean;
}

export type FilterBlock =
  | {
      kind: "condition";
      conditions: FilterCondition[];
      join?: FilterJoin;
    }
  | {
      kind: "set";
      set: FilterSetConfig;
    };
export type SortDirection = "asc" | "desc";
export type PinColumnSide = "left" | "right";
export type PinRowSide = "top" | "bottom";

export interface CellBorderStyle {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface CellFormat {
  className?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  border?: CellBorderStyle;
  numberFormat?: string;
}

export interface CellValue {
  value: any;
  formula?: string;
  type?: CellValueType;
  format?: CellFormat;
  sparkline?: GridSparklineOptions;
  colSpan?: number;
  rowSpan?: number;
  merged?: boolean;
  mergeId?: string;
  spillOrigin?: string;
}

export interface CellEditorRenderProps {
  value: any;
  row: GridRow;
  column: GridColumn;
  onChange: (value: any) => void;
  onCommit: (value: any) => void;
  onCancel: () => void;
  registerValueListener?: (listener: (value: any) => void) => () => void;
}

export type GridCellRenderMode = "enhance" | "replace";
export type GridHeaderRenderMode = "passive" | "interactive";

export interface GridCellRenderProps {
  value: any;
  formattedValue: string;
  defaultContent: ReactNode;
  row?: GridRow;
  column: GridColumn;
  rowIndex: number;
  colIndex: number;
  cell?: CellValue;
  isLoading: boolean;
  isSelected: boolean;
  mode: GridCellRenderMode;
}

export interface GridHeaderRenderProps {
  column: GridColumn;
  label: ReactNode;
}

export interface GridColumn {
  key: string;
  title: string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  /**
   * Optional static values for built-in select/boolean filters.
   * Useful for server-side filtering when the full value set is not present in loaded rows.
   */
  filterValues?: Array<
    string | number | boolean | { value: string | number | boolean | null; label: string }
  >;
  editable?: boolean;
  pinned?: PinColumnSide | false;
  type?: ColumnDataType;
  options?: string[];
  editorType?:
    | "input"
    | "checkbox"
    | "select"
    | "datetime"
    | "time"
    | "textarea"
    | "json"
    | "radio"
    | "custom";
  editorProps?: Record<string, any>;
  renderEditor?: (props: CellEditorRenderProps) => ReactNode;
  renderCell?: (props: GridCellRenderProps) => ReactNode;
  renderCellMode?: GridCellRenderMode;
  renderHeader?: (props: GridHeaderRenderProps) => ReactNode;
  renderHeaderMode?: GridHeaderRenderMode;
  validator?: (value: any) => boolean | string;
  /** Column-level validation rules (merged with grid validation config). */
  validation?: GridValidationRule | GridValidationRule[];
  formatter?: (value: any) => string;
  parser?: (value: string) => any;
  sparkline?: GridSparklineOptions | boolean;
  filterType?: ColumnFilterType;
  sortComparator?: (a: any, b: any) => number;
  columnGroupShow?: "open" | "closed";
}

export interface GridColumnGroup {
  groupId?: string;
  title?: string;
  headerName?: string;
  children: GridColumnDef[];
  openByDefault?: boolean;
  marryChildren?: boolean;
  suppressStickyLabel?: boolean;
  autoHeaderHeight?: boolean;
  columnGroupShow?: "open" | "closed";
  pinned?: PinColumnSide | false;
  headerClassName?: string;
  headerStyle?: CSSProperties;
}

export type GridColumnDef = GridColumn | GridColumnGroup;

export interface GridRow {
  id: string | number;
  height?: number;
  data: Record<string, CellValue>;
  selected?: boolean;
  locked?: boolean;
  pinned?: PinRowSide | false;
  meta?: GridRowMeta;
}

export interface GridSelection {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export type GridHeaderCellSelectionMode = "range" | "bands" | "single";

export interface GridRowSelectionChangeMeta {
  source: "header" | "group" | "row";
  descendants?: boolean;
  anchorRowId?: string | number;
}

export interface GridColumnSelectionChangeMeta {
  source: "column";
  anchorColumnKey?: string;
}

export type GridPinnedColumns = { left: string[]; right: string[] };

export type GridPinnedRows = {
  top: (string | number)[];
  bottom: (string | number)[];
};

export interface GridFilterConfig {
  columnKey: string;
  type: ColumnFilterType;
  value?: any;
  operator?: FilterOperator;
  mode?: FilterMode;
  conditions?: FilterCondition[];
  join?: FilterJoin;
  set?: FilterSetConfig;
  blocks?: FilterBlock[];
  blockJoin?: FilterJoin;
}

export interface GridSortConfig {
  columnKey: string;
  direction: SortDirection;
}

export type GridSortModel = GridSortConfig[];

export interface GridMergedCell {
  id: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  value: CellValue;
  rowIds?: Array<string | number>;
}

export interface GridState {
  selection: GridSelection | null;
  editingCell: { row: number; col: number } | null;
  sortColumn: string | null;
  sortDirection: SortDirection | null;
  sortModel?: GridSortModel;
  filters: Record<string, any>;
  columnWidths: Record<string, number>;
  scrollTop: number;
  scrollLeft: number;
  pinnedColumns: GridPinnedColumns;
  pinnedRows: GridPinnedRows;
  formulaBarValue: string;
  showFormulaBar: boolean;
}

export interface GridExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  useFormattedValues?: boolean;
  preserveMerges?: boolean;
}

export type GridExcelImportSource = Blob | ArrayBuffer;

export interface GridExcelImportOptions {
  sheet?: string | number;
  headerRow?: boolean;
  updateColumns?: boolean;
}

export interface GridExcelImportResult {
  sheetName: string;
  rowCount: number;
  columnCount: number;
  updatedColumns: boolean;
}

export interface GridCsvExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  useFormattedValues?: boolean;
  bom?: boolean;
}

export type GridCsvImportSource = Blob | ArrayBuffer | string;

export interface GridCsvImportOptions {
  delimiter?: string;
  headerRow?: boolean;
  updateColumns?: boolean;
}

export interface GridCsvImportResult {
  rowCount: number;
  columnCount: number;
  delimiter: string;
  updatedColumns: boolean;
}

/* Row-grouping runtime structures */
export interface GridRowGroupSpan {
  colSpan: number;
  rowSpan: number;
  value: any;
  format?: any;
  startRow: number;
  endRow: number;
  startRowOffset: number;
}

export interface GridRowGroup {
  id: string;
  rows: GridRow[];
  startRowIndex: number;
  endRowIndex: number;
  height: number;
  spans: Map<string, GridRowGroupSpan[]>;
  isParent: boolean;
  children?: GridRowGroup[];
}

export interface GridRowGroupingValueMeta {
  columnKey: string;
  value: any;
  level: number;
  path: string;
}

export interface GridRowGroupingPathMeta {
  path: string;
  levels: GridRowGroupingValueMeta[];
}

export interface GridRowMeta {
  /** Internal flag used for placeholder rows while server blocks are loading. */
  loading?: boolean;
  group?: {
    path: string;
    columnKey: string;
    displayColumnKey: string;
    level: number;
    label: string;
    value: any;
    childCount: number;
    directChildCount?: number;
    isExpanded: boolean;
    hasChildren: boolean;
    depth: number;
    rowIds: (string | number)[];
    valueChain: GridRowGroupingValueMeta[];
  };
  groupingPath?: GridRowGroupingPathMeta;
}

export type GridRowAggregationKind = "sum" | "avg" | "min" | "max" | "count";

export interface GridRowAggregationArgs {
  rows: GridRow[];
  column: GridColumn;
  columnKey: string;
}

export type GridRowAggregationFn = (
  args: GridRowAggregationArgs
) => CellValue | null | undefined;

export interface GridRowGroupingColumnConfig {
  key: string;
  label?: string;
  formatter?: (value: any, context: { rows: GridRow[]; column: GridColumn; level: number; path: string }) => string;
}

export interface GridRowGroupingOptions {
  columns: GridRowGroupingColumnConfig[];
  aggregations?: Record<
    string,
    GridRowAggregationKind | GridRowAggregationFn
  >;
  defaultExpanded?: boolean;
  groupColumnKey?: string;
}

export interface GridRowGroupingRowMoveEvent {
  rowIds: (string | number)[];
  sourcePath?: string;
  targetPath: string;
  targetValues: GridRowGroupingValueMeta[];
  targetLevel: number;
  dropPosition: "before" | "after";
  dropOverRowId?: string | number;
  targetGroupRowIds?: (string | number)[];
}

export interface GridRowGroupingGroupReorderEvent {
  sourcePath: string;
  targetPath: string;
  level: number;
  position: "before" | "after";
  sourceValues?: GridRowGroupingValueMeta[];
  targetValues?: GridRowGroupingValueMeta[];
  sourceGroupRowIds?: (string | number)[];
  targetGroupRowIds?: (string | number)[];
}

/* ======================================================
   FEATURE-GROUPED PROPS
   (matches your folders: columns, edit, filter, formula, pagination, pin,
    reorder, resize, scroll, selection, sort, span, styling/theme, virtual)
   ====================================================== */

/** CORE / DATA */
export interface GridDataProps {
  rows: GridRow[];
  columns: GridColumnDef[];
}

/** LAYOUT / STYLING (container) */
export interface GridLayoutProps {
  width: number;
  height: number;
  rowHeight?: number; // default 32
  headerHeight?: number; // default 40
  stickyHeader?: boolean; // default true
  className?: string;
  style?: CSSProperties;
}

/** THEME / ICONS */
export interface GridThemeProps {
  theme?: GridThemeInput;
  /** Override built-in icons (column unpin icon uses `pinClear`). */
  icons?: Partial<GridIconSetInput>;
  /**
   * Scoped selector overrides emitted with `!important`.
   * Useful when you need to override internal inline styles.
   */
  inlineStyleOverrides?: GridThemeInlineStyleOverrides;
}

/** COLUMNS (width map etc.) */
export type GridSystemColumnId =
  | "rowIndex"
  | "rowDetail"
  | "rowPinning"
  | "rowOrdering"
  | "rowSelection";

export interface GridSystemColumnLayoutOptions {
  /**
   * Sort order among enabled system columns.
   * Lower numbers render earlier. Defaults preserve current built-in order.
   */
  order?: number;
  /**
   * When `true`, stacks in the pinned-left system column strip before regular columns.
   * When `false`, renders at the start of the center columns.
   * Defaults to `true` for backward compatibility.
   */
  pinned?: boolean;
  /**
   * Optional explicit width for this system column.
   * When omitted, built-in defaults are used (theme-adjusted where applicable).
   */
  width?: number;
}

export type GridSystemColumnsConfig = Partial<
  Record<GridSystemColumnId, GridSystemColumnLayoutOptions>
>;

export interface GridColumnsProps {
  columnWidths: Record<string, number>;
  /**
   * Grow data columns when their measured width total is smaller than the grid
   * layout width, keeping header and body columns flush with the parent.
   */
  fillWidth?: boolean;
  /** Ordering/pinning for built-in system columns (row index/select/reorder/etc). */
  systemColumns?: GridSystemColumnsConfig;
}

export interface GridColumnGroupToggleEvent {
  groupId: string;
  open: boolean;
}

export interface GridColumnGroupingProps {
  onColumnGroupToggled?: (event: GridColumnGroupToggleEvent) => void;
}

/** ROWS (per-row heights map) */
export interface GridRowsProps {
  rowHeights?: Record<string | number, number>;
}

/** Spreadsheet-style keyed headers (row/column labels) */
export interface GridKeyedHeaderColumnOptions {
  enabled?: boolean;
  /** Show the coordinate label and the original header title together, e.g. `A : Date`. */
  annotate?: boolean;
  label?: (args: {
    column: GridColumn;
    index: number;
    defaultLabel: string;
  }) => ReactNode;
}

export interface GridKeyedHeaderRowOptions {
  enabled?: boolean;
  /** Show the keyed row label and the original row label together when they differ. */
  annotate?: boolean;
  /** Width of the row-key column (default uses system width). */
  width?: number;
  /** Header label for the row-key column (top-left cell). */
  headerLabel?: ReactNode;
  label?: (args: {
    row: GridRow;
    rowIndex: number;
    visualIndex: number;
    defaultLabel: string;
  }) => ReactNode;
}

export interface GridKeyedHeadersProps {
  enabled?: boolean;
  columns?: GridKeyedHeaderColumnOptions;
  rows?: GridKeyedHeaderRowOptions;
}

/** VIRTUALIZATION */
export interface GridVirtualProps {
  enableVirtualization?: boolean;
  enableHorizontalVirtualization?: boolean;
  /** Defers heavy inner cell content until visible. Disabled by default. */
  enableCellContentVirtualization?: boolean;
  /** Extra vertical pixels rendered before and after the visible row window. */
  rowBufferPx?: number;
  /** Extra horizontal pixels rendered before and after the visible column window. */
  columnBufferPx?: number;
}

/** FORMULA BAR */
export type GridFormulaReferenceMode = "positional" | "keyed";

export interface GridFormulaProps {
  enableFormulaBar?: boolean; // default true
  /** How formula references resolve when rows/columns move. */
  formulaReferenceMode?: GridFormulaReferenceMode;
}

/** SELECTION (cell/row/column selection + events) */
export interface GridSelectionProps {
  selection?: GridSelection | null;
  enableCellSelection?: boolean; // default true
  isRowSelection?: boolean; // default true
  isColSelection?: boolean; // default true
  /**
   * Group row checkbox behavior for client-side grouped rows.
   * - `self`: toggles only the group row itself.
   * - `descendants` / `filteredDescendants`: toggles descendant rows.
   * Defaults to `descendants` for backward compatibility.
   */
  groupSelects?: GridServerRowModelGroupSelects;
  selectEntireRowOnSelection?: boolean;
  selectEntireColumnOnSelection?: boolean;
  /** Header/checkbox row->cell overlay behavior. Default: `range`. */
  rowCellSelectionMode?: GridHeaderCellSelectionMode;
  /** Header/checkbox column->cell overlay behavior. Default: `range`. */
  columnCellSelectionMode?: GridHeaderCellSelectionMode;
  /** Expand row-based cell overlay to merged spans. Default: true. */
  rowCellSelectionIncludeSpans?: boolean;
  /** Expand column-based cell overlay to merged spans. Default: true. */
  columnCellSelectionIncludeSpans?: boolean;
  fillHandle?: GridFillHandleOptions;

  onSelectionRangeChange?: (selection: GridSelection | null) => void;
  onSelectionChange?: (selection: GridSelection) => void; // convenience
  /**
   * Fired with explicit selected row ids.
   * In SSRM selection-state mode, this contains currently loaded selected ids.
   */
  onRowSelectionChange?: (
    selectedRowIds: (string | number)[],
    meta?: GridRowSelectionChangeMeta
  ) => void;
  onColumnSelectionChange?: (
    selectedColumnKeys: string[],
    meta?: GridColumnSelectionChangeMeta
  ) => void;

  onCellClick?: (
    rowIndex: number,
    colIndex: number,
    event: ReactMouseEvent
  ) => void;
  onCellDoubleClick?: (
    rowIndex: number,
    colIndex: number,
    cellElement?: HTMLElement
  ) => void;
}

export interface GridClipboardRangeContext {
  selection: GridSelection | null;
  rowIds: (string | number)[];
  columnKeys: string[];
  rowIndices: number[];
  columnIndices: number[];
}

export interface GridClipboardProps {
  enabled?: boolean;
  enableKeyboardShortcuts?: boolean;
  onCopy?: (context: GridClipboardRangeContext) => void | Promise<void>;
  onCut?: (context: GridClipboardRangeContext) => void | Promise<void>;
  onPaste?: (context: GridClipboardRangeContext) => void | Promise<void>;
}

export type GridFillHandleIconRenderer =
  | ReactNode
  | ((props: { className?: string; isDragging?: boolean }) => ReactNode);

export interface GridFillHandleOptions {
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
  icon?: GridFillHandleIconRenderer;
  iconClassName?: string;
  iconStyle?: CSSProperties;
}

/** EDIT (cell & row editing callbacks) */
export interface GridEditProps {
  isCellEditing?: boolean; // default true
  onCellChange?: (
    rowId: string | number,
    columnKey: string,
    value: CellValue
  ) => void;

  /**
   * Apply/clear background fill for the current selection (or an override range)
   * when `token` changes. This triggers `onCellChange` for each targeted cell.
   * Client row model only (SSRM is ignored).
   */
  applySelectionFillRequest?: {
    token: number;
    color: string | null;
    selection?: GridSelection | null;
  };

  /** Optional higher-level row ops */
  onRowAdd?: () => void;
  onRowDelete?: (rowIds: (string | number)[]) => void;
}

/** VALIDATION */
export type GridValidationSeverity = "error" | "warning" | "info";
export type GridValidationMode = "block" | "allow";
export type GridValidationTrigger = "commit" | "change" | "manual";
export type GridValidationIndicator = "dot" | "corner" | "bar" | "none";

export interface GridValidationContext {
  value: any;
  row: GridRow;
  column: GridColumn;
  rowIndex: number;
  columnIndex: number;
  rowId: string | number;
  columnKey: string;
}

export interface GridValidationResult {
  severity?: GridValidationSeverity;
  message?: string;
  code?: string;
  ruleId?: string;
  ruleName?: string;
}

export interface GridValidationRuleBase {
  id?: string;
  name?: string;
  severity?: GridValidationSeverity;
  message?: string | ((ctx: GridValidationContext) => string);
  when?: (ctx: GridValidationContext) => boolean;
  allowEmpty?: boolean;
  columns?: string[];
  rows?: Array<string | number>;
  rowIndexRange?: { start: number; end: number };
}

export type GridValidationRule =
  | (GridValidationRuleBase & {
      type: "required";
    })
  | (GridValidationRuleBase & {
      type: "number";
    })
  | (GridValidationRuleBase & {
      type: "min";
      min: number;
      inclusive?: boolean;
    })
  | (GridValidationRuleBase & {
      type: "max";
      max: number;
      inclusive?: boolean;
    })
  | (GridValidationRuleBase & {
      type: "between";
      min: number;
      max: number;
      inclusive?: boolean;
    })
  | (GridValidationRuleBase & {
      type: "length";
      min?: number;
      max?: number;
    })
  | (GridValidationRuleBase & {
      type: "regex";
      pattern: RegExp | string;
      flags?: string;
    })
  | (GridValidationRuleBase & {
      type: "inList";
      values: Array<string | number | boolean>;
      caseSensitive?: boolean;
      allowOther?: boolean;
    })
  | (GridValidationRuleBase & {
      type: "custom";
      validate: (
        ctx: GridValidationContext
      ) =>
        | GridValidationResult
        | GridValidationResult[]
        | boolean
        | string
        | null
        | undefined;
    })
  | (GridValidationRuleBase & {
      type: "async";
      validateAsync: (
        ctx: GridValidationContext
      ) =>
        | Promise<
            | GridValidationResult
            | GridValidationResult[]
            | boolean
            | string
            | null
            | undefined
          >;
    });

export interface GridValidationCellState {
  valid: boolean;
  severity?: GridValidationSeverity;
  message?: string;
  results: GridValidationResult[];
  pending?: boolean;
}

export interface GridValidationChange {
  rowId: string | number;
  columnKey: string;
  rowIndex: number;
  columnIndex: number;
  state: GridValidationCellState | null;
}

export interface GridValidationProps {
  enabled?: boolean;
  mode?: GridValidationMode;
  /** When to validate during edit. */
  validateOn?: GridValidationTrigger;
  /** Debounce live validation on change in ms. */
  validateDebounceMs?: number;
  /** Validate only visible rows when the viewport changes. */
  validateOnVisibleChange?: boolean;
  /** When validating visible rows, replace the validation map with only visible rows. */
  validateVisibleOnly?: boolean;
  /** Debounce visible-row validation in ms. */
  validateVisibleDebounceMs?: number;
  /** Trigger a full validateAll run when this token changes. */
  validateAllToken?: number;
  rules?: GridValidationRule[];
  columnRules?: Record<string, GridValidationRule | GridValidationRule[]>;
  ruleResolver?: (
    ctx: GridValidationContext
  ) => GridValidationRule[] | null | undefined;
  ruleResolverByColumn?: Record<
    string,
    (ctx: GridValidationContext) => GridValidationRule[] | null | undefined
  >;
  /** Validation indicator style. */
  indicator?: GridValidationIndicator;
  /** Show validation tooltip. */
  tooltip?: boolean;
  /** Highlight invalid cells. */
  highlightErrors?: boolean;
  /** Highlight warning cells. */
  highlightWarnings?: boolean;
  /** Highlight info-level cells. */
  highlightInfo?: boolean;
  onValidationChange?: (change: GridValidationChange) => void;
}

/** FILTER */
export interface GridColumnFilterPanelRendererArgs {
  column: GridColumn;
  currentFilter?: GridFilterConfig;
  uniqueValues: any[];
  hasBlanks: boolean;
  enableAdvancedMultiFilter: boolean;
  onFilterChange: (filter: GridFilterConfig | null) => void;
  onClose: () => void;
  renderDefault: () => ReactNode;
}

export interface GridFloatingFilterCellRendererArgs {
  column: GridColumn;
  width: number;
  height: number;
  isPinned: boolean;
  filter?: GridFilterConfig;
  onFilter?: (columnKey: string, filter: GridFilterConfig | null) => void;
  rows: GridRow[];
  rowsRevision: number;
  debounceMs?: number;
  renderDefault: () => ReactNode;
}

export interface GridFilterProps {
  filterMode?: "client" | "server"; // default "client"
  activeFilters?: GridFilterConfig[];
  onFilter?: (columnKey: string, filter: GridFilterConfig | null) => void;
  /** Server-side hook (if filterMode === "server") */
  onServerFilter?: (filters: Record<string, any>) => Promise<GridRow[]>;
  /** Show floating filter row under headers. */
  enableFloatingFilters?: boolean;
  /** Height of floating filter row in px. */
  floatingFilterHeight?: number;
  /** Debounce floating filter input changes in ms. */
  floatingFilterDebounceMs?: number;
  /** Enable advanced multi-filter UI (stacked blocks). */
  enableAdvancedMultiFilter?: boolean;
  /** Override column filter panel renderer for header filter popovers. */
  renderColumnFilterPanel?: (
    args: GridColumnFilterPanelRendererArgs
  ) => ReactNode;
  /** Override floating filter row cell renderer. */
  renderFloatingFilterCell?: (
    args: GridFloatingFilterCellRendererArgs
  ) => ReactNode;
}

/** SEARCH */
export type GridSearchMode = "highlight" | "filter";

export interface GridSearchMatch {
  rowId: string | number;
  rowIndex: number;
  columnKey: string;
  columnIndex: number;
  text: string;
}

export interface GridSearchProps {
  /** Search query string. */
  query?: string;
  /** Enable/disable search. */
  enabled?: boolean;
  /** Highlight only or filter rows to matching results. */
  mode?: GridSearchMode;
  /** Match case (default false). */
  caseSensitive?: boolean;
  /** Match whole words only (default false). */
  wholeWord?: boolean;
  /** Highlight matches inside cell text (default true). */
  highlight?: boolean;
  /** Override highlight className for <mark> tags. */
  highlightClassName?: string;
  /** Override highlight style for <mark> tags. */
  highlightStyle?: CSSProperties;
  /** Override active-match highlight className for the currently navigated hit. */
  activeHighlightClassName?: string;
  /** Override active-match highlight style for the currently navigated hit. */
  activeHighlightStyle?: CSSProperties;
  /** Limit search to specific column keys. */
  columns?: string[];
  /** Active match index for search navigation. */
  activeMatchIndex?: number;
  /** Called when the active match changes (navigation). */
  onActiveMatchChange?: (
    match: GridSearchMatch | null,
    meta: { index: number; total: number }
  ) => void;
  /** Called when search result count changes. */
  onResultsCountChange?: (count: number) => void;
}

/** SORT */
export interface GridSortProps {
  sortMode?: "client" | "server"; // default "client"
  sortColumn?: string | null;
  sortDirection?: SortDirection | null;
  sortModel?: GridSortModel;
  enableMultiSort?: boolean;
  onSort?: (columnKey: string, direction: SortDirection) => void;
  onSortModelChange?: (model: GridSortModel) => void;
  multiSortKey?: "shift" | "meta" | "ctrl" | "alt" | "none";
  /** Server-side hook (if sortMode === "server") */
  onServerSort?: (
    columnKey: string,
    direction: SortDirection
  ) => Promise<GridRow[]>;
}

/** PIN (rows & columns) */
export type GridRowPinCellRenderArgs = {
  row: GridRow;
  rowId: string | number;
  style: CSSProperties;
  pinnedRows: { top: (string | number)[]; bottom: (string | number)[] };
  onPinRow?: (rowId: string | number, side: PinRowSide | null) => void;
  rowHasSpans: (rowId: string | number) => boolean;
  isPinnedTop: boolean;
  isPinnedBottom: boolean;
  isBlocked: boolean;
  renderDefault: () => ReactNode;
};

export interface GridPinProps {
  isRowPinning?: boolean; // default true
  isColPinning?: boolean; // default true
  pinnedColumns?: GridPinnedColumns;
  pinnedRows?: GridPinnedRows;

  onPinColumn?: (columnKey: string, side: PinColumnSide | null) => void;
  onPinColumnAtPosition?: (
    columnKey: string,
    side: PinColumnSide,
    index: number
  ) => void;
  onPinAndPositionColumn?: (
    columnKey: string,
    targetKey: string,
    side: PinColumnSide,
    position: "before" | "after"
  ) => void;
  onPinnedColumnReorder?: (
    columnKey: string,
    targetKey: string,
    side: PinColumnSide,
    position: "before" | "after"
  ) => void;

  onPinRow?: (rowId: string | number, side: PinRowSide | null) => void;
  onPinRowAtPosition?: (
    rowId: string | number,
    side: PinRowSide,
    index: number
  ) => void;
  onPinMultipleRowsAtPosition?: (
    operations: Array<{
      rowId: string | number;
      side: PinRowSide;
      index: number;
    }>
  ) => void;
  onPinAndPositionRow?: (
    rowId: string | number,
    targetRowId: string | number,
    side: PinRowSide,
    position: "before" | "after"
  ) => void;
  onPinnedRowReorder?: (
    rowId: string | number,
    targetRowId: string | number,
    side: PinRowSide,
    position: "before" | "after"
  ) => void;
  onReorderMultiplePinnedRows?: (
    rowIds: (string | number)[],
    targetRowId: string | number,
    side: PinRowSide,
    position: "before" | "after"
  ) => void;
  /** Full renderer override for the dedicated row pinning system cell. */
  renderRowPinCell?: (args: GridRowPinCellRenderArgs) => ReactNode;
}

/** REORDER (DnD) */
export interface GridRowDragPayload {
  rowIds: (string | number)[];
  rows: GridRow[];
  sourceId?: string;
}

export interface GridRowExternalDropEvent {
  payload: GridRowDragPayload;
  targetRowId: string | number;
  targetIndex: number;
  position: "before" | "after";
  targetSection: "top" | "bottom" | "center";
}

export type GridReorderMode = "view" | "data";

export interface GridReorderProps {
  isColReorder?: boolean; // default true
  isRowReorder?: boolean; // default true
  /** How column reordering should be interpreted for formula references. */
  columnReorderMode?: GridReorderMode;
  /** How row reordering should be interpreted for formula references. */
  rowReorderMode?: GridReorderMode;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  onMultiRowReorder?: (
    rowIds: (string | number)[],
    targetIndex: number,
    position: "before" | "after"
  ) => void;
  onMultiColumnReorder?: (
    columnKeys: string[],
    targetKey: string,
    position: "before" | "after"
  ) => void;
  onUpdateColumnOrder?: (order: string[]) => void;
  onColumnGroupsChange?: (defs: GridColumnDef[]) => void;
  rowDragSourceId?: string;
  onRowExternalDrop?: (event: GridRowExternalDropEvent) => void;
}

/** RESIZE */
export type GridResizeMode = "immediate" | "deferred";

export interface GridResizeProps {
  enableColumnResize?: boolean; // default true
  enableRowResize?: boolean; // default true
  onColumnResize?: (columnKey: string, width: number) => void;
  onRowResize?: (rowId: string | number, height: number) => void;
  /** Immediate or deferred commit behaviour for resize drag. */
  mode?: GridResizeMode;
  /** Pixel step for column resizing (0 disables snapping). */
  quantize?: number;
  /** Pixel step for row resizing (0 disables snapping). */
  heightStep?: number;
  /** Throttle mode for column resize commits. */
  columnResizeThrottle?: "raf" | "none";
  /** Throttle mode for row resize commits. */
  rowResizeThrottle?: "raf" | "none";
  /**
   * When true, row and column size changes are only committed once the user
   * releases the resize handle. This reduces reflow churn for very large grids.
   */
  performanceMode?: boolean;
}

/** SPAN / MERGE */
export type GridSpanRowIdMergeMode = "expand" | "split" | "compact";

export interface GridSpanProps {
  /** Initial merged regions shown when spanning is enabled. */
  initialMergedCells?: GridMergedCell[];
  /** Fired whenever merge / unmerge interactions change the merged regions. */
  onMergedCellsChange?: (mergedCells: GridMergedCell[]) => void;
  /** Enable/disable spanning at the Grid level */
  enableCellSpanning?: boolean;
  /** How rowId-based merges behave when rows become non-contiguous in view. */
  rowIdMergeMode?: GridSpanRowIdMergeMode;
}

/** SPARKLINE */
export type GridSparklineType =
  | "line"
  | "area"
  | "bar"
  | "column"
  | "stackedColumn"
  | "stackedBar"
  | "histogram"
  | "heatmap"
  | "box"
  | "violin"
  | "waterfall"
  | "bullet"
  | "candlestick"
  | "pie"
  | "donut"
  | "scatter"
  | "bubble"
  | "winLoss";

export type GridSparklineXValue =
  | number
  | string
  | Date
  | { toString(): string };

export type GridSparklineTuple = [GridSparklineXValue, number | null];

export type GridSparklineObjectDatum = {
  [key: string]: any;
  x?: GridSparklineXValue;
  y?: number | null;
  value?: number | null;
  size?: number | null;
  z?: number | null;
  r?: number | null;
  values?: any[];
  stack?: any[];
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  target?: number | null;
  ranges?: number[];
  color?: string;
  label?: string;
};

export type GridSparklineDatum =
  | number
  | null
  | GridSparklineTuple
  | GridSparklineObjectDatum;

export type GridSparklineData = GridSparklineDatum[];

export type GridSparklinePadding =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };

export interface GridSparklineAxisOptions {
  type?: "number" | "time" | "category";
  show?: boolean;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  baseline?: number;
}

export interface GridSparklineMarkerOptions {
  enabled?: boolean;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  itemStyler?: GridSparklineMarkerStyler;
}

export interface GridSparklineHighlightOptions {
  min?: string;
  max?: string;
  first?: string;
  last?: string;
}

export interface GridSparklineBarOptions {
  gap?: number;
  radius?: number;
  minSize?: number;
}

export type GridSparklineValueFormatter = (
  value: number | null,
  args: { index: number; data: (number | null)[] }
) => string;

export type GridSparklineValueLabelFormatter = (
  value: number | null,
  context: GridSparklineTooltipContext
) => string;

export interface GridSparklineValueLabelOptions {
  enabled?: boolean;
  formatter?: GridSparklineValueLabelFormatter;
  mode?: "last" | "all";
  position?: "left" | "center" | "right";
  offset?: number;
  className?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export interface GridSparklineTooltipContext {
  data: (number | null)[];
  min: number | null;
  max: number | null;
  first: number | null;
  last: number | null;
  sum: number;
  avg: number | null;
}

export interface GridSparklinePointStylerParams {
  xValue?: unknown;
  yValue: number | null;
  datum?: unknown;
  pointIndex: number;
  first: boolean;
  last: boolean;
  min: boolean;
  max: boolean;
  highlighted: boolean;
}

export interface GridSparklineMarkerStyle {
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type GridSparklineMarkerStyler = (
  params: GridSparklinePointStylerParams
) => GridSparklineMarkerStyle | null | undefined;

export interface GridSparklineItemStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type GridSparklineItemStyler = (
  params: GridSparklinePointStylerParams
) => GridSparklineItemStyle | null | undefined;

export interface GridSparklineTooltipRendererContext {
  row?: GridRow;
  data?: Record<string, CellValue>;
  column?: GridColumn;
}

export interface GridSparklineTooltipRendererArgs {
  xValue?: unknown;
  yValue: number | null;
  datum?: unknown;
  pointIndex: number;
  context: GridSparklineTooltipRendererContext;
}

export type GridSparklineTooltipRendererResult =
  | string
  | {
      title?: string;
      content?: string;
    }
  | null
  | undefined;

export type GridSparklineTooltipRenderer = (
  args: GridSparklineTooltipRendererArgs
) => GridSparklineTooltipRendererResult;

export type GridSparklineTooltipFormatter = (
  args: GridSparklineTooltipContext
) => string;

export interface GridSparklineTooltipOptions {
  enabled?: boolean;
  formatter?: GridSparklineTooltipFormatter;
  renderer?: GridSparklineTooltipRenderer;
  className?: string;
}

export interface GridSparklineOptions {
  type?: GridSparklineType;
  scaleMode?: "stretch" | "fit" | "cover";
  padding?: GridSparklinePadding;
  xKey?: string;
  yKey?: string;
  valueField?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
  axis?: GridSparklineAxisOptions;
  marker?: GridSparklineMarkerOptions;
  highlight?: GridSparklineHighlightOptions;
  bar?: GridSparklineBarOptions;
  itemStyler?: GridSparklineItemStyler;
  colors?: {
    positive?: string;
    negative?: string;
    zero?: string;
  };
  domain?: {
    min?: number;
    max?: number;
  };
  baseline?: number;
  valueLabel?: GridSparklineValueLabelOptions;
  valueFormatter?: GridSparklineValueFormatter;
  tooltip?: GridSparklineTooltipOptions;
  chartOptions?: GridChartOptions;
  viewer?: GridSparklineViewerOptions;
}

export interface GridSparklineViewerOptions {
  enabled?: boolean;
  openOnClick?: boolean;
  chartTypes?: GridChartType[];
  defaultChartType?: GridChartType;
  panel?: GridChartPanelOptions;
  controls?: GridChartControlsOptions;
  zoom?: GridChartZoomOptions;
  options?: GridChartOptions;
  getOptions?: (model: GridChartModel) => GridChartOptions;
  title?: string;
  subtitle?: string;
}

export interface GridSparklineProps {
  enabled?: boolean;
  defaultOptions?: GridSparklineOptions;
}

/** INTEGRATED CHARTS */
export type GridChartType =
  | "line"
  | "area"
  | "column"
  | "bar"
  | "stackedColumn"
  | "stackedBar"
  | "histogram"
  | "heatmap"
  | "box"
  | "violin"
  | "waterfall"
  | "bullet"
  | "candlestick"
  | "pie"
  | "donut"
  | "scatter"
  | "bubble"
  // Allow custom chart types while preserving literal autocomplete for built-ins.
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export type GridChartSeriesBy = "columns" | "rows";

export type GridChartCategory = string | number | Date;

export type GridChartCategoryAggregation =
  | "none"
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count"
  | "median"
  | "p95";

export type GridChartScatterCategoryMode = "raw" | "aggregate";
export type GridChartUniqueCategoryMode = "aggregate" | "raw";

export type GridChartNormalizationMode = "none" | "minmax" | "zscore" | "percent";

export type GridChartSamplingMode = "none" | "top" | "random" | "stratified";

export type GridChartMissingValueMode = "keep" | "zero" | "exclude";

export type GridChartTimeBucket = "none" | "hour" | "day" | "week" | "month";

export type GridChartAxisScale = "linear" | "log" | "symlog";

export interface GridChartSamplingOptions {
  mode?: GridChartSamplingMode;
  size?: number;
  seed?: number;
  columnKey?: string;
}

export interface GridChartSettings {
  autoSortCategories?: boolean;
  uniqueCategories?: boolean;
  uniqueCategoryMode?: GridChartUniqueCategoryMode;
  categoryAggregation?: GridChartCategoryAggregation;
  scatterCategoryMode?: GridChartScatterCategoryMode;
  normalization?: GridChartNormalizationMode;
  sampling?: GridChartSamplingOptions;
  missingValueMode?: GridChartMissingValueMode;
  timeBucket?: GridChartTimeBucket;
  options?: GridChartOptions;
}

export interface GridChartDatum {
  x: GridChartCategory;
  y: number | null;
  size?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  target?: number | null;
  ranges?: number[];
  raw?: unknown;
  rowIds?: (string | number)[];
}

export interface GridChartSeries {
  id: string;
  name: string;
  color?: string;
  data: GridChartDatum[];
}

export interface GridChartAxisOptions {
  type?: "category" | "number" | "time";
  scale?: GridChartAxisScale;
  show?: boolean;
  grid?: boolean;
  tickCount?: number;
  showAllTicks?: boolean;
  autoFitTicks?: boolean;
  pin?: boolean;
  min?: number;
  max?: number;
  formatter?: (value: GridChartCategory | number) => string;
}

export interface GridChartZoomOptions {
  enabled?: boolean;
  height?: number;
  previewHeight?: number;
  minSpan?: number;
  initialRange?: { start?: number; end?: number };
  showPreview?: boolean;
}

export interface GridChartLegendOptions {
  show?: boolean;
  position?: "top" | "bottom" | "left" | "right";
}

export interface GridChartTooltipRendererArgs {
  series: GridChartSeries;
  datum: GridChartDatum;
  datumIndex: number;
}

export type GridChartTooltipRenderer = (
  args: GridChartTooltipRendererArgs
) => ReactNode;

export interface GridChartTooltipOptions {
  enabled?: boolean;
  renderer?: GridChartTooltipRenderer;
  className?: string;
}

export interface GridChartSeriesStyleOptions {
  strokeWidth?: number;
  areaOpacity?: number;
  markerSize?: number;
  barRadius?: number;
  barPadding?: number;
}

export interface GridChartPieOptions {
  innerRadius?: number;
  labelPosition?: "inside" | "outside" | "none";
}

export interface GridChartHistogramOptions {
  bins?: number;
  min?: number;
  max?: number;
}

export interface GridChartHeatmapOptions {
  min?: number;
  max?: number;
  color?: string;
  minOpacity?: number;
  maxOpacity?: number;
  gap?: number;
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
  showValues?: boolean;
  valueFormatter?: (
    value: number | null,
    context: { series: GridChartSeries; datum: GridChartDatum }
  ) => string;
  textColor?: string;
  missingColor?: string;
  missingOpacity?: number;
}

export interface GridChartBoxPlotOptions {
  boxWidth?: number;
  fillOpacity?: number;
  stroke?: string;
  fill?: string;
  medianStroke?: string;
  whiskerStroke?: string;
  whiskerFactor?: number;
  outlierSize?: number;
  showOutliers?: boolean;
}

export interface GridChartViolinOptions {
  bins?: number;
  maxWidth?: number;
  fillOpacity?: number;
  stroke?: string;
  showMedian?: boolean;
}

export interface GridChartWaterfallOptions {
  risingColor?: string;
  fallingColor?: string;
  connectorColor?: string;
  barWidth?: number;
}

export interface GridChartBulletOptions {
  rangeColors?: string[];
  rangeOpacity?: number;
  barColor?: string;
  targetColor?: string;
  targetWidth?: number;
  barHeightRatio?: number;
}

export interface GridChartCandlestickOptions {
  upColor?: string;
  downColor?: string;
  wickColor?: string;
  bodyWidth?: number;
}

export type GridChartIconRenderer =
  | ReactNode
  | ((props: { className?: string; isDragging?: boolean }) => ReactNode);

export interface GridChartDownloadActionOptions {
  enabled?: boolean;
  label?: ReactNode;
  icon?: GridChartIconRenderer;
  filename?: string | ((model: GridChartModel) => string);
  format?: "png" | "svg" | "json" | "csv";
}

export interface GridChartBrushActionOptions {
  enabled?: boolean;
  label?: ReactNode;
  icon?: GridChartIconRenderer;
  onApply?: (rowIds: (string | number)[], model: GridChartModel) => void;
  clearBrush?: boolean;
}

export interface GridChartSettingsPanelOptions {
  enabled?: boolean;
  defaultOpen?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface GridChartControlsOptions {
  showTypeSelector?: boolean;
  showSeriesBy?: boolean;
  seriesByOptions?: GridChartSeriesBy[];
  showGroupBy?: boolean;
  showMappingSummary?: boolean;
  showDragHandle?: boolean;
  showMaximizeButton?: boolean;
  showResizeButton?: boolean;
  showCloseButton?: boolean;
  enableBrushSelection?: boolean;
  brushSelectionModifier?: "none" | "shift" | "alt" | "meta";
  className?: string;
  style?: CSSProperties;
  actionClassName?: string;
  actionStyle?: CSSProperties;
  downloadAction?: GridChartDownloadActionOptions;
  downloadActions?: GridChartDownloadActionOptions[];
  brushActions?: GridChartBrushActionOptions[];
  settingsPanel?: GridChartSettingsPanelOptions;
  icons?: {
    drag?: GridChartIconRenderer;
    maximize?: GridChartIconRenderer;
    resize?: GridChartIconRenderer;
    close?: GridChartIconRenderer;
    settings?: GridChartIconRenderer;
  };
}

export interface GridChartOptions {
  background?: string;
  plotBackground?: string;
  palette?: string[];
  axis?: {
    x?: GridChartAxisOptions;
    y?: GridChartAxisOptions;
  };
  legend?: GridChartLegendOptions;
  tooltip?: GridChartTooltipOptions;
  series?: GridChartSeriesStyleOptions;
  pie?: GridChartPieOptions;
  histogram?: GridChartHistogramOptions;
  heatmap?: GridChartHeatmapOptions;
  boxPlot?: GridChartBoxPlotOptions;
  violin?: GridChartViolinOptions;
  waterfall?: GridChartWaterfallOptions;
  bullet?: GridChartBulletOptions;
  candlestick?: GridChartCandlestickOptions;
}

export interface GridChartPanelOptions {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  position?: "floating" | "right" | "bottom";
  anchor?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  offset?: { x?: number; y?: number };
  /** Defaults to `false`. Set `true` to dock the chart panel using `position`. */
  pinned?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface GridChartCreateMenuOptions {
  enabled?: boolean;
  label?: ReactNode;
  icon?: ReactNode;
  position?: "top" | "bottom";
}

export interface GridChartModel {
  id: string;
  type: GridChartType;
  seriesBy: GridChartSeriesBy;
  categories: GridChartCategory[];
  series: GridChartSeries[];
  selection: GridSelection;
  rowIds: (string | number)[];
  columnKeys: string[];
  groupByKey?: string;
  title?: string;
  subtitle?: string;
  meta?: GridChartModelMeta;
}

export interface GridChartModelMeta {
  categoryColumnKey?: string;
  categoryColumnLabel?: string;
  categoryColumnType?: ColumnDataType;
  numericColumnKeys?: string[];
  numericColumnLabels?: string[];
  numericColumnTypes?: ColumnDataType[];
  groupByKey?: string;
  groupByLabel?: string;
  uniqueCategories?: boolean;
  uniqueCategoryMode?: GridChartUniqueCategoryMode;
  aggregation?: GridChartCategoryAggregation;
  aggregationResolved?: GridChartCategoryAggregation;
  normalization?: GridChartNormalizationMode;
  sampling?: GridChartSamplingOptions;
  missingValueMode?: GridChartMissingValueMode;
  timeBucket?: GridChartTimeBucket;
  timeRange?: { start: number; end: number };
  rowCount?: number;
  columnCount?: number;
  pointCount?: number;
  missingCount?: number;
  invalidCount?: number;
  filteredCount?: number;
}

export interface GridChartBuildContext {
  rows: GridRow[];
  columns: GridColumn[];
  selection: GridSelection;
  visualRowOrder: number[];
  chartType: GridChartType;
  seriesBy: GridChartSeriesBy;
  groupByKey?: string;
}

export type GridChartValueParser = (
  value: unknown,
  context: { row: GridRow; column: GridColumn }
) => number | null;

export type GridChartCategoryParser = (
  value: unknown,
  context: { row: GridRow; column: GridColumn | null; rowIndex: number }
) => GridChartCategory;

export interface GridChartRenderProps {
  model: GridChartModel;
  options: GridChartOptions;
  width: number;
  height: number;
}

export interface GridChartsProps {
  enabled?: boolean;
  autoCreate?: boolean;
  autoUpdate?: boolean;
  autoUpdateSelection?: boolean;
  autoDetectChartType?: boolean;
  autoSortCategories?: boolean;
  uniqueCategories?: boolean;
  uniqueCategoryMode?: GridChartUniqueCategoryMode;
  categoryAggregation?: GridChartCategoryAggregation;
  scatterCategoryMode?: GridChartScatterCategoryMode;
  normalization?: GridChartNormalizationMode;
  sampling?: GridChartSamplingOptions;
  missingValueMode?: GridChartMissingValueMode;
  timeBucket?: GridChartTimeBucket;
  initialBrushRowIds?: (string | number)[];
  createChartMenu?: GridChartCreateMenuOptions;
  controls?: GridChartControlsOptions;
  defaultChartType?: GridChartType;
  chartTypes?: GridChartType[];
  seriesBy?: GridChartSeriesBy;
  panel?: GridChartPanelOptions;
  zoom?: GridChartZoomOptions;
  options?: GridChartOptions;
  getOptions?: (model: GridChartModel) => GridChartOptions;
  valueParser?: GridChartValueParser;
  categoryParser?: GridChartCategoryParser;
  renderChart?: (props: GridChartRenderProps) => ReactNode;
  onChartCreate?: (chart: GridChartModel) => void;
  onChartUpdate?: (chart: GridChartModel) => void;
  onChartClose?: (chartId: string) => void;
  onBrushSelection?: (rowIds: (string | number)[]) => void;
  onSettingsChange?: (settings: GridChartSettings) => void;
}

/** MASTER / DETAIL */
export type GridMasterDetailToggleRenderArgs = {
  row: GridRow;
  expanded: boolean;
  disabled: boolean;
};

export type GridMasterDetailToggleCellRenderArgs = {
  row: GridRow;
  visible: boolean;
  expanded: boolean;
  disabled: boolean;
  style: CSSProperties;
  onToggle: () => void;
  renderToggleIcon?: (args: GridMasterDetailToggleRenderArgs) => ReactNode;
  renderDefault: () => ReactNode;
};

export type GridMasterDetailDetailRenderArgs = {
  row: GridRow;
  rowIndex: number;
  columns: GridColumn[];
  collapse: () => void;
};

export interface GridMasterDetailProps {
  enabled?: boolean;
  /**
   * Opt-in support for master/detail when SSRM is enabled.
   * Defaults to `false` to preserve existing behavior.
   */
  enableServerRowModel?: boolean;
  /** Uncontrolled mode initial value */
  initialExpandedRowIds?: (string | number)[];
  /** Controlled mode */
  expandedRowIds?: (string | number)[];
  onExpandedRowIdsChange?: (rowIds: (string | number)[]) => void;
  /** Determines which rows can show a detail panel (subject to spanning constraints). */
  isRowMaster?: (row: GridRow) => boolean;
  /** Height of the detail panel when expanded */
  detailRowHeight?: number | ((row: GridRow) => number);
  /** Detail panel content renderer */
  renderDetail?: (args: GridMasterDetailDetailRenderArgs) => ReactNode;
  /** Toggle icon renderer for the dedicated system column */
  renderToggleIcon?: (args: GridMasterDetailToggleRenderArgs) => ReactNode;
  /** Full renderer override for the dedicated system toggle cell. */
  renderToggleCell?: (
    args: GridMasterDetailToggleCellRenderArgs
  ) => ReactNode;
  /** Customize the system column */
  column?: {
    title?: string;
    width?: number;
  };
}

export interface GridRowGroupingProps {
  onToggleGroup?: (path: string, expanded: boolean) => void;
  onCollapseAll?: () => void;
  onExpandAll?: () => void;
  onMoveRowsToGroup?: (event: GridRowGroupingRowMoveEvent) => void;
  onReorderGroups?: (event: GridRowGroupingGroupReorderEvent) => void;
}

/** SCROLL / INFINITE LOADING */
export type GridInfiniteScrollDirection = "top" | "bottom";

export type GridInfiniteScrollMode = "top" | "bottom" | "both";

export type GridInfiniteScrollStrategy = "offset" | "page" | "cursor";

export type GridInfiniteScrollCursorState = {
  /** Cursor token to use for the next forward load request. */
  next?: string | null;
  /** Cursor token to use for the previous/backward load request. */
  prev?: string | null;
};

export type GridInfiniteScrollRequest =
  | {
      strategy: "offset";
      startIndex: number;
      stopIndex: number;
      direction?: GridInfiniteScrollDirection;
    }
  | {
      strategy: "page";
      pageIndex: number;
      pageSize: number;
      direction?: GridInfiniteScrollDirection;
    }
  | {
      strategy: "cursor";
      cursor: string | null;
      limit: number;
      direction?: GridInfiniteScrollDirection;
    };

export type GridInfiniteScrollResult =
  | GridRow[]
  | {
      rows: GridRow[];
      nextCursor?: string | null;
      prevCursor?: string | null;
      hasMoreTop?: boolean;
      hasMoreBottom?: boolean;
    };

export type GridInfiniteScrollLoadMore =
  | ((
      startIndex: number,
      stopIndex: number,
      direction?: GridInfiniteScrollDirection
    ) => Promise<GridInfiniteScrollResult>)
  | ((request: GridInfiniteScrollRequest) => Promise<GridInfiniteScrollResult>);

export interface GridScrollProps {
  /** Enable host-driven infinite loading for the current row window. */
  enableInfiniteScroll?: boolean;
  /** Batch size requested when nearing the edge (default 50). */
  infiniteScrollBatchSize?: number;
  /** Trigger threshold in pixels from the edge (default 240). */
  infiniteScrollThreshold?: number;
  /** Load direction for infinite scroll (default "bottom"). */
  infiniteScrollMode?: GridInfiniteScrollMode;
  /** Request strategy for infinite scroll (default "offset"). */
  infiniteScrollStrategy?: GridInfiniteScrollStrategy;
  /** Start index of the current in-memory window (default 0). */
  infiniteScrollStartIndex?: number;
  /** Optional initial cursor values for cursor-based loading. */
  infiniteScrollInitialCursor?: GridInfiniteScrollCursorState;
  /** Treat each load as a page window instead of appending/prepending. */
  infiniteScrollPaging?: boolean;
  /** Optional loading indicator customization (shown while loading). */
  renderInfiniteScrollLoader?: (args: {
    isLoading: boolean;
    hasMore: boolean;
    direction?: GridInfiniteScrollDirection;
  }) => ReactNode;
  /** Optional loader shown only when loading from the top edge. */
  infiniteScrollTopLoader?: ReactNode;
  /** Optional loader shown only when loading from the bottom edge. */
  infiniteScrollBottomLoader?: ReactNode;
  /** Optional static loading indicator (shown while loading). */
  infiniteScrollLoader?: ReactNode;
  /**
   * Used for server-side infinite loading. For "offset" strategy, called with
   * the next [startIndex, stopIndex] window (inclusive) and optional direction.
   * For "page" or "cursor", it receives a request object.
   * The grid does not mutate rows for you; update your data source and pass new
   * `data.rows` (or use `useGrid().appendRows`/`useGrid().prependRows`).
   */
  loadMoreRows?: GridInfiniteScrollLoadMore;
}

/** SERVER-SIDE ROW MODEL */
export type GridServerRowModelRequest = {
  startRow: number;
  endRow: number;
  /**
   * Optional SSRM route (AG Grid style) for hierarchical child-store requests.
   * When provided, `startRow/endRow` address rows within the route's direct children.
   */
  route?: string[];
  sortModel?: GridSortModel;
  filterModel?: GridFilterConfig[];
  grouping?: GridServerRowModelGroupingRequest;
  treeData?: GridServerRowModelTreeDataRequest;
  pivot?: GridServerRowModelPivotRequest;
  signal?: AbortSignal;
};

export type GridServerRowModelResult = {
  rows: GridRow[];
  rowCount?: number;
  /** Optional last loaded row index (AG Grid style); interpreted as index, not count. */
  lastRow?: number;
  /**
   * Optional pivot field keys produced by the server (AG Grid `pivotResultFields`
   * style). Can be used to build secondary columns client-side.
   */
  pivotResultFields?: string[];
};

/**
 * Internal grid column keys used for built-in system columns.
 * Values intentionally remain stable for backward compatibility.
 */
export const GRID_SYSTEM_COLUMN_KEYS = {
  rowIndex: "__row_index__",
  rowDetail: "__row_detail__",
  rowPinning: "__row_pinning__",
  rowOrdering: "__row_ordering__",
  rowSelection: "__row_selection__",
} as const;

/** Friendly constants for system-column ids used in config APIs. */
export const GRID_SYSTEM_COLUMN_IDS = {
  ROW_INDEX: "rowIndex",
  ROW_DETAIL: "rowDetail",
  ROW_PINNING: "rowPinning",
  ROW_ORDERING: "rowOrdering",
  ROW_SELECTION: "rowSelection",
} as const;

export const GRID_SYSTEM_COLUMN_DEFAULT_ORDER: readonly GridSystemColumnId[] = [
  "rowIndex",
  "rowDetail",
  "rowOrdering",
  "rowSelection",
  "rowPinning",
] as const;

export type GridSystemCellTypeKey =
  (typeof GRID_SYSTEM_COLUMN_KEYS)[GridSystemColumnId];

export interface GridLoadingCellRenderArgs {
  row?: GridRow;
  column?: GridColumn;
  rowIndex: number;
  colIndex: number;
  isSystemCell: boolean;
  systemCellType?: GridSystemCellTypeKey;
}

export type GridLoadingCellRenderer =
  | ReactNode
  | ComponentType<GridLoadingCellRenderArgs>;

export interface GridServerRowGroupColumnRequest {
  key: string;
  label?: string;
}

export interface GridServerRowModelGroupingRequest {
  columns: GridServerRowGroupColumnRequest[];
  groupColumnKey?: string;
  defaultExpanded?: boolean;
  expansion?: Record<string, boolean>;
}

export interface GridServerRowModelGroupingProps {
  enabled?: boolean;
  columns: GridServerRowGroupColumnRequest[];
  groupColumnKey?: string;
  defaultExpanded?: boolean;
}

export interface GridServerRowModelTreeDataRequest {
  enabled: boolean;
  groupColumnKey?: string;
  defaultExpanded?: boolean;
  expansion?: Record<string, boolean>;
}

export interface GridServerRowModelTreeDataProps {
  enabled?: boolean;
  groupColumnKey?: string;
  defaultExpanded?: boolean;
}

export interface GridServerRowModelPivotColumnRequest {
  key: string;
  label?: string;
}

export interface GridServerRowModelPivotValueColumnRequest
  extends GridServerRowModelPivotColumnRequest {
  aggFunc?: string;
}

export interface GridServerRowModelPivotRequest {
  groupColumns?: GridServerRowGroupColumnRequest[];
  pivotColumns: GridServerRowModelPivotColumnRequest[];
  valueColumns: GridServerRowModelPivotValueColumnRequest[];
  pivotMode?: boolean;
  resultFieldSeparator?: string;
}

export interface GridServerRowModelPivotProps {
  enabled?: boolean;
  groupColumns?: GridServerRowGroupColumnRequest[];
  pivotColumns: GridServerRowModelPivotColumnRequest[];
  valueColumns: GridServerRowModelPivotValueColumnRequest[];
  pivotMode?: boolean;
  resultFieldSeparator?: string;
}

export interface GridServerRowModelPaginationProps {
  /**
   * Enables AG Grid compatible SSRM pagination behavior.
   * When enabled, page controls drive SSRM range requests.
   */
  enabled?: boolean;
}

export type GridServerRowModelStoreMode = "auto" | "flat" | "hierarchical";

export interface GridServerRowModelSelectionNodeState {
  /**
   * Node id for SSRM selection state.
   * For grouped data this is typically the group path; for leaves it is the row id.
   */
  nodeId: string;
  /**
   * Selection baseline for this node's children.
   * When omitted, consumers may infer an inverted value relative to parent.
   */
  selectAllChildren?: boolean;
  /**
   * Child node exceptions.
   */
  toggledNodes?: GridServerRowModelSelectionNodeState[];
}

export interface GridServerRowModelSelectionState {
  /**
   * Baseline selection mode:
   * - `true`: all rows are selected except ids listed in `toggledRowIds`.
   * - `false`: no rows are selected except ids listed in `toggledRowIds`.
   */
  selectAll: boolean;
  /**
   * Row ids that differ from the baseline represented by `selectAll`.
   */
  toggledRowIds: (string | number)[];
  /**
   * AG Grid style hierarchical baseline for grouped SSRM selection.
   * Alias-compatible with `selectAll`.
   */
  selectAllChildren?: boolean;
  /**
   * AG Grid style hierarchical node exceptions for grouped SSRM selection.
   */
  toggledNodes?: GridServerRowModelSelectionNodeState[];
}

export type GridServerRowModelGroupSelects =
  | "self"
  | "descendants"
  | "filteredDescendants";

export interface GridServerRowModelSelectionChangeEvent {
  state: GridServerRowModelSelectionState;
  selectedRowIds: (string | number)[];
  selectedRowCountLoaded: number;
}

export interface GridServerRowModelSelectionApi {
  getServerSideSelectionState: () => GridServerRowModelSelectionState;
  setServerSideSelectionState: (state: GridServerRowModelSelectionState) => void;
  clearServerSideSelectionState: () => void;
}

export interface GridServerRowModelRefreshParams {
  /**
   * Optional route for grouped stores (AG Grid parity shape).
   * In Ace Grid, this targets loaded SSRM blocks that belong to the route.
   * Unloaded route blocks refresh the next time they are requested/visible.
   */
  route?: string[];
  /**
   * When true, clears loaded rows immediately before reloading.
   * When false, keeps loaded rows visible while fresh data is requested.
   */
  purge?: boolean;
}

export interface GridServerRowModelTransaction {
  /**
   * Rows added on the server.
   */
  add?: GridRow[];
  /**
   * Rows updated on the server (matched by id).
   */
  update?: GridRow[];
  /**
   * Rows removed on the server (ids or row objects).
   */
  remove?: Array<GridRow | string | number>;
  /**
   * Optional insertion index for adds.
   */
  addIndex?: number;
  /**
   * Optional grouped route (AG Grid parity shape).
   */
  route?: string[];
}

export interface GridServerRowModelTransactionResult {
  status: "applied" | "partial" | "ignored";
  add: number;
  update: number;
  remove: number;
  appliedAdd: number;
  appliedUpdate: number;
  appliedRemove: number;
  refreshed: boolean;
}

export interface GridServerRowModelRowNodeApi {
  id: string | number;
  rowIndex: number;
  data: GridRow;
  /**
   * Replaces loaded row data for this node.
   */
  setData: (row: GridRow) => boolean;
  /**
   * Merges row data for this node.
   */
  updateData: (patch: Partial<GridRow>) => boolean;
}

export interface GridServerRowModelApi {
  refreshServerSide: (params?: GridServerRowModelRefreshParams) => void;
  retryServerSideLoads: () => void;
  getRowNode: (id: string | number) => GridServerRowModelRowNodeApi | null;
  applyServerSideTransaction: (
    transaction: GridServerRowModelTransaction
  ) => GridServerRowModelTransactionResult;
  applyServerSideTransactionAsync: (
    transaction: GridServerRowModelTransaction,
    callback?: (result: GridServerRowModelTransactionResult) => void
  ) => void;
  flushServerSideAsyncTransactions: () => void;
}

export interface GridServerRowModelSelectionProps {
  /**
   * Enables SSRM selection-state behavior (select-all + toggled ids).
   * Defaults to `true` when SSRM and row selection are enabled.
   */
  enabled?: boolean;
  /**
   * Optional controlled SSRM selection state.
   */
  state?: GridServerRowModelSelectionState;
  /**
   * How group rows affect descendants in SSRM grouped mode.
   */
  groupSelects?: GridServerRowModelGroupSelects;
  /**
   * Fired whenever SSRM selection state changes.
   */
  onStateChange?: (state: GridServerRowModelSelectionState) => void;
  /**
   * Fired when SSRM selection updates, with current loaded selected rows.
   */
  onSelectionChanged?: (event: GridServerRowModelSelectionChangeEvent) => void;
  /**
   * Optional API ref for programmatic state access (AG Grid parity style).
   */
  apiRef?: MutableRefObject<GridServerRowModelSelectionApi | null> | null;
}

export interface GridPivotProps {
  enabled?: boolean;
  groupColumns?: GridServerRowGroupColumnRequest[];
  pivotColumns: GridServerRowModelPivotColumnRequest[];
  valueColumns: GridServerRowModelPivotValueColumnRequest[];
  pivotMode?: boolean;
  resultFieldSeparator?: string;
  onPivotResultFieldsChange?: (fields: string[]) => void;
}

export interface GridServerRowModelProps {
  enabled?: boolean;
  /**
   * SSRM cache/store strategy.
   * - `auto` (default): hierarchical for grouped/tree SSRM (except pivot), flat otherwise
   * - `flat`: forces legacy flat SSRM cache
   * - `hierarchical`: forces route-store SSRM when grouping/tree is enabled (falls back to flat for unsupported combos)
   */
  storeMode?: GridServerRowModelStoreMode;
  /** Total row count (optional; can be returned by getRows). */
  rowCount?: number;
  /** Block size requested from the server (default 200). */
  blockSize?: number;
  /** Max blocks kept in cache (default 30). */
  maxBlocksInCache?: number;
  /** How many blocks ahead/behind to prefetch (default 1). */
  prefetchBlocks?: number;
  /** Debounce fetches in ms (default 60). */
  debounceMs?: number;
  /** Main fetch contract for SSRM. */
  getRows: (args: GridServerRowModelRequest) => Promise<GridServerRowModelResult>;
  /** Optional row id resolver for server rows. */
  getRowId?: (row: GridRow, index: number) => string | number;
  /** Optional error handler. */
  onError?: (error: unknown) => void;
  /** Optional server-side row grouping configuration (AG Grid SSRM style). */
  grouping?: GridServerRowModelGroupingProps;
  /** Optional server-side tree data configuration (AG Grid parity style). */
  treeData?: GridServerRowModelTreeDataProps;
  /** Optional server-side pivot request configuration. */
  pivot?: GridServerRowModelPivotProps;
  /** Optional SSRM pagination compatibility mode. */
  pagination?: GridServerRowModelPaginationProps;
  /** Optional SSRM selection-state configuration (AG Grid style). */
  selection?: GridServerRowModelSelectionProps;
  /**
   * Called when SSRM responses include `pivotResultFields`.
   * Useful for generating secondary/pivot columns in the host app.
   */
  onPivotResultFieldsChange?: (fields: string[]) => void;
  /**
   * Optional renderer for SSRM placeholder cell content while blocks are loading.
   * Accepts either a static React node (`<div />`) or a component.
   */
  loadingCellRenderer?: GridLoadingCellRenderer;
  /**
   * Optional API ref for SSRM refresh/row updates/transactions (AG Grid parity style).
   */
  apiRef?: MutableRefObject<GridServerRowModelApi | null> | null;
}

export interface GridTreeDataProps {
  enabled?: boolean;
  /** AG Grid style data-path resolver for client tree data mode. */
  getDataPath?: (
    row: GridRow,
    rowIndex: number
  ) => Array<string | number> | null | undefined;
  /**
   * Optional column-key mapping for each tree path level.
   * Useful for row-grouping style drag/drop callbacks so moved rows can update
   * level values consistently (for example ["department", "team", "project"]).
   */
  pathColumnKeys?: string[];
  /**
   * Optional field key in `row.data` to resolve path arrays when `getDataPath`
   * is not provided.
   */
  pathField?: string;
  /**
   * Optional delimiter used when `pathField` resolves to a string.
   * Defaults to `/`.
   */
  pathSeparator?: string;
  /** Default expansion for generated tree group rows (default true). */
  defaultExpanded?: boolean;
  /** Column key where tree group labels are rendered. */
  groupColumnKey?: string;
}

/** PAGINATION */
export type GridPaginationMode = "client" | "server" | "cursor";

export type GridPaginationCursorState = {
  next?: string | null;
  prev?: string | null;
};

export type GridPaginationRange = {
  start: number;
  end: number;
  total: number;
};

export interface GridPaginationLabels {
  pageSize?: string;
  page?: string;
  of?: string;
  rangeSeparator?: string;
  range?: (args: GridPaginationRange) => ReactNode;
  pageInfo?: (args: { pageIndex: number; pageCount: number }) => ReactNode;
}

export type GridPaginationIcons = Partial<
  Pick<
    GridIconSetInput,
    "paginationFirst" | "paginationPrev" | "paginationNext" | "paginationLast"
  >
>;

export interface GridPaginationRenderState {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRowCount: number;
  pageRowCount: number;
  rangeStart: number;
  rangeEnd: number;
  mode: GridPaginationMode;
  canNext: boolean;
  canPrev: boolean;
  cursor?: GridPaginationCursorState;
  pageSizeOptions: number[];
  icons: GridIconSet;
  disabled: boolean;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export interface GridPaginationProps {
  enabled?: boolean;
  mode?: GridPaginationMode;
  pageIndex?: number;
  pageSize?: number;
  defaultPageIndex?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  totalRowCount?: number;
  cursor?: GridPaginationCursorState;
  keepPageOnSizeChange?: boolean;
  showPageSize?: boolean;
  showRange?: boolean;
  showPageInfo?: boolean;
  showControls?: boolean;
  showFirstLast?: boolean;
  position?: "top" | "bottom" | "both";
  className?: string;
  style?: CSSProperties;
  labels?: GridPaginationLabels;
  icons?: GridPaginationIcons;
  disabled?: boolean;
  renderPagination?: (state: GridPaginationRenderState) => ReactNode;
  onPageChange?: (
    pageIndex: number,
    context: { pageSize: number; pageCount: number; mode: GridPaginationMode }
  ) => void;
  onPageSizeChange?: (
    pageSize: number,
    context: { pageIndex: number; pageCount: number; mode: GridPaginationMode }
  ) => void;
  onPageRequest?: (args: {
    pageIndex: number;
    pageSize: number;
  }) => void | Promise<void>;
  onCursorRequest?: (args: {
    direction: "next" | "prev";
    cursor: string | null;
    pageIndex: number;
    pageSize: number;
  }) => void | Promise<void>;
}

/* ======================================================
   Root grouped GridProps
   ====================================================== */

export interface GridProps {
  /** License configuration for paid Pro and Enterprise package entry points. */
  license?: GridLicenseConfig;

  /** Data and columns */
  data: GridDataProps;

  /** Container layout & base styling */
  layout: GridLayoutProps;

  /** Theme (tokens & icons) */
  theming?: GridThemeProps;

  /** Column-level configuration (width map) */
  columns: GridColumnsProps;

  /** Column grouping configuration */
  columnGrouping?: GridColumnGroupingProps;

  /** Spreadsheet-style row/column keys */
  keyedHeaders?: GridKeyedHeadersProps;

  /** Optional per-row height overrides */
  rowsConfig?: GridRowsProps;

  /** Virtualization strategy flags */
  virtual?: GridVirtualProps;

  /** Formula bar feature */
  formula?: GridFormulaProps;

  /** Selection feature (cell/row/column) */
  selection?: GridSelectionProps;

  /** Clipboard copy/cut/paste */
  clipboard?: GridClipboardProps;

  /** Editing feature (cells and row ops) */
  edit?: GridEditProps;

  /** Data validation */
  validation?: GridValidationProps;

  /** Column filtering */
  filter?: GridFilterProps;

  /** Sorting */
  sorting?: GridSortProps;

  /** Search (highlight/filter) */
  search?: GridSearchProps;

  /** Pinning (rows & columns) */
  pinning?: GridPinProps;

  /** Reordering (DnD) */
  reorder?: GridReorderProps;

  /** Resize (rows & columns) */
  resize?: GridResizeProps;

  /** Cell spanning / merged cells */
  spanning?: GridSpanProps;

  /** Sparkline rendering */
  sparkline?: GridSparklineProps;

  /** Integrated charts */
  charts?: GridChartsProps;

  /** Master / detail (AG Grid-like) */
  masterDetail?: GridMasterDetailProps;

  /** Row grouping behaviour */
  rowGrouping?: GridRowGroupingProps;

  /** Client-side pivoting (builds cross-tab columns/rows). */
  pivot?: GridPivotProps;

  /** Client-side tree data (AG Grid parity style). */
  treeData?: GridTreeDataProps;

  /** Scrolling / infinite loading */
  scroll?: GridScrollProps;

  /** Server-side row model (block cache) */
  serverRowModel?: GridServerRowModelProps;

  /** Pagination (client/server, headless + default UI) */
  pagination?: GridPaginationProps;

  /** Cell context menu configuration */
  contextMenu?: GridContextMenuConfig;

  /** Root accessibility metadata */
  accessibility?: GridAccessibilityProps;
}

export interface GridAccessibilityProps {
  /** Accessible name for the grid root. */
  ariaLabel?: string;
  /** External label element id for the grid root. */
  ariaLabelledBy?: string;
  /** External description element id for the grid root. */
  ariaDescribedBy?: string;
}
