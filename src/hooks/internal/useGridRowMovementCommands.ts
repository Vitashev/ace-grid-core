import { useCallback, type Dispatch, type SetStateAction } from "react";

import type {
  GridRow,
  GridRowGroupingGroupReorderEvent,
  GridRowGroupingRowMoveEvent,
  GridRowGroupingValueMeta,
} from "../../types";
import type { RowGroupingModel } from "../../runtime/publicCoreSupport";

type UseGridRowMovementCommandsArgs = {
  groupingModel: RowGroupingModel | null;
  pushUndo: (snapshot: GridRow[]) => void;
  requestFullFormulaRecalc: () => void;
  setRows: Dispatch<SetStateAction<GridRow[]>>;
  remapRowsByOrder: (
    rows: GridRow[],
    prevOrder: string[],
    nextOrder: string[],
  ) => GridRow[] | null;
};

type GroupingNodeLike = {
  leafRows?: GridRow[];
  children?: Map<string, GroupingNodeLike>;
};

const toIndexMap = (rows: string[]) => {
  const map = new Map<string, number>();
  for (let index = 0; index < rows.length; index += 1) {
    map.set(rows[index], index);
  }
  return map;
};

const collectLeafRowIds = (node: GroupingNodeLike | null | undefined) => {
  if (!node) return [] as Array<string | number>;
  const ids: Array<string | number> = Array.isArray(node.leafRows)
    ? node.leafRows.map((row) => row.id)
    : [];
  if (node.children?.size) {
    node.children.forEach((child) => {
      ids.push(...collectLeafRowIds(child));
    });
  }
  return ids;
};

const normalizeTreePathValue = (value: unknown): Array<string | number> => {
  if (Array.isArray(value)) {
    return value.filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    );
  }
  if (typeof value === "string") {
    return value
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
  }
  return [];
};

const valuesEqual = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    return left.trim() === right.trim();
  }
  return left === right;
};

const matchesGroupLevel = (
  rowValue: unknown,
  groupValue: GridRowGroupingValueMeta,
) => {
  if (Array.isArray(rowValue) || typeof rowValue === "string") {
    const path = normalizeTreePathValue(rowValue);
    if (!path.length || groupValue.level >= path.length) return false;
    return valuesEqual(path[groupValue.level], groupValue.value);
  }
  return valuesEqual(rowValue, groupValue.value);
};

