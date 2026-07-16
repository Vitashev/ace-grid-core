import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
} from "react";
import {
  Grid,
  createGridRowsFromRecords,
  liquidGlassDarkTheme,
  liquidGlassTheme,
  useGrid,
  type GridColumnDef,
} from "@ace-grid/core";

const companies = [
  "HelioBank",
  "Northstar AI",
  "VaultPay",
  "Quantiva",
  "Mercury Retail",
  "Atlas Freight",
  "Aster Health",
  "GridWorks Energy",
  "Pulse Commerce",
  "Cobalt Cloud",
  "Nexus Mobility",
  "Evergreen Labs",
];
const owners = ["Maya", "Theo", "Lena", "Iris", "Noah", "Amir", "June", "Sofia"];
const segments = ["Enterprise", "Strategic", "Mid-market", "Growth"];
const regions = ["North America", "Europe", "APAC", "LATAM"];
const statuses = ["Live", "Review", "Live", "Live", "Escalate"];

const seedRecords = Array.from({ length: 72 }, (_, index) => ({
  id: `account-${index + 1}`,
  company: `${companies[index % companies.length]}${index >= companies.length ? ` ${Math.floor(index / companies.length) + 1}` : ""}`,
  owner: owners[index % owners.length],
  segment: segments[index % segments.length],
  region: regions[index % regions.length],
  status: statuses[index % statuses.length],
  arr: 420000 + ((index * 173000) % 2600000),
  health: 62 + ((index * 7) % 38),
  renewal: `2026-${String((index % 12) + 1).padStart(2, "0")}-15`,
}));

const initialRows = createGridRowsFromRecords(seedRecords);

const columnDefs: GridColumnDef[] = [
  { key: "company", title: "Company", editable: true, filterable: true, sortable: true },
  { key: "owner", title: "Owner", editable: true, filterable: true, sortable: true },
  { key: "segment", title: "Segment", editable: true, filterable: true, sortable: true },
  { key: "region", title: "Region", editable: true, filterable: true, sortable: true },
  { key: "status", title: "Status", editable: true, filterable: true, sortable: true },
  { key: "arr", title: "ARR", type: "number", editable: true, filterable: true, sortable: true },
  { key: "health", title: "Health", type: "number", editable: true, filterable: true, sortable: true },
  { key: "renewal", title: "Renewal", type: "date", editable: true, filterable: true, sortable: true },
];

const initialColumnWidths = {
  company: 280,
  owner: 240,
  segment: 260,
  region: 260,
  status: 230,
  arr: 220,
  health: 230,
  renewal: 260,
};

const coreFeatures = [
  ["selection", "Cell, row & column selection"],
  ["edit", "Inline editing"],
  ["clipboard", "Copy, cut & paste"],
  ["resize", "Row & column resize"],
  ["sort.basic", "Client sorting"],
  ["filter.basic", "Column filtering"],
  ["search", "Search & navigation"],
  ["pagination", "Client pagination"],
  ["virtualization", "2D virtualization"],
  ["theming", "Liquid Glass themes"],
  ["io.csv", "CSV import & export"],
  ["contextMenu.base", "Context menu"],
  ["reorder.column", "Single-column drag reorder"],
  ["reorder.row", "Single-row drag reorder"],
  ["schema.core", "Serializable view state"],
  ["pinning", "Rows & columns pinning"],
  ["keyedHeaders", "Spreadsheet headers"],
  ["sort.multi", "Multi-column sort"],
  ["filter.floating", "Floating filters"],
  ["contextMenu.customization", "Custom menu actions"],
] as const;

const StarterGrid = Grid as unknown as ComponentType<Record<string, unknown>>;
const useStarterGrid = useGrid as unknown as (options: Record<string, unknown>) => [
  Array<{ id: string | number; data: Record<string, unknown> }>,
  any,
];

function readCellValue(cell: unknown) {
  if (cell && typeof cell === "object" && "value" in cell) {
    return (cell as { value: unknown }).value;
  }
  return cell;
}

