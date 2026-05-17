import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { resolveTheme, type GridIconSet } from "./features/theming";
import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type {
  CellEditorRenderProps,
  GridCellRenderProps,
  GridChartRenderProps,
  GridColumnDef,
  GridColumnFilterPanelRendererArgs,
  GridFloatingFilterCellRendererArgs,
  GridHeaderRenderProps,
  GridLoadingCellRenderArgs,
  GridMasterDetailDetailRenderArgs,
  GridMasterDetailToggleCellRenderArgs,
  GridPaginationRenderState,
  GridRow,
  GridRowPinCellRenderArgs,
} from "./types";

export const ACE_GRID_CUSTOM_EVENT_PREFIX = "ace-grid-";

export const ACE_GRID_CUSTOM_EVENTS = {
  cellChange: "ace-grid-cell-change",
  rowAdd: "ace-grid-row-add",
  rowDelete: "ace-grid-row-delete",
  selectionChange: "ace-grid-selection-change",
  selectionRangeChange: "ace-grid-selection-range-change",
  sortChange: "ace-grid-sort-change",
  sortModelChange: "ace-grid-sort-model-change",
  filterChange: "ace-grid-filter-change",
} as const;

export type AceGridKnownCustomEventName =
  (typeof ACE_GRID_CUSTOM_EVENTS)[keyof typeof ACE_GRID_CUSTOM_EVENTS];

export type AceGridCustomEventName =
  | AceGridKnownCustomEventName
  | `${typeof ACE_GRID_CUSTOM_EVENT_PREFIX}${string}`;

export interface AceGridCustomEventDetail {
  path: string[];
  callback: string;
  args: unknown[];
  [key: string]: unknown;
}

type GridComponentProps = Record<string, any>;

export interface AceGridCustomElement<TProps extends GridComponentProps = GridComponentProps>
  extends HTMLElement {
  props: TProps;
  gridProps: TProps;
  templates: AceGridTemplateRegistry;
  setProps: (partial: Partial<TProps>) => void;
  getProps: () => TProps;
  setTemplates: (partial: Partial<AceGridTemplateRegistry>) => void;
  getTemplates: () => AceGridTemplateRegistry;
  rerender: () => void;
}

export interface CreateAceGridElementClassOptions<
  TProps extends GridComponentProps = GridComponentProps,
> {
  mapProps?: (
    props: TProps,
    host: AceGridCustomElement<TProps>,
  ) => TProps;
}

export type AceGridDomTemplatePrimitive = string | number | boolean | null | undefined;

export type AceGridDomTemplateResult =
  | AceGridDomTemplatePrimitive
  | Node
  | DocumentFragment
  | HTMLTemplateElement
  | AceGridDomTemplateResult[]
  | {
      node?:
        | AceGridDomTemplatePrimitive
        | Node
        | DocumentFragment
        | HTMLTemplateElement
        | AceGridDomTemplateResult[];
      cleanup?: () => void;
    };

export interface AceGridDomTemplateContext<TArgs = unknown> {
  host: HTMLElement;
  props: TArgs;
  renderDefault?: () => Node | null;
}

export type AceGridDomTemplate<TArgs = unknown> = (
  context: AceGridDomTemplateContext<TArgs>,
) => AceGridDomTemplateResult;

export type AceGridIconTemplateRegistry = Partial<{
  [K in keyof GridIconSet]: AceGridDomTemplate<
    Parameters<NonNullable<GridIconSet[K]>>[0]
  >;
}>;

export interface AceGridColumnTemplateRegistry {
  cell?: AceGridDomTemplate<GridCellRenderProps>;
  header?: AceGridDomTemplate<GridHeaderRenderProps>;
  editor?: AceGridDomTemplate<CellEditorRenderProps>;
}

export interface AceGridTemplateRegistry {
  columns?: Record<string, AceGridColumnTemplateRegistry>;
  icons?: AceGridIconTemplateRegistry;
  cell?: AceGridDomTemplate<GridCellRenderProps>;
  header?: AceGridDomTemplate<GridHeaderRenderProps>;
  editor?: AceGridDomTemplate<CellEditorRenderProps>;
  filterPanel?: AceGridDomTemplate<GridColumnFilterPanelRendererArgs>;
  floatingFilterCell?: AceGridDomTemplate<GridFloatingFilterCellRendererArgs>;
  rowPinCell?: AceGridDomTemplate<GridRowPinCellRenderArgs>;
  chart?: AceGridDomTemplate<GridChartRenderProps>;
  detail?: AceGridDomTemplate<GridMasterDetailDetailRenderArgs>;
  toggleCell?: AceGridDomTemplate<GridMasterDetailToggleCellRenderArgs>;
  pagination?: AceGridDomTemplate<GridPaginationRenderState>;
  loadingCell?: AceGridDomTemplate<GridLoadingCellRenderArgs>;
  contextMenu?: AceGridDomTemplate<unknown>;
}

