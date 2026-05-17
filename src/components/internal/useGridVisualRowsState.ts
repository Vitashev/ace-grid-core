import { useCallback, useMemo } from "react";

import type { GridRowGroup } from "../../types";
import { EMPTY_ROW_INDEX_MAP } from "../gridUtils";

const EMPTY_VISUAL_ROW_ORDER: number[] = [];

type UseGridVisualRowsStateArgs = {
  centerGroupsForRender: GridRowGroup[];
  effectivePinnedTopGroups: GridRowGroup[];
  effectivePinnedBottomGroups: GridRowGroup[];
  rowIndexLookup: Map<string | number, number>;
  serverRowModelEnabled: boolean;
  ssrmPaginationActive: boolean;
  ssrmViewRowCount: number;
};

export const useGridVisualRowsState = ({
  centerGroupsForRender,
  effectivePinnedTopGroups,
  effectivePinnedBottomGroups,
  rowIndexLookup,
  serverRowModelEnabled,
  ssrmPaginationActive,
  ssrmViewRowCount,
}: UseGridVisualRowsStateArgs) => {
  const ssrmVisualRowOrder = useMemo(() => {
    if (!serverRowModelEnabled) return EMPTY_VISUAL_ROW_ORDER;
    if (ssrmPaginationActive) {
      const order: number[] = [];
      centerGroupsForRender.forEach((group) => {
        for (
          let rowIndex = group.startRowIndex;
          rowIndex <= group.endRowIndex;
          rowIndex += 1
        ) {
          order.push(rowIndex);
        }
      });
      return order;
    }
    const total = Math.max(0, ssrmViewRowCount);
    const order: number[] = [];
    order.length = total;
    return order;
  }, [centerGroupsForRender, serverRowModelEnabled, ssrmViewRowCount, ssrmPaginationActive]);

  const clientVisualRowOrder = useMemo(() => {
    const order: number[] = [];
    const pushGroup = (group: GridRowGroup) => {
      for (let index = 0; index < group.rows.length; index += 1) {
        const absoluteIndex = rowIndexLookup.get(group.rows[index].id);
        order.push(absoluteIndex != null ? absoluteIndex : group.startRowIndex + index);
      }
    };

    effectivePinnedTopGroups.forEach(pushGroup);
    centerGroupsForRender.forEach(pushGroup);
    effectivePinnedBottomGroups.forEach(pushGroup);
    return order;
  }, [
    effectivePinnedTopGroups,
    centerGroupsForRender,
    effectivePinnedBottomGroups,
    rowIndexLookup,
  ]);

  const visualRowOrder = serverRowModelEnabled
    ? ssrmVisualRowOrder
    : clientVisualRowOrder;

  const visualRowIndexLookup = useMemo(() => {
    const map = new Map<number, number>();
    visualRowOrder.forEach((absoluteRowIndex, visualRowIndex) => {
      if (
        typeof absoluteRowIndex === "number" &&
        Number.isFinite(absoluteRowIndex)
      ) {
        map.set(absoluteRowIndex, visualRowIndex);
      }
    });
    return map;
  }, [visualRowOrder]);

  const rowIndexToVisual = useMemo(
    () => (serverRowModelEnabled ? EMPTY_ROW_INDEX_MAP : visualRowIndexLookup),
    [serverRowModelEnabled, visualRowIndexLookup],
  );

  const resolveSemanticBodyRowIndex = useCallback(
    (rowIndex: number) => {
      if (serverRowModelEnabled && !ssrmPaginationActive) {
        return rowIndex;
      }
      return visualRowIndexLookup.get(rowIndex) ?? rowIndex;
    },
    [serverRowModelEnabled, ssrmPaginationActive, visualRowIndexLookup],
  );

  return {
    visualRowOrder,
    rowIndexToVisual,
    resolveSemanticBodyRowIndex,
  };
};
