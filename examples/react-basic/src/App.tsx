import { useMemo, useState, type ComponentType } from "react";
import {
  Grid,
  createGridRowsFromRecords,
  type GridColumnDef,
} from "@ace-grid/core";

const columns: GridColumnDef[] = [
  { key: "company", title: "Company", editable: true, filterable: true },
  { key: "owner", title: "Owner", editable: true, filterable: true },
  { key: "segment", title: "Segment", editable: true, filterable: true },
  { key: "status", title: "Status", editable: true, filterable: true },
  { key: "arr", title: "ARR", editable: true, filterable: true },
];

// Core 1.0.16 accepts columns directly while 1.0.17 adds the richer column
// layout object. Supplying both shapes keeps this starter runnable before and
// after the compatibility release.
const StarterGrid = Grid as unknown as ComponentType<Record<string, unknown>>;

function readCellValue(cell: unknown) {
  if (cell && typeof cell === "object" && "value" in cell) {
    return (cell as { value: unknown }).value;
  }
  return cell;
}

const initialRows = createGridRowsFromRecords([
  { id: "helio", company: "HelioBank", owner: "Maya", segment: "Enterprise", status: "Live", arr: "$1.84M" },
  { id: "northstar", company: "Northstar AI", owner: "Theo", segment: "Strategic", status: "Live", arr: "$2.43M" },
  { id: "vaultpay", company: "VaultPay", owner: "Lena", segment: "Enterprise", status: "Live", arr: "$1.98M" },
  { id: "quantiva", company: "Quantiva", owner: "Iris", segment: "Market", status: "Review", arr: "$1.31M" },
  { id: "mercury", company: "Mercury Retail", owner: "Noah", segment: "Strategic", status: "Live", arr: "$2.12M" },
  { id: "atlas", company: "Atlas Freight", owner: "Amir", segment: "Mid-market", status: "Escalate", arr: "$940K" },
  { id: "aster", company: "Aster Health", owner: "June", segment: "Enterprise", status: "Live", arr: "$1.68M" },
  { id: "gridworks", company: "GridWorks Energy", owner: "Sofia", segment: "Market", status: "Review", arr: "$1.45M" },
]);

export function App() {
  const [rows, setRows] = useState(initialRows);
  const liveAccounts = useMemo(
    () => rows.filter((row) => readCellValue(row.data.status) === "Live").length,
    [rows],
  );

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ACE GRID · REACT STARTER</p>
          <h1>Customer portfolio</h1>
          <p className="lede">A production-shaped editable grid in one small example.</p>
        </div>
        <div className="metric" aria-label={`${liveAccounts} live accounts`}>
          <strong>{liveAccounts}</strong>
          <span>live accounts</span>
        </div>
      </header>

      <section className="grid-card">
        <StarterGrid
          accessibility={{ ariaLabel: "Customer portfolio" }}
          columns={{
            columnWidths: { company: 250, owner: 150, segment: 170, status: 150, arr: 140 },
            fillWidth: true,
          }}
          data={{ columns, rows }}
          edit={{
            isCellEditing: true,
            onCellChange: (
              rowId: string | number,
              columnKey: string,
              value: any,
            ) => {
              setRows((current) =>
                current.map((row) =>
                  row.id === rowId
                    ? { ...row, data: { ...row.data, [columnKey]: value } }
                    : row,
                ),
              );
            },
          }}
          filter={{ enableFloatingFilters: true, filterMode: "client" }}
          layout={{ width: 1180, height: 520 }}
        />
      </section>

      <footer>
        Edit a cell, filter a column, or sort a header. Then make it yours.
      </footer>
    </main>
  );
}