export interface AceGridHookElement<
  TGridProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> extends AceGridCustomElement<TGridProps> {
  hookOptions: THookOptions;
  setHookOptions: (partial: Partial<THookOptions>) => void;
  getHookOptions: () => THookOptions;
  rows: TRows | null;
  getRows: () => TRows | null;
  actions: TActions | null;
  api: TActions | null;
  getActions: () => TActions | null;
  getApi: () => TActions | null;
}

export interface CreateAceGridHookElementClassOptions<
  TGridProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> {
  mapHookOptions?: (
    hookOptions: THookOptions,
    host: AceGridHookElement<TGridProps, THookOptions, TRows, TActions>,
  ) => THookOptions;
  mapGridProps: (args: {
    gridProps: TGridProps;
    hookOptions: THookOptions;
    rows: TRows;
    actions: TActions;
    host: AceGridHookElement<TGridProps, THookOptions, TRows, TActions>;
  }) => TGridProps;
}

type ReactGridComponent<TProps extends GridComponentProps = GridComponentProps> =
  React.ComponentType<TProps>;

type ReactHook<TOptions, TRows, TActions> = (
  options: TOptions,
) => [TRows, TActions];

const CALLBACK_PROP_PATTERN = /^on[A-Z]/;
const BRIDGED_CALLBACK_MARKER = Symbol("ace-grid-bridged-callback");
const DOM_TEMPLATE_WRAPPER_STYLE: React.CSSProperties = { display: "contents" };

const KNOWN_GRID_CALLBACK_PATHS = [
  ["columnGrouping", "onColumnGroupToggled"],
  ["selection", "onSelectionRangeChange"],
  ["selection", "onSelectionChange"],
  ["selection", "onRowSelectionChange"],
  ["selection", "onColumnSelectionChange"],
  ["selection", "onCellClick"],
  ["selection", "onCellDoubleClick"],
  ["clipboard", "onCopy"],
  ["clipboard", "onCut"],
  ["clipboard", "onPaste"],
  ["edit", "onCellChange"],
  ["edit", "onRowAdd"],
  ["edit", "onRowDelete"],
  ["validation", "onValidationChange"],
  ["filter", "onFilter"],
  ["search", "onActiveMatchChange"],
  ["search", "onResultsCountChange"],
  ["sorting", "onSort"],
  ["sorting", "onSortModelChange"],
  ["pinning", "onPinColumn"],
  ["pinning", "onPinColumnAtPosition"],
  ["pinning", "onPinAndPositionColumn"],
  ["pinning", "onPinnedColumnReorder"],
  ["pinning", "onPinRow"],
  ["pinning", "onPinRowAtPosition"],
  ["pinning", "onPinMultipleRowsAtPosition"],
  ["pinning", "onPinAndPositionRow"],
  ["pinning", "onPinnedRowReorder"],
  ["pinning", "onReorderMultiplePinnedRows"],
  ["reorder", "onColumnReorder"],
  ["reorder", "onRowReorder"],
  ["reorder", "onMultiRowReorder"],
  ["reorder", "onMultiColumnReorder"],
  ["reorder", "onUpdateColumnOrder"],
  ["reorder", "onColumnGroupsChange"],
  ["reorder", "onRowExternalDrop"],
  ["resize", "onColumnResize"],
  ["resize", "onRowResize"],
  ["spanning", "onMergedCellsChange"],
  ["charts", "controls", "brushActions", "*", "onApply"],
  ["charts", "onChartCreate"],
  ["charts", "onChartUpdate"],
  ["charts", "onChartClose"],
  ["charts", "onBrushSelection"],
  ["charts", "onSettingsChange"],
  ["masterDetail", "onExpandedRowIdsChange"],
  ["rowGrouping", "onToggleGroup"],
  ["rowGrouping", "onCollapseAll"],
  ["rowGrouping", "onExpandAll"],
  ["rowGrouping", "onMoveRowsToGroup"],
  ["rowGrouping", "onReorderGroups"],
  ["pivot", "onPivotResultFieldsChange"],
  ["serverRowModel", "onError"],
  ["serverRowModel", "onPivotResultFieldsChange"],
  ["serverRowModel", "selection", "onStateChange"],
  ["serverRowModel", "selection", "onSelectionChanged"],
  ["pagination", "onPageChange"],
  ["pagination", "onPageSizeChange"],
  ["pagination", "onPageRequest"],
  ["pagination", "onCursorRequest"],
] as const;

