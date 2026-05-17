import React from "react";
import type { CSSProperties } from "react";
import {
  GridIconDefinition,
  GridIconRenderer,
  GridIconSetInput,
  GridIconStateBase,
  GridIconSet,
  GridTheme,
  GridThemeComponents,
  GridThemeInlineStyleOverrides,
  GridThemeInput,
  GridThemeName,
  GridThemeTokens,
} from "./types";
import { builtInThemes, dataTheme } from "./themes";
import { cx } from "../../utils/cx";

const DEFAULT_THEME_NAME: GridThemeName = "data";

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const hashString = (value: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

const THEME_CSS_ARTIFACT_CACHE_LIMIT = 64;

type ThemeCssArtifact = {
  slug: string;
  cssText: string;
  styleElementId: string;
};

const themeCssArtifactCache = new Map<string, ThemeCssArtifact>();

const getCachedThemeCssArtifact = (
  cacheKey: string,
  build: () => ThemeCssArtifact
): ThemeCssArtifact => {
  const cached = themeCssArtifactCache.get(cacheKey);
  if (cached) {
    // Refresh insertion order to approximate LRU behavior.
    themeCssArtifactCache.delete(cacheKey);
    themeCssArtifactCache.set(cacheKey, cached);
    return cached;
  }

  const artifact = build();
  themeCssArtifactCache.set(cacheKey, artifact);
  if (themeCssArtifactCache.size > THEME_CSS_ARTIFACT_CACHE_LIMIT) {
    const oldestKey = themeCssArtifactCache.keys().next().value as
      | string
      | undefined;
    if (oldestKey) {
      themeCssArtifactCache.delete(oldestKey);
    }
  }
  return artifact;
};

const UNITLESS_CSS_PROPERTIES = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "fillOpacity",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "fontWeight",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "scale",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
]);

const kebabCaseCssProperty = (property: string) => {
  if (property.startsWith("--")) return property;
  return property
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^ms-/, "-ms-");
};

const cssValueToString = (property: string, value: string | number) => {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return null;
    if (value === 0 || UNITLESS_CSS_PROPERTIES.has(property)) {
      return String(value);
    }
    return `${value}px`;
  }
  return String(value);
};

const serializeInlineStyleObject = (
  style: CSSProperties,
  important = false
): string => {
  const entries = Object.entries(style ?? {}).filter(([, value]) => value != null);
  if (!entries.length) return "";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([property, rawValue]) => {
      const cssValue = cssValueToString(
        property,
        rawValue as string | number
      );
      if (cssValue == null) return "";
      return `  ${kebabCaseCssProperty(property)}: ${cssValue}${important ? " !important" : ""};`;
    })
    .filter(Boolean)
    .join("\n");
};

const resolveScopedSelector = (scope: string, selector: string) => {
  const trimmed = selector.trim();
  if (!trimmed || trimmed === "&") return scope;
  if (trimmed.includes("&")) return trimmed.replace(/&/g, scope);
  return `${scope} ${trimmed}`;
};

const mergeInlineStyleOverrides = (
  ...maps: Array<GridThemeInlineStyleOverrides | undefined>
): GridThemeInlineStyleOverrides | undefined => {
  let merged: GridThemeInlineStyleOverrides | undefined;
  for (const map of maps) {
    if (!map) continue;
    for (const [selector, style] of Object.entries(map)) {
      if (!style) continue;
      merged = merged ?? {};
      merged[selector] = {
        ...(merged[selector] ?? {}),
        ...style,
      };
    }
  }
  return merged;
};

const buildInlineStyleOverridesCss = (
  slug: string,
  overrides?: GridThemeInlineStyleOverrides
) => {
  if (!overrides) return "";
  const scope = `[data-ace-grid-theme="${slug}"]`;
  const blocks = Object.entries(overrides)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([selector, style]) => {
      const declarations = serializeInlineStyleObject(style, true);
      if (!declarations) return "";
      return `${resolveScopedSelector(scope, selector)} {\n${declarations}\n}`;
    })
    .filter(Boolean);
  return blocks.join("\n");
};

const serializeInlineStyleOverridesForHash = (
  overrides?: GridThemeInlineStyleOverrides
) => {
  if (!overrides) return "";
  return Object.entries(overrides)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([selector, style]) => {
      const declarations = serializeInlineStyleObject(style, false);
      if (!declarations) return "";
      return `${selector}\n${declarations}`;
    })
    .filter(Boolean)
    .join("\n");
};

type SvgIconOptions = {
  viewBox?: string;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
};

const iconChildren = (...children: React.ReactNode[]) =>
  React.createElement(React.Fragment, null, ...children);

const createSvgIcon = (
  className: string | undefined,
  children: React.ReactNode,
  {
    viewBox = "0 0 16 16",
    strokeWidth = 1.7,
    fill = "none",
    stroke = "currentColor",
  }: SvgIconOptions = {}
) =>
  React.createElement(
    "svg",
    {
      className,
      viewBox,
      width: "1em",
      height: "1em",
      fill,
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: false,
    },
    children
  );

const svgPath = (d: string, props?: React.SVGProps<SVGPathElement>) =>
  React.createElement("path", { d, ...(props ?? {}) });

const svgLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  props?: React.SVGProps<SVGLineElement>
) => React.createElement("line", { x1, y1, x2, y2, ...(props ?? {}) });

const svgCircle = (
  cx: number,
  cy: number,
  r: number,
  props?: React.SVGProps<SVGCircleElement>
) => React.createElement("circle", { cx, cy, r, ...(props ?? {}) });

const svgRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  props?: React.SVGProps<SVGRectElement>
) => React.createElement("rect", { x, y, width, height, ...(props ?? {}) });

const withMergedClassName = (
  icon: React.ReactElement,
  className?: string
) => {
  if (!className) return icon;
  const existingClassName =
    (icon.props as { className?: string } | undefined)?.className ?? "";
  const mergedClassName = cx(existingClassName, className);
  return React.cloneElement(icon, { className: mergedClassName });
};

const ICON_DRAG_ROW = createSvgIcon(
  undefined,
  iconChildren(
    svgCircle(8, 3.5, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(8, 8, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(8, 12.5, 0.85, { fill: "currentColor", stroke: "none" })
  ),
  { stroke: "none", fill: "none" }
);

const ICON_DRAG_COLUMN = createSvgIcon(
  undefined,
  iconChildren(
    svgCircle(5, 4, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(5, 8, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(5, 12, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(11, 4, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(11, 8, 0.85, { fill: "currentColor", stroke: "none" }),
    svgCircle(11, 12, 0.85, { fill: "currentColor", stroke: "none" })
  ),
  { stroke: "none", fill: "none" }
);

const ICON_SORT_ASC = createSvgIcon(
  undefined,
  iconChildren(svgLine(8, 13, 8, 3), svgPath("M5.7 5.6 8 3.3l2.3 2.3"))
);

const ICON_SORT_DESC = createSvgIcon(
  undefined,
  iconChildren(svgLine(8, 3, 8, 13), svgPath("M5.7 10.4 8 12.7l2.3-2.3"))
);

const ICON_SORT_NEUTRAL = createSvgIcon(
  undefined,
  iconChildren(
    svgPath("M5.4 6.3 8 3.7l2.6 2.6"),
    svgPath("M5.4 9.7 8 12.3l2.6-2.6")
  )
);

const ICON_FILTER = createSvgIcon(
  undefined,
  iconChildren(svgPath("M2.4 3h11.2L9.4 7.9v3.4l-2 1.3V7.9L2.4 3Z")),
  { strokeWidth: 1.55 }
);

const ICON_FILTER_ACTIVE = createSvgIcon(
  undefined,
  iconChildren(
    svgPath("M2.4 3h11.2L9.4 7.9v3.4l-2 1.3V7.9L2.4 3Z"),
    svgCircle(12.4, 3.6, 1.15, {
      fill: "currentColor",
      stroke: "none",
      opacity: 0.92,
    })
  ),
  { strokeWidth: 1.55 }
);

const ICON_PIN_LEFT = createSvgIcon(
  undefined,
  iconChildren(
    svgLine(3.2, 2.8, 3.2, 13.2),
    svgLine(12.3, 8, 6.2, 8),
    svgPath("M8.6 5.7 6.2 8l2.4 2.3")
  )
);

const ICON_PIN_RIGHT = createSvgIcon(
  undefined,
  iconChildren(
    svgLine(12.8, 2.8, 12.8, 13.2),
    svgLine(3.7, 8, 9.8, 8),
    svgPath("M7.4 5.7 9.8 8l-2.4 2.3")
  )
);

const ICON_PIN_CLEAR = createSvgIcon(
  undefined,
  svgPath(
    "M20.9701 17.1716 19.5559 18.5858 16.0214 15.0513 15.9476 15.1251 15.2405 18.6606 13.8263 20.0748 9.58369 15.8322 4.63394 20.7819 3.21973 19.3677 8.16947 14.418 3.92683 10.1753 5.34105 8.7611 8.87658 8.05399 8.95029 7.98028 5.41373 4.44371 6.82794 3.0295 20.9701 17.1716ZM10.3645 9.39449 9.86261 9.8964 7.04072 10.4608 13.5409 16.9609 14.1052 14.139 14.6071 13.6371 10.3645 9.39449ZM18.7761 9.46821 17.4356 10.8087 18.8498 12.2229 20.1903 10.8824 20.8974 11.5895 22.3116 10.1753 13.8263 1.69003 12.4121 3.10425 13.1192 3.81135 11.7787 5.15185 13.1929 6.56607 14.5334 5.22557 18.7761 9.46821Z",
    { stroke: "none" }
  ),
  { viewBox: "0 0 24 24", stroke: "none", fill: "currentColor" }
);

const defaultIcons: GridIconSet = {
  dragHandle: ({ className, orientation }) =>
    orientation === "row"
      ? withMergedClassName(ICON_DRAG_ROW, className)
      : withMergedClassName(ICON_DRAG_COLUMN, className),
  sort: ({ className, direction }) =>
    direction === "asc"
      ? withMergedClassName(ICON_SORT_ASC, className)
      : direction === "desc"
        ? withMergedClassName(ICON_SORT_DESC, className)
        : withMergedClassName(ICON_SORT_NEUTRAL, className),
  filter: ({ className, isActive, isOpen }) =>
    isActive || isOpen
      ? withMergedClassName(ICON_FILTER_ACTIVE, className)
      : withMergedClassName(ICON_FILTER, className),
  pinLeft: ({ className }) =>
    withMergedClassName(ICON_PIN_LEFT, className),
  pinRight: ({ className }) =>
    withMergedClassName(ICON_PIN_RIGHT, className),
  pinClear: ({ className }) =>
    withMergedClassName(ICON_PIN_CLEAR, className),
  headerGroupChevron: ({ className, isOpen }) =>
    createSvgIcon(
      className,
      isOpen
        ? svgPath("M1.5 3.5 5 7l3.5-3.5")
        : svgPath("M3.5 1.5 7 5 3.5 8.5"),
      { viewBox: "0 0 10 10", strokeWidth: 1.4 }
    ),
  rowPinningHeader: ({ className }) =>
    createSvgIcon(
      className,
      svgPath(
        "M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z",
        { stroke: "none" }
      ),
      { stroke: "none", fill: "currentColor" }
    ),
  rowOrderingHeader: ({ className }) =>
    withMergedClassName(ICON_DRAG_COLUMN, className),
  rowDetailToggle: ({ className, expanded }) =>
    createSvgIcon(
      className,
      expanded ? svgPath("M3 4.5 6 7.5 9 4.5") : svgPath("M4.5 3 7.5 6 4.5 9"),
      { viewBox: "0 0 12 12", strokeWidth: 1.7 }
    ),
  pinRowTop: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgLine(3, 3.3, 13, 3.3),
        svgLine(8, 12.6, 8, 5.5),
        svgPath("M5.8 7.8 8 5.5l2.2 2.3")
      )
    ),
  pinRowBottom: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgLine(3, 12.7, 13, 12.7),
        svgLine(8, 3.4, 8, 10.5),
        svgPath("M5.8 8.2 8 10.5l2.2-2.3")
      )
    ),
  paginationFirst: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgLine(4.4, 3.6, 4.4, 12.4),
        svgPath("M11.2 4.2 7.4 8l3.8 3.8")
      ),
      { strokeWidth: 2 }
    ),
  paginationPrev: ({ className }) =>
    createSvgIcon(className, svgPath("M10.2 4.2 6.4 8l3.8 3.8"), {
      strokeWidth: 2,
    }),
  paginationNext: ({ className }) =>
    createSvgIcon(className, svgPath("M5.8 4.2 9.6 8l-3.8 3.8"), {
      strokeWidth: 2,
    }),
  paginationLast: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgPath("M4.8 4.2 8.6 8l-3.8 3.8"),
        svgLine(11.6, 3.6, 11.6, 12.4)
      ),
      { strokeWidth: 2 }
    ),
  chartCreate: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgPath("M2.8 12.6h7.1"),
        svgPath("M3.3 10.5 5.3 8.5l1.9 1.9 2.8-3.1"),
        svgLine(12, 3.6, 12, 8.2),
        svgLine(9.7, 5.9, 14.3, 5.9)
      )
    ),
  chartClose: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(svgLine(4.2, 4.2, 11.8, 11.8), svgLine(11.8, 4.2, 4.2, 11.8))
    ),
  chartTypeLine: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(svgPath("M2.6 11.5 6.1 8.4l2.3 1.9 5-5"), svgLine(2.4, 12.6, 13.6, 12.6))
    ),
  chartTypeArea: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgPath("M2.8 12.3 6.3 8.7l2.2 2.1 4.7-4.8v6.3H2.8Z", {
          fill: "currentColor",
          stroke: "none",
          opacity: 0.28,
        }),
        svgPath("M2.8 12.3 6.3 8.7l2.2 2.1 4.7-4.8")
      )
    ),
  chartTypeColumn: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(3, 8.4, 2.2, 4.2, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(6.9, 6.3, 2.2, 6.3, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(10.8, 4.6, 2.2, 8, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        })
      ),
      { stroke: "none" }
    ),
  chartTypeBar: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(2.8, 3.5, 7.4, 2, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(2.8, 7, 10.4, 2, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(2.8, 10.5, 5.1, 2, {
          rx: 0.7,
          fill: "currentColor",
          stroke: "none",
        })
      ),
      { stroke: "none" }
    ),
  chartTypeStackedColumn: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(3, 10.1, 2.2, 2.5, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(3, 6.4, 2.2, 3.6, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        }),
        svgRect(6.9, 8.8, 2.2, 3.8, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(6.9, 4.2, 2.2, 4.5, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        }),
        svgRect(10.8, 9.6, 2.2, 3, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(10.8, 5.3, 2.2, 4.2, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        })
      ),
      { stroke: "none" }
    ),
  chartTypeStackedBar: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(2.8, 3.5, 4.8, 2, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(7.6, 3.5, 4.6, 2, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        }),
        svgRect(2.8, 7, 6.4, 2, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(9.2, 7, 3.1, 2, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        }),
        svgRect(2.8, 10.5, 3.6, 2, {
          rx: 0.6,
          fill: "currentColor",
          stroke: "none",
          opacity: 0.78,
        }),
        svgRect(6.4, 10.5, 5.8, 2, {
          rx: 0.6,
          fill: "currentColor",
          opacity: 0.3,
          stroke: "none",
        })
      ),
      { stroke: "none" }
    ),
  chartTypePie: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgCircle(8, 8, 5.3),
        svgPath("M8 8V2.7A5.3 5.3 0 0 1 12.6 6Z", {
          fill: "currentColor",
          stroke: "none",
          opacity: 0.35,
        })
      )
    ),
  chartTypeDonut: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgCircle(8, 8, 5.3),
        svgCircle(8, 8, 2.5),
        svgPath("M8 8V2.7A5.3 5.3 0 0 1 12.6 6Z", {
          fill: "currentColor",
          stroke: "none",
          opacity: 0.35,
        })
      ),
      { fill: "none" }
    ),
  chartTypeScatter: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgCircle(4.2, 10.6, 1.1, { fill: "currentColor", stroke: "none" }),
        svgCircle(8.1, 8.2, 1.1, { fill: "currentColor", stroke: "none" }),
        svgCircle(11.8, 5.6, 1.1, { fill: "currentColor", stroke: "none" })
      ),
      { stroke: "none", fill: "none" }
    ),
  chartTypeBubble: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgCircle(4.5, 10.4, 1.6, { fill: "currentColor", stroke: "none", opacity: 0.45 }),
        svgCircle(8.4, 8.1, 2.2, { fill: "currentColor", stroke: "none", opacity: 0.4 }),
        svgCircle(12, 5.4, 1.2, { fill: "currentColor", stroke: "none", opacity: 0.55 })
      ),
      { stroke: "none", fill: "none" }
    ),
  chartTypeHistogram: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(3, 9.2, 2.3, 3.4, {
          rx: 0.45,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(5.4, 7, 2.3, 5.6, {
          rx: 0.45,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(7.8, 5.2, 2.3, 7.4, {
          rx: 0.45,
          fill: "currentColor",
          stroke: "none",
        }),
        svgRect(10.2, 8, 2.3, 4.6, {
          rx: 0.45,
          fill: "currentColor",
          stroke: "none",
        })
      ),
      { stroke: "none" }
    ),
  chartTypeHeatmap: ({ className }) =>
    createSvgIcon(
      className,
      iconChildren(
        svgRect(3, 3, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.28 }),
        svgRect(6.5, 3, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.45 }),
        svgRect(10, 3, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.72 }),
        svgRect(3, 6.5, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.4 }),
        svgRect(6.5, 6.5, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.62 }),
        svgRect(10, 6.5, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.32 }),
        svgRect(3, 10, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.72 }),
        svgRect(6.5, 10, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.34 }),
        svgRect(10, 10, 3, 3, { rx: 0.45, fill: "currentColor", stroke: "none", opacity: 0.56 })
      ),
      { stroke: "none", fill: "none" }
    ),
};

