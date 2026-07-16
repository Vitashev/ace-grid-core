# @ace-grid/core

[![npm version](https://img.shields.io/npm/v/%40ace-grid%2Fcore)](https://www.npmjs.com/package/@ace-grid/core)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React 18 and 19](https://img.shields.io/badge/React-18%20%7C%2019-149eca.svg)](#compatibility)

Fast, MIT-licensed React data grid for editable, virtualized product workflows.
Ace Grid Core includes editing, selection, sorting, filtering, pagination,
search, pinning, resizing, virtualization, CSV I/O, theming, and schema-aware
grid state helpers.

Use Core when you need the free Ace Grid feature set without Pro or Enterprise
capabilities.

**[Try the live grid](https://ace-grid.com/#live-demo)** ·
**[Open the React starter](https://stackblitz.com/github/Vitashev/ace-grid-core/tree/codex/react-stackblitz-starter/examples/react-basic?file=src%2FApp.tsx)** ·
**[Read the documentation](https://ace-grid.com/docs)** ·
**[Run the reproducible benchmark](https://vitashev.github.io/react-data-grid-benchmark/)**

[![Ace Grid running in a real product workflow](https://raw.githubusercontent.com/Vitashev/ace-grid-core/main/assets/ace-grid-core-demo.png)](https://ace-grid.com/#live-demo)

_The live Ace Grid product demo: editable cells, filtering, pinning, status
renderers, grouped headers, and a pinned portfolio total._

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Vitashev/ace-grid-core/tree/codex/react-stackblitz-starter/examples/react-basic?file=src%2FApp.tsx)

## Why Ace Grid Core

- MIT-licensed production runtime, not a limited evaluation build.
- Spreadsheet-style editing, keyboard interaction, selection, and clipboard workflows.
- Row, column, and cell-content virtualization for large grid surfaces.
- Typed React API with ESM, CommonJS, and TypeScript declarations.
- Migration utilities for AG Grid and MUI Data Grid projects.

## Install

```bash
npm install @ace-grid/core react react-dom
```

## Quick start

Want to experiment first? Launch the dedicated
[Vite + React + TypeScript starter](https://stackblitz.com/github/Vitashev/ace-grid-core/tree/codex/react-stackblitz-starter/examples/react-basic?file=src%2FApp.tsx)
in StackBlitz—no local setup required.

```tsx
import { Grid, createGridRowsFromRecords } from "@ace-grid/core";

const rows = createGridRowsFromRecords([
  { id: "1", company: "HelioBank", segment: "Enterprise" },
  { id: "2", company: "Northstar AI", segment: "Strategic" },
]);

const columns = [
  { key: "company", title: "Company", editable: true },
  { key: "segment", title: "Segment", filterable: true },
];

export function CustomersGrid() {
  return (
    <Grid
      data={{ rows, columns }}
      columns={{ columnWidths: { company: 260, segment: 180 }, fillWidth: true }}
      layout={{ width: 800, height: 520 }}
    />
  );
}
```

## Compatibility

| Runtime | Supported versions |
| --- | --- |
| React | 18.2 and 19.x |
| React DOM | 18.2 and 19.x |
| TypeScript | Declarations included |
| Browsers | Current evergreen browsers |

The release checks install the packed Core package in clean React 18 and React
19 consumer projects. If your application finds a compatibility gap, please
[open an issue](https://github.com/Vitashev/ace-grid-core/issues).

## Performance evidence

The public [React data grid benchmark](https://github.com/Vitashev/react-data-grid-benchmark)
publishes its fixture, runner, methodology, and raw browser samples. Treat the
results as a reproducible starting point and rerun the workload that matches
your own columns, renderers, data volume, and target hardware.

## Choose a tier

| Tier | Best for | Included capabilities |
| --- | --- | --- |
| Core | Product tables and editable operational grids | Editing, selection, sorting, filtering, pagination, virtualization, theming, and CSV I/O |
| Pro | Spreadsheet-style workflows | Core plus formulas, validation, Excel I/O, grouping, tree data, sparklines, and spanning |
| Enterprise | Server-backed and analytical applications | Pro plus server row model, pivoting, charts, and master-detail workflows |

Start with Core and move to another tier only when the application requires
those workflow capabilities. See [pricing](https://ace-grid.com/pricing) for
licensing details.

## Framework support

Ace Grid Core is the React runtime. Use these wrapper packages when your app is
not React-first:

- `@ace-grid/wc` for Web Components
- `@ace-grid/angular` for Angular
- `@ace-grid/vue` for Vue 3
- `@ace-grid/svelte` for Svelte

Framework guides:

- React: https://ace-grid.com/guides/react-data-grid-library
- Angular: https://ace-grid.com/guides/angular-data-grid
- Vue: https://ace-grid.com/guides/vue-data-grid
- Svelte: https://ace-grid.com/guides/svelte-data-grid
- Web Components: https://ace-grid.com/guides/web-component-data-grid

## Related packages

- `@ace-grid/pro` adds formulas, validation, Excel workflows, grouping, tree
  data, sparklines, and spreadsheet-style workflows.
- `@ace-grid/enterprise` adds server row model, pivoting, charts,
  master-detail, and enterprise workflows.
- `@ace-grid/schema-core` provides serializable grid schemas and validation.
- `@ace-grid/compat-ag` and `@ace-grid/compat-mui` help migrate existing AG Grid
  and MUI Data Grid usage.

## Documentation

- Docs: https://ace-grid.com/docs
- API reference: https://ace-grid.com/api
- Live demo: https://ace-grid.com/#live-demo
- StackBlitz React starter: https://stackblitz.com/github/Vitashev/ace-grid-core/tree/codex/react-stackblitz-starter/examples/react-basic?file=src%2FApp.tsx
- React grid benchmark: https://ace-grid.com/guides/react-data-grid-benchmark
- Migration guide: https://ace-grid.com/docs/migration
- AG Grid alternative: https://ace-grid.com/guides/ag-grid-alternative
- MUI Data Grid alternative: https://ace-grid.com/guides/mui-data-grid-alternative
- Public Core source: https://github.com/Vitashev/ace-grid-core

## License

MIT. See `LICENSE`.