const CALLBACK_EVENT_NAME_OVERRIDES: Record<string, AceGridKnownCustomEventName> = {
  onCellChange: ACE_GRID_CUSTOM_EVENTS.cellChange,
  onFilter: ACE_GRID_CUSTOM_EVENTS.filterChange,
  onRowAdd: ACE_GRID_CUSTOM_EVENTS.rowAdd,
  onRowDelete: ACE_GRID_CUSTOM_EVENTS.rowDelete,
  onSelectionChange: ACE_GRID_CUSTOM_EVENTS.selectionChange,
  onSelectionRangeChange: ACE_GRID_CUSTOM_EVENTS.selectionRangeChange,
  onSort: ACE_GRID_CUSTOM_EVENTS.sortChange,
  onSortModelChange: ACE_GRID_CUSTOM_EVENTS.sortModelChange,
};

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();

export const getAceGridCustomEventName = (callbackName: string): AceGridCustomEventName =>
  CALLBACK_EVENT_NAME_OVERRIDES[callbackName] ??
  `${ACE_GRID_CUSTOM_EVENT_PREFIX}${toKebabCase(callbackName.replace(/^on/, ""))}`;

const dispatchGridEvent = (
  host: HTMLElement,
  type: AceGridCustomEventName,
  detail: AceGridCustomEventDetail,
) => {
  host.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
};

const chainHandler = <TArgs extends unknown[]>(
  original: ((...args: TArgs) => unknown) | undefined,
  next: (...args: TArgs) => void,
) => {
  return (...args: TArgs) => {
    next(...args);
    return original?.(...args);
  };
};

const isPlainBridgeableObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (value instanceof Date || value instanceof RegExp || value instanceof Map || value instanceof Set) {
    return false;
  }
  if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) return false;

  const record = value as Record<string, unknown>;
  if ("$$typeof" in record) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isColumnGroupDef = (
  def: GridColumnDef,
): def is Extract<GridColumnDef, { children: GridColumnDef[] }> =>
  Boolean(def && typeof def === "object" && "children" in def);

const createDomNodeFromPrimitive = (
  value: AceGridDomTemplatePrimitive,
  documentRef: Document,
) => {
  if (value == null || value === false) return null;
  return documentRef.createTextNode(String(value));
};

const materializeTemplateNode = (
  result: AceGridDomTemplateResult,
  documentRef: Document,
): { nodes: Node[]; cleanup?: () => void } => {
  if (Array.isArray(result)) {
    const nodes: Node[] = [];
    const cleanups: Array<() => void> = [];
    result.forEach((entry) => {
      const normalized = materializeTemplateNode(entry, documentRef);
      nodes.push(...normalized.nodes);
      if (normalized.cleanup) cleanups.push(normalized.cleanup);
    });
    return {
      nodes,
      cleanup: cleanups.length
        ? () => {
            cleanups
              .slice()
              .reverse()
              .forEach((cleanup) => cleanup());
          }
        : undefined,
    };
  }

  if (
    result &&
    typeof result === "object" &&
    !(result instanceof Node) &&
    !(result instanceof HTMLTemplateElement)
  ) {
    const normalized = materializeTemplateNode(result.node ?? null, documentRef);
    return {
      nodes: normalized.nodes,
      cleanup: result.cleanup
        ? () => {
            normalized.cleanup?.();
            result.cleanup?.();
          }
        : normalized.cleanup,
    };
  }

  if (result instanceof HTMLTemplateElement) {
    return {
      nodes: [result.content.cloneNode(true) as DocumentFragment],
    };
  }

  if (result instanceof Node) {
    return { nodes: [result] };
  }

  const primitiveNode = createDomNodeFromPrimitive(result, documentRef);
  return { nodes: primitiveNode ? [primitiveNode] : [] };
};

