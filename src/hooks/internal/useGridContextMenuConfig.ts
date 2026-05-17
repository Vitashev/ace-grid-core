import React, { useCallback, useState } from "react";

import { GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS } from "../../features/context-menu";
import type {
  GridContextMenuActionContext,
  GridContextMenuConfig,
  GridContextMenuContext,
  GridContextMenuItemDefinition,
} from "../../features/context-menu";
import { isSystemCol } from "../../features/cell-selection";
import type {
  CellFormat,
  GridColumn,
  GridMergedCell,
  GridRow,
  GridSelection,
} from "../../types";
import { cx } from "../../utils/cx";

type ClipboardSelectionContext = {
  rowIds?: (string | number)[];
  columnKeys?: string[];
  rowIndices?: number[];
  columnIndices?: number[];
  rowIndex?: number;
  colIndex?: number;
};

type GridContextMenuBuilderOptions = {
  className?: string;
  includeMerge?: boolean;
  includeRows?: boolean;
  includeColumns?: boolean;
  includeClipboard?: boolean;
  includeCopy?: boolean;
  includeHighlight?: boolean;
  includeLog?: boolean;
  extraItems?: GridContextMenuItemDefinition[];
};

type UseGridContextMenuConfigArgs = {
  rowsForGridBase: GridRow[];
  allColumns: GridColumn[];
  mergeCells: (
    selection: GridSelection,
    context?: {
      rowIndices?: number[];
      columnIndices?: number[];
      rowIds?: (string | number)[];
    },
  ) => GridMergedCell | null;
  unmergeCells: (
    selection: GridSelection,
    context?: {
      rowIndices?: number[];
      columnIndices?: number[];
      rowIds?: (string | number)[];
    },
  ) => string[];
  addRowsRelativeToSelection: (
    selection: GridSelection,
    position: "above" | "below",
    context?: { rowIndices?: number[] },
  ) => GridRow[];
  deleteRows: (ids: Array<string | number>) => void;
  addColumnsRelativeToSelection: (
    selection: GridSelection,
    position: "left" | "right",
    context?: { columnIndices?: number[] },
  ) => GridColumn[];
  deleteColumn: (key: string) => void;
  copySelectionToClipboard: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext,
  ) => Promise<string | null>;
  cutSelection: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext,
  ) => Promise<string | null>;
  pasteFromClipboard: (
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext,
  ) => Promise<boolean>;
  applyCellFormatToSelection: (
    formatPatch: Partial<CellFormat>,
    selection?: GridSelection | null,
    context?: ClipboardSelectionContext,
  ) => boolean;
};

type CellFillCustomPickerProps = {
  mutedColor: string;
  defaultColor?: string;
  onApply: (color: string) => void;
};

const CellFillCustomPicker = ({
  mutedColor,
  defaultColor = "#60A5FA",
  onApply,
}: CellFillCustomPickerProps) => {
  const [color, setColor] = useState(defaultColor);

  return React.createElement(
    "div",
    {
      className: "ace-grid__context-menu-color-custom",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      },
    },
    React.createElement(
      "label",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: mutedColor,
        },
      },
      React.createElement("span", null, "Custom"),
      React.createElement("input", {
        type: "color",
        value: color,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          setColor(event.target.value);
        },
        style: {
          width: 24,
          height: 24,
          border: "none",
          background: "transparent",
          padding: 0,
        },
      }),
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "ace-grid__context-menu-color-apply",
        onClick: () => onApply(color),
        style: {
          border: "1px solid rgba(0,0,0,0.12)",
          background: "transparent",
          borderRadius: 999,
          padding: "4px 10px",
          fontSize: 12,
          cursor: "pointer",
        },
      },
      "Apply",
    ),
  );
};

