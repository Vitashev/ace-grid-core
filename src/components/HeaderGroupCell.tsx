import React, { useMemo } from "react";
import { useGridTheme } from "../features/theming";
import type { ColumnGroupDropPlacement } from "../features/column-groups";
import type { GridColumnDropEdge } from "../features/reorder/types";
import type { ColumnGroupDragMeta } from "../features/reorder/hooks/useColumnDnD";
import type {
  ColumnResizeHandleOverrides,
  ColumnResizeHandleProps,
} from "../features/resize";
import { cx } from "../utils/cx";

interface HeaderGroupCellProps extends ColumnGroupDragMeta {
  id?: string;
  isOpen: boolean;
  isExpandable: boolean;
  onToggle: () => void;
  title: string;
  colSpan: number;
  rowSpan?: number;
  isPinnedSegment?: boolean;
  ariaColIndex?: number;
  ariaRowIndex?: number;
  style: React.CSSProperties;
  height: number;
  isDraggable: boolean;
  enableColumnResize: boolean;
  onGroupDragStart?: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  onGroupDragEnd?: (event: React.DragEvent) => void;
  onGroupDragOver?: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  onGroupDragLeave?: (event: React.DragEvent) => void;
  onGroupDrop?: (event: React.DragEvent, meta: ColumnGroupDragMeta) => void;
  dragState: {
    draggedColumnKey: string | null;
    dragOverColumnKey: string | null;
    dragOverPosition: GridColumnDropEdge | null;
    dragOverGroupId: string | null;
    groupDropPlacement: ColumnGroupDropPlacement;
    groupDropInsideIndex: number | null;
  };
  onResizeStart?: (event: React.MouseEvent, columnKeys: string[]) => void;
  getColumnResizeHandleProps?: (
    columnKey: string,
    overrides?: ColumnResizeHandleOverrides
  ) => ColumnResizeHandleProps;
}

