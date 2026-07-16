# @ace-grid/core

Ace Grid Core is the free, MIT-licensed React data grid runtime for Ace Grid. It
provides the production foundation for app-grade data grids: editing, selection,
sorting, filtering, pagination, search, pinning, resizing, theming,
virtualization, CSV I/O, keyed headers, and core schema-aware state helpers.

Use this package when you need the Community/Core grid runtime without paid Pro
or Enterprise modules.

## Documentation

- Product docs: https://ace-grid.com/docs
- API reference and generated API spec: https://ace-grid.com/api
- Framework guides: https://ace-grid.com/guides
- Public Core source export: https://github.com/Vitashev/ace-grid-core
- Interactive React starter: https://stackblitz.com/github/Vitashev/ace-grid-core/tree/main/examples/react-basic?file=src%2FApp.tsx

## Install

```bash
npm install @ace-grid/core react react-dom
```

## Quick start

```tsx
import { Grid } from "@ace-grid/core";

const rows = [
  { id: "1", company: "HelioBank", segment: "Enterprise", revenue: 4200000 },
  { id: "2", company: "Northstar AI", segment: "Strategic", revenue: 3100000 },
];

const columns = [
  { key: "company", title: "Company", editable: true },
  { key: "segment", title: "Segment", filterable: true },
  { key: "revenue", title: "Revenue", type: "number", sortable: true },
];

export function CustomersGrid() {
  return (
    <Grid
      data={{ rows, columns }}
      layout={{ height: 520 }}
    />
  );
}
```

## Included Core Capabilities

- React grid runtime and `useGrid` state/actions hook.
- Cell editing, row and column selection, sorting, filtering, search, pagination,
  pinning, resizing, and reorder primitives.
- Virtualized rendering for larger row and column counts.
- Theme tokens and styling hooks for product integration.
- CSV I/O and core schema extraction/application helpers.

## Package boundaries

`@ace-grid/core` contains only free/Core Ace Grid capabilities. Pro and
Enterprise source, runtime modules, and paid feature artifacts are intentionally
excluded from this package and from the public Core source export.

Use `@ace-grid/pro` for formulas, validation, Excel workflows, grouping, tree
data, sparklines, and advanced workflow features. Use `@ace-grid/enterprise`
for charts, pivoting, master-detail, server row model, and enterprise-scale
features.

## Support

For documentation, examples, and the generated API spec, use the Ace Grid portal
at https://ace-grid.com. For package issues, use the public Core repository:
https://github.com/Vitashev/ace-grid-core/issues

## License

MIT. See `LICENSE` in this package.