export const useGridRowMovementCommands = ({
  groupingModel,
  pushUndo,
  requestFullFormulaRecalc,
  setRows,
  remapRowsByOrder,
}: UseGridRowMovementCommandsArgs) => {
  const reorderRows = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      let changed = false;
      setRows((prev) => {
        if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) {
          return prev;
        }
        pushUndo(prev);
        changed = true;
        const prevOrder = prev.map((row) => String(row.id));
        const next = prev.slice();
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return remapRowsByOrder(next, prevOrder, next.map((row) => String(row.id))) ?? next;
      });
      if (changed) requestFullFormulaRecalc();
    },
    [pushUndo, remapRowsByOrder, requestFullFormulaRecalc, setRows],
  );

  const reorderMultipleRows = useCallback(
    (
      ids: Array<string | number>,
      targetIndex: number,
      position: "before" | "after",
    ) => {
      let changed = false;
      setRows((prev) => {
        if (!ids.length || targetIndex < 0 || targetIndex >= prev.length) {
          return prev;
        }
        const prevOrder = prev.map((row) => String(row.id));
        const idToRow = new Map(prev.map((row) => [row.id, row]));
        const rowsToMove = ids
          .map((id) => idToRow.get(id))
          .filter(Boolean) as GridRow[];
        if (!rowsToMove.length) return prev;

        pushUndo(prev);
        changed = true;

        const victimSet = new Set(ids);
        const remaining = prev.filter((row) => !victimSet.has(row.id));
        const target = prev[targetIndex];
        let insertAt = remaining.findIndex((row) => row.id === target.id);
        if (insertAt === -1) insertAt = remaining.length;
        if (position === "after") insertAt += 1;

        const orderMap = toIndexMap(prev.map((row) => String(row.id)));
        rowsToMove.sort(
          (left, right) =>
            orderMap.get(String(left.id))! - orderMap.get(String(right.id))!,
        );

        const next = remaining.slice();
        next.splice(insertAt, 0, ...rowsToMove);
        return remapRowsByOrder(next, prevOrder, next.map((row) => String(row.id))) ?? next;
      });
      if (changed) requestFullFormulaRecalc();
    },
    [pushUndo, remapRowsByOrder, requestFullFormulaRecalc, setRows],
  );

  const moveRowsToGroup = useCallback(
    (event: GridRowGroupingRowMoveEvent) => {
      if (!event?.rowIds?.length) return;
      let changed = false;
      setRows((prev) => {
        const idSet = new Set(event.rowIds.map((id) => String(id)));
        if (!idSet.size) return prev;
        const moving: GridRow[] = [];
        const remaining: GridRow[] = [];
        prev.forEach((row) => {
          if (idSet.has(String(row.id))) moving.push(row);
          else remaining.push(row);
        });
        if (!moving.length) return prev;

        pushUndo(prev);
        changed = true;

        const shouldUpdateValues =
          !event.sourcePath ||
          (event.targetPath && event.sourcePath !== event.targetPath);
        const targetValuesByColumn = new Map<string, GridRowGroupingValueMeta[]>();
        event.targetValues?.forEach((entry) => {
          if (!entry?.columnKey) return;
          const existing = targetValuesByColumn.get(entry.columnKey);
          if (existing) existing.push(entry);
          else targetValuesByColumn.set(entry.columnKey, [entry]);
        });

        const updatedMoving = shouldUpdateValues
          ? moving.map((row) => {
              let rowChanged = false;
              const nextData = { ...row.data };
              targetValuesByColumn.forEach((entries, columnKey) => {
                if (!entries.length) return;
                const current = nextData[columnKey];
                const currentValue = current?.value;
                const nextValue =
                  entries.length === 1
                    ? entries[0].value
                    : (() => {
                        const pathValues = entries.map((entry) => entry.value);
                        if (Array.isArray(currentValue)) return pathValues;
                        if (typeof currentValue === "string") {
                          return pathValues
                            .map((value) => (value == null ? "" : String(value)))
                            .join("/");
                        }
                        return pathValues;
                      })();
                const valueChanged =
                  Array.isArray(currentValue) && Array.isArray(nextValue)
                    ? currentValue.length !== nextValue.length ||
                      currentValue.some((value, index) => value !== nextValue[index])
                    : currentValue !== nextValue;
                if (!valueChanged) return;
                rowChanged = true;
                nextData[columnKey] = current
                  ? { ...current, value: nextValue }
                  : { value: nextValue };
              });
              return rowChanged ? { ...row, data: nextData } : row;
            })
          : moving.slice();

        const computeInsertIndex = () => {
          if (event.dropOverRowId != null) {
            const dropOverId = String(event.dropOverRowId);
            const index = remaining.findIndex(
              (row) => String(row.id) === dropOverId,
            );
            if (index === -1) {
              return event.dropPosition === "after" ? remaining.length : 0;
            }
            return event.dropPosition === "after" ? index + 1 : index;
          }

          if (event.targetGroupRowIds?.length) {
            const targetGroupIdSet = new Set(
              event.targetGroupRowIds.map((id) => String(id)),
            );
            if (event.dropPosition === "before") {
              const firstIndex = remaining.findIndex((row) =>
                targetGroupIdSet.has(String(row.id)),
              );
              return firstIndex === -1 ? 0 : firstIndex;
            }
            for (let index = remaining.length - 1; index >= 0; index -= 1) {
              if (targetGroupIdSet.has(String(remaining[index].id))) {
                return index + 1;
              }
            }
            return remaining.length;
          }

          return event.dropPosition === "after" ? remaining.length : 0;
        };

        const next = remaining.slice();
        next.splice(computeInsertIndex(), 0, ...updatedMoving);
        return next;
      });
      if (changed) requestFullFormulaRecalc();
    },
    [pushUndo, requestFullFormulaRecalc, setRows],
  );

  const reorderRowGroups = useCallback(
    (event: GridRowGroupingGroupReorderEvent) => {
      if (!event) return;

      if (groupingModel) {
        const sourceNode = groupingModel.nodes.get(event.sourcePath) as
          | GroupingNodeLike
          | undefined;
        const targetNode = groupingModel.nodes.get(event.targetPath) as
          | GroupingNodeLike
          | undefined;
        if (!sourceNode || !targetNode) return;

        const movingIds = collectLeafRowIds(sourceNode);
        if (!movingIds.length) return;

        const movingSet = new Set(movingIds.map((id) => String(id)));
        let changed = false;
        setRows((prev) => {
          const movingRows = prev.filter((row) => movingSet.has(String(row.id)));
          if (!movingRows.length) return prev;
          const remaining = prev.filter((row) => !movingSet.has(String(row.id)));

          pushUndo(prev);
          changed = true;

          const targetLeafIds = collectLeafRowIds(targetNode);
          const anchorId =
            event.position === "before"
              ? targetLeafIds[0]
              : targetLeafIds[targetLeafIds.length - 1];

          let insertAt = remaining.length;
          if (anchorId != null) {
            const anchorKey = String(anchorId);
            let index = remaining.findIndex((row) => String(row.id) === anchorKey);
            if (index === -1) index = remaining.length;
            insertAt = event.position === "before" ? index : index + 1;
          }

          const next = remaining.slice();
          next.splice(insertAt, 0, ...movingRows);
          return next;
        });
        if (changed) requestFullFormulaRecalc();
        return;
      }

      const sourceGroupRowIds = event.sourceGroupRowIds ?? [];
      const targetGroupRowIds = event.targetGroupRowIds ?? [];
      if (sourceGroupRowIds.length > 0 && targetGroupRowIds.length > 0) {
        const sourceSet = new Set(sourceGroupRowIds.map((id) => String(id)));
        const targetSet = new Set(targetGroupRowIds.map((id) => String(id)));
        let changed = false;
        setRows((prev) => {
          const movingRows = prev.filter((row) => sourceSet.has(String(row.id)));
          if (!movingRows.length) return prev;
          const remaining = prev.filter((row) => !sourceSet.has(String(row.id)));
          let anchorIndex = -1;
          if (event.position === "before") {
            anchorIndex = remaining.findIndex((row) =>
              targetSet.has(String(row.id)),
            );
          } else {
            for (let index = remaining.length - 1; index >= 0; index -= 1) {
              if (targetSet.has(String(remaining[index].id))) {
                anchorIndex = index;
                break;
              }
            }
          }
          if (anchorIndex === -1) return prev;

          pushUndo(prev);
          changed = true;

          const insertAt =
            event.position === "before" ? anchorIndex : anchorIndex + 1;
          const next = remaining.slice();
          next.splice(insertAt, 0, ...movingRows);
          return next;
        });
        if (changed) {
          requestFullFormulaRecalc();
          return;
        }
      }

      const sourceValues =
        event.sourceValues?.filter((value) => value.level <= event.level) ?? [];
      const targetValues =
        event.targetValues?.filter((value) => value.level <= event.level) ?? [];
      if (!sourceValues.length || !targetValues.length) return;

      const rowMatchesValues = (
        row: GridRow,
        values: GridRowGroupingValueMeta[],
      ) =>
        values.every((value) =>
          matchesGroupLevel(row.data[value.columnKey]?.value, value),
        );

      let changed = false;
      setRows((prev) => {
        const movingRows = prev.filter((row) => rowMatchesValues(row, sourceValues));
        if (!movingRows.length) return prev;

        const movingSet = new Set(movingRows.map((row) => String(row.id)));
        const remaining = prev.filter((row) => !movingSet.has(String(row.id)));
        const targetRows = remaining.filter((row) =>
          rowMatchesValues(row, targetValues),
        );
        if (!targetRows.length) return prev;

        pushUndo(prev);
        changed = true;

        const anchorId =
          event.position === "before"
            ? targetRows[0].id
            : targetRows[targetRows.length - 1].id;
        const anchorIndex = remaining.findIndex((row) => row.id === anchorId);
        const insertAt =
          anchorIndex === -1
            ? remaining.length
            : event.position === "before"
              ? anchorIndex
              : anchorIndex + 1;

        const next = remaining.slice();
        next.splice(insertAt, 0, ...movingRows);
        return next;
      });
      if (changed) requestFullFormulaRecalc();
    },
    [groupingModel, pushUndo, requestFullFormulaRecalc, setRows],
  );

  return {
    reorderRows,
    reorderMultipleRows,
    moveRowsToGroup,
    reorderRowGroups,
  };
};