export const useGridContextMenuConfig = ({
  rowsForGridBase,
  allColumns,
  mergeCells,
  unmergeCells,
  addRowsRelativeToSelection,
  deleteRows,
  addColumnsRelativeToSelection,
  deleteColumn,
  copySelectionToClipboard,
  cutSelection,
  pasteFromClipboard,
  applyCellFormatToSelection,
}: UseGridContextMenuConfigArgs) => {
  const buildContextMenuConfig = useCallback(
    (options?: GridContextMenuBuilderOptions): GridContextMenuConfig => {
      const {
        className,
        includeMerge = true,
        includeRows = true,
        includeColumns = true,
        includeClipboard,
        includeCopy = true,
        includeHighlight = true,
        includeLog = false,
        extraItems = [],
      } = options ?? {};
      const clipboardEnabled = includeClipboard ?? includeCopy;

      const dedupeNumbers = (values: number[], fallback: number) => {
        const seen = new Set<number>();
        const result: number[] = [];
        values.forEach((value) => {
          const normalized = Math.trunc(value);
          if (Number.isNaN(normalized) || seen.has(normalized)) return;
          seen.add(normalized);
          result.push(normalized);
        });
        if (!result.length) result.push(Math.trunc(fallback));
        return result;
      };

      const dedupeKeys = (values: Array<string | null | undefined>) => {
        const seen = new Set<string>();
        const result: string[] = [];
        values.forEach((value) => {
          if (!value || seen.has(value)) return;
          seen.add(value);
          result.push(value);
        });
        return result;
      };

      const resolveSelectionContext = (ctx: GridContextMenuContext) => {
        const rowFallback = ctx.target?.rowIndex ?? 0;
        const colFallback = ctx.target?.colIndex ?? 0;

        const rowIndices = dedupeNumbers(
          ctx.selectionInfo.rowIndices.length
            ? ctx.selectionInfo.rowIndices
            : [rowFallback],
          rowFallback,
        );
        const columnIndices = dedupeNumbers(
          ctx.selectionInfo.columnIndices.length
            ? ctx.selectionInfo.columnIndices
            : [colFallback],
          colFallback,
        );

        const selection: GridSelection = {
          startRow: Math.min(...rowIndices),
          endRow: Math.max(...rowIndices),
          startCol: Math.min(...columnIndices),
          endCol: Math.max(...columnIndices),
        };

        return { selection, rowIndices, columnIndices };
      };

      const resolveRowIds = (ctx: GridContextMenuContext) => {
        const fallback = ctx.target?.rowId != null ? [ctx.target.rowId] : [];
        const ids = ctx.selectionInfo.rowIds.length
          ? ctx.selectionInfo.rowIds
          : fallback;
        return dedupeKeys(ids.map((id) => String(id))).map((id) => {
          const row = rowsForGridBase.find((entry) => String(entry.id) === id);
          return row?.id ?? id;
        });
      };

      const resolveColumnKeys = (ctx: GridContextMenuContext) => {
        const fallback = ctx.target?.columnKey ? [ctx.target.columnKey] : [];
        const keys = ctx.selectionInfo.columnKeys.length
          ? ctx.selectionInfo.columnKeys
          : fallback;
        return dedupeKeys(keys).filter((key) => !isSystemCol(key));
      };

      const applySelectionFill = (
        ctx: GridContextMenuContext,
        color: string | null,
      ) => {
        if (!ctx.selection || ctx.selectionInfo.hasPartialMergeOverlap) return;
        const { selection, rowIndices, columnIndices } = resolveSelectionContext(ctx);
        const columnKeysFromSelection = ctx.selectionInfo.columnKeys.length
          ? dedupeKeys(ctx.selectionInfo.columnKeys)
          : [];
        const fallbackColumnKeys = columnIndices
          .map((idx) => allColumns[idx]?.key)
          .filter((key): key is string => Boolean(key));
        const columnKeys = (
          columnKeysFromSelection.length
            ? columnKeysFromSelection
            : fallbackColumnKeys
        ).filter((key): key is string => Boolean(key) && !isSystemCol(key));

        if (!rowIndices.length || !columnKeys.length) return;

        applyCellFormatToSelection(
          { backgroundColor: color ?? undefined },
          selection,
          {
            rowIndices,
            columnKeys,
            columnIndices,
          },
        );
      };

      const items: GridContextMenuItemDefinition[] = [];
      const pushSection = (section: GridContextMenuItemDefinition[]) => {
        if (!section.length) return;
        if (items.length) {
          items.push({
            type: "divider",
            id: `grid-context-menu-divider-${items.length}`,
          });
        }
        items.push(...section);
      };

      if (includeMerge) {
        pushSection([
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.merge,
            label: "Merge cells",
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection ||
              ctx.selectionInfo.isSingleCell ||
              ctx.selectionInfo.includesPinnedCell ||
              ctx.selectionInfo.hasPartialMergeOverlap,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, rowIndices, columnIndices } =
                resolveSelectionContext(ctx);
              const rowIds = resolveRowIds(ctx);
              mergeCells(selection, { rowIndices, columnIndices, rowIds });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.unmerge,
            label: "Unmerge cells",
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || ctx.selectionInfo.activeMergeIds.length === 0,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, rowIndices, columnIndices } =
                resolveSelectionContext(ctx);
              const rowIds = resolveRowIds(ctx);
              unmergeCells(selection, { rowIndices, columnIndices, rowIds });
            },
          },
        ]);
      }

      if (includeRows) {
        pushSection([
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.rowsAbove,
            label: (ctx: GridContextMenuContext) => {
              const count = Math.max(
                1,
                new Set(ctx.selectionInfo.rowIndices).size || 1,
              );
              return count > 1 ? `Add ${count} rows above` : "Add row above";
            },
            disabled: (ctx: GridContextMenuContext) => !ctx.selection,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, rowIndices } = resolveSelectionContext(ctx);
              addRowsRelativeToSelection(selection, "above", { rowIndices });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.rowsBelow,
            label: (ctx: GridContextMenuContext) => {
              const count = Math.max(
                1,
                new Set(ctx.selectionInfo.rowIndices).size || 1,
              );
              return count > 1 ? `Add ${count} rows below` : "Add row below";
            },
            disabled: (ctx: GridContextMenuContext) => !ctx.selection,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, rowIndices } = resolveSelectionContext(ctx);
              addRowsRelativeToSelection(selection, "below", { rowIndices });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.rowsRemove,
            label: (ctx: GridContextMenuContext) => {
              const count = Math.max(1, resolveRowIds(ctx).length || 1);
              return count > 1 ? `Remove ${count} rows` : "Remove row";
            },
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || resolveRowIds(ctx).length === 0,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const rowIds = resolveRowIds(ctx);
              if (!rowIds.length) return;
              deleteRows(rowIds);
            },
          },
        ]);
      }

      if (includeColumns) {
        pushSection([
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.colsLeft,
            label: (ctx: GridContextMenuContext) => {
              const count = Math.max(
                1,
                new Set(ctx.selectionInfo.columnIndices).size || 1,
              );
              return count > 1 ? `Add ${count} columns left` : "Add column left";
            },
            disabled: (ctx: GridContextMenuContext) => !ctx.selection,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, columnIndices } = resolveSelectionContext(ctx);
              addColumnsRelativeToSelection(selection, "left", { columnIndices });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.colsRight,
            label: (ctx: GridContextMenuContext) => {
              const count = Math.max(
                1,
                new Set(ctx.selectionInfo.columnIndices).size || 1,
              );
              return count > 1
                ? `Add ${count} columns right`
                : "Add column right";
            },
            disabled: (ctx: GridContextMenuContext) => !ctx.selection,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const { selection, columnIndices } = resolveSelectionContext(ctx);
              addColumnsRelativeToSelection(selection, "right", { columnIndices });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.colsRemove,
            label: (ctx: GridContextMenuContext) => {
              const count = resolveColumnKeys(ctx).length;
              return count > 1 ? `Remove ${count} columns` : "Remove column";
            },
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || resolveColumnKeys(ctx).length === 0,
            onSelect: (ctx: GridContextMenuActionContext) => {
              const columnKeys = resolveColumnKeys(ctx);
              if (!columnKeys.length) return;
              columnKeys.forEach((key) => deleteColumn(key));
            },
          },
        ]);
      }

      const extraSection: GridContextMenuItemDefinition[] = [];

      if (clipboardEnabled) {
        extraSection.push(
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.copyRange,
            label: "Copy",
            shortcut: "⌘C",
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || ctx.selectionInfo.hasPartialMergeOverlap,
            onSelect: async (ctx: GridContextMenuActionContext) => {
              await copySelectionToClipboard(ctx.selection, {
                rowIds: ctx.selectionInfo.rowIds,
                columnKeys: ctx.selectionInfo.columnKeys,
                rowIndices: ctx.selectionInfo.rowIndices,
                columnIndices: ctx.selectionInfo.columnIndices,
              });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.cutRange,
            label: "Cut",
            shortcut: "⌘X",
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || ctx.selectionInfo.hasPartialMergeOverlap,
            onSelect: async (ctx: GridContextMenuActionContext) => {
              await cutSelection(ctx.selection, {
                rowIds: ctx.selectionInfo.rowIds,
                columnKeys: ctx.selectionInfo.columnKeys,
                rowIndices: ctx.selectionInfo.rowIndices,
                columnIndices: ctx.selectionInfo.columnIndices,
              });
            },
          },
          {
            id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.pasteRange,
            label: "Paste",
            shortcut: "⌘V",
            disabled: (ctx: GridContextMenuContext) =>
              !ctx.selection || ctx.selectionInfo.hasPartialMergeOverlap,
            onSelect: async (ctx: GridContextMenuActionContext) => {
              await pasteFromClipboard(ctx.selection, {
                rowIds: ctx.selectionInfo.rowIds,
                columnKeys: ctx.selectionInfo.columnKeys,
                rowIndices: ctx.selectionInfo.rowIndices,
                columnIndices: ctx.selectionInfo.columnIndices,
              });
            },
          },
        );
      }

      if (includeHighlight) {
        const palette = [
          { id: "clear", label: "Clear", value: null },
          { id: "rose", label: "Rose", value: "#FEE2E2" },
          { id: "amber", label: "Amber", value: "#FEF3C7" },
          { id: "lime", label: "Lime", value: "#ECFCCB" },
          { id: "green", label: "Green", value: "#DCFCE7" },
          { id: "sky", label: "Sky", value: "#E0F2FE" },
          { id: "blue", label: "Blue", value: "#DBEAFE" },
          { id: "violet", label: "Violet", value: "#EDE9FE" },
          { id: "pink", label: "Pink", value: "#FCE7F3" },
          { id: "slate", label: "Slate", value: "#F1F5F9" },
        ] as const;

        extraSection.push({
          id: GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS.cellFill,
          type: "custom",
          hidden: (ctx: GridContextMenuContext) =>
            !ctx.selection || ctx.selectionInfo.hasPartialMergeOverlap,
          render: (ctx) => {
            const muted =
              "var(--ace-grid-context-menu-text-muted, rgba(0,0,0,0.54))";
            return React.createElement(
              "div",
              {
                className: "ace-grid__context-menu-color-section",
                style: { padding: "6px 16px", display: "grid", gap: 8 },
              },
              React.createElement(
                "div",
                {
                  className: "ace-grid__context-menu-color-title",
                  style: {
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: muted,
                  },
                },
                "Cell fill",
              ),
              React.createElement(
                "div",
                {
                  className: "ace-grid__context-menu-color-grid",
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 18px)",
                    gap: 6,
                  },
                },
                palette.map((swatch) => {
                  const isClear = swatch.value == null;
                  return React.createElement("button", {
                    key: swatch.id,
                    type: "button",
                    title: swatch.label,
                    "aria-label": swatch.label,
                    onClick: () => {
                      applySelectionFill(ctx, swatch.value);
                      ctx.close();
                    },
                    className: cx(
                      "ace-grid__context-menu-color-swatch",
                      isClear && "ace-grid__context-menu-color-swatch--clear",
                    ),
                    style: {
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      border: isClear
                        ? "1px dashed rgba(0,0,0,0.35)"
                        : "1px solid rgba(0,0,0,0.1)",
                      background: swatch.value ?? "transparent",
                      cursor: "pointer",
                      padding: 0,
                    },
                  });
                }),
              ),
              React.createElement(CellFillCustomPicker, {
                mutedColor: muted,
                onApply: (color: string) => {
                  applySelectionFill(ctx, color);
                  ctx.close();
                },
              }),
            );
          },
        });
      }

      if (includeLog) {
        extraSection.push({
          id: "log-selection",
          label: "Log selection",
          onSelect: () => {
            // eslint-disable-next-line no-console
          },
        });
      }

      if (extraItems.length) {
        extraSection.push(...extraItems);
      }

      pushSection(extraSection);

      return {
        className,
        items,
      };
    },
    [
      addColumnsRelativeToSelection,
      addRowsRelativeToSelection,
      allColumns,
      applyCellFormatToSelection,
      copySelectionToClipboard,
      cutSelection,
      deleteColumn,
      deleteRows,
      mergeCells,
      pasteFromClipboard,
      rowsForGridBase,
      unmergeCells,
    ],
  );

  return {
    buildContextMenuConfig,
  };
};
