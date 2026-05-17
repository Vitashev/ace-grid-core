// components/RowSelectCell.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  GridRowSelectionChangeMeta,
  GridRow,
  GridServerRowModelGroupSelects,
  GridServerRowModelSelectionState,
} from "../../../types";
import {
  getSsrmGroupRoute,
  getSsrmLeafRoute,
  getSsrmTreeNodeAtRouteNormalized,
  getSsrmTreeSelectionForRouteNormalized,
  hasSsrmSelectionChangesNormalized,
  isSsrmRowSelectedFlatNormalized,
  isSsrmSelectionAllSelectedNormalized,
  setSsrmFlatSelectionForRowIdsNormalized,
  setSsrmSelectionRootNormalized,
  setSsrmTreeRouteSelectionNormalized,
  type SsrmSelectionLookupCache,
} from "../ssrmSelectionState";
import { useGridTheme } from "../../theming";
import type { RowSelectCellState } from "../../theming/types";
import { cx } from "../../../utils/cx";

export interface RowSelectCellProps {
  /** Pass true to render the header "select all" checkbox */
  isHeader?: boolean;
  id?: string;
  className?: string;
  /** Full row object, used for group metadata */
  row?: GridRow;
  /** Row id for normal cells (omit for header) */
  rowId?: string | number;
  /** Inline style forwarded from the grid cell wrapper */
  style?: React.CSSProperties;
  role?: React.AriaRole;
  ariaColIndex?: number;
  ariaRowIndex?: number;
  /** Full row list (used to compute "select all" & to build the id list) */
  rows: GridRow[];
  /** Currently selected row ids */
  selectedRowIds: (string | number)[];
  /** Optional precomputed lookup for selected ids */
  selectedRowIdSet?: Set<string | number>;
  /** Optional precomputed selection metrics shared across row select cells. */
  selectionMetrics?: RowSelectSelectionMetrics;
  /** Selection change callback */
  onRowSelectionChange?: (
    selectedRowIds: (string | number)[],
    meta?: GridRowSelectionChangeMeta
  ) => void;
  /** Optional SSRM selection model (selectAll + toggled ids). */
  ssrmSelectionState?: GridServerRowModelSelectionState;
  /** Client-side group selection semantics for grouped rows. */
  clientGroupSelects?: GridServerRowModelGroupSelects;
  /** Total selectable row count for SSRM header checkbox state. */
  ssrmSelectableRowCount?: number;
  /** SSRM group selection semantics. */
  ssrmGroupSelects?: GridServerRowModelGroupSelects;
  /** Precomputed SSRM selection lookup cache for loaded rows. */
  ssrmSelectionCache?: SsrmSelectionLookupCache;
  /** SSRM selection model change callback. */
  onSsrmSelectionStateChange?: (
    state: GridServerRowModelSelectionState
  ) => void;
}

export interface RowSelectSelectionMetrics {
  selectableRows: GridRow[];
  selectableRowIds: (string | number)[];
  selectableRowIdSet: Set<string | number>;
  selectedSelectableCount: number;
  descendantLeafRowsByGroupPath?: Map<string, GridRow[]>;
}

export type RowSelectionChangeMeta = GridRowSelectionChangeMeta;
const EMPTY_GROUP_MEMBER_IDS: Array<string | number> = [];

