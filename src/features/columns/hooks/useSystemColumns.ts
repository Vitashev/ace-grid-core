import { useMemo } from "react";
import { SPECIAL_COL_WIDTH } from "../../../components/gridUtils";
import {
  GRID_SYSTEM_COLUMN_KEYS,
  GridColumn,
  GridSystemColumnId,
  GridSystemColumnsConfig,
} from "../../../types";
import type { GridIconSet } from "../../../features/theming";

const resolveWidth = (candidate: unknown, fallback: number): number =>
  typeof candidate === "number" &&
  Number.isFinite(candidate) &&
  candidate > 0
    ? candidate
    : fallback;

const resolveSystemWidth = (
  explicitCandidate: unknown,
  configuredCandidate: unknown,
  classCandidate: unknown,
  fallback: number
) =>
  resolveWidth(
    explicitCandidate,
    resolveWidth(configuredCandidate, resolveWidth(classCandidate, fallback))
  );

export function useSystemColumns(
  isRowPinning: boolean,
  isRowReorder: boolean,
  isRowSelection: boolean,
  masterDetail?: { enabled?: boolean; title?: string; width?: number },
  rowKey?: { enabled?: boolean; title?: string; width?: number },
  systemColumns?: GridSystemColumnsConfig,
  classSystemWidths?: Partial<Record<GridSystemColumnId, number>>,
  icons?: Pick<GridIconSet, "rowPinningHeader" | "rowOrderingHeader">
) {
  const rowIndexCol: GridColumn | null = useMemo(
    () =>
      !rowKey?.enabled
        ? null
        : {
            key: GRID_SYSTEM_COLUMN_KEYS.rowIndex,
            title: rowKey.title ?? "",
            width: resolveSystemWidth(
              rowKey.width,
              systemColumns?.rowIndex?.width,
              classSystemWidths?.rowIndex,
              SPECIAL_COL_WIDTH[GRID_SYSTEM_COLUMN_KEYS.rowIndex]
            ),
            sortable: false,
            filterable: false,
            resizable: false,
          },
    [
      rowKey?.enabled,
      rowKey?.title,
      rowKey?.width,
      systemColumns?.rowIndex?.width,
      classSystemWidths?.rowIndex,
    ]
  );

  const rowDetailCol: GridColumn | null = useMemo(
    () =>
      !masterDetail?.enabled
        ? null
        : {
            key: GRID_SYSTEM_COLUMN_KEYS.rowDetail,
            title: masterDetail.title ?? "",
            width: resolveSystemWidth(
              masterDetail.width,
              systemColumns?.rowDetail?.width,
              classSystemWidths?.rowDetail,
              SPECIAL_COL_WIDTH[GRID_SYSTEM_COLUMN_KEYS.rowDetail]
            ),
            sortable: false,
            filterable: false,
            resizable: false,
          },
    [
      masterDetail?.enabled,
      masterDetail?.title,
      masterDetail?.width,
      systemColumns?.rowDetail?.width,
      classSystemWidths?.rowDetail,
    ]
  );

  const rowPinCol: GridColumn | null = useMemo(
    () =>
      !isRowPinning
        ? null
        : {
            key: GRID_SYSTEM_COLUMN_KEYS.rowPinning,
            title: "Pin",
            renderHeader: () =>
              icons?.rowPinningHeader?.({
                className: "ace-grid__pin-icon",
              }) ?? null,
            width: resolveSystemWidth(
              undefined,
              systemColumns?.rowPinning?.width,
              classSystemWidths?.rowPinning,
              SPECIAL_COL_WIDTH[GRID_SYSTEM_COLUMN_KEYS.rowPinning]
            ),
            sortable: false,
            filterable: false,
            resizable: false,
          },
    [
      isRowPinning,
      systemColumns?.rowPinning?.width,
      classSystemWidths?.rowPinning,
      icons,
    ]
  );

  const rowOrderCol: GridColumn | null = useMemo(
    () =>
      !isRowReorder
        ? null
        : {
            key: GRID_SYSTEM_COLUMN_KEYS.rowOrdering,
            title: "Reorder",
            renderHeader: () =>
              icons?.rowOrderingHeader?.({
                className: "ace-grid__drag-handle-icon",
                isPinned: false,
                isDragging: false,
                orientation: "column",
              }) ?? null,
            width: resolveSystemWidth(
              undefined,
              systemColumns?.rowOrdering?.width,
              classSystemWidths?.rowOrdering,
              SPECIAL_COL_WIDTH[GRID_SYSTEM_COLUMN_KEYS.rowOrdering]
            ),
            sortable: false,
            filterable: false,
            resizable: false,
          },
    [
      isRowReorder,
      systemColumns?.rowOrdering?.width,
      classSystemWidths?.rowOrdering,
      icons,
    ]
  );

  const rowSelectCol: GridColumn | null = useMemo(
    () =>
      !isRowSelection
        ? null
        : {
            key: GRID_SYSTEM_COLUMN_KEYS.rowSelection,
            title: "☐",
            width: resolveSystemWidth(
              undefined,
              systemColumns?.rowSelection?.width,
              classSystemWidths?.rowSelection,
              SPECIAL_COL_WIDTH[GRID_SYSTEM_COLUMN_KEYS.rowSelection]
            ),
            sortable: false,
            filterable: false,
            resizable: false,
          },
    [isRowSelection, systemColumns?.rowSelection?.width, classSystemWidths?.rowSelection]
  );

  return { rowIndexCol, rowDetailCol, rowPinCol, rowOrderCol, rowSelectCol };
}