const DomTemplateMount = <TArgs,>({
  host,
  template,
  props,
  getDefaultReactNode,
}: {
  host: HTMLElement;
  template: AceGridDomTemplate<TArgs>;
  props: TArgs;
  getDefaultReactNode?: (() => React.ReactNode | null | undefined) | undefined;
}) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanups: Array<() => void> = [];
    const ownerDocument = container.ownerDocument;

    const renderDefault =
      getDefaultReactNode == null
        ? undefined
        : () => {
            const nextDefaultNode = getDefaultReactNode();
            if (nextDefaultNode == null || nextDefaultNode === false) return null;
            if (
              typeof nextDefaultNode === "string" ||
              typeof nextDefaultNode === "number" ||
              typeof nextDefaultNode === "boolean"
            ) {
              return ownerDocument.createTextNode(String(nextDefaultNode));
            }
            const mount = ownerDocument.createElement("span");
            mount.style.display = "contents";
            const root = createRoot(mount);
            root.render(React.createElement(React.Fragment, null, nextDefaultNode));
            cleanups.push(() => {
              queueMicrotask(() => {
                root.unmount();
              });
            });
            return mount;
          };

    const result = template({
      host,
      props,
      renderDefault,
    });
    const normalized = materializeTemplateNode(result, ownerDocument);
    container.replaceChildren(...normalized.nodes);
    if (normalized.cleanup) cleanups.push(normalized.cleanup);

    return () => {
      container.replaceChildren();
      cleanups
        .slice()
        .reverse()
        .forEach((cleanup) => cleanup());
    };
  }, [getDefaultReactNode, host, props, template]);

  return React.createElement("span", {
    ref: containerRef,
    style: DOM_TEMPLATE_WRAPPER_STYLE,
  });
};

const createDomTemplateReactRenderer = <TArgs,>(
  host: HTMLElement,
  template: AceGridDomTemplate<TArgs>,
  getDefaultReactNode?: (args: TArgs) => React.ReactNode | null | undefined,
) => {
  return (args: TArgs) =>
    React.createElement(DomTemplateMount<TArgs>, {
      host,
      template,
      props: args,
      getDefaultReactNode: getDefaultReactNode
        ? () => getDefaultReactNode(args)
        : undefined,
    });
};

const adaptColumnDefsWithTemplates = (
  defs: GridColumnDef[],
  templates: AceGridTemplateRegistry,
  host: HTMLElement,
): GridColumnDef[] => {
  let changed = false;
  const nextDefs = defs.map((def) => {
    if (isColumnGroupDef(def)) {
      const nextChildren = adaptColumnDefsWithTemplates(def.children, templates, host);
      if (nextChildren !== def.children) {
        changed = true;
        return { ...def, children: nextChildren };
      }
      return def;
    }

    const columnTemplates = templates.columns?.[def.key];
    const cellTemplate = columnTemplates?.cell ?? templates.cell;
    const headerTemplate = columnTemplates?.header ?? templates.header;
    const editorTemplate = columnTemplates?.editor ?? templates.editor;

    if (!cellTemplate && !headerTemplate && !editorTemplate) {
      return def;
    }

    changed = true;
    return {
      ...def,
      renderCell: cellTemplate
        ? createDomTemplateReactRenderer(host, cellTemplate, (args) =>
            def.renderCell ? def.renderCell(args) : args.defaultContent,
          )
        : def.renderCell,
      renderHeader: headerTemplate
        ? createDomTemplateReactRenderer(host, headerTemplate, (args) =>
            def.renderHeader ? def.renderHeader(args) : args.label,
          )
        : def.renderHeader,
      renderEditor: editorTemplate
        ? createDomTemplateReactRenderer(host, editorTemplate, (args) =>
            def.renderEditor ? def.renderEditor(args) : null,
          )
        : def.renderEditor,
    };
  });

  return changed ? nextDefs : defs;
};

