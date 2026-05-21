import React, { memo, useMemo } from "react";
import {
  CellFormat,
  CellValue,
  GridColumn,
  GridLoadingCellRenderer,
  GridRow,
  GridValidationCellState,
} from "../types";
import { useGridTheme } from "../features/theming";
import type { GridCellState as GridCellThemeState } from "../features/theming/types";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";
import { formatCellValue } from "../features/cell-format";
import {
  applyCompiledCellFormatToStyle,
  compileCellFormat,
} from "../features/cell-format/compiledCellFormat";
import { getGridRuntimeModules } from "../runtime/modules";
import {
  getSearchHighlightMarkProps,
  isActiveSearchCell,
  splitSearchMatches,
  useGridSearch,
} from "../features/search";
import type { GridValidationDisplayConfig } from "./publicCoreSupport";
import { buildGridBodyCellId } from "../features/interaction/utils";
import { renderLoadingCellContent } from "./loadingCellRenderer";
import { cx } from "../utils/cx";

interface GridCellProps {
  value: any;
  format?: CellFormat;
  cell?: CellValue;
  row?: GridRow;
  loading?: boolean;
  loadingRenderer?: GridLoadingCellRenderer;
  column: GridColumn;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  validation?: GridValidationCellState | null;
  validationDisplay?: GridValidationDisplayConfig;
  style: React.CSSProperties;
  rowSpan?: number;
  colSpan?: number;
  ariaRowIndex?: number;
  ariaColIndex?: number;
  gridBodyCellIdBase?: string;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: (cellElement?: HTMLElement) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  enableColumnResize: boolean;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;
}

