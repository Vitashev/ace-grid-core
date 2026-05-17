import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { CELL_BORDER, SELECTION_COLOR, SELECTION_STYLE, SELECTION_WIDTH } from "../consts";
import { isSystemCol } from "../utils";
import type {
  ColumnSelectionOverlayOptions,
  RowSelectionOverlayOptions,
  SelectionOverlayMode,
  SelectionOptions,
  SelectionSource,
  UseCellSelectionParams,
  UseCellSelectionResult,
} from "../types";
import type { GridRow } from "../../../types";

type Selection = UseCellSelectionParams["selection"];
type NonNullSelection = Exclude<Selection, null>;
type RowSelectionBand = { start: number; end: number };
type ColumnSelectionBand = { start: number; end: number };

export const useCellSelection = ({
  selection,
  enableCellSelection,
  selectEntireRowOnSelection,
  selectEntireColumnOnSelection,
  rowCellSelectionMode,
  columnCellSelectionMode,
  rowCellSelectionIncludeSpans,
  columnCellSelectionIncludeSpans,
  rows,
  rowCount: rowCountOverride,
  rowIndexLookup,
  rowGroups,
  visualColumns,
  visualColumnIndex,
  rowIndexToVisual,
  onSelectionRangeChange,
  containerRef,
  edgeSize = 36,
  maxEdgeSpeed = 40,
  centerColumnRange = null,
  centerRowRange = null,
}: UseCellSelectionParams): UseCellSelectionResult => {
  const rowCount = Math.max(
    0,
    Math.trunc(
      Number.isFinite(rowCountOverride ?? rows.length)
        ? (rowCountOverride ?? rows.length)
        : rows.length
    )
  );

  // --- Basic bounds
  const vColsLen = visualColumns.length;
  const lastDenseRowIdx = rowCount ? rowCount - 1 : 0;
  const lastColIdx = vColsLen ? vColsLen - 1 : 0;

  // --- Fast id->dense map (rowId -> visual index)
  const rowIdToDense = useMemo(() => {
    const m = new Map<string | number, number>();
    for (const r of rows) {
      const abs = rowIndexLookup.get(r.id);
      if (abs == null) continue;
      const dense = rowIndexToVisual.get(abs);
      if (dense == null) continue;
      m.set(r.id, dense);
    }
    return m;
  }, [rows, rowIndexLookup, rowIndexToVisual]);

  // --- Utilities to resolve dense row robustly
  const denseFromAbs = useCallback(
    (abs: number) => {
      if (!Number.isFinite(abs)) return 0;
      const mapped = rowIndexToVisual.get(abs);
      if (mapped != null) return mapped;
      // Fallback (should be rare): clamp
      return Math.max(0, Math.min(Math.round(abs), lastDenseRowIdx));
    },
    [rowIndexToVisual, lastDenseRowIdx]
  );

  const denseFromId = useCallback(
    (id: string | number | null | undefined) => {
      if (id == null) return 0;
      const d = rowIdToDense.get(id);
      if (d != null) return d;
      // Fallback using rowIndexLookup if a row was missing in the map
      const abs = rowIndexLookup.get(id);
      if (abs != null) return denseFromAbs(abs);
      return 0;
    },
    [rowIdToDense, rowIndexLookup, denseFromAbs]
  );

  // Best-effort resolver from the DOM event target (prefers data-row-id)
  const resolveDenseRowFromEvent = useCallback(
    (event: ReactMouseEvent | MouseEvent, fallbackAbs?: number) => {
      const target = event.target as HTMLElement | null;
      let node = target;
      let id: string | number | null = null;
      let steps = 0;
      const MAX_STEPS = 10;

      while (node && steps < MAX_STEPS) {
        steps++;
        const rid = node.getAttribute?.("data-row-id");
        if (rid != null) {
          // numeric strings should become numbers if possible
          const parsed = Number.isNaN(Number(rid)) ? rid : Number(rid);
          id = parsed as any;
          break;
        }
        node = node.parentElement;
      }

      if (id != null) return denseFromId(id);
      if (fallbackAbs != null) return denseFromAbs(fallbackAbs);
      return 0;
    },
    [denseFromAbs, denseFromId]
  );

  // --- Refs and local state
  const selectionAnchorRef = useRef<{ row: number; col: number } | null>(null);
  const isSelectingRef = useRef(false);
  const latestSelectionRef = useRef<Selection>(selection);
  const lastSelectionSourceRef = useRef<SelectionSource | null>(null);
  const lastRowHeaderSelectionRef = useRef<Map<string | number, GridRow>>(
    new Map()
  );
  const lastColumnHeaderSelectionRef = useRef<Set<string>>(new Set());
  const rowSelectionBandsRef = useRef<RowSelectionBand[]>([]);
  const rowSelectionBandByRowRef = useRef<Map<number, RowSelectionBand>>(
    new Map()
  );
  const columnSelectionBandsRef = useRef<ColumnSelectionBand[]>([]);
  const columnSelectionBandByColRef = useRef<Map<number, ColumnSelectionBand>>(
    new Map()
  );
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [fillDragActive, setFillDragActive] = useState(false);
  const fillDragRef = useRef<{
    active: boolean;
    base: NonNullSelection | null;
  }>({ active: false, base: null });
  const rafIdRef = useRef<number | null>(null);
  const mouseXYRef = useRef<{ x: number; y: number } | null>(null);
  const lastHitRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    latestSelectionRef.current = selection;
    if (!selection) {
      lastSelectionSourceRef.current = null;
      rowSelectionBandsRef.current = [];
      rowSelectionBandByRowRef.current = new Map();
      columnSelectionBandsRef.current = [];
      columnSelectionBandByColRef.current = new Map();
      fillDragRef.current = { active: false, base: null };
      setFillDragActive(false);
    }
  }, [selection]);

  // --- Compute merged spans in *dense* coords using row ids
  const spanRanges = useMemo(() => {
    if (!enableCellSelection)
      return [] as Array<{
        startRow: number;
        endRow: number;
        startCol: number;
        endCol: number;
      }>;
    const ranges: Array<{
      startRow: number;
      endRow: number;
      startCol: number;
      endCol: number;
    }> = [];

    rowGroups.forEach((group) => {
      if (!group.rows.length || group.spans.size === 0) return;

      group.spans.forEach((bucket, colKey) => {
        const startColIdx = visualColumnIndex.get(colKey);
        if (startColIdx == null) return;

        bucket.forEach((span) => {
          const colSpan = Math.max(1, span.colSpan ?? 1);
          const rowSpan = Math.max(1, span.rowSpan ?? 1);

          const startOffset = Math.min(
            Math.max(0, span.startRowOffset),
            group.rows.length - 1
          );
          const endOffset = Math.min(
            group.rows.length - 1,
            startOffset + rowSpan - 1
          );

          const startRowId = group.rows[startOffset]?.id;
          const endRowId = group.rows[endOffset]?.id;
          if (startRowId == null || endRowId == null) return;

          const startDense =
            denseFromId(startRowId) ?? group.startRowIndex + startOffset;
          const endDense =
            denseFromId(endRowId) ?? group.startRowIndex + endOffset;

          ranges.push({
            startRow: Math.min(startDense, endDense),
            endRow: Math.max(startDense, endDense),
            startCol: startColIdx,
            endCol: startColIdx + colSpan - 1,
          });
        });
      });
    });

    return ranges;
  }, [enableCellSelection, rowGroups, visualColumnIndex, denseFromId]);

  // --- Helpers
  const selectionEquals = useCallback((a: Selection, b: Selection) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      a.startRow === b.startRow &&
      a.endRow === b.endRow &&
      a.startCol === b.startCol &&
      a.endCol === b.endCol
    );
  }, []);

  const setRowSelectionBands = useCallback((denseRows: number[]) => {
    if (!denseRows.length) {
      rowSelectionBandsRef.current = [];
      rowSelectionBandByRowRef.current = new Map();
      return;
    }

    const sortedDenseRows = Array.from(new Set(denseRows)).sort((a, b) => a - b);
    const bands: RowSelectionBand[] = [];
    let start = sortedDenseRows[0];
    let prev = sortedDenseRows[0];

    for (let i = 1; i < sortedDenseRows.length; i += 1) {
      const dense = sortedDenseRows[i];
      if (dense === prev + 1) {
        prev = dense;
        continue;
      }
      bands.push({ start, end: prev });
      start = dense;
      prev = dense;
    }
    bands.push({ start, end: prev });

    const byRow = new Map<number, RowSelectionBand>();
    bands.forEach((band) => {
      for (let row = band.start; row <= band.end; row += 1) {
        byRow.set(row, band);
      }
    });

    rowSelectionBandsRef.current = bands;
    rowSelectionBandByRowRef.current = byRow;
  }, []);

  const isRowBandSelectionActive = useCallback(
    () =>
      enableCellSelection &&
      selectEntireRowOnSelection &&
      lastSelectionSourceRef.current === "row" &&
      rowSelectionBandsRef.current.length > 0,
    [enableCellSelection, selectEntireRowOnSelection]
  );

  const setColumnSelectionBands = useCallback((columnIndices: number[]) => {
    if (!columnIndices.length) {
      columnSelectionBandsRef.current = [];
      columnSelectionBandByColRef.current = new Map();
      return;
    }

    const sortedColumnIndices = Array.from(new Set(columnIndices)).sort(
      (a, b) => a - b
    );
    const bands: ColumnSelectionBand[] = [];
    let start = sortedColumnIndices[0];
    let prev = sortedColumnIndices[0];

    for (let i = 1; i < sortedColumnIndices.length; i += 1) {
      const col = sortedColumnIndices[i];
      if (col === prev + 1) {
        prev = col;
        continue;
      }
      bands.push({ start, end: prev });
      start = col;
      prev = col;
    }
    bands.push({ start, end: prev });

    const byCol = new Map<number, ColumnSelectionBand>();
    bands.forEach((band) => {
      for (let col = band.start; col <= band.end; col += 1) {
        byCol.set(col, band);
      }
    });

    columnSelectionBandsRef.current = bands;
    columnSelectionBandByColRef.current = byCol;
  }, []);

  const isColumnBandSelectionActive = useCallback(
    () =>
      enableCellSelection &&
      selectEntireColumnOnSelection &&
      lastSelectionSourceRef.current === "column" &&
      columnSelectionBandsRef.current.length > 0,
    [enableCellSelection, selectEntireColumnOnSelection]
  );

  const expandRangeForSpans = useCallback(
    (range: NonNullSelection): NonNullSelection => {
      if (!enableCellSelection || spanRanges.length === 0) return range;
      let expanded = range;
      let changed = true;

      while (changed) {
        changed = false;
        for (const span of spanRanges) {
          const overlaps =
            span.endRow >= expanded.startRow &&
            span.startRow <= expanded.endRow &&
            span.endCol >= expanded.startCol &&
            span.startCol <= expanded.endCol;

          if (!overlaps) continue;

          const newStartRow = Math.min(expanded.startRow, span.startRow);
          const newEndRow = Math.max(expanded.endRow, span.endRow);
          const newStartCol = Math.min(expanded.startCol, span.startCol);
          const newEndCol = Math.max(expanded.endCol, span.endCol);

          if (
            newStartRow !== expanded.startRow ||
            newEndRow !== expanded.endRow ||
            newStartCol !== expanded.startCol ||
            newEndCol !== expanded.endCol
          ) {
            expanded = {
              startRow: newStartRow,
              endRow: newEndRow,
              startCol: newStartCol,
              endCol: newEndCol,
            };
            changed = true;
          }
        }
      }
      return expanded;
    },
    [enableCellSelection, spanRanges]
  );

  const expandDenseRowsForSpans = useCallback(
    (denseRows: number[], selectedStartCol: number, selectedEndCol: number) => {
      if (!denseRows.length || !enableCellSelection || spanRanges.length === 0) {
        return denseRows;
      }
      const selected = new Set<number>();
      denseRows.forEach((dense) => {
        const clamped = Math.max(0, Math.min(dense, lastDenseRowIdx));
        selected.add(clamped);
      });
      if (!selected.size) return [];

      let changed = true;
      while (changed) {
        changed = false;
        for (const span of spanRanges) {
          if (span.endCol < selectedStartCol || span.startCol > selectedEndCol) {
            continue;
          }
          let intersectsSelectedRows = false;
          for (let row = span.startRow; row <= span.endRow; row += 1) {
            if (selected.has(row)) {
              intersectsSelectedRows = true;
              break;
            }
          }
          if (!intersectsSelectedRows) continue;
          for (let row = span.startRow; row <= span.endRow; row += 1) {
            const clamped = Math.max(0, Math.min(row, lastDenseRowIdx));
            if (!selected.has(clamped)) {
              selected.add(clamped);
              changed = true;
            }
          }
        }
      }

      return Array.from(selected).sort((a, b) => a - b);
    },
    [enableCellSelection, spanRanges, lastDenseRowIdx]
  );

  const expandDenseColumnsForSpans = useCallback(
    (selectedColumns: number[], selectedStartRow: number, selectedEndRow: number) => {
      if (
        !selectedColumns.length ||
        !enableCellSelection ||
        spanRanges.length === 0
      ) {
        return selectedColumns;
      }
      const selected = new Set<number>();
      selectedColumns.forEach((column) => {
        const clamped = Math.max(0, Math.min(column, lastColIdx));
        selected.add(clamped);
      });
      if (!selected.size) return [];

      let changed = true;
      while (changed) {
        changed = false;
        for (const span of spanRanges) {
          if (span.endRow < selectedStartRow || span.startRow > selectedEndRow) {
            continue;
          }
          let intersectsSelectedCols = false;
          for (let col = span.startCol; col <= span.endCol; col += 1) {
            if (selected.has(col)) {
              intersectsSelectedCols = true;
              break;
            }
          }
          if (!intersectsSelectedCols) continue;
          for (let col = span.startCol; col <= span.endCol; col += 1) {
            const clamped = Math.max(0, Math.min(col, lastColIdx));
            if (!selected.has(clamped)) {
              selected.add(clamped);
              changed = true;
            }
          }
        }
      }

      return Array.from(selected).sort((a, b) => a - b);
    },
    [enableCellSelection, spanRanges, lastColIdx]
  );

  const buildSelectionRange = useCallback(
    (
      startRow: number,
      startCol: number,
      endRow: number,
      endCol: number,
      options?: SelectionOptions
    ) => {
      if (!enableCellSelection || !rowCount || !vColsLen) return null;

      const sr = Math.min(startRow, endRow);
      const er = Math.max(startRow, endRow);
      const sc = Math.min(startCol, endCol);
      const ec = Math.max(startCol, endCol);

      let clampedStartRow = Math.max(0, Math.min(sr, lastDenseRowIdx));
      let clampedEndRow = Math.max(0, Math.min(er, lastDenseRowIdx));
      let clampedStartCol = Math.max(0, Math.min(sc, lastColIdx));
      let clampedEndCol = Math.max(0, Math.min(ec, lastColIdx));

      const wantFullRow =
        selectEntireRowOnSelection && options?.forceFullRow === true;
      const wantFullColumn =
        selectEntireColumnOnSelection && options?.forceFullColumn === true;

      if (wantFullRow) {
        clampedStartCol = 0;
        clampedEndCol = lastColIdx;
      }
      if (wantFullColumn) {
        clampedStartRow = 0;
        clampedEndRow = lastDenseRowIdx;
      }

      if (centerRowRange) {
        clampedStartRow = Math.max(clampedStartRow, centerRowRange.start);
        clampedEndRow = Math.min(clampedEndRow, centerRowRange.end);
        if (clampedStartRow > clampedEndRow) return null;
      }

      if (centerColumnRange) {
        clampedStartCol = Math.max(clampedStartCol, centerColumnRange.start);
        clampedEndCol = Math.min(clampedEndCol, centerColumnRange.end);
        if (clampedStartCol > clampedEndCol) return null;
      }

      const rangeBase = {
        startRow: clampedStartRow,
        endRow: clampedEndRow,
        startCol: clampedStartCol,
        endCol: clampedEndCol,
      };
      const range =
        options?.expandToSpans === false
          ? rangeBase
          : expandRangeForSpans(rangeBase);

      if (centerRowRange) {
        range.startRow = Math.max(range.startRow, centerRowRange.start);
        range.endRow = Math.min(range.endRow, centerRowRange.end);
        if (range.startRow > range.endRow) return null;
      }

      if (centerColumnRange) {
        range.startCol = Math.max(range.startCol, centerColumnRange.start);
        range.endCol = Math.min(range.endCol, centerColumnRange.end);
        if (range.startCol > range.endCol) return null;
      }

      return range;
    },
    [
      enableCellSelection,
      rowCount,
      vColsLen,
      selectEntireRowOnSelection,
      selectEntireColumnOnSelection,
      expandRangeForSpans,
      lastDenseRowIdx,
      lastColIdx,
      centerRowRange,
      centerColumnRange,
    ]
  );

  const applySelectionRange = useCallback(
    (
      startRow: number,
      startCol: number,
      endRow: number,
      endCol: number,
      options?: SelectionOptions,
      source?: SelectionSource
    ) => {
      const next = buildSelectionRange(
        startRow,
        startCol,
        endRow,
        endCol,
        options
      );
      if (!next) return;
      if (selectionEquals(latestSelectionRef.current, next)) {
        if (source) lastSelectionSourceRef.current = source;
        return;
      }
      latestSelectionRef.current = next;
      if (source) lastSelectionSourceRef.current = source;
      onSelectionRangeChange?.(next);
    },
    [buildSelectionRange, selectionEquals, onSelectionRangeChange]
  );

  const applyFillDrag = useCallback(
    (denseRow: number, columnIndex: number) => {
      if (!fillDragRef.current.active || !fillDragRef.current.base) return;
      if (!enableCellSelection) return;

      const base = fillDragRef.current.base;
      const clampedRow = Math.max(0, Math.min(denseRow, lastDenseRowIdx));
      const clampedCol = Math.max(0, Math.min(columnIndex, lastColIdx));

      let nextStartRow = base.startRow;
      let nextEndRow = base.endRow;
      if (clampedRow > base.endRow) nextEndRow = clampedRow;
      else if (clampedRow < base.startRow) nextStartRow = clampedRow;

      let nextStartCol = base.startCol;
      let nextEndCol = base.endCol;
      if (clampedCol > base.endCol) nextEndCol = clampedCol;
      else if (clampedCol < base.startCol) nextStartCol = clampedCol;

      const next = buildSelectionRange(
        nextStartRow,
        nextStartCol,
        nextEndRow,
        nextEndCol
      );
      if (!next) return;
      if (selectionEquals(latestSelectionRef.current, next)) return;
      latestSelectionRef.current = next;
      lastSelectionSourceRef.current = "fill";
      onSelectionRangeChange?.(next);
    },
    [
      buildSelectionRange,
      enableCellSelection,
      lastDenseRowIdx,
      lastColIdx,
      selectionEquals,
      onSelectionRangeChange,
    ]
  );

  const clearSelectionRange = useCallback(() => {
    setRowSelectionBands([]);
    setColumnSelectionBands([]);
    if (!latestSelectionRef.current) {
      lastSelectionSourceRef.current = null;
      return;
    }
    latestSelectionRef.current = null;
    lastSelectionSourceRef.current = null;
    fillDragRef.current = { active: false, base: null };
    setFillDragActive(false);
    onSelectionRangeChange?.(null);
  }, [onSelectionRangeChange, setColumnSelectionBands, setRowSelectionBands]);

  const getRenderedSelection = useCallback(() => {
    if (isSelectingRef.current || fillDragRef.current.active) {
      return latestSelectionRef.current ?? selection ?? null;
    }
    return selection ?? latestSelectionRef.current ?? null;
  }, [selection]);

  // --- Auto-scroll helpers
  const getEdgeDelta = useCallback(
    (pos: number, min: number, max: number) => {
      if (pos < min + edgeSize) {
        const d = Math.min(edgeSize, Math.max(0, min + edgeSize - pos));
        return -Math.min(maxEdgeSpeed, (d / edgeSize) * maxEdgeSpeed);
      }
      if (pos > max - edgeSize) {
        const d = Math.min(edgeSize, Math.max(0, pos - (max - edgeSize)));
        return Math.min(maxEdgeSpeed, (d / edgeSize) * maxEdgeSpeed);
      }
      return 0;
    },
    [edgeSize, maxEdgeSpeed]
  );

  const tryUpdateSelectionFromPoint = useCallback(
    (x: number, y: number) => {
      const anchor = selectionAnchorRef.current;
      const fillActive = fillDragRef.current.active;
      if (!anchor && !fillActive) return;

      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (el) {
        let node: HTMLElement | null = el;
        let rowId: string | number | null = null;
        let colIdx: number | null = null;
        let steps = 0;
        const MAX_STEPS = 10;

        const containerEl = containerRef.current;

        while (
          node &&
          node !== document.body &&
          node !== containerEl &&
          node !== containerEl?.parentElement &&
          steps < MAX_STEPS
        ) {
          steps++;
          const rid = node.getAttribute?.("data-row-id");
          const c = node.getAttribute?.("data-col-index");
          if (rid != null && c != null) {
            rowId = Number.isNaN(Number(rid)) ? rid : Number(rid);
            const cc = Number(c);
            if (Number.isFinite(cc)) {
              colIdx = cc;
              break;
            }
          }
          node = node.parentElement;
        }

        if (rowId != null && colIdx != null) {
          const denseRow = denseFromId(rowId);
          if (fillActive) {
            applyFillDrag(denseRow, colIdx);
          } else {
            const safeAnchor = anchor!;
            applySelectionRange(
              safeAnchor.row,
              safeAnchor.col,
              denseRow,
              colIdx,
              undefined,
              "drag"
            );
          }
          return;
        }
      }

      // Edge scroll fallback
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = getEdgeDelta(x, rect.left, rect.right);
      const dy = getEdgeDelta(y, rect.top, rect.bottom);

      let edgeRow: number;
      let edgeCol: number;
      if (fillActive) {
        const base = fillDragRef.current.base;
        edgeRow = base ? base.endRow : 0;
        edgeCol = base ? base.endCol : 0;
      } else {
        const safeAnchor = anchor!;
        edgeRow = safeAnchor.row;
        edgeCol = safeAnchor.col;
      }

      if (dy > 0) edgeRow = lastDenseRowIdx;
      if (dy < 0) edgeRow = 0;
      if (dx > 0) edgeCol = lastColIdx;
      if (dx < 0) edgeCol = 0;

      if (fillActive) {
        applyFillDrag(edgeRow, edgeCol);
      } else {
        const safeAnchor = anchor!;
        applySelectionRange(
          safeAnchor.row,
          safeAnchor.col,
          edgeRow,
          edgeCol,
          undefined,
          "drag"
        );
      }
    },
    [containerRef, getEdgeDelta, lastDenseRowIdx, lastColIdx, denseFromId, applyFillDrag, applySelectionRange]
  );

  const tickAutoScroll = useCallback(() => {
    if (!isSelectingRef.current) {
      rafIdRef.current = null;
      return;
    }
    const coords = mouseXYRef.current;
    const container = containerRef.current;
    if (!container || !coords) {
      rafIdRef.current = requestAnimationFrame(tickAutoScroll);
      return;
    }

    const rect = container.getBoundingClientRect();
    const dx = getEdgeDelta(coords.x, rect.left, rect.right);
    const dy = getEdgeDelta(coords.y, rect.top, rect.bottom);

    if (dx !== 0 || dy !== 0) {
      container.scrollBy({ left: dx, top: dy, behavior: "auto" });
    }

    const sameAsLast =
      lastHitRef.current &&
      lastHitRef.current.x === coords.x &&
      lastHitRef.current.y === coords.y;

    if (!sameAsLast) {
      tryUpdateSelectionFromPoint(coords.x, coords.y);
      lastHitRef.current = { x: coords.x, y: coords.y };
    }

    rafIdRef.current = requestAnimationFrame(tickAutoScroll);
  }, [containerRef, getEdgeDelta, tryUpdateSelectionFromPoint]);

  const onGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelectingRef.current) return;
    mouseXYRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const startAutoScroll = useCallback(() => {
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(tickAutoScroll);
    }
    window.addEventListener("mousemove", onGlobalMouseMove, { passive: true });
  }, [tickAutoScroll, onGlobalMouseMove]);

  const stopAutoScroll = useCallback(() => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    window.removeEventListener("mousemove", onGlobalMouseMove as any);
    mouseXYRef.current = null;
    lastHitRef.current = null;
  }, [onGlobalMouseMove]);

  const endSelection = useCallback(() => {
    if (!isSelectingRef.current) return;
    isSelectingRef.current = false;
    selectionAnchorRef.current = null;
    setIsDraggingSelection(false);
    stopAutoScroll();
    window.removeEventListener("mouseup", endSelection);
  }, [stopAutoScroll]);

  const endFillHandleDrag = useCallback(() => {
    if (!fillDragRef.current.active) return;
    fillDragRef.current = { active: false, base: null };
    isSelectingRef.current = false;
    setIsDraggingSelection(false);
    stopAutoScroll();
    window.removeEventListener("mouseup", endFillHandleDrag);
    setFillDragActive(false);
  }, [stopAutoScroll]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mouseup", endSelection);
      window.removeEventListener("mouseup", endFillHandleDrag);
      stopAutoScroll();
    };
  }, [endSelection, endFillHandleDrag, stopAutoScroll]);

  // --- Mouse handlers (robust: always derive dense via row id when possible)
  const handleCellMouseDown = useCallback(
    (
      rowIndexFromCaller: number,
      columnIndex: number | null,
      event: ReactMouseEvent
    ) => {
      if (!enableCellSelection || event.button !== 0) return;
      if (columnIndex == null) return;
      if (!rowCount || !vColsLen) return;

      const el = event.target as Element | null;
      const onHandle =
        el?.closest('[data-row-drag-handle="true"]') ||
        el?.closest('[data-col-drag-handle="true"]');
      if (onHandle) return;

      // Prefer id->dense; fallback to caller's index treated as ABS
      const denseRow = resolveDenseRowFromEvent(event, rowIndexFromCaller);

      const clampedCol = Math.max(0, Math.min(columnIndex, lastColIdx));
      const outsideCenter =
        (centerRowRange &&
          (denseRow < centerRowRange.start ||
            denseRow > centerRowRange.end)) ||
        (centerColumnRange &&
          (clampedCol < centerColumnRange.start ||
            clampedCol > centerColumnRange.end));
      if (outsideCenter) return;

      event.preventDefault();
      window.removeEventListener("mouseup", endSelection);

      selectionAnchorRef.current = { row: denseRow, col: clampedCol };
      isSelectingRef.current = true;
      setIsDraggingSelection(true);

      applySelectionRange(
        denseRow,
        clampedCol,
        denseRow,
        clampedCol,
        undefined,
        "drag"
      );

      startAutoScroll();
      window.addEventListener("mouseup", endSelection);
    },
    [
      enableCellSelection,
      rowCount,
      vColsLen,
      resolveDenseRowFromEvent,
      applySelectionRange,
      endSelection,
      startAutoScroll,
      lastColIdx,
      centerRowRange,
      centerColumnRange,
    ]
  );

  const handleCellMouseEnter = useCallback(
    (
      rowIndexFromCaller: number,
      columnIndex: number | null,
      event?: ReactMouseEvent
    ) => {
      if (!enableCellSelection || !isSelectingRef.current) return;
      if (columnIndex == null) return;
      const anchor = selectionAnchorRef.current;

      // If we have the event, prefer resolving from id
      const denseRow = event
        ? resolveDenseRowFromEvent(event, rowIndexFromCaller)
        : denseFromAbs(rowIndexFromCaller);

      if (fillDragRef.current.active) {
        applyFillDrag(denseRow, columnIndex);
        return;
      }

      if (!anchor) return;

      applySelectionRange(
        anchor.row,
        anchor.col,
        denseRow,
        columnIndex,
        undefined,
        "drag"
      );
    },
    [
      enableCellSelection,
      applySelectionRange,
      applyFillDrag,
      resolveDenseRowFromEvent,
      denseFromAbs,
    ]
  );

  // --- Fill handle
  const beginFillHandleDrag = useCallback(
    (event: ReactMouseEvent) => {
      if (!enableCellSelection) return;
      const base = latestSelectionRef.current;
      if (!base) return;

      event.preventDefault();
      event.stopPropagation();

      fillDragRef.current = { active: true, base };
      isSelectingRef.current = true;
      mouseXYRef.current = { x: event.clientX, y: event.clientY };
      setIsDraggingSelection(true);
      setFillDragActive(true);

      startAutoScroll();
      window.addEventListener("mouseup", endFillHandleDrag);
    },
    [enableCellSelection, endFillHandleDrag, startAutoScroll]
  );

  // --- Apply row/column header selections (ids -> dense)
  const applyRowSelectionToCells = useCallback(
    (
      map: Map<string | number, GridRow>,
      overlayOptions: RowSelectionOverlayOptions = {}
    ) => {
      lastRowHeaderSelectionRef.current = new Map(map);

      const mode: SelectionOverlayMode =
        overlayOptions.mode ?? rowCellSelectionMode;
      const includeSpans =
        overlayOptions.includeSpans ?? rowCellSelectionIncludeSpans;

      setColumnSelectionBands([]);

      if (!map.size) {
        setRowSelectionBands([]);
        return;
      }

      let minR: number | null = null;
      let maxR: number | null = null;
      const denseRows: number[] = [];

      for (const row of map.values()) {
        const dense = denseFromId(row.id);
        denseRows.push(dense);
        if (minR == null || dense < minR) minR = dense;
        if (maxR == null || dense > maxR) maxR = dense;
      }

      let singleDenseRow: number | null = null;
      if (mode === "single") {
        const anchorRowId = overlayOptions.anchorRowId;
        singleDenseRow =
          anchorRowId != null && map.has(anchorRowId)
            ? denseFromId(anchorRowId)
            : denseRows[denseRows.length - 1] ?? null;
      }

      const selectedStartCol = centerColumnRange
        ? Math.max(0, centerColumnRange.start)
        : 0;
      const selectedEndCol = centerColumnRange
        ? Math.min(lastColIdx, centerColumnRange.end)
        : lastColIdx;
      const denseRowsForBands =
        mode === "bands" && includeSpans
          ? expandDenseRowsForSpans(denseRows, selectedStartCol, selectedEndCol)
          : denseRows;

      if (mode === "bands") {
        setRowSelectionBands(denseRowsForBands);
      } else if (mode === "single") {
        // "single" keeps per-row discrete picks (no in-between fill, no span expansion).
        setRowSelectionBands(denseRows);
      } else {
        setRowSelectionBands([]);
      }

      if (!enableCellSelection || !selectEntireRowOnSelection) return;
      if (!rowCount || !vColsLen) return;
      if (minR == null || maxR == null) return;

      const resolvedStart = mode === "single" && singleDenseRow != null
        ? singleDenseRow
        : minR;
      const resolvedEnd = mode === "single" && singleDenseRow != null
        ? singleDenseRow
        : maxR;

      const rowStart = centerRowRange
        ? Math.max(resolvedStart, centerRowRange.start)
        : resolvedStart;
      const rowEnd = centerRowRange
        ? Math.min(resolvedEnd, centerRowRange.end)
        : resolvedEnd;
      const colStart = centerColumnRange
        ? Math.max(0, centerColumnRange.start)
        : 0;
      const colEnd = centerColumnRange
        ? Math.min(lastColIdx, centerColumnRange.end)
        : lastColIdx;

      if (rowStart > rowEnd) return;
      if (colStart > colEnd) return;

      applySelectionRange(
        rowStart,
        colStart,
        rowEnd,
        colEnd,
        {
          expandToSpans: includeSpans && mode !== "single",
        },
        "row"
      );
    },
    [
      rowCellSelectionMode,
      rowCellSelectionIncludeSpans,
      expandDenseRowsForSpans,
      setColumnSelectionBands,
      setRowSelectionBands,
      denseFromId,
      enableCellSelection,
      selectEntireRowOnSelection,
      rowCount,
      vColsLen,
      centerRowRange,
      centerColumnRange,
      lastColIdx,
      applySelectionRange,
    ]
  );

  const applyColumnSelectionToCells = useCallback(
    (set: Set<string>, overlayOptions: ColumnSelectionOverlayOptions = {}) => {
      lastColumnHeaderSelectionRef.current = new Set(set);

      const mode: SelectionOverlayMode =
        overlayOptions.mode ?? columnCellSelectionMode;
      const includeSpans =
        overlayOptions.includeSpans ?? columnCellSelectionIncludeSpans;

      setRowSelectionBands([]);

      if (!set.size) {
        setColumnSelectionBands([]);
        return;
      }
      if (!enableCellSelection || !selectEntireColumnOnSelection) return;
      if (!rowCount || !vColsLen) return;

      let minC: number | null = null;
      let maxC: number | null = null;
      const selectedColumns: number[] = [];

      for (const key of set) {
        const idx = visualColumnIndex.get(key);
        if (idx == null) continue;
        selectedColumns.push(idx);
        if (minC == null || idx < minC) minC = idx;
        if (maxC == null || idx > maxC) maxC = idx;
      }

      if (minC == null || maxC == null) {
        setColumnSelectionBands([]);
        return;
      }

      let singleColumn: number | null = null;
      if (mode === "single") {
        const anchorColumnKey = overlayOptions.anchorColumnKey;
        singleColumn =
          anchorColumnKey != null && set.has(anchorColumnKey)
            ? (visualColumnIndex.get(anchorColumnKey) ?? null)
            : selectedColumns[selectedColumns.length - 1] ?? null;
      }

      const selectedStartRow = centerRowRange ? Math.max(0, centerRowRange.start) : 0;
      const selectedEndRow = centerRowRange
        ? Math.min(lastDenseRowIdx, centerRowRange.end)
        : lastDenseRowIdx;
      const columnsForBands =
        mode === "bands" && includeSpans
          ? expandDenseColumnsForSpans(
              selectedColumns,
              selectedStartRow,
              selectedEndRow
            )
          : selectedColumns;

      if (mode === "bands") {
        setColumnSelectionBands(columnsForBands);
      } else if (mode === "single") {
        // "single" keeps per-column discrete picks (no in-between fill, no span expansion).
        setColumnSelectionBands(selectedColumns);
      } else {
        setColumnSelectionBands([]);
      }

      const resolvedStart = mode === "single" && singleColumn != null
        ? singleColumn
        : minC;
      const resolvedEnd = mode === "single" && singleColumn != null
        ? singleColumn
        : maxC;

      const colStart = centerColumnRange
        ? Math.max(resolvedStart, centerColumnRange.start)
        : resolvedStart;
      const colEnd = centerColumnRange
        ? Math.min(resolvedEnd, centerColumnRange.end)
        : resolvedEnd;
      if (colStart > colEnd) return;

      const rowStart = selectedStartRow;
      const rowEnd = selectedEndRow;

      if (rowStart > rowEnd) return;

      applySelectionRange(
        rowStart,
        colStart,
        rowEnd,
        colEnd,
        {
          expandToSpans: includeSpans && mode !== "single",
        },
        "column"
      );
    },
    [
      columnCellSelectionMode,
      columnCellSelectionIncludeSpans,
      expandDenseColumnsForSpans,
      setRowSelectionBands,
      setColumnSelectionBands,
      enableCellSelection,
      selectEntireColumnOnSelection,
      rowCount,
      vColsLen,
      visualColumnIndex,
      centerColumnRange,
      centerRowRange,
      lastDenseRowIdx,
      applySelectionRange,
    ]
  );

  useEffect(() => {
    if (lastSelectionSourceRef.current !== "row") return;
    if (!enableCellSelection || !selectEntireRowOnSelection) return;
    const latestHeaderSelection = lastRowHeaderSelectionRef.current;
    if (!latestHeaderSelection.size) return;
    applyRowSelectionToCells(latestHeaderSelection, {
      mode: rowCellSelectionMode,
      includeSpans: rowCellSelectionIncludeSpans,
    });
  }, [
    enableCellSelection,
    selectEntireRowOnSelection,
    rowCellSelectionMode,
    rowCellSelectionIncludeSpans,
    applyRowSelectionToCells,
  ]);

  useEffect(() => {
    if (lastSelectionSourceRef.current !== "column") return;
    if (!enableCellSelection || !selectEntireColumnOnSelection) return;
    const latestHeaderSelection = lastColumnHeaderSelectionRef.current;
    if (!latestHeaderSelection.size) return;
    applyColumnSelectionToCells(latestHeaderSelection, {
      mode: columnCellSelectionMode,
      includeSpans: columnCellSelectionIncludeSpans,
    });
  }, [
    enableCellSelection,
    selectEntireColumnOnSelection,
    columnCellSelectionMode,
    columnCellSelectionIncludeSpans,
    applyColumnSelectionToCells,
  ]);

  const selectionEdgeStyle = useCallback(
    (
      rAbsOrDense: number,
      c: number,
      rowSpan = 1,
      colSpan = 1,
      columnKey?: string,
      isHeader?: boolean
    ) => {
      if (isHeader) return {};
      if (columnKey && isSystemCol(columnKey)) return {};

      // Quick column check first (cheaper than row lookup)
      const cellStartC = c;
      const cellEndC = c + colSpan - 1;

      // Treat inbound row index as ABS if we can map it; else assume it's already dense.
      const maybeDense = rowIndexToVisual.get(rAbsOrDense);
      const cellStartR =
        maybeDense != null
          ? maybeDense
          : Math.max(0, Math.min(rAbsOrDense, lastDenseRowIdx));
      const cellEndR = Math.max(
        0,
        Math.min(cellStartR + rowSpan - 1, lastDenseRowIdx)
      );

      if (
        (centerRowRange &&
          (cellEndR < centerRowRange.start ||
            cellStartR > centerRowRange.end)) ||
        (centerColumnRange &&
          (cellEndC < centerColumnRange.start ||
            cellStartC > centerColumnRange.end))
      ) {
        return CELL_BORDER;
      }

      if (isRowBandSelectionActive()) {
        const selectedStartCol = centerColumnRange ? centerColumnRange.start : 0;
        const selectedEndCol = centerColumnRange
          ? centerColumnRange.end
          : lastColIdx;

        if (cellEndC < selectedStartCol || cellStartC > selectedEndCol) {
          return CELL_BORDER;
        }

        const bandForStartRow = rowSelectionBandByRowRef.current.get(cellStartR);
        if (
          !bandForStartRow ||
          cellStartR < bandForStartRow.start ||
          cellEndR > bandForStartRow.end
        ) {
          const colOverlapsSelection =
            cellEndC >= selectedStartCol && cellStartC <= selectedEndCol;
          const adjacentStyle: CSSProperties = {};
          const upperBand = rowSelectionBandByRowRef.current.get(cellEndR + 1);
          const lowerBand = rowSelectionBandByRowRef.current.get(cellStartR - 1);

          if (
            colOverlapsSelection &&
            upperBand &&
            upperBand.start === cellEndR + 1
          ) {
            adjacentStyle.borderBottomWidth = 0;
            adjacentStyle.borderBottomStyle = "none";
            adjacentStyle.borderBottomColor = "transparent";
          }
          if (
            colOverlapsSelection &&
            lowerBand &&
            lowerBand.end === cellStartR - 1
          ) {
            adjacentStyle.borderTopWidth = 0;
            adjacentStyle.borderTopStyle = "none";
            adjacentStyle.borderTopColor = "transparent";
          }
          if (cellEndC === selectedStartCol - 1) {
            for (let r = cellStartR; r <= cellEndR; r += 1) {
              if (!rowSelectionBandByRowRef.current.has(r)) continue;
              adjacentStyle.borderRightWidth = 0;
              adjacentStyle.borderRightStyle = "none";
              adjacentStyle.borderRightColor = "transparent";
              break;
            }
          }
          if (cellStartC === selectedEndCol + 1) {
            for (let r = cellStartR; r <= cellEndR; r += 1) {
              if (!rowSelectionBandByRowRef.current.has(r)) continue;
              adjacentStyle.borderLeftWidth = 0;
              adjacentStyle.borderLeftStyle = "none";
              adjacentStyle.borderLeftColor = "transparent";
              break;
            }
          }

          if (Object.keys(adjacentStyle).length === 0) {
            return CELL_BORDER;
          }

          return {
            ...CELL_BORDER,
            ...adjacentStyle,
          };
        }

        const isTopEdge = bandForStartRow.start === cellStartR;
        const isBottomEdge = bandForStartRow.end === cellEndR;
        const isLeftEdge =
          cellStartC <= selectedStartCol && cellEndC >= selectedStartCol;
        const isRightEdge =
          cellStartC <= selectedEndCol && cellEndC >= selectedEndCol;
        const isSingleCell =
          bandForStartRow.start === bandForStartRow.end &&
          selectedStartCol === selectedEndCol;
        const isExactSpanSelection =
          bandForStartRow.start === cellStartR &&
          bandForStartRow.end === cellEndR &&
          selectedStartCol === cellStartC &&
          selectedEndCol === cellEndC;

        const style: CSSProperties = {
          backgroundColor:
            "var(--ace-grid-cell-bg-selected, var(--ace-grid-selection-fill, rgba(37,99,235,0.16)))",
        };

        if (!isSingleCell && !isExactSpanSelection) {
          style.boxShadow = "var(--ace-grid-cell-shadow, none)";
        }

        const edgeWidth =
          isSingleCell || isExactSpanSelection ? SELECTION_WIDTH : 1;

        if (isTopEdge) {
          style.borderTopWidth = edgeWidth;
          style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
          style.borderTopColor = SELECTION_COLOR;
        } else {
          style.borderTopColor = "var(--ace-grid-cell-border-color)";
          style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
          style.borderTopWidth = 1;
        }

        if (isBottomEdge) {
          style.borderBottomWidth = edgeWidth;
          style.borderBottomStyle =
            SELECTION_STYLE as CSSProperties["borderBottomStyle"];
          style.borderBottomColor = SELECTION_COLOR;
        } else {
          style.borderBottomColor = "transparent";
          style.borderBottomStyle = "none";
          style.borderBottomWidth = 0;
        }

        if (isLeftEdge) {
          style.borderLeftWidth = edgeWidth;
          style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
          style.borderLeftColor = SELECTION_COLOR;
        } else {
          style.borderLeftColor = "var(--ace-grid-cell-border-color)";
          style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
          style.borderLeftWidth = 1;
        }

        if (isRightEdge) {
          style.borderRightWidth = edgeWidth;
          style.borderRightStyle =
            SELECTION_STYLE as CSSProperties["borderRightStyle"];
          style.borderRightColor = SELECTION_COLOR;
        } else {
          style.borderRightColor = "transparent";
          style.borderRightStyle = "none";
          style.borderRightWidth = 0;
        }

        return style;
      }

      if (isColumnBandSelectionActive()) {
        const selectedStartRow = centerRowRange ? centerRowRange.start : 0;
        const selectedEndRow = centerRowRange
          ? centerRowRange.end
          : lastDenseRowIdx;

        if (cellEndR < selectedStartRow || cellStartR > selectedEndRow) {
          return CELL_BORDER;
        }

        const hasSelectedColumnInRange = (
          startCol: number,
          endCol: number
        ): boolean => {
          for (let col = startCol; col <= endCol; col += 1) {
            if (columnSelectionBandByColRef.current.has(col)) return true;
          }
          return false;
        };

        const bandForStartCol = columnSelectionBandByColRef.current.get(cellStartC);
        if (
          !bandForStartCol ||
          cellStartC < bandForStartCol.start ||
          cellEndC > bandForStartCol.end
        ) {
          const rowOverlapsSelection =
            cellEndR >= selectedStartRow && cellStartR <= selectedEndRow;
          const adjacentStyle: CSSProperties = {};
          const leftBand = columnSelectionBandByColRef.current.get(cellEndC + 1);
          const rightBand = columnSelectionBandByColRef.current.get(cellStartC - 1);

          if (
            rowOverlapsSelection &&
            leftBand &&
            leftBand.start === cellEndC + 1
          ) {
            adjacentStyle.borderRightWidth = 0;
            adjacentStyle.borderRightStyle = "none";
            adjacentStyle.borderRightColor = "transparent";
          }
          if (
            rowOverlapsSelection &&
            rightBand &&
            rightBand.end === cellStartC - 1
          ) {
            adjacentStyle.borderLeftWidth = 0;
            adjacentStyle.borderLeftStyle = "none";
            adjacentStyle.borderLeftColor = "transparent";
          }
          if (
            cellEndR === selectedStartRow - 1 &&
            hasSelectedColumnInRange(cellStartC, cellEndC)
          ) {
            adjacentStyle.borderBottomWidth = 0;
            adjacentStyle.borderBottomStyle = "none";
            adjacentStyle.borderBottomColor = "transparent";
          }
          if (
            cellStartR === selectedEndRow + 1 &&
            hasSelectedColumnInRange(cellStartC, cellEndC)
          ) {
            adjacentStyle.borderTopWidth = 0;
            adjacentStyle.borderTopStyle = "none";
            adjacentStyle.borderTopColor = "transparent";
          }

          if (Object.keys(adjacentStyle).length === 0) {
            return CELL_BORDER;
          }

          return {
            ...CELL_BORDER,
            ...adjacentStyle,
          };
        }

        const isTopEdge =
          cellStartR <= selectedStartRow && cellEndR >= selectedStartRow;
        const isBottomEdge =
          cellStartR <= selectedEndRow && cellEndR >= selectedEndRow;
        const isLeftEdge = bandForStartCol.start === cellStartC;
        const isRightEdge = bandForStartCol.end === cellEndC;
        const isSingleCell =
          selectedStartRow === selectedEndRow &&
          bandForStartCol.start === bandForStartCol.end;
        const isExactSpanSelection =
          selectedStartRow === cellStartR &&
          selectedEndRow === cellEndR &&
          bandForStartCol.start === cellStartC &&
          bandForStartCol.end === cellEndC;

        const style: CSSProperties = {
          backgroundColor:
            "var(--ace-grid-cell-bg-selected, var(--ace-grid-selection-fill, rgba(37,99,235,0.16)))",
        };

        if (!isSingleCell && !isExactSpanSelection) {
          style.boxShadow = "var(--ace-grid-cell-shadow, none)";
        }

        const edgeWidth =
          isSingleCell || isExactSpanSelection ? SELECTION_WIDTH : 1;

        if (isTopEdge) {
          style.borderTopWidth = edgeWidth;
          style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
          style.borderTopColor = SELECTION_COLOR;
        } else {
          style.borderTopColor = "var(--ace-grid-cell-border-color)";
          style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
          style.borderTopWidth = 1;
        }

        if (isBottomEdge) {
          style.borderBottomWidth = edgeWidth;
          style.borderBottomStyle =
            SELECTION_STYLE as CSSProperties["borderBottomStyle"];
          style.borderBottomColor = SELECTION_COLOR;
        } else {
          style.borderBottomColor = "transparent";
          style.borderBottomStyle = "none";
          style.borderBottomWidth = 0;
        }

        if (isLeftEdge) {
          style.borderLeftWidth = edgeWidth;
          style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
          style.borderLeftColor = SELECTION_COLOR;
        } else {
          style.borderLeftColor = "var(--ace-grid-cell-border-color)";
          style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
          style.borderLeftWidth = 1;
        }

        if (isRightEdge) {
          style.borderRightWidth = edgeWidth;
          style.borderRightStyle =
            SELECTION_STYLE as CSSProperties["borderRightStyle"];
          style.borderRightColor = SELECTION_COLOR;
        } else {
          style.borderRightColor = "transparent";
          style.borderRightStyle = "none";
          style.borderRightWidth = 0;
        }

        return style;
      }

      const current = getRenderedSelection();
      if (!current) return CELL_BORDER;
      if (current.endCol < cellStartC || current.startCol > cellEndC) {
        return CELL_BORDER;
      }

      const overlaps =
        current.endRow >= cellStartR &&
        current.startRow <= cellEndR;

      // If cell is not in selection, return base borders and hide borders
      // on sides adjacent to the selection to avoid double lines.
      if (!overlaps) {
        const overlapsRow =
          cellEndR >= current.startRow && cellStartR <= current.endRow;
        const overlapsCol =
          cellEndC >= current.startCol && cellStartC <= current.endCol;
        const adjacentStyle: CSSProperties = {};

        if (overlapsCol && cellEndR === current.startRow - 1) {
          adjacentStyle.borderBottomWidth = 0;
          adjacentStyle.borderBottomStyle = "none";
          adjacentStyle.borderBottomColor = "transparent";
        }
        if (overlapsCol && cellStartR === current.endRow + 1) {
          adjacentStyle.borderTopWidth = 0;
          adjacentStyle.borderTopStyle = "none";
          adjacentStyle.borderTopColor = "transparent";
        }
        if (overlapsRow && cellEndC === current.startCol - 1) {
          adjacentStyle.borderRightWidth = 0;
          adjacentStyle.borderRightStyle = "none";
          adjacentStyle.borderRightColor = "transparent";
        }
        if (overlapsRow && cellStartC === current.endCol + 1) {
          adjacentStyle.borderLeftWidth = 0;
          adjacentStyle.borderLeftStyle = "none";
          adjacentStyle.borderLeftColor = "transparent";
        }

        if (Object.keys(adjacentStyle).length === 0) {
          return CELL_BORDER;
        }

        return {
          ...CELL_BORDER,
          ...adjacentStyle,
        };
      }

      const isTopEdge = current.startRow === cellStartR;
      const isBottomEdge = current.endRow === cellEndR;
      const isLeftEdge = current.startCol === cellStartC;
      const isRightEdge = current.endCol === cellEndC;

      const isSingleCell =
        current.startRow === current.endRow &&
        current.startCol === current.endCol;
      const isExactSpanSelection =
        current.startRow === cellStartR &&
        current.endRow === cellEndR &&
        current.startCol === cellStartC &&
        current.endCol === cellEndC;

      const style: CSSProperties = {
        backgroundColor:
          "var(--ace-grid-cell-bg-selected, var(--ace-grid-selection-fill, rgba(37,99,235,0.16)))",
      };

      if (!isSingleCell && !isExactSpanSelection) {
        style.boxShadow = "var(--ace-grid-cell-shadow, none)";
      }

      const edgeWidth =
        isSingleCell || isExactSpanSelection ? SELECTION_WIDTH : 1;

      // Apply selection border on edges, keep base borders elsewhere
      if (isTopEdge) {
        style.borderTopWidth = edgeWidth;
        style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
        style.borderTopColor = SELECTION_COLOR;
      } else {
        style.borderTopColor = "var(--ace-grid-cell-border-color)";
        style.borderTopStyle = SELECTION_STYLE as CSSProperties["borderTopStyle"];
        style.borderTopWidth = 1;
      }

      if (isBottomEdge) {
        style.borderBottomWidth = edgeWidth;
        style.borderBottomStyle = SELECTION_STYLE as CSSProperties["borderBottomStyle"];
        style.borderBottomColor = SELECTION_COLOR;
      } else {
        style.borderBottomColor = "transparent";
        style.borderBottomStyle = "none";
        style.borderBottomWidth = 0;
      }

      if (isLeftEdge) {
        style.borderLeftWidth = edgeWidth;
        style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
        style.borderLeftColor = SELECTION_COLOR;
      } else {
        style.borderLeftColor = "var(--ace-grid-cell-border-color)";
        style.borderLeftStyle = SELECTION_STYLE as CSSProperties["borderLeftStyle"];
        style.borderLeftWidth = 1;
      }

      if (isRightEdge) {
        style.borderRightWidth = edgeWidth;
        style.borderRightStyle = SELECTION_STYLE as CSSProperties["borderRightStyle"];
        style.borderRightColor = SELECTION_COLOR;
      } else {
        style.borderRightColor = "transparent";
        style.borderRightStyle = "none";
        style.borderRightWidth = 0;
      }

      return style;
    },
    [
      selection,
      lastDenseRowIdx,
      rowIndexToVisual,
      isRowBandSelectionActive,
      isColumnBandSelectionActive,
      lastColIdx,
      centerRowRange,
      centerColumnRange,
    ]
  );

  const isCellSelected = useCallback(
    (rAbsOrDense: number, c: number) => {
      if (!enableCellSelection) return false;

      const maybeDense = rowIndexToVisual.get(rAbsOrDense);
      const denseRow =
        maybeDense != null
          ? maybeDense
          : Math.max(0, Math.min(rAbsOrDense, lastDenseRowIdx));

      if (
        (centerRowRange &&
          (denseRow < centerRowRange.start || denseRow > centerRowRange.end)) ||
        (centerColumnRange &&
          (c < centerColumnRange.start || c > centerColumnRange.end))
      ) {
        return false;
      }

      if (isRowBandSelectionActive()) {
        const selectedStartCol = centerColumnRange ? centerColumnRange.start : 0;
        const selectedEndCol = centerColumnRange
          ? centerColumnRange.end
          : lastColIdx;
        if (c < selectedStartCol || c > selectedEndCol) return false;
        return rowSelectionBandByRowRef.current.has(denseRow);
      }

      if (isColumnBandSelectionActive()) {
        const selectedStartRow = centerRowRange ? centerRowRange.start : 0;
        const selectedEndRow = centerRowRange
          ? centerRowRange.end
          : lastDenseRowIdx;
        if (denseRow < selectedStartRow || denseRow > selectedEndRow) {
          return false;
        }
        return columnSelectionBandByColRef.current.has(c);
      }

      const current = getRenderedSelection();
      if (!current) return false;
      return (
        denseRow >= current.startRow &&
        denseRow <= current.endRow &&
        c >= current.startCol &&
        c <= current.endCol
      );
    },
    [
      enableCellSelection,
      selection,
      rowIndexToVisual,
      lastDenseRowIdx,
      isRowBandSelectionActive,
      isColumnBandSelectionActive,
      lastColIdx,
      centerRowRange,
      centerColumnRange,
    ]
  );

  const lastSourceIs = useCallback(
    (src: SelectionSource) => lastSelectionSourceRef.current === src,
    []
  );

  const getSelection = useCallback(
    getRenderedSelection,
    [getRenderedSelection]
  );

  return {
    getSelection,
    selectionEdgeStyle,
    isCellSelected,
    handleCellMouseDown,
    handleCellMouseEnter,
    beginFillHandleDrag,
    applyRowSelectionToCells:
      applyRowSelectionToCells as UseCellSelectionResult["applyRowSelectionToCells"],
    applyColumnSelectionToCells,
    clearSelectionRange,
    lastSourceIs,
    isDraggingSelection,
    fillDragActive,
  };
};