const applyAceGridDomTemplates = <TProps extends GridComponentProps>(
  rawProps: TProps,
  templates: AceGridTemplateRegistry,
  host: HTMLElement,
) => {
  if (!templates || Object.keys(templates).length === 0) return rawProps;

  const base = rawProps as Record<string, any>;
  let nextProps = rawProps as TProps;
  let changed = false;

  const assignPatch = (key: string, value: unknown) => {
    if (!changed) {
      nextProps = { ...nextProps } as TProps;
      changed = true;
    }
    (nextProps as Record<string, unknown>)[key] = value;
  };

  if (base.data?.columns && Array.isArray(base.data.columns)) {
    const nextColumns = adaptColumnDefsWithTemplates(
      base.data.columns,
      templates,
      host,
    );
    if (nextColumns !== base.data.columns) {
      assignPatch("data", {
        ...base.data,
        columns: nextColumns,
      });
    }
  }

  if (templates.icons && Object.keys(templates.icons).length > 0) {
    const resolvedTheme = resolveTheme(
      base.theming?.theme,
      base.theming?.icons,
      base.theming?.inlineStyleOverrides,
    );
    const iconEntries = Object.entries(templates.icons)
      .filter((entry): entry is [keyof GridIconSet, AceGridDomTemplate<any>] => Boolean(entry[1]))
      .map(([slot, template]) => [
        slot,
        createDomTemplateReactRenderer(host, template, (args) =>
          resolvedTheme.icons[slot]?.(args),
        ),
      ]);

    assignPatch("theming", {
      ...(base.theming ?? {}),
      icons: {
        ...(base.theming?.icons ?? {}),
        ...Object.fromEntries(iconEntries),
      },
    });
  }

  if (templates.filterPanel || templates.floatingFilterCell) {
    assignPatch("filter", {
      ...(base.filter ?? {}),
      renderColumnFilterPanel: templates.filterPanel
        ? createDomTemplateReactRenderer(host, templates.filterPanel, (args) =>
            base.filter?.renderColumnFilterPanel
              ? base.filter.renderColumnFilterPanel(args)
              : args.renderDefault(),
          )
        : base.filter?.renderColumnFilterPanel,
      renderFloatingFilterCell: templates.floatingFilterCell
        ? createDomTemplateReactRenderer(
            host,
            templates.floatingFilterCell,
            (args) =>
              base.filter?.renderFloatingFilterCell
                ? base.filter.renderFloatingFilterCell(args)
                : args.renderDefault(),
          )
        : base.filter?.renderFloatingFilterCell,
    });
  }

  if (templates.rowPinCell) {
    assignPatch("pinning", {
      ...(base.pinning ?? {}),
      renderRowPinCell: createDomTemplateReactRenderer(
        host,
        templates.rowPinCell,
        (args) =>
          base.pinning?.renderRowPinCell
            ? base.pinning.renderRowPinCell(args)
            : args.renderDefault(),
      ),
    });
  }

  if (templates.chart) {
    assignPatch("charts", {
      ...(base.charts ?? {}),
      renderChart: createDomTemplateReactRenderer(host, templates.chart, (args) =>
        base.charts?.renderChart ? base.charts.renderChart(args) : null,
      ),
    });
  }

  if (templates.detail || templates.toggleCell) {
    assignPatch("masterDetail", {
      ...(base.masterDetail ?? {}),
      renderDetail: templates.detail
        ? createDomTemplateReactRenderer(host, templates.detail, (args) =>
            base.masterDetail?.renderDetail
              ? base.masterDetail.renderDetail(args)
              : null,
          )
        : base.masterDetail?.renderDetail,
      renderToggleCell: templates.toggleCell
        ? createDomTemplateReactRenderer(host, templates.toggleCell, (args) =>
            base.masterDetail?.renderToggleCell
              ? base.masterDetail.renderToggleCell(args)
              : args.renderDefault(),
          )
        : base.masterDetail?.renderToggleCell,
    });
  }

  if (templates.pagination) {
    assignPatch("pagination", {
      ...(base.pagination ?? {}),
      renderPagination: createDomTemplateReactRenderer(
        host,
        templates.pagination,
        (args) =>
          base.pagination?.renderPagination
            ? base.pagination.renderPagination(args)
            : null,
      ),
    });
  }

  if (templates.loadingCell) {
    assignPatch("serverRowModel", {
      ...(base.serverRowModel ?? {}),
      loadingCellRenderer: createDomTemplateReactRenderer(
        host,
        templates.loadingCell,
        () => null,
      ),
    });
  }

  if (templates.contextMenu) {
    assignPatch("contextMenu", {
      ...(base.contextMenu ?? {}),
      renderMenu: createDomTemplateReactRenderer(
        host,
        templates.contextMenu,
        (args: any) =>
          base.contextMenu?.renderMenu
            ? base.contextMenu.renderMenu(args)
            : args.renderDefault(),
      ),
    });
  }

  return nextProps;
};

const buildGridEventDetail = (
  path: string[],
  callback: string,
  args: unknown[],
): AceGridCustomEventDetail => {
  switch (callback) {
    case "onCellChange": {
      const [rowId, columnKey, value] = args;
      return { path, callback, args, rowId, columnKey, value };
    }
    case "onRowDelete": {
      const [rowIds] = args;
      return { path, callback, args, rowIds };
    }
    case "onSelectionChange":
    case "onSelectionRangeChange": {
      const [selection] = args;
      return { path, callback, args, selection };
    }
    case "onSort": {
      const [columnKey, direction] = args;
      return { path, callback, args, columnKey, direction };
    }
    case "onSortModelChange": {
      const [model] = args;
      return { path, callback, args, model };
    }
    case "onFilter": {
      const [columnKey, filter] = args;
      return { path, callback, args, columnKey, filter };
    }
    default:
      return { path, callback, args };
  }
};

