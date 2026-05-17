import React, { memo, useCallback, useMemo } from "react";
import type {
  GridColumn,
  GridColumnFilterPanelRendererArgs,
  GridRow,
  GridFilterConfig,
  GridSortConfig,
} from "../types";
import { HeaderCell } from "./HeaderCell";
import { HeaderGroupCell } from "./HeaderGroupCell";
import { OffsetCell } from "../features/virtual/components/OffsetCell";
import { useGridTheme } from "../features/theming";
import { isSystemCol } from "../features/cell-selection";
import type {
  ColumnGroupingState,
  HeaderCellDescriptor,
  HeaderMatrix,
} from "../features/column-groups";
import { buildHeaderMatrix } from "../features/column-groups";
import { cx } from "../utils/cx";
import type {
  ColumnGroupDragMeta,
  ColumnGroupChildMeta,
} from "../features/reorder/hooks/useColumnDnD";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";

export type HeaderRowProps = {
  headerCellIdBase?: string;
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  virtualCenterCols: {
    visible: GridColumn[];
    start: number;
    end: number;
    before: number;
    after: number;
  };
  headerRowHeight: number;
  headerRowCount: number;
  colWidthOf: (key: string) => number;
  applyPinnedStyle: (
    base: React.CSSProperties,
    column: GridColumn,
    isLeft: boolean,
    isRight: boolean,
    mode?: "cell" | "strip"
  ) => React.CSSProperties;
  columnGrouping: ColumnGroupingState;
  onToggleColumnGroup: (groupId: string, open?: boolean) => void;
  onGroupDragStart: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  onGroupDragOver: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  onGroupDragLeave: (event: React.DragEvent) => void;
  onGroupDrop: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  resizeColumns: (updates: Array<{ key: string; width: number }>) => void;
  columnHasSpans: (key: string) => boolean;
  dragState: any;
  isColReorder: boolean;
  advancedColumnReorderEnabled?: boolean;
  pinnedSet: Set<string>;
  leftPinnedSet: Set<string>;
  onColDragStart: (e: React.DragEvent, key: string) => void;
  onColDragOver: (e: React.DragEvent, key: string) => void;
  onColDragLeave: (e: React.DragEvent) => void;
  onColDrop: (e: React.DragEvent, key: string) => void;
  onColDragEnd: (e: React.DragEvent) => void;
  isColSelection: boolean;
  selectedColumnKeys: string[];
  toggleColumnSelection: (key: string) => void;
  sortModel: GridSortConfig[];
  triggerSort: (key: string, event?: React.MouseEvent) => void;
  getColumnResizeHandleProps: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;
  activeFilters: GridFilterConfig[];
  activeFilterColumn: string | null;
  setActiveFilterColumn: (k: string | null) => void;
  onFilter?: (colKey: string, f: GridFilterConfig | null) => void;
  rows: GridRow[];
  rowsRevision?: number;
  enableAdvancedMultiFilter?: boolean;
  renderColumnFilterPanel?: (
    args: GridColumnFilterPanelRendererArgs
  ) => React.ReactNode;
  doPinColumn: (key: string, side: "left" | "right" | null) => void;
  isColPinning: boolean;
  enableColumnResize: boolean;
  RowSelectHeader: React.ReactNode;
  getColumnLabel?: (column: GridColumn) => React.ReactNode;
  visualColumnIndex: Map<string, number>;
  ariaRowIndexStart?: number;
};

const sumColumnWidths = (
  keys: string[],
  colWidthOf: (key: string) => number
) => keys.reduce((acc, key) => acc + colWidthOf(key), 0);

type SegmentKind = "left" | "right" | "center";

