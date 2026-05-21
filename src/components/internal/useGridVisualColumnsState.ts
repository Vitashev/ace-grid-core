import { useCallback, useMemo } from "react";

import type { GridColumn, GridRowGroup } from "../../types";
import {
  buildSpanCoverage,
  type SpanCoverage,
} from "../../runtime/publicCoreSupport";

type VirtualColumnsState = {
  visible: GridColumn[];
  start: number;
  end: number;
  before: number;
  after: number;
};

type VirtualGroupsState = {
  visible: GridRowGroup[];
  start: number;
  end: number;
  before: number;
  after: number;
};

type UseGridVisualColumnsStateArgs = {
  pinnedLeftColumns: GridColumn[];
  pinnedRightColumns: GridColumn[];
  centerColumns: GridColumn[];
  virtualCenterCols: VirtualColumnsState;
  virtualCenterGroups: VirtualGroupsState;
  colWidthOf: (key: string) => number;
  enableCellSpanning: boolean;
  hasMergedCells: boolean;
  effectiveVirtualization: boolean;
  centerGroupsForRender: GridRowGroup[];
  effectivePinnedTopGroups: GridRowGroup[];
  effectivePinnedBottomGroups: GridRowGroup[];
};

export const useGridVisualColumnsState = ({
  pinnedLeftColumns,
  pinnedRightColumns,
  centerColumns,
  virtualCenterCols,
  virtualCenterGroups,
  colWidthOf,
  enableCellSpanning,
  hasMergedCells,
  effectiveVirtualization,
  centerGroupsForRender,
  effectivePinnedTopGroups,
  effectivePinnedBottomGroups,
}: UseGridVisualColumnsStateArgs) => {
  const visualColumns = useMemo(
    () => [
      ...pinnedLeftColumns,
      ...virtualCenterCols.visible,
      ...pinnedRightColumns,
    ],
    [pinnedLeftColumns, virtualCenterCols.visible, pinnedRightColumns],
  );

  const visualColumnSizes = useMemo(
    () => visualColumns.map((column) => `${colWidthOf(column.key)}px`),
    [colWidthOf, visualColumns],
  );

  const pinnedLeftColumnSizes = useMemo(
    () => pinnedLeftColumns.map((column) => `${colWidthOf(column.key)}px`),
    [colWidthOf, pinnedLeftColumns],
  );

  const pinnedRightColumnSizes = useMemo(
    () => pinnedRightColumns.map((column) => `${colWidthOf(column.key)}px`),
    [colWidthOf, pinnedRightColumns],
  );

  const virtualCenterColumnSizes = useMemo(
    () =>
      virtualCenterCols.visible.map((column) => `${colWidthOf(column.key)}px`),
    [colWidthOf, virtualCenterCols.visible],
  );

  const pinnedCenterColumnSizes = useMemo(
    () => centerColumns.map((column) => `${colWidthOf(column.key)}px`),
    [centerColumns, colWidthOf],
  );

  const visualColumnIndex = useMemo(() => {
    const map = new Map<string, number>();
    visualColumns.forEach((column, index) => map.set(column.key, index));
    return map;
  }, [visualColumns]);

  const selectionColumns = useMemo(
    () => [...pinnedLeftColumns, ...centerColumns, ...pinnedRightColumns],
    [pinnedLeftColumns, centerColumns, pinnedRightColumns],
  );

  const selectionColumnIndex = useMemo(() => {
    const map = new Map<string, number>();
    selectionColumns.forEach((column, index) => map.set(column.key, index));
    return map;
  }, [selectionColumns]);

  const buildSpanCoverageMap = useCallback(
    (groups: GridRowGroup[]) => {
      if (!enableCellSpanning || !hasMergedCells || !groups.length) {
        return new Map<string, SpanCoverage>();
      }

      const map = new Map<string, SpanCoverage>();
      groups.forEach((group) => {
        if (!group.spans.size) return;
        const key = group.rows.length > 0 ? String(group.rows[0].id) : group.id;
        map.set(
          key,
          buildSpanCoverage(
            group.spans,
            visualColumns,
            visualColumnIndex,
            group.rows.length,
          ),
        );
      });
      return map;
    },
    [enableCellSpanning, hasMergedCells, visualColumns, visualColumnIndex],
  );

  const centerSpanCoverage = useMemo(
    () =>
      buildSpanCoverageMap(
        effectiveVirtualization
          ? virtualCenterGroups.visible
          : centerGroupsForRender,
      ),
    [
      buildSpanCoverageMap,
      effectiveVirtualization,
      virtualCenterGroups.visible,
      centerGroupsForRender,
    ],
  );

  const pinnedTopSpanCoverage = useMemo(
    () => buildSpanCoverageMap(effectivePinnedTopGroups),
    [buildSpanCoverageMap, effectivePinnedTopGroups],
  );

  const pinnedBottomSpanCoverage = useMemo(
    () => buildSpanCoverageMap(effectivePinnedBottomGroups),
    [buildSpanCoverageMap, effectivePinnedBottomGroups],
  );

  const pinnedVirtualCenterCols = useMemo(() => {
    if (centerColumns.length === 0) {
      return {
        visible: [] as GridColumn[],
        start: 0,
        end: -1,
        before: 0,
        after: 0,
      };
    }
    return {
      visible: centerColumns,
      start: 0,
      end: centerColumns.length - 1,
      before: 0,
      after: 0,
    };
  }, [centerColumns]);

  return {
    visualColumns,
    visualColumnSizes,
    pinnedLeftColumnSizes,
    pinnedRightColumnSizes,
    virtualCenterColumnSizes,
    pinnedCenterColumnSizes,
    visualColumnIndex,
    selectionColumns,
    selectionColumnIndex,
    centerSpanCoverage,
    pinnedTopSpanCoverage,
    pinnedBottomSpanCoverage,
    pinnedVirtualCenterCols,
  };
};
