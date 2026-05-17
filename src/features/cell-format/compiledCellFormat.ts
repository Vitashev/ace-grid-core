import type React from "react";
import type { CellFormat } from "../../types";
import { parseBorderSideShorthand } from "../../utils/borderSide";

type CellStyleWithVars = React.CSSProperties & Record<string, string>;
type BorderSideName = "Top" | "Right" | "Bottom" | "Left";
type VerticalAlignVar = "flex-start" | "flex-end" | null;

export type CompiledCellFormat = Readonly<{
  stylePatch: Readonly<CellStyleWithVars>;
  alignVar: VerticalAlignVar;
}>;

const compiledCellFormatCache = new WeakMap<CellFormat, CompiledCellFormat>();

const setVar = (target: CellStyleWithVars, name: string, value: string) => {
  target[name] = value;
};

const applyCompiledBorderSide = (
  target: React.CSSProperties,
  side: BorderSideName,
  value: string
) => {
  const parsed = parseBorderSideShorthand(value);
  if (!parsed) return;
  if (parsed.width) (target as any)[`border${side}Width`] = parsed.width;
  if (parsed.style) (target as any)[`border${side}Style`] = parsed.style;
  if (parsed.color) (target as any)[`border${side}Color`] = parsed.color;
};

const resolveVerticalAlignVar = (
  verticalAlign: CellFormat["verticalAlign"]
): VerticalAlignVar =>
  verticalAlign === "top"
    ? "flex-start"
    : verticalAlign === "bottom"
      ? "flex-end"
      : null;

export const compileCellFormat = (
  format?: CellFormat
): CompiledCellFormat | null => {
  if (!format) return null;
  const cached = compiledCellFormatCache.get(format);
  if (cached) return cached;

  const stylePatch: CellStyleWithVars = {};

  if (format.backgroundColor) {
    setVar(stylePatch, "--ace-grid-cell-bg", format.backgroundColor);
  }
  if (format.color) {
    setVar(stylePatch, "--ace-grid-cell-color", format.color);
  }
  if (format.fontSize != null) {
    setVar(stylePatch, "--ace-grid-cell-font-size", `${format.fontSize}px`);
  }
  if (format.fontWeight) {
    setVar(stylePatch, "--ace-grid-cell-font-weight", String(format.fontWeight));
  }
  if (format.fontStyle) {
    setVar(stylePatch, "--ace-grid-cell-font-style", format.fontStyle);
  }
  if (format.textAlign) {
    setVar(stylePatch, "--ace-grid-cell-text-align", format.textAlign);
  }

  if (format.border) {
    if (format.border.top) applyCompiledBorderSide(stylePatch, "Top", format.border.top);
    if (format.border.right)
      applyCompiledBorderSide(stylePatch, "Right", format.border.right);
    if (format.border.bottom)
      applyCompiledBorderSide(stylePatch, "Bottom", format.border.bottom);
    if (format.border.left)
      applyCompiledBorderSide(stylePatch, "Left", format.border.left);
  }

  const compiled: CompiledCellFormat = Object.freeze({
    stylePatch: Object.freeze(stylePatch),
    alignVar: resolveVerticalAlignVar(format.verticalAlign),
  });

  compiledCellFormatCache.set(format, compiled);
  return compiled;
};

export const primeCompiledCellFormat = (format?: CellFormat): void => {
  if (!format) return;
  compileCellFormat(format);
};

export const applyCompiledCellFormatToStyle = (
  target: React.CSSProperties,
  compiled: CompiledCellFormat | null,
  showSparkline: boolean
) => {
  if (!compiled) return;
  Object.assign(target, compiled.stylePatch);
  const align = showSparkline ? "stretch" : compiled.alignVar;
  if (align) {
    (target as CellStyleWithVars)["--ace-grid-cell-align"] = align;
  }
};