const bridgeCallback = <TArgs extends unknown[]>(
  host: HTMLElement,
  path: string[],
  callbackName: string,
  original: ((...args: TArgs) => unknown) | undefined,
) => {
  const existingBridgedCallback =
    original &&
    (original as ((...args: TArgs) => unknown) & {
      [BRIDGED_CALLBACK_MARKER]?: boolean;
    })[BRIDGED_CALLBACK_MARKER];
  if (existingBridgedCallback) {
    return original;
  }

  const wrappedCallback = chainHandler(original, (...args: TArgs) => {
    dispatchGridEvent(
      host,
      getAceGridCustomEventName(callbackName),
      buildGridEventDetail(path, callbackName, args),
    );
  });
  (
    wrappedCallback as ((...args: TArgs) => unknown) & {
      [BRIDGED_CALLBACK_MARKER]?: boolean;
    }
  )[BRIDGED_CALLBACK_MARKER] = true;
  return wrappedCallback;
};

const injectKnownGridCallbackPath = (
  value: unknown,
  host: HTMLElement,
  path: readonly string[],
  traversedPath: string[] = [],
): unknown => {
  if (path.length === 0) return value;

  const [segment, ...rest] = path;

  if (segment === "*") {
    if (!Array.isArray(value) || value.length === 0) {
      return value;
    }

    let changed = false;
    const nextArray = value.map((entry, index) => {
      const nextEntry = injectKnownGridCallbackPath(
        entry,
        host,
        rest,
        [...traversedPath, String(index)],
      );
      if (nextEntry !== entry) {
        changed = true;
      }
      return nextEntry;
    });

    return changed ? nextArray : value;
  }

  const currentValue = isPlainBridgeableObject(value) ? value : {};
  const nextValue = { ...currentValue };

  if (rest.length === 0) {
    const existingCallback =
      typeof currentValue[segment] === "function"
        ? (currentValue[segment] as (...args: unknown[]) => unknown)
        : undefined;
    nextValue[segment] = bridgeCallback(
      host,
      traversedPath,
      segment,
      existingCallback,
    );
    return nextValue;
  }

  const existingChild = currentValue[segment];
  const nextChild = injectKnownGridCallbackPath(
    existingChild,
    host,
    rest,
    [...traversedPath, segment],
  );
  nextValue[segment] = nextChild;
  return nextValue;
};

const injectKnownGridCallbacks = <TProps extends GridComponentProps>(
  rawProps: TProps,
  host: HTMLElement,
) => {
  let nextProps = rawProps;
  for (const path of KNOWN_GRID_CALLBACK_PATHS) {
    nextProps = injectKnownGridCallbackPath(nextProps, host, path) as TProps;
  }
  return nextProps;
};

const recursivelyBridgeCallbacks = <TValue>(
  value: TValue,
  host: HTMLElement,
  path: string[] = [],
): TValue => {
  if (!isPlainBridgeableObject(value)) return value;

  let changed = false;
  const nextValue: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    let resolvedValue = nestedValue;

    if (typeof nestedValue === "function" && CALLBACK_PROP_PATTERN.test(key)) {
      changed = true;
      resolvedValue = bridgeCallback(host, path, key, nestedValue as (...args: unknown[]) => unknown);
    } else if (isPlainBridgeableObject(nestedValue)) {
      const bridgedNestedValue = recursivelyBridgeCallbacks(nestedValue, host, [...path, key]);
      if (bridgedNestedValue !== nestedValue) {
        changed = true;
      }
      resolvedValue = bridgedNestedValue;
    }

    nextValue[key] = resolvedValue;
  }

  return (changed ? nextValue : value) as TValue;
};

const bridgeAceGridProps = <TProps extends GridComponentProps>(
  rawProps: TProps,
  host: AceGridCustomElement<TProps>,
) => recursivelyBridgeCallbacks(injectKnownGridCallbacks(rawProps, host), host);

export const createAceGridElementClass = <
  TProps extends GridComponentProps = GridComponentProps,
