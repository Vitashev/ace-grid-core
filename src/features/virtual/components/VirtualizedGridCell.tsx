import React, { memo, useEffect, useMemo } from "react";
import {
  CellFormat,
  CellValue,
  GridColumn,
  GridLoadingCellRenderer,
  GridRow,
  GridValidationCellState,
} from "../../../types";
import { useCellContentVirtualization } from "../hooks/useCellContentVirtualization";
import { useGridTheme } from "../../theming";
import type { GridCellState as GridCellThemeState } from "../../theming/types";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../../resize";
import { formatCellValue } from "../../cell-format";
import {
  applyCompiledCellFormatToStyle,
  compileCellFormat,
} from "../../cell-format/compiledCellFormat";
import { getGridRuntimeModules } from "../../../runtime/modules";
import {
  getSearchHighlightMarkProps,
  isActiveSearchCell,
  splitSearchMatches,
  useGridSearch,
} from "../../search";
import type { GridValidationDisplayConfig } from "../../validation/utils";
import { buildGridBodyCellId } from "../../interaction/utils";
import { updateValidationTooltipPlacement } from "../../../components/validationTooltipPlacement";
import { renderLoadingCellContent } from "../../../components/loadingCellRenderer";
import { cx } from "../../../utils/cx";

interface VirtualizedGridCellProps {
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
  onMouseUp?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  enableContentVirtualization?: boolean;
  cellId?: string;
  onCellRegister?: (cellId: string, element: HTMLElement) => void;
  onCellUnregister?: (cellId: string, element: HTMLElement) => void;
  children?: React.ReactNode;
  enableColumnResize: boolean;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides,
  ) => ColumnResizeHandleProps;
}

export const VirtualizedGridCell = memo<VirtualizedGridCellProps>(
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
    onMouseUp,
    onContextMenu,
    enableContentVirtualization = true,
    cellId,
    onCellRegister,
    onCellUnregister,
    children,
    enableColumnResize,
    getColumnResizeHandleProps,
  }) => {
    const sparklineModule = getGridRuntimeModules().sparkline;
    const validationModule = getGridRuntimeModules().validation;
    const { tokens, components } = useGridTheme();
    const search = useGridSearch();
    const isLoading = Boolean(loading || row?.meta?.loading);
    const [virtualRef, virtualState] = useCellContentVirtualization({
      enabled: enableContentVirtualization,
    });
    const shouldRenderContent =
      isLoading || !enableContentVirtualization || virtualState.shouldRender;
    const semanticCellId =
      buildGridBodyCellId(gridBodyCellIdBase, ariaRowIndex, ariaColIndex) ??
      cellId;
    const activeSearchCell = isActiveSearchCell(search, row?.id, column.key);
    const formattedValue = useMemo(
      () =>
        shouldRenderContent && !isLoading
          ? formatCellValue(column, value, format)
          : "",
      [shouldRenderContent, isLoading, column, format, value],
    );
    const sparklineConfig = sparklineModule.useGridSparkline();
    const sparklineOptions = useMemo(() => {
      if (!shouldRenderContent || isLoading) return null;
      return sparklineModule.resolveSparklineOptions({
        enabled: sparklineConfig.enabled,
        tokens,
        globalOptions: sparklineConfig.defaultOptions,
        columnSparkline: column.sparkline,
        cellSparkline: cell?.sparkline,
      });
    }, [
      shouldRenderContent,
      isLoading,
      sparklineModule,
      sparklineConfig.enabled,
      sparklineConfig.defaultOptions,
      tokens,
      column.sparkline,
      cell?.sparkline,
    ]);

    // Register/unregister cell with virtualization manager
    useEffect(() => {
      const element = virtualRef.current;
      if (element && cellId && onCellRegister) {
        onCellRegister(cellId, element);

        return () => {
          onCellUnregister?.(cellId, element);
        };
      }
    }, [cellId, onCellRegister, onCellUnregister, virtualRef]);

    const sparklinePoints = useMemo(() => {
      if (!shouldRenderContent || !sparklineOptions) return null;
      return sparklineModule.normalizeSparklineData(value, sparklineOptions);
    }, [shouldRenderContent, sparklineModule, value, sparklineOptions]);

    // Smart virtualization - balance performance and UX
    const hasSparklineValues = Boolean(
      shouldRenderContent &&
      !isLoading &&
      sparklinePoints &&
      sparklineModule.hasSparklineData(sparklinePoints),
    );
    const showSparkline =
      shouldRenderContent && Boolean(sparklineOptions && hasSparklineValues);
    const compiledFormat = useMemo(() => compileCellFormat(format), [format]);

    const cellStyle: React.CSSProperties = {
      ...style,
    };
    applyCompiledCellFormatToStyle(cellStyle, compiledFormat, showSparkline);

    if (!cellStyle.position) {
      cellStyle.position = "relative";
    }

    const isSpanned = Boolean(
      (rowSpan && rowSpan > 1) || (colSpan && colSpan > 1),
    );

    if (isSpanned) {
      cellStyle.position = "relative";
      // Keep merged cells above row-resize hitboxes so hover/cursor remains
      // consistent across internal row boundaries covered by the span.
      cellStyle.zIndex = Math.max(Number(cellStyle.zIndex) || 0, 30);
    }
    const sparklineTitle = useMemo(() => {
      if (!showSparkline || !sparklineOptions || !sparklinePoints) return null;
      return sparklineModule.buildSparklineTitle(sparklinePoints, sparklineOptions);
    }, [showSparkline, sparklineModule, sparklineOptions, sparklinePoints]);
    const tooltipEnabled = sparklineOptions?.tooltip?.enabled !== false;
    const validationMessage =
      validationDisplay?.showTooltip !== false
        ? validation?.message
        : undefined;

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

    const highlightedValue = useMemo(() => {
      if (
        isLoading ||
        !shouldRenderContent ||
        showSparkline ||
        !search.highlight ||
        !search.matcher
      ) {
        return null;
      }
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
            ),
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
      shouldRenderContent,
      showSparkline,
    ]);

    const tooltipTitle =
      validationMessage != null
        ? undefined
        : isLoading
          ? "Loading..."
          : shouldRenderContent
            ? showSparkline
              ? tooltipEnabled
                ? undefined
                : (sparklineTitle ?? formattedValue)
              : formattedValue
            : "Loading...";

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
      shouldRenderContent &&
      !isLoading &&
      typeof column.renderCell === "function";
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
        ref={virtualRef}
        id={semanticCellId}
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
          enableContentVirtualization && "ace-grid__cell--virtualized",
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
          updateValidationTooltipPlacement(e.currentTarget, validationMessage);
          onMouseEnter?.(e);
        }}
        onMouseUp={onMouseUp}
        onFocusCapture={(event) =>
          updateValidationTooltipPlacement(
            event.currentTarget,
            validationMessage,
          )
        }
        onContextMenu={onContextMenu}
        onClick={onClick}
        onDoubleClick={() => onDoubleClick(virtualRef.current || undefined)}
        title={tooltipTitle}
        data-validation-message={validationMessage}
        data-validation-severity={validation?.severity ?? undefined}
        data-row-span={rowSpan}
        data-col-span={colSpan}
        data-cell-id={semanticCellId}
        data-virtualized={enableContentVirtualization}
        data-visible={virtualState.isVisible}
        data-rendered={virtualState.shouldRender}
      >
        {isLoading
          ? loadingContent
          : shouldRenderContent
            ? resolvedCellContent
            : ""}
        {isSpanned && shouldRenderContent && !isLoading && (
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
  },
);
