import React, { memo } from "react";

import type { GridColumn, GridRowGroup } from "../../types";
import type { SpanCoverage } from "../../runtime/publicCoreSupport";
import type { GridSharedRowViewProps } from "./useGridSharedRowViewProps";
import { RowGroup } from "../RowGroup";
import { RowGroupView } from "../RowGroupView";

type VirtualCenterColsState = {
  visible: GridColumn[];
  start: number;
  end: number;
  before: number;
  after: number;
};

type GridPinnedRowGroupsLayerProps = {
  position: "top" | "bottom";
  groups: GridRowGroup[];
  offsets: Record<string, number>;
  stickyHeader: boolean;
  effectiveHeaderTotalHeight: number;
  rowViewProps: GridSharedRowViewProps;
  virtualCenterCols: VirtualCenterColsState;
  centerColumnSizes: string[];
  centerSpanCoverage: Map<string, SpanCoverage>;
};

const TOP_BACKGROUND =
  "var(--ace-grid-pinned-row-top-bg, var(--ace-grid-surface-raised, var(--ace-grid-surface-base, #fff)))";
const BOTTOM_BACKGROUND =
  "var(--ace-grid-pinned-row-bottom-bg, var(--ace-grid-surface-raised, var(--ace-grid-surface-base, #fff)))";
const TOP_SHADOW =
  "var(--ace-grid-pinned-row-top-shadow, var(--ace-grid-row-shadow, none))";
const BOTTOM_SHADOW =
  "var(--ace-grid-pinned-row-bottom-shadow, var(--ace-grid-row-shadow, none))";

export const GridPinnedRowGroupsLayer: React.FC<GridPinnedRowGroupsLayerProps> =
  memo(
    ({
      position,
      groups,
      offsets,
      stickyHeader,
      effectiveHeaderTotalHeight,
      rowViewProps,
      virtualCenterCols,
      centerColumnSizes,
      centerSpanCoverage,
    }) => {
      if (!groups.length) return null;

      const isTop = position === "top";

      return (
        <>
          {groups.map((group) => {
            const groupKey = String(group.id);
            const rowKey = String(group.rows[0].id);
            const isDragged =
              rowViewProps.rowDragState.draggedRowId === rowKey ||
              rowViewProps.rowDragState.draggedRowIds.includes(rowKey);
            const isOver = rowViewProps.rowDragState.dragOverRowId === rowKey;
            const groupHasSpan = rowViewProps.rowHasSpans(rowKey);
            const canDrag = rowViewProps.isRowReorder && !groupHasSpan;

            return (
              <RowGroup
                key={`${isTop ? "pin-top" : "pin-bottom"}-${groupKey}`}
                id={groupKey}
                sticky={
                  isTop
                    ? {
                        top:
                          (stickyHeader ? effectiveHeaderTotalHeight : 0) +
                          (offsets[groupKey] || 0),
                      }
                    : {
                        bottom: offsets[groupKey] || 0,
                      }
                }
                background={isTop ? TOP_BACKGROUND : BOTTOM_BACKGROUND}
                shadow={isTop ? TOP_SHADOW : BOTTOM_SHADOW}
                zIndex={isTop ? 320 : 310}
                canDrag={canDrag}
                isDragged={isDragged}
                hasSpans={groupHasSpan}
                pinnedPosition={position}
                dragOverPosition={isOver ? rowViewProps.rowDragState.dragOverPosition : null}
                dragCount={
                  isDragged && rowViewProps.rowDragState.draggedRowIds.length > 1
                    ? rowViewProps.rowDragState.draggedRowIds.length
                    : undefined
                }
                onDragStart={(event) => rowViewProps.handleRowDragStart(event, rowKey)}
                onDragOver={(event) => rowViewProps.onRowDragOver(event, rowKey)}
                onDragLeave={rowViewProps.onRowDragLeave}
                onDrop={(event) => rowViewProps.onRowDrop(event, rowKey)}
                onDragEnd={rowViewProps.onRowDragEnd}
              >
                <RowGroupView
                  {...rowViewProps}
                  group={group}
                  virtualCenterCols={virtualCenterCols}
                  centerColumnSizes={centerColumnSizes}
                  centerSpanCoverage={centerSpanCoverage}
                />
              </RowGroup>
            );
          })}
        </>
      );
    },
  );