>(
  GridComponent: ReactGridComponent<TProps>,
  options: CreateAceGridElementClassOptions<TProps> = {},
) => {
  const { mapProps } = options;

  return class AceGridElementImpl
    extends HTMLElement
    implements AceGridCustomElement<TProps>
  {
    root: Root | null = null;
    mountNode: HTMLDivElement | null = null;
    internalProps = {} as TProps;
    internalTemplates: AceGridTemplateRegistry = {};

    connectedCallback() {
      if (!this.mountNode) {
        this.mountNode = document.createElement("div");
        this.mountNode.style.display = "contents";
        this.replaceChildren(this.mountNode);
      }
      if (!this.root) {
        this.root = createRoot(this.mountNode);
      }
      this.rerender();
    }

    disconnectedCallback() {
      this.root?.unmount();
      this.root = null;
      this.mountNode = null;
    }

    get props() {
      return this.internalProps;
    }

    set props(nextProps: TProps) {
      this.internalProps = (nextProps ?? {}) as TProps;
      this.rerender();
    }

    get gridProps() {
      return this.internalProps;
    }

    set gridProps(nextProps: TProps) {
      this.props = nextProps;
    }

    get templates() {
      return this.internalTemplates;
    }

    set templates(nextTemplates: AceGridTemplateRegistry) {
      this.internalTemplates = nextTemplates ?? {};
      this.rerender();
    }

    setProps = (partial: Partial<TProps>) => {
      this.internalProps = {
        ...this.internalProps,
        ...partial,
      };
      this.rerender();
    };

    getProps = () => this.internalProps;

    setTemplates = (partial: Partial<AceGridTemplateRegistry>) => {
      this.internalTemplates = {
        ...this.internalTemplates,
        ...partial,
      };
      this.rerender();
    };

    getTemplates = () => this.internalTemplates;

    rerender = () => {
      if (!this.root) return;
      const templateProps = applyAceGridDomTemplates(
        this.internalProps,
        this.internalTemplates,
        this,
      );
      const bridgedProps = bridgeAceGridProps(templateProps, this);
      const resolvedProps = mapProps
        ? mapProps(bridgedProps, this)
        : bridgedProps;
      this.root.render(React.createElement(GridComponent, resolvedProps));
    };
  };
};

export const defineAceGridElement = <
  TProps extends GridComponentProps = GridComponentProps,
>(
  tagName: string,
  GridComponent: ReactGridComponent<TProps>,
  options: CreateAceGridElementClassOptions<TProps> = {},
) => {
  const existing = customElements.get(tagName) as
    | (CustomElementConstructor & typeof HTMLElement)
    | undefined;
  if (existing) return existing;

  const ElementClass = createAceGridElementClass(GridComponent, options);
  customElements.define(tagName, ElementClass);
  return ElementClass;
};

type HookRuntimeBridge<TRows, TActions> = {
  setHookRuntimeState: (rows: TRows, actions: TActions) => void;
  clearHookRuntimeState: () => void;
};

export const createAceGridHookElementClass = <
  TGridProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