const isIntrinsicIconTag = (value: string) => /^[a-z][\w:-]*$/.test(value);

const normalizeIcon = <State extends GridIconStateBase>(
  icon: GridIconDefinition<State>
): GridIconRenderer<State> => {
  if (typeof icon === "function") {
    return (state) =>
      React.createElement(icon as React.ComponentType<State>, state);
  }

  if (typeof icon === "string" && isIntrinsicIconTag(icon)) {
    return (state) =>
      React.createElement(icon, { className: state.className });
  }

  return (state) => {
    if (React.isValidElement(icon)) {
      const existingClassName =
        (icon.props as { className?: string } | undefined)?.className ?? "";
      const mergedClassName = cx(existingClassName, state.className);
      if (!mergedClassName) return icon;
      return React.cloneElement(icon, { className: mergedClassName });
    }
    if (!state.className) return icon;
    return React.createElement("span", { className: state.className }, icon);
  };
};

const normalizeIconSet = (icons: GridIconSetInput): GridIconSet => ({
  dragHandle: normalizeIcon(icons.dragHandle),
  sort: normalizeIcon(icons.sort),
  filter: normalizeIcon(icons.filter),
  pinLeft: normalizeIcon(icons.pinLeft),
  pinRight: normalizeIcon(icons.pinRight),
  pinClear: normalizeIcon(icons.pinClear),
  headerGroupChevron: normalizeIcon(icons.headerGroupChevron),
  rowPinningHeader: normalizeIcon(icons.rowPinningHeader),
  rowOrderingHeader: normalizeIcon(icons.rowOrderingHeader),
  rowDetailToggle: normalizeIcon(icons.rowDetailToggle),
  pinRowTop: icons.pinRowTop ? normalizeIcon(icons.pinRowTop) : undefined,
  pinRowBottom: icons.pinRowBottom
    ? normalizeIcon(icons.pinRowBottom)
    : undefined,
  paginationFirst: normalizeIcon(icons.paginationFirst),
  paginationPrev: normalizeIcon(icons.paginationPrev),
  paginationNext: normalizeIcon(icons.paginationNext),
  paginationLast: normalizeIcon(icons.paginationLast),
  chartCreate: normalizeIcon(icons.chartCreate),
  chartClose: normalizeIcon(icons.chartClose),
  chartTypeLine: normalizeIcon(icons.chartTypeLine),
  chartTypeArea: normalizeIcon(icons.chartTypeArea),
  chartTypeColumn: normalizeIcon(icons.chartTypeColumn),
  chartTypeBar: normalizeIcon(icons.chartTypeBar),
  chartTypeStackedColumn: normalizeIcon(icons.chartTypeStackedColumn),
  chartTypeStackedBar: normalizeIcon(icons.chartTypeStackedBar),
  chartTypePie: normalizeIcon(icons.chartTypePie),
  chartTypeDonut: normalizeIcon(icons.chartTypeDonut),
  chartTypeScatter: normalizeIcon(icons.chartTypeScatter),
  chartTypeBubble: normalizeIcon(icons.chartTypeBubble),
  chartTypeHistogram: normalizeIcon(icons.chartTypeHistogram),
  chartTypeHeatmap: normalizeIcon(icons.chartTypeHeatmap),
});

