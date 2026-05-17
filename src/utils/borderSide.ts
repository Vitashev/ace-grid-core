import type React from "react";

type ParsedBorderSide = {
  width?: string;
  style?: string;
  color?: string;
};

const BORDER_STYLE_KEYWORDS = new Set([
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
]);

const BORDER_WIDTH_TOKEN =
  /^(?:\d*\.?\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|pt|pc|cm|mm|in)$/i;

const parsedBorderCache = new Map<string, ParsedBorderSide | null>();
const PARSED_BORDER_CACHE_MAX = 512;

export const parseBorderSideShorthand = (
  value: string
): ParsedBorderSide | null => {
  const normalized = value.trim();
  if (!normalized) return null;
  const cached = parsedBorderCache.get(normalized);
  if (cached !== undefined) return cached;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    parsedBorderCache.set(normalized, null);
    return null;
  }

  let width: string | undefined;
  let style: string | undefined;
  const remainder: string[] = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (
      !width &&
      (lower === "thin" ||
        lower === "medium" ||
        lower === "thick" ||
        lower === "0" ||
        BORDER_WIDTH_TOKEN.test(lower))
    ) {
      width = token;
      continue;
    }
    if (!style && BORDER_STYLE_KEYWORDS.has(lower)) {
      style = lower;
      continue;
    }
    remainder.push(token);
  }

  const color = remainder.join(" ").trim() || undefined;
  const parsed =
    width || style || color
      ? {
          width,
          style,
          color,
        }
      : null;
  if (parsedBorderCache.size >= PARSED_BORDER_CACHE_MAX) {
    parsedBorderCache.clear();
  }
  parsedBorderCache.set(normalized, parsed);
  return parsed;
};

export const applyParsedBorderSide = (
  target: React.CSSProperties,
  side: "Top" | "Right" | "Bottom" | "Left",
  value: string
) => {
  const parsed = parseBorderSideShorthand(value);
  if (!parsed) return;
  if (parsed.width) (target as any)[`border${side}Width`] = parsed.width;
  if (parsed.style) (target as any)[`border${side}Style`] = parsed.style;
  if (parsed.color) (target as any)[`border${side}Color`] = parsed.color;
};
