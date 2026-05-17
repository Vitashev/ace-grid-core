import { useMemo } from "react";
import {
  GRID_SYSTEM_COLUMN_DEFAULT_ORDER,
  type GridColumn,
  type GridSystemColumnId,
  type GridSystemColumnsConfig,
} from "../../../types";

export function useColumnPartitions(
  columns: GridColumn[],
  pinnedColumns: { left: string[]; right: string[] },
  pinnedSet: Set<string>,
  systemColumnsConfig: GridSystemColumnsConfig | undefined,
  rowIndexCol: GridColumn | null,
  rowDetailCol: GridColumn | null,
  rowOrderCol: GridColumn | null,
  rowSelectCol: GridColumn | null,
  rowPinCol: GridColumn | null,
  colByKey: Map<string, GridColumn>
) {
  const normalizedSystemColumnsConfig = useMemo(
    () => ({
      rowIndex: {
        order: systemColumnsConfig?.rowIndex?.order,
        pinned: systemColumnsConfig?.rowIndex?.pinned,
      },
      rowDetail: {
        order: systemColumnsConfig?.rowDetail?.order,
        pinned: systemColumnsConfig?.rowDetail?.pinned,
      },
      rowOrdering: {
        order: systemColumnsConfig?.rowOrdering?.order,
        pinned: systemColumnsConfig?.rowOrdering?.pinned,
      },
      rowSelection: {
        order: systemColumnsConfig?.rowSelection?.order,
        pinned: systemColumnsConfig?.rowSelection?.pinned,
      },
      rowPinning: {
        order: systemColumnsConfig?.rowPinning?.order,
        pinned: systemColumnsConfig?.rowPinning?.pinned,
      },
    }),
    [
      systemColumnsConfig?.rowIndex?.order,
      systemColumnsConfig?.rowIndex?.pinned,
      systemColumnsConfig?.rowDetail?.order,
      systemColumnsConfig?.rowDetail?.pinned,
      systemColumnsConfig?.rowOrdering?.order,
      systemColumnsConfig?.rowOrdering?.pinned,
      systemColumnsConfig?.rowSelection?.order,
      systemColumnsConfig?.rowSelection?.pinned,
      systemColumnsConfig?.rowPinning?.order,
      systemColumnsConfig?.rowPinning?.pinned,
    ]
  );

  return useMemo(() => {
    const left: GridColumn[] = [];
    const right: GridColumn[] = [];
    const mid: GridColumn[] = [];
    const defaultOrderRank = new Map<GridSystemColumnId, number>(
      GRID_SYSTEM_COLUMN_DEFAULT_ORDER.map((id, index) => [id, index])
    );
    const systemEntries = [
      rowIndexCol ? { id: "rowIndex", column: rowIndexCol } : null,
      rowDetailCol ? { id: "rowDetail", column: rowDetailCol } : null,
      rowOrderCol ? { id: "rowOrdering", column: rowOrderCol } : null,
      rowSelectCol ? { id: "rowSelection", column: rowSelectCol } : null,
      rowPinCol ? { id: "rowPinning", column: rowPinCol } : null,
    ].filter((entry): entry is { id: GridSystemColumnId; column: GridColumn } =>
      Boolean(entry)
    );

    systemEntries.sort((a, b) => {
      const aOrder = normalizedSystemColumnsConfig[a.id]?.order;
      const bOrder = normalizedSystemColumnsConfig[b.id]?.order;
      const aDefaultRank = defaultOrderRank.get(a.id) ?? 0;
      const bDefaultRank = defaultOrderRank.get(b.id) ?? 0;
      const aEffectiveOrder = aOrder ?? aDefaultRank;
      const bEffectiveOrder = bOrder ?? bDefaultRank;
      if (aEffectiveOrder !== bEffectiveOrder) {
        return aEffectiveOrder - bEffectiveOrder;
      }
      return aDefaultRank - bDefaultRank;
    });

    for (const entry of systemEntries) {
      const pinned = normalizedSystemColumnsConfig[entry.id]?.pinned ?? true;
      if (pinned) left.push(entry.column);
      else mid.push(entry.column);
    }

    for (const k of pinnedColumns.left) {
      const c = colByKey.get(k);
      if (c) left.push(c);
    }
    for (const k of pinnedColumns.right) {
      const c = colByKey.get(k);
      if (c) right.push(c);
    }
    for (const c of columns) if (!pinnedSet.has(c.key)) mid.push(c);

    return {
      pinnedLeftColumns: left,
      pinnedRightColumns: right,
      centerColumns: mid,
    };
  }, [
    columns,
    pinnedColumns,
    pinnedSet,
    normalizedSystemColumnsConfig,
    rowDetailCol,
    rowOrderCol,
    rowSelectCol,
    rowPinCol,
    rowIndexCol,
    colByKey,
  ]);
}