const mergeComponents = (
  base: GridThemeComponents | undefined,
  overrides: GridThemeComponents | undefined
) => ({
  ...(base ?? {}),
  ...(overrides ?? {}),
});

const buildThemeCss = (
  slug: string,
  tokens: GridThemeTokens,
  extraCss?: string,
  inlineStyleOverrides?: GridThemeInlineStyleOverrides
) => {
  const chartPaletteVars = tokens.chartPalette
    .map((color, index) => `  --ace-grid-chart-palette-${index + 1}: ${color};`)
    .join("\n");
  const inlineStyleOverridesCss = buildInlineStyleOverridesCss(
    slug,
    inlineStyleOverrides
  );

  return `
[data-ace-grid-theme="${slug}"] {
  --ace-grid-font-family: ${tokens.fontFamily};
  --ace-grid-font-size: ${tokens.fontSize}px;
  --ace-grid-border-radius: ${tokens.borderRadius};
  --ace-grid-border-radius-sm: ${tokens.borderRadiusSmall};
  --ace-grid-surface-base: ${tokens.surfaceBase};
  --ace-grid-surface-subtle: ${tokens.surfaceSubtle};
  --ace-grid-surface-raised: ${tokens.surfaceRaised};
  --ace-grid-surface-sunken: ${tokens.surfaceSunken};
  --ace-grid-border-color: ${tokens.borderColor};
  --ace-grid-border-color-strong: ${tokens.borderColorStrong};
  --ace-grid-header-border-color: ${tokens.headerBorderColor};
  --ace-grid-cell-border-color: ${tokens.cellBorderColor};
  --ace-grid-cell-border-color-alt: ${tokens.cellBorderColorAlt};
  --ace-grid-border: ${tokens.gridBorder};
  --ace-grid-shadow: ${tokens.gridShadow};
  --ace-grid-backdrop-filter: ${tokens.gridBackdropFilter};
  --ace-grid-text-primary: ${tokens.textPrimary};
  --ace-grid-text-secondary: ${tokens.textSecondary};
  --ace-grid-text-muted: ${tokens.textMuted};
  --ace-grid-text-on-accent: ${tokens.textOnAccent};
  --ace-grid-header-bg: ${tokens.headerBackground};
  --ace-grid-header-bg-pinned: ${tokens.headerBackgroundPinned};
  --ace-grid-header-bg-dragging: ${tokens.headerBackgroundDragging};
  --ace-grid-header-bg-selected: ${tokens.headerBackgroundSelected};
  --ace-grid-header-bg-hover: ${tokens.headerBackgroundHover};
  --ace-grid-header-text-color: ${tokens.headerTextColor};
  --ace-grid-header-shadow: ${tokens.headerShadow};
  --ace-grid-header-backdrop: ${tokens.headerBackdropFilter};
  --ace-grid-pinned-left-bg: ${tokens.pinnedLeftBackground};
  --ace-grid-pinned-right-bg: ${tokens.pinnedRightBackground};
  --ace-grid-pinned-shadow-left: ${tokens.pinnedShadowLeft};
  --ace-grid-pinned-shadow-right: ${tokens.pinnedShadowRight};
  --ace-grid-pinned-shadow-left-edge: ${tokens.pinnedEdgeShadowLeft};
  --ace-grid-pinned-shadow-right-edge: ${tokens.pinnedEdgeShadowRight};
  --ace-grid-cell-bg: ${tokens.cellBackground};
  --ace-grid-cell-bg-hover: ${tokens.cellBackgroundHover};
  --ace-grid-cell-bg-selected: ${tokens.cellBackgroundSelected};
  --ace-grid-cell-bg-pinned: ${tokens.cellBackgroundPinned};
  --ace-grid-cell-text: ${tokens.cellTextColor};
  --ace-grid-cell-padding-y: ${tokens.cellPaddingVertical}px;
  --ace-grid-cell-padding-x: ${tokens.cellPaddingHorizontal}px;
  --ace-grid-cell-radius: ${tokens.cellBorderRadius};
  --ace-grid-cell-shadow: ${tokens.cellShadow};
  --ace-grid-cell-hover-shadow: ${tokens.cellHoverShadow};
  --ace-grid-cell-selected-shadow: ${tokens.cellSelectedShadow};
  --ace-grid-row-hover-bg: ${tokens.rowHoverBackground};
  --ace-grid-row-active-bg: ${tokens.rowActiveBackground};
  --ace-grid-row-border: ${tokens.rowBorderColor};
  --ace-grid-row-shadow: ${tokens.rowShadow};
  --ace-grid-span-bg: ${tokens.spanCellBackground};
  --ace-grid-span-bg-selected: ${tokens.spanCellSelectedBackground};
  --ace-grid-span-border: ${tokens.spanCellBorder};
  --ace-grid-span-shadow: ${tokens.spanCellShadow};
  --ace-grid-sparkline-line: ${tokens.sparklineLineColor};
  --ace-grid-sparkline-fill: ${tokens.sparklineAreaFill};
  --ace-grid-sparkline-axis: ${tokens.sparklineAxisColor};
  --ace-grid-sparkline-marker-fill: ${tokens.sparklineMarkerFill};
  --ace-grid-sparkline-marker-stroke: ${tokens.sparklineMarkerStroke};
  --ace-grid-sparkline-positive: ${tokens.sparklinePositiveColor};
  --ace-grid-sparkline-negative: ${tokens.sparklineNegativeColor};
  --ace-grid-sparkline-zero: ${tokens.sparklineZeroColor};
  --ace-grid-sparkline-highlight-min: ${tokens.sparklineHighlightMin};
  --ace-grid-sparkline-highlight-max: ${tokens.sparklineHighlightMax};
  --ace-grid-selection-border: ${tokens.selectionBorder};
  --ace-grid-selection-fill: ${tokens.selectionFill};
  --ace-grid-accent: ${tokens.checkboxAccent};
  --ace-grid-fill-handle-bg: ${tokens.fillHandleBackground};
  --ace-grid-fill-handle-bg-hover: ${tokens.selectionBorder};
  --ace-grid-fill-handle-border: ${tokens.fillHandleBorder};
  --ace-grid-fill-handle-border-width: 0;
  --ace-grid-fill-handle-size: 10px;
  --ace-grid-fill-handle-radius: 0px;
  --ace-grid-fill-handle-icon-color: ${tokens.textOnAccent};
  --ace-grid-fill-handle-icon-size: 8px;
  --ace-grid-fill-handle-inner: 2px;
  --ace-grid-fill-handle-inner-border: none;
  --ace-grid-fill-handle-z: 30;
  --ace-grid-fill-handle-shadow: ${tokens.fillHandleShadow};
  --ace-grid-drop-indicator: ${tokens.dropIndicator};
  --ace-grid-drop-indicator-pin: ${tokens.dropIndicatorPin};
  --ace-grid-drop-indicator-unpin: ${tokens.dropIndicatorUnpin};
  --ace-grid-drop-indicator-cross: ${tokens.dropIndicatorCrossPin};
  --ace-grid-header-drop-bg: ${tokens.infoBackground};
  --ace-grid-scrollbar-track: ${tokens.scrollbarTrack};
  --ace-grid-scrollbar-thumb: ${tokens.scrollbarThumb};
  --ace-grid-scrollbar-thumb-hover: ${tokens.scrollbarThumbHover};
  --ace-grid-filter-icon: ${tokens.filterIconDefault};
  --ace-grid-filter-icon-active: ${tokens.filterIconActive};
  --ace-grid-filter-indicator: ${tokens.filterIndicatorColor};
  --ace-grid-filter-indicator-border: ${tokens.filterIndicatorBorderColor};
  --ace-grid-filter-indicator-size: ${tokens.filterIndicatorSize}px;
  --ace-grid-sort-icon: ${tokens.sortIconDefault};
  --ace-grid-sort-icon-active: ${tokens.sortIconActive};
  --ace-grid-pin-icon: ${tokens.pinIconDefault};
  --ace-grid-pin-icon-active: ${tokens.pinIconActive};
  --ace-grid-pin-icon-disabled: ${tokens.pinIconDisabled};
  --ace-grid-focus-outline: ${tokens.focusOutline};
  --ace-grid-focus-outline-width: ${tokens.focusOutlineWidth};
  /* Back-compat alias used by legacy chart styles. */
  --ace-grid-focus-ring: ${tokens.focusOutline};
  --ace-grid-resize-handle-color: ${tokens.resizeHandleColor};
  --ace-grid-resize-handle-active: ${tokens.resizeHandleActiveColor};
  --ace-grid-resize-handle-shadow: ${tokens.resizeHandleShadow};
  --ace-grid-drag-ghost-bg: ${tokens.dragGhostBackground};
  --ace-grid-drag-ghost-border: ${tokens.dragGhostBorder};
  --ace-grid-drag-ghost-shadow: ${tokens.dragGhostShadow};
  --ace-grid-success-bg: ${tokens.successBackground};
  --ace-grid-success-border: ${tokens.successBorder};
  --ace-grid-danger-bg: ${tokens.dangerBackground};
  --ace-grid-danger-border: ${tokens.dangerBorder};
  --ace-grid-pinned-row-top-bg: ${tokens.successBackground};
  --ace-grid-pinned-row-bottom-bg: ${tokens.dangerBackground};
  --ace-grid-pinned-row-top-shadow: ${tokens.successShadow};
  --ace-grid-pinned-row-bottom-shadow: ${tokens.dangerShadow};
  --ace-grid-warning-bg: ${tokens.warningBackground};
  --ace-grid-warning-border: ${tokens.warningBorder};
  --ace-grid-info-bg: ${tokens.infoBackground};
  --ace-grid-info-border: ${tokens.infoBorder};
  --ace-grid-search-highlight-bg: ${tokens.warningBackground};
  --ace-grid-search-highlight-text: ${tokens.textPrimary};
  --ace-grid-search-active-highlight-bg: ${tokens.warningBorder};
  --ace-grid-search-active-highlight-text: ${tokens.textPrimary};
  --ace-grid-search-active-highlight-ring: ${tokens.warningBorder};
  --ace-grid-validation-error: ${tokens.dangerBorder};
  --ace-grid-validation-warning: ${tokens.warningBorder};
  --ace-grid-validation-info: ${tokens.infoBorder};
  --ace-grid-validation-bg-error: ${tokens.dangerBackground};
  --ace-grid-validation-bg-warning: ${tokens.warningBackground};
  --ace-grid-validation-bg-info: ${tokens.infoBackground};
  --ace-grid-validation-tooltip-bg: ${tokens.surfaceSunken};
  --ace-grid-validation-tooltip-text: ${tokens.textOnAccent};
  --ace-grid-validation-tooltip-shadow: ${tokens.popupShadow};
  --ace-grid-formula-bg: ${tokens.formulaBarBackground};
  --ace-grid-formula-border: ${tokens.formulaBarBorder};
  --ace-grid-formula-input-border: ${tokens.formulaBarInputBorder};
  --ace-grid-formula-badge-bg: ${tokens.formulaBarSelectionBadgeBackground};
  --ace-grid-formula-badge-text: ${tokens.formulaBarSelectionBadgeText};
  --ace-grid-formula-shadow: ${tokens.formulaBarShadow};
  --ace-grid-formula-font: ui-monospace, SFMono-Regular, Menlo, monospace;
  --ace-grid-formula-suggest-bg: ${tokens.popupBackground};
  --ace-grid-formula-suggest-border: ${tokens.popupBorder};
  --ace-grid-formula-suggest-shadow: ${tokens.popupShadow};
  --ace-grid-formula-suggest-active-bg: ${tokens.rowHoverBackground};
  --ace-grid-formula-suggest-title: ${tokens.textPrimary};
  --ace-grid-formula-suggest-desc: ${tokens.textSecondary};
  --ace-grid-formula-suggest-footer: ${tokens.textMuted};
  --ace-grid-formula-suggest-divider: ${tokens.borderColor};
  --ace-grid-popup-bg: ${tokens.popupBackground};
  --ace-grid-popup-border: ${tokens.popupBorder};
  --ace-grid-popup-shadow: ${tokens.popupShadow};
  --ace-grid-tooltip-bg: ${tokens.popupBackground};
  --ace-grid-tooltip-color: ${tokens.textPrimary};
  --ace-grid-tooltip-border: ${tokens.popupBorder};
  --ace-grid-tooltip-radius: ${tokens.borderRadiusSmall};
  --ace-grid-tooltip-shadow: ${tokens.popupShadow};
  --ace-grid-tooltip-backdrop: ${tokens.gridBackdropFilter};
  --ace-grid-tooltip-title: ${tokens.textPrimary};
  --ace-grid-tooltip-content: ${tokens.textSecondary};
  --ace-grid-checkbox-accent: ${tokens.checkboxAccent};
  --ace-grid-editor-bg: ${tokens.editorBackground};
  --ace-grid-editor-border: ${tokens.editorBorder};
  --ace-grid-editor-shadow: ${tokens.editorShadow};
  --ace-grid-editor-backdrop: ${tokens.editorBackdropFilter};
  --ace-grid-context-menu-bg: ${tokens.contextMenuBackground};
  --ace-grid-context-menu-border: ${tokens.contextMenuBorder};
  --ace-grid-context-menu-shadow: ${tokens.contextMenuShadow};
  --ace-grid-context-menu-divider: ${tokens.contextMenuDivider};
  --ace-grid-context-menu-text: ${tokens.contextMenuText};
  --ace-grid-context-menu-text-muted: ${tokens.contextMenuTextMuted};
  --ace-grid-context-menu-text-disabled: ${tokens.contextMenuTextDisabled};
  --ace-grid-context-menu-shortcut: ${tokens.contextMenuShortcut};
  --ace-grid-context-menu-hover: ${tokens.contextMenuItemHoverBackground};
  --ace-grid-context-menu-active: ${tokens.contextMenuItemActiveBackground};
  --ace-grid-chart-bg: ${tokens.chartBackground};
  --ace-grid-chart-plot-bg: ${tokens.chartPlotBackground};
  --ace-grid-chart-axis: ${tokens.chartAxisColor};
  --ace-grid-chart-grid: ${tokens.chartGridColor};
  --ace-grid-chart-label: ${tokens.chartLabelColor};
  --ace-grid-chart-legend: ${tokens.chartLegendText};
  --ace-grid-chart-legend-muted: ${tokens.chartLegendMuted};
  --ace-grid-chart-tooltip-bg: ${tokens.chartTooltipBackground};
  --ace-grid-chart-tooltip-border: ${tokens.chartTooltipBorder};
  --ace-grid-chart-tooltip-shadow: ${tokens.chartTooltipShadow};
  --ace-grid-chart-heatmap: ${tokens.chartHeatmapColor};
  --ace-grid-chart-heatmap-missing: ${tokens.chartHeatmapMissing};
  --ace-grid-chart-crosshair: ${tokens.chartAxisColor};
  --ace-grid-chart-brush-border: ${tokens.selectionBorder};
  --ace-grid-chart-brush-fill: ${tokens.selectionFill};
  --ace-grid-chart-zoom-border: ${tokens.borderColor};
  --ace-grid-chart-zoom-track: ${tokens.surfaceSunken};
  --ace-grid-chart-zoom-mask: ${tokens.surfaceRaised};
  --ace-grid-chart-zoom-window-border: ${tokens.selectionBorder};
  --ace-grid-chart-zoom-window-bg: ${tokens.selectionFill};
  --ace-grid-chart-zoom-handle-border: ${tokens.borderColorStrong};
  --ace-grid-chart-zoom-handle-bg: ${tokens.surfaceRaised};
  --ace-grid-chart-box-stroke: ${tokens.borderColorStrong};
  --ace-grid-chart-box-median: ${tokens.textPrimary};
  --ace-grid-chart-violin-stroke: ${tokens.borderColorStrong};
  --ace-grid-chart-waterfall-up: ${tokens.successBorder};
  --ace-grid-chart-waterfall-down: ${tokens.dangerBorder};
  --ace-grid-chart-waterfall-connector: ${tokens.chartAxisColor};
  --ace-grid-chart-bullet-range-1: ${tokens.surfaceSunken};
  --ace-grid-chart-bullet-range-2: ${tokens.surfaceSubtle};
  --ace-grid-chart-bullet-range-3: ${tokens.cellBackgroundPinned};
  --ace-grid-chart-bullet-actual: ${tokens.selectionBorder};
  --ace-grid-chart-bullet-target: ${tokens.textPrimary};
  --ace-grid-chart-candle-up: ${tokens.successBorder};
  --ace-grid-chart-candle-down: ${tokens.dangerBorder};
  --ace-grid-chart-candle-wick: ${tokens.chartAxisColor};
  --ace-grid-chart-chip-border: ${tokens.borderColor};
  --ace-grid-chart-chip-bg: ${tokens.selectionFill};
${chartPaletteVars}
}
${extraCss ? `\n${extraCss}\n` : ""}
${inlineStyleOverridesCss ? `\n${inlineStyleOverridesCss}\n` : ""}`.trim();
};