function countPinned(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  return Object.values(value as Record<string, unknown>).reduce<number>(
    (total, entry) => total + (Array.isArray(entry) ? entry.length : 0),
    0,
  );
}

export function App() {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [darkGlass, setDarkGlass] = useState(false);
  const [activity, setActivity] = useState("Ready — try editing a cell or right-clicking the grid.");
  const [rows, api] = useStarterGrid({
    capabilities: { tier: "core" },
    initialRows,
    columns: columnDefs,
    enableUndo: true,
    enableFiltering: true,
    horizontalVirtualization: true,
    verticalVirtualization: true,
    cellContentVirtualization: true,
    isRowPinning: true,
    isColReorder: true,
    isRowReorder: true,
    isRowSelection: true,
    sortMode: "client",
    pagination: {
      enabled: true,
      pageSize: 12,
      pageSizeOptions: [8, 12, 24],
      showPageSize: true,
      showRange: true,
      showPageInfo: true,
      showControls: true,
      showFirstLast: true,
    },
  });

  const visibleRows = api.pagination?.rows ?? rows;
  const liveAccounts = useMemo(
    () => rows.filter((row) => readCellValue(row.data.status) === "Live").length,
    [rows],
  );
  const selectedCount = api.selectedRowIds?.length ?? 0;
  const pinnedCount = countPinned(api.pinnedColumns) + countPinned(api.pinnedRows);
  const search = api.search;
  const filtering = api.filtering;
  const rowReorderLocked =
    (api.sortModel?.length ?? 0) > 0 ||
    (filtering.activeFilters?.length ?? 0) > 0 ||
    search.query.trim().length > 0;

  const enterManualOrder = () => {
    api.setSortModel([]);
    filtering.clearAllFilters();
    search.set({ query: "" });
    api.pagination.setPageIndex(0);
    setActivity("Manual row order enabled — drag a row handle to move it.");
  };

  const reorderVisibleRow = (fromIndex: number, toIndex: number) => {
    if (rowReorderLocked) return;
    const pageOffset = api.pagination.pageIndex * api.pagination.pageSize;
    api.reorderRows(pageOffset + fromIndex, pageOffset + toIndex);
    setActivity(`Moved row ${fromIndex + 1} to position ${toIndex + 1}.`);
  };

  const copyViewState = useCallback(async () => {
    const viewState = api.getViewState();
    await navigator.clipboard.writeText(JSON.stringify(viewState, null, 2));
    setActivity("Copied serializable Core view state to the clipboard.");
  }, [api.getViewState]);

  const exportCsv = () => {
    api.exportCSV({ filename: "ace-grid-core-showcase.csv", includeHeaders: true });
    setActivity(`Exported ${rows.length} rows as CSV.`);
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = await api.importCSV(file, { headerRow: true });
    setActivity(`Imported ${result.rowCount} rows from ${file.name}.`);
  };

  const contextMenu = useMemo(
    () => ({
      enabled: true,
      closeOnSelect: true,
      items: [
        {
          id: "copy-view-state",
          label: "Copy Core view state",
          description: "Serialize sorting, filters, pinning, and layout",
          onSelect: () => void copyViewState(),
        },
        { type: "divider" },
        {
          id: "copy-selection",
          label: "Copy selection",
          shortcut: "⌘C",
          onSelect: (context: any) =>
            void api.copySelectionToClipboard(context.selection),
        },
      ],
    }),
    [api.copySelectionToClipboard, copyViewState],
  );

  return (
    <main className={`app-shell ${darkGlass ? "is-dark" : ""}`}>
      <div className="aurora aurora--one" />
      <div className="aurora aurora--two" />

      <section className="showcase glass-panel">
        <header className="hero">
          <div className="hero__copy">
            <div className="brand-line">
              <span className="brand-mark">A</span>
              <span>ACE GRID · REACT STARTER</span>
              <span className="core-pill">MIT</span>
            </div>
            <h1>Ace Grid React Example</h1>
            <p>
              An interactive customer data grid built with @ace-grid/core.
            </p>
          </div>

          <div className="hero__stats" aria-label="Grid summary">
            <div className="stat"><strong>20</strong><span>Core capabilities</span></div>
            <div className="stat"><strong>{rows.length}</strong><span>virtualized rows</span></div>
            <div className="stat"><strong>{liveAccounts}</strong><span>live accounts</span></div>
          </div>
        </header>

        <div className="command-bar" aria-label="Core feature controls">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search grid"
              value={search.query}
              onChange={(event) => search.set({ query: event.target.value })}
              placeholder="Search all cells…"
            />
            <small>{search.matchCount || 0} matches</small>
          </label>

          <div className="command-group">
            <button onClick={search.prevMatch} title="Previous search match">↑</button>
            <button onClick={search.nextMatch} title="Next search match">↓</button>
            <button onClick={() => api.undo()} disabled={!api.canUndo} title="Undo">↶</button>
            <button onClick={() => api.redo()} disabled={!api.canRedo} title="Redo">↷</button>
          </div>

          <div className="command-group command-group--actions">
            <button onClick={() => csvInputRef.current?.click()}>Import CSV</button>
            <button onClick={exportCsv}>Export CSV</button>
            <button onClick={copyViewState}>Copy state</button>
            <button onClick={enterManualOrder} disabled={!rowReorderLocked}>
              Manual order
            </button>
            <button className="theme-toggle" onClick={() => setDarkGlass((value) => !value)}>
              {darkGlass ? "Light glass" : "Dark glass"}
            </button>
          </div>
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
        </div>

        <div className="signal-row">
          <span><i className="signal signal--green" /> {activity}</span>
          <span>{selectedCount} selected</span>
          <span>{api.sortModel?.length ?? 0} sorts</span>
          <span>{filtering.activeFilters?.length ?? 0} filters</span>
          <span>{pinnedCount} pinned</span>
        </div>

        <div className="grid-stage">
          <div className="grid-stage__topline">
            <div>
              <strong>Revenue operations</strong>
              <span>
                Drag one row or column at a time · resize edges · right-click any cell
              </span>
            </div>
            <div className="live-badge"><span /> Live Core runtime</div>
          </div>
          <div className="grid-stage__scroll">
            <StarterGrid
              capabilities={{ tier: "core" }}
              accessibility={{ ariaLabel: "Ace Grid Core feature showcase" }}
              data={{
                rows: visibleRows,
                columns: api.columnDefs?.length ? api.columnDefs : columnDefs,
              }}
              layout={{
                width: 2080,
                height: 560,
                rowHeight: 42,
                headerHeight: 48,
                stickyHeader: true,
                className: "core-showcase-grid",
              }}
              theming={{ theme: darkGlass ? liquidGlassDarkTheme : liquidGlassTheme }}
              columns={{
                columnWidths: { ...initialColumnWidths, ...api.columnWidths },
                fillWidth: true,
                systemColumns: {
                  rowSelection: { width: 46 },
                  rowOrdering: { width: 42 },
                  rowPinning: { width: 52, pinned: false },
                },
              }}
              keyedHeaders={{
                enabled: true,
                columns: { enabled: false },
                rows: { enabled: true, width: 50, headerLabel: "Row" },
              }}
              virtual={{
                enableVirtualization: true,
                enableHorizontalVirtualization: true,
                enableCellContentVirtualization: true,
                rowBufferPx: 220,
                columnBufferPx: 180,
              }}
              selection={{
                selection: api.selection,
                enableCellSelection: true,
                isRowSelection: true,
                isColSelection: true,
                onSelectionRangeChange: api.setSelection,
                onRowSelectionChange: (ids: Array<string | number>) => {
                  api.setSelectedRowIds(ids);
                  api.updateRowsSelection(ids);
                  setActivity(
                    ids.length > 1
                      ? `${ids.length} rows selected. Core drag moves one row; multi-row drag is available in Pro.`
                      : `${ids.length} row${ids.length === 1 ? "" : "s"} selected.`,
                  );
                },
                onColumnSelectionChange: api.setSelectedColumnKeys,
              }}
              clipboard={{
                enabled: true,
                enableKeyboardShortcuts: true,
                onCopy: (context: any) => api.copySelectionToClipboard(context.selection, context),
                onCut: (context: any) => api.cutSelection(context.selection, context),
                onPaste: (context: any) => api.pasteFromClipboard(context.selection, context),
              }}
              edit={{
                isCellEditing: true,
                onCellChange: (rowId: string | number, columnKey: string, value: any) => {
                  api.updateCell(rowId, columnKey, value);
                  setActivity(`Updated ${columnKey} on ${rowId}.`);
                },
              }}
              filter={{
                filterMode: "client",
                activeFilters: filtering.activeFilters,
                onFilter: filtering.setFilter,
                enableFloatingFilters: true,
                floatingFilterHeight: 36,
                floatingFilterDebounceMs: 160,
              }}
              sorting={{
                sortMode: "client",
                sortModel: api.sortModel,
                enableMultiSort: true,
                multiSortKey: "shift",
                onSortModelChange: api.setSortModel,
              }}
              search={{
                enabled: true,
                query: search.query,
                mode: "highlight",
                highlight: true,
                activeMatchIndex: search.matchCount > 0 ? search.activeIndex : undefined,
                onResultsCountChange: search.setMatchCount,
              }}
              pinning={{
                isRowPinning: true,
                isColPinning: true,
                pinnedColumns: api.pinnedColumns,
                pinnedRows: api.pinnedRows,
                onPinColumn: api.pinColumn,
                onPinColumnAtPosition: api.pinColumnAtPosition,
                onPinAndPositionColumn: api.pinAndPositionColumn,
                onPinnedColumnReorder: api.reorderPinnedColumns,
                onPinRow: api.pinRow,
                onPinRowAtPosition: api.pinRowAtPosition,
                onPinMultipleRowsAtPosition: api.pinMultipleRowsAtPosition,
                onPinAndPositionRow: api.pinAndPositionRow,
                onPinnedRowReorder: api.reorderPinnedRows,
                onReorderMultiplePinnedRows: api.reorderMultiplePinnedRows,
              }}
              reorder={{
                isColReorder: true,
                isRowReorder: !rowReorderLocked,
                onColumnReorder: (fromIndex: number, toIndex: number) => {
                  api.reorderColumns(fromIndex, toIndex);
                  setActivity(
                    `Moved column ${fromIndex + 1} to position ${toIndex + 1}.`,
                  );
                },
                onRowReorder: reorderVisibleRow,
                onUpdateColumnOrder: api.updateColumnOrder,
              }}
              resize={{
                enableColumnResize: true,
                enableRowResize: true,
                mode: "immediate",
                quantize: 4,
                heightStep: 2,
                onColumnResize: (key: string, width: number) => api.updateColumnWidths({ [key]: width }),
                onRowResize: api.setRowHeight,
              }}
              pagination={{
                enabled: true,
                mode: "client",
                pageIndex: api.pagination.pageIndex,
                pageSize: api.pagination.pageSize,
                pageSizeOptions: api.pagination.pageSizeOptions,
                showPageSize: true,
                showRange: true,
                showPageInfo: true,
                showControls: true,
                showFirstLast: true,
                position: "bottom",
                onPageChange: api.pagination.setPageIndex,
                onPageSizeChange: api.pagination.setPageSize,
              }}
              contextMenu={contextMenu}
            />
          </div>
        </div>

        <section className="feature-deck" aria-labelledby="core-features-title">
          <div className="feature-deck__heading">
            <div>
              <span className="eyebrow">CORE CAPABILITY MAP</span>
              <h2 id="core-features-title">Everything included in the MIT package</h2>
            </div>
            <span className="feature-count">20 / 20 wired</span>
          </div>
          <div className="feature-grid">
            {coreFeatures.map(([id, label], index) => (
              <article className="feature-chip" key={id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{label}</strong><small>{id}</small></div>
                <i aria-hidden="true">✓</i>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