export const HeaderRow: React.FC<HeaderRowProps> = memo(
  ({
    headerCellIdBase,
    pinnedLeftColumns,
    pinnedRightColumns,
    centerColumns,
    virtualCenterCols,
    headerRowHeight,
    headerRowCount,
    colWidthOf,
    applyPinnedStyle,
    columnGrouping,
    onToggleColumnGroup,
    onGroupDragStart,
    onGroupDragOver,
    onGroupDragLeave,
    onGroupDrop,
    resizeColumns,
    columnHasSpans,
    dragState,
    isColReorder,
    advancedColumnReorderEnabled = false,
    pinnedSet,
    leftPinnedSet,
    onColDragStart,
    onColDragOver,
    onColDragLeave,
    onColDrop,
    onColDragEnd,
    isColSelection,
    selectedColumnKeys,
    toggleColumnSelection,
    sortModel,
    triggerSort,
    getColumnResizeHandleProps,
    activeFilters,
    activeFilterColumn,
    setActiveFilterColumn,
    onFilter,
    rows,
    rowsRevision = 0,
    enableAdvancedMultiFilter,
    renderColumnFilterPanel,
    doPinColumn,
    isColPinning,
    enableColumnResize,
    RowSelectHeader,
    getColumnLabel,
    visualColumnIndex,
    ariaRowIndexStart = 1,
  }) => {
    const { tokens } = useGridTheme();
    const centerVirtual = virtualCenterCols;
    const headerTotalHeight = headerRowCount * headerRowHeight;
    const globalDepth = Math.max(headerRowCount - 1, 0);

    const columnMetaByKey = useMemo(() => {
      const map = new Map<string, GridColumn>();
      pinnedLeftColumns.forEach((col) => map.set(col.key, col));
      centerColumns.forEach((col) => map.set(col.key, col));
      pinnedRightColumns.forEach((col) => map.set(col.key, col));
      return map;
    }, [centerColumns, pinnedLeftColumns, pinnedRightColumns]);

    const handleGroupResizeStart = useCallback(
      (event: React.MouseEvent, keys: string[]) => {
        if (!enableColumnResize || !keys.length) return;
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const columnsMeta = keys.map((key) => {
          const column = columnMetaByKey.get(key);
          const minWidth = column?.minWidth ?? 60;
          const maxWidth = column?.maxWidth ?? Number.POSITIVE_INFINITY;
          const startWidth = colWidthOf(key);
          return { key, minWidth, maxWidth, startWidth };
        });

        const startTotal = columnsMeta.reduce(
          (sum, column) => sum + column.startWidth,
          0
        );
        const minTotal = columnsMeta.reduce(
          (sum, column) => sum + column.minWidth,
          0
        );

        if (startTotal <= 0) {
          return;
        }

        const applyWidths = (clientX: number) => {
          const delta = clientX - startX;
          const targetTotal = Math.max(minTotal, startTotal + delta);
          const scale = startTotal > 0 ? targetTotal / startTotal : 1;

          const widths = columnsMeta.map((column) => {
            const scaled = column.startWidth * scale;
            const clamped = Math.max(
              column.minWidth,
              Math.min(column.maxWidth, Math.round(scaled))
            );
            return clamped;
          });

          const currentTotal = widths.reduce((sum, width) => sum + width, 0);
          let residual = targetTotal - currentTotal;

          if (residual > 0) {
            let adjusted = true;
            while (residual > 0 && adjusted) {
              adjusted = false;
              for (let i = widths.length - 1; i >= 0 && residual > 0; i -= 1) {
                const maxWidth = columnsMeta[i].maxWidth;
                if (widths[i] < maxWidth) {
                  widths[i] += 1;
                  residual -= 1;
                  adjusted = true;
                }
              }
            }
          } else if (residual < 0) {
            let adjusted = true;
            while (residual < 0 && adjusted) {
              adjusted = false;
              for (let i = widths.length - 1; i >= 0 && residual < 0; i -= 1) {
                const minWidth = columnsMeta[i].minWidth;
                if (widths[i] > minWidth) {
                  widths[i] -= 1;
                  residual += 1;
                  adjusted = true;
                }
              }
            }
          }

          resizeColumns(
            widths.map((width, index) => ({
              key: columnsMeta[index].key,
              width,
            }))
          );
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
          applyWidths(moveEvent.clientX);
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
          applyWidths(upEvent.clientX);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      },
      [colWidthOf, columnMetaByKey, enableColumnResize, resizeColumns]
    );

    const visibleCenterColumns = centerVirtual.visible;
    const leafByKey = columnGrouping.normalized.leafByKey;
    const hasGroupedCenterHeaders = useMemo(
      () =>
        centerColumns.some((column) => {
          const leaf = leafByKey.get(column.key);
          return Boolean(leaf?.parent);
        }),
      [centerColumns, leafByKey]
    );
    const headerCenterColumns = hasGroupedCenterHeaders
      ? centerColumns
      : visibleCenterColumns;
    const systemBoundaryColumnKey = useMemo(() => {
      for (let i = pinnedLeftColumns.length - 1; i >= 0; i -= 1) {
        const key = pinnedLeftColumns[i]?.key;
        if (key && isSystemCol(key)) return key;
      }
      return null;
    }, [pinnedLeftColumns]);

    const leftMatrix = useMemo(
      () => buildHeaderMatrix(pinnedLeftColumns, leafByKey, globalDepth),
      [pinnedLeftColumns, leafByKey, globalDepth]
    );

    const centerMatrix = useMemo(
      () => buildHeaderMatrix(headerCenterColumns, leafByKey, globalDepth),
      [headerCenterColumns, leafByKey, globalDepth]
    );

    const rightMatrix = useMemo(
      () => buildHeaderMatrix(pinnedRightColumns, leafByKey, globalDepth),
      [pinnedRightColumns, leafByKey, globalDepth]
    );

    const renderCell = useCallback(
      (
        cell: HeaderCellDescriptor,
        segmentColumns: GridColumn[],
        segmentKind: SegmentKind
      ) => {
        const colSpan = cell.endCol - cell.startCol;
        const rowSpan = cell.rowSpan ?? 1;
        const firstColumn =
          segmentColumns[cell.startCol - 1] ?? segmentColumns[0];
        const ariaColIndex = firstColumn
          ? (visualColumnIndex.get(firstColumn.key) ?? 0) + 1
          : undefined;
        const ariaRowIndex = ariaRowIndexStart + cell.row - 1;
        const cellId =
          headerCellIdBase && ariaColIndex != null
            ? `${headerCellIdBase}-r${ariaRowIndex}-c${ariaColIndex}`
            : undefined;
        const width = sumColumnWidths(cell.columnKeys, colWidthOf);
        let style: React.CSSProperties = {
          gridColumn: `${cell.startCol} / ${cell.endCol}`,
          gridRow: `${cell.row} / ${cell.row + rowSpan}`,
          width,
          minWidth: width,
          maxWidth: width,
          height: headerRowHeight * rowSpan,
          display: "flex",
          alignItems: rowSpan > 1 ? "center" : "stretch",
          boxSizing: "border-box",
        };

        if (segmentKind !== "center" && firstColumn) {
          const isLeft = segmentKind === "left";
          const isRight = segmentKind === "right";
          // Use "strip" mode because the segment container already has sticky positioning
          // We only need the left offset for proper shadow positioning
          style = applyPinnedStyle(
            style,
            firstColumn,
            isLeft,
            isRight,
            "strip"
          );
          style.zIndex = 500 + (headerRowCount - cell.row);
        } else {
          style.zIndex = 450 + (headerRowCount - cell.row);
        }

        if (cell.type === "placeholder") {
          const isSystemPlaceholder = cell.columnKeys.every((key) =>
            isSystemCol(key)
          );
          return (
            <div
              key={`placeholder-${segmentKind}-${cell.row}-${cell.startCol}`}
              className={cx(
                "ace-grid__header-placeholder-cell",
                isSystemPlaceholder && "ace-grid__header-placeholder-cell--system"
              )}
              style={{
                ...style,
                borderRightWidth: 1,
                borderRightStyle: "solid",
                borderRightColor: tokens.headerBorderColor,
                borderBottom: `1px solid ${tokens.headerBorderColor}`,
                backgroundColor: tokens.headerBackground,
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
          );
        }

        if (cell.type === "group" && cell.group) {
          const group = cell.group;
          const title =
            group.def.title ??
            group.def.headerName ??
            group.def.groupId ??
            group.id;
          const isOpen = columnGrouping.isGroupOpen(group.id);
          const toggle = () => onToggleColumnGroup(group.id);
          const childNodes: ColumnGroupChildMeta[] = group.children
            .map((child) => {
              if (child.kind === "group") {
                return {
                  kind: "group" as const,
                  id: child.id,
                  leafKeys: child.leafKeys,
                  width: child.leafKeys.reduce((sum, leafKey) => {
                    const col = columnMetaByKey.get(leafKey);
                    return sum + (col ? colWidthOf(col.key) : 0);
                  }, 0),
                };
              }
              if (child.kind === "leaf") {
                const width = colWidthOf(child.column.key);
                return {
                  kind: "leaf" as const,
                  key: child.column.key,
                  leafKeys: [child.column.key],
                  width,
                };
              }
              return null;
            })
            .filter(Boolean) as ColumnGroupChildMeta[];
          const path: string[] = [];
          let ancestor = group.parent;
          const stack: string[] = [group.id];
          while (ancestor) {
            stack.unshift(ancestor.id);
            ancestor = ancestor.parent;
          }
          path.push(...stack);
          return (
            <HeaderGroupCell
              id={cellId}
              key={`group-${group.id}-${cell.row}-${cell.startCol}`}
              columnKeys={cell.columnKeys}
              groupId={group.id}
              depth={group.depth}
              parentGroupId={group.parent ? group.parent.id : null}
              childNodes={childNodes}
              path={path}
              isOpen={isOpen}
              isExpandable={group.isExpandable}
              onToggle={toggle}
              title={title}
              colSpan={colSpan}
              rowSpan={rowSpan}
              isPinnedSegment={segmentKind !== "center"}
              style={style}
              height={headerRowHeight}
              isDraggable={isColReorder && advancedColumnReorderEnabled}
              enableColumnResize={enableColumnResize}
              onGroupDragStart={onGroupDragStart}
              onGroupDragEnd={onColDragEnd}
              onGroupDragOver={onGroupDragOver}
              onGroupDragLeave={onGroupDragLeave}
              onGroupDrop={onGroupDrop}
              dragState={dragState}
              onResizeStart={(event) =>
                handleGroupResizeStart(event, cell.columnKeys)
              }
              getColumnResizeHandleProps={getColumnResizeHandleProps}
              ariaColIndex={ariaColIndex}
              ariaRowIndex={ariaRowIndex}
            />
          );
        }

        const column = firstColumn;
        if (!column) {
          return null;
        }
        const headerLabel = getColumnLabel ? getColumnLabel(column) : undefined;

        // System columns: pass grid positioning via containerStyle but remove sticky positioning
        // because HeaderCell will handle its own positioning
        const isSystemColumn = isSystemCol(column.key);

        if (isSystemColumn) {
          // For system columns, we need the grid positioning but NOT the sticky positioning
          // Create a wrapper style with only grid positioning
          const wrapperStyle: React.CSSProperties = {
            gridColumn: style.gridColumn,
            gridRow: style.gridRow,
            display: "flex",
            alignItems: "stretch",
          };

          return (
            <div
              key={`leaf-${column.key}`}
              role="presentation"
              style={wrapperStyle}
            >
              <HeaderCell
                id={cellId}
                col={column}
                headerLabel={headerLabel}
                isPinned={segmentKind !== "center"}
                headerHeight={headerRowHeight * rowSpan}
                colWidthOf={colWidthOf}
                columnHasSpans={columnHasSpans}
                dragState={dragState}
                isColReorder={isColReorder}
                pinnedSet={pinnedSet}
                leftPinnedSet={leftPinnedSet}
                onColDragStart={onColDragStart}
                onColDragOver={onColDragOver}
                onColDragLeave={onColDragLeave}
                onColDrop={onColDrop}
                onColDragEnd={onColDragEnd}
                isColSelection={isColSelection}
                selectedColumnKeys={selectedColumnKeys}
                toggleColumnSelection={toggleColumnSelection}
                sortModel={sortModel}
                triggerSort={triggerSort}
                getColumnResizeHandleProps={getColumnResizeHandleProps}
                activeFilters={activeFilters}
                activeFilterColumn={activeFilterColumn}
                setActiveFilterColumn={setActiveFilterColumn}
                onFilter={onFilter}
                rows={rows}
                rowsRevision={rowsRevision}
                enableAdvancedMultiFilter={enableAdvancedMultiFilter}
                renderColumnFilterPanel={renderColumnFilterPanel}
                doPinColumn={doPinColumn}
                isColPinning={isColPinning}
                enableColumnResize={enableColumnResize}
                renderRowSelectHeader={() => RowSelectHeader}
                isSystemBoundary={
                  segmentKind === "left" &&
                  column.key === systemBoundaryColumnKey
                }
                ariaColIndex={ariaColIndex}
                ariaRowIndex={ariaRowIndex}
              />
            </div>
          );
        }

        return (
          <HeaderCell
            id={cellId}
            key={`leaf-${column.key}`}
            col={column}
            headerLabel={headerLabel}
            isPinned={segmentKind !== "center"}
            headerHeight={headerRowHeight * rowSpan}
            colWidthOf={colWidthOf}
            columnHasSpans={columnHasSpans}
            dragState={dragState}
            isColReorder={isColReorder}
            pinnedSet={pinnedSet}
            leftPinnedSet={leftPinnedSet}
            onColDragStart={onColDragStart}
            onColDragOver={onColDragOver}
            onColDragLeave={onColDragLeave}
            onColDrop={onColDrop}
            onColDragEnd={onColDragEnd}
            isColSelection={isColSelection}
            selectedColumnKeys={selectedColumnKeys}
            toggleColumnSelection={toggleColumnSelection}
            sortModel={sortModel}
            triggerSort={triggerSort}
            getColumnResizeHandleProps={getColumnResizeHandleProps}
            activeFilters={activeFilters}
            activeFilterColumn={activeFilterColumn}
            setActiveFilterColumn={setActiveFilterColumn}
            onFilter={onFilter}
            rows={rows}
            rowsRevision={rowsRevision}
            enableAdvancedMultiFilter={enableAdvancedMultiFilter}
            renderColumnFilterPanel={renderColumnFilterPanel}
            doPinColumn={doPinColumn}
            isColPinning={isColPinning}
            enableColumnResize={enableColumnResize}
            renderRowSelectHeader={() => RowSelectHeader}
            containerStyle={style}
            isSystemBoundary={
              segmentKind === "left" &&
              column.key === systemBoundaryColumnKey
            }
            ariaColIndex={ariaColIndex}
            ariaRowIndex={ariaRowIndex}
          />
        );
      },
      [colWidthOf, headerCellIdBase, headerRowHeight, getColumnLabel, columnHasSpans, dragState, isColReorder, advancedColumnReorderEnabled, pinnedSet, leftPinnedSet, onColDragStart, onColDragOver, onColDragLeave, onColDrop, onColDragEnd, isColSelection, selectedColumnKeys, toggleColumnSelection, sortModel, triggerSort, getColumnResizeHandleProps, activeFilters, activeFilterColumn, setActiveFilterColumn, onFilter, rows, rowsRevision, enableAdvancedMultiFilter, renderColumnFilterPanel, doPinColumn, isColPinning, enableColumnResize, systemBoundaryColumnKey, applyPinnedStyle, headerRowCount, tokens.headerBorderColor, tokens.headerBackground, columnGrouping, onGroupDragStart, onGroupDragOver, onGroupDragLeave, onGroupDrop, onToggleColumnGroup, columnMetaByKey, handleGroupResizeStart, RowSelectHeader, visualColumnIndex, ariaRowIndexStart]
    );

    const resolveRowOwnedHeaderIds = useCallback(
      (row: HeaderCellDescriptor[], segmentColumns: GridColumn[]) =>
        row
          .map((cell) => {
            const firstColumn =
              segmentColumns[cell.startCol - 1] ?? segmentColumns[0];
            if (!firstColumn || cell.type === "placeholder") return null;
            const ariaColIndex = (visualColumnIndex.get(firstColumn.key) ?? 0) + 1;
            const ariaRowIndex = ariaRowIndexStart + cell.row - 1;
            return headerCellIdBase
              ? `${headerCellIdBase}-r${ariaRowIndex}-c${ariaColIndex}`
              : null;
          })
          .filter((id): id is string => Boolean(id))
          .join(" "),
      [ariaRowIndexStart, headerCellIdBase, visualColumnIndex],
    );

    const renderSegment = useCallback(
      (
        segmentColumns: GridColumn[],
        matrix: HeaderMatrix,
        kind: SegmentKind
      ) => {
        if (segmentColumns.length === 0) return null;
        const templateColumns = segmentColumns
          .map((col) => `${colWidthOf(col.key)}px`)
          .join(" ");

        const containerStyle: React.CSSProperties = {
          display: "grid",
          gridTemplateColumns: templateColumns || "auto",
          gridTemplateRows: `repeat(${headerRowCount}, ${headerRowHeight}px)`,
          alignItems: "stretch",
          flexShrink: 0,
          position: "relative",
        };

        if (kind === "left") {
          containerStyle.position = "sticky";
          containerStyle.left = 0;
          containerStyle.zIndex = 520;
        } else if (kind === "right") {
          containerStyle.position = "sticky";
          containerStyle.right = 0;
          containerStyle.zIndex = 520;
        }

        return (
          <div
            className={cx(
              "ace-grid__header-segment",
              `ace-grid__header-segment--${kind}`
            )}
            style={containerStyle}
          >
            {matrix.rows.map((row, rowIndex) => {
              const ownedIds = resolveRowOwnedHeaderIds(row, segmentColumns);
              if (!ownedIds) return null;
              return (
                <div
                  key={`header-semantic-row-${kind}-${rowIndex}`}
                  className="ace-grid__semantic-row-owner"
                  role="row"
                  aria-rowindex={ariaRowIndexStart + rowIndex}
                  aria-owns={ownedIds}
                  style={{ top: rowIndex * headerRowHeight }}
                />
              );
            })}
            {matrix.rows.map((row, rowIndex) => (
              <div
                key={`header-row-${kind}-${rowIndex}`}
                className="ace-grid__display-contents"
                role="row"
                aria-rowindex={ariaRowIndexStart + rowIndex}
              >
                {row.map((cell) => renderCell(cell, segmentColumns, kind))}
              </div>
            ))}
          </div>
        );
      },
      [colWidthOf, headerRowCount, headerRowHeight, renderCell, ariaRowIndexStart, resolveRowOwnedHeaderIds]
    );

    const leftContent = useMemo(
      () => renderSegment(pinnedLeftColumns, leftMatrix, "left"),
      [leftMatrix, pinnedLeftColumns, renderSegment]
    );

    const centerContent = useMemo(
      () => renderSegment(headerCenterColumns, centerMatrix, "center"),
      [centerMatrix, headerCenterColumns, renderSegment]
    );

    const hiddenBeforeColumns = useMemo(
      () =>
        hasGroupedCenterHeaders
          ? []
          : centerColumns.slice(0, Math.max(0, centerVirtual.start)),
      [centerColumns, centerVirtual.start, hasGroupedCenterHeaders]
    );
    const hiddenAfterColumns = useMemo(
      () =>
        hasGroupedCenterHeaders
          ? []
          : centerColumns.slice(
              Math.min(centerColumns.length, centerVirtual.end + 1)
            ),
      [centerColumns, centerVirtual.end, hasGroupedCenterHeaders]
    );
    const resolveOffsetTone = useCallback(
      (columns: GridColumn[]): "default" | "system" => {
        if (!columns.length) return "default";
        let systemCount = 0;
        for (let i = 0; i < columns.length; i += 1) {
          if (isSystemCol(columns[i].key)) systemCount += 1;
        }
        return systemCount / columns.length >= 0.5 ? "system" : "default";
      },
      []
    );
    const beforeOffsetTone = useMemo(
      () => resolveOffsetTone(hiddenBeforeColumns),
      [hiddenBeforeColumns, resolveOffsetTone]
    );
    const afterOffsetTone = useMemo(
      () => resolveOffsetTone(hiddenAfterColumns),
      [hiddenAfterColumns, resolveOffsetTone]
    );
    const beforeColumnWidthHint = useMemo(() => {
      const referenceColumn =
        hiddenBeforeColumns[hiddenBeforeColumns.length - 1] ??
        centerColumns[Math.max(0, centerVirtual.start)] ??
        visibleCenterColumns[0] ??
        centerColumns[0];
      if (!referenceColumn) return 140;
      return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
    }, [
      centerColumns,
      centerVirtual.start,
      hiddenBeforeColumns,
      visibleCenterColumns,
      colWidthOf,
    ]);
    const afterColumnWidthHint = useMemo(() => {
      const referenceColumn =
        hiddenAfterColumns[0] ??
        centerColumns[Math.max(0, centerVirtual.end)] ??
        visibleCenterColumns[visibleCenterColumns.length - 1] ??
        centerColumns[centerColumns.length - 1];
      if (!referenceColumn) return 140;
      return Math.max(64, Math.round(colWidthOf(referenceColumn.key)));
    }, [
      centerColumns,
      centerVirtual.end,
      hiddenAfterColumns,
      visibleCenterColumns,
      colWidthOf,
    ]);
    const beforeOffsetEdgeShadow =
      pinnedLeftColumns.length > 0 ? tokens.pinnedEdgeShadowLeft : undefined;
    const afterOffsetEdgeShadow =
      pinnedRightColumns.length > 0 ? tokens.pinnedEdgeShadowRight : undefined;

    const rightContent = useMemo(
      () => renderSegment(pinnedRightColumns, rightMatrix, "right"),
      [pinnedRightColumns, renderSegment, rightMatrix]
    );

    const headerRowClassName = cx(
      "ace-grid__header-row",
      activeFilterColumn && "ace-grid__header-row--filter-open"
    );

    return (
      <div className={headerRowClassName} style={{ display: "flex" }}>
        {leftContent}

        {!hasGroupedCenterHeaders && centerVirtual.before > 0 && (
          <OffsetCell
            width={centerVirtual.before}
            height={headerTotalHeight}
            rowHeightHint={headerRowHeight}
            columnWidthHint={beforeColumnWidthHint}
            variant="header"
            position="before"
            tone={beforeOffsetTone}
            edgeShadow={beforeOffsetEdgeShadow}
          />
        )}

        {centerContent}

        {!hasGroupedCenterHeaders && centerVirtual.after > 0 && (
          <OffsetCell
            width={centerVirtual.after}
            height={headerTotalHeight}
            rowHeightHint={headerRowHeight}
            columnWidthHint={afterColumnWidthHint}
            variant="header"
            position="after"
            tone={afterOffsetTone}
            edgeShadow={afterOffsetEdgeShadow}
          />
        )}

        {rightContent}
      </div>
    );
  }
);