export const RowSelectCell: React.FC<RowSelectCellProps> = memo(
  ({
    isHeader = false,
    id,
    className,
    row,
    rowId,
    style,
    role,
    ariaColIndex,
    ariaRowIndex,
    rows,
    selectedRowIds,
    selectedRowIdSet,
    selectionMetrics,
    onRowSelectionChange,
    ssrmSelectionState,
    clientGroupSelects,
    ssrmSelectableRowCount,
    ssrmGroupSelects,
    ssrmSelectionCache,
    onSsrmSelectionStateChange,
  }) => {
    const { components, tokens } = useGridTheme();
    const checkboxRef = useRef<HTMLInputElement>(null);
    const ssrmSelectionEnabled = Boolean(ssrmSelectionState);
    const resolvedSsrmGroupSelects: GridServerRowModelGroupSelects =
      ssrmGroupSelects ?? "self";
    const resolvedClientGroupSelects: GridServerRowModelGroupSelects =
      clientGroupSelects ?? "descendants";
    const ssrmDescendantSelectionMode =
      resolvedSsrmGroupSelects === "descendants" ||
      resolvedSsrmGroupSelects === "filteredDescendants";
    const clientDescendantSelectionMode =
      resolvedClientGroupSelects === "descendants" ||
      resolvedClientGroupSelects === "filteredDescendants";

    const normalizedSsrmState = ssrmSelectionState ?? null;
    const ssrmToggledSet = useMemo(
      () =>
        normalizedSsrmState
          ? new Set(normalizedSsrmState.toggledRowIds)
          : new Set<string | number>(),
      [normalizedSsrmState]
    );
    const rowKey = rowId ?? row?.id;
    const isGroupRow = Boolean(row?.meta?.group);

    const isSelectedInSsrmFlat = useCallback(
      (id: string | number) => {
        if (!normalizedSsrmState) return false;
        return isSsrmRowSelectedFlatNormalized(
          normalizedSsrmState,
          id,
          ssrmToggledSet
        );
      },
      [normalizedSsrmState, ssrmToggledSet]
    );

    const isSelectedInSsrmLeaf = useCallback(
      (target: GridRow) => {
        if (!normalizedSsrmState) return false;
        if (!ssrmDescendantSelectionMode) {
          return isSelectedInSsrmFlat(target.id);
        }
        const route =
          ssrmSelectionCache?.leafRouteByRowId.get(target.id) ?? getSsrmLeafRoute(target);
        return getSsrmTreeSelectionForRouteNormalized(
          normalizedSsrmState,
          route
        );
      },
      [
        isSelectedInSsrmFlat,
        normalizedSsrmState,
        ssrmSelectionCache,
        ssrmDescendantSelectionMode,
      ]
    );

    const updateSsrmSelectionFlat = useCallback(
      (rowIds: (string | number)[], shouldSelect: boolean) => {
        if (!normalizedSsrmState || !onSsrmSelectionStateChange) return;
        onSsrmSelectionStateChange(
          setSsrmFlatSelectionForRowIdsNormalized(
            normalizedSsrmState,
            rowIds,
            shouldSelect
          )
        );
      },
      [normalizedSsrmState, onSsrmSelectionStateChange]
    );

    const effectiveSelectedSet = useMemo(() => {
      if (selectedRowIdSet) return selectedRowIdSet;
      return new Set(selectedRowIds);
    }, [selectedRowIdSet, selectedRowIds]);

    const fallbackSelectableRows = useMemo(() => {
      if (selectionMetrics) return rows;
      if (ssrmSelectionEnabled && ssrmSelectionCache) {
        return ssrmSelectionCache.selectableRows;
      }
      return rows.filter((r) => !r.meta?.group && !r.meta?.loading);
    }, [rows, selectionMetrics, ssrmSelectionCache, ssrmSelectionEnabled]);

    const selectableRows =
      selectionMetrics?.selectableRows ?? fallbackSelectableRows;

    const fallbackSelectableRowIds = useMemo(() => {
      if (selectionMetrics) return selectedRowIds;
      if (ssrmSelectionEnabled && ssrmSelectionCache) {
        return ssrmSelectionCache.selectableRowIds;
      }
      return selectableRows.map((r) => r.id);
    }, [
      selectableRows,
      selectionMetrics,
      selectedRowIds,
      ssrmSelectionCache,
      ssrmSelectionEnabled,
    ]);

    const selectableRowIds =
      selectionMetrics?.selectableRowIds ?? fallbackSelectableRowIds;

    const fallbackSelectableRowIdSet = useMemo(() => {
      if (selectionMetrics) return effectiveSelectedSet;
      if (ssrmSelectionEnabled && ssrmSelectionCache) {
        return ssrmSelectionCache.selectableRowIdSet;
      }
      return new Set(selectableRowIds);
    }, [
      effectiveSelectedSet,
      selectableRowIds,
      selectionMetrics,
      ssrmSelectionCache,
      ssrmSelectionEnabled,
    ]);

    const selectableRowIdSet =
      selectionMetrics?.selectableRowIdSet ?? fallbackSelectableRowIdSet;

    const fallbackSelectedSelectableCount = useMemo(() => {
      if (selectionMetrics) return 0;
      let count = 0;
      selectableRowIds.forEach((id) => {
        if (effectiveSelectedSet.has(id)) count += 1;
      });
      return count;
    }, [effectiveSelectedSet, selectableRowIds, selectionMetrics]);

    const selectedSelectableCount =
      selectionMetrics?.selectedSelectableCount ??
      fallbackSelectedSelectableCount;

    const ssrmRowCount =
      ssrmSelectionEnabled && normalizedSsrmState
        ? Math.max(0, Math.trunc(ssrmSelectableRowCount ?? 0))
        : 0;
    const ssrmHasChanges = normalizedSsrmState
      ? hasSsrmSelectionChangesNormalized(normalizedSsrmState)
      : false;
    const headerAll = ssrmSelectionEnabled
      ? ssrmRowCount > 0 &&
        (normalizedSsrmState
          ? isSsrmSelectionAllSelectedNormalized(normalizedSsrmState)
          : false)
      : selectableRowIds.length > 0 &&
        selectedSelectableCount === selectableRowIds.length;
    const headerSome = ssrmSelectionEnabled
      ? ssrmRowCount > 0 && !headerAll && (
        Boolean(normalizedSsrmState?.selectAllChildren) || ssrmHasChanges
      )
      : selectedSelectableCount > 0 &&
        selectedSelectableCount < selectableRowIds.length;

    const groupMeta = row?.meta?.group;
    const groupMemberIds = groupMeta?.rowIds ?? EMPTY_GROUP_MEMBER_IDS;
    const groupRoute = useMemo(
      () =>
        row && rowKey != null
          ? (ssrmSelectionCache?.groupRouteByRowId.get(rowKey) ?? getSsrmGroupRoute(row))
          : [],
      [row, rowKey, ssrmSelectionCache]
    );
    const groupPath = groupMeta?.path;
    const groupDescendantLeaves = useMemo(() => {
      if (!ssrmSelectionEnabled) return [];
      if (!groupPath) return [];
      if (selectionMetrics?.descendantLeafRowsByGroupPath) {
        const sharedLeaves =
          selectionMetrics.descendantLeafRowsByGroupPath.get(groupPath);
        if (sharedLeaves) return sharedLeaves;
      }
      if (ssrmSelectionCache) {
        const cached =
          ssrmSelectionCache.descendantLeafRowsByGroupPath.get(groupPath);
        if (cached) return cached;
      }
      return selectableRows.filter((target) =>
        getSsrmLeafRoute(target).includes(groupPath)
      );
    }, [
      groupPath,
      selectableRows,
      selectionMetrics,
      ssrmSelectionCache,
      ssrmSelectionEnabled,
    ]);

    const { groupAll, groupSome } = useMemo(() => {
      if (!groupMeta) return { groupAll: false, groupSome: false };

      if (ssrmSelectionEnabled && normalizedSsrmState) {
        if (!ssrmDescendantSelectionMode) {
          if (rowKey == null) return { groupAll: false, groupSome: false };
          const active = isSelectedInSsrmFlat(rowKey);
          return { groupAll: active, groupSome: false };
        }

        const routeSelected = groupRoute.length
          ? getSsrmTreeSelectionForRouteNormalized(normalizedSsrmState, groupRoute)
          : normalizedSsrmState.selectAllChildren;

        if (!groupDescendantLeaves.length) {
          const node = groupRoute.length
            ? getSsrmTreeNodeAtRouteNormalized(normalizedSsrmState, groupRoute)
            : null;
          return {
            groupAll: routeSelected,
            groupSome: Boolean(node && (node.toggledNodes?.length ?? 0) > 0),
          };
        }

        const selectedCount = groupDescendantLeaves.reduce<number>(
          (sum, target) => (isSelectedInSsrmLeaf(target) ? sum + 1 : sum),
          0
        );
        const node = groupRoute.length
          ? getSsrmTreeNodeAtRouteNormalized(normalizedSsrmState, groupRoute)
          : null;
        const hasRouteOverrides = Boolean(node && (node.toggledNodes?.length ?? 0) > 0);
        return {
          groupAll:
            !hasRouteOverrides &&
            groupDescendantLeaves.length > 0 &&
            selectedCount === groupDescendantLeaves.length,
          groupSome:
            hasRouteOverrides ||
            (selectedCount > 0 && selectedCount < groupDescendantLeaves.length),
        };
      }

      const selectedCount = groupMemberIds.reduce<number>(
        (sum, id) => (effectiveSelectedSet.has(id) ? sum + 1 : sum),
        0
      );
      if (!clientDescendantSelectionMode) {
        if (rowKey == null) return { groupAll: false, groupSome: false };
        const active = effectiveSelectedSet.has(rowKey);
        return { groupAll: active, groupSome: false };
      }
      return {
        groupAll:
          groupMemberIds.length > 0 && selectedCount === groupMemberIds.length,
        groupSome:
          groupMemberIds.length > 0 &&
          selectedCount > 0 &&
          selectedCount < groupMemberIds.length,
      };
    }, [
      effectiveSelectedSet,
      groupDescendantLeaves,
      groupMemberIds,
      groupMeta,
      groupRoute,
      isSelectedInSsrmFlat,
      isSelectedInSsrmLeaf,
      normalizedSsrmState,
      clientDescendantSelectionMode,
      rowKey,
      ssrmDescendantSelectionMode,
      ssrmSelectionEnabled,
    ]);

    useEffect(() => {
      if (!checkboxRef.current) return;
      if (isHeader) {
        checkboxRef.current.indeterminate = headerSome;
      } else if (isGroupRow) {
        checkboxRef.current.indeterminate = groupSome;
      } else {
        checkboxRef.current.indeterminate = false;
      }
    }, [isGroupRow, isHeader, headerSome, groupSome]);

    if (isHeader) {
      const headerState: RowSelectCellState = {
        isSelected: headerAll || headerSome,
      };
      const headerBaseStyle: React.CSSProperties = {
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
        boxShadow: "var(--ace-grid-cell-shadow, none)",
        borderRightWidth: 1,
        borderRightStyle: "solid",
        borderRightColor: "var(--ace-grid-cell-border-color-alt)",
      };
      const headerStyle = components.rowSelectCell
        ? components.rowSelectCell({
            base: headerBaseStyle,
            state: headerState,
            tokens,
          })
        : headerBaseStyle;
      return (
        <div
          id={id}
          className="ace-grid__row-select ace-grid__row-select--header"
          role={role}
          aria-colindex={ariaColIndex}
          aria-rowindex={ariaRowIndex}
          style={headerStyle}
        >
          <input
            type="checkbox"
            ref={checkboxRef}
            className="ace-grid__row-select-checkbox ace-grid__row-select-checkbox--header"
            checked={headerAll}
            onChange={(e) => {
              e.stopPropagation();
              if (ssrmSelectionEnabled) {
                if (!onSsrmSelectionStateChange || !normalizedSsrmState) return;
                const nextSelectAll = !(headerAll || headerSome);
                onSsrmSelectionStateChange(
                  setSsrmSelectionRootNormalized(normalizedSsrmState, nextSelectAll)
                );
                return;
              }
              if (!onRowSelectionChange) return;
              if (headerAll || headerSome) {
                onRowSelectionChange(
                  selectedRowIds.filter((id) => !selectableRowIdSet.has(id)),
                  {
                    source: "header",
                    anchorRowId: rowKey,
                  }
                );
              } else {
                const next = new Set(selectedRowIds);
                selectableRowIds.forEach((id) => next.add(id));
                onRowSelectionChange(Array.from(next), {
                  source: "header",
                  anchorRowId: rowKey,
                });
              }
            }}
            style={{
              cursor: "pointer",
              transform: "scale(1.1)",
              accentColor: "var(--ace-grid-checkbox-accent)",
            }}
            aria-label={headerAll ? "Deselect all rows" : "Select all rows"}
            title={headerAll ? "Deselect all rows" : "Select all rows"}
          />
        </div>
      );
    }

    const isSel =
      rowKey != null
        ? ssrmSelectionEnabled && normalizedSsrmState
          ? !isGroupRow && row
            ? isSelectedInSsrmLeaf(row)
            : isSelectedInSsrmFlat(rowKey)
          : effectiveSelectedSet.has(rowKey)
        : false;
    const isActive = isGroupRow ? groupAll || groupSome : isSel;
    const groupDescendantSelectionMode = ssrmSelectionEnabled
      ? ssrmDescendantSelectionMode
      : clientDescendantSelectionMode;
    const rowState: RowSelectCellState = {
      isSelected: isActive,
    };
    const rowBaseStyle: React.CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isActive
        ? "var(--ace-grid-cell-bg-selected)"
        : "var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle))",
      boxShadow: "var(--ace-grid-cell-shadow, none)",
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: "var(--ace-grid-cell-border-color-alt)",
    };
    const rowStyle = components.rowSelectCell
      ? components.rowSelectCell({
          base: rowBaseStyle,
          state: rowState,
          tokens,
        })
      : rowBaseStyle;

    return (
      <div
        id={id}
        className={cx(
          "ace-grid__row-select",
          isGroupRow && "ace-grid__row-select--group",
          isActive && "ace-grid__row-select--active",
          className
        )}
        role={role}
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        style={rowStyle}
      >
        <input
          type="checkbox"
          ref={checkboxRef}
          className="ace-grid__row-select-checkbox"
          checked={isGroupRow ? groupAll : isSel}
          onChange={(e) => {
            e.stopPropagation();
            if (ssrmSelectionEnabled && normalizedSsrmState) {
              if (!onSsrmSelectionStateChange) return;
              if (isGroupRow) {
                const shouldSelect = !(groupAll || groupSome);
                if (!ssrmDescendantSelectionMode) {
                  if (rowKey == null) return;
                  updateSsrmSelectionFlat([rowKey], shouldSelect);
                  return;
                }
                if (!groupRoute.length) return;
                onSsrmSelectionStateChange(
                  setSsrmTreeRouteSelectionNormalized(
                    normalizedSsrmState,
                    groupRoute,
                    shouldSelect,
                    {
                      clearDescendants: true,
                      clearFlatRowToggles: true,
                    }
                  )
                );
                return;
              }

              if (rowKey == null) return;
              if (!ssrmDescendantSelectionMode || !row) {
                updateSsrmSelectionFlat([rowKey], !isSel);
                return;
              }
              onSsrmSelectionStateChange(
                setSsrmTreeRouteSelectionNormalized(
                  normalizedSsrmState,
                  ssrmSelectionCache?.leafRouteByRowId.get(row.id) ??
                    getSsrmLeafRoute(row),
                  !isSel,
                  {
                    clearDescendants: true,
                    clearFlatRowToggles: true,
                  }
                )
              );
              return;
            }
            if (!onRowSelectionChange) return;
            if (isGroupRow) {
              if (!clientDescendantSelectionMode) {
                if (rowKey == null) return;
                if (groupAll || groupSome) {
                  onRowSelectionChange(
                    selectedRowIds.filter((id) => id !== rowKey),
                    {
                      source: "group",
                      descendants: false,
                      anchorRowId: rowKey,
                    }
                  );
                } else {
                  onRowSelectionChange([...selectedRowIds, rowKey], {
                    source: "group",
                    descendants: false,
                    anchorRowId: rowKey,
                  });
                }
                return;
              }
              if (groupMemberIds.length) {
                const next = new Set(selectedRowIds);
                if (groupAll || groupSome) {
                  groupMemberIds.forEach((id) => next.delete(id));
                } else {
                  groupMemberIds.forEach((id) => next.add(id));
                }
                onRowSelectionChange(Array.from(next), {
                  source: "group",
                  descendants: true,
                  anchorRowId: rowKey,
                });
                return;
              }
            }
            if (rowKey == null) return;
            if (isSel)
              onRowSelectionChange(
                selectedRowIds.filter((id) => id !== rowKey),
                {
                  source: "row",
                  anchorRowId: rowKey,
                }
              );
            else
              onRowSelectionChange([...selectedRowIds, rowKey], {
                source: "row",
                anchorRowId: rowKey,
              });
          }}
          style={{
            cursor: "pointer",
            transform: "scale(1.1)",
            accentColor: "var(--ace-grid-checkbox-accent)",
          }}
          aria-label={
            isGroupRow
              ? groupAll || groupSome
                ? groupDescendantSelectionMode
                  ? "Deselect descendants"
                  : "Deselect group"
                : groupDescendantSelectionMode
                  ? "Select descendants"
                  : "Select group"
              : isSel
                ? "Deselect row"
                : "Select row"
          }
          title={
            isGroupRow
              ? groupAll || groupSome
                ? groupDescendantSelectionMode
                  ? "Deselect descendants"
                  : "Deselect group"
                : groupDescendantSelectionMode
                  ? "Select descendants"
                  : "Select group"
              : isSel
              ? "Deselect row"
              : "Select row"
          }
        />
      </div>
    );
  }
);