>(
  useHook: ReactHook<THookOptions, TRows, TActions>,
  GridComponent: ReactGridComponent<TGridProps>,
  options: CreateAceGridHookElementClassOptions<
    TGridProps,
    THookOptions,
    TRows,
    TActions
  >,
) => {
  const { mapGridProps, mapHookOptions } = options;

  type HookedElement = AceGridHookElement<
    TGridProps,
    THookOptions,
    TRows,
    TActions
  > &
    HookRuntimeBridge<TRows, TActions>;

  const HookBridge = ({
    host,
    gridProps,
    hookOptions,
  }: {
    host: HookedElement;
    gridProps: TGridProps;
    hookOptions: THookOptions;
  }) => {
    const resolvedHookOptions = mapHookOptions
      ? mapHookOptions(hookOptions, host)
      : hookOptions;
    const [rows, actions] = useHook(resolvedHookOptions);

    React.useLayoutEffect(() => {
      host.setHookRuntimeState(rows, actions);
      return () => host.clearHookRuntimeState();
    }, [actions, host, rows]);

    const resolvedGridProps = mapGridProps({
      gridProps,
      hookOptions: resolvedHookOptions,
      rows,
      actions,
      host,
    });
    const templatedGridProps = applyAceGridDomTemplates(
      resolvedGridProps,
      host.templates,
      host,
    );

    return React.createElement(
      GridComponent,
      bridgeAceGridProps(templatedGridProps, host),
    );
  };

  return class AceGridHookElementImpl
    extends HTMLElement
    implements AceGridHookElement<TGridProps, THookOptions, TRows, TActions>
  {
    root: Root | null = null;
    mountNode: HTMLDivElement | null = null;
    internalProps = {} as TGridProps;
    internalHookOptions = {} as THookOptions;
    internalTemplates: AceGridTemplateRegistry = {};
    internalRows: TRows | null = null;
    internalActions: TActions | null = null;

    connectedCallback() {
      if (!this.mountNode) {
        this.mountNode = document.createElement("div");
        this.mountNode.style.display = "contents";
        this.replaceChildren(this.mountNode);
      }
      if (!this.root) {
        this.root = createRoot(this.mountNode);
      }
      this.rerender();
    }

    disconnectedCallback() {
      this.root?.unmount();
      this.root = null;
      this.mountNode = null;
      this.clearHookRuntimeState();
    }

    get props() {
      return this.internalProps;
    }

    set props(nextProps: TGridProps) {
      this.internalProps = (nextProps ?? {}) as TGridProps;
      this.rerender();
    }

    get gridProps() {
      return this.internalProps;
    }

    set gridProps(nextProps: TGridProps) {
      this.props = nextProps;
    }

    get templates() {
      return this.internalTemplates;
    }

    set templates(nextTemplates: AceGridTemplateRegistry) {
      this.internalTemplates = nextTemplates ?? {};
      this.rerender();
    }

    setProps = (partial: Partial<TGridProps>) => {
      this.internalProps = {
        ...this.internalProps,
        ...partial,
      };
      this.rerender();
    };

    getProps = () => this.internalProps;

    setTemplates = (partial: Partial<AceGridTemplateRegistry>) => {
      this.internalTemplates = {
        ...this.internalTemplates,
        ...partial,
      };
      this.rerender();
    };

    getTemplates = () => this.internalTemplates;

    get hookOptions() {
      return this.internalHookOptions;
    }

    set hookOptions(nextOptions: THookOptions) {
      this.internalHookOptions = (nextOptions ?? {}) as THookOptions;
      this.rerender();
    }

    setHookOptions = (partial: Partial<THookOptions>) => {
      this.internalHookOptions = {
        ...this.internalHookOptions,
        ...partial,
      };
      this.rerender();
    };

    getHookOptions = () => this.internalHookOptions;

    get rows() {
      return this.internalRows;
    }

    getRows = () => this.internalRows;

    get actions() {
      return this.internalActions;
    }

    get api() {
      return this.internalActions;
    }

    getActions = () => this.internalActions;

    getApi = () => this.internalActions;

    setHookRuntimeState = (rows: TRows, actions: TActions) => {
      this.internalRows = rows;
      this.internalActions = actions;
    };

    clearHookRuntimeState = () => {
      this.internalRows = null;
      this.internalActions = null;
    };

    rerender = () => {
      if (!this.root) return;
      this.root.render(
        React.createElement(HookBridge, {
          host: this as HookedElement,
          gridProps: this.internalProps,
          hookOptions: this.internalHookOptions,
        }),
      );
    };
  };
};

export const defineAceGridHookElement = <
  TGridProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
>(
  tagName: string,
  useHook: ReactHook<THookOptions, TRows, TActions>,
  GridComponent: ReactGridComponent<TGridProps>,
  options: CreateAceGridHookElementClassOptions<
    TGridProps,
    THookOptions,
    TRows,
    TActions
  >,
) => {
  const existing = customElements.get(tagName) as
    | (CustomElementConstructor & typeof HTMLElement)
    | undefined;
  if (existing) return existing;

  const ElementClass = createAceGridHookElementClass(
    useHook,
    GridComponent,
    options,
  );
  customElements.define(tagName, ElementClass);
  return ElementClass;
};

export interface AceGridUseGridElement<
  TGridProps extends GridComponentProps = GridComponentProps,
> extends AceGridHookElement<
    TGridProps,
    UseGridOptions,
    GridRow[],
    GridActions
  > {}

export const createAceGridUseGridElementClass = <
  TGridProps extends GridComponentProps = GridComponentProps,
>(
  useGridHook: ReactHook<UseGridOptions, GridRow[], GridActions>,
  GridComponent: ReactGridComponent<TGridProps>,
  options: CreateAceGridHookElementClassOptions<
    TGridProps,
    UseGridOptions,
    GridRow[],
    GridActions
  >,
) => createAceGridHookElementClass(useGridHook, GridComponent, options);

export const defineAceGridUseGridElement = <
  TGridProps extends GridComponentProps = GridComponentProps,
>(
  tagName: string,
  useGridHook: ReactHook<UseGridOptions, GridRow[], GridActions>,
  GridComponent: ReactGridComponent<TGridProps>,
  options: CreateAceGridHookElementClassOptions<
    TGridProps,
    UseGridOptions,
    GridRow[],
    GridActions
  >,
) => defineAceGridHookElement(tagName, useGridHook, GridComponent, options);