export interface GridResolvedTheme extends GridTheme {
  slug: string;
  components: GridThemeComponents;
  icons: GridIconSet;
  cssText: string;
  styleElementId: string;
}

const asTheme = (input?: GridThemeInput): GridTheme => {
  if (!input) return builtInThemes[DEFAULT_THEME_NAME];
  if (typeof input === "string") {
    return builtInThemes[input] ?? builtInThemes[DEFAULT_THEME_NAME];
  }
  return input;
};

export const resolveTheme = (
  input?: GridThemeInput,
  iconOverrides?: Partial<GridIconSetInput>,
  runtimeInlineStyleOverrides?: GridThemeInlineStyleOverrides
): GridResolvedTheme => {
  const requestedTheme = asTheme(input);
  const fallbackTheme = builtInThemes[DEFAULT_THEME_NAME];

  const tokens: GridThemeTokens = {
    ...fallbackTheme.tokens,
    ...requestedTheme.tokens,
  };

  const components = mergeComponents(
    fallbackTheme.components,
    requestedTheme.components
  );
  const inlineStyleOverrides = mergeInlineStyleOverrides(
    fallbackTheme.inlineStyleOverrides,
    requestedTheme.inlineStyleOverrides,
    runtimeInlineStyleOverrides
  );

  const icons: GridIconSetInput = {
    ...defaultIcons,
    ...(fallbackTheme.icons ?? {}),
    ...(requestedTheme.icons ?? {}),
    ...(iconOverrides ?? {}),
  };

  const mergedIcons = normalizeIconSet(icons);

  const baseSlug = slugify(requestedTheme.name || "grid-theme");
  const serializedTokens = JSON.stringify(tokens);
  const serializedInlineStyleOverrides =
    serializeInlineStyleOverridesForHash(inlineStyleOverrides);
  const variantSource = [
    serializedTokens,
    requestedTheme.css ?? "",
    serializedInlineStyleOverrides,
  ].join("\n");
  const themeCssArtifact = getCachedThemeCssArtifact(
    `${baseSlug}\n${variantSource}`,
    () => {
      const variantHash = hashString(variantSource).slice(0, 8);
      const slug = inlineStyleOverrides
        ? `${baseSlug}-${variantHash}`
        : baseSlug;
      const cssText = buildThemeCss(
        slug,
        tokens,
        requestedTheme.css,
        inlineStyleOverrides
      );
      return {
        slug,
        cssText,
        styleElementId: `ace-grid-theme-${slug}`,
      };
    }
  );

  return {
    ...requestedTheme,
    tokens,
    components,
    inlineStyleOverrides,
    icons: mergedIcons,
    cssText: themeCssArtifact.cssText,
    slug: themeCssArtifact.slug,
    styleElementId: themeCssArtifact.styleElementId,
  };
};

export const availableThemes = builtInThemes;
export const defaultTheme = dataTheme;
export const defaultThemeName = DEFAULT_THEME_NAME;