export const GridCell = memo<GridCellProps>(
  ({
    value,
    format,
    cell,
    row,
    loading,
    loadingRenderer,
    column,
    rowIndex,
    colIndex,
    isSelected,
    validation,
    validationDisplay,
    style,
    rowSpan,
    colSpan,
    ariaRowIndex,
    ariaColIndex,
    gridBodyCellIdBase,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    onContextMenu,
    children,
    enableColumnResize,
    getColumnResizeHandleProps,
  }) => {
    const sparklineModule = getGridRuntimeModules().sparkline;
    const validationModule = getGridRuntimeModules().validation;
    const { tokens, components } = useGridTheme();
    const cellRef = React.useRef<HTMLDivElement>(null);
    const search = useGridSearch();
    const isLoading = Boolean(loading || row?.meta?.loading);
    const formattedValue = useMemo(
      () => (isLoading ? "" : formatCellValue(column, value, format)),
      [column, format, isLoading, value]
    );
    const isSpanned = Boolean(
      (rowSpan && rowSpan > 1) || (colSpan && colSpan > 1)
    );
    const sparklineConfig = sparklineModule.useGridSparkline();
    const sparklineOptions = useMemo(
      () =>
        isLoading
          ? null
          : sparklineModule.resolveSparklineOptions({
              enabled: sparklineConfig.enabled,
              tokens,
              globalOptions: sparklineConfig.defaultOptions,
              columnSparkline: column.sparkline,
              cellSparkline: cell?.sparkline,
            }),
      [
        isLoading,
        sparklineModule,
        sparklineConfig.enabled,
        sparklineConfig.defaultOptions,
        tokens,
        column.sparkline,
        cell?.sparkline,
      ]
    );
    const sparklinePoints = useMemo(
      () =>
        sparklineOptions
          ? sparklineModule.normalizeSparklineData(value, sparklineOptions)
          : null,
      [sparklineModule, value, sparklineOptions]
    );
    const hasSparklineValues = Boolean(
      sparklinePoints && sparklineModule.hasSparklineData(sparklinePoints)
    );
    const sparklineTitle = useMemo(() => {
      if (!sparklineOptions || !sparklinePoints || !hasSparklineValues)
        return null;
      return sparklineModule.buildSparklineTitle(sparklinePoints, sparklineOptions);
    }, [sparklineModule, sparklineOptions, sparklinePoints, hasSparklineValues]);
    const showSparkline = Boolean(sparklineOptions && hasSparklineValues);
    const compiledFormat = useMemo(() => compileCellFormat(format), [format]);
    const cellStyle = useMemo<React.CSSProperties>(() => {
      const computed: React.CSSProperties = {
        ...style,
      };
      applyCompiledCellFormatToStyle(computed, compiledFormat, showSparkline);

      if (!computed.position) {
        computed.position = "relative";
      }

      if (isSpanned) {
        computed.position = "relative";
        // Keep merged cells above row-resize hitboxes so hover/cursor remains
        // consistent across internal row boundaries covered by the span.
        computed.zIndex = Math.max(Number(computed.zIndex) || 0, 30);
      }

      return computed;
    }, [compiledFormat, isSpanned, style, showSparkline]);

    const themeState: GridCellThemeState = {
      isSelected,
      isSpanned,
      rowIndex,
      colIndex,
      column,
      format,
      validation: validation ?? null,
    };

    const themedStyle = components.gridCell
      ? components.gridCell({ base: cellStyle, state: themeState, tokens })
      : cellStyle;

    const tooltipEnabled = sparklineOptions?.tooltip?.enabled !== false;
    const titleText = showSparkline
      ? tooltipEnabled
        ? undefined
        : sparklineTitle ?? formattedValue
      : formattedValue;
    const validationMessage =
      validationDisplay?.showTooltip !== false ? validation?.message : undefined;
    const activeSearchCell = isActiveSearchCell(search, row?.id, column.key);

    const highlightedValue = useMemo(() => {
      if (isLoading || showSparkline || !search.highlight || !search.matcher)
        return null;
      if (!formattedValue) return null;
      const segments = splitSearchMatches(formattedValue, search.matcher);
      if (!segments) return null;
      const markProps = getSearchHighlightMarkProps(search, {
        active: activeSearchCell,
      });
      return (
        <span className="ace-grid__cell-text">
          {segments.map((segment, index) =>
            segment.match ? (
              <mark
                key={index}
                className={markProps.className}
                style={markProps.style}
              >
                {segment.text}
              </mark>
            ) : (
              <React.Fragment key={index}>{segment.text}</React.Fragment>
            )
          )}
        </span>
      );
    }, [
      formattedValue,
      search.highlight,
      search.activeHighlightClassName,
      search.activeHighlightStyle,
      search.activeMatch,
      search.highlightClassName,
      search.highlightStyle,
      search.matcher,
      activeSearchCell,
      isLoading,
      showSparkline,
    ]);

    const tooltipTitle = validationMessage
      ? undefined
      : isLoading
      ? "Loading..."
      : titleText;

    const loadingContent = useMemo(
      () =>
        renderLoadingCellContent(loadingRenderer, {
          row,
          column,
          rowIndex,
          colIndex,
          isSystemCell: false,
        }),
      [loadingRenderer, row, column, rowIndex, colIndex]
    );

    const defaultCellContent = useMemo<React.ReactNode>(
      () => {
        const Sparkline = sparklineModule.Sparkline;
        return showSparkline && sparklineOptions && sparklinePoints ? (
          <Sparkline
            points={sparklinePoints}
            options={sparklineOptions}
            title={tooltipEnabled ? null : sparklineTitle}
            tooltipContext={{
              row,
              data: row?.data,
              column,
            }}
          />
        ) : (
          highlightedValue ?? formattedValue
        );
      },
      [
        showSparkline,
        sparklineModule,
        sparklineOptions,
        sparklinePoints,
        tooltipEnabled,
        sparklineTitle,
        row,
        column,
        highlightedValue,
        formattedValue,
      ]
    );

    const renderCellMode = column.renderCellMode ?? "enhance";
    const hasCustomCellRenderer =
      !isLoading && typeof column.renderCell === "function";
    const cellId = buildGridBodyCellId(
      gridBodyCellIdBase,
      ariaRowIndex,
      ariaColIndex
    );
    const customCellContent = useMemo(
      () =>
        hasCustomCellRenderer
          ? column.renderCell?.({
              value,
              formattedValue,
              defaultContent: defaultCellContent,
              row,
              column,
              rowIndex,
              colIndex,
              cell,
              isLoading,
              isSelected,
              mode: renderCellMode,
            })
          : null,
      [
        hasCustomCellRenderer,
        column,
        value,
        formattedValue,
        defaultCellContent,
        row,
        rowIndex,
        colIndex,
        cell,
        isLoading,
        isSelected,
        renderCellMode,
      ]
    );
    const resolvedCellContent = hasCustomCellRenderer
      ? renderCellMode === "replace"
        ? customCellContent ?? defaultCellContent
        : (
          <>
            {defaultCellContent}
            {customCellContent}
          </>
        )
      : defaultCellContent;

    return (
      <div
        ref={cellRef}
        id={cellId}
        role="gridcell"
        aria-rowindex={ariaRowIndex}
        aria-colindex={ariaColIndex}
        aria-selected={isSelected || undefined}
        aria-rowspan={rowSpan && rowSpan > 1 ? rowSpan : undefined}
        aria-colspan={colSpan && colSpan > 1 ? colSpan : undefined}
        className={cx(
          "ace-grid__cell",
          format?.className,
          isSelected && "ace-grid__cell--selected",
          isSpanned && "ace-grid__cell--spanned",
          isLoading && "ace-grid__cell--loading",
          showSparkline && "ace-grid__cell--sparkline",
          ...validationModule.getValidationClassNames(
            validation ?? null,
            validationDisplay ?? {
              enabled: false,
              highlightInvalidCells: true,
              highlightWarnings: true,
              highlightInfo: false,
              showIndicator: true,
              indicator: "dot",
              showTooltip: true,
            }
          )
        )}
        style={themedStyle}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
        }}
        onMouseUp={onMouseUp}
        onContextMenu={onContextMenu}
        onClick={onClick}
        onDoubleClick={() => onDoubleClick(cellRef.current || undefined)}
        title={tooltipTitle}
        data-validation-message={validationMessage}
        data-validation-severity={validation?.severity ?? undefined}
        data-row-span={rowSpan}
        data-col-span={colSpan}
      >
        {isLoading ? loadingContent : resolvedCellContent}
        {isSpanned && !isLoading && (
          <div className="ace-grid__cell-span-indicator">
            {rowSpan && rowSpan > 1 ? `${rowSpan}R` : ""}
            {colSpan && colSpan > 1 ? `${colSpan}C` : ""}
          </div>
        )}
        {children}
        {enableColumnResize && column.resizable !== false && (
          <div
            {...getColumnResizeHandleProps(column.key, {
              className: "ace-grid__cell-resize-handle",
              style: {
                position: "absolute",
                right: -3,
                top: 0,
                bottom: 6,
                width: 6,
                cursor: "col-resize",
              },
              onMouseDown: (event) => {
                event.stopPropagation();
              },
            })}
          />
        )}
      </div>
    );
  }
);