export const HeaderGroupCell: React.FC<HeaderGroupCellProps> = ({
  id,
  columnKeys,
  groupId,
  depth,
  parentGroupId,
  childNodes,
  path,
  isOpen,
  isExpandable,
  onToggle,
  title,
  colSpan,
  rowSpan = 1,
  isPinnedSegment = false,
  ariaColIndex,
  ariaRowIndex,
  style,
  height,
  isDraggable,
  enableColumnResize,
  onGroupDragStart,
  onGroupDragEnd,
  onGroupDragOver,
  onGroupDragLeave,
  onGroupDrop,
  dragState,
  onResizeStart,
  getColumnResizeHandleProps,
}) => {
  const { tokens, icons } = useGridTheme();
  const showToggle = isExpandable && !isPinnedSegment;
  const rightControlSlotWidth = useMemo(
    () => (showToggle ? 18 : 0),
    [showToggle]
  );
  const gridTemplateColumns = useMemo(() => {
    if (rightControlSlotWidth > 0) {
      return `minmax(0, 1fr) ${rightControlSlotWidth}px`;
    }

    return "minmax(0, 1fr)";
  }, [rightControlSlotWidth]);
  const controlColumnGap = useMemo(
    () => (rightControlSlotWidth > 0 ? 8 : 0),
    [rightControlSlotWidth]
  );

  const baseStyle = useMemo<React.CSSProperties>(
    () => ({
      ...style,
      display: "grid",
      gridTemplateColumns,
      alignItems: "center",
      justifyContent: "stretch",
      padding: `0 ${tokens.cellPaddingHorizontal}px`,
      fontWeight: 600,
      fontSize: tokens.fontSize,
      color: tokens.headerTextColor,
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: tokens.headerBorderColor,
      borderBottom: `1px solid ${tokens.headerBorderColor}`,
      boxSizing: "border-box",
      height: rowSpan > 1 ? height * rowSpan : height,
      backgroundColor: tokens.headerBackground,
      columnGap: controlColumnGap,
      position: "relative",
      minWidth: 0,
      cursor: isDraggable ? "grab" : "default",
    }),
    [
      controlColumnGap,
      gridTemplateColumns,
      height,
      rowSpan,
      isDraggable,
      style,
      tokens.cellPaddingHorizontal,
      tokens.fontSize,
      tokens.headerBackground,
      tokens.headerBorderColor,
      tokens.headerTextColor,
    ]
  );

  const labelStyle = useMemo<React.CSSProperties>(
    () => ({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "left",
    }),
    []
  );

  const labelContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      minWidth: 0,
      width: "100%",
      gap: 8,
    }),
    []
  );

  const controlSlotStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
      width: "100%",
    }),
    []
  );

  const dragHandleStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      color: tokens.textMuted,
      cursor: isDraggable ? "grab" : "default",
    }),
    [isDraggable, tokens.textMuted]
  );

  const dragHandleIcon = useMemo(
    () =>
      icons.dragHandle({
        className: "ace-grid__drag-handle-icon",
        orientation: "column",
        isPinned: false,
        isDragging: false,
      }),
    [icons]
  );

  const chevronIcon = useMemo(
    () =>
      icons.headerGroupChevron({
        className: "ace-grid__header-group-chevron",
        isOpen,
        isExpandable,
      }),
    [icons, isExpandable, isOpen]
  );

  const isDragOver = useMemo(
    () => dragState?.dragOverGroupId === groupId,
    [dragState?.dragOverGroupId, groupId]
  );

  const dropPosition = isDragOver ? dragState.dragOverPosition : null;
  const dropPlacement = isDragOver ? dragState.groupDropPlacement : null;
  const insideIndicatorStyle = useMemo<React.CSSProperties | null>(() => {
    if (!isDragOver || dropPlacement !== "inside") {
      return null;
    }

    if (!childNodes.length) {
      return { left: "50%" };
    }

    const totalWidth = childNodes.reduce(
      (sum, node) => sum + (node.width ?? 0),
      0
    );
    const targetIndex = Math.min(
      Math.max(dragState.groupDropInsideIndex ?? childNodes.length, 0),
      childNodes.length
    );

    if (totalWidth <= 0) {
      const percent = (targetIndex / childNodes.length) * 100;
      return { left: `${percent}%` };
    }

    let offset = 0;
    for (let i = 0; i < targetIndex; i += 1) {
      offset += childNodes[i].width ?? 0;
    }
    const percent = (offset / totalWidth) * 100;
    return { left: `${percent}%` };
  }, [childNodes, dragState.groupDropInsideIndex, dropPlacement, isDragOver]);

  const dragMeta = useMemo(
    () => ({
      columnKeys,
      groupId,
      depth,
      parentGroupId,
      childNodes,
      path,
    }),
    [columnKeys, groupId, depth, parentGroupId, childNodes, path]
  );

  const className = useMemo(() => {
    const classes = [
      "ace-grid__header-cell",
      "ace-grid__header-group-cell",
    ];
    if (isDraggable) classes.push("ace-grid__header-group-cell--draggable");
    if (isDragOver) {
      if (dropPlacement === "inside") {
        classes.push("ace-grid__header-group-cell--drag-over-inside");
      }
      else if (dropPosition) {
        classes.push(
          dropPosition === "left"
            ? "ace-grid__header-group-cell--drag-over-left"
            : "ace-grid__header-group-cell--drag-over-right"
        );
      }
    }
    return cx(...classes);
  }, [isDraggable, isDragOver, dropPosition, dropPlacement]);

  return (
    <div
      id={id}
      role="columnheader"
      aria-colindex={ariaColIndex}
      aria-rowindex={ariaRowIndex}
      aria-expanded={showToggle ? isOpen : undefined}
      aria-colspan={colSpan}
      aria-rowspan={rowSpan > 1 ? rowSpan : undefined}
      style={baseStyle}
      className={className}
      draggable={isDraggable && columnKeys.length > 0}
      onDragStart={
        isDraggable
          ? (event) => {
              onGroupDragStart?.(event, dragMeta);
            }
          : undefined
      }
      onDragEnd={
        isDraggable
          ? (event) => {
              onGroupDragEnd?.(event);
          }
          : undefined
      }
      onDragOver={
        isDraggable
          ? (event) => {
              onGroupDragOver?.(event, dragMeta);
            }
          : undefined
      }
      onDragLeave={isDraggable ? onGroupDragLeave : undefined}
      onDrop={
        isDraggable
          ? (event) => {
              onGroupDrop?.(event, dragMeta);
            }
          : undefined
      }
    >
      <div
        style={labelContainerStyle}
        className="ace-grid__header-group-label ace-grid__header-cell-content"
      >
        {isDraggable ? (
          <span
            className="ace-grid__drag-handle"
            style={dragHandleStyle}
            data-col-drag-handle="true"
            title="Drag to reorder columns"
          >
            {dragHandleIcon}
          </span>
        ) : null}
        <span
          style={labelStyle}
          title={title}
          className="ace-grid__header-group-label-text"
        >
          {title}
        </span>
      </div>
      {showToggle ? (
        <div style={controlSlotStyle}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            className="ace-grid__header-group-toggle"
          >
            {chevronIcon}
          </button>
        </div>
      ) : null}
      {enableColumnResize && columnKeys.length > 0 ? (
        getColumnResizeHandleProps ? (
          <div
            {...getColumnResizeHandleProps(columnKeys[columnKeys.length - 1], {
              className: "ace-grid__column-resize-handle ace-grid__column-resize-handle--group",
              style: {
                position: "absolute",
                right: -2,
                top: 0,
                bottom: 0,
                width: 4,
                cursor: "col-resize",
              },
            })}
            role="separator"
            aria-orientation="horizontal"
            aria-label={`Resize ${title}`}
          />
        ) : (
          <div
            onMouseDown={(event) => onResizeStart?.(event, columnKeys)}
            className="ace-grid__column-resize-handle ace-grid__column-resize-handle--group ace-grid__column-resize-handle--group-fallback"
            role="separator"
            aria-orientation="horizontal"
            aria-label={`Resize ${title}`}
          />
        )
      ) : null}
      {insideIndicatorStyle ? (
        <span
          className="ace-grid__group-inside-indicator"
          style={insideIndicatorStyle}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
};
